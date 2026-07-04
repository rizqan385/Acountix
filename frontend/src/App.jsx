import { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from '../components/Sidebar';
import FormSoal from '../components/FormSoal';
import TabelJurnal from '../components/TabelJurnal';
import StatusBadge from '../components/StatusBadge';
import JurnalService from '../services/JurnalService';
import { generateId, truncateText } from '../utils/formatter';

// ===== CONSTANTS =====
const STORAGE_KEYS = {
  USER_NAME: 'acountix_user_name',
  CHAT_HISTORY: 'acountix_chat_history',
};

// Panggilan imut buat nama user biar lebih fun ✨
const CUTE_SUFFIXES = [
  'sayang', 'kece', 'ganteng', 'cantik', 'bestie',
  'darling', 'beb', 'cuy', 'jagoan', 'si paling rajin',
  'kesayangan Acountix', 'si jenius akuntansi', 'bos',
  'sunshine', 'superstar', 'si rajin hitung',
];

const CUTE_GREETINGS = [
  (name) => `Hai hai ${name} sayang! 💖`,
  (name) => `Yeay, ${name} kece dateng lagi! ✨`,
  (name) => `Halo ${name} bestie! Kangen deh~ 🌸`,
  (name) => `Welcome back ${name} darling! 💕`,
  (name) => `${name} si paling rajin nongol nih! 🌟`,
  (name) => `Aaa ${name} sayang, sini sini! 🫶`,
  (name) => `Hai ${name} sunshine! Mau ngerjain apa hari ini? ☀️`,
  (name) => `${name} kesayangan Acountix udah dateng! 💗`,
];

const getCuteName = (name) => {
  const suffix = CUTE_SUFFIXES[Math.floor(Math.random() * CUTE_SUFFIXES.length)];
  return `${name} ${suffix}`;
};

const getCuteGreeting = (name) => {
  const greeting = CUTE_GREETINGS[Math.floor(Math.random() * CUTE_GREETINGS.length)];
  return greeting(name);
};

// ===== WELCOME SCREEN =====
function WelcomeScreen({ onSubmit }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="welcome-screen">
      {/* Background orbs */}
      <div className="welcome-bg-orb welcome-bg-orb-1"></div>
      <div className="welcome-bg-orb welcome-bg-orb-2"></div>

      <div className="welcome-card glass animate-fade-in-up">
        <div className="welcome-logo gradient-pink animate-float">
          🧮
        </div>
        <h1 className="welcome-title gradient-text">
          Selamat Datang di Acountix
        </h1>
        <p className="welcome-subtitle">
          AI Akuntan Pintar yang siap bantu kamu menganalisis soal akuntansi manufaktur dan membuat jurnal secara otomatis.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="welcome-input-group">
            <input
              ref={inputRef}
              type="text"
              className="welcome-input"
              placeholder="Masukkan nama kamu..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="welcome-name-input"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="welcome-btn gradient-pink"
            disabled={!name.trim()}
            id="welcome-start-btn"
          >
            Mulai Sekarang 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== CHAT EMPTY STATE =====
function ChatEmptyState({ userName, onHintClick }) {
  const hints = [
    'PT Maju Jaya membeli bahan baku Rp 50.000.000 secara kredit tanggal 5 Jan 2024',
    'Buatkan jurnal umum untuk pembelian mesin produksi Rp 200 juta tunai',
    'Pabrik tekstil membayar gaji buruh langsung Rp 35 juta dan overhead Rp 15 juta',
    'Catat transaksi penjualan barang jadi Rp 100 juta kredit, HPP Rp 70 juta',
  ];

  return (
    <div className="chat-empty animate-fade-in">
      <div className="chat-empty-icon gradient-pink-subtle animate-pulse-glow">
        ✨
      </div>
      <h2 className="chat-empty-title gradient-text">
        {getCuteGreeting(userName)}
      </h2>
      <p className="chat-empty-desc">
        Ketik soal akuntansi manufaktur dalam bahasa sehari-hari, dan Acountix AI akan mengubahnya menjadi jurnal akuntansi yang rapi dan balance. Gampang banget kan~ 💅
      </p>
      <div className="chat-empty-hints">
        {hints.map((hint, i) => (
          <div
            key={i}
            className="chat-hint-card"
            onClick={() => onHintClick(hint)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            💡 {truncateText(hint, 70)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TYPING INDICATOR =====
function TypingIndicator() {
  return (
    <div className="typing-indicator animate-fade-in">
      <div className="chat-avatar chat-avatar-ai">🤖</div>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
}

// API URL for download links
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ===== CHAT MESSAGE =====
function ChatMessage({ message, userName }) {
  const isUser = message.role === 'user';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user animate-slide-right' : 'chat-message-ai animate-slide-left'}`}>
      <div className={`chat-avatar ${isUser ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
        {isUser ? getInitials(userName) : '🤖'}
      </div>
      <div>
        {/* File tag for user messages with files */}
        {isUser && message.fileName && (
          <div className="chat-file-tag">
            <span className="chat-file-tag-icon">📎</span>
            {message.fileName}
          </div>
        )}
        <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
          {message.text && <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>}
          {message.status && (
            <div style={{ marginTop: '8px' }}>
              <StatusBadge status={message.status} text={message.statusText} />
            </div>
          )}
        </div>
        {/* Render journal table if AI response contains data */}
        {message.jurnalData && (
          <TabelJurnal data={message.jurnalData} />
        )}
        {/* Download Excel button */}
        {message.excelUrl && (
          <a
            href={`${API_URL}${message.excelUrl}`}
            download
            className="download-excel-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Excel 📊
          </a>
        )}
      </div>
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  // State
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem(STORAGE_KEYS.USER_NAME);
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth > 768;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const chatEndRef = useRef(null);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ===== HANDLERS =====

  const handleWelcomeSubmit = (name) => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setActiveChatId(chat.id);
      setMessages(chat.messages || []);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    }
  };

  const handleDeleteChat = (chatId) => {
    setChatHistory((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (text) => {
    if (isLoading) return;

    // Create user message
    const userMessage = {
      id: generateId(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Determine chat ID
    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = generateId();
      setActiveChatId(currentChatId);
    }

    try {
      // Call AI Chat endpoint — dia yang bedain mau ngobrol atau soal akuntansi
      const result = await JurnalService.chat(text, userName);

      let aiMessage;

      if (result.type === 'jurnal' && result.data) {
        // AI detect soal akuntansi → tampilkan tabel jurnal
        aiMessage = {
          id: generateId(),
          role: 'ai',
          text: result.message,
          jurnalData: result.data,
          excelUrl: result.excel_url || null,
          status: 'success',
          statusText: 'Tersimpan di Supabase',
          timestamp: Date.now(),
        };
      } else {
        // Ngobrol biasa → cuma teks, ga ada jurnal
        aiMessage = {
          id: generateId(),
          role: 'ai',
          text: result.message,
          timestamp: Date.now(),
        };
      }

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Update chat history
      const chatTitle = truncateText(text, 50);
      setChatHistory((prev) => {
        const existing = prev.find((c) => c.id === currentChatId);
        if (existing) {
          return prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
              : c
          );
        }
        return [
          { id: currentChatId, title: chatTitle, messages: updatedMessages, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ];
      });

    } catch (error) {
      const errorText = error.response?.data?.detail || error.message || 'Terjadi kesalahan. Coba lagi ya!';
      const cuteName = getCuteName(userName);

      const errorMessages = [
        `Aduh maaf ya ${cuteName} 😅 Ada yang error nih:\n\n${errorText}\n\nCoba lagi yuk~ 💪`,
        `Oopsie ${cuteName}! 😣 Kayaknya ada masalah nih:\n\n${errorText}\n\nJangan nyerah ya sayang~`,
        `Waduh ${cuteName}, gagal nih 🥺\n\n${errorText}\n\nTapi tenang, coba sekali lagi pasti bisa! ✨`,
      ];
      const errorMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];

      const errorMessage = {
        id: generateId(),
        role: 'ai',
        text: errorMsg,
        status: 'error',
        statusText: 'Gagal',
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);

      // Still save to history
      const chatTitle = truncateText(text, 50);
      setChatHistory((prev) => {
        const existing = prev.find((c) => c.id === currentChatId);
        if (existing) {
          return prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
              : c
          );
        }
        return [
          { id: currentChatId, title: chatTitle, messages: updatedMessages, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHintClick = (hint) => {
    handleSubmit(hint);
  };

  // ===== FILE UPLOAD HANDLER =====
  const handleFileSubmit = async (file, message) => {
    if (isLoading) return;

    const userMessage = {
      id: generateId(),
      role: 'user',
      text: message || `📎 ${file.name}`,
      fileName: file.name,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = generateId();
      setActiveChatId(currentChatId);
    }

    try {
      const result = await JurnalService.chatWithFile(file, message, userName);

      let aiMessage;
      if (result.type === 'jurnal' && result.data) {
        aiMessage = {
          id: generateId(),
          role: 'ai',
          text: result.message,
          jurnalData: result.data,
          excelUrl: result.excel_url || null,
          status: 'success',
          statusText: 'Tersimpan di Supabase',
          timestamp: Date.now(),
        };
      } else {
        aiMessage = {
          id: generateId(),
          role: 'ai',
          text: result.message,
          timestamp: Date.now(),
        };
      }

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      const chatTitle = `📎 ${file.name}`;
      setChatHistory((prev) => {
        const existing = prev.find((c) => c.id === currentChatId);
        if (existing) {
          return prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
              : c
          );
        }
        return [
          { id: currentChatId, title: chatTitle, messages: updatedMessages, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ];
      });

    } catch (error) {
      const errorText = error.response?.data?.detail || error.message || 'Terjadi kesalahan.';
      const cuteName = getCuteName(userName);

      const errorMessage = {
        id: generateId(),
        role: 'ai',
        text: `Aduh maaf ya ${cuteName} 😅 Gagal baca file nih:\n\n${errorText}\n\nCoba file lain atau format yang didukung ya~ 💪`,
        status: 'error',
        statusText: 'Gagal',
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);

      const chatTitle = `📎 ${file.name} (error)`;
      setChatHistory((prev) => {
        const existing = prev.find((c) => c.id === currentChatId);
        if (existing) {
          return prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
              : c
          );
        }
        return [
          { id: currentChatId, title: chatTitle, messages: updatedMessages, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER =====

  // Welcome screen
  if (!isLoggedIn) {
    return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        userName={userName}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="main-header">
          <div className="main-header-left">
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              id="toggle-sidebar-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sidebarOpen ? (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
            <span className="main-header-title">
              {activeChatId ? 'Percakapan' : 'Chat Baru'}
            </span>
          </div>
          <span className="main-header-badge">Gemini 2.5 Flash ⚡</span>
        </div>

        {/* Chat Area */}
        <div className="chat-area" id="chat-area">
          {messages.length === 0 && !isLoading ? (
            <ChatEmptyState userName={userName} onHintClick={handleHintClick} />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} userName={userName} />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <FormSoal onSubmit={handleSubmit} onFileSubmit={handleFileSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
