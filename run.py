import os
import subprocess
import sys

def ensure_dependencies():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
    except ImportError:
        print("Backend dependencies missing. Installing now...")
        req_file = os.path.join(base_dir, "backend", "requirements.txt")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", req_file], check=True)
            print("Dependencies installed successfully!")
        except Exception as e:
            print(f"Failed to install dependencies: {e}")
            sys.exit(1)

if __name__ == "__main__":
    ensure_dependencies()
    import uvicorn
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "frontend")
    dist_dir = os.path.join(frontend_dir, "dist")
    
    # Check if frontend is built
    if not os.path.exists(dist_dir):
        print("Frontend not built. Building React frontend now... This may take a minute.")
        try:
            subprocess.run("npm install", cwd=frontend_dir, shell=True, check=True)
            subprocess.run("npm run build", cwd=frontend_dir, shell=True, check=True)
            print("Frontend build complete!")
        except Exception as e:
            print(f"\\n[WARNING] Failed to build frontend automatically: {e}")
            print("The server will still start, but the React user interface might not be available.")
            print("You may need to run 'npm install' manually inside the 'frontend' folder.\\n")
        
    print("======================================================")
    print("Starting CarbonWise Single Application Server...")
    print("Serving BOTH the React frontend and the FastAPI backend.")
    print("Access the app at: http://localhost:8000")
    print("======================================================")
    
    # Ensure we are in the root directory for Python path to resolve backend.app.main properly
    os.chdir(base_dir)
    
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
    
    # Ensure we are in the root directory for Python path to resolve backend.app.main properly
    # uvicorn needs the module path. If we are in the root, 'backend.app.main' works.
    os.chdir(base_dir)
    
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
