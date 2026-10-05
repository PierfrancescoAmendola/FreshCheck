# 🌱 FreshCheck

**Traccia le scadenze. Riduci gli sprechi. Risparmia.**

FreshCheck è un'app mobile minimalista per iOS e Android che ti aiuta a gestire le scadenze dei tuoi prodotti alimentari, riducendo gli sprechi e risparmiando denaro.

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

---

## ✨ Caratteristiche

- 📦 **Gestione Prodotti Intuitiva** - Aggiungi, modifica ed elimina prodotti con pochi tocchi
- 🔔 **Notifiche Intelligenti** - Ricevi avvisi 2 giorni prima, il giorno stesso e dopo la scadenza
- 🎨 **Design Minimalista** - Interfaccia pulita ispirata all'estetica Apple
- 🌓 **Tema Dark/Light** - Supporto completo per modalità chiara, scura e automatica
- 🔐 **100% Privacy** - Tutti i dati salvati localmente, nessun server esterno
- 🎯 **Indicatori Visivi** - Colori dinamici (verde, giallo, rosso) per stato di scadenza
- 📱 **Onboarding Guidato** - Tutorial interattivo per nuovi utenti
- 🗂️ **Categorie Personalizzate** - Latticini, Carne, Frutta/Verdura e altro

---

## 📱 Screenshot

*[Aggiungi qui gli screenshot dell'app]*

---

## 🚀 Installazione e Setup

### Prerequisiti
- Node.js 18+
- npm o yarn
- Expo CLI
- Xcode (per iOS) o Android Studio (per Android)

### Installazione

```bash
# Clona la repository
git clone https://github.com/PierfrancescoAmendola/FreshCheck.git
cd FreshCheck

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npx expo start
```

### Build per produzione

#### iOS
```bash
# Genera il progetto nativo iOS
npx expo prebuild --platform ios

# Apri in Xcode
open ios/freshcheck.xcworkspace
```

#### Android
```bash
# Genera il progetto nativo Android
npx expo prebuild --platform android

# Build APK
cd android && ./gradlew assembleRelease
```

---

## 🏗️ Architettura

```
AppScadenza/
├── src/
│   ├── components/       # Componenti riutilizzabili
│   │   ├── FoodCard.tsx
│   │   ├── AddFoodModal.tsx
│   │   ├── FloatingButton.tsx
│   │   └── SettingsButton.tsx
│   ├── screens/          # Schermate dell'app
│   │   ├── OnboardingScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── PrivacyScreen.tsx
│   ├── contexts/         # Context API
│   │   └── ThemeContext.tsx
│   ├── utils/            # Utility functions
│   │   ├── dateUtils.ts
│   │   ├── notifications.ts
│   │   └── storage.ts
│   ├── constants/        # Costanti e temi
│   │   └── theme.ts
│   └── types.ts          # TypeScript types
├── App.tsx               # Entry point
└── app.json              # Configurazione Expo
```

---

## 🛠️ Tecnologie Utilizzate

- **React Native** - Framework per app mobile cross-platform
- **Expo** - Toolchain per sviluppo React Native
- **TypeScript** - Type safety e migliore DX
- **AsyncStorage** - Persistenza dati locale
- **Expo Notifications** - Sistema di notifiche push locali
- **React Native Gesture Handler** - Gestione gesture (swipe-to-delete)
- **Lucide React Native** - Icone moderne e leggere

---

## 📄 Documentazione

- [Informativa Privacy](PRIVACY.md)
- [Supporto e FAQ](SUPPORT.md)

---

## 🤝 Contribuire

I contributi sono benvenuti! Se vuoi contribuire:

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📝 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

---

## 👨‍💻 Autore

**Pierfrancesco Amendola**

- GitHub: [@PierfrancescoAmendola](https://github.com/PierfrancescoAmendola)

---

## 🙏 Ringraziamenti

- Design ispirato alle linee guida Apple Human Interface
- Icone da [Lucide Icons](https://lucide.dev/)
- Community React Native ed Expo

---

**⭐ Se ti piace questo progetto, lascia una stella su GitHub!**
