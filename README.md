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

## Netlify telepítés és élő Git-adat

A `netlify.toml` beállítja az Astro buildet (`npm run build`, `dist`) és kihagyja az új buildet, ha egy commit csak az `src/data/arlista.json` fájlt módosítja. A publikus oldal az `/api/arlista` Netlify Functionön keresztül kéri le a JSON-t a privát GitHub-repóból, ezért az árlista változása nem igényel új buildet. A nyitva hagyott oldalon percenként frissül az adat.

1. A Netlify-ban válaszd az **Add new site → Import an existing project** lehetőséget, csatlakoztasd a GitHubot, majd importáld a `HexonDev/decapcms-storage` repót.
2. Hozz létre egy GitHub fine-grained tokent kizárólag ehhez a repóhoz, `Contents: read-only` jogosultsággal. A token értékét a Netlify site environment variables beállításában add meg `GITHUB_READ_TOKEN` néven. Ne tedd be a repóba vagy a böngésző kódjába.
3. A CMS GitHub belépéséhez külön OAuth provider kell. A Netlify OAuth providerében telepítsd a GitHub providert. A GitHub OAuth App Homepage URL-je a Netlify oldal címe, az Authorization callback URL pedig `https://api.netlify.com/auth/done`. A Client ID és Client secret értékeket a Netlify OAuth beállításainál add meg.
4. Az első telepítés és a token beállítása után a `/admin/` CMS-ben mentett JSON változás nem indít új buildet; az oldal a GitHub `main` ágáról friss adatot kap.

Helyi, élő Git-adatot használó teszthez állítsd be a `GITHUB_READ_TOKEN` környezeti változót a terminálban, majd indítsd el az Astro oldalt és a Netlify Functions fejlesztői kiszolgálót a Netlify CLI-vel (`npx netlify dev`). A sima `npm run dev` csak helyi JSON előnézetet szolgál ki.

## Árlista szerkesztése

Az admin felület az oldal bevezető szövegét, ár megjegyzését, kategóriáit és tételeit szerkeszti. Az induló adatok minták, ezeket a tényleges szolgáltatásokra és árakra kell átírni. A kapcsolat gombok címe az `src/pages/index.astro` fájlban módosítható.
