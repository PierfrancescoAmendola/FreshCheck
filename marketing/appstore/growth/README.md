# FreshCheck growth setup (App Store Connect)

Set up on 2026-11-05 for app 6757205025, mirroring what was done for SubTracker.
Everything was created through the logged-in App Store Connect page (`/iris/v1/...`)
and sent to review in one submission (`30fe986b-6c51-4297-adb0-5e908a7056e6`).

## In-app events

Copy and schedule: `../events/events.json`. Art: `../events/<scene>/card-1920x1080.jpg` and
`details-1080x1920.jpg`, rendered by `python3 marketing/appstore/events/build.py` from `events/event.html`
(the food artwork is read from `creative/template.html`). The art has no text, so one image pair is
uploaded for `it` and reused by every other locale through Asset Library placements.

| Event | Id | Badge | Live (UTC) | Purchase |
|---|---|---|---|---|
| Settimana zero sprechi | 6831041155 | Challenge | 21-29 Nov 2026, published from 7 Nov | none |
| Avanzi delle feste | 6831041190 | Special event | 22 Dec 2026 - 6 Jan 2027, published from 8 Dec | in-app purchase (recipes are Pro) |
| Dispensa in ordine | 6831041191 | Challenge | 7-31 Jan 2027, published from 1 Jan | none |

Deep link: `com.anonymous.freshcheck://pantry`. The release build registers the scheme but has no
linking config, so the link opens the app on its home screen.

## Custom product pages

Config: `custom-product-pages.json` (promotional text in 10 languages, screenshot order, keywords).
All screenshots and the header / search results creative come from the Asset Library images of
version 2.0.1, so nothing was re-uploaded. Each page has app keywords assigned, so it can show in
search for those terms.

| Page | Id | First screenshots | Keywords (it) |
|---|---|---|---|
| Scansione codice a barre | b694fac2-2238-4f07-8570-313d53c3c056 | 02 add/scan, 01, 05 | codice a barre |
| Ricette con ciò che scade | 8f0c5bd8-0819-41ac-b6c3-b12bd770a9e0 | 03 recipes, 01, 02 | ricette |
| Risparmio e lista della spesa | e20b0d5b-20c5-466e-acfd-9501fe0a9005 | 04 savings, 06 shopping list | spesa, lista spesa, spreco |

Page URL: `https://apps.apple.com/app/id6757205025?ppid=<id>`. Use these links in ads, social
posts and the website for the matching message.

## Product page optimization

Test `7d4bfcb8-4c33-4606-a95f-a1ce320f616c` "Primo screenshot: scansione vs ricette", 66% of traffic
split between two treatments (about one third each), 10 locales, iPhone and iPad:

- Scansione per prima: 02, 01, 03, 04, 05, 06, 07, 08
- Ricette per prime: 03, 01, 02, 04, 05, 06, 07, 08

After approval the test must be started from App Store Connect. Read results after a few weeks
in Product Page Optimization, and apply the winning order to the default product page.
