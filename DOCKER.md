# 🐳 Uruchamianie Projektu w Dockerze

## 📋 Wymagania

- Docker (https://www.docker.com/products/docker-desktop)
- Docker Compose (zwykle wchodzi w pakiet Docker Desktop)

## 🚀 Szybki Start

### Opcja 1: Używając Docker Compose (REKOMENDOWANE)

```bash
# Uruchom kontener
docker-compose up -d

# Aplikacja będzie dostępna na: http://localhost:3000
```

### Opcja 2: Używając Docker CLI

```bash
# Zbuduj obraz
docker build -t abra-frontend:latest .

# Uruchom kontener
docker run -d -p 3000:3000 --name abra-frontend abra-frontend:latest

# Aplikacja będzie dostępna na: http://localhost:3000
```

---

## 🔧 Polecenia Docker Compose

### Uruchomienie kontenera w tle
```bash
docker-compose up -d
```

### Zatrzymanie kontenera
```bash
docker-compose down
```

### Wyświetlanie logów aplikacji
```bash
docker-compose logs -f abra-frontend
```

### Przebudowanie obrazu
```bash
docker-compose up -d --build
```

### Usunięcie kontenera i obrazu
```bash
docker-compose down --rmi all
```

---

## 🐳 Polecenia Docker CLI

### Budowanie obrazu
```bash
docker build -t abra-frontend:latest .
```

### Uruchamianie kontenera
```bash
docker run -d -p 3000:3000 --name abra-frontend abra-frontend:latest
```

### Zatrzymanie kontenera
```bash
docker stop abra-frontend
```

### Usunięcie kontenera
```bash
docker rm abra-frontend
```

### Usunięcie obrazu
```bash
docker rmi abra-frontend:latest
```

### Wyświetlanie logów
```bash
docker logs -f abra-frontend
```

### Wejście do kontenera (shell)
```bash
docker exec -it abra-frontend sh
```

---

## 📊 Monitorowanie

### Wyświetlenie uruchomionych kontenerów
```bash
docker ps
```

### Wyświetlenie wszystkich kontenerów (w tym zatrzymanych)
```bash
docker ps -a
```

### Wyświetlenie obrazów
```bash
docker images
```

### Statystyki kontenera (CPU, pamięć)
```bash
docker stats abra-frontend
```

---

## 🔍 Sprawdzanie Zdrowotności Kontenera

Konfiguracja Docker Compose zawiera `healthcheck` który automatycznie sprawdza, czy aplikacja działa:

```bash
# Sprawdzenie statusu zdrowotności
docker-compose ps
```

Możliwe statusy:
- ✅ `healthy` - Aplikacja działa prawidłowo
- ⚠️ `unhealthy` - Aplikacja ma problem
- 🔄 `starting` - Aplikacja się uruchamia

---

## 📁 Struktura Dockerfile

Projekt używa **multi-stage build** dla optymalizacji:

1. **Stage 1 (Builder)**: 
   - Node.js 20 Alpine
   - Instalacja zależności
   - Budowanie aplikacji
   - Generowanie folder `dist/`

2. **Stage 2 (Runtime)**:
   - Node.js 20 Alpine (lżejszy obraz)
   - Instalacja `serve` (HTTP server)
   - Kopiowanie tylko `dist/` z builder stage
   - Uruchomienie serwera na porcie 3000

### Korzyści:
- ✅ Mniejszy rozmiar obrazu (bez node_modules w produkcji)
- ✅ Szybsze wdrażanie
- ✅ Bezpieczeństwo (bez kodu źródłowego w produkcji)

---

## 🌐 Zmiana Portu

### Dla Docker Compose:
Edytuj `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Zmień 8080 na żądany port
```

### Dla Docker CLI:
```bash
docker run -d -p 8080:3000 --name abra-frontend abra-frontend:latest
```

---

## 🔐 Zmienne Środowiskowe

Jeśli chcesz dodać zmienne środowiskowe, edytuj `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - API_URL=http://api.example.com
  - DEBUG=false
```

---

## ❌ Rozwiązywanie Problemów

### Problem: Port 3000 jest już w użyciu
**Rozwiązanie:**
```bash
# Zmień port w docker-compose.yml lub użyj innego portu
docker run -d -p 8080:3000 --name abra-frontend abra-frontend:latest
```

### Problem: Kontener nie startuje
**Rozwiązanie:**
```bash
# Sprawdź logi
docker-compose logs abra-frontend

# Przebuduj obraz
docker-compose up -d --build
```

### Problem: Permissje (na Linuksie)
**Rozwiązanie:**
```bash
# Dodaj użytkownika do grupy docker
sudo usermod -aG docker $USER
```

### Problem: Docker Desktop nie startuje
**Rozwiązanie:**
- Zrestartuj Docker Desktop
- Sprawdź czy Hyper-V/WSL2 jest włączone (Windows)
- Sprawdź zasoby systemowe (RAM, CPU)

---

## 📈 Optymalizacja

### Zmniejszenie rozmiaru obrazu:
Projekt już używa:
- ✅ Alpine Linux (lżejszy system)
- ✅ Multi-stage build
- ✅ `.dockerignore` (excluduje zbędne pliki)

### Przyspieszenie buildu:
```bash
# Docker cache będzie używany automatycznie
docker-compose up -d --build
```

---

## 📝 Przykład Workflow

```bash
# 1. Klonowanie/pobranie projektu
cd ABRA-frontend

# 2. Uruchomienie w Dockerze
docker-compose up -d

# 3. Sprawdzenie statusu
docker-compose ps

# 4. Wyświetlenie logów
docker-compose logs -f

# 5. Otwieranie w przeglądarce
# http://localhost:3000

# 6. Zatrzymanie (gdy gotowe)
docker-compose down
```

---

## 🔗 Przydatne Linki

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)
- [Node.js Docker Images](https://hub.docker.com/_/node)

---

**Ostatnia aktualizacja:** 16 listopada 2025
