# FitCoach — Handoff / kontekst-dokument

> Indsæt eller vedhæft hele denne fil i en ny chat for at fortsætte sømløst med en anden model.
> Den opsummerer alt det vi har bygget, hvordan det hænger sammen, hvad der er live, og hvad næste skridt er.

---

## 1. Hvad er FitCoach?
En intelligent AI-fitness-app (PWA) til **Jacob**. Den planlægger, justerer og progresserer
træning automatisk ud fra begrænset udstyr, så han bygger muskler / bliver lean / træner hele kroppen.
Vinklen er "en klog personlig træner i app-form" — den progresserer dig selv når vægten ikke kan øges.

**Bruger-kontekst (Jacob):**
- Mål: muskelopbygning + lean, hele kroppen.
- Sessions på 30 / 60 / 90 min.
- Udstyr/lokationer:
  - **Hjemme:** 2×8 kg håndvægte, 1×24 kg vægt, pull-up bar
  - **Sommerhus:** gymnastikringe + kropsvægt
  - **Kun kropsvægt:** intet udstyr
- Foretrækker engelske øvelsesnavne, danske beskrivelser. **Ikke** Google-login.

---

## 2. Live / infrastruktur
- **Hosting (live):** https://fitcoach-fc1c7.web.app  (Firebase Hosting)
- **Firebase projekt-id:** `fitcoach-fc1c7`  (Auth: Email/Password; Firestore: production-mode)
- **Firestore-regler:** brugeren kan kun læse/skrive `users/{egen-uid}` (sat i konsollen + `firestore.rules`)
- **GitHub:** https://github.com/DietzJacob/Fitcoach  (workflow-filen `.github/workflows/deploy.yml` blev midlertidigt git-ignoreret pga. manglende `workflow`-token-scope — auto-deploy via Actions er IKKE aktiv endnu)
- **Projektmappe på Mac:** `~/Desktop/fitcoach`
- **Demo-tilstand:** hvis `.env.local` mangler, kører appen lokalt på localStorage uden Firebase.

### Deploy-workflow (manuelt, virker i dag)
```bash
cd ~/Desktop/fitcoach
npm run dev        # lokal udvikling, http://localhost:5173 (Vite, hot reload)
npm run deploy     # bygger + lægger live på Firebase Hosting
```
Bemærk: `firebase login` er allerede gjort. Undgå at indsætte `# kommentarer` i terminalen
(danske apostroffer som "CLI'en" knækker zsh). Kør deploy i en **anden fane** end den der kører Vite.

---

## 3. Tech stack
- **Vite + React 18** (JSX), React Router, Recharts (grafer)
- **Firebase**: Auth (email/password) + Firestore (med offline-persistens)
- **PWA** via `vite-plugin-pwa` (installerbar, offline)
- Ingen Tailwind — alt styling i ét design-system i `src/index.css` (CSS-variabler, glas-kort, gradient-accent)
- Nøgler i `.env.local` (gitignored), aldrig hardcodet.

---

