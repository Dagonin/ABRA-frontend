# Dokumentacja Projektu ABRA Frontend

## 📋 Spis Treści
1. [Przegląd Projektu](#przegląd-projektu)
2. [Technologia](#technologia)
3. [Struktura Projektu](#struktura-projektu)
4. [Komponenty](#komponenty)
5. [Instalacja i Uruchomienie](#instalacja-i-uruchomienie)
6. [Skrypty NPM](#skrypty-npm)
7. [Architektura](#architektura)

---

## 🎯 Przegląd Projektu

**ABRA Frontend** to aplikacja webowa zbudowana w React z TypeScript. Projekt stanowi frontend dla systemu zarządzania serwerami, umożliwiając użytkownikom dynamiczne dodawanie i konfigurowanie pól serwerów.

### Główne Cechy:
- ✅ Responsywny interfejs użytkownika
- ✅ Dynamiczne dodawanie serwerów
- ✅ Konfiguracja wag serwerów
- ✅ Sterowanie statusem serwerów (włączenie/wyłączenie)
- ✅ Walidacja danych wejściowych

---

## 🛠️ Technologia

### Główne Zależności:
- **React** (v19.1.1) - Biblioteka do budowania interfejsów użytkownika
- **TypeScript** (v5.9.3) - Język programowania z typowaniem
- **Vite** (v7.1.7) - Narzędzie do budowania i bundowania
- **Material-UI (MUI)** (v7.3.5) - Biblioteka komponentów UI
- **Base UI Components** (v1.0.0-beta.4) - Komponenty bez stylu

### Narzędzia Deweloperskie:
- **ESLint** (v9.36.0) - Linter kodu
- **TypeScript ESLint** - Integracja TypeScript z ESLint
- **Vite React Plugin** - Optymalizacja React w Vite

---

## 📁 Struktura Projektu

```
ABRA-frontend/
├── public/                 # Zasoby statyczne
├── src/                    # Kod źródłowy
│   ├── components/         # Komponenty React
│   │   ├── NumberField.tsx
│   │   ├── NumberField.module.css
│   │   ├── ServerField.tsx
│   │   └── ServerField.css
│   ├── assets/             # Zasoby (obrazy, ikony itp.)
│   ├── App.tsx             # Główny komponent aplikacji
│   ├── App.css             # Stylowanie aplikacji
│   ├── main.tsx            # Punkt wejścia aplikacji
│   └── index.css           # Globalne stylowanie
├── index.html              # Plik HTML
├── package.json            # Konfiguracja zależności
├── tsconfig.json           # Konfiguracja TypeScript
├── tsconfig.app.json       # Konfiguracja TypeScript dla aplikacji
├── tsconfig.node.json      # Konfiguracja TypeScript dla Vite
├── vite.config.ts          # Konfiguracja Vite
├── eslint.config.js        # Konfiguracja ESLint
└── README.md               # Dokumentacja techniczna

```

---

## 🧩 Komponenty

### 1. **App.tsx** - Komponent Główny
Główny komponent aplikacji zarządzający stanem serwerów.

**Funkcjonalność:**
- Zarządzanie listą pól serwerów
- Przycisk FAB (Floating Action Button) do dodawania nowych serwerów
- Renderowanie dynamicznej listy komponentów `ServerField`

**Stan:**
- `serverFields` - Array z ID serwerów

**Interfejs:**
```tsx
const [serverFields, setServerFields] = useState<number[]>([]);
```

---

### 2. **ServerField.tsx** - Komponent Pola Serwera
Komponent reprezentujący pojedynczy serwer z ustawieniami.

**Funkcjonalność:**
- ✅ Checkbox do włączania/wyłączania serwera
- ✅ Pole do wprowadzania URL serwera
- ✅ Pole numeryczne do ustawienia wagi (NumberField)
- ✅ Przycisk do usuwania serwera

**Stan:**
```tsx
const [isDisabled, setIsDisabled] = useState(false);
```

**Właściwości:**
- Checkbox steruje stanem `isDisabled`
- Wszystkie pola są wyłączane, gdy serwer jest nieaktywny
- Zawiera ikonę Delete dla usunięcia

**Struktura:**
```
┌─ Checkbox (włączenie/wyłączenie)
├─ NumberField (waga)
├─ TextField (URL)
└─ Button (usunięcie)
```

---

### 3. **NumberField.tsx** - Komponent Pola Numerycznego
Zaawansowany komponent do wpisywania liczb oparty na Base UI.

**Funkcjonalność:**
- Wprowadzanie wartości numerycznej
- Kontrola minimalna i maksymalna
- Przycisk + i - do zmiany wartości
- Scrubb Area - interaktywne pole do zmiany wartości poprzez przeciąganie

**Props:**
```tsx
interface NumberFieldProps {
  min?: number;        // Wartość minimalna (domyślnie: 0)
  max?: number;        // Wartość maksymalna (domyślnie: 100)
  defaultValue?: number; // Wartość domyślna (domyślnie: 10)
  disabled?: boolean;   // Czy pole jest wyłączone (domyślnie: false)
}
```

**Ikony:**
- **CursorGrowIcon** - Ikona w Scrubb Area (strzałki oznaczające drag)
- **PlusIcon** - Przycisk inkrementacji
- **MinusIcon** - Przycisk dekrementacji

**Stylesheet:**
- `NumberField.module.css` - Style modułowe (CSS Modules)

---

## 🚀 Instalacja i Uruchomienie

### Wymagania:
- Node.js (v14 lub wyżej)
- npm lub yarn

### Instalacja Zależności:
```bash
npm install
```

### Uruchomienie Serwera Deweloperskiego:
```bash
npm run dev
```
Aplikacja będzie dostępna na `http://localhost:5173`

### Budowanie Produkcji:
```bash
npm run build
```
Zbudowana aplikacja zostanie umieszczona w folderze `dist/`

### Podgląd Produkcji:
```bash
npm run preview
```

### Lintowanie Kodu:
```bash
npm run lint
```

---

## 📜 Skrypty NPM

| Skrypt | Opis |
|--------|------|
| `npm run dev` | Uruchamia serwer deweloperski z Hot Module Replacement |
| `npm run build` | Buduje aplikację dla produkcji (type check + bundling) |
| `npm run lint` | Sprawdza kod z ESLint |
| `npm run preview` | Podgląd zbudowanej aplikacji |

---

## 🏗️ Architektura

### Flow Aplikacji:

```
main.tsx (punkt wejścia)
  ↓
App.tsx (zarządzanie stanem)
  ├─ Fab Button (dodawanie)
  └─ ServerField[] (dynamiczna lista)
      ├─ Checkbox (stan włączenia)
      ├─ NumberField (konfiguracja wagi)
      ├─ TextField (URL)
      └─ Delete Button (usuwanie)
```

### Zarządzanie Stanem:

Projekt wykorzystuje React Hooks do zarządzania stanem:
- `useState` - Zarządzanie lokalnym stanem komponentów
- Każdy `ServerField` ma własny stan `isDisabled`
- `App` zarządza globalną listą pól serwerów

### Stylowanie:

- **Global CSS** (`index.css`, `App.css`) - Stylowanie globalne
- **Module CSS** (`NumberField.module.css`) - Style modułowe dla komponenty
- **Inline CSS** (MUI) - Style inline dla komponentów Material-UI

---

## 📝 Notatki Deweloperskie

### Dostęp do Danych:
Aby uzyskać dostęp do aktualnych wartości z pól:
- Waga serwera - dostępna poprzez ref do `NumberField` lub poprzez FormData
- URL serwera - z TextField
- Status serwera - z Checkbox

### Wysyłanie Danych:
Obecnie brak bezpośredniej integracji z backendem. Aby dodać:
1. Dodaj funkcję do wysyłania danych na serwer
2. Wykorzystaj fetch API lub axios
3. Dodaj obsługę błędów i loadingów

### Potencjalne Ulepszenia:
- ✨ Dodanie walidacji formularza
- ✨ Integracja z backend API
- ✨ Stan globalny (Redux/Context API)
- ✨ Testy jednostkowe (Jest/Vitest)
- ✨ Responsive design dla urządzeń mobilnych
- ✨ Persystencja danych (localStorage)

---

## 🔗 Przydatne Linki

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [Material-UI Documentation](https://mui.com)
- [Base UI Documentation](https://base-ui.com)

---

## 📄 Licencja

Projekt jest własnością zespołu Projekt Zespołowy.

---

**Ostatnia aktualizacja:** 16 listopada 2025
