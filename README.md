# Kote Homestay website (v5)

Plain HTML, CSS and JavaScript. No build step. Upload the whole folder to any web host (it must be served over **https** for the app-install and offline features).

## 1. Set your details (one command)
```
python3 configure.py --domain https://www.yourdomain.com --whatsapp 919876543210 \
  --phone "+91 98765 43210" --instagram yourhandle --map "Kote Homestay, Chikkamagaluru"
```
This fills in the domain (SEO tags, sitemap, robots.txt), the WhatsApp number, phone, Instagram and map. You can also edit the `CONFIG` block at the top of `js/app.js` by hand.

## 2. Live Google reviews (optional but recommended)
Add `--place-id ChIJ...` and `--maps-key AIza...`. Enable "Maps JavaScript API" and "Places API (New)" in Google Cloud, and restrict the key to your website address. Until then the section shows buttons to read and write reviews (the write link is already set).
Google returns at most 5 reviews and chooses them itself, and its rules do not allow saving review text, so reviews are fetched live on every visit.

## 3. Photos and videos
`images/` holds responsive .webp versions of your photos, `video/` holds the compressed films. To add or swap a photo, replace the file keeping its name, or ask for a rebuild.

## What is in the page
Video hero with photo slideshow fallback (pause button), WhatsApp booking bar, films with play-on-tap, room carousels, washroom strip, "A day at Kote" tabs, gallery with filters and a lightbox that plays videos, trail map, FAQ, enquiry form to WhatsApp, 15-second popup, Google reviews slider above the footer, floating WhatsApp/Instagram buttons, sticky contact bar on phones, installable offline-ready PWA.

## SEO
Title, description, canonical, Open Graph and Twitter tags, JSON-LD (LodgingBusiness, 2 videos, FAQ), sitemap.xml, robots.txt, alt text, responsive images. After going live, add the site in Google Search Console and submit `sitemap.xml`, and claim your Google Business Profile.
