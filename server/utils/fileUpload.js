const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = {
  uploadToLocal: (file, type) => {
    try {
      const ext = path.extname(file.originalname);
      const filename = `${type}-${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      
      fs.renameSync(file.path, filePath);
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }
};