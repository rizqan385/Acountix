import { useState } from 'react';
import { truncateText } from '../utils/formatter';

// Titel lucu buat user di sidebar
const CUTE_TITLES = [
  'Akuntan Tercantik ✨',
  'Si Rajin Hitung 🧮',
  'Sang Penakluk Jurnal 🏆',
  'Akuntan Idaman 💖',
  'Bestie Acountix 🌸',
  'Pro Akuntan 🔥',
  'Si Paling Balance ⚖️',
  'Akuntan Kece 💅',
];

const getRandomTitle = () => {
  return CUTE_TITLES[Math.floor(Math.random() * CUTE_TITLES.length)];
};

const Sidebar = ({
  isOpen,
  chatHistory,
  activeChatId,
  userName,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onToggle,
}) => {
  const [cuteTitle] = useState(getRandomTitle);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className={`sidebar ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon gradient-pink">🧮</div>
          <span className="sidebar-brand-text gradient-text">Acountix</span>
        </div>
        <button
          className="sidebar-new-chat-btn"
          onClick={onNewChat}
          title="Chat Baru"
          id="new-chat-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Chat History */}
      <div className="sidebar-history">
        {chatHistory.length > 0 && (
          <div className="sidebar-section-label">Riwayat Chat</div>
        )}
        {chatHistory.length === 0 && (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'rgba(249,168,212,0.3)',
            lineHeight: '1.6',
          }}>
            Belum ada riwayat chat.
            <br />
            Mulai percakapan baru! ✨
          </div>
        )}
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`sidebar-chat-item ${activeChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
            id={`chat-item-${chat.id}`}
          >
            <span className="sidebar-chat-icon">💬</span>
            <span className="sidebar-chat-title">
              {truncateText(chat.title, 30)}
            </span>
            <button
              className="sidebar-chat-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              title="Hapus chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Footer - User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar gradient-pink">
            {getInitials(userName)}
          </div>
          <div>
            <div className="sidebar-user-name">{userName || 'Guest'}</div>
            <div className="sidebar-user-role">{cuteTitle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
