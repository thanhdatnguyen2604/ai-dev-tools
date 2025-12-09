# Real-time Collaborative Coding Interview Platform

A minimal but working real-time collaborative coding interview platform built with Django (backend) and React (frontend).

## Features

- Create and share coding interview sessions
- Real-time collaborative code editing
- Syntax highlighting for JavaScript and Python
- Code execution in the browser (JavaScript via sandbox, Python via Pyodide/WASM)
- Session sharing via URL
- Live user count display

## Project Structure

```
02-coding-interview/
├── backend/                 # Django backend with WebSocket support
│   ├── coding_interview_backend/
│   │   ├── asgi.py           # ASGI configuration for Channels
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Main URL configuration
│   ├── sessions/             # Sessions app
│   │   ├── consumers.py      # WebSocket consumer
│   │   ├── routing.py        # WebSocket routing
│   │   ├── views.py          # API views
│   │   ├── urls.py           # App URLs
│   │   └── tests.py          # Integration tests
│   ├── venv/                # Python virtual environment
│   └── requirements.txt     # Python dependencies
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx     # Landing page
│   │   │   └── SessionPage.jsx  # Coding session page
│   │   ├── App.jsx           # Main App component
│   │   └── App.css           # Styling
│   ├── package.json
│   └── index.html
├── README.md               # This file
└── start-dev.sh           # Development startup script
```

## Quick Start

The fastest way to get started is to use the provided startup script:

```bash
cd 02-coding-interview
./start-dev.sh
```

This will:
- Set up and start the Django backend on port 8989
- Set up and start the React frontend on port 5173

## Manual Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver 0.0.0.0:8989
```

The backend will be available at `http://localhost:8989`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Testing

### Running Backend Tests

The backend includes integration tests for the session creation API.

To run all tests:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py test
```

To run tests for the sessions app specifically:
```bash
cd backend
source venv/bin/activate
python manage.py test sessions
```

The tests cover:
- Session creation endpoint (POST /api/sessions/)
- Session retrieval endpoint (GET /api/sessions/<session_id>/)
- Uniqueness of session IDs
- CORS headers
- Response validation

### Test Coverage

Current test suite includes:
- `test_create_session_endpoint`: Verifies successful session creation
- `test_create_session_returns_unique_ids`: Ensures each session has a unique ID
- `test_get_session_endpoint`: Tests session information retrieval
- `test_get_nonexistent_session`: Documents behavior for non-existent sessions
- `test_create_session_cors_headers`: Tests CORS request handling

## Usage

1. **Create a Session**: Visit the home page at `http://localhost:5173` and click "Create new interview session"

2. **Share the Session**: Copy the session URL from the session page and share it with candidates

3. **Collaborative Coding**: Multiple users can edit code in real-time. Changes are synchronized across all connected users

4. **Language Selection**: Switch between JavaScript and Python using the language selector

5. **Run Code**: Click "Run Code" to execute the code. Results appear in the output panel:
   - JavaScript code runs in a sandboxed environment
   - Python code runs using Pyodide (WebAssembly)

## API Endpoints

### REST Endpoints

- `POST /api/sessions/` - Create a new session
  - Request: Empty POST request
  - Response (201 Created):
    ```json
    {
      "id": "session_id",
      "url": "http://localhost:5173/session/session_id"
    }
    ```

- `GET /api/sessions/<session_id>/` - Get session information
  - Response (200 OK):
    ```json
    {
      "id": "session_id",
      "url": "http://localhost:5173/session/session_id"
    }
    ```

### WebSocket Endpoints

- `ws://localhost:8989/ws/session/<session_id>/` - Connect to a session for real-time updates

## WebSocket Message Format

**From Client to Server:**
```json
{
  "type": "update",
  "code": "updated code content",
  "language": "javascript|python"
}
```

**From Server to Client:**
```json
{
  "type": "init|update|user_count",
  "code": "current code (for init/update)",
  "language": "current language (for init/update)",
  "connected_users": 3
}
```

## Development Tips

### Backend Development

- The backend uses Django Channels for WebSocket support
- Session data is stored in memory for simplicity
- CORS is configured for development with `CORS_ALLOW_ALL_ORIGINS = True`
- Tests use Django's TestCase and can be run with `python manage.py test`

### Frontend Development

- The frontend uses React with Vite for fast development
- Monaco Editor provides the code editing experience
- React Router handles client-side routing
- Pyodide is loaded dynamically for Python execution

### Common Issues

1. **Port Already in Use**: If port 8989 is in use, change it in:
   - Backend: `python manage.py runserver 0.0.0.0:<new-port>`
   - Frontend: Update the API URLs in components

2. **CORS Errors**: Make sure the backend is running and CORS is properly configured

3. **WebSocket Connection Issues**: Check that the backend is using the ASGI application

## Production Considerations

This is a learning/demo application. For production use, consider:

1. **Persistent Storage**: Replace in-memory session storage with a database (Redis, PostgreSQL)
2. **Authentication**: Add user authentication and authorization
3. **Security**: Implement proper code execution sandboxes
4. **Scalability**: Use Redis for Channels layer in production
5. **Error Handling**: Add comprehensive error handling and logging
6. **HTTPS**: Use HTTPS in production
7. **Rate Limiting**: Implement rate limiting for session creation and WebSocket connections
8. **More Tests**: Add frontend tests and end-to-end tests

## Contributing

Feel free to submit issues and enhancement requests!