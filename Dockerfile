# Upgrade ke Node 20 versi Debian Slim (sangat bersahabat dengan Prisma)
FROM node:20-slim

# Install OpenSSL secara manual di dalam kontener agar Prisma tidak protes
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]