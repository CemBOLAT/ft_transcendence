# Base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN mkdir -p /app 

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

RUN chmod 755 -R /app/staticfiles

# Run the application
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "baseProject.asgi:application"]
