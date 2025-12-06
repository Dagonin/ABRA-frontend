1111111# Dokumentacja Projektu ABRA (Frontend + Backend)

## 📋 Spis Treści
1. [Przegląd Systemu](#przegląd-systemu)
2. [Cel Biznesowy](#cel-biznesowy)
3. [Technologie](#technologie)
4. [Architektura Wysokiego Poziomu](#architektura-wysokiego-poziomu)
5. [Model Danych (Backend)](#model-danych-backend)
6. [Relacje Encji](#relacje-encji)
7. [API Backend – Skrót](#api-backend--skrót)
8. [Front‑end – Struktura i Komponenty](#front‑end--struktura-i-komponenty)
9. [Przepływ Ruchu i Logika Variantów](#przepływ-ruchu-i-logika-variantów)
10. [Środowisko Uruchomieniowe](#środowisko-uruchomieniowe)
11. [Uruchomienie – Kroki Szybkie](#uruchomienie--kroki-szybkie)
12. [Docker / Mock Serwery](#docker--mock-serwery)
13. [Load Balancing – Założenia](#load-balancing--założenia)
14. [Walidacje i Ograniczenia](#walidacje-i-ograniczenia)
15. [Monitoring i Diagnostyka](#monitoring-i-diagnostyka)
16. [Scenariusz Prezentacyjny (Demo Script)](#scenariusz-prezentacyjny-demo-script)
17. [Roadmap / Potencjalne Ulepszenia](#roadmap--potencjalne-ulepszenia)
18. [Troubleshooting](#troubleshooting)
19. [Licencja](#licencja)
20. [Historia Zmian](#historia-zmian)

---

## 🎯 Przegląd Systemu
ABRA to system do zarządzania i kierowania ruchem testowym między różnymi wariantami oraz endpointami usług (np. serwerów aplikacyjnych). Umożliwia:
- Definiowanie domen testowych (Domain)
- Definiowanie testów / eksperymentów (TestModel) powiązanych z domeną
- Zarządzanie wariantami (VariantModel) z wagami (procent ruchu) i opisem
- Powiązywanie konkretnych endpointów (EndpointModel) z wariantami lub bezpośrednio domeną
- Ekspozycję interfejsu REST dla panelu administracyjnego oraz frontendu

Frontend (React + Vite) stanowi warstwę prezentacji do konfiguracji systemu. Backend (Spring Boot) zapewnia logikę, trwałość (H2 / opcjonalnie PostgreSQL) oraz routing.

## 💼 Cel Biznesowy
Umożliwić szybkie wykonywanie testów A/B / eksperymentów poprzez:
- Elastyczne dodawanie wariantów z wagami
- Przypisywanie do nich listy działających endpointów
- Monitorowanie ich żywotności (pole `alive`) i aktywności (`isActive`)
W efekcie – kontrola procentowego rozkładu ruchu oraz możliwość szybkiego wyłączania elementów.

## 🛠 Technologie
Backend:
- Spring Boot 3.5.7 (Web, Data JPA, Validation, Actuator, DevTools)
- JPA / Hibernate
- Baza: H2 (dev) / PostgreSQL (docelowo) – obecnie aktywna H2 in‑memory
- springdoc-openapi (Swagger UI)

Frontend:
- React 19 + TypeScript
- Vite 7 (szybki bundler / dev server)
- MUI (Material UI) + @emotion (stylowanie)
- ESLint + TypeScript ESLint

Inne:
- Mock serwery Node (`ABRA-mock-servers`) do symulacji backendów docelowych
- Docker / docker-compose (konteneryzacja komponentów)

## 🧱 Architektura Wysokiego Poziomu
```
┌──────────────────────────────────────────────────────────────┐
│                          Frontend (React)                   │
│  - Konfiguracja domen, testów, wariantów, endpointów         │
│  - Komunikacja REST z backendem /api                         │
└───────────────▲─────────────────────────────────────────────┘
                │ HTTP (JSON)
┌───────────────┴─────────────────────────────────────────────┐
│                       Backend (Spring Boot)                 │
│  - Warstwa REST Controllers                                 │
│  - Serwisy: logika biznesowa                                │
│  - Repositories: dostęp do danych                           │
│  - RoutingService (wybór wariantu / endpointu docelowego)   │
│  - HealthCheckService                                       │
└───────────────▲─────────────────────────────────────────────┘
                │ JPA/Hibernate
┌───────────────┴─────────────────────────────────────────────┐
│                           Baza Danych (H2)                  │
└──────────────────────────────────────────────────────────────┘
```

## 🗃 Model Danych (Backend)
Encje (uproszczone pola kluczowe):
- Domain: `domainId (PK)`, `host`, `isActive`
- TestModel: `testId (PK)`, `name`, `subpath`, `description`, `isActive`, FK → Domain
- VariantModel: `variantId (PK)`, `name`, `weight (1..100)`, `description`, `isActive`, FK → TestModel
- EndpointModel: `url (PK)`, `description`, `alive`, `isActive`, FK → VariantModel (opcjonalnie), FK → Domain (opcjonalnie)

## 🔗 Relacje Encji
- Domain 1..* TestModel
- TestModel 1..* VariantModel
- VariantModel 1..* EndpointModel (lista endpointów dla wariantu)
- EndpointModel może być też powiązany bezpośrednio z domeną (fallback / ogólne endpointy)

## 🌐 API Backend – Skrót
Base URL: `http://localhost:8080/api`

Przykładowe endpointy (najważniejsze):
- `GET /api/domains` / `POST /api/domains`
- `GET /api/tests` / `POST /api/tests`
- `GET /api/variants` / `POST /api/variants`
- `GET /api/variants/{id}` – szczegóły wariantu
- `GET /api/variants/{id}/endpoints` – (NOWY) lista endpointów przypisanych do wariantu
- `POST /api/endpoints` – dodanie endpointu
- `GET /api/routing/{testId}` – wybór wariantu i docelowego endpointu (logika eksperymentu)

Dokumentacja interaktywna: `http://localhost:8080/swagger-ui/index.html`
Zdrowie aplikacji: `http://localhost:8080/actuator/health`
Konsola H2: `http://localhost:8080/h2-console`

## 🖥 Front‑end – Struktura i Komponenty
Struktura katalogów: (szczegóły jak poprzednio)
```
src/
  components/
    ServerField.tsx
    NumberField.tsx
  api/
    client.ts      // konfiguracja klienta HTTP (fetch/axios)
    endpoints.ts   // funkcje pobierające endpointy
    variants.ts    // funkcje obsługi wariantów
```
Główne komponenty:
- `App.tsx` – zarządzanie listą serwerów / wariantów (UI)
- `ServerField.tsx` – pojedynczy wpis serwera / endpointu
- `NumberField.tsx` – kontrola wartości liczbowej (waga, limit)

## 🔁 Przepływ Ruchu i Logika Variantów
1. Klient (np. zewnętrzny użytkownik) odwołuje się do ścieżki testu (subpath) – np. `/promo`.
2. Backend (RoutingService) pobiera wszystkie aktywne warianty testu.
3. Wariant wybierany jest wg proporcji `weight` (sumarycznie ≤ 100). (Algorytm: losowanie liczb 1..100 i mapping do przedziałów wagowych.)
4. Z wybranego wariantu pobierany jest aktywny endpoint (lub fallback domenowy).
5. Ruch kierowany do wybranego URL (w przyszłości proxy / redirect / agregacja).

## ⚙ Środowisko Uruchomieniowe
Plik `application.properties` (dev):
```
spring.datasource.url=jdbc:h2:mem:abradb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
```
Port backendu: `8080`
Port frontend: `5173`

Zmiana na PostgreSQL (docelowo):
```
spring.datasource.url=jdbc:postgresql://localhost:5432/abra
spring.datasource.username=postgres
spring.datasource.password=***
spring.jpa.hibernate.ddl-auto=update
```

## 🚀 Uruchomienie – Kroki Szybkie
Backend:
```powershell
cd ABRA-backend
./gradlew.bat bootRun -x test
```
Frontend:
```powershell
cd ABRA-frontend
npm install
npm run dev
```
Mock serwery (opcjonalnie):
```powershell
cd ABRA-mock-servers
npm install
node server.js
```

## 🐳 Docker / Mock Serwery
- `ABRA-mock-servers/Dockerfile` – budowanie prostego serwera Node
- Możliwe rozszerzenie: docker-compose spinający backend + mock endpoints.
- Docelowo: konteneryzacja frontu (build statyczny + nginx) i backendu (JAR + JDK slim).

## ⚖ Load Balancing – Założenia
Opis szczegółowy w `LOAD_BALANCING.md`. Skrót:
- Wagi wariantów muszą sumować się do maks. 100.
- Warianty nieaktywne (isActive=false) są pomijane.
- Endpointy z `alive=false` (lub `isActive=false`) nie są używane w wyborze.
- Planowane: health-check cykliczny + automatyczne wykluczanie zepsutych endpointów.

## ✅ Walidacje i Ograniczenia
- `weight`: [1..100]
- `url`: unikalny (PK), max 50 znaków
- `description`: max 500 znaków
- Unikalność `host` w Domain
- (TODO) Walidacja spójności sumy wag wariantów testu

## 🔍 Monitoring i Diagnostyka
- `Actuator /health` – podstawowa diagnostyka
- Plan: dodać `/actuator/metrics` + niestandardowe metryki (liczba wywołań wariantu).
- H2 console do szybkiej inspekcji danych.

## 🎬 Scenariusz Prezentacyjny (Demo Script)
1. Uruchom backend (log startu + H2 console dostępna).
2. Otwórz Swagger UI i pokaż endpoint `GET /api/variants/{id}/endpoints` (dodany niedawno).
3. W frontendzie dodaj kilka serwerów / konfiguracje wag.
4. Pokaż jak można dezaktywować serwer i wpływa to na UI.
5. Utwórz test + warianty przez API (POST) i wywołaj routing.
6. Zademonstruj łatwość resetu środowiska (restart – H2 create-drop).

## 🛣 Roadmap / Potencjalne Ulepszenia
- Persistencja konfiguracji frontu (localStorage / backend sync)
- Globalny store (Redux / Zustand / Context)
- Zaawansowany routing (proxy forward) zamiast tylko wybrania endpointu
- System metryk (Prometheus / Grafana)
- Panel statystyk (użycia wariantów, error rate)
- Automatyczny health check + TTL dla `alive`
- Autoryzacja (JWT / OAuth2) – panel admina
- Testy jednostkowe i E2E (Jest + Playwright)

## 🛠 Troubleshooting
| Problem | Możliwa Przyczyna | Rozwiązanie |
|--------|-------------------|-------------|
| 404 na `.../variants/{id}/endpoints` | Brak endpointu w kontrolerze | Upewnij się, że metoda `@GetMapping("/{id}/endpoints")` jest obecna i backend restartowany |
| Brak dostępu do H2 console | Nie włączono `spring.h2.console.enabled` | Dodaj w `application.properties` i zrestartuj |
| Port 8080 zajęty | Inny proces Java / Tomcat | Zweryfikuj: `netstat -ano | findstr :8080` i ubij proces |
| Wagi nie działają | Nieaktywne warianty w teście | Sprawdź `isActive` przy każdym wariancie |
| Endpoint niewybierany | `alive=false` lub `isActive=false` | Zaktualizuj status przez API |

## 📄 Licencja
Projekt jest własnością zespołu „Projekt Zespołowy”. Wewnętrzne użycie edukacyjne – brak publicznej licencji.

## 🗂 Historia Zmian
- 2025-11-16 – Pierwsza wersja dokumentacji frontendu
- 2025-11-24 – Rozszerzenie dokumentacji o backend, routing, scenariusz demo, troubleshooting

---

**Ostatnia aktualizacja:** 24 listopada 2025
