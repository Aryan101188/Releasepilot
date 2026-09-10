from sqlalchemy import Column, Integer, String, Boolean
from backend.database import Base

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    enabled = Column(Boolean, default=False)
    rollout_percentage = Column(Integer, default=0)