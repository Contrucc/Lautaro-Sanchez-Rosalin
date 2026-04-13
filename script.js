// ============================================
// VALORANT LINEUPS HUB - VERSIÓN FINAL CORREGIDA
// ============================================

const API_BASE = "https://valorant-api.com/v1";

let allAgents = [];
let currentAgent = null;
let currentMap = "ascent";
let currentSide = "attack";
let galleryIndex = 0;
let agentsPerView = 6;

// Elementos DOM
const agentNameHero = document.getElementById("agentNameHero");
const agentRoleHero = document.getElementById("agentRoleHero");
const agentDescription = document.getElementById("agentDescription");
const mainAgentImg = document.getElementById("mainAgentImg");
const heroVideo = document.getElementById("heroVideo");
const loreSection = document.getElementById("loreSection");
const abilitiesSection = document.getElementById("abilitiesSection");
const abilitiesGrid = document.getElementById("abilitiesGrid");
const agentsGalleryTrack = document.getElementById("agentsGalleryTrack");
const prevBtn = document.getElementById("prevAgentBtn");
const nextBtn = document.getElementById("nextAgentBtn");
const mapSelect = document.getElementById("mapSelect");
const sideSelect = document.getElementById("sideSelect");
const refreshBtn = document.getElementById("refreshLineupsBtn");
const lineupsListDiv = document.getElementById("lineupsList");

// LINEUPS DATABASE
const LINEUPS_DB = [
    { agentName: "Brimstone", mapa: "ascent", side: "attack", title: "Molotov en zona A principal", desc: "Desde spawn atacante, lanza incendiaria justo en el rincón de A Heaven.", videoId: "M7lc1UVf-VE", videoDesc: "Lineup preciso para despejar esquina" },
    { agentName: "Brimstone", mapa: "ascent", side: "defense", title: "Humo defensivo medio", desc: "Humo en medio de mercado para cortar visión.", videoId: "tgbNymZ7vqY", videoDesc: "Humo defensivo clave" },
    { agentName: "Brimstone", mapa: "bind", side: "attack", title: "Incendiaria en U-Hall", desc: "Desde largo de A, lineup clásico para quemar esquina.", videoId: "2Gg6Seob5JU", videoDesc: "Lineup bind ataque" },
    { agentName: "Brimstone", mapa: "bind", side: "defense", title: "Ulti defensiva B", desc: "Usar rayo orbital en entrada de B.", videoId: "dMH0bHeiRNg", videoDesc: "Defensa ultimate" },
    { agentName: "Viper", mapa: "haven", side: "attack", title: "Pantalla tóxica A Long", desc: "Lanza pantalla para cubrir entrada a A.", videoId: "Ix7vr41UfDE", videoDesc: "Muro tóxico" },
    { agentName: "Viper", mapa: "haven", side: "defense", title: "Poison Cloud en Garage", desc: "Veneno defensivo para retrasar push.", videoId: "rYEDA3JcQqw", videoDesc: "Defensa Garage" },
    { agentName: "Viper", mapa: "split", side: "attack", title: "Lineup de veneno en B", desc: "Desde rampa lanzar veneno arriba de caja.", videoId: "fJ9rUzIMcZQ", videoDesc: "Veneno B Split" },
    { agentName: "Sova", mapa: "ascent", side: "attack", title: "Shock Dart generador A", desc: "Rebote en pared para dañar detras de generador.", videoId: "C0DPdy98e4c", videoDesc: "Shock dart clásico" },
    { agentName: "Sova", mapa: "ascent", side: "defense", title: "Flecha de reconocimiento medio", desc: "Revela enemigos en medio de mapa.", videoId: "Zv11LTrJtqA", videoDesc: "Reconocimiento" },
    { agentName: "Sova", mapa: "lotus", side: "attack", title: "Dardo en A mound", desc: "Shock para el montículo de A.", videoId: "6v2L2UPKZ5Q", videoDesc: "Lineup Lotus" },
    { agentName: "Killjoy", mapa: "bind", side: "defense", title: "Nanobot en entrada B", desc: "Colocar alarmbot y granada en zona de entrada.", videoId: "8W6r3ALRkKE", videoDesc: "Defensa B Bind" },
    { agentName: "Killjoy", mapa: "bind", side: "attack", title: "Torreta en largo A", desc: "Torreta para flanqueo.", videoId: "pRpeEdMmmQ0", videoDesc: "Torreta ataque" },
    { agentName: "Killjoy", mapa: "haven", side: "defense", title: "Setup C site", desc: "Granada y alarmbot en C long.", videoId: "eBShNchqjEI", videoDesc: "Lineup C" },
    { agentName: "Jett", mapa: "ascent", side: "attack", title: "Smoke + Dash A Main", desc: "Cortina de humo y dash para entrar a sitio.", videoId: "3JZ_D3ELwOQ", videoDesc: "Entry con Jett" },
    { agentName: "Omen", mapa: "bind", side: "defense", title: "Paranoia defensiva B", desc: "Ceguera desde atrás para frenar push.", videoId: "LgSPs2rVY7s", videoDesc: "Defensa con Omen" }
];

