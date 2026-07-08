/*
 * WhatsApp Web Font Changer — content script
 *
 * Reads the user's saved settings from chrome.storage.sync and applies them to
 * WhatsApp Web by pushing a *constructed* stylesheet into document.adoptedStyleSheets.
 * Constructed stylesheets created in the content-script isolated world are NOT
 * subject to the page's Content-Security-Policy, so this works even though
 * WhatsApp ships a strict CSP. The same sheet object is re-filled whenever the
 * settings change, giving instant live updates with no page reload.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "settings";

  const DEFAULTS = {
    enabled: true,
    fontFamily: "", // "" = don't override the font family
    fontSizePx: 0, // 0  = don't override the font size
    fontWeight: "", // "" = don't override the weight; else "100".."900"
    scope: "messages", // "messages" | "interface"
  };

  /*
   * Scope roots.
   *  - messages : the open conversation pane (#main) — bubbles, header, composer.
   *  - interface: the whole app shell (#app).
   * WhatsApp obfuscates its class names, so we deliberately target stable
   * structural containers plus generic text nodes rather than hashed classes.
   * If WhatsApp ever renames #main / #app, update these two constants only.
   */
  const SCOPE_ROOTS = {
    messages: "#main",
    interface: "#app",
  };

  // Elements we must never restyle: icon glyph fonts, emoji, and raster/vector art.
  const EXCLUSIONS =
    ":not([data-icon]):not(.emoji):not([class*='icon']):not(svg):not(path):not(img)";

  // One constructed sheet, reused for the life of the page.
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  function cssEscapeFamily(name) {
    // Quote the family and neutralise any stray quotes/backslashes.
    return name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function buildCss(settings) {
    if (!settings.enabled) return "";

    const root = SCOPE_ROOTS[settings.scope] || SCOPE_ROOTS.messages;
    const target = `${root} ${EXCLUSIONS}`;
    const rules = [];

    // --- font-family + font-size, applied to the root and all text descendants ---
    const decls = [];
    if (settings.fontFamily && settings.fontFamily.trim()) {
      decls.push(
        `font-family: "${cssEscapeFamily(settings.fontFamily.trim())}", sans-serif !important;`
      );
    }
    const size = Number(settings.fontSizePx);
    if (size && size > 0) {
      decls.push(`font-size: ${size}px !important;`);
    }
    if (decls.length) {
      rules.push(`${root}, ${target} {\n  ${decls.join("\n  ")}\n}`);
    }

    // --- font-weight, on the same targets but skipping <b>/<strong> so
    //     intentional bold (WhatsApp's *bold* text, headers) stays bold. ---
    const weight = String(settings.fontWeight || "").replace(/[^0-9]/g, "");
    if (weight && Number(weight) >= 100 && Number(weight) <= 900) {
      const noBold = `${EXCLUSIONS}:not(b):not(strong)`;
      rules.push(
        `${root}:not(b):not(strong), ${root} ${noBold} {\n  font-weight: ${weight} !important;\n}`
      );
    }

    return rules.join("\n");
  }

  function apply(settings) {
    const merged = { ...DEFAULTS, ...(settings || {}) };
    try {
      sheet.replaceSync(buildCss(merged));
    } catch (err) {
      // replaceSync throws only on malformed CSS; degrade to no override.
      console.warn("[WA Font Changer] failed to apply styles:", err);
      sheet.replaceSync("");
    }
  }

  // Initial load.
  chrome.storage.sync.get(STORAGE_KEY, (data) => {
    apply(data && data[STORAGE_KEY]);
  });

  // Live updates when the popup writes new settings.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes[STORAGE_KEY]) return;
    apply(changes[STORAGE_KEY].newValue);
  });
})();
