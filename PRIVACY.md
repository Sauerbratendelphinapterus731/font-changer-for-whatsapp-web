# Privacy Policy

**Font Changer for WhatsApp Web**
Last updated: 8 July 2026

## Summary

Font Changer for WhatsApp Web does **not collect, store, transmit, sell, or share any
personal data**. There are no analytics, no tracking, no external servers, and no network
requests of any kind. Everything runs locally in your browser.

## What the extension accesses, and why

- **Your installed fonts** — read via the browser's `chrome.fontSettings` API solely to list
  them in the popup so you can choose one. This list stays in the popup; it is never stored or
  transmitted.
- **Your settings** — your chosen font, size, weight, and scope are saved with the browser's
  `chrome.storage` API so they persist between sessions. This data stays in your browser.
- **web.whatsapp.com** — the extension runs only on `https://web.whatsapp.com` to apply your
  chosen font. It changes only the page's styling. It does **not** read, collect, or transmit
  your messages, contacts, or any other page content.

## Data storage and sync

Your settings are stored locally. If your browser's built-in sync is enabled (e.g. a signed-in
Chrome or Brave profile), the browser may sync these settings across your own devices. That
syncing is performed by your browser and governed by your browser vendor's privacy policy — the
extension itself never sees or sends this data anywhere.

## Third parties

None. The extension bundles no third-party code, SDKs, analytics, or trackers, and makes no
external connections.

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save your settings so they persist. |
| `fontSettings` | List the fonts installed on your device. |
| Host access to `https://web.whatsapp.com/*` | Apply your font on WhatsApp Web only. |

## Changes

Any future change to this policy will be committed to this repository, so its history is public
and auditable.

## Contact

Questions or concerns? Please open an issue:
https://github.com/datcrack/font-changer-for-whatsapp-web/issues
