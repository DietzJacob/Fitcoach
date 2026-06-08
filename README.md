# 🏋️ FitCoach — din intelligente AI personlige træner

En adaptiv full-body træningsapp. Den planlægger, justerer og progresserer din
træning automatisk ud fra dit udstyr, din tid og hvordan dine sæt føles —
bygget som en PWA (virker på desktop, mobil og offline).

> **Du kan køre appen med det samme uden Firebase** (data gemmes lokalt i
> browseren = "demo-tilstand"). Firebase tilføjer login og synk på tværs af enheder.

---

## Hvad den kan

- **129 øvelser** for hele kroppen med målmuskler, udstyr, sværhedsgrad,
  teknik-cues og en animeret figur pr. bevægelsesmønster.
- **3 lokationer / udstyrssæt** — vælg og se kun øvelser du faktisk kan udføre:
  - 🏠 **Hjemme:** 2×8 kg håndvægte, 1×24 kg vægt, pull-up bar
  - 🌲 **Sommerhus:** gymnastikringe + kropsvægt
  - 🤸 **Kun kropsvægt:** intet udstyr
- **Sessions på 30 / 60 / 90 min** — antal øvelser, sæt og pauser tilpasses tiden.
- **Intelligent progression** (se nedenfor).
- **Live session-mode:** ét sæt ad gangen, store +/- knapper, pause-timer med lyd, RPE/RIR-input.
- **Fremgang:** grafer, ugentligt volumen pr. muskelgruppe, PR'er, streak og 28-dages kalender.
- **Dark mode**, responsivt, store touch-venlige knapper, installerbar som app.

## Den kloge logik

Alt ligger i `src/engine/` som rene, testbare funktioner.

- **Progressiv overload (`progression.js`):** tracker reps, vægt og RIR pr. øvelse.
  Rammer du toppen af rep-intervallet med lav RIR to gange i træk, gøres øvelsen sværere.
- **Begrænset vægt? Ingen problem.** Da du kun har 8 kg og 24 kg, kan vægten sjældent
  øges. Appen klatrer derfor op ad en **progressions-stige**:
  flere reps → langsommere tempo → pause-reps → større ROM/deficit → kortere pauser
  (density) → unilateralt → sværere variant. Hvert skridt forklares i appen (på dansk).
- **Autoregulering:** efter hvert sæt vælger du hvor hårdt det var (RIR). Var det for
  hårdt (RIR 0 og under målet), bakker den ud; var det let nok, skubber den på.
- **Periodisering (`config.js` + `planner.js`):** 4-ugers mesocyklus der veksler mellem
  styrke (4–6), hypertrofi (8–12) og udholdenhed (15–22), med en planlagt **deload** hver 5. uge.
- **Volumenstyring + deload-signal (`analytics.js`):** holder øje med ugentligt sæt-antal
  pr. muskelgruppe og foreslår deload ved høj akkumulering eller stagnation.
- **Tidsstyring:** sæt, øvelsesantal og pauselængde beregnes så sessionen passer til 30/60/90 min.
- **Smart fordeling:** full-body hver gang, men emphasis roterer så samme muskel ikke
  smadres to dage i træk.

---

## Kom i gang (terminal)

Kræver **Node.js 18+**.

```bash
npm install        # installer afhængigheder
npm run dev        # kør lokalt på http://localhost:5173 (demo-tilstand)
npm run build      # byg produktionsversion til /dist
npm run preview    # se den byggede version lokalt
```

Åbn `http://localhost:5173`, gennemfør onboarding, og start din første træning.
Uden Firebase gemmes alt lokalt på din enhed.

---

## Tilføj Firebase (login + synk på tværs af enheder)

### 1. Opret projekt
1. Gå til <https://console.firebase.google.com> → **Add project**.
2. Giv det et navn (fx `fitcoach`), fuldfør opsætningen.

### 2. Slå Authentication til
1. I venstremenuen: **Build → Authentication → Get started**.
2. Aktivér **Email/Password** (og evt. **Google**).

### 3. Opret Firestore-database
1. **Build → Firestore Database → Create database**.
2. Vælg en region (fx `eur3`), start i **production mode**.

### 4. Hent dine config-nøgler
1. **Project settings (tandhjul) → General → Your apps → Web (</>)**.
2. Registrér appen, kopiér værdierne fra `firebaseConfig`.

### 5. Indsæt nøglerne (holdes ude af koden via .env)
```bash
cp .env.example .env.local
```
Udfyld `.env.local` med dine værdier:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
`.env.local` er allerede i `.gitignore` — nøglerne havner aldrig i git.
Genstart `npm run dev`. Appen skifter automatisk fra demo-tilstand til rigtig login.

---

## Deploy

### Firebase Hosting (anbefalet)
```bash
npm install -g firebase-tools
firebase login
# sæt dit projekt-id i .firebaserc (erstat "your-project-id")
firebase deploy --only firestore:rules   # upload sikkerhedsregler én gang
npm run deploy                            # bygger + deployer hosting
```
`firestore.rules` sikrer at hver bruger kun kan læse/skrive sine egne data.

### Alternativ: GitHub + Vercel/Netlify
Push til GitHub, importér repoet i Vercel eller Netlify, sæt
`VITE_FIREBASE_*` som environment-variabler i deres dashboard. Build-kommando
`npm run build`, output-mappe `dist`.

---

## Projektstruktur
```
src/
  data/exercises.js      # 129 øvelser + udstyrs-/lokationsfiltrering
  engine/
    config.js            # rep-zoner, mesocyklus, progressions-stige
    progression.js       # per-øvelse overload + autoregulering
    planner.js           # sessionsbygger, periodisering, tidsstyring
    analytics.js         # volumen, PR'er, streak, deload-signal
  contexts/              # Auth + datalag (Firestore eller localStorage)
  components/            # animeret figur, pause-timer
  pages/                 # Login, Onboarding, Dashboard, Session, Progress, Library
  firebase.js            # init (læser .env, kører i demo hvis ukonfigureret)
```

## Smarte features du måske ikke havde tænkt på (indbygget)
- Animeret figur pr. bevægelsesmønster i stedet for tunge GIF-assets (virker offline).
- Pause-timer med Web Audio-bip — ingen lydfiler nødvendige.
- Auto-deload baseret på reelt volumen og stagnation, ikke bare kalenderen.
- Offline-persistens i Firestore, så data overlever et tabt signal midt i træningen.

## Idéer til næste iteration (se bunden af mit svar)
