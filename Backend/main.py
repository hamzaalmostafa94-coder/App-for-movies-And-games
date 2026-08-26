import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ==========================================
# 1. الإعدادات الأمنية (Security Settings)
# ==========================================
SECRET_KEY = "Lord_System_Ultra_Secure_Key_2026_!@#" # مفتاح تشفير معقد
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # الجلسة تنتهي بعد 24 ساعة

# كلمة السر المشفرة للأدمن (الكلمة الأصلية هي: 123456)
# استخدمنا Hash لكي لا تكون مكشوفة في الكود
ADMIN_PASSWORD_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq" 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# حماية من هجمات الإغراق (Rate Limiter)
limiter = Limiter(key_func=get_remote_address)

# ==========================================
# 2. إعداد قاعدة البيانات 
# ==========================================
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./requests.db")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBRequest(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    customer_phone = Column(String)
    content_type = Column(String, index=True)
    content_name = Column(String, index=True)
    details = Column(String, nullable=True)
    part_number = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 3. إعداد الخادم المحصن (FastAPI)
# ==========================================
app = FastAPI(title="خادم تطبيق المحتوى - النسخة الآمنة")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# حماية الـ CORS (لا يقبل الطلبات إلا من موقعك الرسمي)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://movies-and-games.netlify.app", # ⚠️ ضع رابط موقعك هنا
        "http://localhost:3000", # مسموح محلياً أثناء التطوير
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 4. دوال الحماية والمصادقة
# ==========================================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="غير مصرح لك بالدخول", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "admin":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

# ==========================================
# 5. النماذج (Pydantic Models)
# ==========================================
class RequestCreate(BaseModel):
    customer_name: str
    customer_phone: str
    content_type: str
    content_name: str
    details: Optional[str] = None
    part_number: Optional[str] = None

class RequestResponse(RequestCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# ==========================================
# 6. الروابط (Endpoints)
# ==========================================

# رابط تسجيل الدخول (للحصول على مفتاح JWT)
@app.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != "admin" or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=400, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    access_token = create_access_token(
        data={"sub": "admin"}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# رابط استقبال الطلبات من العميل (محمي من الإغراق: 5 طلبات في الدقيقة كحد أقصى)
@app.post("/api/requests/", response_model=RequestResponse)
@limiter.limit("5/minute")
def create_request(request_data: RequestCreate, req: Request, db: Session = Depends(get_db)):
    data_dict = request_data.model_dump() if hasattr(request_data, 'model_dump') else request_data.dict()
    db_request = DBRequest(**data_dict)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

# روابط الأدمن (محمية بالكامل ولا تفتح إلا بمفتاح JWT)
@app.get("/api/requests/", response_model=List[RequestResponse])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    return db.query(DBRequest).order_by(DBRequest.created_at.desc()).offset(skip).limit(limit).all()

@app.put("/api/requests/{request_id}/status")
def update_request_status(request_id: int, status: str, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    db_request.status = status
    db.commit()
    db.refresh(db_request)
    return {"message": "تم تحديث الحالة بنجاح", "request": db_request}