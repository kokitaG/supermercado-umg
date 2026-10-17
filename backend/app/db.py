from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Motor de conexión SQLAlchemy con ping preventivo
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    """Generador de sesiones para inyección de dependencias en FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
