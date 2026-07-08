/*
 * Candidate font names to probe with measurement-based detection.
 *
 * We can't enumerate the OS font list directly (WhatsApp disables the
 * Local Font Access API via Permissions-Policy), so instead we test each of
 * these known family names and keep the ones that are actually installed.
 * Covers macOS, Windows, Linux system fonts + popular installed/Google/dev
 * fonts. Anything not on this list can still be typed by hand in the font box.
 */
window.FONT_CANDIDATES = [
  // --- macOS system fonts ---
  "American Typewriter", "Andale Mono", "Apple Chancery", "Apple SD Gothic Neo",
  "Apple Symbols", "Athelas", "Avenir", "Avenir Next", "Avenir Next Condensed",
  "Ayuthaya", "Baghdad", "Baskerville", "Beirut", "Big Caslon", "Bodoni 72",
  "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bradley Hand", "Brush Script MT",
  "Capitals", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charcoal", "Charter",
  "Chicago", "Cochin", "Copperplate", "Courier", "Damascus", "DIN Alternate",
  "DIN Condensed", "Didot", "Futura", "Gadget", "Geeza Pro", "Geneva", "Gill Sans",
  "Helvetica", "Helvetica Neue", "Herculanum", "Hoefler Text", "Iowan Old Style",
  "Kefa", "Kokonor", "Krungthep", "Lucida Grande", "Luminari", "Marion",
  "Marker Felt", "Menlo", "Mishafi", "Monaco", "Nadeem", "New York", "Noteworthy",
  "Optima", "Palatino", "Papyrus", "Phosphate", "PT Mono", "PT Sans", "PT Serif",
  "Rockwell", "Sand", "Savoye LET", "Seravek", "SF Mono", "SF Pro Display",
  "SF Pro Text", "SignPainter", "Silom", "Skia", "Snell Roundhand", "STIXGeneral",
  "Superclarendon", "Symbol", "Techno", "Textile", "Thonburi", "Times",
  "Trattatello", "Webdings", "Wingdings", "Zapf Dingbats", "Zapfino",

  // --- Windows system fonts ---
  "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bahnschrift",
  "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Candara",
  "Cascadia Code", "Cascadia Mono", "Century Gothic", "Comic Sans MS", "Consolas",
  "Constantia", "Corbel", "Courier New", "Ebrima", "Franklin Gothic",
  "Franklin Gothic Medium", "Gabriola", "Gadugi", "Garamond", "Georgia",
  "Impact", "Ink Free", "Javanese Text", "Leelawadee UI", "Lucida Console",
  "Lucida Sans Unicode", "Malgun Gothic", "Microsoft Sans Serif", "MingLiU",
  "MS Gothic", "MS PGothic", "MV Boli", "Nirmala UI", "Palatino Linotype",
  "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Emoji", "SimSun",
  "Sitka", "Sylfaen", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
  "Yu Gothic",

  // --- Linux / cross-platform system fonts ---
  "Cantarell", "DejaVu Sans", "DejaVu Sans Mono", "DejaVu Serif", "FreeMono",
  "FreeSans", "FreeSerif", "Liberation Mono", "Liberation Sans",
  "Liberation Serif", "Nimbus Mono", "Nimbus Roman", "Nimbus Sans",
  "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono",

  // --- Popular Google / Adobe / installed web fonts ---
  "Alegreya", "Arial Unicode MS", "Barlow", "Bebas Neue", "Cabin", "Cormorant",
  "Crimson Text", "Dosis", "EB Garamond", "Exo 2", "Fira Code", "Fira Mono",
  "Fira Sans", "Hack", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Serif",
  "Inconsolata", "Inter", "JetBrains Mono", "Josefin Sans", "Karla", "Lato",
  "Libre Baskerville", "Lora", "Manrope", "Merriweather", "Montserrat",
  "Mukta", "Noto Sans", "Noto Serif", "Nunito", "Nunito Sans", "Open Sans",
  "Oswald", "PT Sans Narrow", "Playfair Display", "Poppins", "Quicksand",
  "Raleway", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Slab",
  "Rubik", "Source Code Pro", "Source Sans Pro", "Source Serif Pro", "Space Grotesk",
  "Space Mono", "Titillium Web", "Ubuntu Mono", "Work Sans", "Zilla Slab",
];
