# Git Workflow Guidelines for Development Team

These guidelines define the standard Git workflow that every developer
must follow to maintain a clean repository and avoid conflicts.

---

# 1. Branch Naming Convention

Each developer must create a personal feature branch using the following
naming convention:

    user-<username>/<feature-name>

### Example

    user-krishna/login-api

### Rules

- Always create branches from the latest `master`
- Feature branches must be descriptive
- Avoid spaces; use hyphens instead

### Command Example

```bash
git checkout master
git pull origin master
git checkout -b user-krishna/login-api
```

---

# 2. Pull Latest Changes from Master Before Pushing

Before pushing code to the remote repository, developers must sync their
branch with the latest changes from `master`.

This helps prevent conflicts and ensures that the branch is built on top
of the latest codebase.

## Steps

### Step 1 --- Stash Local Changes

If there are uncommitted changes:

```bash
git stash
```

This temporarily saves your work.

### Step 2 --- Pull Latest Changes from Master

```bash
git pull origin master
```

### Step 3 --- Reapply Stashed Changes

```bash
git stash pop
```

Your previous changes will be restored.

### Step 4 --- Commit and Push

```bash
git add .
git commit -m "Implemented login API"
git push origin user-krishna/login-api
```

---

# 3. Raise a Pull Request (PR)

Once development is complete:

1.  Push your branch to the remote repository
2.  Create a Pull Request (PR) to the `master` branch

### PR Checklist

Ensure:

- Code builds successfully
- No console errors
- Code follows project standards
- Feature is tested

### Inform the Team

After creating the PR, share the PR link in the team communication
channel.

# 4. Handling Conflicts When Multiple Developers Work on Same File

Sometimes another developer's PR may get merged into `master` while you
are still working.

In this case, your branch must be rebased with the latest master.

## Rebase Steps

### Step 1 --- Pull Latest Master

```bash
git checkout master
git pull origin master
```

### Step 2 --- Switch to Your Branch

```bash
git checkout user-krishna/login-api
```

### Step 3 --- Rebase with Master

```bash
git rebase master
```

### Step 4 --- Resolve Conflicts

If conflicts occur:

Example conflict:

    <<<<<<< HEAD
    your code
    =======
    incoming code
    >>>>>>> master

Remove the markers and keep the correct code.

### Step 5 --- Continue Rebase

```bash
git add .
git rebase --continue
```

### Step 6 --- Force Push (after rebase)

```bash
git push origin user-krishna/login-api --force
```

---

# Important Best Practices

## Always

- Pull latest `master` before starting work
- Keep PRs small and focused
- Write meaningful commit messages

## Never

- Push directly to `master`
- Commit unrelated changes in one PR
- Ignore merge conflicts

---

# Recommended Workflow Summary

    Create branch from master
          ↓
    Develop feature
          ↓
    Pull latest master
          ↓
    Commit & Push branch
          ↓
    Create PR
          ↓
    Code Review
          ↓
    Merge to master
