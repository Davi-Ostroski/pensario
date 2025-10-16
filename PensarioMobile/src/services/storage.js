import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Chaves para armazenamento
  static KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    NOTES_CACHE: 'notesCache',
    REMINDERS_CACHE: 'remindersCache',
    LAST_SYNC: 'lastSync',
  };

  // Salvar dados
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  }

  // Recuperar dados
  static async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      throw error;
    }
  }

  // Remover dados
  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      throw error;
    }
  }

  // Limpar todos os dados
  static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // Métodos específicos para autenticação
  static async saveAuthData(token, userData) {
    try {
      await Promise.all([
        this.setItem(this.KEYS.AUTH_TOKEN, token),
        this.setItem(this.KEYS.USER_DATA, userData),
      ]);
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
      throw error;
    }
  }

  static async getAuthData() {
    try {
      const [token, userData] = await Promise.all([
        this.getItem(this.KEYS.AUTH_TOKEN),
        this.getItem(this.KEYS.USER_DATA),
      ]);
      return { token, userData };
    } catch (error) {
      console.error('Erro ao recuperar dados de autenticação:', error);
      throw error;
    }
  }

  static async clearAuthData() {
    try {
      await Promise.all([
        this.removeItem(this.KEYS.AUTH_TOKEN),
        this.removeItem(this.KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  }

  // Métodos para cache de notas
  static async cacheNotes(notes) {
    try {
      await this.setItem(this.KEYS.NOTES_CACHE, {
        notes,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Erro ao fazer cache das notas:', error);
      throw error;
    }
  }

  static async getCachedNotes() {
    try {
      const cachedData = await this.getItem(this.KEYS.NOTES_CACHE);
      if (cachedData) {
        // Verificar se o cache não está muito antigo (ex: 1 hora)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - cachedData.timestamp < oneHour) {
          return cachedData.notes;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar cache das notas:', error);
      return null;
    }
  }

  // Métodos para cache de lembretes
  static async cacheReminders(reminders) {
    try {
      await this.setItem(this.KEYS.REMINDERS_CACHE, {
        reminders,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Erro ao fazer cache dos lembretes:', error);
      throw error;
    }
  }

  static async getCachedReminders() {
    try {
      const cachedData = await this.getItem(this.KEYS.REMINDERS_CACHE);
      if (cachedData) {
        // Verificar se o cache não está muito antigo (ex: 1 hora)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - cachedData.timestamp < oneHour) {
          return cachedData.reminders;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar cache dos lembretes:', error);
      return null;
    }
  }

  // Métodos para controle de sincronização
  static async setLastSync() {
    try {
      await this.setItem(this.KEYS.LAST_SYNC, Date.now());
    } catch (error) {
      console.error('Erro ao salvar timestamp de sincronização:', error);
      throw error;
    }
  }

  static async getLastSync() {
    try {
      return await this.getItem(this.KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Erro ao recuperar timestamp de sincronização:', error);
      return null;
    }
  }

  // Verificar se precisa sincronizar (ex: a cada 30 minutos)
  static async needsSync() {
    try {
      const lastSync = await this.getLastSync();
      if (!lastSync) return true;
      
      const thirtyMinutes = 30 * 60 * 1000;
      return Date.now() - lastSync > thirtyMinutes;
    } catch (error) {
      console.error('Erro ao verificar necessidade de sincronização:', error);
      return true;
    }
  }
}

export default StorageService;

