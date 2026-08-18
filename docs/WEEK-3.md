# Week 3 — Architecture & Planning Handoff

This repository contains the Week 3 technical planning package for Mount Patrick Hotel.

## Submission checklist

- [x] Architecture Decision Record with five required decisions: [Architecture Decision Record](ARCHITECTURE_DECISION_RECORD.md)
- [x] Entity-Relationship Diagram with more than four entities: [ERD](ERD.md)
- [x] API schema with implemented and planned endpoints: [API Schema](API_SCHEMA.md)
- [x] Environment variable template committed: [`.env.example`](../.env.example)
- [x] Local setup instructions in the [README](../README.md)
- [ ] Screenshot of GitHub Project board with Backlog, In Progress, In Review, and Done columns
- [ ] All Week 2 user stories loaded as GitHub issues and assigned to the board
- [ ] Main branch protection enabled: pull request required, direct pushes disabled

## Local verification

```bash
npm install
cp .env.example .env.local
npm run lint
npm test
npm run build
```

Before running the app, fill the Supabase values in `.env.local` and apply migrations in filename order. Never commit `.env.local` or any service-role key.

## Branch and review workflow

1. Create a branch from `main` using `codex/` or the team’s agreed feature prefix.
2. Link the branch and pull request to one GitHub user-story issue.
3. Open a pull request; at least one teammate reviews it.
4. Merge only after checks pass and the issue is moved to Done.

## Suggested Week 3 board issue labels

`user-story`, `architecture`, `database`, `api`, `security`, `deployment`, and `documentation`.
