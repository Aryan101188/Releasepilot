from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    feature_id = Column(Integer)
    action = Column(String)
    old_value = Column(String)
    new_value = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)