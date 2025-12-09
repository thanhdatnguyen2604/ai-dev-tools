#!/bin/bash

# Development startup script for the Coding Interview Platform

echo "Starting Coding Interview Platform..."
echo "===================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the 02-coding-interview directory"
    exit 1
fi

# Start backend
echo ""
echo "🔧 Starting Django Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Start Daphne ASGI server in background (needed for WebSockets)
echo "Starting Daphne ASGI server on http://localhost:8989"
daphne -b 0.0.0.0 -p 8989 coding_interview_backend.asgi:application &
BACKEND_PID=$!

cd ..

# Start frontend
echo ""
echo "⚛️  Starting React Frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start Vite server in background
echo "Starting Vite server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

cd ..

# Show information
echo ""
echo "✅ Both servers are starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔗 Backend:  http://localhost:8989"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo ''; echo 'Servers stopped'; exit 0" INT
wait