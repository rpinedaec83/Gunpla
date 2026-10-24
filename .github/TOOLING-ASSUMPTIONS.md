# Tooling Assumptions

This file defines the minimum tooling assumptions for atlas_ai workflows.

## Required for Full Workflow
- Git CLI available on PATH
- PowerShell available (`pwsh` preferred, `powershell` fallback)
- File system read and write access to the repository

## Optional by Scenario
- GitHub CLI (`gh`) for repo creation and PR-related follow-up
- Azure CLI (`az`) for Azure deployment workflows
- VS Code capabilities for prompt and skill discovery

## Fallback Rules
- If a required tool is missing, stop and report the missing prerequisite.
- If an optional tool is missing, continue with a documented fallback path.
- Do not assume terminal execution is available in all agent environments.

## Agent Portability Notes
- Copilot, Claude Code, and Codex-style agents can typically use repo files directly.
- ChatGPT-oriented coding workflows are common enough to get a default root pointer, but may still require manual loading depending on environment.
- Gemini, Grok, DeepSeek, and other hosted LLMs may require manual loading of repo instruction files, depending on environment.
- When auto-loading is unavailable, load the relevant pointer file, then `.github/copilot-instructions.md`, then `ATLAS.md`.
