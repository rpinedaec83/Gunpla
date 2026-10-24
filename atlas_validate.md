---
name: "Atlas Setup Validation"
description: "Validate an Atlas new-project installation against its manifest and setup receipt. Trigger phrase: atlas validate."
argument-hint: "Optional target project path"
agent: "agent"
---

# Atlas Validate

Use this standalone prompt after new-project setup or when the user says `atlas validate`.

## Validation Procedure

1. Resolve the target project root. Use the current project when no path is supplied.
2. Read `.atlas/install-manifest.json` and `.atlas/setup.json` from the target.
3. If terminal execution is available, run:

   ```powershell
   pwsh scripts/atlas-validate.ps1 -TargetPath <target>
   ```

4. If terminal execution is unavailable, perform the same checks directly with repository file tools:
   - both JSON files parse and use the supported schema version
   - every questionnaire key from the manifest exists in `answers`
   - `outcomes.git` and `outcomes.github` are consistent with the questionnaire and actual repository state
   - stack and UX selections use catalog IDs, and API-first is set only when a stack is selected
   - every core, generated, and selected optional path exists
   - every selected active pattern records its Atlas pattern ID
   - the active stack pattern records `API-First: Enabled` or `API-First: Disabled` consistently with the receipt
   - the root contains only entries allowed by the manifest and selected setup options; report each violation as `Unexpected root entry: <name>`
   - every item in `relocatedRootEntries` exists under `docs/reference/preexisting-root/`, and every direct child of that folder is recorded in the receipt
   - no temporary `atlas_ai` or `Atlas_AI` source-kit directory remains in the target root
   - `secrets.md` is ignored and is not tracked by git
5. Report each failure with the exact path or receipt field that caused it.
6. Report `Atlas validation passed` only when every required check succeeds. Warnings must be labeled separately.

For source-kit maintenance, validate the manifest itself with:

```powershell
pwsh scripts/atlas-validate.ps1 -TargetPath <Atlas_AI source path> -SourceKit
```

This validator is a completion gate for `atlas_newproject.md`. It does not gate Atlas update, CGR, or ordinary ATLAS closeout.
