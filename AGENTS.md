# AGENTS.md

This document provides a quick-start guide for AI agents. For a general project
overview, please refer to `README.md`.

## Repository Overview

- This repository contains an Obsidian plugin that converts web links into their
  corresponding Wayback Machine URLs.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: [Deno](https://deno.com/)

## Key Files

- **`main.ts`**: The main entrypoint for the Obsidian plugin.
- **`deno.json`**: Defines Deno tasks (e.g., `build`) and dependencies.
- **`manifest.json`**: The plugin manifest for Obsidian.
- **`.github/workflows/ci.yml`**: The CI pipeline configuration, containing all
  verification steps.

## Environment Setup

- **Install Deno**: Ensure Deno is installed. Refer to the
  [official Deno documentation](https://deno.com/manual/getting_started/installation)
  for instructions.

## Verification

Before submitting changes, you must ensure all verifications pass.

- **Build the project**: The primary build command is defined as a task in
  `deno.json`. Always run this to ensure the project compiles.
- **Run all checks**: The CI pipeline runs all necessary checks, including
  linting, formatting, and type-checking. Refer to the
  `.github/workflows/ci.yml` file to identify the exact commands. **Always
  ensure your changes pass all checks defined in the CI workflow.**

## Contribution Guidelines

- **Commit and PR Titles**: Any PR and commit titles must follow
  [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/)
  conventions.
- **Commit and PR Body**: Any PR and commit body must be description and
  informative. Where possible, focus on the WHY instead of the WHAT.
- **Branch Naming**: Any pushed branches must follow the `<platform>/*`
  convention. For example, Claude will use `claude/*`, Jules will use `jules/*`,
  Codex will use `codex/*`.
