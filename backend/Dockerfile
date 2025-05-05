FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for PDF libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    libpoppler-cpp-dev \
    poppler-utils \
    libgl1-mesa-glx \
    ghostscript \
    python3-tk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make scripts directory
RUN mkdir -p /app/scripts/annual_reports
RUN mkdir -p /app/scripts/extracted_data

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "run.py"] 