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

## Árlista szerkesztése

Az admin felület az oldal bevezető szövegét, ár megjegyzését, kategóriáit és tételeit szerkeszti. Az induló adatok minták, ezeket a tényleges szolgáltatásokra és árakra kell átírni. A kapcsolat gombok címe az `src/pages/index.astro` fájlban módosítható.
