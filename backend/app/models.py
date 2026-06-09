from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    co2_debt = Column(Float, default=8500.0)  # Initial carbon footprint in kg CO2/year
    co2_saved = Column(Float, default=0.0)    # Saved/offset carbon in kg
    eco_points = Column(Integer, default=0)    # Points for gamification
    badge_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    completions = relationship("UserQuestCompletion", back_populates="user")
    xchange_items = relationship("XchangeItem", foreign_keys="XchangeItem.owner_id", back_populates="owner")
    borrowed_items = relationship("XchangeItem", foreign_keys="XchangeItem.borrower_id", back_populates="borrower")
    receipts = relationship("ReceiptLog", back_populates="user")

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Travel, Diet, Home-Audit, Eco-Xchange
    co2_reward = Column(Float, nullable=False)  # kg of CO2 saved
    points_reward = Column(Integer, nullable=False)
    is_daily = Column(Boolean, default=True)

class UserQuestCompletion(Base):
    __tablename__ = "user_quest_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quest_id = Column(Integer, ForeignKey("quests.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="completions")
    quest = relationship("Quest")

class XchangeItem(Base):
    __tablename__ = "xchange_items"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Tools, Outdoor, Appliances, Books, etc.
    is_available = Column(Boolean, default=True)
    co2_avoided = Column(Float, default=15.0)  # Average production CO2 saved by borrowing

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="xchange_items")
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="borrowed_items")

class ReceiptLog(Base):
    __tablename__ = "receipt_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    store_name = Column(String, default="Unknown Store")
    total_co2 = Column(Float, default=0.0)
    items_json = Column(String, nullable=False)  # Stringified JSON array of items
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="receipts")
