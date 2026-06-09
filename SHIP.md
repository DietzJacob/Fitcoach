# SHIP — motor-fixes + Horisont v3

Fire filer er ændret. Alt er verificeret med `npm run build` (exit 0) og motortesten
(`node src/engine/_test.mjs`). Klassenavne og CSS-variabler er bevaret, så dine
v2-komponenter (Summary, SettingsSheet osv.) renderer uden ændringer — de får bare
det nye look.

## Indhold

| Fil | Ændring |
|---|---|
| `src/engine/planner.js` | Periodiserings-drift fixet: 5-ugers blok (4 træningsuger + deload), fasen forskydes aldrig mere |
| `src/engine/progression.js` | Cruise-fix: top-reps med RIR ≥ 3 avancerer nu stigen ("for let"-besked) + density-trinnet er synligt i prescriptionen |
| `src/engine/analytics.js` | `weeklyVolume` tæller kun loggede sæt — deload-signalet bygger på virkelighed, ikke plan |
| `src/index.css` | Designsystem v3 »Horisont« — drop-in, bagudkompatibel |

## Sådan ruller du (i din terminal)

```bash
cd ~/Desktop/fitcoach

# 1. SIKKERHED FØRST — commit alt dit lokale v2-arbejde, så du kan rulle tilbage
git add -A && git commit -m "v2 snapshot foer Horisont" && git push

# 2. Pak filerne fra zip'en oveni projektet (de fire filer overskrives)
unzip -o ~/Downloads/fitcoach-horisont.zip -d .

# 3. Byg og se det lokalt
npm run build && npm run dev
# → åbn http://localhost:5173 og klik rundt

# 4. Når du er tilfreds (i en ANDEN fane, jf. dine egne noter)
npm run deploy
git add -A && git commit -m "Motor-fixes + Horisont v3" && git push
```

## Én manuel rettelse (din lokale Dashboard.jsx er nyere end repoet, så jeg rører den ikke)

Vægt-slideren nulstilles ikke når man vælger "Kropsvægt". Tilføj i `Dashboard.jsx`,
lige under de øvrige hooks:

```js
useEffect(() => { if (location === 'bodyweight') setWeightBias(0) }, [location])
```

(og tilføj `useEffect` til React-importen øverst, hvis den ikke er der.)

## Hvis noget ser skævt ud

- v3 fjerner bevidst: glas-blur, neongradient-mesh i baggrunden og den spinnende
  hero-animation. Det er ikke en fejl — det er retningen.
- Emoji-ikoner i bundnavigationen tones nu ned (gråskala når inaktive). Næste
  naturlige skridt er streg-SVG'er som i prototypen — sig til, så laver jeg dem
  som komponent.
- Rulle tilbage: `git checkout -- src/index.css src/engine/` (eller hele committet).

## Hvad jeg bevidst IKKE rørte (kræver din lokale v2-kode)

1. Redigér logget sæt (backlog #1) — næste opgave, vil du have den?
2. Sessions → Firestore-subcollection (1 MiB-bomben fra reviewet)
3. Rest-skærm med kontekst + sol-mod-horisont-timeren fra prototypen
