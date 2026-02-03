# Goa Trailer Web

A modern, mobile-first Goa trip teaser page with playful Yes/No interactions, a Goa video section, and WhatsApp sharing.

## Project structure

- `index.html` – main page
- `style.css` – styles
- `web.js` – interaction logic
- `goa.mp4` – Goa video file (place this in the **same folder** as `index.html`)

## Video playback

The trip card contains a `<video>` element that plays `goa.mp4` when the user clicks **Yes**.

- The video is referenced as:
  ```html
  <video id="goa-video" class="trip-video" playsinline preload="auto">
    <source src="goa.mp4" type="video/mp4" />
  </video>
  ```
- Make sure `goa.mp4` is in the same directory as `index.html`.
- On mobile, confetti is disabled while the video is showing to keep playback smooth.

If the video is not visible on desktop, double-check that:

1. `goa.mp4` exists next to `index.html`.
2. The filename matches exactly (including case).
3. Your local dev server is serving static files from this directory.

## WhatsApp share behavior

The **Share on WhatsApp** button uses `window.location.href` to build the share text:

```js
const text = encodeURIComponent(
  `I'm planning a Goa escape! 🌴✨ Wanna join me?\n\nCheck this out: ${window.location.href}`
);
const url = `https://wa.me/?text=${text}`;
window.open(url, "_blank");
```

### What you will see locally

When running the site locally (e.g. via `http://localhost:3000` or `http://192.168.x.x:5500`), WhatsApp will show and share **that local address**. This is expected during development.

### What happens after deployment

After you deploy the site (Netlify, Vercel, GitHub Pages, etc.), `window.location.href` will automatically be your **live URL** (for example, `https://your-domain.com/`), so WhatsApp will share the deployed link without any extra changes.

In short:

- **Development** → shares your local IP/localhost URL.
- **Production (deployed)** → shares your live site URL.

### Optional: hard-code a production URL

If you prefer to always share a specific deployed URL regardless of where the page is running, you can replace the `window.location.href` part with your domain, for example:

```js
const siteUrl = "https://your-domain.com/";
const text = encodeURIComponent(
  `I'm planning a Goa escape! 🌴✨ Wanna join me?\n\nCheck this out: ${siteUrl}`
);
```

This is optional; the default behavior (using `window.location.href`) is usually enough.
