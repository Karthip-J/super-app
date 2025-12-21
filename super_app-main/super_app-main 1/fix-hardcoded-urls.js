#!/usr/bin/env node

/**
 * Script to fix hardcoded URLs in the Super App project
 * This script will replace all hardcoded localhost:5000 URLs with the centralized API configuration
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Directories to process
  directories: [
    'superapp_master/superapp-master/src',
    'secom_admin-main/secom_admin-main/src'
  ],
  
  // File extensions to process
  extensions: ['.js', '.jsx'],
  
  // Files to exclude
  excludeFiles: [
    'config/api.config.js', // Don't modify the config file itself
    'build/', // Don't process build files
    'node_modules/' // Don't process node_modules
  ],
  
  // Patterns to replace
  patterns: [
    {
      // Replace hardcoded localhost:5000 in API calls
      find: /`\${process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'}\/api\/([^`]+)`/g,
      replace: 'API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.$1)',
      requires: ['import API_CONFIG from "../config/api.config.js";']
    },
    {
      // Replace direct localhost:5000 URLs
      find: /'http:\/\/localhost:5000'/g,
      replace: 'API_CONFIG.BASE_URL',
      requires: ['import API_CONFIG from "../config/api.config.js";']
    },
    {
      // Replace image URL patterns
      find: /`\${process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'}\/uploads\/([^`]+)`/g,
      replace: 'API_CONFIG.getUploadUrl("$1")',
      requires: ['import API_CONFIG from "../config/api.config.js";']
    },
    {
      // Replace image URL patterns with conditional logic
      find: /`\${process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'}\${([^}]+)}`/g,
      replace: 'API_CONFIG.getImageUrl($1)',
      requires: ['import API_CONFIG from "../config/api.config.js";']
    }
  ]
};

// Helper function to check if file should be excluded
function shouldExcludeFile(filePath) {
  return CONFIG.excludeFiles.some(exclude => filePath.includes(exclude));
}

// Helper function to get relative path for import
function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const toDir = path.dirname(toFile);
  const relativePath = path.relative(fromDir, toDir);
  return path.join(relativePath, 'config', 'api.config.js').replace(/\\/g, '/');
}

// Helper function to add import statement
function addImportIfNeeded(content, filePath) {
  const importStatement = `import API_CONFIG from "${getRelativePath(filePath, 'src/config/api.config.js')}";`;
  
  // Check if import already exists
  if (content.includes('import API_CONFIG')) {
    return content;
  }
  
  // Add import at the top of the file
  const lines = content.split('\n');
  let importIndex = 0;
  
  // Find the first import statement or add at the beginning
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('const ') || lines[i].trim().startsWith('function ') || lines[i].trim().startsWith('export ')) {
      importIndex = i;
      break;
    }
  }
  
  lines.splice(importIndex, 0, importStatement);
  return lines.join('\n');
}

// Main function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    
    // Apply each pattern
    CONFIG.patterns.forEach(pattern => {
      const matches = content.match(pattern.find);
      if (matches && matches.length > 0) {
        modifiedContent = modifiedContent.replace(pattern.find, pattern.replace);
        hasChanges = true;
        console.log(`  ✓ Applied pattern to ${filePath}`);
      }
    });
    
    // Add import if needed
    if (hasChanges) {
      modifiedContent = addImportIfNeeded(modifiedContent, filePath);
    }
    
    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`  ✓ Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process directories
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExcludeFile(fullPath)) {
          processDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (CONFIG.extensions.includes(ext) && !shouldExcludeFile(fullPath)) {
          processFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log('🚀 Starting hardcoded URL cleanup...\n');

let totalFiles = 0;
let modifiedFiles = 0;

CONFIG.directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processing directory: ${dir}`);
    processDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

console.log('\n✅ Hardcoded URL cleanup completed!');
console.log(`📊 Summary:`);
console.log(`   - Total files processed: ${totalFiles}`);
console.log(`   - Files modified: ${modifiedFiles}`);

console.log('\n📝 Next steps:');
console.log('   1. Review the changes in your code editor');
console.log('   2. Test the application to ensure everything works');
console.log('   3. Update your .env files to use the correct API URL');
console.log('   4. Deploy to Vercel with the new configuration'); 