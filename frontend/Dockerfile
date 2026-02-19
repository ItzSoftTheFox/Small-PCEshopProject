# frontend/Dockerfile

# Použijeme Node.js (Alpine je super malý Linux)
FROM node:20-alpine

WORKDIR /app

# Zkopírujeme package.json a nainstalujeme závislosti
COPY package.json package-lock.json* ./
RUN npm install

# Zkopírujeme zbytek kódu
COPY . .

# Otevřeme port 3000
EXPOSE 3000

# Spustíme vývojový server (pro školu nejlepší, vidíš chyby)
CMD ["npm", "run", "dev"]