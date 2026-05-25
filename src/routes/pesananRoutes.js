/**
 * @swagger
 * tags:
 *   name: Pesanan
 *   description: API untuk proses checkout pesanan
 */
const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');

/**
 * @swagger
 * /api/pesanan/checkout:
 *   post:
 *     tags: [Pesanan]
 *     summary: Proses checkout pesanan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               metodePembayaranId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Checkout berhasil
 *       400:
 *         description: Checkout gagal karena stok tidak mencukupi atau data tidak valid
 */
router.post('/checkout', pesananController.checkout);

module.exports = router;
