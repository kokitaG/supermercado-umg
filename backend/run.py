import uvicorn
import os
from app.config import PORT, HOST

if __name__ == "__main__":
    print(f"Iniciando Servidor Backend FastAPI en http://{HOST}:{PORT}")
    print(f"Documentación Swagger interactiva: http://localhost:{PORT}/docs")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
