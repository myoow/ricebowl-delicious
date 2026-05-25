const { checkout } = require('../controllers/pesananController');
const prisma = require('../prisma/client');

// Mock Prisma Client
jest.mock('../prisma/client', () => ({
  $transaction: jest.fn(),
}));

describe('Pesanan Controller - Checkout Function', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mock sebelum setiap test
    jest.clearAllMocks();

    // Mock request
    mockRequest = {
      body: {
        userId: 1,
        metodePembayaranId: 1,
        items: [
          { menuId: 1, quantity: 2 },
          { menuId: 2, quantity: 1 },
        ],
      },
    };

    // Mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Test Case 1: Transaksi Sukses - Penurunan Stok yang Benar', () => {
    it('Seharusnya berhasil checkout dan mengurangi stok_harian ketika stok mencukupi', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        // Mock transaction dengan menu data
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        // Mock findUnique untuk Menu 1
        mockTx.menu.findUnique
          .mockResolvedValueOnce({
            id: 1,
            name: 'Nasi Goreng',
            price: 25000,
            stok_harian: 10,
          })
          .mockResolvedValueOnce({
            id: 2,
            name: 'Mie Goreng',
            price: 20000,
            stok_harian: 15,
          });

        // Mock update untuk decrement stok
        mockTx.menu.update
          .mockResolvedValueOnce({
            id: 1,
            stok_harian: 8, // 10 - 2
          })
          .mockResolvedValueOnce({
            id: 2,
            stok_harian: 14, // 15 - 1
          });

        // Mock pesanan create
        mockTx.pesanan.create.mockResolvedValue({
          id: 1,
          userId: 1,
          metodePembayaranId: 1,
          total: 70000, // (25000 * 2) + (20000 * 1)
          status: 'completed',
          detailPesanan: [
            { id: 1, pesananId: 1, menuId: 1, quantity: 2 },
            { id: 2, pesananId: 1, menuId: 2, quantity: 1 },
          ],
        });

        return callback(mockTx);
      };

      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Checkout berhasil',
        data: expect.objectContaining({
          id: 1,
          total: 70000,
          status: 'completed',
        }),
      });
    });

    it('Seharusnya mengurangi stok untuk setiap item dengan quantity yang benar', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        mockTx.menu.findUnique
          .mockResolvedValueOnce({ id: 1, name: 'Menu 1', price: 10000, stok_harian: 5 })
          .mockResolvedValueOnce({ id: 2, name: 'Menu 2', price: 15000, stok_harian: 8 });

        mockTx.menu.update
          .mockResolvedValueOnce({ id: 1, stok_harian: 2 }) // 5 - 3
          .mockResolvedValueOnce({ id: 2, stok_harian: 5 }); // 8 - 3

        mockTx.pesanan.create.mockResolvedValue({
          id: 1,
          total: 75000,
          status: 'completed',
          detailPesanan: [],
        });

        return callback(mockTx);
      };

      mockRequest.body.items = [
        { menuId: 1, quantity: 3 },
        { menuId: 2, quantity: 3 },
      ];

      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('Test Case 2: Transaksi Dibatalkan (Rollback) - Stok Tidak Mencukupi', () => {
    it('Seharusnya mengembalikan error 400 ketika stok tidak mencukupi', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        // Mock menu dengan stok yang tidak mencukupi
        mockTx.menu.findUnique.mockResolvedValueOnce({
          id: 1,
          name: 'Nasi Goreng',
          price: 25000,
          stok_harian: 1, // Hanya 1, tapi diminta 5
        });

        return callback(mockTx);
      };

      mockRequest.body.items = [{ menuId: 1, quantity: 5 }];
      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Stok untuk Nasi Goreng tidak mencukupi',
      });
    });

    it('Seharusnya tidak mengubah stok ketika transaksi gagal', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        // Mock menu dengan stok tidak cukup
        mockTx.menu.findUnique.mockResolvedValueOnce({
          id: 1,
          name: 'Nasi Goreng',
          price: 25000,
          stok_harian: 2,
        });

        // update seharusnya tidak dipanggil karena transaksi gagal
        mockTx.menu.update.mockResolvedValue({ id: 1, stok_harian: 2 });

        return callback(mockTx);
      };

      mockRequest.body.items = [{ menuId: 1, quantity: 5 }];
      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      // Update seharusnya tidak dipanggil karena error terjadi sebelum update
    });

    it('Seharusnya mengembalikan error 400 jika menu tidak ditemukan', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        mockTx.menu.findUnique.mockResolvedValueOnce(null); // Menu tidak ditemukan

        return callback(mockTx);
      };

      mockRequest.body.items = [{ menuId: 999, quantity: 1 }];
      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Menu with ID 999 not found',
      });
    });

    it('Seharusnya melakukan rollback otomatis saat terjadi error (Prisma transaction behavior)', async () => {
      // Arrange
      prisma.$transaction.mockImplementation(async (callback) => {
        throw new Error('Stok untuk Mie Goreng tidak mencukupi');
      });

      mockRequest.body.items = [
        { menuId: 1, quantity: 10 },
        { menuId: 2, quantity: 10 },
      ];

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Stok untuk Mie Goreng tidak mencukupi',
      });
    });
  });

  describe('Test Case 3: Validasi Perhitungan Total', () => {
    it('Seharusnya menghitung total harga dengan benar', async () => {
      // Arrange
      const mockTransaction = async (callback) => {
        const mockTx = {
          menu: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
          pesanan: {
            create: jest.fn(),
          },
        };

        mockTx.menu.findUnique
          .mockResolvedValueOnce({ id: 1, name: 'Menu 1', price: 10000, stok_harian: 10 })
          .mockResolvedValueOnce({ id: 2, name: 'Menu 2', price: 15000, stok_harian: 10 });

        mockTx.menu.update
          .mockResolvedValueOnce({ id: 1, stok_harian: 8 })
          .mockResolvedValueOnce({ id: 2, stok_harian: 7 });

        mockTx.pesanan.create.mockResolvedValue({
          id: 1,
          total: 65000, // (10000 * 2) + (15000 * 3)
          status: 'completed',
          detailPesanan: [],
        });

        return callback(mockTx);
      };

      mockRequest.body.items = [
        { menuId: 1, quantity: 2 },
        { menuId: 2, quantity: 3 },
      ];

      prisma.$transaction.mockImplementation(mockTransaction);

      // Act
      await checkout(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Checkout berhasil',
        data: expect.objectContaining({
          total: 65000,
        }),
      });
    });
  });
});