const agentVideoMap = {
    "Brimstone": "TQJw8aG_mk", "Viper": "9bZkp7q19f0", "Sova": "kJQP7kiw5Fk",
    "Killjoy": "VYOjWnB4A7Y", "Jett": "3JZ_D3ELwOQ", "Omen": "LgSPs2rVY7s"
};

// OBTENER AGENTES DESDE API
async function fetchAgentsFromAPI() {
    try {
        agentsGalleryTrack.innerHTML = '<div style="color:#ff7a3f; padding:1rem;">Cargando agentes desde API...</div>';
        
        const response = await fetch(`${API_BASE}/agents`);
        const data = await response.json();
        
        if (!data.data) throw new Error("No se recibieron datos");
        
        const playableAgents = data.data.filter(agent => agent.isPlayableCharacter === true);
        playableAgents.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        allAgents = playableAgents;
        
        if (allAgents.length === 0) throw new Error("No hay agentes");
        
        const defaultAgent = allAgents.find(a => a.displayName === "Brimstone") || allAgents[0];
        if (defaultAgent) selectAgent(defaultAgent);
        
        renderGallery();
        
    } catch (error) {
        console.error("Error cargando API:", error);
        agentsGalleryTrack.innerHTML = '<div style="color:#ff7a3f; padding:1rem;">⚠️ Error al cargar agentes. Verifica tu conexión.</div>';
    }
}

// RENDERIZAR GALERÍA
function renderGallery() {
    if (!allAgents.length) return;
    
    agentsGalleryTrack.innerHTML = "";
    
    allAgents.forEach(agent => {
        const card = document.createElement("div");
        card.className = "agent-gallery-card";
        if (currentAgent && currentAgent.uuid === agent.uuid) card.classList.add("active");
        
        const agentIcon = agent.displayIconSmall || agent.displayIcon || "https://via.placeholder.com/70";
        
        card.innerHTML = `
            <img src="${agentIcon}" alt="${agent.displayName}" loading="lazy" onerror="this.src='https://via.placeholder.com/70?text=${agent.displayName.charAt(0)}'">
            <div class="agent-name-gallery">${agent.displayName}</div>
        `;
        card.addEventListener("click", () => selectAgent(agent));
        agentsGalleryTrack.appendChild(card);
    });
    
    updateGalleryButtons();
}

function updateGalleryButtons() {
    const maxIndex = Math.max(0, Math.ceil(allAgents.length / agentsPerView) - 1);
    if (prevBtn) prevBtn.disabled = galleryIndex <= 0;
    if (nextBtn) nextBtn.disabled = galleryIndex >= maxIndex;
}

function moveGallery(direction) {
    const maxIndex = Math.max(0, Math.ceil(allAgents.length / agentsPerView) - 1);
    let newIndex = galleryIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > maxIndex) newIndex = maxIndex;
    
    if (newIndex !== galleryIndex) {
        galleryIndex = newIndex;
        const scrollAmount = galleryIndex * (105 * agentsPerView);
        agentsGalleryTrack.style.transform = `translateX(-${scrollAmount}px)`;
        updateGalleryButtons();
    }
}

// SELECCIONAR AGENTE
function selectAgent(agent) {
    currentAgent = agent;
    
    // Información del héroe
    agentNameHero.innerText = agent.displayName;
    
    if (agent.role) {
        agentRoleHero.innerText = `${agent.role.displayName || "Agente"} • ${agent.role.description || "Especialista"}`;
    } else {
        agentRoleHero.innerText = "Agente de Valorant";
    }
    
    // Descripción / LORE (debajo del video)
    agentDescription.innerText = agent.description || `Domina los lineups de ${agent.displayName} para controlar el mapa y asegurar las rondas.`;
    loreSection.style.display = "block";
    
    // Imagen grande del personaje (busto)
    const largeImage = agent.fullPortrait || agent.bustPortrait || agent.displayIcon;
    if (largeImage) {
        mainAgentImg.src = largeImage;
        mainAgentImg.alt = agent.displayName;
    }
    
    // Video de fondo
    const videoId = agentVideoMap[agent.displayName] || "mXq5R8Q7R6I";
    heroVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
    
    // Mostrar sección de habilidades
    abilitiesSection.style.display = "block";
    renderAbilities(agent);
    
    // Actualizar clase activa en galería
    document.querySelectorAll(".agent-gallery-card").forEach(card => card.classList.remove("active"));
    const activeCard = Array.from(document.querySelectorAll(".agent-gallery-card")).find(card => 
        card.innerText.includes(agent.displayName)
    );
    if (activeCard) activeCard.classList.add("active");
    
    // Refrescar lineups
    refreshLineups();
}

