---
trigger: always_on
---

# Git Workflow Rules

## 1. Branching Strategy

The project uses a two-branch primary workflow.

- `main`: Stable and verified code.
- `develop`: Primary development branch.

All development work must happen on `develop` or an approved feature branch created from `develop`.

Never develop directly on `main`.

## 2. Before Starting Work

Before making any code changes, the agent must inspect:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Verify:

- Current branch
- Existing uncommitted changes
- Recent commits
- Whether the working tree contains user modifications

If the working tree contains uncommitted user changes, do not overwrite, discard, or reset them.

If the current branch is `main`, do not begin implementation. Ask the user to switch to `develop`.

## 3. Development Branch

The expected development branch is:

```text
develop
```

Feature branches may be created from `develop` when the task requires isolation.

Suggested naming:

```text
feature/admin-authentication
feature/project-management
feature/media-upload
fix/api-validation
refactor/project-service
```

Do not create or switch branches without user authorization when doing so would affect the existing working state.

## 4. Commit Standards

Use meaningful commit messages.

Recommended format:

```text
type(scope): description
```

Examples:

```text
feat(auth): implement admin login
feat(projects): add project management API
fix(auth): handle expired JWT tokens
test(projects): add project service tests
refactor(api): centralize error handling
docs(architecture): document backend structure
```

Do not create meaningless messages such as:

```text
update
changes
final
fixed
```

## 5. Commit Approval

The agent may prepare changes and recommend a commit message.

However, it must not create commits unless explicitly authorized by the user.

Before a commit:

1. Inspect the changed files.
2. Review the diff.
3. Run relevant tests.
4. Check for accidental secrets or generated files.
5. Confirm the intended commit scope.

Never include unrelated changes in a feature commit.

## 6. Push Restrictions

Never push changes automatically.

A push requires explicit user approval.

Before pushing:

- Verify the branch.
- Verify the intended commits.
- Verify that tests have been executed.
- Ensure no secrets are included.
- Confirm the remote destination.

Never force-push.

## 7. Main Branch Protection

`main` represents stable, verified project code.

The agent must never:

- Commit directly to `main`.
- Merge `develop` into `main` without approval.
- Rewrite `main` history.
- Force-push to `main`.
- Deploy from `main` without approval.

The user must explicitly authorize merging and deployment.

## 8. Safe Git Operations

Do not execute the following without explicit approval:

- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git rebase` when it rewrites shared history
- Branch deletion
- Commit history rewriting
- Destructive checkout operations that discard user changes

Do not discard changes simply to resolve a Git conflict.

## 9. After Implementation

Before reporting completion:

```bash
git status
git diff --check
git diff
```

Also run the relevant project tests and build checks.

Report:

- Current branch
- Files changed
- Tests executed
- Working tree status
- Whether changes are committed
- Whether changes are pushed

Never claim that changes have been pushed, merged, or deployed unless the operation actually succeeded.

## 10. Final Git Principle

Development happens on `develop`.

Only verified and user-approved changes may move to `main`.

The user retains control over commits, pushes, merges, and deployments.