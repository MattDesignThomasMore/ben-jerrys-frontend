# 🍨 Ben & Jerry’s Ice Configurator – Frontend App

Welkom bij de officiële **Ben & Jerry’s Ice Configurator**!  
Deze Vue 3-app stelt klanten in staat om zelf een ijsje samen te stellen in een interactieve 3D-omgeving en dit rechtstreeks te bestellen.

---

## 🧱 Tech Stack

- **Framework:** Vue 3
- **3D Rendering:** Three.js + Drei / three-stdlib
- **Routing:** Vue Router
- **Data Handling:** Fetch API naar eigen Node.js API
- **Styling:** Custom CSS (optioneel uitbreidbaar met Tailwind of andere)

---

## 🔧 Functionaliteiten

- 🔄 Interactieve 3D customizer met minstens twee instelbare parameters (zoals topping, kleur, ...).
- ✅ Orderformulier geïntegreerd na het samenstellen van een ijsje.
- 📡 Verzending van bestelling naar externe Node.js API (MongoDB backend).
- ⚙️ Geoptimaliseerd voor gebruik met een aparte admin interface.

---

## 🚀 Projectstructuur

```bash
src/
├── components/          # IceCustomizer + UI componenten
├── views/               # CustomizerView
├── router/              # Vue Router setup
├── assets/              # Textures & modellen
└── App.vue              # Rootcomponent
└── main.js              # Vue app initialisatie
```

## 🚀 Starten

```bash
npm install
npm run serve