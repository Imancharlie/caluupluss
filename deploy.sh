#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Add the dist folder to git
echo "Adding dist folder to git..."
git add dist

# Commit the changes
echo "Committing changes..."
git commit -m "chore: Update production build"

# Push to remote
echo "Pushing to remote..."
git push origin main

echo "Deployment complete!" 