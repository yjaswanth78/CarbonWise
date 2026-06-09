from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import json
import shutil
from datetime import datetime

from .database import engine, Base, get_db
from . import models, schemas, services, config

from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CarbonWise Backend API")

# Add GZip compression for efficiency
app.add_middleware(GZipMiddleware, minimum_size=1000)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Add CORS Middleware to connect with React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:8000",
        "https://carbonwise-365027537314.us-central1.run.app"
    ],  # Strict origins for security
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Serve local uploads folder
app.mount("/uploads", StaticFiles(directory=config.UPLOAD_DIR), name="uploads")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is secure and efficient!"}

# Populate Default Quests in DB on Startup
@app.on_event("startup")
def startup_populate_quests():
    db = next(get_db())
    default_quests = [
        {
            "id": 1,
            "title": "Low-Carbon Commute",
            "description": "Took the metro, bus, or rode a bicycle to work/college instead of driving.",
            "category": "Travel",
            "co2_reward": 5.4,
            "points_reward": 50,
            "is_daily": True
        },
        {
            "id": 2,
            "title": "Unplug Phantom Hogs",
            "description": "Walked around the house and unplugged chargers, TVs, and appliances not in use.",
            "category": "Home-Audit",
            "co2_reward": 1.2,
            "points_reward": 30,
            "is_daily": True
        },
        {
            "id": 3,
            "title": "Green Plate",
            "description": "Ate a fully plant-based meal today.",
            "category": "Diet",
            "co2_reward": 2.1,
            "points_reward": 40,
            "is_daily": True
        },
        {
            "id": 4,
            "title": "Eco-Lending",
            "description": "Borrowed an item or tool from a neighbor instead of buying it new.",
            "category": "Eco-Xchange",
            "co2_reward": 15.0,
            "points_reward": 100,
            "is_daily": False
        }
    ]
    
    for q in default_quests:
        existing = db.query(models.Quest).filter(models.Quest.id == q["id"]).first()
        if not existing:
            db_quest = models.Quest(**q)
            db.add(db_quest)
    db.commit()

