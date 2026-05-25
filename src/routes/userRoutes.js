/**
 * @swagger
 * tags:
 *   name: User
 *   description: API untuk manajemen user
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags: [User]
 *     summary: Ambil semua user
 *     responses:
 *       200:
 *         description: Daftar user berhasil diambil
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [User]
 *     summary: Ambil user berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil ditemukan
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/user:
 *   post:
 *     tags: [User]
 *     summary: Buat user baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *                 description: Nomor WhatsApp pengguna (format +628 atau 08)
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     tags: [User]
 *     summary: Update user
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
 *               email:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *                 description: Nomor WhatsApp pengguna
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Hapus user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 */
router.delete('/:id', userController.deleteUser);

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Registrasi user baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags: [User]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', userController.login);

module.exports = router;
