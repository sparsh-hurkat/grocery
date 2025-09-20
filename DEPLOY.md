# 🚀 Deployment Guide for 3D Pac-Man Game

## Prerequisites
- [ ] GitHub account
- [ ] Repository created on GitHub
- [ ] Git configured locally

## Step-by-Step Deployment

### 1. Update Configuration
- [x] ✅ Already configured for the `grocery` repository:
  ```json
  "homepage": "https://sparsh-hurkat.github.io/grocery"
  ```

### 2. Initial Git Setup (if not done)
```bash
# Initialize git (if not already done)
git init

# Add remote origin
git remote add origin https://github.com/sparsh-hurkat/grocery.git

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: 3D Pac-Man game with compass controls"
```

### 3. Push to GitHub
```bash
# Push to main branch
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repository on GitHub.com
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. Save the changes

### 5. Automatic Deployment
- The GitHub Actions workflow will automatically trigger
- Check the "Actions" tab to see deployment progress
- Once complete, your game will be available at: `https://sparsh-hurkat.github.io/grocery/`

## Testing on Mobile
1. Open the deployed URL on your mobile device
2. Allow device orientation permissions when prompted
3. Test compass controls by rotating your device
4. Use the forward button to move Pac-Man

## Troubleshooting

### Common Issues:
- **404 Error**: Check that the repository name matches the URL path
- **Compass not working**: Ensure you're accessing via HTTPS (not HTTP)
- **Build fails**: Check the Actions tab for error logs

### Manual Deployment Alternative:
If automatic deployment doesn't work:
```bash
npm run deploy
```

## Features Enabled by HTTPS Deployment:
✅ Real compass/magnetometer access  
✅ Device orientation API  
✅ Gyroscope controls  
✅ Mobile touch controls  
✅ Progressive Web App capabilities

## Post-Deployment
- [ ] Test all features on desktop
- [ ] Test compass controls on mobile
- [ ] Share the URL with others
- [ ] Consider adding to your portfolio

---

**Live URL**: `https://sparsh-hurkat.github.io/grocery/`

Happy gaming! 🎮