# --- AUTH & USER PROFILE ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = models.User(username=user.username, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/api/auth/profile/{username}", response_model=schemas.UserResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/auth/onboard/{username}", response_model=schemas.UserResponse)
def onboard_user(username: str, data: schemas.OnboardingData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    calculated_footprint = services.calculate_onboarding_footprint(data)
    user.co2_debt = calculated_footprint
    user.eco_points += 100  # Onboarding bonus points
    db.commit()
    db.refresh(user)
    return user

# --- QUESTS & ACTIONS ENDPOINTS ---

@app.get("/api/quests", response_model=List[schemas.QuestResponse])
def get_quests(db: Session = Depends(get_db)):
    return db.query(models.Quest).all()

@app.post("/api/quests/complete", response_model=schemas.UserResponse)
def complete_quest(username: str, quest_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    quest = db.query(models.Quest).filter(models.Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Log completion
    completion = models.UserQuestCompletion(user_id=user.id, quest_id=quest.id)
    db.add(completion)

    # Award carbon savings & points
    user.co2_saved = round(user.co2_saved + quest.co2_reward, 2)
    user.eco_points += quest.points_reward

    # Update badge counts based on points milestones
    user.badge_count = max(user.badge_count, user.eco_points // 150)

    db.commit()
    db.refresh(user)
    return user

# --- RECEIPT SCANNING ENDPOINTS ---

@app.post("/api/receipts/scan")
async def scan_receipt(
    username: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Save locally first
    file_extension = os.path.splitext(file.filename)[1]
    local_filename = f"{user.username}_{int(datetime.utcnow().timestamp())}{file_extension}"
    local_filepath = os.path.join(config.UPLOAD_DIR, local_filename)

    with open(local_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Upload to GCS if GCP enabled, else return local web path
    try:
        gcs_url = services.upload_to_gcs(local_filepath, f"receipts/{local_filename}")
    except Exception as e:
        # Fallback to local path if upload fails
        gcs_url = f"/uploads/{local_filename}"

    # 3. Process with OCR/Simulated OCR
    try:
        analysis = services.analyze_receipt_ocr(local_filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image scanning failed: {str(e)}")

    # 4. Save scan logs to DB
    receipt_log = models.ReceiptLog(
        user_id=user.id,
        image_url=gcs_url,
        store_name=analysis["store_name"],
        total_co2=analysis["total_co2"],
        items_json=json.dumps(analysis["items"])
    )
    db.add(receipt_log)

    # 5. Reward user: Award 50 points per receipt scan + extra for any eco items
    points_gained = 50
    co2_saved_from_eco = 0.0
    for item in analysis["items"]:
        if item["is_eco"]:
            points_gained += 15
            # Assume local eco-friendly saves about 1.5kg CO2
            co2_saved_from_eco += 1.5

    user.eco_points += points_gained
    user.co2_saved = round(user.co2_saved + co2_saved_from_eco, 2)
    user.badge_count = max(user.badge_count, user.eco_points // 150)

    db.commit()
    db.refresh(user)

    return {
        "user": {
            "username": user.username,
            "eco_points": user.eco_points,
            "co2_saved": user.co2_saved
        },
        "receipt": {
            "id": receipt_log.id,
            "store_name": receipt_log.store_name,
            "total_co2": receipt_log.total_co2,
            "image_url": receipt_log.image_url,
            "items": analysis["items"]
        }
    }

@app.get("/api/receipts/history/{username}", response_model=List[schemas.ReceiptResponse])
def get_receipt_history(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_receipts = db.query(models.ReceiptLog).filter(models.ReceiptLog.user_id == user.id).all()
    
    results = []
    for r in db_receipts:
        results.append({
            "id": r.id,
            "store_name": r.store_name,
            "total_co2": r.total_co2,
            "image_url": r.image_url,
            "items": json.loads(r.items_json),
            "created_at": r.created_at
        })
    return results

# --- ECO-XCHANGE P2P ENDPOINTS ---

@app.get("/api/xchange", response_model=List[schemas.XchangeItemResponse])
def list_xchange_items(db: Session = Depends(get_db)):
    items = db.query(models.XchangeItem).all()
    results = []
    for item in items:
        results.append({
            "id": item.id,
            "owner_id": item.owner_id,
            "borrower_id": item.borrower_id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "co2_avoided": item.co2_avoided,
            "is_available": item.is_available,
            "owner_username": item.owner.username,
            "borrower_username": item.borrower.username if item.borrower else None
        })
    return results

@app.post("/api/xchange/post", response_model=schemas.XchangeItemResponse)
def post_xchange_item(
    username: str,
    item: schemas.XchangeItemCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_item = models.XchangeItem(
        owner_id=user.id,
        title=item.title,
        description=item.description,
        category=item.category,
        co2_avoided=item.co2_avoided,
        is_available=True
    )
    db.add(new_item)
    
    # Award points for contributing to community
    user.eco_points += 75
    db.commit()
    db.refresh(new_item)
    
    return {
        "id": new_item.id,
        "owner_id": new_item.owner_id,
        "borrower_id": None,
        "title": new_item.title,
        "description": new_item.description,
        "category": new_item.category,
        "co2_avoided": new_item.co2_avoided,
        "is_available": new_item.is_available,
        "owner_username": user.username
    }

@app.post("/api/xchange/borrow", response_model=schemas.XchangeItemResponse)
def borrow_item(
    username: str,
    request: schemas.BorrowRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    item = db.query(models.XchangeItem).filter(models.XchangeItem.id == request.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if not item.is_available:
        raise HTTPException(status_code=400, detail="Item is already borrowed")

    if item.owner_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot borrow your own item")

    # Update item status
    item.is_available = False
    item.borrower_id = user.id

    # Award carbon savings & points to borrower
    user.co2_saved = round(user.co2_saved + item.co2_avoided, 2)
    user.eco_points += 50
    user.badge_count = max(user.badge_count, user.eco_points // 150)

    # Award points to owner for sharing
    owner = item.owner
    owner.eco_points += 50
    owner.badge_count = max(owner.badge_count, owner.eco_points // 150)

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "owner_id": item.owner_id,
        "borrower_id": item.borrower_id,
        "title": item.title,
        "description": item.description,
        "category": item.category,
        "co2_avoided": item.co2_avoided,
        "is_available": item.is_available,
        "owner_username": owner.username,
        "borrower_username": user.username
    }

# --- LEADERBOARD ENDPOINTS ---

@app.get("/api/leaderboard", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    # Rank users by carbon saved, secondary by eco points
    return db.query(models.User).order_by(models.User.co2_saved.desc(), models.User.eco_points.desc()).limit(10).all()

# --- SERVE REACT FRONTEND ---
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    # Prevent API 404s from returning HTML
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
        
    file_path = os.path.join(frontend_dist, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Frontend not built. Please run npm run build in the frontend directory."}
