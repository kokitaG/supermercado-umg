import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv(override=True)

# URL cruda desde variables de entorno
_raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./supermercado.db")

# Detección automática del driver instalado (psycopg v3 o psycopg2)
_driver_prefix = "postgresql+psycopg2://"
try:
    import psycopg
    _driver_prefix = "postgresql+psycopg://"
except ImportError:
    try:
        import psycopg2
        _driver_prefix = "postgresql+psycopg2://"
    except ImportError:
        _driver_prefix = "postgresql://"

# Reemplazo seguro del prefijo si es PostgreSQL
if _raw_db_url.startswith("postgresql://") or _raw_db_url.startswith("postgres://"):
    if _raw_db_url.startswith("postgresql://"):
        DATABASE_URL = _raw_db_url.replace("postgresql://", _driver_prefix, 1)
    else:
        DATABASE_URL = _raw_db_url.replace("postgres://", _driver_prefix, 1)
else:
    DATABASE_URL = _raw_db_url

# Codificación segura de caracteres especiales en la contraseña (?, &, %, @, etc.)
if "://" in DATABASE_URL and "@" in DATABASE_URL:
    try:
        scheme, rest = DATABASE_URL.split("://", 1)
        creds, host_part = rest.rsplit("@", 1)
        if ":" in creds:
            user, pwd = creds.split(":", 1)
            pwd_clean = urllib.parse.unquote(pwd)
            pwd_encoded = urllib.parse.quote_plus(pwd_clean)
            DATABASE_URL = f"{scheme}://{user}:{pwd_encoded}@{host_part}"
    except Exception:
        pass

SECRET_KEY = os.getenv("SECRET_KEY", "supermercado_umg_secret_key_2026_segura_jwt")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Clase Settings para compatibilidad con el estilo settings.database_url
class Settings:
    @property
    def database_url(self) -> str:
        return DATABASE_URL

    @property
    def DATABASE_URL(self) -> str:
        return DATABASE_URL

    SECRET_KEY: str = SECRET_KEY
    ALGORITHM: str = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES: int = ACCESS_TOKEN_EXPIRE_MINUTES
    PORT: int = PORT
    HOST: str = HOST

settings = Settings()
