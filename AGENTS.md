# AGENTS

This repository uses AI-assisted development. Keep collaboration clear, safe, and reviewable.

## Goals
- Keep changes small, focused, and easy to review.
- Prefer reliability and readability over cleverness.
- Preserve existing behavior unless a change request says otherwise.

## Working agreements
- Make focused, minimal changes per task
- Explain non-obvious decisions in PR descriptions
- Prefer small iterative commits over large rewrites
- Keep behavior changes covered by tests when applicable

## Workflow
1. Understand the request and impacted files before editing.
2. Make the smallest change that fully solves the task.
3. Run relevant checks/tests when available.
4. Summarize what changed, why, and any follow-ups.

## Code quality defaults
- Follow existing conventions and naming patterns
- Avoid introducing unrelated refactors in feature work
- Add comments only where logic is genuinely non-obvious
- Keep public interfaces stable unless change is intentional
- Never commit secrets, tokens, or credentials.

## Validation defaults
- Run relevant tests for touched areas
- Run linting/formatting when configured
- Note any skipped checks and why

## Safety
- Do not use destructive commands without explicit approval.
- If unexpected unrelated changes appear, stop and ask how to proceed.
- If requirements are unclear, ask for clarification before risky changes.
