/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: API untuk data menu
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const menuController = require('../controllers/menuController');

// Setup multer untuk upload gambar
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/menu:
 *   get:
 *     tags: [Menu]
 *     summary: Ambil semua menu
 *     responses:
 *       200:
 *         description: List menu berhasil diambil
 */
router.get('/', menuController.getAllMenu);

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     tags: [Menu]
 *     summary: Ambil menu berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID menu
 *     responses:
 *       200:
 *         description: Menu berhasil diambil
 *       404:
 *         description: Menu tidak ditemukan
 */
router.get('/:id', menuController.getMenuById);

/**
 * @swagger
 * /api/menu:
 *   post:
 *     tags: [Menu]
 *     summary: Buat menu baru dengan gambar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stok_harian:
 *                 type: integer
 *               deskripsi:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Menu berhasil dibuat
 */
router.post('/', upload.single('image'), menuController.createMenu);

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Update menu
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID menu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stok_harian:
 *                 type: integer
 *               deskripsi:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu berhasil diupdate
 */
router.put('/:id', upload.single('image'), menuController.updateMenu);

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     tags: [Menu]
 *     summary: Hapus menu
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID menu
 *     responses:
 *       200:
 *         description: Menu berhasil dihapus
 */
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
