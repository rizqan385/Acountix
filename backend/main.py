from fastapi import FastAPI
from pydantic import BaseModel

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="Acountix API",
    description="Backend Engine Parser Soal Akuntansi Manufaktur",
    version="1.0.0"
)

# Model data (Pydantic) buat nampung input dari frontend
class SoalRequest(BaseModel):
    text: str

# 1. Endpoint Test Paling Dasar (Root)
@app.get("/")
def read_root():
    return {
        "status": "success",
        "message": "Backend Acountix siap nge-gas, Rizqan!"
    }

# 2. Endpoint Simulasi Nerima Soal dari Frontend
@app.post("/api/parse-soal")
def parse_soal(payload: SoalRequest):
    # Sementara kita return balik teks yang dikirim frontend buat ngetes
    return {
        "status": "received",
        "total_karakter": len(payload.text),
        "preview_soal": payload.text[:100] + "..." if len(payload.text) > 100 else payload.text
    }