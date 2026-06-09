import os

# Google Cloud Settings
PROJECT_ID = "codelabproj-497104"
BUCKET_NAME = "carbonwise-receipts"

# Set to True to enable real Google Cloud Vision and Storage
# Set to False to run 100% locally (uses local file storage & simulated AI OCR)
USE_GCP = True

# Local upload settings
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

# Credentials path
CREDENTIALS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "credentials.json")

# Ensure local upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
