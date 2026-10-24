---
name: code-style
description: 'Multi-language coding standards and conventions. Use when authoring, reviewing, or refactoring code in TypeScript, JavaScript, Python, C#, or PowerShell to enforce typing, error handling, and maintainability.'
---

# Code Style

## When to Use

- Writing or reviewing application code across frontend, backend, or automation scripts
- Setting up linters, formatters, and static analysis tools
- Refactoring legacy code or standardizing team conventions
- Enforcing type safety, immutability, and clean error propagation

## Procedure

1. **TypeScript & JavaScript Standards:**
   - **Strict Type Checking:** Always enable `"strict": true` in `tsconfig.json`. NEVER use `any`; use `unknown` combined with type predicates or validation schemas (Zod).
   - **Immutability First:** Prefer `const` over `let`. Never use `var`. Use `Readonly<T>` for data structures passed across boundaries.
   - **Async/Await:** Use `async/await` syntax. Always catch or explicitly re-throw rejections. Never use floating promises (unhandled promises without `.catch()` or `await`).
   - **Functional Utilities:** Prefer pure array transformations (`map`, `filter`, `reduce`) over imperative mutating `for` loops where readable.
2. **Python Standards:**
   - **PEP 8 & Type Hints:** Include type hints on all function signatures (`def calculate_tax(amount: float, rate: float) -> float:`).
   - **Data Validation:** Use Pydantic models or dataclasses for structured payloads and configuration.
   - **Explicit Exceptions:** Never use bare `except:`. Catch specific exceptions (`except KeyError as e:`) and provide context when re-raising (`raise DatabaseError(...) from e`).
   - **Formatting:** Format with `ruff` or `black` (line length: 88 or 100 characters).
3. **C# / .NET Standards:**
   - **Nullable Reference Types:** Always enable `<Nullable>enable</Nullable>`. Treat null warnings as errors.
   - **Async All the Way:** Use `async Task` methods; never block with `.Result` or `.Wait()`. Always pass `CancellationToken` to I/O operations.
   - **Immutable Records:** Use `public record` for DTOs, API request/response contracts, and domain events.
4. **PowerShell Standards:**
   - Follow `.github/skills/powershell-style/SKILL.md`. Always declare `Set-StrictMode -Version Latest` and `$ErrorActionPreference = 'Stop'`.
   - Maintain dual compatibility with Windows PowerShell 5.1 and PowerShell 7+.
5. **General Cleanliness:**
   - Do not leave commented-out dead code blocks in commits.
   - Keep functions focused on a single responsibility; aim for functions under 40 lines.
   - Use meaningful, searchable identifiers (e.g. `isUserAuthenticated` instead of `chk`).

## Rules

- NEVER use `any` in TypeScript; use `unknown`, generics, or union types.
- NEVER swallow errors silently in empty `catch` blocks.
- ALWAYS use explicit parameter types and return types on exported/public functions.
- ALWAYS enforce UTF-8 file encoding without BOM and consistent line endings (LF or CRLF).
- Keep codebase free of unused imports, dead variables, and debug print statements (`console.log`, `print`) before completing tasks.
