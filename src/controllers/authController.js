const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // TODO: Generate JWT token
    // const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token: 'TODO_JWT_TOKEN', // Replace with actual JWT
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      role: user.role, // ADMIN or CUSTOMER
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { nama, username, email, password, noWhatsapp } = req.body;

    // Validate input
    if (!nama || !username || !email || !password || !noWhatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi',
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: nama,
        username: username,
        email,
        password: hashedPassword,
        whatsapp: noWhatsapp,
        role: 'CUSTOMER', // Default role
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { loginUser, registerUser };
