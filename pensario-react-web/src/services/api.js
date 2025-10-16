const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remover token de autenticação
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Método auxiliar para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Autenticação
  async register(username, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.removeToken();
  }

  // Notas
  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNotes() {
    return this.request('/notes');
  }

  async getNote(id) {
    return this.request(`/notes/${id}`);
  }

  async updateNote(id, noteData) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Lembretes
  async createReminder(reminderData) {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  async getReminders() {
    return this.request('/reminders');
  }

  async getRemindersByNote(noteId) {
    return this.request(`/reminders/note/${noteId}`);
  }

  async updateReminder(id, reminderData) {
    return this.request(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  }

  async deleteReminder(id) {
    return this.request(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // Anexos
  async uploadAttachment(noteId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('note_id', noteId);

    return this.request('/attachments/upload', {
      method: 'POST',
      headers: {
        // Não definir Content-Type para FormData
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
  }

  async getAttachments(noteId) {
    return this.request(`/attachments/note/${noteId}`);
  }

  async deleteAttachment(id) {
    return this.request(`/attachments/${id}`, {
      method: 'DELETE',
    });
  }

  getAttachmentDownloadUrl(id) {
    return `${API_BASE_URL}/attachments/download/${id}`;
  }

  // Histórico de revisões
  async getRevisions(noteId) {
    return this.request(`/revisions/note/${noteId}`);
  }

  async getRevision(id) {
    return this.request(`/revisions/${id}`);
  }

  async deleteRevision(id) {
    return this.request(`/revisions/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

