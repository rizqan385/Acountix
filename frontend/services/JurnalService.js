import api from './api';

const JurnalService = {
  /**
   * Chat pintar — AI otomatis bedain mau ngobrol atau mau dikerjain soal
   * @param {string} message - Pesan dari user
   * @param {string} userName - Nama user buat panggilan
   * @returns {Promise} - { type: "chat"|"jurnal", message, data?, excel_url? }
   */
  chat: async (message, userName) => {
    const response = await api.post('/api/chat', { 
      message, 
      user_name: userName 
    });
    return response.data;
  },

  /**
   * Chat dengan file upload — AI baca file dan respon
   * @param {File} file - File yang diupload
   * @param {string} message - Pesan tambahan (opsional)
   * @param {string} userName - Nama user
   * @returns {Promise} - { type: "chat"|"jurnal", message, data?, excel_url? }
   */
  chatWithFile: async (file, message, userName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message || '');
    formData.append('user_name', userName);
    
    const response = await api.post('/api/chat-with-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Kirim soal teks ke AI untuk di-parse jadi jurnal (endpoint lama)
   * @param {string} text - Soal teks kronologis
   * @returns {Promise} - Data jurnal hasil parsing AI
   */
  parseSoal: async (text) => {
    const response = await api.post('/api/parse-soal', { text });
    return response.data;
  },

  /**
   * Ambil semua jurnal dari Supabase
   * @returns {Promise} - Array of jurnal
   */
  getSemuaJurnal: async () => {
    const response = await api.get('/api/jurnal');
    return response.data;
  },
};

export default JurnalService;
