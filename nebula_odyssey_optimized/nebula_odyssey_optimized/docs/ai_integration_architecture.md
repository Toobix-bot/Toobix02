# NEBULA ODYSSEY System - KI-Integrationsarchitektur

## Übersicht

Dieses Dokument beschreibt die Architektur für die Integration von KI-Funktionalitäten (insbesondere ChatGPT über die OpenAI API) in das NEBULA ODYSSEY-System. Die Architektur wurde entwickelt, um eine nahtlose Integration zu ermöglichen, ohne die bestehende Systemstruktur grundlegend zu verändern.

## Architekturprinzipien

1. **Modularität**: KI-Funktionen werden als separate Module implementiert, die mit dem bestehenden System interagieren
2. **Erweiterbarkeit**: Die Architektur erlaubt einfaches Hinzufügen weiterer KI-Funktionen in der Zukunft
3. **Fehlertoleranz**: Das System funktioniert weiterhin, auch wenn KI-Dienste nicht verfügbar sind
4. **Datenschutz**: Sensible Benutzerdaten werden nur bei Bedarf an KI-Dienste übermittelt
5. **Effizienz**: Optimierte API-Nutzung, um Kosten und Latenz zu minimieren

## Systemkomponenten

### 1. KI-Service-Layer

Diese neue Komponente dient als zentrale Schnittstelle zwischen dem NEBULA ODYSSEY-System und externen KI-Diensten:

```
+------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |
|  NEBULA ODYSSEY  |        |  KI-Service      |        |  OpenAI API      |
|  System          |<------>|  Layer           |<------>|  (ChatGPT)       |
|  (Bestehend)     |        |                  |        |                  |
+------------------+        +------------------+        +------------------+
```

#### Hauptkomponenten:

- **AIService.js**: Zentrale Klasse für die Verwaltung von KI-Anfragen
- **AIConfig.js**: Konfigurationseinstellungen für KI-Dienste
- **AIModels.js**: Definitionen für verschiedene KI-Modelle und deren Verwendung
- **AICache.js**: Caching-Mechanismus für häufige KI-Anfragen

### 2. Integrationsmodule

Spezifische Module für jeden Integrationsbereich:

- **ReflectionAI.js**: KI-Funktionen für Reflexionstools
- **QuestAI.js**: KI-Funktionen für das Quest-System
- **NPCAI.js**: KI-Funktionen für NPC-Interaktionen
- **SkillAI.js**: KI-Funktionen für Skill-Empfehlungen
- **AnalyticsAI.js**: KI-Funktionen für Fortschrittsanalyse

### 3. API-Erweiterungen

Neue API-Endpunkte für KI-Funktionalitäten:

- **/api/ai/reflection**: Endpunkte für KI-gestützte Reflexionen
- **/api/ai/quests**: Endpunkte für KI-generierte Quests
- **/api/ai/npcs**: Endpunkte für KI-gestützte NPC-Interaktionen
- **/api/ai/skills**: Endpunkte für KI-Skill-Empfehlungen
- **/api/ai/analytics**: Endpunkte für KI-gestützte Analysen

## Datenfluss

### Beispiel: KI-gestützte Reflexion

1. Benutzer startet eine neue Reflexion
2. Frontend sendet Anfrage an `/api/ai/reflection/questions`
3. ReflectionController ruft ReflectionAI.generateQuestions() auf
4. ReflectionAI bereitet Kontext vor (Benutzerhistorie, bisherige Reflexionen)
5. AIService sendet Anfrage an OpenAI API mit optimiertem Prompt
6. OpenAI API liefert personalisierte Fragen zurück
7. Antworten werden verarbeitet und an Frontend zurückgegeben
8. Benutzer beantwortet Fragen
9. Antworten werden an `/api/ai/reflection/analyze` gesendet
10. ReflectionAI.analyzeResponses() verarbeitet Antworten
11. AIService sendet Analyse-Anfrage an OpenAI API
12. Ergebnisse werden gespeichert und dem Benutzer präsentiert

## Technische Details

### OpenAI API Integration

```javascript
// AIService.js (Auszug)
const { Configuration, OpenAIApi } = require('openai');

class AIService {
  constructor() {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
    this.cache = new AICache();
  }

  async generateCompletion(prompt, options = {}) {
    const cacheKey = this.generateCacheKey(prompt, options);
    const cachedResponse = this.cache.get(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const completion = await this.openai.createCompletion({
        model: options.model || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: options.systemPrompt || "Du bist ein hilfreicher Assistent im NEBULA ODYSSEY-System für persönliche Entwicklung." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
      });
      
      const response = completion.data.choices[0].message.content;
      this.cache.set(cacheKey, response, options.cacheTTL || 3600);
      return response;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return options.fallbackResponse || "Es tut mir leid, ich konnte keine Antwort generieren.";
    }
  }
  
  // Weitere Methoden...
}

module.exports = new AIService();
```

### Prompt-Engineering

Für optimale Ergebnisse werden strukturierte Prompts mit klaren Anweisungen verwendet:

