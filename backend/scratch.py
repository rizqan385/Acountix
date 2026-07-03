import re

with open("app/main.py", "r") as f:
    content = f.read()

start_marker = "# ===== ENDPOINT UTAMA: CHAT PINTAR ====="
end_marker = "# ===== ENDPOINT DOWNLOAD EXCEL ====="

new_logic = """# ===== HELPER: Proses AI Pintar (Unified) =====
def _process_ai_pintar(text_input: str, user_name: str, from_file: str = "") -> ChatResponse:
    prompt_instruksi = f'''
    Lu adalah Acountix, asisten AI akuntansi manufaktur yang super friendly, lucu, dan kece. 
    Tugas lu adalah membaca input dari user (bisa berupa chat biasa atau file berisi soal akuntansi)
    dan memberikan respons yang sesuai dalam format JSON terstruktur.

    Aturan:
    1. Tentukan apakah input berisi SOAL/TUGAS AKUNTANSI (ada transaksi, pembelian, nominal, dsb) atau KONTEN/CHAT BIASA.
    2. Jika KONTEN BIASA:
       - Set `is_akuntansi` = false
       - Isi `pesan_balasan` dengan obrolan asyik, penjelasan materi, atau sapaan ramah. Panggil user "{user_name}".
       - `data_akuntansi` biarkan kosong (null).
    3. Jika SOAL AKUNTANSI:
       - Set `is_akuntansi` = true
       - Isi `pesan_balasan` dengan pesan semangat atau sapaan singkat yang seru.
       - Isi `data_akuntansi` dengan parsing jurnal lengkap:
         - Jurnal Umum (HARUS balance, akrual ke 'Utang Beban', COA standar)
         - Neraca Saldo (jika ada data)
         - Laporan HPP & HPPenjualan (jika ada data)
         - Jika ada informasi nama perusahaan dan periode, masukkan ke data_akuntansi.
         - Kalau nama perusahaan ga disebut, pake "Perusahaan Tidak Diketahui".
         - Kalau periode ga disebut, pake bulan dan tahun sekarang.

    Input dari {user_name} / Isi File:
    {text_input}
    '''

    response = generate_content_with_retry(
        model='gemini-2.5-flash',
        contents=prompt_instruksi,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResponAIPintar,
            temperature=0.1
        ),
    )

    if not response or not response.text:
        raise ValueError("AI tidak mengembalikan respons teks. Coba lagi.")
    
    ai_result = json.loads(response.text)
    
    if not ai_result.get("is_akuntansi"):
        return ChatResponse(
            type="chat",
            message=ai_result.get("pesan_balasan", "Hmm, aku nggak ngerti nih maksudnya apa.").strip(),
            data=None
        )
    
    # Kalau soal akuntansi
    data_hasil_ai = ai_result.get("data_akuntansi")
    if not data_hasil_ai or not data_hasil_ai.get('daftar_jurnal'):
        return ChatResponse(
            type="chat",
            message=ai_result.get("pesan_balasan", "Maaf banget, aku nggak nemu transaksi jurnal yang valid di dalamnya 😭"),
            data=None
        )

    # Validasi balance
    total_debit = sum(j.get('nominal_debit', 0) for j in data_hasil_ai.get('daftar_jurnal', []))
    total_kredit = sum(j.get('nominal_kredit', 0) for j in data_hasil_ai.get('daftar_jurnal', []))

    if total_debit != total_kredit:
        raise HTTPException(status_code=400, detail="Transaksi Gak Balance, Bro!")

    # Simpan ke Supabase
    for jurnal in data_hasil_ai['daftar_jurnal']:
        data_insert = {
            "nama_perusahaan": data_hasil_ai.get('nama_perusahaan', ''),
            "periode": data_hasil_ai.get('periode', ''),
            "tanggal": jurnal.get('tanggal', ''),
            "akun_debit": jurnal.get('akun_debit', ''),
            "nominal_debit": jurnal.get('nominal_debit', 0),
            "akun_kredit": jurnal.get('akun_kredit', ''),
            "nominal_kredit": jurnal.get('nominal_kredit', 0)
        }
        supabase.table("jurnal_akuntansi").insert(data_insert).execute()

    # Generate Excel
    excel_filename = generate_excel(data_hasil_ai, user_name)
    excel_url = f"/files/{excel_filename}"

    # Bikin pesan respons
    nama = data_hasil_ai.get('nama_perusahaan', '')
    periode = data_hasil_ai.get('periode', '')
    jumlah = len(data_hasil_ai['daftar_jurnal'])
    file_info = f"\\n📎 Sumber: File {from_file}" if from_file else ""

    pesan_fun = (
        f"{ai_result.get('pesan_balasan', 'Beres nih!')} ✨{file_info}\\n\\n"
        f"📋 Perusahaan: {nama}\\n"
        f"📅 Periode: {periode}\\n"
        f"📝 Total {jumlah} entri jurnal\\n"
        f"💰 Total Debit & Kredit: Rp {total_debit:,.0f}\\n"
        f"✅ Status: Jurnal BALANCE & tersimpan di database!\\n\\n"
        f"📥 File Excel juga udah gue siapin lengkap dengan:\\n"
        f"   • Jurnal Umum\\n"
        f"   • Neraca Saldo (jika ada)\\n"
        f"   • Laporan Harga Pokok Produksi (jika ada)\\n"
        f"   • Laporan Harga Pokok Penjualan (jika ada)\\n\\n"
        f"Download Excel-nya di bawah ya~ 👇"
    )

    return ChatResponse(
        type="jurnal",
        message=pesan_fun,
        data=HasilParserAkuntansi(**data_hasil_ai),
        excel_url=excel_url
    )


# ===== ENDPOINT UTAMA: CHAT PINTAR =====
@app.post("/api/chat", response_model=ChatResponse)
def chat_pintar(payload: ChatRequest):
    try:
        return _process_ai_pintar(payload.message, payload.user_name)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== ENDPOINT BARU: CHAT DENGAN FILE =====
@app.post("/api/chat-with-file", response_model=ChatResponse)
async def chat_dengan_file(
    file: UploadFile = File(...),
    message: str = Form(default=""),
    user_name: str = Form(default="User"),
):
    # Validasi file
    allowed_extensions = {'.doc', '.docx', '.txt', '.pdf', '.xlsx', '.xls', '.csv'}
    ext = Path(file.filename or '').suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Format file '{ext}' belum didukung. Coba pake: {', '.join(allowed_extensions)}"
        )

    # Simpan file sementara
    file_id = uuid.uuid4().hex[:12]
    safe_filename = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Extract teks dari file
        extracted_text = extract_text_from_file(str(file_path), file.filename or "")

        if not extracted_text or len(extracted_text.strip()) < 10:
            raise ValueError("File sepertinya kosong atau tidak bisa dibaca. Coba file lain ya!")

        # Gabungkan dengan pesan user (kalau ada)
        full_context = f"ISI FILE '{file.filename}':\\n{extracted_text}"
        if message.strip():
            full_context = f"Pesan dari user: {message}\\n\\n{full_context}"
            
        return _process_ai_pintar(full_context, user_name, from_file=file.filename or "file")

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup uploaded file
        if file_path.exists():
            file_path.unlink()


"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_logic + content[end_idx:]
    with open("app/main.py", "w") as f:
        f.write(new_content)
    print("Successfully replaced content!")
else:
    print("Could not find markers!")

