// ==========================================
// Memormon Card Creator — Logic
// All data persists in localStorage
// ==========================================

// --- Rarity display info ---
const RARITIES = {
  everyday:   { label: "Everyday",   symbol: "♡",  cssClass: "rarity-everyday" },
  favorite:   { label: "Favorite",   symbol: "♡♡", cssClass: "rarity-favorite" },
  milestone:  { label: "Milestone",  symbol: "★",  cssClass: "rarity-milestone" },
  epic:       { label: "Epic",       symbol: "★★", cssClass: "rarity-epic" },
  legendary:  { label: "Legendary",  symbol: "👑", cssClass: "rarity-legendary" },
};

const PACK_COLORS = ["#7c3aed","#0e7a00","#c2410c","#0369a1","#b45309","#be185d","#0f766e","#1d4ed8"];

// --- State ---
let packs = [];       // Array of { id, name, emoji, description, coverColor, sortOrder }
let cards = [];       // Array of { id, packId, title, caption, date, rarity, image }
let selectedPackId = null;
let editingPackId = null;
let editingCardId = null;
let previewImageData = null; // base64 for live preview only

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  renderPacks();
  updateStats();
  setupPreviewListeners();

  document.getElementById("pack-color").addEventListener("input", (e) => {
    document.getElementById("pack-color-hex").textContent = e.target.value;
  });

  document.getElementById("import-file").addEventListener("change", handleImport);
  document.getElementById("zip-import-file").addEventListener("change", handleZipImport);
});

// --- LocalStorage ---

function loadFromStorage() {
  try {
    packs = JSON.parse(localStorage.getItem("memormon-packs") || "[]");
    cards = JSON.parse(localStorage.getItem("memormon-cards") || "[]");
  } catch {
    packs = [];
    cards = [];
  }
}

function saveToStorage() {
  localStorage.setItem("memormon-packs", JSON.stringify(packs));
  localStorage.setItem("memormon-cards", JSON.stringify(cards));
  updateStats();
}

function updateStats() {
  const el = document.getElementById("stats");
  el.textContent = `${packs.length} packs · ${cards.length} cards`;
}

// --- ID generation ---

