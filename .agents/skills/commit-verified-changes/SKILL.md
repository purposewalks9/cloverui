---
name: commit-verified-changes
description: Prepare and verify focused git commits, regenerate published artifacts, and safely push authorized repository updates. Use when the user asks to commit, push, update GitHub, or package repository changes, including component and skill updates.
---

# Commit Verified Changes

## Establish scope and authorization
Read repository instructions and the current request, including earlier authorization in this session. Identify the repository, target branch, intended files, and current remote head. Inspect status and diffs before editing or staging. Preserve unrelated user work and private or ignored files.

A request to commit authorizes the local commit. A request to push or update GitHub authorizes publishing the requested changes; do not repeatedly ask for approval. Do not infer authorization to deploy, merge unrelated work, or force-push. If the destination cannot be inferred, complete useful preparation before asking for it.

## Verify the deliverable
Check that source changes solve the stated problem and respect design-preservation requirements. Rebuild generated registry entries, lockfiles, or other published artifacts using the project's package manager when their inputs changed. Do not regenerate unrelated outputs.

Run the smallest meaningful checks for the concrete risk: imports/types for portability, a reproduction for a behavior fix, and relevant render checks for visible components. Compare pre-existing failures with the baseline; never label a failing full check as passing because focused checks passed. Do not replace missing branded assets with a different design just to get a green build.

For skills, read their SKILL.md, validate frontmatter and referenced resources, verify UI metadata, and ensure the package includes only needed files. Preserve existing skill identity when updating it. Follow the environment's skill persistence instructions rather than committing scratch-only copies.

## Inspect and commit
Review the complete diff, generated changes, and file list. Exclude secrets, credentials, environment files, dependency folders, caches, and unrelated edits. Stage explicit paths or intended hunks; avoid blanket staging in a dirty workspace. Do not bypass ignore rules broadly to include skills; allowlist only the intended packages.

Write a commit message explaining the concrete result. Before publishing, check that the remote branch has not moved. Use an ordinary fast-forward push or an API update with the expected current head. If the remote advanced, inspect and reconcile the new work without discarding it. Never force-update or overwrite a concurrent edit merely to finish.

When using a repository API without a checkout, create the new tree from the verified current tree, include only the intended changed paths, preserve unmodified blobs and modes, parent the commit to the verified head, and use an expected-head update. Never treat unavailable local files as deletions.

## Confirm completion
Read back the branch or push result. Report the commit link/hash, actual destination, concise change summary, checks performed, and material remaining failures. If publishing failed, say whether a local commit or draft remains and what blocked it. A created commit object alone does not mean the branch was updated.