## 4. Arkitektur / filoversigt
```
src/
  index.css                 # design-system (mørk, premium, glas, gradient lime→teal→cyan, Sora+Inter)
  firebase.js               # init; isFirebaseConfigured-flag → demo-fallback
  main.jsx, App.jsx         # mount + routing (/, /session/live, /session/done, /progress, /library)
  contexts/
    AuthContext.jsx         # email/password (Google fjernet); demo-bruger hvis ukonfigureret
    StoreContext.jsx        # profil + sessions + per-øvelse states; Firestore ELLER localStorage; try/catch så UI aldrig fryser
  data/
    exercises.js            # 129 øvelser. Equipment-koder: db(2×8), kb(24), bar, rings, bw.
                            #   exercisesForLocation(home|summerhouse|bodyweight), alternativesFor(), suggestLoad(), usesWeight()
    da.js                   # danske muskelnavne (DA_MUSCLE) + danske øvelsesnavne (DA_NAME) — BRUGES IKKE til navne lige nu
                            #   (navne vises på engelsk via ex.name; daMuscle() bruges til muskel-labels)
  engine/
    config.js               # REP_ZONES (strength 4-6 / hyper 8-12 / endur 15-22), MESOCYCLE, LADDER
    progression.js          # per-øvelse state-maskine: dobbelt-progression + autoregulering (RPE/RIR) + progressions-stige
    planner.js              # buildSession(): periodisering, tidsbudget (30/60/90), muskelfordeling,
                            #   weightBias (% med vægte), shuffle (bland program). applySessionResults().
    analytics.js            # weeklyVolume, personalRecords, streakInfo, deloadSignal,
                            #   lastPerformance(), muscleRecovery() (Fitbod-friskhed 0-100%), newPRsFrom()
  hooks/useSessionContext.js# weekIndex(), lastSessionMuscles()
  components/
    MuscleIndicator.jsx     # lille krops-silhuet der lyser primær muskel op (erstattede stik-figur)
    BodyMap.jsx             # for/bagside body-map; lyser ramte muskler efter intensitet
    WeightPicker.jsx        # vælg blandt ejede vægte + ±1 + % af anslået maks (intensitet)
    RestTimer.jsx           # cirkulær nedtælling, 3 toner + vibration ved 0
    SettingsSheet.jsx       # rediger navn/mål/erfaring/dage/standard-tid/vægte
    ProgressRing.jsx        # genbrugelig ring (ikke aktivt brugt)
    ExerciseFigure.jsx, EquipmentSheet.jsx  # FORÆLDEDE (erstattet) — kan slettes
  pages/
    Login.jsx               # email/password (kun når Firebase konfigureret)
    Onboarding.jsx          # mål, erfaring, dage, tid, lokation, vægte
    Dashboard.jsx           # hero "Dagens træning" + body-map + restitutions-kort + lokation/tid/vægt-andel + bland + program-preview + streak
    Session.jsx             # LIVE: sæt-for-sæt, sidste-gang-ref, vægt-picker+%, RPE, byt-øvelse, wake-lock, vibration, forlad-bekræftelse
    Summary.jsx             # "Træning fuldført": konfetti, tid/sæt/kg, PR-fejring, body-map
    Progress.jsx            # volumen pr. muskel, total over tid, 28-dages kalender, PR'er
    Library.jsx             # 129 øvelser, filtre (lokation/muskel/søg)
```

---

## 5. Den intelligente motor (kernen)
- **Progressiv overload + autoregulering:** tracker reps/vægt/RIR pr. øvelse. Topper du rep-intervallet
  med lav RIR 2 sessioner i træk → øvelsen gøres sværere. Var det for hårdt → bakker ud.
- **Progressions-stige** (fordi vægt kun er 8/24 kg): flere reps → langsommere tempo → pause-reps →
  større ROM/deficit → kortere pauser (density) → unilateralt → sværere variant. Hvert skridt forklares på dansk.
- **Periodisering:** 4-ugers mesocyklus (hyper→styrke→hyper→udholdenhed), deload hver 5. uge.
- **Volumen/deload-signal:** ugentligt sæt-antal pr. muskel; foreslår deload ved overload/stagnation.
- **Tidsstyring:** antal øvelser/sæt/pauser passes til 30/60/90 min.
- **Muskelfordeling:** full-body, men undgår samme muskel to dage i træk.
- **muscleRecovery():** Fitbod-agtig friskhed 0-100% pr. muskel (lineær restitution ~48t, skaleret efter volumen).

---

