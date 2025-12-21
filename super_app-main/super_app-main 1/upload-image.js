const fs = require('fs');
const path = require('path');

// Configuration
const UPLOAD_DIR = './node-backend/uploads/products/';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Function to copy image
function copyImage(sourcePath, destinationFolder = UPLOAD_DIR) {
    try {
        // Check if source file exists
        if (!fs.existsSync(sourcePath)) {
            console.error('❌ Source file does not exist:', sourcePath);
            return false;
        }

        // Get file extension
        const ext = path.extname(sourcePath).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            console.error('❌ Invalid file type. Allowed:', ALLOWED_EXTENSIONS.join(', '));
            return false;
        }

        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 1000000);
        const filename = `uploaded-${timestamp}-${randomId}${ext}`;
        const destinationPath = path.join(destinationFolder, filename);

        // Copy file
        fs.copyFileSync(sourcePath, destinationPath);
        
        console.log('✅ Image uploaded successfully!');
        console.log('📁 Location:', destinationPath);
        console.log('🔗 URL:', `http://localhost:5000/uploads/products/${filename}`);
        
        return destinationPath;
    } catch (error) {
        console.error('❌ Error uploading image:', error.message);
        return false;
    }
}

// Usage instructions
console.log('🖼️  IMAGE UPLOAD HELPER');
console.log('========================');
console.log('');
console.log('To upload your image:');
console.log('1. Copy your image to this project folder');
console.log('2. Run: node upload-image.js "your-image.jpg"');
console.log('3. The image will be copied to the uploads folder');
console.log('4. Use the generated URL in your admin panel');
console.log('');

// Check if image path provided
const imagePath = process.argv[2];
if (imagePath) {
    copyImage(imagePath);
} else {
    console.log('💡 Example: node upload-image.js "my-product-image.jpg"');
}
