#!/bin/bash
# Script to create GitHub repository

echo "To create your GitHub repository, you have two options:"
echo ""
echo "OPTION 1: Using GitHub CLI (Recommended)"
echo "1. Run: gh auth login"
echo "2. Then run: gh repo create open-saas-app --public --source=. --remote=origin --description 'OpenSaaS application with Neon PostgreSQL database' --push"
echo ""
echo "OPTION 2: Manual creation"
echo "1. Go to https://github.com/new"
echo "2. Repository name: open-saas-app (or your preferred name)"
echo "3. Description: OpenSaaS application with Neon PostgreSQL database"
echo "4. Choose Public or Private"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo "7. Then run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/open-saas-app.git"
echo "   git push -u origin main"
echo ""
echo "Current repository status:"
git status
echo ""
echo "Ready to push!"
