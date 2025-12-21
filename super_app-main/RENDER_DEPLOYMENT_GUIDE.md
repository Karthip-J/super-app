# Render Deployment Guide

This guide will help you deploy your Super App project on Render.com. You'll deploy:
1. Backend (Node.js API)
2. Main Frontend App (React)
3. Urban Partner App (React)

## Prerequisites
- Render.com account
- GitHub repository with your code
- MongoDB Atlas account (for database)

## Step 1: Prepare Your Backend

### 1.1 Update Backend package.json
Make sure your backend has the correct start script and engines:

```json
{
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

### 1.2 Create Backend Environment Variables
Create `.env` file in your backend root:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yourdb
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
CORS_ORIGIN=https://your-main-app.onrender.com
```

### 1.3 Create Backend render.yaml
```yaml
services:
  - type: web
    name: superapp-backend
    env: node
    repo: https://github.com/your-username/super-app-repo
    rootDir: super_app-main 1/node-backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    plan: free
```

## Step 2: Prepare Main Frontend App

### 2.1 Update Frontend package.json
Add engines and build script:

```json
{
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "scripts": {
    "build": "npm run build",
    "start": "serve -s build -l 3000"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  }
}
```

### 2.2 Create Frontend render.yaml
```yaml
services:
  - type: web
    name: superapp-frontend
    env: static
    repo: https://github.com/your-username/super-app-repo
    rootDir: super_app-main 1/superapp_master/superapp-master
    buildCommand: npm run build
    publishPath: build
    envVars:
      - key: REACT_APP_API_URL
        value: https://superapp-backend.onrender.com/api
    plan: free
```

### 2.3 Update API Configuration
In your frontend, update API calls to use the deployed backend URL:

```javascript
// src/config/api.config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

## Step 3: Prepare Urban Partner App

### 3.1 Update Urban Partner App package.json
```json
{
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "scripts": {
    "build": "npm run build",
    "start": "serve -s build -l 3000"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  }
}
```

### 3.2 Create Urban Partner render.yaml
```yaml
services:
  - type: web
    name: urban-partner-app
    env: static
    repo: https://github.com/your-username/super-app-repo
    rootDir: urban-partner-app
    buildCommand: npm run build
    publishPath: build
    envVars:
      - key: REACT_APP_API_URL
        value: https://superapp-backend.onrender.com/api
    plan: free
```

## Step 4: Deployment Steps

### 4.1 Push to GitHub
1. Create a new GitHub repository
2. Push all your code to GitHub
3. Make sure all render.yaml files are included

### 4.2 Deploy Backend on Render
1. Go to Render.com dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select "super_app-main 1/node-backend" as root directory
5. Configure:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
6. Add environment variables from Step 1.2
7. Click "Create Web Service"

### 4.3 Deploy Main Frontend on Render
1. Click "New +" → "Static Site"
2. Select the same repository
3. Root directory: "super_app-main 1/superapp_master/superapp-master"
4. Build Command: `npm run build`
5. Publish Directory: `build`
6. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`
7. Click "Create Static Site"

### 4.4 Deploy Urban Partner App on Render
1. Click "New +" → "Static Site"
2. Select the same repository
3. Root directory: "urban-partner-app"
4. Build Command: `npm run build`
5. Publish Directory: `build`
6. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`
7. Click "Create Static Site"

## Step 5: Post-Deployment Configuration

### 5.1 Update CORS Settings
In your backend server.js, update CORS origins:

```javascript
const corsOptions = {
  origin: [
    'https://superapp-frontend.onrender.com',
    'https://urban-partner-app.onrender.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
};
```

### 5.2 Test Your Applications
1. Visit your frontend URLs
2. Test user registration/login
3. Test OTP functionality
4. Test all features

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check package.json engines and scripts
2. **API Calls Fail**: Verify CORS settings and environment variables
3. **Database Connection**: Ensure MongoDB URI is correct and accessible
4. **OTP Not Working**: Check that backend is properly configured for SMS/email

### Logs and Debugging:
- Check Render service logs for errors
- Use Render's "Shell" access to debug
- Monitor build logs for dependency issues

## Cost Considerations

- Free tier includes:
  - 750 hours/month of compute time
  - 100GB bandwidth
- For production, consider upgrading to paid plans for better performance

## Security Notes

- Never commit sensitive data to GitHub
- Use environment variables for all secrets
- Enable HTTPS (Render does this automatically)
- Consider implementing rate limiting for production

## Next Steps

After successful deployment:
1. Set up custom domains
2. Configure monitoring and alerts
3. Set up backup strategies
4. Consider CI/CD pipeline with GitHub Actions

---

Need help? Check Render's documentation at https://render.com/docs or contact their support.
