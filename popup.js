/* WhatsApp Web Font Changer — popup controller */
(() => {
  "use strict";

  const STORAGE_KEY = "settings";
  const DEFAULTS = {
    enabled: true,
    fontFamily: "",
    fontSizePx: 0,
    fontWeight: "",
    scope: "messages",
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    enabled: $("enabled"),
    fontFamily: $("fontFamily"),
    fontCombo: $("fontCombo"),
    fontToggle: $("fontToggle"),
    fontMenu: $("fontMenu"),
    loadFonts: $("loadFonts"),
    fontsHint: $("fontsHint"),
    fontSize: $("fontSize"),
    fontWeight: $("fontWeight"),
    scope: () => document.querySelector('input[name="scope"]:checked'),
    scopeInputs: document.querySelectorAll('input[name="scope"]'),
    preview: $("preview"),
    reset: $("reset"),
    status: $("status"),
  };

  let allFonts = []; // full list of available font family names
  let activeIndex = -1; // keyboard-highlighted item in the open menu

  // ---------- status / form helpers ----------
  let statusTimer;
  function flash(msg) {
    els.status.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (els.status.textContent = ""), 1500);
  }

  function readForm() {
    const sizeVal = parseInt(els.fontSize.value, 10);
    return {
      enabled: els.enabled.checked,
      fontFamily: els.fontFamily.value.trim(),
      fontSizePx: Number.isFinite(sizeVal) && sizeVal > 0 ? sizeVal : 0,
      fontWeight: els.fontWeight.value,
      scope: els.scope() ? els.scope().value : "messages",
    };
  }

  function writeForm(s) {
    els.enabled.checked = s.enabled;
    els.fontFamily.value = s.fontFamily || "";
    els.fontSize.value = s.fontSizePx ? String(s.fontSizePx) : "";
    els.fontWeight.value = s.fontWeight || "";
    els.scopeInputs.forEach((r) => (r.checked = r.value === s.scope));
  }

  function updatePreview() {
    const s = readForm();
    els.preview.style.fontFamily = s.fontFamily
      ? `"${s.fontFamily}", sans-serif`
      : "";
    els.preview.style.fontSize = s.fontSizePx ? `${s.fontSizePx}px` : "";
    els.preview.style.fontWeight = s.fontWeight || "";
    els.preview.style.opacity = s.enabled ? "1" : "0.45";
  }

  function save() {
    const s = readForm();
    chrome.storage.sync.set({ [STORAGE_KEY]: s }, () => flash("Saved"));
    updatePreview();
  }

  let saveTimer;
  function saveDebounced() {
    updatePreview();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  }

  // ---------- font sources ----------

  // Primary: privileged extension API — the COMPLETE installed-font list.
  // No permission prompt, and not blocked by WhatsApp's Permissions-Policy
  // (it runs in the extension context, not on the page).
  function getSystemFontList() {
    return new Promise((resolve, reject) => {
      if (!(chrome.fontSettings && chrome.fontSettings.getFontList)) {
        resolve(null);
        return;
      }
      try {
        const maybe = chrome.fontSettings.getFontList((fonts) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(fonts);
        });
        if (maybe && typeof maybe.then === "function") maybe.then(resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Fallback: measurement-based detection over a bundled candidate list.
  function detectInstalledFonts(candidates) {
    const baseFonts = ["monospace", "serif", "sans-serif"];
    const testString = "mmmmmmmmmmlli WWWW 0123456789";
    const size = "72px";
    const ctx = document.createElement("canvas").getContext("2d");
    const baseWidth = {};
    for (const b of baseFonts) {
      ctx.font = `${size} ${b}`;
      baseWidth[b] = ctx.measureText(testString).width;
    }
    const installed = [];
    for (const font of [...new Set(candidates)]) {
      for (const b of baseFonts) {
        ctx.font = `${size} "${font}", ${b}`;
        if (Math.abs(ctx.measureText(testString).width - baseWidth[b]) > 0.5) {
          installed.push(font);
          break;
        }
      }
    }
    return installed;
  }

  async function getAllFonts() {
    try {
      const sys = await getSystemFontList();
      if (sys && sys.length) {
        const names = [
          ...new Set(sys.map((f) => f.displayName).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b));
        if (names.length) return { source: "system", fonts: names };
      }
    } catch (e) {
      console.warn("[WA Font Changer] fontSettings.getFontList failed:", e);
    }
    const detected = detectInstalledFonts(window.FONT_CANDIDATES || []).sort(
      (a, b) => a.localeCompare(b)
    );
    return { source: "detected", fonts: detected };
  }

  async function loadFonts() {
    els.loadFonts.disabled = true;
    els.loadFonts.textContent = "…";
    els.fontsHint.textContent = "Loading your installed fonts…";
    try {
      const { source, fonts } = await getAllFonts();
      allFonts = fonts;
      els.fontsHint.textContent = fonts.length
        ? `${fonts.length} fonts ${
            source === "system" ? "(all installed)" : "(detected)"
          } — click ▾ to browse, or type any name.`
        : "No fonts found — type an exact font name instead.";
      if (isMenuOpen()) renderMenu(els.fontFamily.value);
    } catch (e) {
      els.fontsHint.textContent =
        "Couldn’t load fonts — type an exact font name instead.";
      console.warn("[WA Font Changer] loadFonts failed:", e);
    } finally {
      els.loadFonts.disabled = false;
      els.loadFonts.textContent = "Rescan";
    }
  }

  // ---------- custom combobox ----------
  function isMenuOpen() {
    return !els.fontMenu.hidden;
  }

  function openMenu() {
    // Browsing: always show the FULL list (not filtered by the current
    // selection), with the selected font highlighted and scrolled into view.
    renderMenu("");
    els.fontMenu.hidden = false;
    els.fontFamily.setAttribute("aria-expanded", "true");
    // Select the text so the first keystroke replaces it → clean search.
    els.fontFamily.select();
    const sel = els.fontMenu.querySelector('li[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }

  function closeMenu() {
    els.fontMenu.hidden = true;
    els.fontFamily.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function renderMenu(filter) {
    const q = (filter || "").trim().toLowerCase();
    const matches = q
      ? allFonts.filter((f) => f.toLowerCase().includes(q))
      : allFonts;
    const current = els.fontFamily.value.trim();
    els.fontMenu.replaceChildren();
    activeIndex = -1;

    if (!matches.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = allFonts.length
        ? "No match — press Enter to use what you typed"
        : "No fonts found";
      els.fontMenu.appendChild(li);
      return;
    }

    const frag = document.createDocumentFragment();
    for (const name of matches.slice(0, 600)) {
      const li = document.createElement("li");
      li.textContent = name;
      li.setAttribute("role", "option");
      // Preview each option in its own typeface.
      li.style.fontFamily = `"${name.replace(/"/g, "")}", sans-serif`;
      if (name === current) li.setAttribute("aria-selected", "true");
      // mousedown (not click) so it fires before the input blurs.
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectFont(name);
      });
      frag.appendChild(li);
    }
    els.fontMenu.appendChild(frag);
  }

  function selectFont(name) {
    els.fontFamily.value = name;
    closeMenu();
    updatePreview();
    save();
  }

  function moveActive(delta) {
    const items = [...els.fontMenu.querySelectorAll("li:not(.empty)")];
    if (!items.length) return;
    items.forEach((i) => i.classList.remove("active"));
    activeIndex = (activeIndex + delta + items.length) % items.length;
    const el = items[activeIndex];
    el.classList.add("active");
    el.scrollIntoView({ block: "nearest" });
  }

  // Show the Brave-specific note only when actually running in Brave.
  // (The note is hidden by default in the HTML.) navigator.brave.isBrave()
  // is Brave's official detection API; it's undefined in Chrome/Edge/etc.
  function revealBraveNoteIfBrave() {
    const note = document.getElementById("braveNote");
    if (!note) return;
    try {
      const brave = navigator.brave;
      if (brave && typeof brave.isBrave === "function") {
        brave
          .isBrave()
          .then((yes) => {
            if (yes) note.hidden = false;
          })
          .catch(() => {});
      }
    } catch (e) {
      /* not Brave — leave the note hidden */
    }
  }

  // ---------- init ----------
  function init() {
    revealBraveNoteIfBrave();
    chrome.storage.sync.get(STORAGE_KEY, (data) => {
      writeForm({ ...DEFAULTS, ...(data && data[STORAGE_KEY]) });
      updatePreview();
    });

    els.enabled.addEventListener("change", save);
    els.scopeInputs.forEach((r) => r.addEventListener("change", save));
    els.fontSize.addEventListener("change", save);
    els.fontWeight.addEventListener("change", save);
    els.reset.addEventListener("click", reset);
    els.loadFonts.addEventListener("click", loadFonts);

    // Combobox wiring.
    els.fontToggle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (isMenuOpen()) {
        closeMenu();
      } else {
        els.fontFamily.focus();
        openMenu();
      }
    });
    els.fontFamily.addEventListener("focus", openMenu);
    els.fontFamily.addEventListener("click", () => {
      if (!isMenuOpen()) openMenu();
    });
    // Preserve the select-all when first clicking into the field — a click
    // would otherwise collapse the selection openMenu() just made.
    let pendingSelect = false;
    els.fontFamily.addEventListener("mousedown", () => {
      if (document.activeElement !== els.fontFamily) pendingSelect = true;
    });
    els.fontFamily.addEventListener("mouseup", (e) => {
      if (pendingSelect) {
        e.preventDefault();
        els.fontFamily.select();
        pendingSelect = false;
      }
    });
    els.fontFamily.addEventListener("input", () => {
      saveDebounced();
      // Typing filters by the typed text (open the menu if it was closed, but
      // don't call openMenu — that would reselect the text mid-typing).
      if (!isMenuOpen()) {
        els.fontMenu.hidden = false;
        els.fontFamily.setAttribute("aria-expanded", "true");
      }
      renderMenu(els.fontFamily.value);
    });
    els.fontFamily.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isMenuOpen()) openMenu();
        moveActive(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isMenuOpen()) openMenu();
        moveActive(-1);
      } else if (e.key === "Enter") {
        const items = [...els.fontMenu.querySelectorAll("li:not(.empty)")];
        if (isMenuOpen() && activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          selectFont(items[activeIndex].textContent);
        } else {
          closeMenu();
        }
      } else if (e.key === "Escape") {
        closeMenu();
      }
    });
    document.addEventListener("mousedown", (e) => {
      if (!els.fontCombo.contains(e.target)) closeMenu();
    });

    loadFonts();
  }

  function reset() {
    writeForm(DEFAULTS);
    chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULTS }, () => flash("Reset"));
    updatePreview();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
