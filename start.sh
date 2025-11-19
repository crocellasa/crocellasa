#!/bin/bash
# Alcova Smart Check-in - Railway Startup Script
# This script is used by Railway.app to start the backend server

set -e  # Exit on error

echo "🚀 Starting Alcova Smart Check-in Backend..."

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment (not needed in production, but good for local testing)
# source venv/bin/activate

# Install dependencies (Railway does this automatically, but kept for reference)
# echo "📥 Installing dependencies..."
# pip install -r requirements.txt

# Get port from environment variable or default to 8000
PORT=${PORT:-8000}

echo "✅ Starting Uvicorn on port $PORT..."

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