## 6. Status — hvad er bygget (alt verificeret med esbuild-bundle, exit 0)
**Kerne:** 129 øvelser, intelligent motor, onboarding, dashboard, live-session, fremgang, bibliotek, PWA, Firebase.
**v2-runde (research + audit + løft), allerede live:**
- "Sidste gang"-reference i loggeren + vægt forudfyldes fra sidste gang
- Forlad-bekræftelse (Gem & afslut / Kassér / Fortsæt) — ikke flere tabte sæt
- Wake Lock (skærm sover ikke) + vibration ved log/RPE + stærkere pause-signal (3 toner)
- "Træning fuldført"-skærm med konfetti, tid/sæt/kg, PR-fejring, body-map
- Restitutions-kort på dashboard (friskhed pr. muskel)
- Navn fra profil (ikke hardcodet), fuld profil-redigering i ⚙️ Indstillinger
- Vægt-andel-slider (% med/uden vægte) + "🔀 Bland program"
- Muskel-indikator i stedet for stik-figurer
- Polering: kontrast (WCAG), Library `marginTop`-fix, tom-vægt-fallback

---

## 7. Konkurrent-research (Del 1) — konklusion
Førende apps: Fitbod (AI/restitution), Strong/Hevy (lynhurtig logging, "sidste gang", hvile-timer, plate-calc),
Strava/Nike (moderat gamification dobler retention), Muscle&Motion (3D-anatomi-demoer). 2026-trend: adaptiv
personalisering, AI-chat-coach, wearable-sync.

- 🟢 **Implementeret allerede:** sidste-gang-data, muskel-restitution, hurtig logging, PR-fejring.
- 🟡 **Backlog (nice-to-have):** moderat gamification (badges, uge-mål-ring), "spørg coachen"-rationale,
  bedre øvelsesdemoer (illustrationer/video).
- 🔴 **Skip (solo-PWA):** socialt feed/kudos, wearable/Apple Watch/HR-sync, overdreven gamification.

---

## 8. Backlog / udskudt (næste skridt)
1. **Redigér et allerede-logget sæt** midt i træningen (audit 🟠 — endnu ikke lavet).
2. **Rigtige øvelsesdemoer** (animation/video) — kræver ekstern medie-kilde; muskel-indikator er kun stilistisk.
3. **Moderat gamification:** badges, ugentlig mål-ring, flere fejrings-momenter.
4. **"Spørg coachen"/rationale-kort** (let AI-chat-vinkel).
5. **Superset-flow i live-mode** (motoren har tags, UI mangler).
6. **GitHub Actions auto-deploy:** workflow-filen findes lokalt men er git-ignoreret; aktivér ved at give
   GitHub-token `workflow`-scope (eller tilføj filen via GitHubs web-UI) — så deployer hvert `git push` selv.
7. Oprydning: slet forældede `ExerciseFigure.jsx` + `EquipmentSheet.jsx`; ryd evt. `.fuse_hidden*`-filer i `src/data`.
8. Evt. tag de danske navne (`da.js`) i brug som valgbart sprog.

---

## 9. Vigtige forbehold / gotchas
- **Computer-styring var slået fra** under bygningen, så UX-auditen var kode-forankret, ikke live-device-test.
- **Git i sandboxen** kunne ikke skrive i `.git` (rettighedsfejl) — al git/deploy køres i Jacobs egen terminal.
- **zsh + danske apostroffer:** indsæt ikke `# kommentarer` i terminalen.
- Firestore-regler er allerede publiceret; production-mode default (`if false`) blokerer alt, så reglerne SKAL stå.
- Arbejd direkte i `~/Desktop/fitcoach` (det er den kilde der deployes).

---

## 10. Sådan fortsætter du i en ny chat
Bed modellen om at:
1. Læse denne fil + arbejde i `~/Desktop/fitcoach`.
2. Verificere ændringer (helst esbuild-bundle eller `npm run build`) før deploy.
3. Deploye med `npm run deploy` (Jacob kører selv kommandoen i sin terminal).
4. Vælge fra backlog (afsnit 8) eller adressere Jacobs konkrete pains efter en rigtig træning.

Anbefalet næste opgave: punkt 1 (redigér logget sæt) + punkt 3 (let gamification), da de har størst daglig værdi.
