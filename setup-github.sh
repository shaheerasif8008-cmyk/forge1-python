#!/bin/bash

# GitHub Repository Setup Script for Cognisia's Forge 1

echo "🚀 Setting up GitHub repository for Cognisia's Forge 1..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote exists
if git remote -v | grep -q "origin"; then
    echo "⚠️  Remote 'origin' already exists. Removing..."
    git remote remove origin
fi

echo ""
echo "📋 Manual GitHub Repository Setup Instructions:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com"
echo "   - Click 'New repository'"
echo "   - Repository name: forge1-python"
echo "   - Description: Cognisia's Forge 1 - Advanced AI Employee Generator Platform"
echo "   - Set to Public"
echo "   - Don't initialize with README (we already have one)"
echo "   - Click 'Create repository'"
echo ""
echo "2. After creating the repository, GitHub will show you the repository URL."
echo "   Copy the HTTPS URL (it should look like: https://github.com/shaheerasif8008-cmyk/forge1-python.git)"
echo ""
echo "3. Run the following commands:"
echo "   git remote add origin https://github.com/shaheerasif8008-cmyk/forge1-python.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Alternatively, if you have GitHub CLI installed:"
echo "   gh repo create shaheerasif8008-cmyk/forge1-python --public --source=. --remote=origin --push"
echo ""
echo "📝 Current git status:"
git status
echo ""
echo "🌐 Ready to push to GitHub once repository is created!"