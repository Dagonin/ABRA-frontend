# Load Balancing - Dokumentacja Implementacji

## 📋 Przegląd

Projekt obsługuje teraz **load balancing** - każdy serwer może mieć wiele URL-i do równoważenia obciążenia.

---

## 🏗️ Struktura Danych

### Server Interface

```typescript
interface Server {
  id: number;           // Unikatowy identyfikator serwera
  weight: number;       // Waga serwera (priorytet w load balancingu)
  enabled: boolean;     // Czy serwer jest aktywny
  urls: string[];       // Array URL-i dla load balancingu
}
```

### Przykład Obiektu

```typescript
{
  id: 0,
  weight: 5,
  enabled: true,
  urls: [
    "https://api1.example.com",
    "https://api2.example.com",
    "https://api3.example.com"
  ]
}
```

---

## 💾 Stan Aplikacji (State Management)

### App.tsx

```typescript
const [servers, setServers] = useState<Server[]>([]);
const [nextId, setNextId] = useState(0);
```

**Funkcje zarządzające:**

1. **addServerField()**
   - Tworzy nowy serwer
   - Inicjuje z jednym pustym URL-em
   - Domyślnie włączony (`enabled: true`)
   - Domyślna waga: 5

2. **deleteServerField(id: number)**
   - Usuwa serwer z listy
   - Używa filtrowania po `id`

3. **updateServer(id: number, updatedServer: Server)**
   - Aktualizuje całą strukturę serwera
   - Zmienia: wagę, status, URL-i

---

## 🎯 Funkcjonalności Komponentu

### ServerField.tsx

**Props:**
```typescript
interface ServerFieldProps {
  server: Server;                    // Dane serwera
  onDelete: (id: number) => void;    // Callback usunięcia
  onUpdate: (id: number, updatedServer: Server) => void;  // Callback update
}
```

**Operacje:**

1. **handleToggleDisabled()** - Włączy/wyłączy serwer
2. **handleURLChange(index, value)** - Zmienia URL na indeksie
3. **handleAddURL()** - Dodaje nowy pusty URL
4. **handleDeleteURL(index)** - Usuwa URL na indeksie
5. **handleDelete()** - Usuwa cały serwer

---

## 🔄 Flow Danych

```
┌─────────────────────────────────────────┐
│          App (Parent State)              │
│  servers: Server[] | nextId: number      │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────────┐   ┌──────▼──────┐
   │ ServerField  │   │ServerField  │
   │  (serwer 0)  │   │ (serwer 1)  │
   └──────────────┘   └─────────────┘
        │                     │
        └──────────┬──────────┘
                   │
        onUpdate() / onDelete()
                   │
            App state update
```

---

## 📊 Przykład Użycia

### Dodawanie URL-a do serwera:

```typescript
// Użytkownik klika "Dodaj URL"
handleAddURL() {
  onUpdate(server.id, {
    ...server,
    urls: [...server.urls, '']  // Dodaje pusty URL
  });
}

// App.tsx aktualizuje stan
updateServer(id, updatedServer) {
  setServers(prev =>
    prev.map(s => s.id === id ? updatedServer : s)
  );
}
```

### Usuwanie URL-a:

```typescript
// Użytkownik klika X na URL-u
handleDeleteURL(index) {
  const newUrls = server.urls.filter((_, i) => i !== index);
  onUpdate(server.id, {
    ...server,
    urls: newUrls.length > 0 ? newUrls : ['']  // Min 1 URL
  });
}
```

---

## 🎨 UI Layout

### Każdy serwer zawiera:

```
┌─────────────────────────────────────────────────────┐
│ ✓ | Waga | URL 1    | 🗑️  | Usuń              │
│   |      | [Remove] |     |                       │
│   |      | URL 2    | 🗑️  |                       │
│   |      | [Remove] |     |                       │
│   |      | URL 3    | 🗑️  |                       │
│   |      | [Remove] |     |                       │
│   |      | [+ Dodaj URL]  |                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Load Balancing Logic

### Algorytm (do implementacji na backendzie):

```typescript
function selectServer(servers: Server[]) {
  // 1. Filtruj tylko włączone serwery
  const enabledServers = servers.filter(s => s.enabled);
  
  // 2. Utwórz puli z uwzględnieniem wag
  const pool: Server[] = [];
  enabledServers.forEach(server => {
    for (let i = 0; i < server.weight; i++) {
      pool.push(server);
    }
  });
  
  // 3. Losowo wybierz serwer
  return pool[Math.floor(Math.random() * pool.length)];
}

// 4. Losowo wybierz URL z serwera
function selectURL(server: Server) {
  return server.urls[Math.floor(Math.random() * server.urls.length)];
}
```

---

## 📤 Wysyłanie Danych do API

### Struktura JSON do wysłania:

```json
{
  "servers": [
    {
      "id": 0,
      "weight": 5,
      "enabled": true,
      "urls": [
        "https://api1.example.com",
        "https://api2.example.com"
      ]
    },
    {
      "id": 1,
      "weight": 3,
      "enabled": true,
      "urls": [
        "https://api3.example.com"
      ]
    }
  ]
}
```

### Przykład POST requestu:

```typescript
async function saveConfiguration(servers: Server[]) {
  const response = await fetch('/api/load-balancer/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ servers }),
  });
  return response.json();
}
```

---

## ✅ Walidacja

### Reguły:

- ✅ Każdy serwer musi mieć co najmniej 1 URL
- ✅ Waga musi być >= 0
- ✅ ID musi być unikalne
- ✅ URL powinien być poprawny (email-like validation)

### Do implementacji:

```typescript
function validateServer(server: Server): boolean {
  // Walidacja URL-i
  const urlRegex = /^https?:\/\/.+/;
  const validUrls = server.urls.every(url => url === '' || urlRegex.test(url));
  
  // Walidacja wagi
  const validWeight = server.weight >= 0;
  
  return validUrls && validWeight;
}
```

---

## 🎯 Kolejne Kroki

### 1. Backend Integration
- [ ] POST endpoint `/api/load-balancer/config`
- [ ] GET endpoint `/api/load-balancer/config`
- [ ] PUT endpoint `/api/load-balancer/config/:id`
- [ ] DELETE endpoint `/api/load-balancer/config/:id`

### 2. Walidacja
- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Error messages

### 3. Persistencja
- [ ] LocalStorage na frontendzie (cache)
- [ ] Database na backendzie (state)

### 4. Features
- [ ] Import/Export konfiguracji (JSON)
- [ ] Testowanie load balancera
- [ ] Metryki i statystyki
- [ ] History zmian

---

## 🔧 Troubleshooting

### Problem: Nie mogę usunąć ostatniego URL-a
**Rozwiązanie:** Minimum 1 URL jest wymagany. Zamiast usuwania, wyczyszczenie i dodanie nowego.

### Problem: Serwer nie reaguje na zmiany
**Rozwiązanie:** Upewnij się, że callback `onUpdate` jest prawidłowo przekazany z App.tsx.

### Problem: State nie synchronizuje się
**Rozwiązanie:** Używaj `...spread operator` aby upewnić się, że React wykryje zmiany.

---

## 📚 Przydatne Linki

- [React State Management](https://react.dev/learn/state-a-component-s-memory)
- [Load Balancing Algorithms](https://en.wikipedia.org/wiki/Load_balancing_(computing))
- [Round Robin vs Weighted Round Robin](https://www.nginx.com/resources/glossary/round-robin-load-balancing/)

---

**Ostatnia aktualizacja:** 16 listopada 2025
