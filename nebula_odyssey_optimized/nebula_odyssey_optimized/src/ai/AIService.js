/**
 * AIService.js
 * Zentrale Klasse für die Verwaltung von KI-Anfragen im NEBULA ODYSSEY-System
 */

const { Configuration, OpenAIApi } = require('openai');
const AIConfig = require('./AIConfig');
const AICache = require('./AICache');

class AIService {
  constructor() {
    // OpenAI API Konfiguration
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
    
    // Cache-Instanz erstellen
    this.cache = new AICache();
    
    // Rate-Limiting-Tracking
    this.requestCounts = new Map();
    this.rateLimit = AIConfig.rateLimit;
  }

  /**
   * Prüft, ob ein Benutzer das Rate-Limit überschritten hat
   * @param {string} userId - Die ID des Benutzers
   * @returns {boolean} - True, wenn das Limit überschritten wurde
   */
  isRateLimited(userId) {
    if (!this.rateLimit.enabled) return false;
    
    const now = Date.now();
    const userRequests = this.requestCounts.get(userId) || [];
    
    // Alte Anfragen entfernen
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.rateLimit.windowMs
    );
    
    // Aktualisierte Anfragen speichern
    this.requestCounts.set(userId, recentRequests);
    
    // Prüfen, ob das Limit überschritten wurde
    return recentRequests.length >= this.rateLimit.maxRequests;
  }

  /**
   * Aktualisiert den Anfragenzähler für einen Benutzer
   * @param {string} userId - Die ID des Benutzers
   */
  trackRequest(userId) {
    if (!this.rateLimit.enabled) return;
    
    const now = Date.now();
    const userRequests = this.requestCounts.get(userId) || [];
    
    // Neue Anfrage hinzufügen
    userRequests.push(now);
    this.requestCounts.set(userId, userRequests);
  }

  /**
   * Generiert eine Antwort mit dem ChatGPT-Modell
   * @param {string} userId - Die ID des Benutzers für Rate-Limiting
   * @param {string} prompt - Der Prompt für die KI-Anfrage
   * @param {Object} options - Zusätzliche Optionen für die Anfrage
   * @returns {Promise<string>} - Die generierte Antwort
   */
  async generateCompletion(userId, prompt, options = {}) {
    // Rate-Limiting prüfen
    if (this.isRateLimited(userId)) {
      return options.rateLimitResponse || 
        "Du hast zu viele Anfragen gestellt. Bitte versuche es später erneut.";
    }
    
    // Cache-Schlüssel generieren und Cache prüfen
    const cacheKey = this.cache.generateCacheKey(prompt, options);
    const cachedResponse = this.cache.get(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Anfrage an OpenAI API senden
    try {
      // Anfrage tracken
      this.trackRequest(userId);
      
      // Systemrolle und Prompt vorbereiten
      const systemPrompt = options.systemPrompt || 
        AIConfig.systemPrompts.general || 
        "Du bist ein hilfreicher Assistent im NEBULA ODYSSEY-System für persönliche Entwicklung.";
      
      // Weltraum-Thema in den Prompt integrieren, wenn gewünscht
      const spaceThemed = options.spaceThemed !== false;
      let finalPrompt = prompt;
      
      if (spaceThemed && !prompt.includes("NEBULA ODYSSEY-Universum") && !prompt.includes("Raumschiff")) {
        finalPrompt = `Im Kontext des NEBULA ODYSSEY-Universums mit Raumschiffen, Planeten und Weltraum-Missionen: ${prompt}`;
      }
      
      // API-Anfrage konfigurieren
      const completion = await this.openai.createChatCompletion({
        model: options.model || AIConfig.openai.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: finalPrompt }
        ],
        max_tokens: options.maxTokens || AIConfig.openai.maxTokens,
        temperature: options.temperature || AIConfig.openai.temperature,
        presence_penalty: options.presencePenalty || AIConfig.openai.presencePenalty,
        frequency_penalty: options.frequencyPenalty || AIConfig.openai.frequencyPenalty,
      });
      
      // Antwort extrahieren
      const response = completion.data.choices[0].message.content;
      
      // Antwort im Cache speichern
      this.cache.set(cacheKey, response, options.cacheTTL);
      
      return response;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback-Antwort zurückgeben
      return options.fallbackResponse || AIConfig.fallbacks.general;
    }
  }

  /**
   * Generiert eine strukturierte Antwort im JSON-Format
   * @param {string} userId - Die ID des Benutzers für Rate-Limiting
   * @param {string} prompt - Der Prompt für die KI-Anfrage
   * @param {Object} options - Zusätzliche Optionen für die Anfrage
   * @returns {Promise<Object>} - Die generierte Antwort als Objekt
   */
  async generateStructuredResponse(userId, prompt, options = {}) {
    // JSON-Format im Prompt anfordern
    const jsonPrompt = `${prompt}\n\nAntworte im JSON-Format.`;
    
    try {
      const response = await this.generateCompletion(userId, jsonPrompt, options);
      
      // JSON aus der Antwort extrahieren
      const jsonMatch = response.match(/```json\n([\s\S]*)\n```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      
      // JSON parsen
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing structured response:', error);
      
      // Fallback-Objekt zurückgeben
      return options.fallbackObject || { error: "Konnte keine strukturierte Antwort generieren" };
    }
  }
}

// Singleton-Instanz exportieren
module.exports = new AIService();
