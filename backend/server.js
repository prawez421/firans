const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder create karein agar nahi hai
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: recursive });
}

// 📁 Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files yahan save hongi
  },
  filename: (req, file, cb) => {
    // File name clash se bachne ke liye unique timestamp add kar rahe hain
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// 🛡️ File Filter & File Size Limit Config
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false); // Sirf PDF allow karein
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB Limit
  fileFilter: fileFilter,
});

// 🚀 PDF Upload Route
app.post('/api/pdfs/upload', upload.single('pdf'), (req, res) => {
  try {
    // 1. Check karein agar file receive hui hai
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kripya ek valid PDF file upload karein!' 
      });
    }

    // 2. React frontend se aane wala Metadata (req.body se milega)
    const { title, category, status, tags, description } = req.body;

    // File details
    const fileData = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      metadata: {
        title,
        category,
        status,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        description,
      },
      uploadedAt: new Date(),
    };

    // TODO: Yahan aap fileData ko apne Database (MongoDB/MySQL) me save kar sakte hain

    return res.status(200).json({
      success: true,
      message: 'PDF successfully upload ho gayi!',
      data: fileData,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error! File upload nahi ho saki.' 
    });
  }
});

// Express Server Start
app.listen(PORT, () => {
  console.log(`Server working on http://localhost:${PORT}`);
});