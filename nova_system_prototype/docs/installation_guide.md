# NOVA System - Installationsanleitung

Diese Anleitung führt dich durch die Installation und Einrichtung des NOVA Systems auf deinem lokalen Computer oder Server.

## Voraussetzungen

Bevor du beginnst, stelle sicher, dass folgende Software installiert ist:

- Node.js (Version 14 oder höher)
- npm (normalerweise mit Node.js installiert)
- MongoDB (Version 4.4 oder höher)

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/nova-system/nova-prototype.git
cd nova-prototype
```

Alternativ kannst du das Projekt als ZIP-Datei herunterladen und entpacken.

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Erstelle eine Datei namens `.env` im Hauptverzeichnis des Projekts mit folgendem Inhalt:

```
MONGO_URI=mongodb://localhost:27017/nova_db
JWT_SECRET=dein_geheimer_schluessel
PORT=5000
```

Passe die Werte nach Bedarf an:
- `MONGO_URI`: Die Verbindungs-URL zu deiner MongoDB-Datenbank
- `JWT_SECRET`: Ein sicherer, zufälliger String für die JWT-Verschlüsselung
- `PORT`: Der Port, auf dem der Backend-Server laufen soll

### 4. Datenbank starten

Stelle sicher, dass dein MongoDB-Server läuft:

```bash
# Auf Linux/macOS
sudo service mongod start

# Oder mit MongoDB als Service
mongod
```

### 5. Backend-Server starten

```bash
npm run server
```

Der Server sollte nun auf dem konfigurierten Port (standardmäßig 5000) laufen.

### 6. Frontend-Entwicklungsserver starten

Öffne ein neues Terminal-Fenster und führe aus:

```bash
npm run dev
```

Der Frontend-Entwicklungsserver sollte nun starten und auf Port 3000 laufen.

### 7. Anwendung öffnen

Öffne einen Webbrowser und navigiere zu:

```
http://localhost:3000
```

Du solltest nun die Startseite des NOVA Systems sehen.

## Produktionsbereitstellung

Für eine Produktionsbereitstellung sind folgende Schritte erforderlich:

### 1. Frontend für Produktion bauen

```bash
npm run build
```

### 2. Produktionsserver starten

```bash
npm start
```

### 3. Webserver-Konfiguration (optional)

Für eine Produktionsumgebung empfehlen wir die Verwendung eines Reverse-Proxy wie Nginx oder Apache, um den Traffic zu verwalten und SSL zu konfigurieren.

Beispiel-Nginx-Konfiguration:

```nginx
server {
    listen 80;
    server_name deine-domain.de;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Fehlerbehebung

### Verbindungsprobleme mit MongoDB

- Stelle sicher, dass der MongoDB-Server läuft
- Überprüfe die MONGO_URI in der .env-Datei
- Prüfe Firewall-Einstellungen, falls die Datenbank auf einem anderen Server läuft

### Server startet nicht

- Überprüfe, ob der Port bereits verwendet wird
- Stelle sicher, dass alle erforderlichen Umgebungsvariablen gesetzt sind
- Prüfe die Konsolenausgabe auf spezifische Fehlermeldungen

### Frontend-Probleme

- Lösche den `.next`-Ordner und führe `npm run dev` erneut aus
- Stelle sicher, dass die API-URL korrekt konfiguriert ist

## Support

Bei weiteren Fragen oder Problemen wende dich bitte an das NOVA-Entwicklungsteam oder erstelle ein Issue im GitHub-Repository.
