# Project Memory Tool Failure Analysis

## Summary

The original workflow expected agents to run `npx project-memory ...` directly. In this repository and environment, that path was unreliable for two independent reasons:

1. PowerShell blocked `npx.ps1` because script execution is disabled.
2. Even when bypassing PowerShell and using `cmd`, the downloaded `project-memory` CLI crashed at runtime with:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'commander'
```

Because of that, project memory was not being read or logged consistently, despite the instruction files requiring it.

## Exact Failure Symptoms

### Symptom 1: PowerShell invocation failure

```text
npx : File C:\Program Files\nodejs\npx.ps1 cannot be loaded because running scripts is disabled on this system.
```

This is an environment-level shell policy problem. It means any instruction that assumes `npx ...` can always be run from PowerShell is brittle on Windows machines with restricted execution policies.

### Symptom 2: CLI runtime/package failure

When `npx` was run through `cmd`, the CLI still failed:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'commander'
imported from ...\node_modules\project-memory\packages\cli\dist\cli\index.js
```

This points to a packaging/runtime issue in the published `project-memory` package or its bundle resolution path. The command reached Node successfully, but the CLI could not resolve one of its runtime dependencies.

## Root Causes

### 1. The toolchain depended on `npx` being universally safe

The instruction files treated `npx project-memory ...` as a stable, zero-friction command. That assumption failed on Windows because PowerShell execution policy blocked the `npx.ps1` shim.

### 2. The published CLI was not self-contained in this environment

The CLI attempted to import `commander` at runtime and could not resolve it from the transient `_npx` install directory. That suggests one of these issues:

- `commander` was not declared correctly in the published package dependencies
- the CLI bundle expects a workspace/monorepo layout that does not exist after publishing
- the package was published in a partially bundled state

The key point is this: the failure was not in repository memory data, it was in the invocation and packaging of the tool itself.

## Why Memory Was Not Updating Automatically

There was no real automation hook. The system relied on agents following instruction files manually:

- read memory at session start
- log decisions and mistakes during work

That means memory updates were only as reliable as:

1. the agent following the instruction
2. the CLI successfully running

Once the CLI broke, the whole process degraded silently unless someone explicitly checked `.memory/context.md`.

## Fix Applied In This Repository

To remove dependence on the external `npx` path, this repository now uses a local script:

```text
node scripts/project-memory.js read
node scripts/project-memory.js log --decision "..."
node scripts/project-memory.js log --mistake "..."
node scripts/project-memory.js log --todo "..."
node scripts/project-memory.js prune
```

### What the local script does

- reads `.memory/context.md`
- logs decisions, mistakes, todos, and completed tasks
- updates `.memory/state.json`
- supports a simple prune flow for completed tasks

### Files changed

- `.cursor/rules/project-memory.mdc`
- `.github/copilot-instructions.md`
- `scripts/project-memory.js`

## What The Original Tool Builder Should Fix

If the goal is to make `project-memory` reliable as an open-source tool, the builder should address all of the following:

### Packaging

- verify that `commander` and all runtime deps are present in the published package
- test the exact published artifact with `npx project-memory read` on a clean machine
- validate the CLI outside the monorepo/workspace it was developed in

### Windows compatibility

- document that PowerShell may block `npx.ps1`
- provide a Windows-safe alternative such as:
  - `npx.cmd project-memory read`
  - `node path/to/cli.js read`
- avoid assuming PowerShell script shims will always execute

### Reliability model

- stop treating manual instructions as “automatic updating”
- provide one of:
  - a local checked-in script
  - a git hook
  - editor integration
  - a fallback binary/script path when `npx` fails

### Failure visibility

- make CLI failures explicit and easy to diagnose
- output actionable dependency/package resolution guidance instead of crashing with a raw stack trace

## Recommended Design Principle

For tools that are meant to enforce agent behavior across many repos, do not make the primary workflow depend on:

- transient `npx` installs
- shell-specific script shims
- unpublished monorepo assumptions

The stable path is a repo-local executable or a thoroughly tested published CLI with platform-specific invocation guidance.
