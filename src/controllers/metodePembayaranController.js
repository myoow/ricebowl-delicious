const prisma = require('../prisma/client');

// Get All Metode Pembayaran
const getAllMetodePembayaran = async (req, res) => {
  try {
    const metode = await prisma.metodePembayaran.findMany();
    res.status(200).json(metode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Metode Pembayaran by ID
const getMetodePembayaranById = async (req, res) => {
  const { id } = req.params;
  try {
    const metode = await prisma.metodePembayaran.findUnique({
      where: { id: parseInt(id) },
    });

    if (!metode) {
      return res.status(404).json({ message: 'Metode pembayaran tidak ditemukan' });
    }

    res.status(200).json(metode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Metode Pembayaran
const createMetodePembayaran = async (req, res) => {
  const { name } = req.body;

  // Validasi input
  if (!name) {
    return res.status(400).json({ message: 'Nama metode pembayaran harus diisi' });
  }

  try {
    const newMetode = await prisma.metodePembayaran.create({
      data: {
        name,
      },
    });

    res.status(201).json({
      message: 'Metode pembayaran berhasil dibuat',
      data: newMetode,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Metode Pembayaran
const updateMetodePembayaran = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const metode = await prisma.metodePembayaran.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
      },
    });

    res.status(200).json({
      message: 'Metode pembayaran berhasil diperbarui',
      data: metode,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Metode pembayaran tidak ditemukan' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete Metode Pembayaran
const deleteMetodePembayaran = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.metodePembayaran.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Metode pembayaran berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Metode pembayaran tidak ditemukan' });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllMetodePembayaran,
  getMetodePembayaranById,
  createMetodePembayaran,
  updateMetodePembayaran,
  deleteMetodePembayaran,
};
