# Node Prisma App

This project is a Node.js web application that utilizes Prisma as an ORM to manage a relational database. The application includes several models that represent the core entities of an online ordering system.

## Project Structure

```
node-prisma-app
├── prisma
│   └── schema.prisma
├── src
│   ├── index.js
│   └── prisma
│       └── client.js
├── package.json
├── .env
└── README.md
```

## Database Models

The following models are defined in the `prisma/schema.prisma` file:

- **User**: Represents a user of the application.
- **Menu**: Represents the menu items available for ordering.
- **Keranjang**: Represents the shopping cart for users.
- **Pesanan**: Represents an order placed by a user.
- **DetailPesanan**: Represents the details of each order, linking to menu items.
- **MetodePembayaran**: Represents the payment methods available.
- **Pembayaran**: Represents the payment transactions for orders.

### Prisma Schema Example

Here is an example of how the models are defined in the `prisma/schema.prisma` file:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  keranjang Keranjang[]
  pesanan   Pesanan[]
}

model Menu {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  keranjang Keranjang[]
}

model Keranjang {
  id        Int      @id @default(autoincrement())
  userId    Int
  menuId    Int
  quantity  Int
  user      User     @relation(fields: [userId], references: [id])
  menu      Menu     @relation(fields: [menuId], references: [id])
}

model Pesanan {
  id                Int             @id @default(autoincrement())
  userId            Int
  metodePembayaranId Int
  total             Float
  detailPesanan    DetailPesanan[]
  user              User            @relation(fields: [userId], references: [id])
  metodePembayaran  MetodePembayaran @relation(fields: [metodePembayaranId], references: [id])
}

model DetailPesanan {
  id        Int      @id @default(autoincrement())
  pesananId Int
  menuId    Int
  quantity  Int
  pesanan   Pesanan  @relation(fields: [pesananId], references: [id])
  menu      Menu     @relation(fields: [menuId], references: [id])
}

model MetodePembayaran {
  id        Int      @id @default(autoincrement())
  name      String
  pembayaran Pembayaran[]
}

model Pembayaran {
  id                    Int                  @id @default(autoincrement())
  pesananId            Int
  metodePembayaranId   Int
  amount               Float
  pesanan             Pesanan              @relation(fields: [pesananId], references: [id])
  metodePembayaran     MetodePembayaran     @relation(fields: [metodePembayaranId], references: [id])
}
```

## Instructions for Inserting Tables

1. After defining the models in `prisma/schema.prisma`, run the following command in your terminal to generate the database migration:
   ```
   npx prisma migrate dev --name init
   ```

2. This command will create the necessary tables in your database based on the schema defined.

3. To interact with the database using the Prisma client, you can import the client in your `src/prisma/client.js` file:
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   module.exports = prisma;
   ```

4. You can then use this client in your application logic to perform CRUD operations on the defined tables.

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your database connection in the `.env` file.
4. Run the migration command to create the tables.
5. Start the application:
   ```
   npm start
   ```

This README provides an overview of the project structure, database models, and instructions for setting up and running the application.