```javascript
// ReflectionAI.js (Auszug)
const AIService = require('./AIService');
const User = require('../models/User');
const Reflection = require('../models/Reflection');

class ReflectionAI {
  async generateQuestions(userId, type) {
    // Benutzerkontext laden
    const user = await User.findById(userId);
    const recentReflections = await Reflection.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Kontext für den Prompt aufbauen
    const userContext = {
      username: user.username,
      level: user.stats.level,
      skills: await this.getUserTopSkills(userId),
      recentReflections: recentReflections.map(r => ({
        type: r.type,
        date: r.createdAt,
        mood: r.mood,
        summary: r.content.substring(0, 100)
      }))
    };
    
    // Prompt erstellen
    const prompt = `
      Generiere ${type === 'daily' ? '5' : type === 'weekly' ? '7' : '4'} personalisierte Reflexionsfragen für eine ${
        type === 'daily' ? 'tägliche' : 
        type === 'weekly' ? 'wöchentliche' : 
        type === 'monthly' ? 'monatliche' : 'allgemeine'
      } Reflexion.
      
      Benutzerkontext:
      - Name: ${userContext.username}
      - Level: ${userContext.level}
      - Top-Skills: ${userContext.skills.join(', ')}
      
      Letzte Stimmungen: ${userContext.recentReflections.map(r => r.mood).join(', ')}
      
      Die Fragen sollten tiefgründig, personalisiert und auf persönliches Wachstum ausgerichtet sein.
      Formatiere die Antwort als JSON-Array mit Fragen.
    `;
    
    // KI-Anfrage senden
    const response = await AIService.generateCompletion(prompt, {
      systemPrompt: "Du bist ein Experte für persönliche Entwicklung und Reflexion im NEBULA ODYSSEY-System.",
      temperature: 0.8,
      maxTokens: 800,
      fallbackResponse: JSON.stringify(this.getFallbackQuestions(type))
    });
    
    // Antwort parsen und zurückgeben
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackQuestions(type);
    }
  }
  
  // Weitere Methoden...
}

module.exports = new ReflectionAI();
```

## Frontend-Integration

Die KI-Funktionalitäten werden in die bestehende Frontend-Struktur integriert:

```javascript
// pages/reflections/new.js (Auszug)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../components/AuthContext';

export default function NewReflection() {
  const { user } = useAuth();
  const [type, setType] = useState('daily');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  // KI-generierte Fragen laden
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/ai/reflection/questions?type=${type}`);
        setQuestions(response.data.questions);
        
        // Leere Antworten initialisieren
        const emptyAnswers = {};
        response.data.questions.forEach((q, i) => {
          emptyAnswers[`question_${i}`] = '';
        });
        setAnswers(emptyAnswers);
      } catch (error) {
        console.error('Error loading AI questions:', error);
        // Fallback zu Standard-Fragen
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadQuestions();
    }
  }, [type, user]);
  
  // Reflexion mit KI-Analyse speichern
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Antworten zur Analyse senden
      const analysisResponse = await axios.post('/api/ai/reflection/analyze', {
        type,
        answers: Object.values(answers),
        questions
      });
      
      setAnalysis(analysisResponse.data);
      
      // Reflexion mit KI-Analyse speichern
      await axios.post('/api/reflections', {
        type,
        content: answers.mainReflection || '',
        mood: answers.mood,
        energyLevel: parseInt(answers.energyLevel),
        questions: questions.map((q, i) => ({
          question: q,
          answer: answers[`question_${i}`] || ''
        })),
        achievements: analysisResponse.data.achievements || [],
        challenges: analysisResponse.data.challenges || [],
        insights: analysisResponse.data.insights || [],
        aiAnalysis: analysisResponse.data.summary
      });
      
      // Weiterleitung zur Reflexionsübersicht
      router.push('/reflections');
    } catch (error) {
      console.error('Error saving reflection:', error);
      // Fehlerbehandlung
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render-Logik...
}
```

## Umgebungsvariablen

Neue Umgebungsvariablen für die KI-Integration:

```
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-3.5-turbo
AI_CACHE_TTL=3600
AI_MAX_TOKENS=800
AI_TEMPERATURE=0.7
```

## Sicherheitsüberlegungen

1. **API-Schlüssel-Sicherheit**: Der OpenAI API-Schlüssel wird sicher in Umgebungsvariablen gespeichert
2. **Rate-Limiting**: Implementierung von Rate-Limiting für KI-Anfragen
3. **Inhaltsprüfung**: Filterung von unangemessenen Inhalten in KI-Antworten
4. **Datenschutz**: Minimierung der an externe Dienste gesendeten persönlichen Daten
5. **Fallback-Mechanismen**: Robuste Fehlerbehandlung bei API-Ausfällen

## Erweiterbarkeit

Die Architektur ist so konzipiert, dass sie leicht um weitere KI-Funktionen erweitert werden kann:

1. Neues Integrationsmodul erstellen (z.B. `GoalAI.js`)
2. Neue API-Endpunkte hinzufügen
3. Frontend-Komponenten für die neue Funktionalität entwickeln
4. Prompt-Templates für den neuen Anwendungsfall definieren

## Implementierungsplan

1. **Phase 1**: KI-Service-Layer und Basisinfrastruktur
2. **Phase 2**: Reflexions-KI-Integration (höchste Priorität)
3. **Phase 3**: Quest-KI-Integration
4. **Phase 4**: NPC-KI-Integration
5. **Phase 5**: Skill- und Analyse-KI-Integration

## Ressourcenschätzung

- **Entwicklungszeit**: ~40 Stunden für die Basisimplementierung
- **API-Kosten**: Abhängig von der Nutzung, ca. $0.002 pro 1K Tokens
- **Wartungsaufwand**: Minimal, hauptsächlich Prompt-Optimierung

## Nächste Schritte

1. OpenAI API-Schlüssel einrichten
2. KI-Service-Layer implementieren
3. Reflexions-KI-Modul entwickeln und testen
4. Frontend-Integration für Reflexionstools
5. Weitere Module nach Priorität implementieren
