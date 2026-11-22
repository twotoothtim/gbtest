#!/bin/bash
# Deployment Script for GitHub -> Vercel/Railway/Cloudflare Pages
# Usage: ./deploy.sh [target]  # target: vercel | railway | pages

set -e

TARGET=${1:-vercel}

echo "🚀 Deploying Group Buy Platform to $TARGET"

# Build the app
npm run build

case "$TARGET" in
  vercel)
    echo "📦 Building for Vercel..."
    # Upload to Vercel CLI (requires logged-in user with 'vercel' command installed)
    npx vercel --prod
    ;;
  railway)
    echo "🚂 Railway deployment ready — push to main branch and connect in Railway dashboard"
    # For Railway, just need Dockerfile + build artifacts
    docker build -t groupbuy-app:latest .
    ;;
  pages)
    echo "📄 GitHub Pages deployment ready — push to main branch for preview"
    # Create .github/workflows/pages.yml if it doesn't exist
    mkdir -p .github/workflows
    cat > .github/workflows/pages.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths-ignore:
      - node_modules/
      - .env.local

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
      
      - name: Build Next.js app
        run: npx next build --output-dir .next
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ".next"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
    echo "✅ Created .github/workflows/pages.yml for auto-deploy to GitHub Pages"
    ;;
  *)
    echo "Unknown target '$TARGET'. Supported targets: vercel, railway, pages"
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
