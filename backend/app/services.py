import json
import os
import random
from google.cloud import storage, vision
from . import config

# CO2 Emission Factors (kg CO2 per unit/kg) and Alternatives
CARBON_DATABASE = {
    "beef": {
        "co2": 27.0,
        "alternative": "Organic Chicken",
        "alt_co2": 6.9,
        "is_eco": False
    },
    "milk": {
        "co2": 3.2,
        "alternative": "Oat Milk",
        "alt_co2": 0.9,
        "is_eco": False
    },
    "cheese": {
        "co2": 13.5,
        "alternative": "Vegan Cheese",
        "alt_co2": 2.5,
        "is_eco": False
    },
    "plastic bottle": {
        "co2": 0.3,
        "alternative": "Reusable Steel Bottle",
        "alt_co2": 0.0,
        "is_eco": False
    },
    "apples": {
        "co2": 0.4,
        "alternative": "Local Apples",
        "alt_co2": 0.1,
        "is_eco": True
    },
    "bananas": {
        "co2": 0.8,
        "alternative": "Local Seasonal Fruits",
        "alt_co2": 0.3,
        "is_eco": True
    },
    "tomatoes": {
        "co2": 2.0,  # Greenhouse grown
        "alternative": "Local Field Tomatoes",
        "alt_co2": 0.4,
        "is_eco": False
    },
    "lentils": {
        "co2": 0.9,
        "alternative": "Lentils",
        "alt_co2": 0.9,
        "is_eco": True
    },
    "spinach": {
        "co2": 0.3,
        "alternative": "Local Spinach",
        "alt_co2": 0.1,
        "is_eco": True
    },
    "avocado": {
        "co2": 2.5,  # High transport footprint
        "alternative": "Local Pears / Apples",
        "alt_co2": 0.2,
        "is_eco": False
    }
}

def upload_to_gcs(local_file_path: str, destination_blob_name: str) -> str:
    """Uploads a file to Google Cloud Storage and returns its public URL."""
    if not config.USE_GCP:
        # Simulate local upload URL
        filename = os.path.basename(local_file_path)
        return f"/uploads/{filename}"

    # Verify credentials path exists
    if os.path.exists(config.CREDENTIALS_PATH):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = config.CREDENTIALS_PATH

    storage_client = storage.Client(project=config.PROJECT_ID)
    bucket = storage_client.bucket(config.BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)
    
    blob.upload_from_filename(local_file_path)
    
    # Make the object public so the frontend can load it
    blob.make_public()
    return blob.public_url

def analyze_receipt_ocr(image_path: str) -> dict:
    """Scans receipt image text and extracts items with carbon values."""
    detected_words = []

    if config.USE_GCP and os.path.exists(config.CREDENTIALS_PATH):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = config.CREDENTIALS_PATH
        client = vision.ImageAnnotatorClient()

        with open(image_path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        texts = response.text_annotations

        if response.error.message:
            raise Exception(f"Vision API error: {response.error.message}")

        # Combine all OCR text and convert to lowercase
        if texts:
            full_text = texts[0].description.lower()
            detected_words = full_text.split()
    else:
        # Simulated OCR: choose random items to simulate a scan
        mock_grocery_trips = [
            ["beef", "milk", "cheese", "plastic bottle"],
            ["apples", "bananas", "spinach", "lentils"],
            ["tomatoes", "beef", "avocado", "milk"],
            ["bananas", "cheese", "tomatoes", "plastic bottle"]
        ]
        detected_words = random.choice(mock_grocery_trips)

    # Search for items in carbon database
    scanned_items = []
    total_co2 = 0.0

    # Match items
    for word in CARBON_DATABASE.keys():
        # Match word in OCR detections
        if any(word in dw for dw in detected_words):
            db_item = CARBON_DATABASE[word]
            scanned_items.append({
                "name": word.capitalize(),
                "co2": db_item["co2"],
                "alternative": db_item["alternative"],
                "alt_co2": db_item["alt_co2"],
                "is_eco": db_item["is_eco"]
            })
            total_co2 += db_item["co2"]

    # Fallback if no matching items found
    if not scanned_items:
        scanned_items = [
            {"name": "Local Apples", "co2": 0.4, "alternative": "Local Apples", "alt_co2": 0.4, "is_eco": True},
            {"name": "Lentils", "co2": 0.9, "alternative": "Lentils", "alt_co2": 0.9, "is_eco": True}
        ]
        total_co2 = 1.3

    return {
        "store_name": "EcoMart Grocery Store" if not config.USE_GCP else "Detected Store",
        "total_co2": round(total_co2, 2),
        "items": scanned_items
    }

def calculate_onboarding_footprint(data) -> float:
    """Calculates initial yearly CO2 footprint in kg based on user questionnaire."""
    # 1. Transport Footprint (kg CO2/year)
    # Emission factors: car = 0.18 kg/km, metro = 0.03 kg/km, bike/walk = 0
    transport_emission = 0.0
    if data.transport_mode == "car":
        transport_emission = data.weekly_commute_km * 52 * 0.18
    elif data.transport_mode == "metro":
        transport_emission = data.weekly_commute_km * 52 * 0.03

    # Flights footprint: average 500 kg CO2 per medium flight
    flight_emission = data.flights_per_year * 500.0

    # 2. Diet Footprint (kg CO2/year)
    # Estimates: vegan = 1000 kg, vegetarian = 1500 kg, balanced = 2500 kg, meat_heavy = 3500 kg
    diet_emission = 2500.0
    if data.diet_type == "vegan":
        diet_emission = 1000.0
    elif data.diet_type == "vegetarian":
        diet_emission = 1500.0
    elif data.diet_type == "meat_heavy":
        diet_emission = 3500.0

    # 3. Energy Footprint (kg CO2/year)
    # Estimate: $1 of electricity bill = 4 kg CO2 (approximate average grid emission)
    energy_emission = data.electricity_bill * 12 * 4.0

    # 4. Recycling footprint adjustment
    recycle_discount = 0.0
    if data.recycle_frequency == "always":
        recycle_discount = -300.0
    elif data.recycle_frequency == "sometimes":
        recycle_discount = -100.0

    total_yearly_footprint = transport_emission + flight_emission + diet_emission + energy_emission + recycle_discount
    
    # Bound it to a realistic minimum of 500 kg CO2/year
    return max(500.0, round(total_yearly_footprint, 2))
