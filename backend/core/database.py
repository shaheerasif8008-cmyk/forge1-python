from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import sqlite3

from core.config import settings

# SQLite specific configuration for foreign keys
@sqlite3.register_adapter(list, lambda x: str(x))
@sqlite3.register_adapter(dict, lambda x: str(x))

# Create engine with SQLite specific settings
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=settings.debug
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Metadata for Alembic
metadata = MetaData()

def get_db() -> Session:
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)