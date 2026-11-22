# Contributing to Group Buy Platform

Thank you for your interest in contributing! This document outlines how to get started, the development workflow, and guidelines for submitting pull requests.

## Getting Started

1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/groupbuy.git
   cd groupbuy
   ```
3. Install dependencies (demo mode):
   ```bash
   npm install
   ```
4. Start the dev server and open `http://localhost:3000`:
   ```bash
   npm run dev
   ```

## Development Workflow

- **Demo Mode:** By default, the app uses localStorage to simulate a database. This is perfect for initial testing without needing a backend.
- **Production Path:** When ready, connect PostgreSQL (see `db/schema.sql`) and migrate store calls in `src/lib/store.ts` to use server-side DB queries with Prisma/Drizzle.

## Commit Guidelines

Use clear, conventional commit messages:

```bash
git commit -m "feat: add crypto fallback rail for USDC payments"
# or
git commit -m "fix: correct tier price calculation in buy detail page"
```

### Conventions

- **Feature:** Add a new feature (e.g., `feat:`)
- **Bug Fix:** Fix an issue (e.g., `fix:`)
- **Documentation:** Update docs/README/CHANGELOG (e.g., `docs:`)
- **Refactor:** Code restructuring without behavior changes (e.g., `refactor:`)

## Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Make your changes and commit with clear messages.
3. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
4. Open a pull request on GitHub against the `main` branch.

### Review Checklist

- ✅ Code follows existing style guidelines (TypeScript, Tailwind CSS)
- ✅ All tests pass (`npm test`)
- ✅ No new lint warnings (`npm run lint`)
- ✅ Changes to demo mode data layer are documented in comments
- ✅ PR description includes testing steps and screenshots if applicable

## Security Guidelines

- Never commit `.env.local` or sensitive keys. Always use environment variables managed by the hosting platform (Vercel, Railway).
- For production deployments, passwords must be hashed server-side — demo mode stores them unencrypted intentionally for simplicity.
- Before merging any change to payment flows, verify webhook signatures and test on a staging environment first.

## Reporting Bugs

Use GitHub Issues with the following template:

```markdown
**Description:** Clear description of the bug

**Steps to Reproduce:**
1. Go to ...
2. Click on ...
3. Observe this behavior...

**Expected Behavior:** What should happen instead?

**Environment:** Demo mode / production, OS/browser version (if applicable)
```

## License

This project is provided as-is for research-use-only group buy platforms. All contributions are licensed under the same terms as the main repository.

Thank you for contributing to a safer, more transparent research chemical marketplace!
