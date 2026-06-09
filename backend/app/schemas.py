from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    co2_debt: float
    co2_saved: float
    eco_points: int
    badge_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Quest Schemas
class QuestBase(BaseModel):
    title: str
    description: str
    category: str
    co2_reward: float
    points_reward: int
    is_daily: bool

class QuestResponse(QuestBase):
    id: int

    class Config:
        from_attributes = True

# Quest Completion Schema
class QuestCompletionCreate(BaseModel):
    quest_id: int

# P2P Sharing Schemas
class XchangeItemBase(BaseModel):
    title: str
    description: str
    category: str
    co2_avoided: float

class XchangeItemCreate(XchangeItemBase):
    pass

class XchangeItemResponse(XchangeItemBase):
    id: int
    owner_id: int
    borrower_id: Optional[int] = None
    is_available: bool
    owner_username: Optional[str] = None
    borrower_username: Optional[str] = None

    class Config:
        from_attributes = True

class BorrowRequest(BaseModel):
    item_id: int

# Receipt Schemas
class ReceiptItem(BaseModel):
    name: str
    co2: float
    alternative: str
    alt_co2: float
    is_eco: bool

class ReceiptResponse(BaseModel):
    id: int
    store_name: str
    total_co2: float
    image_url: str
    items: List[ReceiptItem]
    created_at: datetime

# Onboarding Questionnaire Input Schema
class OnboardingData(BaseModel):
    transport_mode: str  # car, metro, bike, walk
    weekly_commute_km: float
    flights_per_year: int
    diet_type: str  # vegan, vegetarian, meat_heavy, balanced
    recycle_frequency: str  # always, sometimes, never
    electricity_bill: float  # average monthly USD / currency
