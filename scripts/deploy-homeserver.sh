#!/usr/bin/env bash
# Publish the monorepo to the homeserver container and record the deployed revision.
#
# The target is the application container at 192.168.1.190, which holds a file copy
# of this repository instead of a git checkout. This script syncs the working tree,
# optionally rebuilds and restarts Docker Compose services, and writes
# .deployed-revision on the target so the published revision is always known.

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DEPLOY_HOST=${DEPLOY_HOST:-root@192.168.1.190}
DEPLOY_PATH=${DEPLOY_PATH:-/opt/gunpla-monorepo}
DEPLOY_SSH_KEY=${DEPLOY_SSH_KEY:-$HOME/.ssh/codex_prox00}
DEPLOY_ENV_FILE=${DEPLOY_ENV_FILE:-/opt/gunpla/infra/.env}
DEPLOY_HEALTH_URL=${DEPLOY_HEALTH_URL:-https://api.plamoscale.com/api/v1/health}

MODE=deploy
SERVICES=""
ALLOW_DIRTY=0

usage() {
  cat <<'EOF'
Usage: scripts/deploy-homeserver.sh [options]

Options:
  --sync-only          Sync files and record the revision, do not touch containers.
  --no-build           Sync files and restart containers without rebuilding images.
  --services "LIST"    Limit build and restart to the named compose services.
  --allow-dirty        Allow deploying an uncommitted working tree.
  -h, --help           Show this help.

Environment overrides:
  DEPLOY_HOST          SSH target (default root@192.168.1.190).
  DEPLOY_PATH          Remote deployment directory (default /opt/gunpla-monorepo).
  DEPLOY_SSH_KEY       SSH private key (default ~/.ssh/codex_prox00).
  DEPLOY_ENV_FILE      Remote compose env file (default /opt/gunpla/infra/.env).
  DEPLOY_HEALTH_URL    Post-deploy health probe (default https://api.plamoscale.com/api/v1/health).
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --sync-only) MODE=sync ;;
    --no-build) MODE=restart ;;
    --services)
      shift
      SERVICES=${1:?--services requires a value}
      ;;
    --allow-dirty) ALLOW_DIRTY=1 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

SSH_CMD=(ssh -i "$DEPLOY_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$DEPLOY_HOST")
RSYNC_SSH="ssh -i $DEPLOY_SSH_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

cd "$REPO_ROOT"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse HEAD)
SHORT=$(git rev-parse --short HEAD)
REPO_URL=$(git config --get remote.origin.url || true)
DIRTY=false
if [ -n "$(git status --porcelain)" ]; then
  DIRTY=true
fi

if [ "$DIRTY" = true ] && [ "$ALLOW_DIRTY" -ne 1 ]; then
  echo "Working tree is dirty. Commit the changes or pass --allow-dirty." >&2
  git status --short >&2
  exit 3
fi

echo "Publishing $BRANCH@$SHORT (dirty=$DIRTY) to $DEPLOY_HOST:$DEPLOY_PATH"

rsync -az --itemize-changes \
  -e "$RSYNC_SSH" \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.DS_Store' \
  --exclude 'secrets.md' \
  --exclude '.env' \
  --exclude 'dist/' \
  --exclude 'build/' \
  --exclude '.gradle/' \
  --exclude 'local.properties' \
  --exclude 'apps/api/data/' \
  --exclude 'apps/mobile-android/' \
  ./ "$DEPLOY_HOST:$DEPLOY_PATH/"

DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
REVISION_FILE=$(mktemp)
trap 'rm -f "$REVISION_FILE"' EXIT

{
  echo "repository=${REPO_URL:-unknown}"
  echo "branch=$BRANCH"
  echo "commit=$COMMIT"
  echo "short=$SHORT"
  echo "dirty=$DIRTY"
  echo "deployed_at=$DEPLOYED_AT"
  echo "deployed_from=$(hostname)"
  echo "mode=$MODE"
  echo "services=${SERVICES:-all}"
} > "$REVISION_FILE"

"${SSH_CMD[@]}" "cat > '$DEPLOY_PATH/.deployed-revision'" < "$REVISION_FILE"

if [ "$MODE" = sync ]; then
  echo "Sync complete. Revision recorded, containers were not restarted."
else
  if [ "$MODE" = deploy ]; then
    # shellcheck disable=SC2086
    "${SSH_CMD[@]}" "cd '$DEPLOY_PATH/infra' && docker compose --env-file '$DEPLOY_ENV_FILE' build $SERVICES"
  fi
  # shellcheck disable=SC2086
  "${SSH_CMD[@]}" "cd '$DEPLOY_PATH/infra' && docker compose --env-file '$DEPLOY_ENV_FILE' up -d $SERVICES"
fi

echo "Waiting for API health at $DEPLOY_HEALTH_URL"
attempt=1
while [ "$attempt" -le 10 ]; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$DEPLOY_HEALTH_URL" || true)
  if [ "$code" = "200" ]; then
    echo "Health check passed."
    break
  fi
  if [ "$attempt" -eq 10 ]; then
    echo "Health check failed after 10 attempts (last status: $code)." >&2
    exit 4
  fi
  attempt=$((attempt + 1))
  sleep 3
done

echo "Published $BRANCH@$SHORT at $DEPLOYED_AT"
"${SSH_CMD[@]}" "cat '$DEPLOY_PATH/.deployed-revision'"
