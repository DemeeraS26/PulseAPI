# PulseAPI

### REST API Testing and Analytics Dashboard

PulseAPI is a web-based application designed to simplify REST API testing and performance monitoring through a unified dashboard.

## Features

* Send HTTP requests using GET, POST, PUT, PATCH, and DELETE.
* Configure request parameters, headers, and request bodies.
* Inspect API responses and HTTP status codes.
* Monitor request counts, success rates, and response times.
* Save and reuse API requests.
* View API testing analytics.
* Generate and export testing reports.

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Vite
* Axios

### Backend

* Python
* FastAPI
* HTTPX
* Pydantic
* Uvicorn

## Project Structure

```text
PulseAPI/
├── frontend/
│   └── React application
├── backend/
│   ├── main.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Running the Project

### 1. Start the backend

Open a terminal and navigate to the backend directory.

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The backend should be available at `http://127.0.0.1:8000`.

### 2. Start the frontend

Open a second terminal and navigate to the frontend directory.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Project Status

PulseAPI is an ongoing development project. Features and implementation details may evolve as development progresses.
