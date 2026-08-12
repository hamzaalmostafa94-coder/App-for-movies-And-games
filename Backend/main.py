from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 1. إعداد قاعدة بيانات SQLite (ستقوم بإنشاء ملف محلي اسمه requests.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./requests.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. هيكل جدول الطلبات (بعد إضافة بيانات العميل)
class DBRequest(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)   # اسم العميل
    customer_phone = Column(String)              # رقم العميل
    content_type = Column(String, index=True)
    content_name = Column(String, index=True)
    details = Column(String, nullable=True)
    part_number = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

# إنشاء الجدول في قاعدة البيانات
Base.metadata.create_all(bind=engine)

# 3. إعداد الخادم والسماح بالاتصال من React
app = FastAPI(title="خادم تطبيق المحتوى الأسطوري")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # يسمح لأي واجهة بالاتصال (مثل تطبيق React الخاص بنا)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. نماذج التحقق من البيانات (Pydantic)
class RequestCreate(BaseModel):
    customer_name: str
    customer_phone: str
    content_type: str
    content_name: str
    details: Optional[str] = None
    part_number: Optional[str] = None
    image_url: Optional[str] = None

class RequestResponse(RequestCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. الروابط (Endpoints)
@app.post("/api/requests/", response_model=RequestResponse)
def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    db_request = DBRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/api/requests/", response_model=List[RequestResponse])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(DBRequest).order_by(DBRequest.created_at.desc()).offset(skip).limit(limit).all()

@app.put("/api/requests/{request_id}/status")
def update_request_status(request_id: int, status: str, db: Session = Depends(get_db)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    
    db_request.status = status
    db.commit()
    db.refresh(db_request)
    return {"message": "تم تحديث الحالة بنجاح", "request": db_request}