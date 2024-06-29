# flask.Dockerfile
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
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies and install
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Install gunicorn
RUN pip install gunicorn

# Copy Flask application
COPY api ./api

ENV FLASK_ENV production

EXPOSE 5328

# Start the Flask server using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5328", "api.index:app"]