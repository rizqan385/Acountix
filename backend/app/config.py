import os
from dotenv import load_dotenv
from google import genai
from supabase import create_client, Client

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Bro, cek lagi file .env lu! Ada key yang belum keisi itu.")

# Narrow type: str | None -> str buat static analysis
assert GEMINI_API_KEY is not None
assert SUPABASE_URL is not None
assert SUPABASE_KEY is not None

# Inisialisasi client yang siap diekspor ke file lain
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Groq client (opsional — fallback kalau Gemini kena rate limit)
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[INFO] ✅ Groq client siap sebagai fallback!")
    except ImportError:
        print("[WARNING] Package 'groq' belum terinstall. Groq fallback tidak aktif.")