// RENDERIZAR HABILIDADES
function renderAbilities(agent) {
    if (!agent.abilities || agent.abilities.length === 0) {
        abilitiesGrid.innerHTML = `<div class="info-message">No hay información de habilidades disponible.</div>`;
        return;
    }
    
    abilitiesGrid.innerHTML = "";
    
    const abilities = agent.abilities.filter(ab => ab.slot !== "Passive" && ab.displayIcon);
    
    if (abilities.length === 0) {
        abilitiesGrid.innerHTML = `<div class="info-message">No hay habilidades para mostrar.</div>`;
        return;
    }
    
    abilities.forEach(ability => {
        const card = document.createElement("div");
        card.className = "ability-card";
        const iconUrl = ability.displayIcon || "";
        card.innerHTML = `
            <div class="ability-icon">
                ${iconUrl ? `<img src="${iconUrl}" alt="${ability.displayName}" onerror="this.style.display='none'; this.parentElement.innerHTML='🎯'">` : '<span>🎯</span>'}
            </div>
            <div class="ability-info">
                <div class="ability-name">${ability.displayName}</div>
                <div class="ability-desc">${ability.description || "Habilidad táctica clave para lineups."}</div>
            </div>
        `;
        abilitiesGrid.appendChild(card);
    });
}

// LINEUPS
function getFilteredLineups() {
    if (!currentAgent) return [];
    return LINEUPS_DB.filter(lineup => 
        lineup.agentName.toLowerCase() === currentAgent.displayName.toLowerCase() &&
        lineup.mapa === currentMap &&
        lineup.side === currentSide
    );
}

function renderLineups(lineups) {
    if (!currentAgent) {
        lineupsListDiv.innerHTML = `<div class="info-message"><i class="fas fa-hand-pointer"></i> Selecciona un agente de la galería</div>`;
        return;
    }
    
    if (lineups.length === 0) {
        lineupsListDiv.innerHTML = `<div class="info-message">
            <i class="fas fa-database"></i> No hay lineups para ${currentAgent.displayName} en ${mapSelect.options[mapSelect.selectedIndex]?.text} - ${sideSelect.options[sideSelect.selectedIndex]?.text}<br>
            ✨ Puedes agregar más lineups en el array LINEUPS_DB
        </div>`;
        return;
    }
    
    lineupsListDiv.innerHTML = "";
    lineups.forEach(lineup => {
        const card = document.createElement("div");
        card.className = "lineup-card";
        const embedUrl = `https://www.youtube.com/embed/${lineup.videoId}?rel=0`;
        card.innerHTML = `
            <div class="lineup-info">
                <div class="lineup-title">🎯 ${lineup.title}</div>
                <div class="lineup-desc">📌 ${lineup.desc}<br><span style="color:#ff7a3f;">🎬 ${lineup.videoDesc || "Ver tutorial"}</span></div>
            </div>
            <div class="lineup-video">
                <iframe src="${embedUrl}" title="Lineup ${lineup.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
        lineupsListDiv.appendChild(card);
    });
}

function refreshLineups() {
    if (!currentAgent) {
        renderLineups([]);
        return;
    }
    currentMap = mapSelect.value;
    currentSide = sideSelect.value;
    const filtered = getFilteredLineups();
    renderLineups(filtered);
}

// RESPONSIVE
function updateAgentsPerView() {
    if (window.innerWidth < 600) agentsPerView = 3;
    else if (window.innerWidth < 900) agentsPerView = 4;
    else if (window.innerWidth < 1200) agentsPerView = 5;
    else agentsPerView = 6;
    galleryIndex = 0;
    if (agentsGalleryTrack) agentsGalleryTrack.style.transform = "translateX(0)";
    if (allAgents.length) renderGallery();
}

// EVENTOS
if (mapSelect) mapSelect.addEventListener("change", () => refreshLineups());
if (sideSelect) sideSelect.addEventListener("change", () => refreshLineups());
if (refreshBtn) refreshBtn.addEventListener("click", () => refreshLineups());
if (prevBtn) prevBtn.addEventListener("click", () => moveGallery(-1));
if (nextBtn) nextBtn.addEventListener("click", () => moveGallery(1));
window.addEventListener("resize", () => updateAgentsPerView());

function init() {
    updateAgentsPerView();
    fetchAgentsFromAPI();
}

init();
