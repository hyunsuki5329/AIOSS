# Week 9 Delivery Report

## Completed Scope

- npm package metadata updated for GitHub Packages publishing.
- Version bumped from 1.0.0 to 1.0.1.
- Docker image build/push workflow added for GHCR.
- Dependabot policy added for npm and GitHub Actions updates.
- Weekly npm audit workflow added with issue creation/update and artifact upload.
- Dependabot auto-merge workflow added for safe dependency updates.

## Key Files

- [package.json](../package.json)
- [package-lock.json](../package-lock.json)
- [.github/dependabot.yml](../.github/dependabot.yml)
- [.github/workflows/publish-npm.yml](../.github/workflows/publish-npm.yml)
- [.github/workflows/docker-build.yml](../.github/workflows/docker-build.yml)
- [.github/workflows/security-audit.yml](../.github/workflows/security-audit.yml)
- [.github/workflows/dependabot-automerge.yml](../.github/workflows/dependabot-automerge.yml)

## Verification

- Node.js script syntax check passed with the available `node.exe` binary.
- `node --test` passed successfully.
- `git diff --check` returned clean output.

## Notes

- Local `npm` was not available in the workspace environment, so `npm ci` and `npm publish` were not executed locally.
- The publish workflow is configured to use `https://npm.pkg.github.com` and `GITHUB_TOKEN`.