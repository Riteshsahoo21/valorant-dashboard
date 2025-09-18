const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const filterBox = document.getElementById("filterBox");
const spinner = document.getElementById("spinner");

let currentData = [];
let currentSection = "agents";

// Modal functions
function openModal(title, body) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modal").style.display = "flex";
}
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Loading spinner control
function showSpinner() { spinner.style.display = "block"; }
function hideSpinner() { spinner.style.display = "none"; }

// Agents
async function loadAgents() {
  currentSection = "agents";
  searchInput.value = "";
  filterBox.innerHTML = "";
  showSpinner();
  const res = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
  const data = await res.json();
  hideSpinner();
  currentData = data.data;
  renderAgents(data.data);

  // 🔥 Role Filter Dropdown
  const roles = [...new Set(data.data.map(a => a.role?.displayName).filter(r => r))];
  filterBox.innerHTML = `<select id="agentFilter">
    <option value="all">All Roles</option>
    ${roles.map(r => `<option value="${r}">${r}</option>`).join("")}
  </select>`;

  document.getElementById("agentFilter").addEventListener("change", e => {
    const value = e.target.value;
    const filtered = value === "all"
      ? currentData
      : currentData.filter(a => a.role?.displayName === value);
    renderAgents(filtered);
  });
}


// Existing mapping (add Gekko if not there)
const agentVideos = {
  "Brimstone": "-TQJw8aG_mk",
  "Viper": "DXrzJFeRsNc",
  "Omen": "2iuhuPKAM70",
  "Killjoy": "MZ8J7mL7SzY",
  "Cypher": "jsYWOXQFXGI",
  "Sova": "oTc0fsGWoh0",
  "Sage": "rTmBoOr7mMk",
  "Phoenix": "MCdAAxkVTKw",
  "Jett": "fXVLGBqvx1I",
  "Reyna": "tTdBteFCqS8",
  "Raze": "PEpR-NCURjo",
  "Breach": "KCHj6o0KtjY",
  "Skye": "Z4OmWSiwSpk",
  "Yoru": "_rss25NBpHs",
  "Astra": "xKqz0NSHOzQ",
  "KAY/O": "bsajVrWgOkc",
  "Chamber": "dVwYfo28utM",
  "Neon": "gFiVLzvgFSc",
  "Fade": "NiRmuNaEb3w",
  "Harbor": "ov2N_loN45E",
  "Gekko": "XWoxwdNh77o",
  "Deadlock": "PBKQZFFzf18",
  "Iso": "kbzx5bcXMhA",
  "Clove": "_W4j1uk1dYg"
};

// In your renderAgents (or wherever you set up the card onclick), modify like this:

function renderAgents(agents) {
  content.innerHTML = "";
  agents.forEach(agent => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${agent.fullPortrait}" alt="${agent.displayName}">
      <div class="name">${agent.displayName}</div>
      <div class="role-badge">${agent.role?.displayName || "No Role"}</div>
    `;
    card.onclick = () => {
      const abilities = agent.abilities.map(a =>
        `<p><b>${a.displayName}</b>: ${a.description}</p>`
      ).join("");

      // Check if there is a video for this agent
      const videoEmbed = agentVideos[agent.displayName]
        ? `<iframe width="100%" height="315" 
             src="https://www.youtube.com/embed/${agentVideos[agent.displayName]}" 
             frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             allowfullscreen></iframe>`
        : "<p>No video available</p>";

      openModal(agent.displayName, abilities + "<hr>" + videoEmbed);
    };
    content.appendChild(card);
  });
}


// Maps
async function loadMaps() {
  currentSection = "maps";
  searchInput.value = "";
  filterBox.innerHTML = "";
  showSpinner();
  const res = await fetch("https://valorant-api.com/v1/maps");
  const data = await res.json();
  hideSpinner();
  currentData = data.data;
  renderMaps(data.data);
}

function renderMaps(maps) {
  content.innerHTML = "";

  // Remove duplicates based on displayName
  const uniqueMaps = maps.filter((map, index, self) =>
    index === self.findIndex(m => m.displayName === map.displayName)
  );

  uniqueMaps.forEach(map => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${map.splash}" alt="${map.displayName}">
      <div class="name">${map.displayName}</div>
    `;
    card.onclick = () =>
      openModal(map.displayName, `<p>Coordinates: ${map.coordinates || "N/A"}</p>`);
    content.appendChild(card);
  });
}


// Weapons
async function loadWeapons() {
  currentSection = "weapons";
  searchInput.value = "";
  showSpinner();
  const res = await fetch("https://valorant-api.com/v1/weapons");
  const data = await res.json();
  hideSpinner();
  currentData = data.data;
  renderWeapons(data.data);

  // Category Filter
  const categories = [...new Set(data.data.map(w => w.category.replace("EEquippableCategory::","")))];
  filterBox.innerHTML = `<select id="weaponFilter">
    <option value="all">All Categories</option>
    ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
  </select>`;
  document.getElementById("weaponFilter").addEventListener("change", e => {
    const value = e.target.value;
    const filtered = value === "all" ? currentData : currentData.filter(w => w.category.includes(value));
    renderWeapons(filtered);
  });
}

function renderWeapons(weapons) {
  content.innerHTML = "";
  weapons.forEach(weapon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${weapon.displayIcon}" alt="${weapon.displayName}">
      <div class="name">${weapon.displayName}</div>
    `;
    card.onclick = () => openModal(weapon.displayName,
      `<p>Category: ${weapon.category.replace("EEquippableCategory::","")}</p>
       <p>Cost: ${weapon.shopData ? weapon.shopData.cost : "N/A"}</p>`);
    content.appendChild(card);
  });
}

// Search across sections
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = currentData.filter(item => item.displayName.toLowerCase().includes(query));
  if (currentSection === "agents") renderAgents(filtered);
  else if (currentSection === "maps") renderMaps(filtered);
  else if (currentSection === "weapons") renderWeapons(filtered);
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  document.getElementById("themeToggle").textContent = isLight ? "☀️" : "🌙";
});

// Load default (Agents)
loadAgents();
