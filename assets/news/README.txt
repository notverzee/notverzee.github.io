This folder holds every published news article's image plus a single
index file, news-archive.json, that lists every article ever published
(newest first when sorted by id). This is what powers three things:

  - The bell icon in the header (shows the 3 most recent)
  - The homepage banner at the top of /Home/ (same 3, rotating)
  - The /News/ tab — "previously published news" — which lists
    EVERY entry in this file, not just the latest 3

You normally never have to hand-edit this file. Use Developer Mode
(/Dev/, passcode set in /news-common.js) to write a new article —
it fetches the live news-archive.json, adds your new entry to it,
generates the matching /News/<id>/index.html article page, and
bundles all of it (updated json + new page + new image) into a zip
for you to upload.

FORMAT — news-archive.json is a JSON array. Each entry:

  {
    "id": 2,                              — unique, increasing number
    "title": "Season 2 Announced",        — headline
    "shortDescription": "...",            — 1-2 sentences, shown in the
                                             banner and bell dropdown
    "image": "/assets/news/article-2.png",— banner image for this entry
    "link": "https://...",                — the article page's own
                                             "Learn More" / external link
    "permalink": "/News/2/",              — the permanent article page
    "publishedAt": "2026-08-05"           — YYYY-MM-DD
  }

Images: roughly a 21:8 landscape ratio (e.g. 1200x460px) works best —
that's the shape the banner and article hero use.

IMPORTANT: "id" must be unique and should only ever go up — Developer
Mode handles this automatically by using (current highest id + 1) for
each new article, so you shouldn't need to think about it unless
you're editing this file by hand.
