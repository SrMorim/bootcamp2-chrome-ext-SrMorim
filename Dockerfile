# Base image with Playwright and Chromium pre-installed
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Install Playwright browsers (Chromium)
RUN npx playwright install --with-deps chromium

# Copy project files
COPY . .

# Build extension
RUN npm run build

# Set environment
ENV CI=true
ENV NODE_ENV=test

# Default command: run tests
CMD ["npm", "run", "test:e2e"]
