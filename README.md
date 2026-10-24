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

## Képfeltöltés Cloudflare R2-be

A Decap CMS **Média** fülén feltöltött képek a Git repó `public/uploads` mappájába kerülnek, és a GitHub Actions következő buildje után automatikusan megjelennek a külön **Képek** galéria szekcióban. Külön galériaképet az **Árlista → Képek galéria** listában adhatsz hozzá; itt a `r2-image` mező az R2-be tölti a képet. Az árlista egyes tételeinél lévő `r2-image` mezővel feltöltött fájlok szintén megjelennek a galériában. A bucket nem nyilvános; a Worker csak a képek GET lekérését teszi nyilvánossá, feltölteni pedig titkos jelszóval lehet. A jelszó nincs a CMS kódjába írva.

Első beállítás:

1. A Cloudflare irányítópulton hozz létre egy R2 bucketet. A projekt jelenlegi konfigurációja a `decapstorage` nevet használja.
2. Nyiss terminált a projekt `r2-uploader` mappájában, majd futtasd:

   ```sh
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put UPLOAD_TOKEN
   ```

   A titok bekérésekor adj meg egy hosszú, véletlenszerű jelszót, és tartsd meg jelszókezelőben. Ezt kell majd beírni a CMS képmezőjébe. Ne tedd Gitbe.
3. A `public/admin/config.yml` már a `https://arlista-r2-uploader.stancz-mate.workers.dev/api/upload` címet használja. Ha később új Worker-címet kapsz, ezt az `upload_url` értéket frissítsd.
4. Nyisd meg a CMS-t, egy árlista tételének **Kép (Cloudflare R2)** mezőjében írd be a feltöltési jelszót és válassz JPEG, PNG, GIF vagy WebP képet. A feltöltött kép URL-je bekerül a mezőbe; ezután a CMS-ben külön mentsd el az árlistát is.

A feltöltés maximum 5 MB-os képeket fogad, és csak a GitHub Pages webhelyről vagy helyi `localhost:4321` fejlesztői címről engedélyezett. A jelszót a CMS csak az aktuális böngészőfül session tárában jegyzi meg. A CMS-ből a kép hivatkozásának törlése nem törli a fájlt az R2-ből.

## Árlista szerkesztése

Az admin felület az oldal bevezető szövegét, ár megjegyzését, kategóriáit és tételeit szerkeszti. Az induló adatok minták, ezeket a tényleges szolgáltatásokra és árakra kell átírni. A kapcsolat gombok címe az `src/pages/index.astro` fájlban módosítható.
