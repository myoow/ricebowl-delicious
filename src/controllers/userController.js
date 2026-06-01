const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

const isValidWhatsapp = (whatsapp) => {
  if (!whatsapp) return true;
  const regex = /^(?:\+62|62|08)[0-9]{7,13}$/;
  return regex.test(whatsapp);
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create User (Register)
const createUser = async (req, res) => {
  const { name, email, password, whatsapp } = req.body;

  // Validasi input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password harus diisi' });
  }

  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    return res.status(400).json({ message: 'Format nomor WhatsApp tidak valid. Contoh: +628123456789 atau 08123456789' });
  }

  try {
    // Check jika email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Catatan: Dalam production, password harus di-hash dengan bcrypt
        whatsapp: whatsapp || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, whatsapp } = req.body;

  if (whatsapp !== undefined && whatsapp !== null && whatsapp !== '' && !isValidWhatsapp(whatsapp)) {
    return res.status(400).json({ message: 'Format nomor WhatsApp tidak valid. Contoh: +628123456789 atau 08123456789' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        email: email || undefined,
        whatsapp: whatsapp !== undefined ? whatsapp : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });

    res.status(200).json({
      message: 'User berhasil diperbarui',
      data: user,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Register (Diperbarui agar sinkron dengan Frontend)
const register = async (req, res) => {
  // 1. Tangkap variabel persis sesuai yang dikirim dari Frontend page.tsx
  const { nama, username, email, password, noWhatsapp } = req.body;

  // 2. Validasi apakah ada yang kosong
  if (!nama || !username || !email || !password || !noWhatsapp) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  // 3. Validasi WhatsApp (kalau fungsi isValidWhatsapp-nya ada di atas)
  if (noWhatsapp && typeof isValidWhatsapp === 'function' && !isValidWhatsapp(noWhatsapp)) {
    return res.status(400).json({ message: 'Format nomor WhatsApp tidak valid. Contoh: +628123456789 atau 08123456789' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 4. Masukkan ke database
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: nama,             // Mapping 'nama' dari frontend ke kolom 'name' di DB
        email: email,
        password: hashedPassword, // Pastikan password di-hash sebelum disimpan
        whatsapp: noWhatsapp || null, // Mapping 'noWhatsapp' ke kolom 'whatsapp'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Login failed: User not found for email', email);
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Simple password check (in production, use bcrypt for password hashing)
    if (user.password !== password) {
      console.log('Login failed: Password mismatch for user', email);
      console.log('Stored password:', user.password, 'Submitted password:', password);
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    console.log('Login success for user:', email);
    res.status(200).json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: `token-${user.id}-${Date.now()}`, // Simple token for now
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  register,
  login,
};
