# Stage 1: Build the React frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

# Copy frontend configuration and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend and serve the application
# We use Python 3.11 for stability and faster dependency installation
FROM python:3.11-slim
WORKDIR /app

# Copy the backend requirements and install them
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the compiled React frontend from Stage 1 into the location expected by main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist/

# Set environment variables
ENV PORT=8080
EXPOSE 8080

# Command to run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
