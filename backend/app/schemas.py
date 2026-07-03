from pydantic import BaseModel
from typing import List, Optional


class SoalRequest(BaseModel):
    text: str


class ChatRequest(BaseModel):
    """Request buat endpoint /api/chat — terima pesan + nama user"""
    message: str
    user_name: str


class EntriJurnal(BaseModel):
    tanggal: str
    akun_debit: str
    nominal_debit: float
    akun_kredit: str
    nominal_kredit: float


class AkunSaldo(BaseModel):
    akun: str
    debit: float
    kredit: float


class KomponenLaporan(BaseModel):
    keterangan: str
    nominal: float


class HasilParserAkuntansi(BaseModel):
    nama_perusahaan: str
    periode: str
    daftar_jurnal: List[EntriJurnal]
    neraca_saldo: Optional[List[AkunSaldo]] = None
    laporan_harga_pokok_produksi: Optional[List[KomponenLaporan]] = None
    laporan_harga_pokok_penjualan: Optional[List[KomponenLaporan]] = None


class ResponAIPintar(BaseModel):
    is_akuntansi: bool
    pesan_balasan: str
    data_akuntansi: Optional[HasilParserAkuntansi] = None


class ChatResponse(BaseModel):
    """
    Response dari /api/chat dan /api/chat-with-file
    - type "chat" = ngobrol biasa, ga ada data jurnal
    - type "jurnal" = AI nge-parse soal akuntansi, ada data jurnal + disimpan ke Supabase
    """
    type: str  # "chat" atau "jurnal"
    message: str
    data: Optional[HasilParserAkuntansi] = None
    excel_url: Optional[str] = None  # URL download Excel kalau ada
