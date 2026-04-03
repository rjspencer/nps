# New Feature Prompt

Use this template when scoping a new feature across the monorepo.

---

I want to add a feature called **[feature name]**.

**What it does:**
[1-3 sentence description]

**Surfaces affected:**
- [ ] Web app (`apps/web`)
- [ ] Mobile app (`apps/mobile`)
- [ ] API / tRPC (`packages/api`)
- [ ] Database schema (`packages/db`)
- [ ] Auth (`packages/auth`)

**Data requirements:**
- New tables or columns: [describe or "none"]
- New tRPC procedures: [describe or "none"]

**Auth:**
- Public or protected? [public / authenticated users only / role-restricted]

**Notes / constraints:**
[Any gotchas, edge cases, or constraints to be aware of]

---

Please plan the implementation across the relevant packages, following the project conventions in `.claude/instructions/`.
