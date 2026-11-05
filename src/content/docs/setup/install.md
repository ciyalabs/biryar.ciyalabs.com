---
title: Install
description: Getting Biryar running on your own machine.
sidebar:
  order: 1
---

:::caution[Not yet installable]
No container image exists yet. Release 0.1 is still being packaged out of the
private codebase it grew in. This page describes the intended shape so you can
judge whether it fits your setup, not so you can run it today.
:::

## The intended shape

```bash
docker compose up
```

Then open `http://localhost:8501` and work through the setup screen with the five
values from [the SP-API guide](/setup/sp-api/).

Biryar keeps a single SQLite database in a volume you control. There is no
account to create, no server to sign in to, and nothing leaves the machine.

## What it will not ask of you

- **No GPU.** The machine-learning parts that need one are not in 0.1.
- **No second machine.** The private deployment runs across two hosts for
  reasons specific to that business. The shipped artifact is one container.
- **No write access to your Amazon account.** Release 0.1 requests read-only
  roles and keeps `dry_run` on.
