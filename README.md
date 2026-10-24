# Árlista — Astro + Decap CMS

Magyar nyelvű, reszponzív árlista oldal. A CMS-ben módosított adatok a GitHub repó `main` ágára kerülnek commitként a GitHub backend segítségével.

## Indítás

```sh
npm install
npm run dev
```

Az oldal a `http://localhost:4321` címen, az admin felület a `http://localhost:4321/admin/` címen érhető el. A publikus oldal adatai a `src/data/arlista.json` fájlban vannak.

## GitHub mentés bekötése

1. A CMS a `HexonDev/decapcms-storage` GitHub repó `main` ágát használja.
2. A CMS GitHub backendjéhez OAuth hitelesítés szükséges. A Netlify OAuth providerrel hozz létre egy GitHub OAuth Appot a Netlify által előírt callback URL-lel, majd kapcsold be a providert a Netlify oldal beállításaiban. Alternatívaként használható Decap Turbo GitHub hitelesítés vagy saját OAuth proxy.
3. Telepítsd az oldalt egy statikus tárhelyre. A CMS használó GitHub fiókjának legyen írási jogosultsága a repóhoz. Belépés után a `/admin/` felületen mentett módosítások a GitHub `main` ágára commitolódnak.

Az admin felület használatához telepített oldal és működő OAuth szolgáltatás szükséges.

## Automatikus build és telepítés GitHub Actions segítségével

A `.github/workflows/deploy.yml` workflow minden `main` ágra érkező commitnál — így a Decap CMS árlista-mentése után is — telepíti a függőségeket, lefuttatja az Astro buildet, majd publikálja a `dist` mappát GitHub Pages-re. Az oldal címe: `https://hexondev.github.io/decapcms-storage/`. Az oldalon nem fut Node.js; a Node.js csak a GitHub Actions build környezetében kell.

Az első telepítéshez:

1. A repó **Settings → Pages** oldalán a **Build and deployment → Source** értékét állítsd **GitHub Actions**-re.
2. Ellenőrizd a repó láthatóságát: GitHub Free fióknál a Pages csak nyilvános repóból használható. Privát repóból való publikáláshoz GitHub Pro szükséges; maga a publikált Pages oldal ettől függetlenül nyilvánosan elérhető.
3. Pusholj a `main` ágra, vagy indítsd el a workflow-t a GitHub **Actions** fülén a **Run workflow** gombbal.

Ezután a Decap CMS GitHubra mentett módosításai automatikusan elindítják az új buildet és telepítést. Helyben a `npm run dev` a helyi `src/data/arlista.json` fájlt olvassa; a CMS-ben mentett legújabb verzió helyi megtekintéséhez futtasd a `git pull origin main` parancsot. A látogatóknak ezt nem kell megtenniük.

## Árlista szerkesztése

Az admin felület az oldal bevezető szövegét, ár megjegyzését, kategóriáit és tételeit szerkeszti. Az induló adatok minták, ezeket a tényleges szolgáltatásokra és árakra kell átírni. A kapcsolat gombok címe az `src/pages/index.astro` fájlban módosítható.
