# Base image
FROM node:18

# Set timezone
ENV TZ=Asia/Makassar

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create log folder
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Command to run app
CMD ["node", "index.js"]
