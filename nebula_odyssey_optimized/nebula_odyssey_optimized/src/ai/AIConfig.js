/**
 * AIConfig.js
 * Konfigurationseinstellungen für KI-Dienste im NOVA-System
 */

const AIConfig = {
  // OpenAI API Konfiguration
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '800'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
  },
  
  // Cache-Konfiguration
  cache: {
    enabled: true,
    ttl: parseInt(process.env.AI_CACHE_TTL || '3600'), // Standard: 1 Stunde
    maxSize: 100, // Maximale Anzahl von Cache-Einträgen
  },
  
  // Rate-Limiting
  rateLimit: {
    enabled: true,
    maxRequests: parseInt(process.env.AI_RATE_LIMIT || '20'), // Anfragen pro Minute
    windowMs: 60 * 1000, // 1 Minute
  },
  
  // Fallback-Antworten
  fallbacks: {
    general: "Es tut mir leid, ich konnte keine Antwort generieren. Bitte versuche es später noch einmal.",
    reflection: {
      daily: [
        "Was war heute dein größter Erfolg?",
        "Welche Herausforderungen hast du heute gemeistert?",
        "Was hast du heute gelernt?",
        "Wie war deine Energie und Stimmung heute?",
        "Was nimmst du dir für morgen vor?"
      ],
      weekly: [
        "Was waren deine wichtigsten Erfolge diese Woche?",
        "Welche Fortschritte hast du bei deinen Zielen gemacht?",
        "Welche Herausforderungen sind aufgetreten und wie hast du sie bewältigt?",
        "Was hast du diese Woche über dich selbst gelernt?",
        "Wie war deine Work-Life-Balance diese Woche?",
        "Was möchtest du nächste Woche anders machen?"
      ],
      monthly: [
        "Welche Meilensteine hast du diesen Monat erreicht?",
        "Wie haben sich deine Skills in diesem Monat entwickelt?",
        "Welche Muster oder Gewohnheiten hast du bei dir beobachtet?",
        "Was hat dich diesen Monat am meisten motiviert?",
        "Welche Ziele setzt du dir für den kommenden Monat?"
      ]
    }
  },
  
  // System-Prompts für verschiedene Anwendungsfälle
  systemPrompts: {
    reflection: "Du bist ein Experte für persönliche Entwicklung und Reflexion im NOVA-System. Deine Aufgabe ist es, tiefgründige, personalisierte Reflexionsfragen zu stellen und Antworten zu analysieren, um Benutzer bei ihrer persönlichen Entwicklung zu unterstützen.",
    quest: "Du bist ein Quest-Designer im NOVA-System für persönliche Entwicklung. Deine Aufgabe ist es, personalisierte, motivierende und herausfordernde Quests zu erstellen, die auf die Ziele und Fähigkeiten des Benutzers abgestimmt sind.",
    npc: "Du bist ein NPC im NOVA-System, einer gamifizierten Plattform für persönliche Entwicklung. Deine Aufgabe ist es, hilfreiche, motivierende und kontextbezogene Dialoge zu führen, die den Benutzer bei seiner Entwicklungsreise unterstützen.",
    skill: "Du bist ein Skill-Coach im NOVA-System. Deine Aufgabe ist es, personalisierte Empfehlungen für Skill-Entwicklung zu geben und Lernpfade vorzuschlagen, die auf den Interessen und Zielen des Benutzers basieren.",
    analytics: "Du bist ein Datenanalyst im NOVA-System. Deine Aufgabe ist es, Benutzeraktivitäten zu analysieren, Muster zu erkennen und personalisierte Einsichten zu liefern, die dem Benutzer helfen, seinen Fortschritt zu verstehen und zu optimieren."
  }
};

module.exports = AIConfig;
