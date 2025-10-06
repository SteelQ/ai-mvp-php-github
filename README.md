# AI MVP (GitHub version)

This repo demonstrates a minimal **background AI task** flow on **GitHub**:

- Open a PR → CI (lint / static / tests) runs
- After CI passes, an **AI job** reads the PR diff and generates **test skeletons** under `tests/**`
- It opens a separate **AI Test PR**, so code and tests stay decoupled

## Stack
- PHP 8.2, Codeception, PHPStan, PHP-CS-Fixer
- GitHub Actions + Node 20 (ai-runner.js)

## Quick start
1. Push this repo to GitHub as `ai-mvp-php-github` (or any name).
2. Repo **Settings → Actions → General → Workflow permissions**: set to **Read and write permissions** and allow Actions to create and approve PRs.
3. Make a change to `src/OrderService.php` and open a PR.
4. After `ci` job passes, the `ai` job will create a new PR `AI: test skeletons for PR #<num>` containing files only under `tests/**`.

## Manual trigger
Go to **Actions → AI Tasks (Manual)**, input a PR number, and run it.

## Notes
- `scripts/ai-runner.js` currently generates simple test skeletons without calling any LLM. You can extend it to call your preferred model and write richer assertions.
- The AI job has a **write whitelist**: `tests,docs`. It never touches app code.
