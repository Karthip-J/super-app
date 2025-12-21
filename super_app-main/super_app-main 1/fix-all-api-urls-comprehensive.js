const fs = require('fs');
const path = require('path');

const superappDir = './superapp_master/superapp-master/src';

// Function to recursively find all JSX files
function findJsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findJsxFiles(fullPath));
    } else if (item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix API URLs in a file
function fixApiUrlsInFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Direct API_CONFIG.BASE_URL concatenation with endpoints
  const pattern1 = /`\$\{API_CONFIG\.BASE_URL\}(\/[^`]+)`/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, (match, endpoint) => {
      modified = true;
      return `API_CONFIG.getUrl('${endpoint}')`;
    });
  }
  
  // Pattern 2: API_CONFIG.BASE_URL with API_CONFIG.ENDPOINTS
  const pattern2 = /`\$\{API_CONFIG\.BASE_URL\}\$\{API_CONFIG\.ENDPOINTS\.[^}]+\}`/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, (match) => {
      modified = true;
      // Extract the endpoint name
      const endpointMatch = match.match(/ENDPOINTS\.([^}]+)/);
      if (endpointMatch) {
        return `API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.${endpointMatch[1]})`;
      }
      return match;
    });
  }
  
  // Pattern 3: process.env.REACT_APP_API_URL || API_CONFIG.BASE_URL with image paths
  const pattern3 = /\$\{process\.env\.REACT_APP_API_URL \|\| API_CONFIG\.BASE_URL\}([^`]+)/g;
  if (pattern3.test(content)) {
    content = content.replace(pattern3, (match, imagePath) => {
      modified = true;
      if (imagePath.includes('/uploads/')) {
        return `API_CONFIG.getUploadUrl('${imagePath.replace('/uploads/', '')}')`;
      } else {
        return `API_CONFIG.getUrl('${imagePath}')`;
      }
    });
  }
  
  // Pattern 4: Direct API_CONFIG.BASE_URL with /api/ endpoints
  const pattern4 = /`\$\{API_CONFIG\.BASE_URL\}\/api\/([^`]+)`/g;
  if (pattern4.test(content)) {
    content = content.replace(pattern4, (match, endpoint) => {
      modified = true;
      return `API_CONFIG.getUrl('/api/${endpoint}')`;
    });
  }
  
  // Pattern 5: API_CONFIG.BASE_URL with uploads
  const pattern5 = /`\$\{API_CONFIG\.BASE_URL\}\/uploads\/([^`]+)`/g;
  if (pattern5.test(content)) {
    content = content.replace(pattern5, (match, imagePath) => {
      modified = true;
      return `API_CONFIG.getUploadUrl('${imagePath}')`;
    });
  }
  
  // Pattern 6: Remove static API_BASE declarations
  const pattern6 = /const API_BASE = (?:process\.env\.REACT_APP_API_URL \|\| )?API_CONFIG\.BASE_URL;/g;
  if (pattern6.test(content)) {
    content = content.replace(pattern6, '');
    modified = true;
  }
  
  // Pattern 7: Replace API_BASE usage with API_CONFIG.BASE_URL
  const pattern7 = /\$\{API_BASE\}/g;
  if (pattern7.test(content)) {
    content = content.replace(pattern7, '${API_CONFIG.BASE_URL}');
    modified = true;
  }
  
  // Pattern 8: Remove BASE_IMAGE_URL declarations
  const pattern8 = /const BASE_IMAGE_URL = API_CONFIG\.BASE_URL;/g;
  if (pattern8.test(content)) {
    content = content.replace(pattern8, '');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Main execution
console.log('🔧 Starting comprehensive API URL fix...\n');

const jsxFiles = findJsxFiles(superappDir);
console.log(`Found ${jsxFiles.length} JSX files to process\n`);

let fixedCount = 0;
for (const file of jsxFiles) {
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    fixApiUrlsInFile(file);
    const newContent = fs.readFileSync(file, 'utf8');
    if (originalContent !== newContent) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Comprehensive fix complete!`);
console.log(`📊 Files processed: ${jsxFiles.length}`);
console.log(`🔧 Files modified: ${fixedCount}`);
console.log(`\n💡 Next steps:`);
console.log(`1. Review the changes`);
console.log(`2. Test the application`);
console.log(`3. Commit and deploy`); 