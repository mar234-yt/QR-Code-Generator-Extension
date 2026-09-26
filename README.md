# QR Code Generator — Chrome/Brave Extension

A tiny QR code generator extension that runs entirely in the browser.
Click the toolbar icon, get a QR code for the page you're on — or paste any link, optionally with your logo in the middle.

No build step, no server, no dependencies to install, no tracking.

## Features

- **QR code for the current tab, instantly** — the popup auto-fills the URL of the page you're on, and the **Use current tab** button re-fills it anytime; on `chrome://` and other restricted pages the button simply hides
- **Instant QR codes from any link** — codes update live as you type; `example.com` is automatically completed to `https://example.com`
- **Optional center logo** — upload any image, adjust its size with a slider, remove it anytime
- **One-click PNG export** — crisp ~1024 px image with proper quiet zone, named after the domain (e.g. `qrcode-example.com.png`)
- **Stays scannable with a logo** — automatically switches to error-correction level H (up to 30% damage tolerance) when a logo is added, and renders a white pad behind the logo for a clean cutout
- **Fully offline and private** — everything is generated locally in your browser; nothing is ever uploaded. The only permission requested is `activeTab`, used solely to read the current tab's URL when you open the popup
- **Zero runtime dependencies** — the QR library ships inside the extension

## Installation

1. Download and unzip `QR-Code-Generator-Extension.zip` (or clone this folder)
2. Open `chrome://extensions` (Chrome) or `brave://extensions` (Brave)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `QR-Code-Generator-Extension` folder
5. Pin the extension to your toolbar for one-click access

To pick up changes after editing the code: save your edits and hit the reload icon on the extension's card in `chrome://extensions`.

## Usage

Click the toolbar icon. The current tab's URL is already filled in — the QR code is ready before you type anything. Edit the link, add a logo, or hit **Download PNG**.

## Adding a logo

Click **Add image** and pick a file (PNG, JPG, SVG — transparency works). A few tips:

- The default size (~22% of the code) is a safe choice; the slider goes up to 30%
- Simple, high-contrast logos scan best
- If you push the size to the max, test-scan with your phone before printing and/or sharing
- Square-ish logos look best; other aspect ratios are letterboxed onto a white pad

## How it works

- **QR generation** — [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase, bundled as `qrcode.js` so the extension works offline
- **Manifest V3 layout** — MV3 forbids inline scripts in extension pages, so the original single HTML file is split into `popup.html`, `popup.js`, and `qrcode.js`. The UI itself is unchanged
- **Current-tab autofill** — uses `chrome.tabs.query` with the `activeTab` permission. Clicking the toolbar icon counts as the required user gesture, so the popup can read the active tab's URL without requesting broad "read all your tabs" access
- **On-screen preview** — rendered as scalable SVG; the logo is layered on top as an absolutely positioned image
- **Logo safety** — with a logo present, codes are generated with error-correction level **H** (instead of M), which is what allows the center modules to be covered while remaining decodable
- **PNG export** — modules are drawn onto a canvas at high resolution, a rounded white pad is painted in the center, and the logo is composited on top with aspect ratio preserved

## Project structure

```
QR-Code-Generator-Extension/
├── manifest.json     # MV3 manifest — popup wiring, icons, activeTab permission
├── popup.html        # the app UI: markup and styles, unchanged from the single-file version
├── popup.js          # app logic + current-tab autofill
├── qrcode.js         # qrcode-generator library (external file — MV3 forbids inline scripts)
└── icons/            # toolbar and extension-page icons (16 / 48 / 128 px)
```

## License

MIT. The bundled [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library is also MIT-licensed, © Kazuhiko Arase.
