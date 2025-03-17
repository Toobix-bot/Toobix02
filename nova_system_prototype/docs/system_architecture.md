# NOVA System - Systemarchitektur-Dokumentation

## Übersicht

Diese Dokumentation beschreibt die technische Architektur des NOVA Systems, ein gamifiziertes persönliches Entwicklungssystem. Das System wurde als moderne Webanwendung mit einer Client-Server-Architektur implementiert, die Skalierbarkeit, Wartbarkeit und Erweiterbarkeit gewährleistet.

## Inhaltsverzeichnis

1. [Technologie-Stack](#technologie-stack)
2. [Systemarchitektur](#systemarchitektur)
3. [Datenmodelle](#datenmodelle)
4. [API-Endpunkte](#api-endpunkte)
5. [Frontend-Komponenten](#frontend-komponenten)
6. [Sicherheitskonzepte](#sicherheitskonzepte)
7. [Erweiterungsmöglichkeiten](#erweiterungsmöglichkeiten)

## Technologie-Stack

### Backend
- **Node.js**: JavaScript-Laufzeitumgebung
- **Express.js**: Web-Framework für Node.js
- **MongoDB**: NoSQL-Datenbank für flexible Datenspeicherung
- **Mongoose**: ODM (Object Data Modeling) für MongoDB
- **JWT**: JSON Web Tokens für Authentifizierung
- **bcrypt.js**: Passwort-Hashing

### Frontend
- **React**: JavaScript-Bibliothek für Benutzeroberflächen
- **Next.js**: React-Framework für serverseitiges Rendering und Routing
- **Tailwind CSS**: Utility-First CSS-Framework
- **Axios**: HTTP-Client für API-Anfragen
- **Headless UI**: Zugängliche UI-Komponenten

### Entwicklungstools
- **npm**: Paketmanager
- **Jest**: Testing-Framework
- **Git**: Versionskontrolle

## Systemarchitektur

Das NOVA System folgt einer klassischen dreischichtigen Architektur:

1. **Präsentationsschicht** (Frontend)
   - Next.js-Anwendung mit React-Komponenten
   - Responsive Benutzeroberfläche mit Tailwind CSS
   - Client-seitige Zustandsverwaltung mit Context API

2. **Anwendungsschicht** (Backend)
   - Express.js-Server mit RESTful API
   - Geschäftslogik in Controller-Modulen
   - Authentifizierung und Autorisierung mit JWT

3. **Datenschicht**
   - MongoDB-Datenbank
   - Mongoose-Schemas und -Modelle
   - Datenbankabfragen und -operationen

### Architekturdiagramm

```
+------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |
|    Frontend      |        |     Backend      |        |    Datenbank     |
|                  |        |                  |        |                  |
| +-------------+  |        | +-------------+  |        | +-------------+  |
| |             |  |        | |             |  |        | |             |  |
| |   Pages     |  |        | |   Routes    |  |        | |   MongoDB   |  |
| |             |  |        | |             |  |        | |             |  |
| +-------------+  |        | +-------------+  |        | +-------------+  |
|        |         |        |        |         |        |        ^         |
| +-------------+  |  HTTP  | +-------------+  |  Query | +-------------+  |
| |             |  |        | |             |  |        | |             |  |
| | Components  +------------> Controllers  +------------> Mongoose     |  |
| |             |  |        | |             |  |        | |   Models    |  |
| +-------------+  |        | +-------------+  |        | |             |  |
|        |         |        |        |         |        | +-------------+  |
| +-------------+  |        | +-------------+  |        |                  |
| |             |  |        | |             |  |        |                  |
| |  Contexts   |  |        | | Middleware  |  |        |                  |
| |             |  |        | |             |  |        |                  |
| +-------------+  |        | +-------------+  |        |                  |
|                  |        |                  |        |                  |
+------------------+        +------------------+        +------------------+
```

## Datenmodelle

Das NOVA System verwendet folgende Hauptdatenmodelle:

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  stats: {
    level: Number,
    totalXP: Number,
    streakDays: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Skill
```javascript
{
  userId: ObjectId,
  name: String,
  category: String,
  description: String,
  level: Number,
  currentXP: Number,
  requiredXP: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Quest
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  type: String (daily, weekly, long-term),
  category: String,
  difficulty: Number,
  status: String (active, completed, failed),
  progress: Number,
  xpReward: Number,
  skillRewards: [
    {
      skillId: ObjectId,
      xpAmount: Number
    }
  ],
  dueDate: Date,
  steps: [
    {
      description: String,
      completed: Boolean
    }
  ],
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Reflection
```javascript
{
  userId: ObjectId,
  type: String (daily, weekly, monthly, yearly),
  content: String,
  mood: String,
  energyLevel: Number,
  questions: [
    {
      question: String,
      answer: String
    }
  ],
  achievements: [String],
  challenges: [String],
  insights: [String],
  goals: [
    {
      description: String,
      completed: Boolean
    }
  ],
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### City
```javascript
{
  userId: ObjectId,
  level: Number,
  buildings: [
    {
      type: String,
      name: String,
      level: Number,
      position: {
        x: Number,
        y: Number
      },
      unlocked: Boolean,
      linkedSkill: ObjectId,
      description: String
    }
  ],
  npcs: [
    {
      name: String,
      role: String,
      position: {
        x: Number,
        y: Number
      },
      unlocked: Boolean,
      dialogues: [
        {
          text: String,
          responses: [String],
          conditions: Object
        }
      ],
      quests: [ObjectId]
    }
  ],
  events: [
    {
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      completed: Boolean
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## API-Endpunkte

Das NOVA System bietet folgende RESTful API-Endpunkte:

### Authentifizierung
- `POST /api/auth/register` - Benutzerregistrierung
- `POST /api/auth/login` - Benutzeranmeldung
- `GET /api/auth/profile` - Benutzerprofil abrufen
- `PUT /api/auth/profile` - Benutzerprofil aktualisieren

### Skills
- `GET /api/skills` - Alle Skills abrufen
- `GET /api/skills/:id` - Einzelnen Skill abrufen
- `POST /api/skills` - Neuen Skill erstellen
- `PUT /api/skills/:id` - Skill aktualisieren
- `DELETE /api/skills/:id` - Skill löschen

### Quests
- `GET /api/quests` - Alle Quests abrufen
- `GET /api/quests/:id` - Einzelne Quest abrufen
- `POST /api/quests` - Neue Quest erstellen
- `PUT /api/quests/:id` - Quest aktualisieren
- `PUT /api/quests/:id/progress` - Quest-Fortschritt aktualisieren
- `DELETE /api/quests/:id` - Quest löschen

### Reflections
- `GET /api/reflections` - Alle Reflexionen abrufen
- `GET /api/reflections/:id` - Einzelne Reflexion abrufen
- `GET /api/reflections/questions` - Reflexionsfragen abrufen
- `POST /api/reflections` - Neue Reflexion erstellen
- `PUT /api/reflections/:id` - Reflexion aktualisieren
- `DELETE /api/reflections/:id` - Reflexion löschen

### City
- `GET /api/city` - Stadtdaten abrufen
- `PUT /api/city` - Stadtdaten aktualisieren
- `GET /api/city/buildings` - Alle Gebäude abrufen
- `POST /api/city/buildings` - Neues Gebäude hinzufügen
- `PUT /api/city/buildings/:id` - Gebäude aktualisieren
- `GET /api/city/npcs` - Alle NPCs abrufen
- `POST /api/city/npcs` - Neuen NPC hinzufügen

## Frontend-Komponenten

Das Frontend des NOVA Systems ist in folgende Hauptkomponenten unterteilt:

### Seiten (Pages)
- `index.js` - Startseite mit Weiterleitung
- `login.js` - Anmeldeseite
- `register.js` - Registrierungsseite
- `dashboard.js` - Dashboard mit Übersicht
- `skills/index.js` - Skills-Übersicht
- `skills/new.js` - Neuen Skill erstellen
- `quests/index.js` - Quests-Übersicht
- `quests/new.js` - Neue Quest erstellen
- `reflections/index.js` - Reflexionen-Übersicht
- `reflections/new.js` - Neue Reflexion erstellen
- `city/index.js` - Stadt-Visualisierung

### Kontext (Context)
- `AuthContext.js` - Authentifizierungskontext für Benutzerverwaltung

### Komponenten (Components)
- Wiederverwendbare UI-Komponenten wie Buttons, Cards, Forms
- Layout-Komponenten für konsistentes Design

## Sicherheitskonzepte

Das NOVA System implementiert folgende Sicherheitsmaßnahmen:

1. **Authentifizierung**
   - Passwort-Hashing mit bcrypt
   - JWT für zustandslose Authentifizierung
   - Token-Ablauf und -Erneuerung

2. **Autorisierung**
   - Middleware zur Überprüfung von Benutzerberechtigungen
   - Ressourcenzugriffskontrolle auf Benutzerebene

3. **Datensicherheit**
   - Validierung von Benutzereingaben
   - Schutz vor gängigen Angriffen (XSS, CSRF)
   - Sichere HTTP-Header

4. **API-Sicherheit**
   - Rate-Limiting
   - CORS-Konfiguration
   - Fehlerbehandlung ohne Informationslecks

## Erweiterungsmöglichkeiten

Das NOVA System wurde mit Erweiterbarkeit im Sinn entwickelt. Folgende Erweiterungen sind möglich:

1. **Funktionale Erweiterungen**
   - Soziale Funktionen (Freunde, Gruppen, Herausforderungen)
   - Fortgeschrittene Datenanalyse und Visualisierung
   - Integrationen mit externen Diensten (Kalender, Fitness-Apps)
   - Gamification-Erweiterungen (Abzeichen, Ranglisten)

2. **Technische Erweiterungen**
   - Mobile App mit React Native
   - Offline-Unterstützung mit Service Workers
   - Echtzeit-Updates mit WebSockets
   - Erweiterte Analytik und Benutzertracking

3. **Skalierungsmöglichkeiten**
   - Microservices-Architektur für größere Skalierung
   - Caching-Strategien für verbesserte Performance
   - Containerisierung mit Docker
   - Cloud-Deployment mit automatischer Skalierung

---

Diese Dokumentation bietet einen Überblick über die technische Architektur des NOVA Systems. Für detailliertere Informationen zu spezifischen Komponenten oder Implementierungsdetails können die entsprechenden Quellcode-Dateien konsultiert werden.
