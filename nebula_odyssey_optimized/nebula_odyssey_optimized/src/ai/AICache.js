/**
 * AICache.js
 * Caching-Mechanismus für KI-Anfragen im NOVA-System
 */

const AIConfig = require('./AIConfig');

class AICache {
  constructor() {
    this.cache = new Map();
    this.enabled = AIConfig.cache.enabled;
    this.ttl = AIConfig.cache.ttl;
    this.maxSize = AIConfig.cache.maxSize;
  }

  /**
   * Generiert einen eindeutigen Schlüssel für Cache-Einträge
   * @param {string} prompt - Der Prompt für die KI-Anfrage
   * @param {Object} options - Zusätzliche Optionen für die Anfrage
   * @returns {string} - Ein eindeutiger Cache-Schlüssel
   */
  generateCacheKey(prompt, options = {}) {
    // Relevante Optionen für den Cache-Schlüssel extrahieren
    const relevantOptions = {
      model: options.model || AIConfig.openai.model,
      temperature: options.temperature || AIConfig.openai.temperature,
      maxTokens: options.maxTokens || AIConfig.openai.maxTokens,
    };
    
    // Schlüssel aus Prompt und relevanten Optionen generieren
    return `${prompt}__${JSON.stringify(relevantOptions)}`;
  }

  /**
   * Speichert eine Antwort im Cache
   * @param {string} key - Der Cache-Schlüssel
   * @param {string} value - Die zu speichernde Antwort
   * @param {number} ttl - Time-to-Live in Sekunden (optional)
   */
  set(key, value, ttl = this.ttl) {
    if (!this.enabled) return;
    
    // Cache-Größe prüfen und ggf. ältesten Eintrag entfernen
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Neuen Eintrag mit Ablaufzeit speichern
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, {
      value,
      expiry
    });
  }

  /**
   * Ruft eine Antwort aus dem Cache ab
   * @param {string} key - Der Cache-Schlüssel
   * @returns {string|null} - Die gespeicherte Antwort oder null, wenn nicht gefunden oder abgelaufen
   */
  get(key) {
    if (!this.enabled) return null;
    
    const entry = this.cache.get(key);
    
    // Prüfen, ob Eintrag existiert und noch gültig ist
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }
    
    // Abgelaufenen Eintrag entfernen
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Löscht einen Eintrag aus dem Cache
   * @param {string} key - Der zu löschende Cache-Schlüssel
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Leert den gesamten Cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Entfernt alle abgelaufenen Einträge aus dem Cache
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = AICache;