function makeId(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ==========================================
// PACKS
// ==========================================

function renderPacks() {
  const list = document.getElementById("pack-list");
  list.innerHTML = "";

  if (packs.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No packs yet. Create one or import a ZIP!</p></div>';
    return;
  }

  const sorted = [...packs].sort((a, b) => a.sortOrder - b.sortOrder);

  sorted.forEach((pack) => {
    const packCards = cards.filter((c) => c.packId === pack.id);
    const cardCount = packCards.length;
    const draftCount = packCards.filter((c) => c.date === "0000-00-00").length;

    const div = document.createElement("div");
    div.className = "pack-item" + (pack.id === selectedPackId ? " active" : "");
    div.innerHTML = `
      <span class="pack-emoji">${pack.emoji}</span>
      <div class="pack-info">
        <div class="pack-name">${pack.name}</div>
        <div class="pack-card-count">
          ${cardCount} card${cardCount !== 1 ? "s" : ""}${draftCount > 0 ? ` · <span class="draft-pill">${draftCount} need dates</span>` : ""}
        </div>
      </div>
      <button class="edit-btn" onclick="event.stopPropagation(); editPack('${pack.id}')">✏️</button>
    `;
    div.addEventListener("click", () => selectPack(pack.id));
    list.appendChild(div);
  });
}

function selectPack(packId) {
  selectedPackId = packId;
  hidePackForm();
  hideCardForm();
  renderPacks();
  renderCards();
}

function showPackForm(packId) {
  editingPackId = packId || null;
  const form = document.getElementById("pack-form");
  const title = document.getElementById("pack-form-title");
  const deleteBtn = document.getElementById("delete-pack-btn");

  if (packId) {
    const pack = packs.find((p) => p.id === packId);
    title.textContent = "Edit Pack";
    document.getElementById("pack-name").value = pack.name;
    document.getElementById("pack-emoji").value = pack.emoji;
    document.getElementById("pack-desc").value = pack.description;
    document.getElementById("pack-color").value = pack.coverColor;
    document.getElementById("pack-color-hex").textContent = pack.coverColor;
    deleteBtn.hidden = false;
  } else {
    title.textContent = "New Pack";
    document.getElementById("pack-name").value = "";
    document.getElementById("pack-emoji").value = "";
    document.getElementById("pack-desc").value = "";
    document.getElementById("pack-color").value = "#7c3aed";
    document.getElementById("pack-color-hex").textContent = "#7c3aed";
    deleteBtn.hidden = true;
  }

  form.hidden = false;
  document.getElementById("pack-name").focus();
}

function hidePackForm() {
  document.getElementById("pack-form").hidden = true;
  editingPackId = null;
}

function editPack(packId) {
  showPackForm(packId);
}

function savePack() {
  const name = document.getElementById("pack-name").value.trim();
  const emoji = document.getElementById("pack-emoji").value.trim();
  const description = document.getElementById("pack-desc").value.trim();
  const coverColor = document.getElementById("pack-color").value;

  if (!name) { alert("Pack name is required"); return; }

  if (editingPackId) {
    const pack = packs.find((p) => p.id === editingPackId);
    pack.name = name;
    pack.emoji = emoji;
    pack.description = description;
    pack.coverColor = coverColor;
  } else {
    packs.push({
      id: makeId("pack"),
      name,
      emoji,
      description,
      coverColor,
      sortOrder: packs.length,
    });
  }

  saveToStorage();
  hidePackForm();
  renderPacks();
}

function deletePack() {
  if (!editingPackId) return;
  const packCards = cards.filter((c) => c.packId === editingPackId);
  if (packCards.length > 0) {
    if (!confirm(`This pack has ${packCards.length} cards. Delete them too?`)) return;
    cards = cards.filter((c) => c.packId !== editingPackId);
  }
  packs = packs.filter((p) => p.id !== editingPackId);
  if (selectedPackId === editingPackId) selectedPackId = null;

  saveToStorage();
  hidePackForm();
  renderPacks();
  renderCards();
}

// ==========================================
// CARDS
// ==========================================

function renderCards() {
  const list = document.getElementById("card-list");
  const title = document.getElementById("card-list-title");
  const addBtn = document.getElementById("add-card-btn");
  const draftCountEl = document.getElementById("draft-count");

  if (!selectedPackId) {
    title.textContent = "Select a pack to view cards";
    addBtn.hidden = true;
    draftCountEl.hidden = true;
    list.innerHTML = "";
    return;
  }

  const pack = packs.find((p) => p.id === selectedPackId);
  title.textContent = `${pack.emoji} ${pack.name}`;
  addBtn.hidden = false;

  const packCards = cards
    .filter((c) => c.packId === selectedPackId)
    .sort((a, b) => {
      // Put "0000-00-00" placeholders at the top so they're easy to find
      if (a.date === "0000-00-00" && b.date !== "0000-00-00") return -1;
      if (b.date === "0000-00-00" && a.date !== "0000-00-00") return 1;
      return new Date(a.date) - new Date(b.date);
    });

  const draftCount = packCards.filter((c) => c.date === "0000-00-00").length;
  if (draftCount > 0) {
    draftCountEl.textContent = `${draftCount} need review`;
    draftCountEl.hidden = false;
  } else {
    draftCountEl.hidden = true;
  }

  if (packCards.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No cards in this pack yet.</p></div>';
    return;
  }

  list.innerHTML = "";
  packCards.forEach((card) => {
    const rarity = RARITIES[card.rarity];
    const isPlaceholderDate = card.date === "0000-00-00";
    const div = document.createElement("div");
    div.className = "card-item" + (isPlaceholderDate ? " card-item-draft" : "");
    div.innerHTML = `
      <div class="card-item-title">${card.title}</div>
      <div class="card-item-caption">${card.caption || '<em class="needs-edit">no caption</em>'}</div>
      <div class="card-item-meta">
        <span class="${isPlaceholderDate ? "date-missing" : ""}">${isPlaceholderDate ? "⚠ date needed" : card.date}</span>
        <span class="card-item-rarity ${rarity.cssClass}">${rarity.symbol} ${rarity.label}</span>
      </div>
      <div class="card-item-image ${card.image ? "" : "missing"}">
        ${card.image || "⚠ No image set"}
      </div>
    `;
    div.addEventListener("click", () => editCard(card.id));
    list.appendChild(div);
  });
}

function showCardForm(cardId) {
  if (!selectedPackId && !cardId) { alert("Select a pack first"); return; }

  editingCardId = cardId || null;
  previewImageData = null;
  const form = document.getElementById("card-form");
  const title = document.getElementById("card-form-title");
  const deleteBtn = document.getElementById("delete-card-btn");

  if (cardId) {
    const card = cards.find((c) => c.id === cardId);
    title.textContent = "Edit Card";
    document.getElementById("card-title").value = card.title;
    document.getElementById("card-caption").value = card.caption;
    // Show placeholder date as empty so the date picker works naturally
    document.getElementById("card-date").value = card.date === "0000-00-00" ? "" : card.date;
    document.getElementById("card-rarity").value = card.rarity;
    document.getElementById("card-image").value = card.image;
    deleteBtn.hidden = false;
  } else {
    title.textContent = "New Card";
    document.getElementById("card-title").value = "";
    document.getElementById("card-caption").value = "";
    document.getElementById("card-date").value = "";
    document.getElementById("card-rarity").value = "everyday";
    document.getElementById("card-image").value = "";
    deleteBtn.hidden = true;
  }

  document.getElementById("card-image-preview").value = "";
  form.hidden = false;
  updateCardPreview();
  document.getElementById("card-title").focus();
}

function hideCardForm() {
  document.getElementById("card-form").hidden = true;
  editingCardId = null;
  previewImageData = null;
}

function editCard(cardId) {
  showCardForm(cardId);
}

function saveCard() {
  const title = document.getElementById("card-title").value.trim();
  const caption = document.getElementById("card-caption").value.trim();
  const dateRaw = document.getElementById("card-date").value;
  const date = dateRaw || "0000-00-00";
  const rarity = document.getElementById("card-rarity").value;
  const image = document.getElementById("card-image").value.trim();

  if (!title) { alert("Card title is required"); return; }

  if (editingCardId) {
    const card = cards.find((c) => c.id === editingCardId);
    card.title = title;
    card.caption = caption;
    card.date = date;
    card.rarity = rarity;
    card.image = image;
  } else {
    cards.push({
      id: makeId("card"),
      packId: selectedPackId,
      title,
      caption,
      date,
      rarity,
      image,
    });
  }

  saveToStorage();
  hideCardForm();
  renderCards();
  renderPacks();
}

function saveCardAndNew() {
  saveCard();
  showCardForm();
}

function deleteCard() {
  if (!editingCardId) return;
  if (!confirm("Delete this card?")) return;
  cards = cards.filter((c) => c.id !== editingCardId);
  saveToStorage();
  hideCardForm();
  renderCards();
  renderPacks();
}

// ==========================================
// LIVE PREVIEW
// ==========================================

function setupPreviewListeners() {
  ["card-title", "card-caption", "card-date", "card-rarity", "card-image"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateCardPreview);
  });

  document.getElementById("card-image-preview").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImageData = ev.target.result;
      updateCardPreview();
      const imageInput = document.getElementById("card-image");
      if (!imageInput.value) imageInput.value = file.name;
    };
    reader.readAsDataURL(file);
  });
}

