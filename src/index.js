const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const menuRoutes = require('./routes/menuRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const userRoutes = require('./routes/userRoutes');
const metodePembayaranRoutes = require('./routes/metodePembayaranRoutes');
const prisma = require('./prisma/client'); // Import PrismaClient

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aplikasi Pemesanan Online API',
      version: '1.0.0',
      description: 'Dokumentasi API untuk Backend Aplikasi Pemesanan Online RTI',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/routes/apiDocs.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/user', userRoutes);
app.use('/api/metode-pembayaran', metodePembayaranRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Ada error di backend:", err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

main();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
});
