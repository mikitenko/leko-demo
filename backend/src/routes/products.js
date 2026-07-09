const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const {
  getProducts, getProduct, getCategories, getFilters,
  createProduct, updateProduct, deleteProduct,
  uploadPhotos, deletePhoto, getAdminProducts,
} = require('../controllers/products');

const router = express.Router();

// Налаштування multer для завантаження фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images are allowed'));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/filters', getFilters);
router.get('/:id', getProduct);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/admin/list', authMiddleware, getAdminProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.post('/:id/photos', authMiddleware, upload.array('photos', 10), uploadPhotos);
router.delete('/photos/:photoId', authMiddleware, deletePhoto);

module.exports = router;
