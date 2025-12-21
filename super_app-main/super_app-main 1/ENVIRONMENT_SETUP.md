# 🌍 Environment Configuration Guide

## 🚨 **CRITICAL: Hardcoded URL Issue Resolution**

This guide will help you set up dynamic URL configuration for deployment to any platform (Vercel, AWS, etc.).

## 📋 **Current Issues Identified:**

1. **50+ files** contain hardcoded `localhost:5000` URLs
2. **Environment files** have conflicting configurations
3. **Build files** contain compiled hardcoded URLs
4. **No centralized** API configuration

## 🛠️ **Solution: Centralized API Configuration**

### **1. New API Configuration Files Created:**

#### **Super App Frontend:**
- `superapp_master/superapp-master/src/config/api.config.js`
- Centralized API endpoints and helper functions
- Dynamic URL resolution

#### **Admin Panel Frontend:**
- `secom_admin-main/secom_admin-main/src/config/api.config.js`
- Admin-specific API endpoints
- Consistent configuration pattern

### **2. Environment Variables Setup:**

#### **For Local Development:**
```bash
# superapp_master/superapp-master/.env
REACT_APP_API_URL=http://localhost:5000

# secom_admin-main/secom_admin-main/.env
REACT_APP_API_URL=http://localhost:5000
```

#### **For Production (Vercel):**
```bash
# Set in Vercel Dashboard
REACT_APP_API_URL=https://super-app-0ofo.onrender.com
```

#### **For Other Platforms:**
```bash
# AWS
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com

# Google Cloud
REACT_APP_API_URL=https://your-app-engine-url.appspot.com

# Azure
REACT_APP_API_URL=https://your-app-service.azurewebsites.net
```

## 🔧 **Implementation Steps:**

### **Step 1: Run the URL Cleanup Script**
```bash
node fix-hardcoded-urls.js
```

This script will:
- ✅ Replace all hardcoded URLs with centralized configuration
- ✅ Add proper import statements
- ✅ Update image URL patterns
- ✅ Maintain functionality while making URLs dynamic

### **Step 2: Update Environment Files**

#### **Remove Hardcoded URLs from .env files:**
```bash
# Remove these lines from all .env files:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_URL=https://super-app-0ofo.onrender.com
```

#### **Add Clean Environment Variables:**
```bash
# For local development
REACT_APP_API_URL=http://localhost:5000

# For production (set in deployment platform)
REACT_APP_API_URL=https://your-backend-url.com
```

### **Step 3: Update Service Files**

#### **Before (Hardcoded):**
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const response = await fetch(`${API_BASE}/api/auth/login`, {
  // ...
});
```

#### **After (Centralized):**
```javascript
import API_CONFIG from '../config/api.config.js';

const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LOGIN), {
  headers: API_CONFIG.getAuthHeaders(),
  // ...
});
```

### **Step 4: Update Image URL Patterns**

#### **Before (Hardcoded):**
```javascript
const imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
```

#### **After (Centralized):**
```javascript
const imageUrl = API_CONFIG.getImageUrl(imagePath);
```

## 🚀 **Deployment Configuration:**

### **Vercel Deployment:**
1. **Set Environment Variable:**
   ```
   REACT_APP_API_URL=https://super-app-0ofo.onrender.com
   ```

2. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Vercel Configuration:**
   - `vercel.json` files already created
   - Proper routing configured
   - Environment variables handled

### **AWS Deployment:**
1. **Set Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com
   ```

2. **S3 + CloudFront Setup:**
   - Upload build files to S3
   - Configure CloudFront for CDN
   - Set environment variables in deployment

### **Other Platforms:**
- **Google Cloud:** Set environment variables in App Engine
- **Azure:** Configure in App Service settings
- **Netlify:** Set in environment variables section

## 🔍 **Testing Checklist:**

### **Local Testing:**
- [ ] Set `REACT_APP_API_URL=http://localhost:5000`
- [ ] Test all modules (Hotel, Restaurant, Taxi, Grocery)
- [ ] Verify image loading works
- [ ] Check API calls are successful

### **Production Testing:**
- [ ] Set `REACT_APP_API_URL=https://super-app-0ofo.onrender.com`
- [ ] Test all modules in production
- [ ] Verify CORS is working
- [ ] Check image loading from production backend

## 🛡️ **Security Considerations:**

### **Environment Variables:**
- ✅ Never commit `.env` files to git
- ✅ Use platform-specific environment variable management
- ✅ Rotate API keys regularly
- ✅ Use HTTPS in production

### **API Security:**
- ✅ Implement proper CORS policies
- ✅ Use authentication tokens
- ✅ Validate all API responses
- ✅ Handle errors gracefully

## 📊 **Benefits of This Approach:**

1. **🔧 Flexibility:** Easy to switch between environments
2. **🚀 Scalability:** Works with any deployment platform
3. **🛠️ Maintainability:** Centralized configuration
4. **🔒 Security:** No hardcoded URLs in code
5. **📈 Performance:** Optimized image loading
6. **🔄 Consistency:** Same pattern across all modules

## 🚨 **Important Notes:**

1. **Backup:** Always backup your code before running the cleanup script
2. **Testing:** Test thoroughly after URL changes
3. **Gradual:** Consider implementing changes module by module
4. **Monitoring:** Monitor API calls after deployment
5. **Rollback:** Keep previous versions for quick rollback if needed

## 📞 **Support:**

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Review the centralized configuration files
5. Check CORS settings on the backend

---

**🎯 Goal:** Make your Super App deployment-ready for any platform with dynamic URL configuration! 