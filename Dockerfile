# Stage 1: Build Next.js app
FROM node:20-alpine as build-step

# Set the working directory
WORKDIR /workspace
ENV PATH /workspace/node_modules/.bin:$PATH

# Copy package info
COPY pnpm-lock.yaml package.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm i

# Copy the application code 
COPY . .

# Build the Next.js app
RUN pnpm run build

# Stage 2: Setup Python environment and serve the app
FROM python:3.12-slim

# Set the working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    libpq-dev \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Copy requirements.txt
COPY requirements.txt ./

# Install Python dependencies
RUN pip install -r requirements.txt
ENV FLASK_ENV production

# Copy built Next.js app and other necessary files
COPY --from=build-step /workspace/.next ./.next
COPY --from=build-step /workspace/public ./public
COPY --from=build-step /workspace/package.json ./
COPY --from=build-step /workspace/pnpm-lock.yaml ./
COPY --from=build-step /workspace/node_modules ./node_modules
COPY --from=build-step /workspace/api ./api



# Expose ports
EXPOSE 3000 5328

# Start both the Next.js and Flask server
CMD ["sh", "-c", "npx next start & python api/index.py"]