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

## Netlify automatikus telepítés

A `netlify.toml` beállítja az Astro statikus buildjét (`npm run build`, `dist`). Importáld a GitHubon lévő `HexonDev/decapcms-storage` repót a Netlify-ba. Ezután a Netlify minden `main` ágra érkező commit — így a Decap CMS árlista-mentése — után automatikusan újraépíti és közzéteszi a statikus oldalt. Nincs saját alkalmazás-backend vagy futásidejű GitHub-token; az Astro build a repóban lévő JSON-ot olvassa be.

1. A Netlify-ban válaszd az **Add new site → Import an existing project** lehetőséget, csatlakoztasd a GitHubot, majd importáld a `HexonDev/decapcms-storage` repót. A build parancs `npm run build`, a publikálási mappa `dist`.
2. A CMS GitHub belépéséhez OAuth provider kell. A Netlify OAuth providerében telepíts GitHub providert. A GitHub OAuth App Homepage URL-je a Netlify oldal címe, az Authorization callback URL pedig `https://api.netlify.com/auth/done`. A Client ID és Client secret értékeket a Netlify OAuth beállításainál add meg.
3. Ezután a `/admin/` felületen ments egy módosítást. A commit a GitHub `main` ágára kerül, a Netlify automatikus deployja pedig frissíti a publikus oldalt.

Helyben a `npm run dev` a helyi `src/data/arlista.json` fájlt mutatja. Ha a CMS-ből mentett legújabb verziót helyben is meg akarod nézni, egyszer húzd le a változást: `git pull origin main`. A látogatóknak erre nincs szükségük, mert a Netlify végzi az automatikus deployt.

## Árlista szerkesztése

Az admin felület az oldal bevezető szövegét, ár megjegyzését, kategóriáit és tételeit szerkeszti. Az induló adatok minták, ezeket a tényleges szolgáltatásokra és árakra kell átírni. A kapcsolat gombok címe az `src/pages/index.astro` fájlban módosítható.
