from fastapi import FastAPI
from pydantic import BaseModel
import hashlib

from backend.database import Base, engine, SessionLocal
from backend.models.feature import FeatureFlag
from backend.models.audit import AuditLog
from fastapi.middleware.cors import CORSMiddleware

class EvaluateRequest(BaseModel):
    feature: str
    user_id: str


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_bucket(feature, user_id):
    value = feature + ":" + user_id

    hash_value = hashlib.sha256(value.encode()).hexdigest()

    number = int(hash_value, 16)

    bucket = number % 100

    return bucket


class FeatureCreate(BaseModel):
    key: str
    enabled: bool
    rollout_percentage: int


@app.post("/features")
def create_feature(request: FeatureCreate):

    db = SessionLocal()

    feature = FeatureFlag(
        key=request.key,
        enabled=request.enabled,
        rollout_percentage=request.rollout_percentage
    )

    db.add(feature)
    db.commit()
    db.refresh(feature)

    db.close()

    return {
        "id": feature.id,
        "key": feature.key,
        "enabled": feature.enabled,
        "rollout_percentage": feature.rollout_percentage
    }
@app.get("/")
def home():
    return {"message": "ReleasePilot is running"}


@app.post("/evaluate")
def evaluate(request: EvaluateRequest):

    db = SessionLocal()

    feature = db.query(FeatureFlag).filter(
        FeatureFlag.key == request.feature
    ).first()

    if feature is None:
        db.close()
        return {"error": "Feature not found"}

    if not feature.enabled:
        db.close()
        return {
            "feature": request.feature,
            "user_id": request.user_id,
            "enabled": False
        }

    bucket = get_bucket(request.feature, request.user_id)

    enabled = bucket < feature.rollout_percentage

    db.close()

    return {
        "feature": request.feature,
        "user_id": request.user_id,
        "bucket": bucket,
        "rollout_percentage": feature.rollout_percentage,
        "enabled": enabled
    }
@app.get("/features")
def get_features():

    db = SessionLocal()

    features = db.query(FeatureFlag).all()

    db.close()

    return features
class FeatureUpdate(BaseModel):
    enabled: bool
    rollout_percentage: int


@app.put("/features/{feature_id}")
def update_feature(feature_id: int, request: FeatureUpdate):

    db = SessionLocal()

    feature = db.query(FeatureFlag).filter(
        FeatureFlag.id == feature_id
    ).first()

    if feature is None:
        db.close()
        return {"error": "Feature not found"}

    old_value = f"enabled={feature.enabled}, rollout={feature.rollout_percentage}"

    feature.enabled = request.enabled
    feature.rollout_percentage = request.rollout_percentage

    new_value = f"enabled={feature.enabled}, rollout={feature.rollout_percentage}"

    log = AuditLog(
        feature_id=feature.id,
        action="UPDATE",
        old_value=old_value,
        new_value=new_value
    )

    db.add(log)
    db.commit()
    db.refresh(feature)

    db.close()

    return {
        "id": feature.id,
        "key": feature.key,
        "enabled": feature.enabled,
        "rollout_percentage": feature.rollout_percentage
    }
@app.post("/features/{feature_id}/rollback")
def rollback_feature(feature_id: int):

    db = SessionLocal()

    feature = db.query(FeatureFlag).filter(
        FeatureFlag.id == feature_id
    ).first()

    if feature is None:
        db.close()
        return {"error": "Feature not found"}

    feature_key = feature.key

    old_value = f"enabled={feature.enabled}, rollout={feature.rollout_percentage}"

    feature.enabled = False
    feature.rollout_percentage = 0

    log = AuditLog(
        feature_id=feature.id,
        action="ROLLBACK",
        old_value=old_value,
        new_value="enabled=False, rollout=0"
    )

    db.add(log)
    db.commit()

    db.close()

    return {
        "message": "Feature rolled back",
        "feature": feature_key,
        "enabled": False,
        "rollout_percentage": 0
    }
@app.get("/audit-logs")
def get_audit_logs():

    db = SessionLocal()

    logs = db.query(AuditLog).all()

    db.close()

    return logs
