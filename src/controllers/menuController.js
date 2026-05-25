const prisma = require('../prisma/client');

// Get All Menu
const getAllMenu = async (req, res) => {
  try {
    const menu = await prisma.menu.findMany();
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Menu
const createMenu = async (req, res) => {
  const { name, price, stok_harian, deskripsi } = req.body;
  const file = req.file;

  try {
    if (!name || !price || !stok_harian) {
      return res.status(400).json({ message: 'Nama, Harga, dan Stok harian wajib diisi.' });
    }

    // Jika ada file, gunakan nama file; jika tidak, gunakan null atau URL dari form
    const gambarPath = file ? `/uploads/${file.filename}` : null;

    const newMenu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        stok_harian: parseInt(stok_harian),
        deskripsi: deskripsi || null,
        gambar: gambarPath,
      },
    });
    res.status(201).json(newMenu);
  } catch (error) {
    console.error("Error saat create menu:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update Menu
const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { name, price, stok_harian, deskripsi, gambar } = req.body;
  try {
    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: price ? parseFloat(price) : undefined,
        stok_harian: stok_harian ? parseInt(stok_harian) : undefined,
        deskripsi: deskripsi !== undefined ? deskripsi : undefined,
        gambar: gambar !== undefined ? gambar : undefined,
      },
    });
    res.status(200).json(updatedMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Menu
const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.menu.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllMenu,
  createMenu,
  updateMenu,
  deleteMenu,
};
