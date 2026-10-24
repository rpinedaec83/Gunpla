---
name: powershell-style
description: 'PowerShell coding conventions. Use when writing or reviewing PowerShell scripts, PS1 files, modules, or cmdlets. Covers naming, param blocks, error handling, ShouldProcess, and output patterns.'
---

# PowerShell Style Guide

## When to Use

- Writing new PowerShell scripts or functions
- Reviewing or refactoring existing PS1 files
- Creating installer or automation scripts

## Conventions

### Naming
- Use approved verb-noun pairs for functions: `Get-`, `Set-`, `New-`, `Remove-`, `Install-`, `Test-`
- PascalCase for function names, parameter names, and public variables
- camelCase for local/private variables when needed for clarity

### Parameters
- Always use a `param()` block -- no positional-only parameters in scripts
- Use `[CmdletBinding()]` on scripts that modify state
- Add `[switch]` for boolean flags, not `[bool]`
- Provide sensible defaults where possible
- Use `[ValidateSet()]`, `[ValidateNotNullOrEmpty()]` when input is constrained

### ShouldProcess
- Add `SupportsShouldProcess = $true` to any script that creates, modifies, or deletes resources
- Wrap destructive operations in `if ($PSCmdlet.ShouldProcess(...)) { }`
- This enables `-WhatIf` and `-Confirm` for free

### Error Handling
- Use `Write-Error` for recoverable errors, not `throw` (unless in a function that should halt the pipeline)
- Use `Write-Warning` for skippable issues
- Use `$ErrorActionPreference = 'Stop'` when calling external tools that must succeed
- Check `$LASTEXITCODE` after external commands (git, az, func, gh)

### Output
- Use `Write-Host` for user-facing status messages
- Return objects from functions, not formatted strings
- Use `Out-Null` to suppress unwanted pipeline output from commands like `New-Item`

### Structure
- Put `param()` block at the top of the script
- Group related logic into sections with comments
- Prefer `Join-Path` over string concatenation for paths
- Use `Test-Path` before creating directories or reading files
- Quote paths that may contain spaces

## Anti-patterns
- Do not use aliases in scripts (`ls`, `dir`, `%`, `?`) -- use full cmdlet names
- Do not use `Write-Output` for status messages -- it pollutes the pipeline
- Do not suppress all errors with `-ErrorAction SilentlyContinue` unless you handle the error case
- Before asking the user for credentials, tokens, keys, or other secret values, check `secrets.md` at the repository root first if it exists
- Do not place secrets in any other file by default; if the user requests an override, warn first and proceed only after confirmation
