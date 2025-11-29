# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the frontend for production
RUN npm run build

# Expose Vite dev server port
EXPOSE 5173

# Start the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