function updateCardPreview() {
  const title = document.getElementById("card-title").value || "Card Title";
  const caption = document.getElementById("card-caption").value || "Caption text";
  const date = document.getElementById("card-date").value || "YYYY-MM-DD";
  const rarity = document.getElementById("card-rarity").value;
  const rarityInfo = RARITIES[rarity];

  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-caption").textContent = caption;
  document.getElementById("preview-date").textContent = date;

  const rarityEl = document.getElementById("preview-rarity");
  rarityEl.textContent = `${rarityInfo.symbol} ${rarityInfo.label}`;
  rarityEl.className = "preview-rarity " + rarityInfo.cssClass;

  const previewCard = document.getElementById("card-preview");
  previewCard.style.borderColor = `var(--${rarity})`;

  const previewImage = document.getElementById("preview-image");
  if (previewImageData) {
    previewImage.textContent = "";
    previewImage.style.backgroundImage = `url(${previewImageData})`;
  } else {
    previewImage.textContent = "📷";
    previewImage.style.backgroundImage = "none";
  }
}

// ==========================================
// EXPORT / IMPORT JSON
// ==========================================

function exportData() {
  const exportPacks = packs.map((p, i) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    coverColor: p.coverColor,
    sortOrder: i,
  }));

  const exportCards = cards.map((c) => ({
    id: c.id,
    packId: c.packId,
    title: c.title,
    caption: c.caption,
    date: c.date,
    rarity: c.rarity,
    image: c.image,
  }));

  downloadJSON(exportPacks, "packs.json");
  setTimeout(() => downloadJSON(exportCards, "cards.json"), 500);

  const missingImages = exportCards.filter((c) => !c.image).length;
  const placeholderDates = exportCards.filter((c) => c.date === "0000-00-00").length;

  let msg = `Exported ${exportPacks.length} packs and ${exportCards.length} cards.\n\n`;
  msg += "Next steps:\n";
  msg += "1. Move packs.json and cards.json to content/\n";
  msg += "2. Copy image subfolders to content/images/\n";
  msg += "   e.g. content/images/highschoolsweethearts/\n";
  msg += "3. Run: npm run build-content\n";
  if (missingImages > 0) msg += `\n⚠ ${missingImages} card(s) have no image filename.`;
  if (placeholderDates > 0) msg += `\n⚠ ${placeholderDates} card(s) still have placeholder dates (0000-00-00).`;
  alert(msg);
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  document.getElementById("import-file").click();
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);

      if (Array.isArray(data) && data.length > 0) {
        if ("coverColor" in data[0]) {
          if (confirm(`Import ${data.length} packs? This will replace existing packs.`)) {
            packs = data;
            saveToStorage();
            renderPacks();
          }
        } else if ("rarity" in data[0]) {
          if (confirm(`Import ${data.length} cards? This will replace existing cards.`)) {
            cards = data;
            saveToStorage();
            renderCards();
            renderPacks();
          }
        } else {
          alert("Unrecognized JSON format.");
        }
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

// ==========================================
// ZIP IMPORT
// ==========================================

function triggerZipImport() {
  document.getElementById("zip-import-file").click();
}

async function handleZipImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";

  // Check JSZip is available (CDN might be blocked offline)
  if (typeof JSZip === "undefined") {
    alert("JSZip library not loaded. Make sure you have an internet connection for the CDN scripts.");
    return;
  }

  showImportProgress("Reading zip file…", 0);

  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    hideImportProgress();
    alert("Could not open zip file: " + err.message);
    return;
  }

  // Collect image entries — skip macOS artifacts and hidden files
  const imageExt = /\.(jpe?g|png|heic|heif|webp|gif)$/i;
  const imageEntries = [];
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (relativePath.startsWith("__MACOSX")) return;
    if (relativePath.split("/").some((p) => p.startsWith("."))) return;
    if (imageExt.test(relativePath)) {
      imageEntries.push({ relativePath, entry });
    }
  });

  if (imageEntries.length === 0) {
    hideImportProgress();
    alert("No image files found in the zip.\nSupported formats: JPG, PNG, HEIC, HEIF, WebP, GIF");
    return;
  }

  // Determine the folder name for content/images/<folderName>/
  // If all images share a single top-level directory, use that; otherwise use the zip filename.
  const topFolderCounts = {};
  imageEntries.forEach(({ relativePath }) => {
    const parts = relativePath.split("/");
    if (parts.length > 1) {
      topFolderCounts[parts[0]] = (topFolderCounts[parts[0]] || 0) + 1;
    }
  });
  const topFolders = Object.keys(topFolderCounts);
  let folderName;
  if (topFolders.length === 1 && topFolderCounts[topFolders[0]] === imageEntries.length) {
    folderName = topFolders[0];
  } else {
    // Images at root or mixed — sanitize the zip filename for use as folder name
    folderName = file.name
      .replace(/\.zip$/i, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");
  }

  // Create a new pack with a placeholder name
  const newPack = {
    id: makeId("pack"),
    name: "New Pack — edit me",
    emoji: "📸",
    description: "",
    coverColor: PACK_COLORS[packs.length % PACK_COLORS.length],
    sortOrder: packs.length,
  };
  packs.push(newPack);

  // Process each image
  let imported = 0;
  let skipped = 0;
  const exifrAvailable = typeof exifr !== "undefined";

  for (let i = 0; i < imageEntries.length; i++) {
    const { relativePath, entry } = imageEntries[i];
    const pct = Math.round(((i + 1) / imageEntries.length) * 100);
    updateImportProgress(`Processing ${i + 1} / ${imageEntries.length}: ${entry.name}`, pct);

    // Always use just the base filename (no sub-path within the zip folder)
    const baseName = relativePath.split("/").pop();
    const imageField = folderName + "/" + baseName;

    // Skip if a card with this image path already exists
    if (cards.some((c) => c.image === imageField)) {
      skipped++;
      continue;
    }

    // Try to extract EXIF DateTimeOriginal
    let date = "0000-00-00";
    if (exifrAvailable) {
      try {
        const arrayBuffer = await entry.async("arraybuffer");
        const exifData = await exifr.parse(arrayBuffer, ["DateTimeOriginal"]);
        if (exifData?.DateTimeOriginal) {
          const d = new Date(exifData.DateTimeOriginal);
          if (!isNaN(d.getTime())) {
            // Use local date to match when the photo was actually taken
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            date = `${y}-${m}-${day}`;
          }
        }
      } catch (_) {
        // No EXIF or unsupported format — keep placeholder
      }
    }

    // Use the filename (without extension) as a placeholder title
    const titleBase = baseName
      .replace(/\.[^.]+$/, "")       // strip extension
      .replace(/[-_]+/g, " ")        // underscores/hyphens → spaces
      .trim();

    cards.push({
      id: makeId("card"),
      packId: newPack.id,
      title: titleBase,
      caption: "",
      date,
      rarity: "everyday",
      image: imageField,
    });
    imported++;
  }

  saveToStorage();
  hideImportProgress();

  // Open the new pack
  selectPack(newPack.id);
  renderPacks();

  const lines = [
    `✅ ${imported} card${imported !== 1 ? "s" : ""} imported`,
    skipped > 0 ? `⏭ ${skipped} skipped (already existed)` : null,
    "",
    "Next steps:",
    "1. Rename the pack (click ✏️ in the sidebar)",
    "2. Edit each card: add a name, description, and rarity",
    "3. Copy your images folder to:",
    `   content/images/${folderName}/`,
    "4. Export → npm run build-content",
  ].filter((l) => l !== null).join("\n");

  alert(lines);
}

// --- Progress overlay helpers ---

function showImportProgress(text, pct) {
  document.getElementById("import-progress-text").textContent = text;
  document.getElementById("import-progress-bar").style.width = (pct || 0) + "%";
  document.getElementById("import-progress").hidden = false;
}

function updateImportProgress(text, pct) {
  document.getElementById("import-progress-text").textContent = text;
  document.getElementById("import-progress-bar").style.width = pct + "%";
}

function hideImportProgress() {
  document.getElementById("import-progress").hidden = true;
}
