FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy Prisma
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
