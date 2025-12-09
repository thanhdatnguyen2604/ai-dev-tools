# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Return to app root
WORKDIR /app

# Collect Django static files
RUN python backend/manage.py collectstatic --noinput

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]