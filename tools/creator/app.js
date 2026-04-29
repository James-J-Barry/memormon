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

  // Color picker sync
  document.getElementById("pack-color").addEventListener("input", (e) => {
    document.getElementById("pack-color-hex").textContent = e.target.value;
  });

  // Import file handler
  document.getElementById("import-file").addEventListener("change", handleImport);
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
    list.innerHTML = '<div class="empty-state"><p>No packs yet. Create one!</p></div>';
    return;
  }

  // Sort by sortOrder
  const sorted = [...packs].sort((a, b) => a.sortOrder - b.sortOrder);

  sorted.forEach((pack) => {
    const cardCount = cards.filter((c) => c.packId === pack.id).length;
    const div = document.createElement("div");
    div.className = "pack-item" + (pack.id === selectedPackId ? " active" : "");
    div.innerHTML = `
      <span class="pack-emoji">${pack.emoji}</span>
      <div class="pack-info">
        <div class="pack-name">${pack.name}</div>
        <div class="pack-card-count">${cardCount} card${cardCount !== 1 ? "s" : ""}</div>
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
    // Update existing
    const pack = packs.find((p) => p.id === editingPackId);
    pack.name = name;
    pack.emoji = emoji;
    pack.description = description;
    pack.coverColor = coverColor;
  } else {
    // Create new
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

  if (!selectedPackId) {
    title.textContent = "Select a pack to view cards";
    addBtn.hidden = true;
    list.innerHTML = "";
    return;
  }

  const pack = packs.find((p) => p.id === selectedPackId);
  title.textContent = `${pack.emoji} ${pack.name}`;
  addBtn.hidden = false;

  const packCards = cards
    .filter((c) => c.packId === selectedPackId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (packCards.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No cards in this pack yet.</p></div>';
    return;
  }

  list.innerHTML = "";
  packCards.forEach((card) => {
    const rarity = RARITIES[card.rarity];
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <div class="card-item-title">${card.title}</div>
      <div class="card-item-caption">${card.caption}</div>
      <div class="card-item-meta">
        <span>${card.date}</span>
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
    document.getElementById("card-date").value = card.date;
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
  const date = document.getElementById("card-date").value;
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
  renderPacks(); // update card counts
}

function saveCardAndNew() {
  saveCard();
  showCardForm(); // open fresh form
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

  // Image preview file picker
  document.getElementById("card-image-preview").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImageData = ev.target.result;
      updateCardPreview();

      // Auto-fill the filename if empty
      const imageInput = document.getElementById("card-image");
      if (!imageInput.value) {
        imageInput.value = file.name;
      }
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

  // Update preview border
  const previewCard = document.getElementById("card-preview");
  const colorVar = `var(--${rarity})`;
  previewCard.style.borderColor = colorVar;

  // Preview image
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
// EXPORT / IMPORT
// ==========================================

function exportData() {
  // Build clean export objects
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

  // Download packs.json
  downloadJSON(exportPacks, "packs.json");

  // Small delay so browser doesn't block second download
  setTimeout(() => {
    downloadJSON(exportCards, "cards.json");
  }, 500);

  // Show summary
  const missingImages = exportCards.filter((c) => !c.image).length;
  let msg = `Exported ${exportPacks.length} packs and ${exportCards.length} cards.\n\n`;
  msg += "Next steps:\n";
  msg += "1. Move packs.json and cards.json to content/\n";
  msg += "2. Place all card images in content/images/\n";
  msg += "3. Run: node tools/build-content.js\n";
  if (missingImages > 0) {
    msg += `\n⚠ ${missingImages} card(s) have no image filename set.`;
  }
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

      // Detect if it's packs or cards based on structure
      if (Array.isArray(data) && data.length > 0) {
        if ("coverColor" in data[0]) {
          // It's packs
          if (confirm(`Import ${data.length} packs? This will replace existing packs.`)) {
            packs = data;
            saveToStorage();
            renderPacks();
          }
        } else if ("rarity" in data[0]) {
          // It's cards
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

  // Reset the input so the same file can be re-imported
  e.target.value = "";
}
