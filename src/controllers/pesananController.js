const prisma = require('../prisma/client');

const checkout = async (req, res) => {
  const { userId, metodePembayaranId, items } = req.body; // items: [{ menuId, quantity }]

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;

      // 1. Check stock and calculate total
      for (const item of items) {
        const menu = await tx.menu.findUnique({
          where: { id: item.menuId },
        });

        if (!menu) {
          throw new Error(`Menu with ID ${item.menuId} not found`);
        }

        if (menu.stok_harian < item.quantity) {
          throw new Error(`Stok untuk ${menu.name} tidak mencukupi`);
        }

        total += menu.price * item.quantity;

        // 2. Decrement stock
        await tx.menu.update({
          where: { id: item.menuId },
          data: {
            stok_harian: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Create Pesanan
      const pesanan = await tx.pesanan.create({
        data: {
          userId,
          metodePembayaranId,
          total,
          status: 'completed',
          detailPesanan: {
            create: items.map((item) => ({
              menuId: item.menuId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          detailPesanan: true,
        },
      });

      return pesanan;
    });

    res.status(201).json({
      message: 'Checkout berhasil',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  checkout,
};
