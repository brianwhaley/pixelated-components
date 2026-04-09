---
description: "Use when running terminal commands, executing code, or making file changes. Ensures compliance with command execution rules and question handling."
applyTo: "**"
---

# Command Execution & Question Handling Rules

## Rule 1: Answer Questions First

**Before executing ANY command or making ANY file changes:**
- Check if the user has asked a question in their current message
- If a question exists, answer it COMPLETELY and DIRECTLY before proceeding with commands
- Do not assume the question will be answered after command execution
- Questions take absolute priority over tool execution

Examples:
- User: "why is this happening?" + [requests code change] → Answer the "why" first, then proceed
- User: "how do I fix this?" + [shows error] → Explain the fix approach before running commands
- User: "what do you think?" + [asks to run tests] → Give opinion/analysis first, then run tests

## Rule 2: Command Execution Safety Checklist

Before executing any command via `run_in_terminal`, `edit_notebook_file`, `replace_string_in_file`, or similar:

1. **Review active rules**: Check `/memories/user/CRITICAL-WORKFLOW.md` for current constraints
2. **Parse the command** for forbidden patterns:
   - `|` (pipe)
   - `tail`
   - `head`
   - `>` (output redirection to file)
   - `tee`
   - `--silent`
   - `--reporter`
   - Any output filtering or truncation mechanism

3. **If forbidden patterns found**: STOP and ask user for explicit confirmation before proceeding
4. **Verify output transparency**: Command must output results directly to terminal without truncation or manipulation unless user explicitly requests it

**Active Rule**: Never use pipes, tails, head, or output redirection without explicit user request. All command output must be visible to the user.

## Rule 3: Memory Review Before Execution

Before any command execution:
- Review `/memories/user/CRITICAL-WORKFLOW.md` 
- Review `/memories/user/coding-conventions.md`
- Check `/memories/session/` for any active session-specific constraints
- Apply all relevant rules before proceeding

## Rule 4: Review Project Instructions & Conventions

Before any implementation, refactoring, or feature work:
- Check for `copilot-instructions.md` in the workspace root or `.github/` folder
- Check for `coding-conventions.md` in `/docs/` or project root
- Review for framework-specific practices, naming conventions, configuration patterns, and code organization
- Apply discovered conventions to all work in the project
- If instructions conflict with user requests, clarify before proceeding

## Violations

Each violation of these rules represents a failure to follow documented requirements. Repeated violations should result in:
1. First violation: Direct reminder of the rule
2. Second violation: Explicit acknowledgment that the rule was broken
3. Third+ violations: Ask for explicit permission to continue
