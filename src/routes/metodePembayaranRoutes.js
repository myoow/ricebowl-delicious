/**
 * @swagger
 * tags:
 *   name: MetodePembayaran
 *   description: API untuk metode pembayaran
 */
const express = require('express');
const router = express.Router();
const metodePembayaranController = require('../controllers/metodePembayaranController');

/**
 * @swagger
 * /api/metode-pembayaran:
 *   get:
 *     tags: [MetodePembayaran]
 *     summary: Ambil semua metode pembayaran
 *     responses:
 *       200:
 *         description: Daftar metode pembayaran berhasil diambil
 */
router.get('/', metodePembayaranController.getAllMetodePembayaran);

/**
 * @swagger
 * /api/metode-pembayaran/{id}:
 *   get:
 *     tags: [MetodePembayaran]
 *     summary: Ambil metode pembayaran berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Metode pembayaran berhasil ditemukan
 *       404:
 *         description: Metode pembayaran tidak ditemukan
 */
router.get('/:id', metodePembayaranController.getMetodePembayaranById);

/**
 * @swagger
 * /api/metode-pembayaran:
 *   post:
 *     tags: [MetodePembayaran]
 *     summary: Buat metode pembayaran baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Metode pembayaran berhasil dibuat
 */
router.post('/', metodePembayaranController.createMetodePembayaran);

/**
 * @swagger
 * /api/metode-pembayaran/{id}:
 *   put:
 *     tags: [MetodePembayaran]
 *     summary: Update metode pembayaran
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Metode pembayaran berhasil diperbarui
 */
router.put('/:id', metodePembayaranController.updateMetodePembayaran);

/**
 * @swagger
 * /api/metode-pembayaran/{id}:
 *   delete:
 *     tags: [MetodePembayaran]
 *     summary: Hapus metode pembayaran
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Metode pembayaran berhasil dihapus
 */
router.delete('/:id', metodePembayaranController.deleteMetodePembayaran);

module.exports = router;
