/**
 * ReflectionAI.js
 * KI-Funktionen für Reflexionstools im NEBULA ODYSSEY-System
 */

const AIService = require('./AIService');
const AIConfig = require('./AIConfig');
const User = require('../models/User');
const Reflection = require('../models/Reflection');
const Skill = require('../models/Skill');

class ReflectionAI {
  /**
   * Generiert personalisierte Reflexionsfragen basierend auf Benutzerkontext
   * @param {string} userId - Die ID des Benutzers
   * @param {string} type - Der Reflexionstyp (daily, weekly, monthly)
   * @returns {Promise<Array>} - Array mit personalisierten Reflexionsfragen
   */
  async generateQuestions(userId, type) {
    try {
      // Benutzerkontext laden
      const user = await User.findById(userId);
      const recentReflections = await Reflection.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);
      
      const userSkills = await Skill.find({ userId })
        .sort({ level: -1 })
        .limit(5);
      
      // Kontext für den Prompt aufbauen
      const userContext = {
        username: user.username,
        level: user.stats.level,
        totalXP: user.stats.totalXP,
        streakDays: user.stats.streakDays,
        skills: userSkills.map(s => ({
          name: s.name,
          level: s.level,
          category: s.category
        })),
        recentReflections: recentReflections.map(r => ({
          type: r.type,
          date: r.createdAt,
          mood: r.mood,
          summary: r.content.substring(0, 100)
        }))
      };
      
      // Weltraum-Thema in den Prompt integrieren
      const spaceTheme = `
        Im NEBULA ODYSSEY-Universum ist der Benutzer ein Raumschiff-Kapitän auf einer Reise durch verschiedene Planeten, 
        die Lebensbereiche repräsentieren. Der Benutzer sammelt XP durch abgeschlossene Quests und Herausforderungen.
        Planeten im System umfassen den Mentalen Meisterschaftsplaneten, den Produktivitäts-Planeten, 
        die Schatten-Arena und die Wohlstands-Galaxie.
      `;
      
      // Prompt erstellen
      const prompt = `
        Generiere ${type === 'daily' ? '5' : type === 'weekly' ? '7' : '4'} personalisierte Reflexionsfragen für eine ${
          type === 'daily' ? 'tägliche' : 
          type === 'weekly' ? 'wöchentliche' : 
          type === 'monthly' ? 'monatliche' : 'allgemeine'
        } Reflexion.
        
        ${spaceTheme}
        
        Benutzerkontext:
        - Name: ${userContext.username}
        - Level: ${userContext.level}
        - Gesamt-XP: ${userContext.totalXP}
        - Streak-Tage: ${userContext.streakDays}
        - Top-Skills: ${userContext.skills.map(s => `${s.name} (Level ${s.level})`).join(', ')}
        
        Letzte Stimmungen: ${userContext.recentReflections.map(r => r.mood).join(', ')}
        
        Die Fragen sollten:
        1. Tiefgründig und auf persönliches Wachstum ausgerichtet sein
        2. Das Weltraum-Thema des NEBULA ODYSSEY-Universums einbeziehen
        3. Auf den Benutzerkontext und bisherige Reflexionen eingehen
        4. Zur Selbsterkenntnis und Entwicklung anregen
        
        Formatiere die Antwort als JSON-Array mit Fragen.
      `;
      
      // KI-Anfrage senden
      const response = await AIService.generateStructuredResponse(userId, prompt, {
        systemPrompt: AIConfig.systemPrompts.reflection,
        temperature: 0.8,
        maxTokens: 800,
        fallbackObject: { questions: this.getFallbackQuestions(type) }
      });
      
      // Antwort verarbeiten und zurückgeben
      return response.questions || this.getFallbackQuestions(type);
    } catch (error) {
      console.error('Error generating reflection questions:', error);
      return this.getFallbackQuestions(type);
    }
  }
  
  /**
   * Analysiert Reflexionsantworten und generiert Einsichten
   * @param {string} userId - Die ID des Benutzers
   * @param {Object} reflection - Die Reflexionsdaten
   * @returns {Promise<Object>} - Analyseergebnisse mit Einsichten
   */
  async analyzeResponses(userId, reflection) {
    try {
      const { type, questions, answers } = reflection;
      
      // Prompt für die Analyse erstellen
      const prompt = `
        Analysiere die folgenden Reflexionsantworten eines Benutzers im NEBULA ODYSSEY-Universum:
        
        Reflexionstyp: ${type}
        
        ${questions.map((q, i) => `Frage: ${q}\nAntwort: ${answers[i] || 'Keine Antwort'}`).join('\n\n')}
        
        Bitte erstelle eine tiefgehende Analyse mit:
        1. Zusammenfassung der Hauptpunkte
        2. Identifizierte Erfolge und Fortschritte
        3. Erkannte Herausforderungen und Hindernisse
        4. Wichtige Einsichten und Erkenntnisse
        5. Empfehlungen für nächste Schritte
        6. Vorgeschlagene Quests oder Missionen im NEBULA ODYSSEY-Universum
        
        Formatiere die Antwort als JSON-Objekt mit den Feldern: summary, achievements, challenges, insights, recommendations, suggestedQuests.
      `;
      
      // KI-Anfrage senden
      const response = await AIService.generateStructuredResponse(userId, prompt, {
        systemPrompt: AIConfig.systemPrompts.reflection,
        temperature: 0.7,
        maxTokens: 1000,
        fallbackObject: this.getFallbackAnalysis()
      });
      
      return {
        summary: response.summary || "Keine Zusammenfassung verfügbar.",
        achievements: response.achievements || [],
        challenges: response.challenges || [],
        insights: response.insights || [],
        recommendations: response.recommendations || [],
        suggestedQuests: response.suggestedQuests || []
      };
    } catch (error) {
      console.error('Error analyzing reflection responses:', error);
      return this.getFallbackAnalysis();
    }
  }
  
  /**
   * Generiert eine Zusammenfassung mehrerer Reflexionen
   * @param {string} userId - Die ID des Benutzers
   * @param {string} period - Der Zeitraum (week, month, year)
   * @returns {Promise<Object>} - Zusammenfassung mit Einsichten und Trends
   */
  async generateSummary(userId, period) {
    try {
      // Zeitraum bestimmen
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }
      
      // Reflexionen für den Zeitraum laden
      const reflections = await Reflection.find({
        userId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });
      
      if (reflections.length === 0) {
        return {
          summary: `Keine Reflexionen für den ${period === 'week' ? 'wöchentlichen' : period === 'month' ? 'monatlichen' : 'jährlichen'} Zeitraum gefunden.`,
          trends: [],
          insights: [],
          recommendations: []
        };
      }
      
      // Reflexionsdaten für den Prompt aufbereiten
      const reflectionData = reflections.map(r => ({
        date: r.createdAt.toISOString().split('T')[0],
        type: r.type,
        mood: r.mood,
        energyLevel: r.energyLevel,
        content: r.content.substring(0, 200) + (r.content.length > 200 ? '...' : ''),
        achievements: r.achievements,
        challenges: r.challenges,
        insights: r.insights
      }));
      
      // Prompt erstellen
      const prompt = `
        Erstelle eine Zusammenfassung der folgenden Reflexionen eines Benutzers im NEBULA ODYSSEY-Universum für den ${
          period === 'week' ? 'letzten Woche' : 
          period === 'month' ? 'letzten Monat' : 
          'letzten Jahr'
        }:
        
        ${JSON.stringify(reflectionData, null, 2)}
        
        Bitte erstelle eine tiefgehende Analyse mit:
        1. Zusammenfassung der Hauptentwicklungen
        2. Erkannte Trends und Muster
        3. Wichtige Einsichten und Erkenntnisse
        4. Empfehlungen für die weitere Reise im NEBULA ODYSSEY-Universum
        
        Formatiere die Antwort als JSON-Objekt mit den Feldern: summary, trends, insights, recommendations.
      `;
      
      // KI-Anfrage senden
      const response = await AIService.generateStructuredResponse(userId, prompt, {
        systemPrompt: AIConfig.systemPrompts.reflection,
        temperature: 0.7,
        maxTokens: 1200,
        fallbackObject: this.getFallbackSummary(period)
      });
      
      return {
        summary: response.summary || `Keine Zusammenfassung für den ${period} verfügbar.`,
        trends: response.trends || [],
        insights: response.insights || [],
        recommendations: response.recommendations || []
      };
    } catch (error) {
      console.error('Error generating reflection summary:', error);
      return this.getFallbackSummary(period);
    }
  }
  
  /**
   * Liefert Fallback-Fragen für verschiedene Reflexionstypen
   * @param {string} type - Der Reflexionstyp
   * @returns {Array} - Array mit Standard-Reflexionsfragen
   */
  getFallbackQuestions(type) {
    return AIConfig.fallbacks.reflection[type] || [
      "Was beschäftigt dich gerade am meisten?",
      "Welche Fortschritte bemerkst du in deiner Entwicklung?",
      "Welche Herausforderungen stehen dir bevor?",
      "Was gibt dir Energie und Motivation?"
    ];
  }
  
  /**
   * Liefert eine Fallback-Analyse für Reflexionsantworten
   * @returns {Object} - Standard-Analyseergebnisse
   */
  getFallbackAnalysis() {
    return {
      summary: "Basierend auf deinen Antworten scheint es, dass du aktiv an deiner persönlichen Entwicklung arbeitest.",
      achievements: ["Fortschritte in der Selbstreflexion"],
      challenges: ["Herausforderungen identifizieren"],
      insights: ["Regelmäßige Reflexion ist wichtig für persönliches Wachstum"],
      recommendations: ["Setze dir konkrete Ziele für die kommende Woche"],
      suggestedQuests: ["Tägliche Reflexionsquest: Notiere jeden Abend drei positive Erlebnisse des Tages"]
    };
  }
  
  /**
   * Liefert eine Fallback-Zusammenfassung für einen Zeitraum
   * @param {string} period - Der Zeitraum
   * @returns {Object} - Standard-Zusammenfassung
   */
  getFallbackSummary(period) {
    return {
      summary: `Zusammenfassung deiner Reflexionen für ${
        period === 'week' ? 'die letzte Woche' : 
        period === 'month' ? 'den letzten Monat' : 
        'das letzte Jahr'
      }.`,
      trends: ["Kontinuierliche Selbstreflexion"],
      insights: ["Regelmäßige Reflexion unterstützt deine persönliche Entwicklung"],
      recommendations: ["Setze deine regelmäßigen Reflexionen fort"]
    };
  }
}

module.exports = new ReflectionAI();
