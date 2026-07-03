import { useState, useRef, useEffect } from 'react';

const ALLOWED_EXTENSIONS = ['.doc', '.docx', '.txt', '.pdf', '.xlsx', '.xls', '.csv'];

const FormSoal = ({ onSubmit, onFileSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isLoading) return;

    if (selectedFile) {
      // Upload file (with optional message)
      onFileSubmit(selectedFile, text.trim());
      setSelectedFile(null);
      setText('');
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`Format file "${ext}" belum didukung.\nGunakan: ${ALLOWED_EXTENSIONS.join(', ')}`);
      e.target.value = '';
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File terlalu besar! Maksimal 10MB ya.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSubmit = selectedFile || text.trim();

  return (
    <div className="input-bar-wrapper">
      {/* File preview bar */}
      {selectedFile && (
        <div className="file-preview-bar">
          <div className="file-preview-info">
            <span className="file-preview-icon">📎</span>
            <span className="file-preview-name">{selectedFile.name}</span>
            <span className="file-preview-size">
              ({(selectedFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            className="file-preview-remove"
            onClick={removeFile}
            title="Hapus file"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-bar" id="chat-input-form">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".doc,.docx,.txt,.pdf,.xlsx,.xls,.csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload-input"
        />

        {/* Upload button */}
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload file"
          id="upload-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? "Tambahkan pesan untuk file (opsional)..." : "Ketik pesan atau soal akuntansi di sini..."}
          rows={1}
          disabled={isLoading}
          id="chat-input"
        />
        <button
          type="submit"
          className="send-btn gradient-pink"
          disabled={!canSubmit || isLoading}
          id="send-btn"
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default FormSoal;
