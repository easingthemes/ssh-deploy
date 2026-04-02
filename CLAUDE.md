# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Action for deploying files via rsync over SSH, with optional remote script execution before/after deployment. Published as `easingthemes/ssh-deploy` on the GitHub Marketplace.

## Commands

- **Build (lint + bundle):** `npm run build`
- **Lint only:** `npm run lint`
- **Lint with autofix:** `npm run lint:fix`
- **No unit test suite** — testing is done via e2e workflows in CI (Docker-based SSH server, see `.github/workflows/e2e.yml`)

The build step runs ESLint then bundles `src/index.js` into `dist/index.js` using `@vercel/ncc`. The `dist/index.js` is the actual entrypoint executed by GitHub Actions (defined in `action.yml`).

## Architecture

The action runs as a single Node.js 24 process with this execution flow:

1. **`src/inputs.js`** — Reads all config from environment variables (both `INPUT_*` and bare names). Converts `SNAKE_CASE` input names to `camelCase`. Splits multi-value inputs: `SOURCE` and `ARGS` on spaces, `EXCLUDE` and `SSH_CMD_ARGS` on commas. Prepends `GITHUB_WORKSPACE` to source paths. Exports a single `inputs` object used by all other modules.

2. **`src/index.js`** — Orchestration entry point. Pipeline: validate inputs → write SSH key → optionally update known_hosts → run SCRIPT_BEFORE → rsync → run SCRIPT_AFTER.

3. **`src/sshKey.js`** — Writes the SSH private key to `~/.ssh/<deploy_key_name>` with mode `0400`. Creates `known_hosts` file. Uses `ssh-keyscan` to add the remote host when before/after scripts are configured.

4. **`src/rsyncCli.js`** — Validates rsync is installed (auto-installs via apt-get if missing). Uses the local `src/rsync.js` module (child_process.spawn) to execute the rsync transfer.

5. **`src/remoteCmd.js`** — Writes script content to a temporary `.sh` file in the workspace, executes it on the remote host via `ssh ... 'bash -s' < script.sh`, then deletes the local script file. Passes `RSYNC_STDOUT` env var to after-scripts.

6. **`src/helpers.js`** — File I/O utilities (`writeToFile`, `deleteFile`), input validation, and `snakeToCamel` converter.

## Key Conventions

- **CommonJS modules** — the project uses `require`/`module.exports`, not ES modules.
- **ESLint 10 flat config** (`eslint.config.js`) — uses `@eslint/js` recommended + `@stylistic/eslint-plugin` for formatting. Notable rules: no trailing commas, `console` is allowed.
- **Semantic release** on `main` branch via `.releaserc` — use conventional commit messages (`fix:`, `feat:`, etc.). npm publish is disabled; releases are git tags + changelog only.
- **`dist/index.js` must be committed** — it's the bundled action entrypoint. Run `npm run build` and commit the updated dist after any source changes.
- **Inputs are environment variables**, not `@actions/core` — the action reads directly from `process.env` rather than using the GitHub Actions toolkit.
