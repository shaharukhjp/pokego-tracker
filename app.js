// Pokémon GO Personal Tracker - Core Application Logic (Updated)

// --- SUPABASE CLIENT & AUTH CONFIG ---
let supabase = null;
if (window.supabase && window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
  supabase = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  console.log("Supabase Client initialized successfully.");
} else {
  console.log("Supabase config is missing or incomplete. Running in Guest/Offline mode.");
}

let currentUserSession = null;
let syncTimeoutId = null;
let currentAuthMode = 'login'; // 'login' or 'signup'
let activeSyncProvider = 'local'; // 'local', 'supabase', 'google-drive'
let googleDriveFileId = null;     // Cached file ID for Drive saves

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    const errEl = document.getElementById('auth-error-msg');
    const succEl = document.getElementById('auth-success-msg');
    if (errEl) errEl.style.display = 'none';
    if (succEl) succEl.style.display = 'none';
  }
}

function closeAuthModal(event) {
  if (!event || event.target.id === 'auth-modal' || event.target.className === 'close-modal-btn') {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
  }
}

function toggleAuthMode(event) {
  if (event) event.preventDefault();
  const toggleLink = document.getElementById('auth-toggle-mode');
  const toggleLabel = document.getElementById('btn-auth-submit')?.querySelector('span') || document.getElementById('auth-submit-text');
  const submitBtnText = document.getElementById('auth-submit-text');
  
  if (currentAuthMode === 'login') {
    currentAuthMode = 'signup';
    if (toggleLink) toggleLink.textContent = "Already have an account? Sign In";
    if (submitBtnText) submitBtnText.textContent = "Sign Up";
    if (toggleLabel) toggleLabel.textContent = "Sign Up";
  } else {
    currentAuthMode = 'login';
    if (toggleLink) toggleLink.textContent = "Need an account? Sign Up";
    if (submitBtnText) submitBtnText.textContent = "Sign In";
    if (toggleLabel) toggleLabel.textContent = "Sign In";
  }
}

async function loginWithProvider(provider) {
  if (!supabase) {
    alert("Supabase is not configured. Please add your credentials in config.js first.");
    return;
  }
  try {
    const options = {
      redirectTo: window.location.origin + window.location.pathname
    };
    // Dynamically request Google Drive AppData scope when signing in with Google
    if (provider === 'google') {
      options.scopes = 'https://www.googleapis.com/auth/drive.appdata';
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: options
    });
    if (error) throw error;
  } catch (err) {
    console.error(`OAuth login failed for ${provider}:`, err);
    showAuthError(err.message || `Failed to sign in with ${provider}`);
  }
}

async function handleEmailAuth(event) {
  if (event) event.preventDefault();
  if (!supabase) {
    alert("Supabase is not configured. Please add your credentials in config.js first.");
    return;
  }

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error-msg');
  const succEl = document.getElementById('auth-success-msg');
  
  if (errEl) errEl.style.display = 'none';
  if (succEl) succEl.style.display = 'none';

  // Force Google OAuth for Gmail accounts to facilitate Google Drive sync
  if (email.toLowerCase().endsWith('@gmail.com')) {
    showAuthError("Gmail accounts must use the 'Sign In with Google' button to store data in Google Drive.");
    return;
  }

  try {
    if (currentAuthMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      console.log("Logged in successfully:", data);
      closeAuthModal(null);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });
      if (error) throw error;
      console.log("Signed up successfully:", data);
      if (succEl) succEl.style.display = 'flex';
    }
  } catch (err) {
    console.error("Email auth failed:", err);
    showAuthError(err.message || "Authentication failed. Please check credentials.");
  }
}

async function handleLogout() {
  if (!supabase) return;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.reload();
  } catch (err) {
    console.error("Sign out failed:", err);
  }
}

function showAuthError(msg) {
  const errEl = document.getElementById('auth-error-msg');
  const errText = document.getElementById('auth-error-text');
  if (errEl && errText) {
    errText.textContent = msg;
    errEl.style.display = 'flex';
  }
}

function updateSyncStatusIndicator(status, text) {
  const statusEl = document.getElementById('cloud-sync-status');
  const dotEl = statusEl?.querySelector('.sync-dot');
  const textEl = document.getElementById('sync-status-text');
  
  if (!statusEl || !dotEl || !textEl) return;
  
  statusEl.style.display = 'flex';
  
  dotEl.className = 'sync-dot';
  dotEl.classList.add(status);
  textEl.textContent = text;
}

async function loadCloudStateAndMerge(user) {
  updateSyncStatusIndicator('syncing', 'Fetching cloud data...');
  try {
    const { data, error } = await supabase
      .from('user_states')
      .select('state')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (data && data.state) {
      console.log("Cloud state found. Restoring...");
      state = { ...state, ...data.state };
      state.pokemonCollection = { ...state.pokemonCollection, ...data.state.pokemonCollection };
      state.items = { ...state.items, ...data.state.items };
      state.medals = { ...state.medals, ...data.state.medals };
      state.friends = data.state.friends || state.friends;
      
      localStorage.setItem('pokego_tracker_state', JSON.stringify(state));
      
      renderPokedex();
      renderLevelTracker();
      renderMedalTracker();
      renderFriendsTracker();
      renderItemInventory();
      updateStorageProgress();
      updateItemStorageProgress();
      generateSearchString();
      updateDashboardWidgets();
      
      updateSyncStatusIndicator('synced', 'Supabase Synced');
    } else {
      console.log("No cloud state found. Pushing current local state as initial backup...");
      await pushStateToCloud(user.id, state);
    }
  } catch (e) {
    console.error("Cloud data pull failed:", e);
    updateSyncStatusIndicator('error', 'Sync Failed');
  }
}

async function pushStateToCloud(userId, stateToPush) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('user_states')
      .upsert({
        user_id: userId,
        state: stateToPush,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log("Cloud sync completed successfully.");
    updateSyncStatusIndicator('synced', 'Supabase Synced');
  } catch (e) {
    console.error("Cloud sync failed:", e);
    updateSyncStatusIndicator('error', 'Sync Failed');
  }
}

// --- GOOGLE DRIVE SYNC HELPERS ---
async function loadGoogleDriveState(providerToken) {
  updateSyncStatusIndicator('syncing', 'Fetching Google Drive data...');
  try {
    const queryUrl = 'https://www.googleapis.com/drive/v3/files?q=name%3D%27pokego_tracker_save.json%27&spaces=appDataFolder';
    const listRes = await fetch(queryUrl, {
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    if (!listRes.ok) throw new Error(`Search failed: HTTP ${listRes.status}`);
    const listData = await listRes.json();
    
    const file = listData.files && listData.files[0];
    if (file) {
      googleDriveFileId = file.id;
      console.log("Google Drive save file found. ID:", googleDriveFileId);
      
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${googleDriveFileId}?alt=media`;
      const mediaRes = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${providerToken}` }
      });
      if (!mediaRes.ok) throw new Error(`Download failed: HTTP ${mediaRes.status}`);
      const cloudState = await mediaRes.json();
      
      if (cloudState) {
        console.log("Restoring Google Drive save data...");
        state = { ...state, ...cloudState };
        state.pokemonCollection = { ...state.pokemonCollection, ...cloudState.pokemonCollection };
        state.items = { ...state.items, ...cloudState.items };
        state.medals = { ...state.medals, ...cloudState.medals };
        state.friends = cloudState.friends || state.friends;
        
        localStorage.setItem('pokego_tracker_state', JSON.stringify(state));
        
        renderPokedex();
        renderLevelTracker();
        renderMedalTracker();
        renderFriendsTracker();
        renderItemInventory();
        updateStorageProgress();
        updateItemStorageProgress();
        generateSearchString();
        updateDashboardWidgets();
        
        updateSyncStatusIndicator('synced', 'Google Drive Synced');
      }
    } else {
      console.log("No Google Drive save file found. Initializing upload...");
      await pushGoogleDriveState(providerToken, state);
    }
  } catch (e) {
    console.error("Google Drive pull failed:", e);
    updateSyncStatusIndicator('error', 'Drive Sync Failed');
  }
}

async function pushGoogleDriveState(providerToken, stateToPush) {
  try {
    const fileContent = JSON.stringify(stateToPush);
    
    if (googleDriveFileId) {
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${googleDriveFileId}?uploadType=media`;
      const res = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });
      if (!res.ok) throw new Error(`Update HTTP ${res.status}`);
      console.log("Google Drive file updated successfully.");
    } else {
      const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const metadata = {
        name: 'pokego_tracker_save.json',
        parents: ['appDataFolder']
      };
      
      const boundary = 'foo_bar_baz';
      const multipartBody = 
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${fileContent}\r\n` +
        `--${boundary}--`;
         
      const res = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });
      
      if (!res.ok) throw new Error(`Create HTTP ${res.status}`);
      const fileInfo = await res.json();
      googleDriveFileId = fileInfo.id;
      console.log("Google Drive file created successfully. ID:", googleDriveFileId);
    }
    updateSyncStatusIndicator('synced', 'Google Drive Synced');
  } catch (e) {
    console.error("Google Drive push failed:", e);
    updateSyncStatusIndicator('error', 'Drive Sync Failed');
  }
}

// --- PVPOKE RANKINGS CACHE ---
let pvpokeRankings = {
  great: [],
  ultra: [],
  master: []
};

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getBaseSpeciesId(pvpokeSpeciesId) {
  return pvpokeSpeciesId.toLowerCase()
    .replace(/_shadow$/, '')
    .replace(/_xs$/, '')
    .replace(/_normal$/, '')
    .replace(/_therian$/, '')
    .replace(/_incarnate$/, '')
    .replace(/_altered$/, '')
    .replace(/_origin$/, '')
    .replace(/_defense$/, '')
    .replace(/_attack$/, '')
    .replace(/_speed$/, '')
    .replace(/_alolan$/, '')
    .replace(/_galarian$/, '')
    .replace(/_hisuian$/, '')
    .replace(/_paldean$/, '')
    .replace(/_gmax$/, '')
    .replace(/_dmax$/, '')
    .replace(/_mega$/, '')
    .replace(/_mega_x$/, '')
    .replace(/_mega_y$/, '')
    .replace(/_primal$/, '');
}

function isPokemonInPvPokeRankings(pokemon, leagueKey, limit = 100) {
  const rankings = pvpokeRankings[leagueKey];
  if (!rankings || rankings.length === 0) return false;
  
  const topSpecies = rankings.slice(0, limit);
  const normalizedPokeName = normalizeName(pokemon.name);
  
  return topSpecies.some(r => {
    const baseId = getBaseSpeciesId(r.speciesId);
    const normalizedBaseId = normalizeName(baseId);
    
    return normalizedPokeName === normalizedBaseId ||
           normalizedBaseId.startsWith(normalizedPokeName) ||
           normalizedPokeName.startsWith(normalizedBaseId);
  });
}

function getBestPvPRank(pokemon, leagueKey) {
  const rankings = pvpokeRankings[leagueKey];
  if (!rankings || rankings.length === 0) return null;

  const normalizedPokeName = normalizeName(pokemon.name);
  let bestRank = Infinity;
  let bestForm = null; // 'normal', 'shadow', 'mega'

  for (let i = 0; i < rankings.length; i++) {
    const r = rankings[i];
    const baseId = getBaseSpeciesId(r.speciesId);
    const normalizedBaseId = normalizeName(baseId);

    if (normalizedPokeName === normalizedBaseId ||
        normalizedBaseId.startsWith(normalizedPokeName) ||
        normalizedPokeName.startsWith(normalizedBaseId)) {
      
      const rankVal = i + 1;
      let form = 'normal';
      if (r.speciesId.toLowerCase().includes('_shadow')) {
        form = 'shadow';
      } else if (r.speciesId.toLowerCase().includes('_mega') || r.speciesId.toLowerCase().includes('_primal')) {
        form = 'mega';
      }

      if (rankVal < bestRank) {
        bestRank = rankVal;
        bestForm = form;
      }
    }
  }

  if (bestRank <= 99) {
    return { rank: bestRank, form: bestForm };
  }
  return null;
}

function formatPvPRankText(rankData) {
  if (!rankData) return 'N/A';
  
  let icon = '';
  if (rankData.form === 'shadow') {
    icon = ` <i class="fa-solid fa-moon" style="color: #c97ffb; font-size: 11px; margin-left: 2px;" title="Shadow Form"></i>`;
  } else if (rankData.form === 'mega') {
    icon = ` <i class="fa-solid fa-atom" style="color: #a100ff; font-size: 11px; margin-left: 2px;" title="Mega Form"></i>`;
  }
  
  return `#${rankData.rank}${icon}`;
}

function getPokedexDescription(p) {
  const overrides = {
    1: "Bulbasaur is a Seed Pokémon. A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
    2: "Ivysaur is a Seed Pokémon. Exposure to sunlight makes it grow stronger. The bud on its back starts swelling when it's about to bloom.",
    3: "Venusaur is a Seed Pokémon. Its flower is said to take on vivid colors if it gets plenty of nutrition and sunlight. The flower's aroma soothes the emotions of people.",
    4: "Charmander is a Lizard Pokémon. The flame on its tail shows the strength of its life force. If Charmander is healthy, the flame burns brightly.",
    5: "Charmeleon is a Flame Pokémon. It lashes about with its tail to knock down its foe, then tears its disoriented opponent with sharp claws.",
    6: "Charizard is a Flame Pokémon. It flies around the sky in search of powerful opponents. It breathes fire of such great heat that it melts anything.",
    7: "Squirtle is a Tiny Turtle Pokémon. After birth, its back swells and hardens into a shell. It powerfully sprays foam from its mouth.",
    8: "Wartortle is a Turtle Pokémon. It is recognized as a symbol of longevity. Miniscule algae can grow on its furry ears and tail.",
    9: "Blastoise is a Shellfish Pokémon. It crushes foes under its heavy body to cause fainting. In a pinch, it will withdraw inside its shell.",
    25: "Pikachu is a Mouse Pokémon. It can cast electricity from its cheeks. Pikachu gather in thunderous storms to recharge their energy.",
    26: "Raichu is a Mouse Pokémon. Its long tail serves as a ground to protect itself from its own high-voltage electricity.",
    133: "Eevee is an Evolution Pokémon. It has an unstable genetic makeup that suddenly mutates due to its environment. It has multiple potential evolutions.",
    149: "Dragonite is a Dragon Pokémon. It is said to make its home somewhere in the sea. It flies faster than the speed of sound.",
    150: "Mewtwo is a Genetic Pokémon. It was created by a scientist after years of horrific gene-splicing and DNA engineering experiments.",
    248: "Tyranitar is a Armor Pokémon. Its body is practically impervious to any attack, so it eagerly challenges enemies to battle.",
    376: "Metagross is a Iron Claw Pokémon. It has four brains that are joined to form a supercomputer, making it highly intelligent and analytical.",
    382: "Kyogre is a Sea Basin Pokémon. It is said to be the personification of the sea itself. It has the power to create massive rain clouds.",
    383: "Groudon is a Continent Pokémon. It has been described as the personification of the land. It can cause massive volcanic eruptions.",
    384: "Rayquaza is a Sky High Pokémon. It flies endlessly through the ozone layer. It is said to have descended to stop the battle between Kyogre and Groudon.",
    445: "Garchomp is a Mach Pokémon. It flies at speeds equal to a jet fighter plane. It never lets its prey escape.",
    448: "Lucario is an Aura Pokémon. By reading the aura of all things, it can tell how others are feeling from over half a mile away."
  };

  if (overrides[p.id]) {
    return overrides[p.id];
  }

  const genNames = {
    1: "Kanto", 2: "Johto", 3: "Hoenn", 4: "Sinnoh", 5: "Unova",
    6: "Kalos", 7: "Alola", 8: "Galar", 9: "Paldea"
  };
  const genName = genNames[p.generation] || "an unknown";
  const typeText = p.types.join(" and ");
  return `${p.name} is a ${p.category} first discovered in the ${genName} region (Generation ${p.generation}). It is a ${typeText}-type Pokémon known for its unique battle stance and characteristics in the world of Pokémon GO.`;
}

function findPokemonByBossName(bossName) {
  if (!bossName) return null;
  const nameClean = bossName.trim();
  const nameLower = nameClean.toLowerCase();

  // 1. Try exact name match
  let found = window.pokemonDatabase.find(p => p.name.toLowerCase() === nameLower);
  if (found) return found;

  // 2. Try matching mega names or stripping "Mega "
  if (nameLower.startsWith('mega ')) {
    const baseName = nameClean.slice(5).trim();
    found = window.pokemonDatabase.find(p => {
      if (p.mega && p.mega.name && p.mega.name.toLowerCase() === nameLower) return true;
      if (p.mega && p.mega.variants && p.mega.variants.some(v => v.name.toLowerCase() === nameLower)) return true;
      if (p.name.toLowerCase() === baseName.toLowerCase()) return true;
      return false;
    });
    if (found) return found;
  }

  // 3. Try matching shadow names or stripping "Shadow "
  if (nameLower.startsWith('shadow ')) {
    const baseName = nameClean.slice(7).trim();
    found = window.pokemonDatabase.find(p => p.name.toLowerCase() === baseName.toLowerCase());
    if (found) return found;
  }

  // 4. Try matching primal names or stripping "Primal "
  if (nameLower.startsWith('primal ')) {
    const baseName = nameClean.slice(7).trim();
    found = window.pokemonDatabase.find(p => p.name.toLowerCase() === baseName.toLowerCase());
    if (found) return found;
  }

  // 5. Try form variations (like "Alolan Marowak" -> Marowak, "Galarian Weezing" -> Weezing, "Hisuian Typhlosion" -> Typhlosion)
  const regions = ['alolan', 'galarian', 'hisuian', 'paldean'];
  for (const reg of regions) {
    if (nameLower.startsWith(reg + ' ')) {
      const baseName = nameClean.slice(reg.length + 1).trim();
      found = window.pokemonDatabase.find(p => p.name.toLowerCase() === baseName.toLowerCase());
      if (found) return found;
    }
  }

  // 6. Try fuzzy check (is base name a substring, e.g. "Therian Landorus" -> "Landorus")
  found = window.pokemonDatabase.find(p => {
    const pNameLower = p.name.toLowerCase();
    return nameLower.includes(pNameLower) || pNameLower.includes(nameLower);
  });
  
  return found || null;
}

function getFallbackRankings(leagueKey) {
  const fallbacks = {
    great: ["lickitung", "gligar", "registeel", "lanturn", "swampert", "skarmory", "whiscash", "clodsire", "bastiodon", "cresselia", "trevenant", "azumarill", "feraligatr", "charizard", "stunfisk", "talonflame", "dragonair", "quagsire", "wigglytuff", "carbink", "medicham", "serperior", "altaria", "mandibuzz", "dewgong", "jellicent", "vigoroth", "noctowl", "dubwool", "chesnaught", "guzzlord", "skeledirge", "dunsparce", "pelipper", "malamar", "greninja", "lickilicky", "mantine", "scrafty", "toxapex", "obstagoon", "poliwrath", "abomasnow", "pidgeot", "ninetales", "venusaur"],
    ultra: ["registeel", "giratina", "cresselia", "swampert", "cobalion", "virizion", "talonflame", "guzzlord", "jellicent", "feraligatr", "pidgeot", "skeledirge", "poliwrath", "steelix", "charizard", "tapu_fini", "mandibuzz", "gliscor", "trevenant", "scrafty", "obstagoon", "snorlax", "aurorus", "sylveon", "granbull", "ampharos", "greninja", "chesnaught", "buzzwole", "venusaur", "blastoise", "walrein", "dragonite", "machamp", "primeape", "toxicroak", "abomasnow", "scizor", "togekiss", "galvantula"],
    master: ["dialga", "palkia", "kyogre", "groudon", "mewtwo", "giratina", "zacian", "lugia", "landorus", "zekrom", "reshiram", "dragonite", "mamoswine", "metagross", "melmetal", "ho-oh", "rayquaza", "garchomp", "yveltal", "solgaleo", "lunala", "xerneas", "kyurem", "togekiss", "florges", "zarude", "darkrai", "hydreigon", "tyranitar", "machamp", "haxorus", "gyarados", "excadrill", "snorlax"]
  };
  return (fallbacks[leagueKey] || []).map(name => ({ speciesId: name, speciesName: name }));
}

async function fetchPvPokeRankings() {
  const urls = {
    great: "https://pvpoke.com/data/rankings/all/overall/rankings-1500.json",
    ultra: "https://pvpoke.com/data/rankings/all/overall/rankings-2500.json",
    master: "https://pvpoke.com/data/rankings/all/overall/rankings-10000.json"
  };

  let updated = false;
  for (const [league, url] of Object.entries(urls)) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      pvpokeRankings[league] = data;
      console.log(`Fetched PvPoke ${league} rankings: ${data.length} species.`);
      updated = true;
    } catch (e) {
      console.warn(`Failed to fetch PvPoke ${league} rankings, using fallback:`, e);
      if (!pvpokeRankings[league] || pvpokeRankings[league].length === 0) {
        pvpokeRankings[league] = getFallbackRankings(league);
      }
    }
  }

  if (updated) {
    localStorage.setItem('pokego_tracker_pvpoke_rankings', JSON.stringify(pvpokeRankings));
  }
}

// --- STATE MANAGEMENT ---
let state = {
  version: 2,
  pokemonCollection: {}, // { id: { owned, shiny, shadow, lucky, hundo, mega, max } }
  trainerLevel: 70,       
  levelTasks: {},        
  currentXP: 85853000,   
  targetLevel: 80,
  dailyXPGain: 150000,
  medals: {},            // { medalId: { tier: 'none'|'bronze'|'silver'|'gold'|'platinum', progress: 0, hidden: false } }
  friends: [],           
  storageCap: 400,
  storageUsed: 220,
  itemCap: 500,
  items: {
    poke_ball: 120, great_ball: 60, ultra_ball: 25, master_ball: 1,
    potion: 15, super_potion: 12, hyper_potion: 8, max_potion: 30,
    revive: 25, max_revive: 20,
    razz_berry: 45, nanab_berry: 50, pinap_berry: 35, golden_razz: 12, silver_pinap: 6,
    sun_stone: 4, kings_rock: 3, metal_coat: 5, dragon_scale: 2, upgrade: 2, sinnoh_stone: 6, unova_stone: 4,
    fast_tm: 12, charged_tm: 18, elite_fast: 2, elite_charged: 3,
    rare_candy: 45, rare_candy_xl: 8, max_particles: 250,
    premium_pass: 5, remote_pass: 2, rocket_radar: 2, super_radar: 1, link_charge: 0,
    lucky_egg: 6, star_piece: 10, incense: 8, lure_module: 4
  }
};

// --- INITIAL DATA & METRICS ---

// Generate cumulative XP for Levels 1-80
const cumulativeXPArray = new Array(81).fill(0);
const xpMilestones = {
  1: 0, 10: 45000, 20: 210000, 30: 2000000, 40: 20000000, 60: 34353000, 70: 85853000, 80: 203353000
};

function generateXPCurve() {
  const milestones = Object.keys(xpMilestones).map(Number).sort((a,b) => a - b);
  for (let i = 0; i < milestones.length - 1; i++) {
    const startLvl = milestones[i];
    const endLvl = milestones[i+1];
    const startXP = xpMilestones[startLvl];
    const endXP = xpMilestones[endLvl];
    
    for (let l = startLvl; l <= endLvl; l++) {
      const t = (l - startLvl) / (endLvl - startLvl);
      cumulativeXPArray[l] = Math.round(startXP + t * (endXP - startXP));
    }
  }
}
generateXPCurve();

// Level Up Research Tasks (Levels 71-80)
const levelTasksDatabase = {
  71: [
    { desc: "Earn 15 Platinum medals", tip: "Focus on Type catch medals as they require the least unique actions." },
    { desc: "Power up Legendary or Mythical Pokémon 20 times", tip: "Evolve/power up low level catches like Meltan to save dust." },
    { desc: "Make 999 Nice Throws", tip: "Target large raid bosses with slow movements like Kyogre." },
    { desc: "Catch 100 Pokémon in a single day", tip: "Play on a Spotlight Hour (Tuesdays) or Community Day." }
  ],
  72: [
    { desc: "Earn 20 Platinum medals", tip: "Progress long term milestones like Jogger or Backpacker." },
    { desc: "Complete a Route 7 days in a row", tip: "Find a short Route near your home and run it daily." },
    { desc: "Use 200 supereffective Charged Attacks", tip: "Battle Blanche/Candela or Gym defenders." },
    { desc: "Earn 1,000,000 Stardust", tip: "Use Star Pieces when claiming weekly research and battle rewards." }
  ],
  73: [
    { desc: "Earn 25 Platinum medals", tip: "Participate in showcases and trade distance medals." },
    { desc: "Purify 100 Shadow Pokémon", tip: "Focus on Grunts that yield 1,000 Stardust purifications (Zubat, Rattata)." },
    { desc: "Power up 3 Pokémon to their max CP", tip: "Use Lucky Pokémon since they require 50% less Stardust to power up." },
    { desc: "Win 30 Raids", tip: "Use daily free passes on Soloable Tier 1-3 raids." }
  ],
  74: [
    { desc: "Earn 30 Platinum medals", tip: "Focus on type medals. 18 types are available." },
    { desc: "Level up a Max Move 20 times", tip: "Claim daily Max Particles from Power Spots to upgrade moves." },
    { desc: "Explore 200 km", tip: "Keep Adventure Sync enabled in settings." },
    { desc: "Complete 250 Field Research tasks", tip: "Delete tasks that take too long and spin other stops." }
  ],
  75: [
    { desc: "Earn 34 Platinum medals", tip: "Progress breeder and collector medals." },
    { desc: "Make 999 Great Throws", tip: "Set circle locks on Legendary raid encounters." },
    { desc: "Hatch 75 Eggs", tip: "Focus on hatching 2km eggs to speed up rotations." },
    { desc: "Send 500 Gifts to friends", tip: "Add active trainers from online codes forums to load up." }
  ],
  76: [
    { desc: "Earn 38 Platinum medals", tip: "Increase Grunt battles and showcase wins." },
    { desc: "Defeat 100 Team GO Rocket Grunts", tip: "Watch for Hot Air Balloons which spawn 4 times a day." },
    { desc: "Explore 300 km", tip: "Incorporate walks, running, or low-speed cycling." },
    { desc: "Catch 200 Pokémon in a single day", tip: "Fast-catch during Community Days or Spotlight Hours." }
  ],
  77: [
    { desc: "Earn 41 Platinum medals", tip: "Max out older generations region medals." },
    { desc: "Win 100 Max Battles", tip: "Take down 1-Star Dynamax bosses daily." },
    { desc: "Power up 7 Pokémon to their max CP", tip: "Prep budget meta-relevant species (e.g. Machamp, Hydreigon)." },
    { desc: "Make 10 trades with Pokémon caught at least 300 km apart", tip: "Hatch 7km Friend eggs from remote regions to trade." }
  ],
  78: [
    { desc: "Earn 44 Platinum medals", tip: "Work on PvP league badges (Great/Ultra/Master)." },
    { desc: "Earn 400 hearts with your buddy Pokémon", tip: "Swap between buddies to play, feed, and snapshot daily." },
    { desc: "Explore 400 km", tip: "Use Adventure sync and take daily walks." },
    { desc: "Complete 500 Field Research tasks", tip: "Visit high-density PokeStop hubs to get fast tasks." }
  ],
  79: [
    { desc: "Earn 47 Platinum medals", tip: "Unlock badges nearing completion. Check the Medal Tracker." },
    { desc: "Defeat a Team GO Rocket Leader 30 times", tip: "Assemble Radars from grunts or buy them." },
    { desc: "Obtain 50 Lucky Pokémon in trades", tip: "Perform 100 random trades daily with local friends." },
    { desc: "Hatch 100 Eggs", tip: "Hatch 2km eggs using regular incubators, save Super Incubators for 10km/12km." }
  ],
  80: [
    { desc: "Earn 50 Platinum medals", tip: "Earn all 18 type medals and 32 gameplay/region medals." },
    { desc: "Win 80 Battles in GO Battle League", tip: "Play during GO Battle Days when match counts are high." },
    { desc: "Win 80 Raids", tip: "Coordinate with remote groups or local raid communities." },
    { desc: "Make 999 Excellent Throws", tip: "Focus on large Pokemon targets like Groudon or Wailmer." }
  ]
};

// Level Up Rewards (Levels 71-80)
const levelRewardsDatabase = {
  71: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Explorer Boots", sprite: "👟", isCosmetic: true },
    { name: "Candy XL", count: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png" }
  ],
  72: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Challenger Cap", sprite: "🧢", isCosmetic: true },
    { name: "Star Piece", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png" }
  ],
  73: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Cyberspace Visor", sprite: "🕶️", isCosmetic: true },
    { name: "Lucky Egg", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png" }
  ],
  74: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Neon Joggers", sprite: "👖", isCosmetic: true },
    { name: "Lure Module", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lure-module.png" }
  ],
  75: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Elite Jacket", sprite: "🧥", isCosmetic: true },
    { name: "Elite Fast TM", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png" }
  ],
  76: [
    { name: "Ultra Ball", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Tech Gloves", sprite: "🧤", isCosmetic: true },
    { name: "Elite Charged TM", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png" }
  ],
  77: [
    { name: "Ultra Ball", count: 35, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Apex Backpack", sprite: "🎒", isCosmetic: true },
    { name: "Super Incubator", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/egg-incubator-super.png" }
  ],
  78: [
    { name: "Ultra Ball", count: 35, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Holographic Mask", sprite: "🎭", isCosmetic: true },
    { name: "Premium Pass", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premium-battle-pass.png" }
  ],
  79: [
    { name: "Ultra Ball", count: 40, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Grandmaster Top", sprite: "👕", isCosmetic: true },
    { name: "Lucky Egg", count: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png" },
    { name: "Star Piece", count: 2, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png" }
  ],
  80: [
    { name: "Ultra Ball", count: 50, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
    { name: "Max Potion", count: 40, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png" },
    { name: "Max Revive", count: 40, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png" },
    { name: "Champion Pose", sprite: "🧍", isCosmetic: true },
    { name: "Legend Jacket", sprite: "🧥", isCosmetic: true },
    { name: "Master Ball", count: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" },
    { name: "Lucky Egg", count: 5, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png" },
    { name: "Star Piece", count: 5, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png" }
  ]
};

// Medals Database
const medalsDatabase = [
  // Regions
  { id: "kanto", name: "Kanto", desc: "Register Pokémon first discovered in Kanto.", category: "region", bronze: 10, silver: 50, gold: 100, platinum: 151 },
  { id: "johto", name: "Johto", desc: "Register Pokémon first discovered in Johto.", category: "region", bronze: 10, silver: 30, gold: 70, platinum: 100 },
  { id: "hoenn", name: "Hoenn", desc: "Register Pokémon first discovered in Hoenn.", category: "region", bronze: 10, silver: 40, gold: 90, platinum: 135 },
  { id: "sinnoh", name: "Sinnoh", desc: "Register Pokémon first discovered in Sinnoh.", category: "region", bronze: 10, silver: 30, gold: 80, platinum: 107 },
  { id: "unova", name: "Unova", desc: "Register Pokémon first discovered in Unova.", category: "region", bronze: 10, silver: 50, gold: 100, platinum: 156 },
  { id: "kalos", name: "Kalos", desc: "Register Pokémon first discovered in Kalos.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 72 },
  { id: "alola", name: "Alola", desc: "Register Pokémon first discovered in Alola.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 80 },
  { id: "galar", name: "Galar", desc: "Register Pokémon first discovered in Galar.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 89 },
  
  // Gameplay
  { id: "jogger", name: "Jogger", desc: "Walk distance in km.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 10000 },
  { id: "collector", name: "Collector", desc: "Catch Pokémon.", category: "gameplay", bronze: 100, silver: 1000, gold: 10000, platinum: 50000 },
  { id: "scientist", name: "Scientist", desc: "Evolve Pokémon.", category: "gameplay", bronze: 10, silver: 50, gold: 500, platinum: 2000 },
  { id: "breeder", name: "Breeder", desc: "Hatch Eggs.", category: "gameplay", bronze: 10, silver: 100, gold: 500, platinum: 2500 },
  { id: "backpacker", name: "Backpacker", desc: "Spin PokéStops or Gyms.", category: "gameplay", bronze: 100, silver: 1000, gold: 10000, platinum: 50000 },
  { id: "battlegirl", name: "Battle Girl", desc: "Win Gym battles.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 4000 },
  { id: "champion", name: "Champion", desc: "Win Raids.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2000 },
  { id: "ranger", name: "Ranger", desc: "Complete Field Research tasks.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2500 },
  { id: "purifier", name: "Purifier", desc: "Purify Shadow Pokémon.", category: "gameplay", bronze: 5, silver: 50, gold: 500, platinum: 1000 },
  { id: "hero", name: "Hero", desc: "Defeat Team GO Rocket Grunts.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2000 },
  { id: "ultrahero", name: "Giovanni Boss", desc: "Defeat Team GO Rocket Boss Giovanni.", category: "gameplay", bronze: 1, silver: 5, gold: 20, platinum: 50 },
  { id: "pikachufan", name: "Pikachu Fan", desc: "Catch Pikachu.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000 },
  { id: "youngster", name: "Youngster", desc: "Catch tiny Rattata.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000 },
  { id: "fisherman", name: "Fisherman", desc: "Catch big Magikarp.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000 },
  { id: "berrycatcher", name: "Berry Catcher", desc: "Feed berries at Gyms.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 15000 },
  { id: "gymleader", name: "Gym Leader", desc: "Hours defended gyms.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 15000 },
  { id: "idol", name: "Idol", desc: "Reach Best Friends status.", category: "gameplay", bronze: 1, silver: 2, gold: 3, platinum: 20 },
  { id: "gentleman", name: "Gentleman", desc: "Trade Pokémon.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2500 },
  { id: "pilot", name: "Pilot", desc: "Earn distance on trades (km).", category: "gameplay", bronze: 1000, silver: 10000, gold: 100000, platinum: 1000000 },
  { id: "cameraman", name: "Cameraman", desc: "Take buddy snapshot encounters.", category: "gameplay", bronze: 10, silver: 50, gold: 200, platinum: 400 },
  { id: "wayfarer", name: "Wayfarer", desc: "Complete Wayfinder agreements.", category: "gameplay", bronze: 10, silver: 50, gold: 250, platinum: 1500 },
  { id: "risingstar", name: "Rising Star", desc: "Raid unique species.", category: "gameplay", bronze: 2, silver: 10, gold: 50, platinum: 150 },
  { id: "triathlete", name: "Triathlete", desc: "Get 7-day catch/spin streaks.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100 },
  { id: "showcasestar", name: "Showcase Star", desc: "Win PokéStop Showcases.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100 },
  { id: "maxbattle", name: "Max Battler", desc: "Win Max Battles.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100 },
  { id: "successor", name: "Successor", desc: "Mega Evolve Pokémon times.", category: "gameplay", bronze: 1, silver: 50, gold: 250, platinum: 1000 },
  { id: "megaguru", name: "Mega Guru", desc: "Mega Evolve unique species.", category: "gameplay", bronze: 1, silver: 24, gold: 36, platinum: 46 },
  
  // Types
  { id: "type-normal", name: "Schoolkid (Normal)", desc: "Catch Normal-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-fire", name: "Kindler (Fire)", desc: "Catch Fire-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-water", name: "Swimmer (Water)", desc: "Catch Water-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-grass", name: "Gardener (Grass)", desc: "Catch Grass-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-electric", name: "Rocker (Electric)", desc: "Catch Electric-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-ice", name: "Skier (Ice)", desc: "Catch Ice-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-fighting", name: "Black Belt (Fighting)", desc: "Catch Fighting-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-poison", name: "Punk Girl (Poison)", desc: "Catch Poison-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-ground", name: "Ruin Maniac (Ground)", desc: "Catch Ground-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-flying", name: "Bird Keeper (Flying)", desc: "Catch Flying-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-psychic", name: "Psychic (Psychic)", desc: "Catch Psychic-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-bug", name: "Bug Catcher (Bug)", desc: "Catch Bug-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-rock", name: "Hiker (Rock)", desc: "Catch Rock-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-ghost", name: "Hex Maniac (Ghost)", desc: "Catch Ghost-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-dragon", name: "Dragon Tamer (Dragon)", desc: "Catch Dragon-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-steel", name: "Depot Agent (Steel)", desc: "Catch Steel-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-fairy", name: "Fairy Tale Girl (Fairy)", desc: "Catch Fairy-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 },
  { id: "type-dark", name: "Delinquent (Dark)", desc: "Catch Dark-type Pokémon.", category: "type", bronze: 10, silver: 50, gold: 200, platinum: 2500 }
];

// Item Registry
const itemRegistry = {
  poke_ball: { name: "Poké Ball", emoji: "🔴", cat: "balls", threshold: 100, discardTip: "Delete if you have surplus Great/Ultra Balls for Auto-Catch devices." },
  great_ball: { name: "Great Ball", emoji: "🔵", cat: "balls", threshold: 150 },
  ultra_ball: { name: "Ultra Ball", emoji: "🟡", cat: "balls", threshold: 200 },
  master_ball: { name: "Master Ball", emoji: "🟣", cat: "balls", threshold: 5 },
  
  potion: { name: "Potion", emoji: "🧪", cat: "healing", threshold: 0, discardTip: "Safe to discard entirely if you possess Hyper/Max Potions." },
  super_potion: { name: "Super Potion", emoji: "🧪", cat: "healing", threshold: 0, discardTip: "Safe to discard entirely if you possess Hyper/Max Potions." },
  hyper_potion: { name: "Hyper Potion", emoji: "🧪", cat: "healing", threshold: 30, discardTip: "Keep up to 30. Max Potions are strictly better." },
  max_potion: { name: "Max Potion", emoji: "🧪", cat: "healing", threshold: 50 },
  revive: { name: "Revive", emoji: "✨", cat: "healing", threshold: 30 },
  max_revive: { name: "Max Revive", emoji: "✨", cat: "healing", threshold: 50 },
  
  razz_berry: { name: "Razz Berry", emoji: "🍓", cat: "berries", threshold: 30, discardTip: "Feed to Gym defenders for Stardust to free up space." },
  nanab_berry: { name: "Nanab Berry", emoji: "🍌", cat: "berries", threshold: 0, discardTip: "Useless berry. Throw away or feed to gym defenders immediately." },
  pinap_berry: { name: "Pinap Berry", emoji: "🍍", cat: "berries", threshold: 60 },
  golden_razz: { name: "Golden Razz", emoji: "🍓", cat: "berries", threshold: 50 },
  silver_pinap: { name: "Silver Pinap", emoji: "🍍", cat: "berries", threshold: 30 },
  
  sun_stone: { name: "Sun Stone", emoji: "☀️", cat: "stones", threshold: 3, discardTip: "Keep maximum 3. Rare use case." },
  kings_rock: { name: "King's Rock", emoji: "👑", cat: "stones", threshold: 3, discardTip: "Keep maximum 3." },
  metal_coat: { name: "Metal Coat", emoji: "Onix", cat: "stones", threshold: 3, discardTip: "Keep maximum 3." },
  dragon_scale: { name: "Dragon Scale", emoji: "🐉", cat: "stones", threshold: 3, discardTip: "Keep maximum 3." },
  upgrade: { name: "Up-Grade", emoji: "💿", cat: "stones", threshold: 2, discardTip: "Keep maximum 2." },
  sinnoh_stone: { name: "Sinnoh Stone", emoji: "💎", cat: "stones", threshold: 8 },
  unova_stone: { name: "Unova Stone", emoji: "💎", cat: "stones", threshold: 5 },
  
  fast_tm: { name: "Fast TM", emoji: "⚡", cat: "tms", threshold: 15, discardTip: "Keep 15. Discard extras." },
  charged_tm: { name: "Charged TM", emoji: "⚡", cat: "tms", threshold: 20, discardTip: "Keep 20. Discard extras." },
  elite_fast: { name: "Elite Fast TM", emoji: "⚡", cat: "tms", threshold: 10 },
  elite_charged: { name: "Elite Charged TM", emoji: "⚡", cat: "tms", threshold: 10 },
  rare_candy: { name: "Rare Candy", emoji: "🍬", cat: "other", threshold: 100, discardTip: "Feed candies directly into Legendary species to clear storage." },
  rare_candy_xl: { name: "Rare Candy XL", emoji: "🍬", cat: "other", threshold: 100 },
  max_particles: { name: "Max Particles", emoji: "⚡", cat: "other", threshold: 800 },
  
  premium_pass: { name: "Premium Pass", emoji: "🎫", cat: "passes", threshold: 50 },
  remote_pass: { name: "Remote Pass", emoji: "🎫", cat: "passes", threshold: 5 },
  rocket_radar: { name: "Rocket Radar", emoji: "🛰️", cat: "passes", threshold: 10 },
  super_radar: { name: "Super Radar", emoji: "🛰️", cat: "passes", threshold: 5 },
  link_charge: { name: "Link Charge", emoji: "🎫", cat: "passes", threshold: 200, discardTip: "Keep up to 200. Max storage is 600." },
  
  lucky_egg: { name: "Lucky Egg", emoji: "🥚", cat: "boosts", threshold: 20 },
  star_piece: { name: "Star Piece", emoji: "🌟", cat: "boosts", threshold: 20 },
  incense: { name: "Incense", emoji: "💨", cat: "boosts", threshold: 15 },
  lure_module: { name: "Lure Module", emoji: "🌸", cat: "boosts", threshold: 10 }
};

const itemSprites = {
  poke_ball: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png",
  great_ball: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/greatball_sprite.png",
  ultra_ball: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/ultraball_sprite.png",
  master_ball: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/masterball_sprite.png",
  
  potion: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0101.png",
  super_potion: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0102.png",
  hyper_potion: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0103.png",
  max_potion: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0104.png",
  revive: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0201.png",
  max_revive: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0202.png",
  
  razz_berry: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0701.png",
  nanab_berry: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0703.png",
  pinap_berry: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0705.png",
  golden_razz: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0706.png",
  silver_pinap: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_0707.png",
  
  sun_stone: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Sun_Stone_Sprite.png",
  kings_rock: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_King%27s_Rock_Sprite.png",
  metal_coat: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Metal_Coat_Sprite.png",
  dragon_scale: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Dragon_Scale_Sprite.png",
  upgrade: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Up-Grade_Sprite.png",
  sinnoh_stone: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Sinnoh_Stone_Sprite.png",
  unova_stone: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Bag_Unova_Stone_Sprite.png",
  
  fast_tm: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1201.png",
  charged_tm: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1202.png",
  elite_fast: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1203.png",
  elite_charged: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1204.png",
  
  rare_candy: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/candy_rgb.png",
  rare_candy_xl: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/RareXLCandy_PSD.png",
  max_particles: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/item_1600.png",
  
  premium_pass: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1402.png",
  remote_pass: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1408.png",
  rocket_radar: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_Leader_MapCompass.png",
  super_radar: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_Giovanni_MapCompass.png",
  link_charge: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/item_1700.png",
  
  lucky_egg: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/luckyegg.png",
  star_piece: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/starpiece.png",
  incense: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Incense_1.png",
  lure_module: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/TroyKey.png"
};

// --- INITIALIZATION ---
// --- UNIFIED ONLINE AUTO-SYNC & PERSISTENCE ---
async function syncAllDataOnline(force = false) {
  if (!navigator.onLine) {
    console.log("Offline: Skipping auto-sync.");
    return;
  }

  const now = Date.now();
  const lastSync = localStorage.getItem('pokego_tracker_last_sync');
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (!force && lastSync && (now - parseInt(lastSync) < oneDayMs)) {
    const hoursLeft = ((oneDayMs - (now - parseInt(lastSync))) / (1000 * 60 * 60)).toFixed(1);
    console.log(`Auto-sync skipped. Next sync scheduled in ${hoursLeft} hours.`);
    return;
  }

  console.log("Starting unified data sync...");
  try {
    // Perform fetches in parallel
    await Promise.all([
      fetchPvPokeRankings(),
      fetchReleasedPokemon(),
      fetchLiveEvents()
    ]);
    
    localStorage.setItem('pokego_tracker_last_sync', now.toString());
    console.log("Unified data sync completed successfully.");
    renderPokedex();
  } catch (error) {
    console.error("Error during unified data sync:", error);
  }
}

// Add state transition listener for online state
window.addEventListener('online', () => {
  console.log("Device back online. Triggering forced sync.");
  syncAllDataOnline(true);
});

// Periodic hour interval checker
setInterval(() => {
  console.log("Running hourly auto-sync check...");
  syncAllDataOnline(false);
}, 60 * 60 * 1000); // 1 hour

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  initUIElements();
  switchTab('pokedex');
  
  // Render initially with loaded cache or defaults
  renderPokedex();
  renderLevelTracker();
  renderMedalTracker();
  renderFriendsTracker();
  renderItemInventory();
  updateStorageProgress();
  updateItemStorageProgress();
  generateSearchString();
  
  // Try to load events from cache (handles its own rendering)
  fetchLiveEvents();
  
  // Run background sync manager
  syncAllDataOnline(false);

  // Set up Supabase auth change listener
  if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      currentUserSession = session;
      const loggedOutEl = document.getElementById('auth-logged-out');
      const loggedInEl = document.getElementById('auth-logged-in');
      const syncStatusEl = document.getElementById('cloud-sync-status');

      if (session) {
        console.log("Auth State Changed: Signed In", session.user);
        if (loggedOutEl) loggedOutEl.style.display = 'none';
        if (loggedInEl) loggedInEl.style.display = 'flex';

        const user = session.user;
        const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
        
        const nameEl = document.getElementById('user-display-name');
        const emailEl = document.getElementById('user-email-subtitle');
        const avatarEl = document.getElementById('user-avatar');
        
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = user.email;
        if (avatarEl) avatarEl.src = avatarUrl;

        // Check if Google OAuth is the login method
        const isGoogleUser = session.provider_token && (user.app_metadata?.provider === 'google' || user.identities?.some(id => id.provider === 'google'));
        
        if (isGoogleUser) {
          activeSyncProvider = 'google-drive';
          console.log("Sync provider: Google Drive AppData");
          await loadGoogleDriveState(session.provider_token);
        } else {
          activeSyncProvider = 'supabase';
          console.log("Sync provider: Supabase Cloud Database");
          await loadCloudStateAndMerge(user);
        }
      } else {
        console.log("Auth State Changed: Signed Out");
        activeSyncProvider = 'local';
        googleDriveFileId = null;
        if (loggedOutEl) loggedOutEl.style.display = 'flex';
        if (loggedInEl) loggedInEl.style.display = 'none';
        if (syncStatusEl) syncStatusEl.style.display = 'none';
      }
    });
  }
});

async function fetchReleasedPokemon() {
  try {
    const response = await fetch('https://pogoapi.net/api/v1/released_pokemon.json');
    if (!response.ok) throw new Error('API response not OK');
    const releasedDict = await response.json();
    
    // Save to localStorage
    const releasedIds = Object.keys(releasedDict).map(Number);
    localStorage.setItem('pokego_tracker_released_ids', JSON.stringify(releasedIds));
    
    let updatedCount = 0;
    window.pokemonDatabase.forEach(p => {
      const isReleased = !!releasedDict[p.id];
      if (p.released !== isReleased) {
        p.released = isReleased;
        updatedCount++;
      }
    });
    
    console.log(`Live Fetch: Updated released status for ${updatedCount} Pokémon.`);
    if (updatedCount > 0) {
      renderPokedex();
    }
  } catch (error) {
    console.error('Failed to live-fetch released Pokémon data:', error);
  }
}

function getPokeAPISprite(pokemonName) {
  let cleanName = pokemonName
    .replace(/Dynamax/i, '')
    .replace(/Gigantamax/i, '')
    .replace(/\(Shadow\)/i, '')
    .replace(/Shadow/i, '')
    .trim();
  
  if (window.pokemonDatabase) {
    const norm = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = window.pokemonDatabase.find(p => {
      const pNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return pNorm === norm || norm.includes(pNorm) || pNorm.includes(norm);
    });
    if (found) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${found.id}.png`;
    }
  }
  
  const extraMappings = {
    grookey: 810,
    scorbunny: 813,
    sobble: 816,
    falinks: 870,
    toxtricity: 849,
    drilbur: 529,
    excadrill: 530,
    beldum: 374,
    metang: 375,
    metagross: 376,
    wooloo: 831,
    dubwool: 832,
    skwovet: 819,
    greedent: 820,
    chansey: 113,
    gastly: 92,
    haunter: 93,
    gengar: 94
  };
  
  const norm = cleanName.toLowerCase();
  if (extraMappings[norm]) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${extraMappings[norm]}.png`;
  }
  
  return null;
}

function renderLiveEvents(data) {
  const eventsLoading = document.getElementById('events-loading');
  const raidsCol2Loading = document.getElementById('raids-col2-loading');
  const raidsCol3Loading = document.getElementById('raids-col3-loading');
  const eventsList = document.getElementById('events-list');
  const raidsCol2Container = document.getElementById('raids-col2-container');
  const raidsCol3Container = document.getElementById('raids-col3-container');
  
  if (!eventsList || !raidsCol2Container || !raidsCol3Container) return;

  // Hide loading indicators
  if (eventsLoading) eventsLoading.style.display = 'none';
  if (raidsCol2Loading) raidsCol2Loading.style.display = 'none';
  if (raidsCol3Loading) raidsCol3Loading.style.display = 'none';
  
  eventsList.innerHTML = '';
  raidsCol2Container.innerHTML = '';
  raidsCol3Container.innerHTML = '';
  
  const now = new Date();
  
  // Sort events
  const activeEvents = data.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    return now >= start && now <= end;
  });
  
  // If no active events, let's display upcoming ones
  const displayEvents = activeEvents.length > 0 ? activeEvents : data.slice(0, 5);
  
  displayEvents.forEach(e => {
    const card = document.createElement('a');
    card.href = e.link;
    card.target = "_blank";
    card.className = "event-item-card";
    card.style.textDecoration = "none";
    card.style.color = "inherit";
    
    const start = new Date(e.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const end = new Date(e.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    card.innerHTML = `
      <div class="event-card-inner">
        <img src="${e.image}" alt="${e.name}" onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'">
        <div class="event-card-details">
          <span class="event-type-badge">${e.heading || e.eventType}</span>
          <h4>${e.name}</h4>
          <p><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${start} - ${end}</p>
        </div>
      </div>
    `;
    eventsList.appendChild(card);
  });
  
  // Parse Raids
  const tierMapping = {
    mega: [],
    t5: [],
    t3: [],
    max: []
  };
  
  data.forEach(e => {
    const nameLower = e.name.toLowerCase();
    let tier = null;
    if (nameLower.includes('mega raids') || nameLower.includes('mega-raids') || nameLower.includes('mega audino') || nameLower.includes('mega rayquaza')) {
      tier = 'mega';
    } else if (nameLower.includes('5-star') || nameLower.includes('five-star') || nameLower.includes('t5') || nameLower.includes('tier 5')) {
      tier = 't5';
    } else if (nameLower.includes('3-star') || nameLower.includes('three-star') || nameLower.includes('t3')) {
      tier = 't3';
    } else if (nameLower.includes('max battle') || nameLower.includes('dynamax') || nameLower.includes('gigantamax') || nameLower.includes('max mondays')) {
      tier = 'max';
    }
    
    if (tier && e.extraData && e.extraData.raidbattles && e.extraData.raidbattles.bosses) {
      e.extraData.raidbattles.bosses.forEach(b => {
        if (!tierMapping[tier].some(x => x.name === b.name)) {
          tierMapping[tier].push({
            name: b.name,
            image: b.image,
            shiny: b.canBeShiny
          });
        }
      });
    } else if (tier && e.eventType === 'max-mondays') {
      let bossName = e.name.replace('Dynamax ', '').replace(' during Max Monday', '').trim();
      if (!tierMapping['max'].some(x => x.name === bossName)) {
        tierMapping['max'].push({
          name: bossName,
          image: e.image,
          shiny: true
        });
      }
    }
  });
  
  // Fallback data if API returns empty
  if (tierMapping.mega.length === 0) {
    tierMapping.mega.push({ name: "Mega Audino", image: "https://cdn.leekduck.com/assets/img/events/mega-default.jpg", shiny: true });
  }
  if (tierMapping.t5.length === 0) {
    tierMapping.t5.push({ name: "Reshiram", image: "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_643_00.png", shiny: true });
  }
  if (tierMapping.t3.length === 0) {
    tierMapping.t3.push({ name: "Machamp", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png", shiny: true });
    tierMapping.t3.push({ name: "Alolan Marowak", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/105.png", shiny: true });
  }
  if (tierMapping.max.length === 0) {
    tierMapping.max.push({ name: "Electabuzz", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/125.png", shiny: true });
  }
  
  // Render Column 2: 5-Star & 3-Star Raids
  const col2Tiers = [
    { id: "t5", label: "5-Star Raids", color: "var(--color-secondary)", icon: "fa-circle-chevron-up" },
    { id: "t3", label: "3-Star Raids", color: "var(--color-accent)", icon: "fa-star" }
  ];
  
  col2Tiers.forEach(t => {
    const bosses = tierMapping[t.id];
    if (bosses.length === 0) return;
    
    const groupDiv = document.createElement('div');
    groupDiv.className = "raid-tier-group";
    groupDiv.style.marginBottom = "14px";
    
    groupDiv.innerHTML = `
      <h4 style="font-family: var(--font-title); font-size: 11px; font-weight:800; text-transform:uppercase; color: ${t.color}; margin-bottom: 8px; display:flex; align-items:center; gap: 6px;">
        <i class="fa-solid ${t.icon}"></i> ${t.label}
      </h4>
      <div class="raid-bosses-list" style="display:flex; flex-direction:column; gap:6px;">
        ${bosses.map(b => {
          const apiImg = getPokeAPISprite(b.name) || b.image;
          const found = findPokemonByBossName(b.name);
          const clickableClass = found ? 'clickable' : '';
          const onclickAttr = found ? `onclick="showPokemonDetail(${found.id})"` : '';
          return `
            <div class="raid-boss-item ${clickableClass}" ${onclickAttr}>
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="${apiImg}" alt="${b.name}" onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'">
                <span>${b.name}</span>
              </div>
              ${b.shiny ? `<span class="shiny-indicator"><i class="fa-solid fa-star"></i> Shiny Eligible</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    raidsCol2Container.appendChild(groupDiv);
  });

  // Render Column 3: Mega Raids & Max Battles
  const col3Tiers = [
    { id: "mega", label: "Mega Raids", color: "var(--color-mega)", icon: "fa-atom" },
    { id: "max", label: "Max Battles (Dynamax)", color: "var(--color-max)", icon: "fa-bolt" }
  ];
  
  col3Tiers.forEach(t => {
    const bosses = tierMapping[t.id];
    if (bosses.length === 0) return;
    
    const groupDiv = document.createElement('div');
    groupDiv.className = "raid-tier-group";
    groupDiv.style.marginBottom = "14px";
    
    groupDiv.innerHTML = `
      <h4 style="font-family: var(--font-title); font-size: 11px; font-weight:800; text-transform:uppercase; color: ${t.color}; margin-bottom: 8px; display:flex; align-items:center; gap: 6px;">
        <i class="fa-solid ${t.icon}"></i> ${t.label}
      </h4>
      <div class="raid-bosses-list" style="display:flex; flex-direction:column; gap:6px;">
        ${bosses.map(b => {
          const apiImg = getPokeAPISprite(b.name) || b.image;
          const found = findPokemonByBossName(b.name);
          const clickableClass = found ? 'clickable' : '';
          const onclickAttr = found ? `onclick="showPokemonDetail(${found.id})"` : '';
          return `
            <div class="raid-boss-item ${clickableClass}" ${onclickAttr}>
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="${apiImg}" alt="${b.name}" onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'">
                <span>${b.name}</span>
              </div>
              ${b.shiny ? `<span class="shiny-indicator"><i class="fa-solid fa-star"></i> Shiny Eligible</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    raidsCol3Container.appendChild(groupDiv);
  });
}

async function fetchLiveEvents() {
  const eventsLoading = document.getElementById('events-loading');
  const col2Err = document.getElementById('raids-col2-loading');
  const col3Err = document.getElementById('raids-col3-loading');
  
  // 1. Try to load cached data first
  const savedEvents = localStorage.getItem('pokego_tracker_events_json');
  if (savedEvents) {
    try {
      const parsed = JSON.parse(savedEvents);
      renderLiveEvents(parsed);
      console.log("Loaded persisted live events from cache.");
    } catch (e) {
      console.error("Error parsing cached live events:", e);
    }
  }

  // 2. Fetch live data from endpoint
  try {
    const response = await fetch('https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json');
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    
    // Save to localStorage
    localStorage.setItem('pokego_tracker_events_json', JSON.stringify(data));
    
    // Render fresh data
    renderLiveEvents(data);
  } catch (error) {
    console.error('Error fetching live events:', error);
    
    // Only display error indicators if there was no cached data to display
    if (!localStorage.getItem('pokego_tracker_events_json')) {
      if (eventsLoading) eventsLoading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to load events.</span>`;
      if (col2Err) col2Err.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to load.</span>`;
      if (col3Err) col3Err.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to load.</span>`;
    }
  }
}

// --- CORE APP METHODS ---

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) activeNav.classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
  const activePanel = document.getElementById(`panel-${tabId}`);
  if (activePanel) activePanel.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadState() {
  const saved = localStorage.getItem('pokego_tracker_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.version || parsed.version < 2) {
        localStorage.removeItem('pokego_tracker_state');
        initFreshState();
        return;
      }
      state = { ...state, ...parsed };
      state.pokemonCollection = { ...state.pokemonCollection, ...parsed.pokemonCollection };
      state.items = { ...state.items, ...parsed.items };
      state.medals = { ...state.medals, ...parsed.medals };
    } catch (e) {
      console.error("State loading error. Utilizing default.", e);
    }
  } else {
    initFreshState();
  }

  // Load and apply offline persistence for released Pokémon IDs
  const savedReleased = localStorage.getItem('pokego_tracker_released_ids');
  if (savedReleased) {
    try {
      const releasedIds = JSON.parse(savedReleased);
      if (Array.isArray(releasedIds)) {
        const releasedSet = new Set(releasedIds);
        window.pokemonDatabase.forEach(p => {
          p.released = releasedSet.has(p.id);
        });
        console.log(`Loaded persisted release status for ${releasedSet.size} Pokémon.`);
      }
    } catch (e) {
      console.error("Error parsing persisted released Pokémon IDs:", e);
    }
  }

  // Load and apply offline persistence for PvPoke rankings
  const savedRankings = localStorage.getItem('pokego_tracker_pvpoke_rankings');
  if (savedRankings) {
    try {
      const parsedRankings = JSON.parse(savedRankings);
      if (parsedRankings && parsedRankings.great && parsedRankings.ultra && parsedRankings.master) {
        pvpokeRankings = parsedRankings;
        console.log("Loaded persisted PvPoke rankings from cache.");
      }
    } catch (e) {
      console.error("Error parsing persisted PvPoke rankings:", e);
    }
  } else {
    // If no cache, initialize with fallbacks initially
    pvpokeRankings.great = getFallbackRankings('great');
    pvpokeRankings.ultra = getFallbackRankings('ultra');
    pvpokeRankings.master = getFallbackRankings('master');
  }
}

function initFreshState() {
  state.pokemonCollection = {};
  window.pokemonDatabase.forEach(p => {
    state.pokemonCollection[p.id] = {
      owned: false, shiny: false, shadow: false, lucky: false, hundo: false, mega: false, max: false
    };
  });
  state.friends = [
    { id: "f1", name: "AshKetchum", code: "3892 4892 0184", level: "best", daysLeft: 0, giftSent: true, giftOpened: false, battled: true, lucky: false, vivillon: "Archipelago" },
    { id: "f2", name: "MistyWater", code: "8893 2284 1198", level: "ultra", daysLeft: 12, giftSent: false, giftOpened: true, battled: false, lucky: false, vivillon: "Marine" },
    { id: "f3", name: "BrockRock", code: "7729 0018 9982", level: "great", daysLeft: 20, giftSent: false, giftOpened: false, battled: false, lucky: false, vivillon: "Continental" }
  ];
  state.medals = {};
  medalsDatabase.forEach(m => {
    state.medals[m.id] = { tier: 'none', progress: 0, hidden: false };
  });
  state.version = 2;
  saveState();
}

function saveState() {
  localStorage.setItem('pokego_tracker_state', JSON.stringify(state));
  updateDashboardWidgets();

  // If logged in to Supabase, sync changes (debounced) using active provider
  if (supabase && currentUserSession) {
    if (activeSyncProvider === 'google-drive' && currentUserSession.provider_token) {
      updateSyncStatusIndicator('syncing', 'Syncing to Drive...');
      clearTimeout(syncTimeoutId);
      syncTimeoutId = setTimeout(() => {
        pushGoogleDriveState(currentUserSession.provider_token, state);
      }, 1500); // 1.5s debounce
    } else if (activeSyncProvider === 'supabase') {
      updateSyncStatusIndicator('syncing', 'Syncing to Cloud...');
      clearTimeout(syncTimeoutId);
      syncTimeoutId = setTimeout(() => {
        pushStateToCloud(currentUserSession.user.id, state);
      }, 1500); // 1.5s debounce
    }
  }
}

function initUIElements() {
  // Populate levels select
  const lvlSelect = document.getElementById('level-select');
  const targetLvlSelect = document.getElementById('select-target-level');
  
  if (lvlSelect && targetLvlSelect) {
    lvlSelect.innerHTML = '';
    targetLvlSelect.innerHTML = '';
    for (let i = 1; i <= 80; i++) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = `Level ${i}`;
      lvlSelect.appendChild(opt);
      
      const optT = document.createElement('option');
      optT.value = i; optT.textContent = `Level ${i}`;
      targetLvlSelect.appendChild(optT);
    }
    
    lvlSelect.value = state.trainerLevel;
    targetLvlSelect.value = state.targetLevel;
  }
  
  const currXpInput = document.getElementById('input-current-xp');
  const dailyXpInput = document.getElementById('input-daily-xp');
  if (currXpInput) currXpInput.value = state.currentXP;
  if (dailyXpInput) dailyXpInput.value = state.dailyXPGain;

  const storageCapInput = document.getElementById('input-storage-cap');
  const storageUsedInput = document.getElementById('input-storage-used');
  if (storageCapInput) storageCapInput.value = state.storageCap;
  if (storageUsedInput) storageUsedInput.value = state.storageUsed;

  const itemCapInput = document.getElementById('input-item-cap');
  if (itemCapInput) itemCapInput.value = state.itemCap;

  const searchInput = document.getElementById('poke-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderPokedex());
  }
}

function updateDashboardWidgets() {
  let caughtCount = 0;
  let shinyCount = 0;
  let hundoCount = 0;
  let shadowCount = 0;
  let megaCount = 0;
  let maxCount = 0;
  let platinumCount = 0;
  
  const total = window.pokemonDatabase.length;
  
  Object.keys(state.pokemonCollection).forEach(id => {
    const p = state.pokemonCollection[id];
    if (p.owned) caughtCount++;
    if (p.shiny) shinyCount++;
    if (p.hundo) hundoCount++;
    if (p.shadow) shadowCount++;
    if (p.mega) megaCount++;
    if (p.max) maxCount++;
  });

  Object.keys(state.medals).forEach(mId => {
    if (state.medals[mId] && state.medals[mId].tier === 'platinum') {
      platinumCount++;
    }
  });
  
  document.getElementById('stat-caught-count').textContent = `${caughtCount} / ${total}`;
  document.getElementById('stat-shiny-count').textContent = shinyCount;
  document.getElementById('stat-hundo-count').textContent = hundoCount;
  document.getElementById('stat-shadow-count').textContent = shadowCount;
  document.getElementById('stat-mega-count').textContent = megaCount;
  document.getElementById('stat-max-count').textContent = maxCount;
  document.getElementById('stat-medals-count').textContent = platinumCount;
  document.getElementById('stat-trainer-level').textContent = `Level ${state.trainerLevel}`;
}

// --- TAB 1: POKEDEX & RENDER ---

function renderPokedex() {
  const grid = document.getElementById('pokedex-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const searchQuery = document.getElementById('poke-search-input').value.toLowerCase().trim();
  const genFilter = document.getElementById('filter-generation').value;
  const typeFilter = document.getElementById('filter-type').value;
  const releaseFilter = document.getElementById('filter-release').value;
  const exclusivityFilter = document.getElementById('filter-exclusivity').value;
  const utilityFilter = document.getElementById('filter-utility').value;
  const rankFilter = document.getElementById('filter-rank').value;
  const statusFilter = document.getElementById('filter-status').value;
  
  const filtered = window.pokemonDatabase.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || 
                        p.id.toString().includes(searchQuery) ||
                        p.fastMoves.some(m => m.toLowerCase().includes(searchQuery)) ||
                        p.chargedMoves.some(m => m.toLowerCase().includes(searchQuery));
    const matchGen = genFilter === 'all' || p.generation.toString() === genFilter;
    const matchType = typeFilter === 'all' || p.types.includes(typeFilter);
    const matchRelease = releaseFilter === 'all' || 
                         (releaseFilter === 'released' && p.released) || 
                         (releaseFilter === 'unreleased' && !p.released);
    const matchExclusivity = exclusivityFilter === 'all' || p.exclusivity === exclusivityFilter;
    const matchUtility = (() => {
      if (utilityFilter === 'all') return true;
      
      // Core PvP Leagues (populated dynamically from PvPoke)
      if (utilityFilter === 'pvp-great') {
        return isPokemonInPvPokeRankings(p, 'great', 100);
      }
      if (utilityFilter === 'pvp-ultra') {
        return isPokemonInPvPokeRankings(p, 'ultra', 100);
      }
      if (utilityFilter === 'pvp-master') {
        return isPokemonInPvPokeRankings(p, 'master', 100);
      }
      
      // Rocket Counters
      if (utilityFilter === 'rocket') {
        return [3, 6, 9, 94, 149, 150, 248, 376, 382, 383, 384, 445, 448, 809].includes(p.id);
      }
      
      return false;
    })();
    const matchRank = rankFilter === 'all' || p.rank === rankFilter;
    
    const userState = state.pokemonCollection[p.id] || {};
    let matchStatus = true;
    if (statusFilter === 'owned') matchStatus = userState.owned;
    else if (statusFilter === 'missing') matchStatus = !userState.owned;
    else if (statusFilter === 'shiny') matchStatus = userState.shiny;
    else if (statusFilter === 'lucky') matchStatus = userState.lucky;
    else if (statusFilter === 'hundo') matchStatus = userState.hundo;
    else if (statusFilter === 'shadow') matchStatus = userState.shadow;
    else if (statusFilter === 'mega') matchStatus = userState.mega;
    else if (statusFilter === 'max') matchStatus = userState.max;
    
    return matchSearch && matchGen && matchType && matchRelease && matchExclusivity && matchUtility && matchRank && matchStatus;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No Pokémon match filters.</div>`;
    return;
  }
  
  filtered.forEach(p => {
    const userState = state.pokemonCollection[p.id] || { owned: false, shiny: false, shadow: false, lucky: false, hundo: false, mega: false, max: false };
    
    // Special Pokémon (Legendary, Mythical, Ultra Beast - Rank S or S+)
    const isSpecial = p.exclusivity === 'mythical' || p.rank === 'S' || p.rank === 'S+';
    
    const card = document.createElement('div');
    card.className = `pokemon-card ${userState.shiny ? 'shiny-active' : ''} ${userState.hundo ? 'hundo-active' : ''} ${isSpecial ? 'special-card' : ''}`;
    card.setAttribute('onclick', `showPokemonDetail(${p.id})`);
    
    let typesHTML = p.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join(' ');
    let rankBadge = `<span class="pokemon-rarity-badge rarity-${p.rank.replace('+', '-plus')}">Rank ${p.rank}</span>`;
    
    let badgesHTML = '';
    if (!p.released) badgesHTML += `<span class="pokemon-rarity-badge badge-unreleased">Unreleased</span>`;

    // Safe to Transfer tag
    let transferHTML = '';
    if (p.utility === 'filler' && userState.owned) {
      transferHTML = `<div class="transfer-alert-badge"><i class="fa-solid fa-trash-can"></i> Safe to Transfer</div>`;
    }
    
    const hasMega = p.mega ? true : false;
    const hasMax = (p.max && p.max.released) ? true : false;
    
    // Artwork Sprites (PokeAPI high res)
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
    
    card.innerHTML = `
      <div class="card-header">
        <span class="pokedex-number">#${String(p.id).padStart(3, '0')}</span>
        ${rankBadge}
      </div>
      <div class="card-body-split">
        <div class="card-sprite-container">
          <img src="${spriteUrl}" alt="${p.name}" class="card-sprite" loading="lazy" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';">
        </div>
        <div class="card-details-split">
          <span class="pokemon-name">${p.name}</span>
          <div class="pokemon-types">${typesHTML}</div>
          <div class="card-badges" style="margin-bottom:0; margin-top:3px;">${badgesHTML}</div>
        </div>
      </div>
      ${transferHTML}
      
      <div class="card-checklists" onclick="event.stopPropagation()">
        <label class="check-label" title="Mark Caught">
          <input type="checkbox" id="check-owned-${p.id}" ${userState.owned ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'owned')">
          <span class="check-btn"><i class="fa-solid fa-circle-dot"></i></span>
          <span>Caught</span>
        </label>
        
        <label class="check-label" title="Mark Shiny">
          <input type="checkbox" id="check-shiny-${p.id}" ${userState.shiny ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'shiny')">
          <span class="check-btn"><i class="fa-solid fa-star"></i></span>
          <span>Shiny</span>
        </label>
        
        <label class="check-label" title="Mark Shadow">
          <input type="checkbox" id="check-shadow-${p.id}" ${userState.shadow ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'shadow')">
          <span class="check-btn"><i class="fa-solid fa-fire"></i></span>
          <span>Shadow</span>
        </label>

        <label class="check-label" title="Mark 100% Hundo">
          <input type="checkbox" id="check-hundo-${p.id}" ${userState.hundo ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'hundo')">
          <span class="check-btn"><i class="fa-solid fa-ribbon"></i></span>
          <span>100% IV</span>
        </label>

        <label class="check-label" title="${hasMega ? 'Mega unlocked' : 'Mega unavailable'}">
          <input type="checkbox" id="check-mega-${p.id}" ${userState.mega ? 'checked' : ''} ${hasMega ? '' : 'disabled'} onchange="togglePokeState(${p.id}, 'mega')">
          <span class="check-btn ${hasMega ? '' : 'disabled'}"><i class="fa-solid fa-atom"></i></span>
          <span>Mega</span>
        </label>

        <label class="check-label" title="${hasMax ? 'Max unlocked' : 'Max unavailable'}">
          <input type="checkbox" id="check-max-${p.id}" ${userState.max ? 'checked' : ''} ${hasMax ? '' : 'disabled'} onchange="togglePokeState(${p.id}, 'max')">
          <span class="check-btn ${hasMax ? '' : 'disabled'}"><i class="fa-solid fa-bolt"></i></span>
          <span>Max</span>
        </label>
      </div>
    `;
    grid.appendChild(card);
  });
}

function togglePokeState(id, key) {
  const checkbox = document.getElementById(`check-${key}-${id}`);
  const val = checkbox.checked;
  
  if (!state.pokemonCollection[id]) {
    state.pokemonCollection[id] = { owned: false, shiny: false, shadow: false, lucky: false, hundo: false, mega: false, max: false };
  }
  
  state.pokemonCollection[id][key] = val;
  
  if (val && key !== 'owned') {
    state.pokemonCollection[id].owned = true;
    const oC = document.getElementById(`check-owned-${id}`);
    if (oC) oC.checked = true;
  }
  
  if (!val && key === 'owned') {
    state.pokemonCollection[id].shiny = false;
    state.pokemonCollection[id].shadow = false;
    state.pokemonCollection[id].lucky = false;
    state.pokemonCollection[id].hundo = false;
    state.pokemonCollection[id].mega = false;
    state.pokemonCollection[id].max = false;
    
    const chShiny = document.getElementById(`check-shiny-${id}`);
    const chShadow = document.getElementById(`check-shadow-${id}`);
    const chHundo = document.getElementById(`check-hundo-${id}`);
    const chMega = document.getElementById(`check-mega-${id}`);
    const chMax = document.getElementById(`check-max-${id}`);
    
    if (chShiny) chShiny.checked = false;
    if (chShadow) chShadow.checked = false;
    if (chHundo) chHundo.checked = false;
    if (chMega) chMega.checked = false;
    if (chMax) chMax.checked = false;
  }
  
  saveState();
  
  // Card hover shimmer states
  const card = checkbox.closest('.pokemon-card');
  if (card) {
    if (key === 'shiny') {
      if (val) card.classList.add('shiny-active');
      else card.classList.remove('shiny-active');
    }
    if (key === 'hundo') {
      if (val) card.classList.add('hundo-active');
      else card.classList.remove('hundo-active');
    }
    
    const p = window.pokemonDatabase.find(x => x.id === id);
    if (p && p.utility === 'filler') {
      let banner = card.querySelector('.transfer-alert-badge');
      const isOwned = state.pokemonCollection[id].owned;
      if (isOwned && !banner) {
        const newBanner = document.createElement('div');
        newBanner.className = "transfer-alert-badge";
        newBanner.innerHTML = `<i class="fa-solid fa-trash-can"></i> Safe to Transfer`;
        card.insertBefore(newBanner, card.querySelector('.card-checklists'));
      } else if (!isOwned && banner) {
        banner.remove();
      }
    }
  }
  updateStorageProgress();
}

function resetAllFilters() {
  document.getElementById('poke-search-input').value = '';
  document.getElementById('filter-generation').value = 'all';
  document.getElementById('filter-type').value = 'all';
  document.getElementById('filter-release').value = 'all';
  document.getElementById('filter-exclusivity').value = 'all';
  document.getElementById('filter-utility').value = 'all';
  document.getElementById('filter-rank').value = 'all';
  document.getElementById('filter-status').value = 'all';
  renderPokedex();
}

function applyFilters() {
  renderPokedex();
}

// --- DYNAMIC TYPE MATCHUPS MATH ---
const typeWeaknessesMapping = {
  Normal: { weak: ["Fighting"], strong: [] },
  Fire: { weak: ["Water", "Ground", "Rock"], strong: ["Grass", "Ice", "Bug", "Steel"] },
  Water: { weak: ["Electric", "Grass"], strong: ["Fire", "Ground", "Rock"] },
  Electric: { weak: ["Ground"], strong: ["Water", "Flying"] },
  Grass: { weak: ["Fire", "Ice", "Poison", "Flying", "Bug"], strong: ["Water", "Ground", "Rock"] },
  Ice: { weak: ["Fire", "Fighting", "Rock", "Steel"], strong: ["Grass", "Ground", "Flying", "Dragon"] },
  Fighting: { weak: ["Flying", "Psychic", "Fairy"], strong: ["Normal", "Ice", "Rock", "Dark", "Steel"] },
  Poison: { weak: ["Ground", "Psychic"], strong: ["Grass", "Fairy"] },
  Ground: { weak: ["Water", "Ice", "Grass"], strong: ["Fire", "Electric", "Poison", "Rock", "Steel"] },
  Flying: { weak: ["Electric", "Ice", "Rock"], strong: ["Grass", "Fighting", "Bug"] },
  Psychic: { weak: ["Bug", "Ghost", "Dark"], strong: ["Fighting", "Poison"] },
  Bug: { weak: ["Fire", "Flying", "Rock"], strong: ["Grass", "Psychic", "Dark"] },
  Rock: { weak: ["Water", "Grass", "Fighting", "Ground", "Steel"], strong: ["Fire", "Ice", "Flying", "Bug"] },
  Ghost: { weak: ["Ghost", "Dark"], strong: ["Psychic", "Ghost"] },
  Dragon: { weak: ["Ice", "Dragon", "Fairy"], strong: ["Dragon"] },
  Steel: { weak: ["Fire", "Fighting", "Ground"], strong: ["Ice", "Rock", "Fairy"] },
  Fairy: { weak: ["Poison", "Steel"], strong: ["Fighting", "Dragon", "Dark"] },
  Dark: { weak: ["Fighting", "Bug", "Fairy"], strong: ["Psychic", "Ghost"] }
};

function calculateTypeEffectiveness(types) {
  const offensive = new Set();
  const weaknessesMap = {};
  
  // Compile strengths
  types.forEach(t => {
    const list = typeWeaknessesMapping[t]?.strong || [];
    list.forEach(item => offensive.add(item));
  });
  
  // Compile weaknesses with multiplier counters
  // In GO, base is 1.0, weakness is 1.6, resistance is 0.625
  const allTypes = Object.keys(typeWeaknessesMapping);
  
  allTypes.forEach(atkType => {
    let multiplier = 1.0;
    
    types.forEach(defType => {
      const matchups = typeWeaknessesMapping[defType];
      if (matchups) {
        if (matchups.weak.includes(atkType)) multiplier *= 1.6;
        if (matchups.strong.includes(atkType)) multiplier *= 0.625; // acts as resistance
      }
    });
    
    if (multiplier > 1.0) {
      weaknessesMap[atkType] = multiplier;
    }
  });
  
  return {
    strengths: Array.from(offensive),
    weaknesses: Object.keys(weaknessesMap).map(k => {
      const mult = weaknessesMap[k];
      return { type: k, mult: mult > 2.0 ? "2.56x" : "1.6x" };
    })
  };
}

// --- DYNAMIC HUNDO CP FORMULA ---
function calculateHundoCP(baseStats, level) {
  const cpmMap = { 15: 0.51739395, 20: 0.59740001, 25: 0.667934, 30: 0.7317, 35: 0.761562 };
  const cpm = cpmMap[level] || 0.84029999; 
  const attack = baseStats.attack + 15;
  const defense = Math.sqrt(baseStats.defense + 15);
  const stamina = Math.sqrt(baseStats.stamina + 15);
  
  return Math.max(10, Math.floor( (attack * defense * stamina * Math.pow(cpm, 2)) / 10 ));
}

// --- DETAIL MODAL RENDERING ---

const pokemonFunFacts = {
  1: "Bulbasaur is the very first Pokémon in the National Pokédex, and was the first Pokémon designed by Ken Sugimori.",
  3: "Venusaur's flower blooms when absorbing solar energy. In Pokémon GO, Frenzy Plant is its most optimal legacy Charged Attack.",
  4: "Charmander's tail flame indicates its life force and emotions; if it goes out, the Pokémon is said to perish.",
  6: "Charizard is the only Pokémon with two distinct Mega Evolutions in the game (X and Y), excluding Mewtwo (which isn't mega-eligible in GO yet).",
  7: "Squirtle's shell is not just for protection; its rounded shape and grooves minimize water resistance, allowing it to swim at high speeds.",
  9: "Blastoise can fire water bullets from its cannons that can pierce steel. Hydro Cannon is its signature Community Day move.",
  130: "Gyarados gains the Dark type when Mega Evolving, which removes its double weakness to Electric-type moves.",
  142: "Aerodactyl is a fossil Pokémon resurrected from Old Amber. Mega Aerodactyl is a top-tier Rock-type PvE raid attacker in Pokémon GO.",
  149: "Dragonite is capable of flying around the globe in just 16 hours, traveling at speeds exceeding Mach 2.",
  150: "Mewtwo was created by genetic manipulation. In Pokémon GO, Psystrike Mewtwo is one of the highest neutral DPS attackers in the entire game.",
  382: "Kyogre is said to be the personification of the sea itself. Its Primal Reversion form boosts Water, Electric, and Bug-type attacks in Raids.",
  383: "Groudon is the personification of the land. In its Primal form, it gains the Fire typing, making it a double threat in Ground and Fire PvE.",
  384: "Rayquaza is the master of the sky and the atmospheric trio. Mega Rayquaza is widely considered the strongest overall PvE Pokémon in GO.",
  445: "Garchomp can fly at the speed of sound like a jet fighter. Mega Garchomp boasts one of the highest Attack stats of all Ground types.",
  483: "Dialga (Origin Forme) can warp time. Roar of Time is its adventure effect, allowing you to pause incense, lucky eggs, and star pieces!",
  484: "Palkia (Origin Forme) can warp space. Spacial Rend is its adventure effect, allowing you to increase your wild encounter spawn radius!",
  800: "Necrozma can fuse with Solgaleo or Lunala. Dusk Mane/Dawn Wings are currently the top-ranking Psychic, Steel, and Ghost attackers in the game.",
  25: "Pikachu is the mascot of the Pokémon franchise. In Pokémon GO, there are dozens of different costume variants of Pikachu.",
  133: "Eevee has the most branching evolutions (8 total) of any Pokémon, requiring different buddy tasks, stones, or names to trigger.",
  129: "Magikarp is famous for being incredibly weak, but it takes 400 candies to evolve it into the mighty Gyarados in Pokémon GO."
};

const generalTriviaFacts = [
  "You can fast-catch Pokémon by dragging the berry or ball tray while throwing the Poké Ball to skip the catch animation.",
  "Spinning the Poké Ball before throwing adds a Curveball bonus, which increases your catch rate multiplier by 1.7x.",
  "Lucky Pokémon require 50% less Stardust to power up, and are guaranteed to have at least 12/12/12 IV stats.",
  "Feeding a berry to a Pokémon in a gym has a very small chance (about 1 in 80) of yielding a Candy for that Pokémon.",
  "You can hold up to 20 Gifts in your inventory at a time and open up to 30 Gifts daily under normal game rules.",
  "Trading a Pokémon caught further away yields more Candies, and trades over 100km apart guarantee a Candy XL.",
  "Completing your Daily PokéStop Spin and Daily Catch streaks for 7 consecutive days yields massive XP and Stardust bonuses.",
  "The appraisal system represents individual values (IVs) from 0 to 15 for Attack, Defense, and Stamina.",
  "Mega Evolving a Pokémon of a matching type boosts the catch XP and increases the chance of obtaining Candy XL.",
  "Weather boost increases wild Pokémon levels by 5 (up to level 35) and increases their base moves' damage by 20%.",
  "Dynamax Pokémon can be caught from Power Spots after defeating them in Max Battles using Max Particles."
];

function showPokemonDetail(id) {
  const p = window.pokemonDatabase.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('modal-poke-id').textContent = `#${String(p.id).padStart(3, '0')}`;
  
  const rarityBadge = document.getElementById('modal-poke-rarity');
  rarityBadge.className = `pokemon-rarity-badge rarity-${p.rank.replace('+', '-plus')}`;
  rarityBadge.textContent = `Rank ${p.rank}`;
  
  document.getElementById('modal-poke-name').textContent = p.name;
  document.getElementById('modal-poke-category').textContent = p.category;
  
  const typesCont = document.getElementById('modal-poke-types');
  typesCont.innerHTML = p.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join(' ');

  // Compute and display PvP rankings in Great, Ultra, Master leagues
  const rankGreat = getBestPvPRank(p, 'great');
  const rankUltra = getBestPvPRank(p, 'ultra');
  const rankMaster = getBestPvPRank(p, 'master');

  document.getElementById('modal-pvp-rank-great').innerHTML = formatPvPRankText(rankGreat);
  document.getElementById('modal-pvp-rank-ultra').innerHTML = formatPvPRankText(rankUltra);
  document.getElementById('modal-pvp-rank-master').innerHTML = formatPvPRankText(rankMaster);
  
  // Render Pokedex Description
  document.getElementById('modal-desc-section').textContent = getPokedexDescription(p);

  // Adventure Effects Section
  const adventureSection = document.getElementById('modal-adventure-section');
  if (p.adventureEffect) {
    adventureSection.style.display = 'block';
    document.getElementById('modal-adventure-title').textContent = p.adventureEffect.name;
    document.getElementById('modal-adventure-details').textContent = p.adventureEffect.desc;
  } else {
    adventureSection.style.display = 'none';
  }

  // Strengths and weaknesses coverage calculations
  const coverage = calculateTypeEffectiveness(p.types);
  const strengthDiv = document.getElementById('modal-strengths');
  const weaknessDiv = document.getElementById('modal-weaknesses');
  
  strengthDiv.innerHTML = coverage.strengths.length > 0
    ? coverage.strengths.map(t => `<span class="coverage-badge-strong">${t}</span>`).join(' ')
    : `<span style="font-size:11px; color:var(--text-dim);">None</span>`;
    
  weaknessDiv.innerHTML = coverage.weaknesses.length > 0
    ? coverage.weaknesses.map(w => `<span class="coverage-badge-weak">${w.type} (${w.mult})</span>`).join(' ')
    : `<span style="font-size:11px; color:var(--text-dim);">None</span>`;

  document.getElementById('modal-stat-cp').textContent = p.maxCP;
  document.getElementById('modal-stat-utility').textContent = p.utility === 'meta' ? 'Meta Rank' : 'Standard';
  document.getElementById('modal-stat-exclusivity').textContent = p.exclusivity === 'none' ? 'Common' : p.exclusivity.toUpperCase();
  
  document.getElementById('modal-base-att').textContent = p.baseStats.attack;
  document.getElementById('modal-base-def').textContent = p.baseStats.defense;
  document.getElementById('modal-base-sta').textContent = p.baseStats.stamina;
  
  // Hundo CP Chart
  const hundoTable = document.getElementById('modal-hundo-cp-table-body');
  hundoTable.innerHTML = `
    <tr><td>Research Task</td><td>Level 15</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(p.baseStats, 15).toLocaleString()} CP</td></tr>
    <tr><td>Eggs / Raids</td><td>Level 20</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(p.baseStats, 20).toLocaleString()} CP</td></tr>
    <tr><td>Weather Boosted Raids</td><td>Level 25</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(p.baseStats, 25).toLocaleString()} CP</td></tr>
    <tr><td>Wild Encounters</td><td>Level 30</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(p.baseStats, 30).toLocaleString()} CP</td></tr>
    <tr><td>Weather Boosted Wild</td><td>Level 35</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(p.baseStats, 35).toLocaleString()} CP</td></tr>
  `;

  // Golden move text if exclusive
  const movesContainer = document.getElementById('modal-moves-container');
  movesContainer.innerHTML = `
    <div class="move-item">
      <span>Best Fast Move</span>
      <span class="move-name" style="${p.fastMoves[0].includes('(Elite TM)') ? 'color: var(--color-accent); font-weight:700;' : ''}">${p.fastMoves[0].replace(' (Elite TM)', '')}</span>
    </div>
    <div class="move-item">
      <span>Best Charged Move</span>
      <span class="move-name" style="${p.chargedMoves[0].includes('(Elite TM)') ? 'color: var(--color-accent); font-weight:700;' : ''}">${p.chargedMoves[0].replace(' (Elite TM)', '')}</span>
    </div>
    ${p.chargedMoves[1] ? `
      <div class="move-item">
        <span>Second Charged Move</span>
        <span class="move-name" style="${p.chargedMoves[1].includes('(Elite TM)') ? 'color: var(--color-accent); font-weight:700;' : ''}">${p.chargedMoves[1].replace(' (Elite TM)', '')}</span>
      </div>
    ` : ''}
  `;

  // Mega details - structured bullet list
  const megaSection = document.getElementById('modal-mega-section');
  if (p.mega) {
    megaSection.style.display = 'block';
    const megaDetails = document.getElementById('modal-mega-details');
    const megaName = document.getElementById('modal-mega-name');
    megaName.textContent = p.mega.name;
    
    if (p.mega.variants) {
      let listHTML = `
        <ul style="list-style: none; padding: 0; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
          <li><strong>Energy Cost:</strong> ${p.mega.energyCost} Mega Energy</li>
          <li><strong>Variants:</strong>
            <ul style="list-style: none; padding-left: 12px; margin-top: 2px; display: flex; flex-direction: column; gap: 2px;">
              ${p.mega.variants.map(v => `
                <li>• <strong style="color: var(--text-main);">${v.name}</strong>: Max CP <span style="color: var(--color-secondary); font-weight: 700;">${v.maxCP}</span>, Type: ${v.types.map(t => `<span class="type-badge type-${t}" style="font-size: 7px; padding: 0px 4px;">${t}</span>`).join(' ')}</li>
              `).join('')}
            </ul>
          </li>
        </ul>
      `;
      megaDetails.innerHTML = listHTML;
    } else {
      let listHTML = `
        <ul style="list-style: none; padding: 0; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
          <li><strong>Energy Cost:</strong> ${p.mega.energyCost} Mega Energy</li>
          <li><strong>Max CP:</strong> <span style="color: var(--color-secondary); font-weight: 700;">${p.mega.maxCP}</span></li>
          <li><strong>Types:</strong> ${p.mega.types.map(t => `<span class="type-badge type-${t}" style="font-size: 7px; padding: 0px 4px;">${t}</span>`).join(' ')}</li>
        </ul>
      `;
      megaDetails.innerHTML = listHTML;
    }
  } else {
    megaSection.style.display = 'none';
  }
  
  // Max details
  const maxSection = document.getElementById('modal-max-section');
  if (p.max && p.max.released) {
    maxSection.style.display = 'block';
  } else {
    maxSection.style.display = 'none';
  }
  
  // Fun Fact Section rendering
  const funFactSection = document.getElementById('modal-fun-fact-section');
  const funFactText = document.getElementById('modal-fun-fact-text');
  if (funFactSection && funFactText) {
    if (pokemonFunFacts[id]) {
      funFactSection.style.display = 'block';
      funFactText.innerHTML = pokemonFunFacts[id];
    } else {
      funFactSection.style.display = 'none';
    }
  }
  
  document.getElementById('modal-opt-tip').textContent = p.tips;
  document.getElementById('detail-modal').style.display = 'flex';
}

function closeModal(event) {
  if (!event || event.target.id === 'detail-modal' || event.target.className === 'close-modal-btn') {
    document.getElementById('detail-modal').style.display = 'none';
  }
}

// --- TAB 2: LEVEL & XP TRACKER ---

function renderLevelTracker() {
  const container = document.getElementById('level-tasks-container');
  if (!container) return;
  
  const currentLvl = state.trainerLevel;
  document.getElementById('level-display-num').textContent = currentLvl;
  
  const nextLvl = Math.min(80, currentLvl + 1);
  const currentMinXP = cumulativeXPArray[currentLvl];
  const nextMinXP = cumulativeXPArray[nextLvl];
  
  let percent = 0;
  let xpRange = nextMinXP - currentMinXP;
  
  if (currentLvl === 80) {
    percent = 100;
    document.getElementById('level-xp-text').textContent = `Max Level 80 reached! Total XP: ${state.currentXP.toLocaleString()}`;
  } else {
    const relativeXP = Math.max(0, state.currentXP - currentMinXP);
    percent = Math.min(100, Math.round((relativeXP / xpRange) * 100));
    document.getElementById('level-xp-text').textContent = `${state.currentXP.toLocaleString()} / ${nextMinXP.toLocaleString()} XP (${percent}%)`;
  }
  
  const circle = document.getElementById('level-progress-ring');
  if (circle) {
    const offset = 439.8 - (percent / 100) * 439.8;
    circle.style.strokeDashoffset = offset;
  }
  
  container.innerHTML = '';
  const taskLevel = currentLvl + 1;
  const tasks = levelTasksDatabase[taskLevel];
  const tasksTitle = document.getElementById('tasks-panel-title');
  
  if (currentLvl === 80) {
    tasksTitle.textContent = "Trainer Rank Status";
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--color-success); font-weight:600;"><i class="fa-solid fa-trophy" style="font-size:24px; display:block; margin-bottom:8px;"></i>Maximum Trainer Level reached! No further tasks required.</div>`;
    return;
  }
  
  tasksTitle.textContent = `Research Tasks to reach Level ${taskLevel}`;
  
  if (!tasks) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No Level Up tasks required in this level range. Gain XP to advance.</div>`;
    return;
  }
  
  if (!state.levelTasks[taskLevel]) {
    state.levelTasks[taskLevel] = new Array(tasks.length).fill(false);
  }
  
  tasks.forEach((task, idx) => {
    const checked = state.levelTasks[taskLevel][idx] || false;
    const taskCard = document.createElement('div');
    taskCard.className = `task-item ${checked ? 'completed' : ''}`;
    taskCard.innerHTML = `
      <div class="task-checkbox-wrapper">
        <input type="checkbox" id="task-chk-${taskLevel}-${idx}" class="task-checkbox" ${checked ? 'checked' : ''} onchange="toggleLevelTask(${taskLevel}, ${idx})">
      </div>
      <div class="task-details">
        <p class="task-desc">${task.desc}</p>
        <p class="task-tips">Tip: ${task.tip}</p>
      </div>
    `;
    container.appendChild(taskCard);
  });
  
  // Render Level Up Rewards Roadmap
  const roadmapContainer = document.getElementById('level-rewards-roadmap');
  if (roadmapContainer) {
    roadmapContainer.innerHTML = '';
    for (let lvl = 71; lvl <= 80; lvl++) {
      const card = document.createElement('div');
      card.className = "reward-level-card";
      
      const rewards = levelRewardsDatabase[lvl] || [];
      const rewardsHTML = rewards.map(r => {
        if (r.isCosmetic) {
          return `
            <div class="reward-item-pill cosmetic-pill" title="${r.name}">
              <span class="reward-emoji">${r.sprite}</span>
              <span class="reward-cosmetic-label">${r.name}</span>
            </div>
          `;
        }
        return `
          <div class="reward-item-pill" title="${r.name}">
            <img src="${r.sprite}" alt="${r.name}" onerror="this.style.display='none';">
            <span>x${r.count}</span>
          </div>
        `;
      }).join('');
      
      card.innerHTML = `
        <div class="reward-level-badge">L${lvl}</div>
        <div class="reward-items-container">${rewardsHTML}</div>
      `;
      roadmapContainer.appendChild(card);
    }
  }
}

function onLevelChange() {
  const selector = document.getElementById('level-select');
  state.trainerLevel = parseInt(selector.value);
  
  const minXP = cumulativeXPArray[state.trainerLevel];
  if (state.currentXP < minXP) {
    state.currentXP = minXP;
    document.getElementById('input-current-xp').value = state.currentXP;
  }
  
  saveState();
  renderLevelTracker();
  calculateXPTimeframe();
  updateStorageProgress();
}

function toggleLevelTask(lvl, idx) {
  const check = document.getElementById(`task-chk-${lvl}-${idx}`);
  const val = check.checked;
  
  if (!state.levelTasks[lvl]) {
    state.levelTasks[lvl] = [];
  }
  state.levelTasks[lvl][idx] = val;
  
  if (val) {
    // Auto complete all tasks for previous levels (71 to lvl - 1)
    for (let prevLvl = 71; prevLvl < lvl; prevLvl++) {
      const prevTasks = levelTasksDatabase[prevLvl];
      if (prevTasks) {
        if (!state.levelTasks[prevLvl]) {
          state.levelTasks[prevLvl] = [];
        }
        for (let tIdx = 0; tIdx < prevTasks.length; tIdx++) {
          state.levelTasks[prevLvl][tIdx] = true;
        }
      }
    }
  }
  
  saveState();
  renderLevelTracker();
}

function calculateXPTimeframe() {
  const currentXP = parseInt(document.getElementById('input-current-xp').value) || 0;
  const targetLvl = parseInt(document.getElementById('select-target-level').value) || 80;
  const dailyGain = parseInt(document.getElementById('input-daily-xp').value) || 100000;
  
  state.currentXP = currentXP;
  state.targetLevel = targetLvl;
  state.dailyXPGain = dailyGain;
  saveState();
  
  const targetXP = cumulativeXPArray[targetLvl];
  const diffXP = targetXP - currentXP;
  
  const resultVal = document.getElementById('calc-result-days');
  const resultDesc = document.getElementById('calc-result-desc');
  
  if (diffXP <= 0) {
    resultVal.textContent = "Goal Reached!";
    resultVal.style.color = "var(--color-success)";
    resultDesc.textContent = "You already have enough XP for this target level!";
    return;
  }
  
  resultVal.style.color = "var(--color-primary)";
  const days = Math.ceil(diffXP / dailyGain);
  
  if (days === Infinity || isNaN(days)) {
    resultVal.textContent = "-- Days";
    resultDesc.textContent = "Please enter valid numbers to calculate.";
    return;
  }
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const dateStr = targetDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  
  resultVal.textContent = `${days.toLocaleString()} Days`;
  resultDesc.innerHTML = `You need <strong>${diffXP.toLocaleString()} XP</strong> more.<br>Estimated completion date: <strong>${dateStr}</strong>`;
  
  renderLevelTracker();
}

// --- TAB 3: MEDAL TRACKER ---

function renderMedalTracker(filterCategory = 'all') {
  const grid = document.getElementById('medals-container');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  let hasHiddenMedals = false;
  
  medalsDatabase.forEach(m => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return;
    
    const medalState = state.medals[m.id] || { tier: 'none', progress: 0, hidden: false };
    
    if (medalState.hidden) {
      hasHiddenMedals = true;
      return; // Skip rendering
    }
    
    const tiers = { none: 0, bronze: m.bronze, silver: m.silver, gold: m.gold, platinum: m.platinum };
    
    let currentTier = medalState.tier;
    let nextTier = 'bronze';
    if (currentTier === 'bronze') nextTier = 'silver';
    else if (currentTier === 'silver') nextTier = 'gold';
    else if (currentTier === 'gold') nextTier = 'platinum';
    else if (currentTier === 'platinum') nextTier = 'max';
    
    let nextValue = tiers[nextTier] || m.platinum;
    let prevValue = tiers[currentTier] || 0;
    
    let progressVal = medalState.progress;
    let percent = 0;
    if (currentTier === 'platinum') {
      percent = 100;
    } else {
      let range = nextValue - prevValue;
      let relProgress = Math.max(0, progressVal - prevValue);
      percent = Math.min(100, Math.round((relProgress / range) * 100));
    }
    
    const card = document.createElement('div');
    card.className = `medal-card tier-${currentTier}`;
    
    let emoji = "⚪";
    if (currentTier === 'bronze') emoji = "🟤";
    else if (currentTier === 'silver') emoji = "⚪";
    else if (currentTier === 'gold') emoji = "🟡";
    else if (currentTier === 'platinum') emoji = "💿";
    
    card.innerHTML = `
      <button class="medal-hide-btn" onclick="hideMedal('${m.id}')" title="Hide this medal from tracker">
        <i class="fa-solid fa-eye-slash"></i>
      </button>
      <div class="medal-top-row">
        <div class="medal-visual-container">${emoji}</div>
        <div class="medal-title-group">
          <h4>${m.name}</h4>
          <span class="medal-category-tag">${m.category}</span>
        </div>
      </div>
      <p style="font-size:11px; color:var(--text-muted); line-height:1.4; padding-right:16px;">${m.desc}</p>
      
      <div class="medal-tier-selector-group">
        <button class="medal-tier-btn bronze ${currentTier === 'bronze' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'bronze')">Bronze</button>
        <button class="medal-tier-btn silver ${currentTier === 'silver' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'silver')">Silver</button>
        <button class="medal-tier-btn gold ${currentTier === 'gold' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'gold')">Gold</button>
        <button class="medal-tier-btn platinum ${currentTier === 'platinum' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'platinum')">Platinum</button>
      </div>

      <div class="medal-progress-box">
        <div class="medal-progress-labels">
          <span>Progress</span>
          <span>${progressVal.toLocaleString()} / ${nextValue.toLocaleString()} (${percent}%)</span>
        </div>
        <div class="medal-progress-bar-container">
          <div class="medal-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="medal-input-row">
          <span>Set Value:</span>
          <input type="number" class="medal-progress-input" value="${progressVal}" min="0" oninput="updateMedalValue('${m.id}', this.value)">
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  // Show Hidden Medals alert bar if any exist
  const hiddenBar = document.getElementById('hidden-medals-bar');
  if (hiddenBar) {
    hiddenBar.style.display = hasHiddenMedals ? 'flex' : 'none';
  }
}

function hideMedal(medalId) {
  if (!state.medals[medalId]) state.medals[medalId] = { tier: 'none', progress: 0, hidden: false };
  state.medals[medalId].hidden = true;
  saveState();
  renderMedalTracker(getCurrentMedalFilter());
}

function unhideAllMedals() {
  Object.keys(state.medals).forEach(mId => {
    if (state.medals[mId]) {
      state.medals[mId].hidden = false;
    }
  });
  saveState();
  renderMedalTracker(getCurrentMedalFilter());
}

function setMedalTier(medalId, tier) {
  if (!state.medals[medalId]) state.medals[medalId] = { tier: 'none', progress: 0, hidden: false };
  
  if (state.medals[medalId].tier === tier) {
    state.medals[medalId].tier = 'none';
  } else {
    state.medals[medalId].tier = tier;
    const medalData = medalsDatabase.find(x => x.id === medalId);
    let minVal = 0;
    if (tier === 'bronze') minVal = medalData.bronze;
    else if (tier === 'silver') minVal = medalData.silver;
    else if (tier === 'gold') minVal = medalData.gold;
    else if (tier === 'platinum') minVal = medalData.platinum;
    
    if (state.medals[medalId].progress < minVal) {
      state.medals[medalId].progress = minVal;
    }
  }
  
  saveState();
  renderMedalTracker(getCurrentMedalFilter());
}

function updateMedalValue(medalId, val) {
  const num = parseInt(val) || 0;
  if (!state.medals[medalId]) state.medals[medalId] = { tier: 'none', progress: 0, hidden: false };
  
  state.medals[medalId].progress = num;
  
  const m = medalsDatabase.find(x => x.id === medalId);
  let computed = 'none';
  if (num >= m.platinum) computed = 'platinum';
  else if (num >= m.gold) computed = 'gold';
  else if (num >= m.silver) computed = 'silver';
  else if (num >= m.bronze) computed = 'bronze';
  
  state.medals[medalId].tier = computed;
  saveState();
  
  clearTimeout(window.medalTimer);
  window.medalTimer = setTimeout(() => {
    renderMedalTracker(getCurrentMedalFilter());
  }, 800);
}

function getCurrentMedalFilter() {
  const act = document.querySelector('[id*="btn-medal-filter"].active');
  if (act) {
    if (act.id.includes('region')) return 'region';
    if (act.id.includes('type')) return 'type';
    if (act.id.includes('gameplay')) return 'gameplay';
  }
  return 'all';
}

function filterMedals(category) {
  document.querySelectorAll('[id*="btn-medal-filter"]').forEach(el => {
    el.classList.remove('active');
    el.style.borderColor = 'var(--border-subtle)';
    el.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
  });
  
  const btn = document.getElementById(`btn-medal-filter-${category}`);
  if (btn) {
    btn.classList.add('active');
    btn.style.borderColor = 'var(--color-primary)';
    btn.style.backgroundColor = 'rgba(191, 85, 236, 0.08)';
  }
  renderMedalTracker(category);
}

// --- TAB 4: FRIENDS & LUCKY FRIENDS ---

function renderFriendsTracker() {
  const container = document.getElementById('friends-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (state.friends.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No friends added.</div>`;
    return;
  }
  
  state.friends.forEach(f => {
    const card = document.createElement('div');
    card.className = `friend-card ${f.lucky ? 'lucky-friend' : ''}`;
    
    const levelsMap = { good: "Good Friend", great: "Great Friend", ultra: "Ultra Friend", best: "Best Friend" };
    
    card.innerHTML = `
      <div class="friend-top">
        <div>
          <h4 class="friend-name">${f.name}</h4>
          <span class="friend-code" onclick="copyTrainerCode('${f.code}')" title="Click to copy">${f.code || 'No Code'}</span>
        </div>
        <button class="delete-friend-btn" onclick="deleteFriend('${f.id}')" title="Delete">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span class="friend-level-tag lvl-${f.level}">${levelsMap[f.level]}</span>
          ${f.vivillon && f.vivillon !== 'none' ? `<span class="vivillon-badge"><i class="fa-solid fa-butterfly"></i> ${f.vivillon}</span>` : ''}
        </div>
        ${f.level === 'best' ? `
          <label class="checkbox-custom-label" style="font-size:11px; font-weight:700; color:var(--color-accent)">
            <input type="checkbox" ${f.lucky ? 'checked' : ''} onchange="toggleLuckyFriend('${f.id}')"> Lucky Friend
          </label>
        ` : ''}
      </div>

      <div class="friend-checklist-row">
        <label class="friend-check-label">
          <input type="checkbox" ${f.giftSent ? 'checked' : ''} onchange="toggleFriendCheck('${f.id}', 'giftSent')">
          <span class="friend-check-btn"><i class="fa-solid fa-check"></i></span>
          <span>Gift Sent</span>
        </label>
        <label class="friend-check-label">
          <input type="checkbox" ${f.giftOpened ? 'checked' : ''} onchange="toggleFriendCheck('${f.id}', 'giftOpened')">
          <span class="friend-check-btn"><i class="fa-solid fa-check"></i></span>
          <span>Opened</span>
        </label>
        <label class="friend-check-label">
          <input type="checkbox" ${f.battled ? 'checked' : ''} onchange="toggleFriendCheck('${f.id}', 'battled')">
          <span class="friend-check-btn"><i class="fa-solid fa-check"></i></span>
          <span>Battled</span>
        </label>
      </div>

      ${f.level !== 'best' ? `
        <div class="friend-countdown">
          <span>Days to next level: <strong style="color:var(--color-primary); font-size:13px;">${f.daysLeft}</strong></span>
          <div class="countdown-actions">
            <button class="countdown-btn" onclick="adjustFriendDays('${f.id}', -1)">-</button>
            <button class="countdown-btn" onclick="adjustFriendDays('${f.id}', 1)">+</button>
          </div>
        </div>
      ` : `<div style="font-size:11px; text-align:center; color:var(--color-accent); font-weight:600;"><i class="fa-solid fa-star"></i> Max friendship level!</div>`}
    `;
    container.appendChild(card);
  });
}

function addNewFriend(event) {
  event.preventDefault();
  const name = document.getElementById('friend-name-input').value.trim();
  const code = document.getElementById('friend-code-input').value.trim();
  const level = document.getElementById('friend-level-select').value;
  const daysLeft = parseInt(document.getElementById('friend-days-input').value) || 0;
  const vivillon = document.getElementById('friend-vivillon-select').value;
  
  if (!name) return;
  
  state.friends.push({
    id: 'f_' + Date.now(), name, code, level, daysLeft: level === 'best' ? 0 : daysLeft,
    giftSent: false, giftOpened: false, battled: false, lucky: false, vivillon
  });
  
  saveState();
  renderFriendsTracker();
  
  document.getElementById('friend-name-input').value = '';
  document.getElementById('friend-code-input').value = '';
  document.getElementById('friend-days-input').value = 7;
  document.getElementById('friend-vivillon-select').value = 'none';
}

function deleteFriend(id) {
  state.friends = state.friends.filter(f => f.id !== id);
  saveState();
  renderFriendsTracker();
}

function toggleFriendCheck(id, key) {
  const f = state.friends.find(x => x.id === id);
  if (f) { f[key] = !f[key]; saveState(); }
}

function toggleLuckyFriend(id) {
  const f = state.friends.find(x => x.id === id);
  if (f) { f.lucky = !f.lucky; saveState(); renderFriendsTracker(); }
}

function adjustFriendDays(id, delta) {
  const f = state.friends.find(x => x.id === id);
  if (f && f.level !== 'best') {
    f.daysLeft = Math.max(0, f.daysLeft + delta);
    if (f.daysLeft === 0) {
      if (f.level === 'good') { f.level = 'great'; f.daysLeft = 23; }
      else if (f.level === 'great') { f.level = 'ultra'; f.daysLeft = 60; }
      else if (f.level === 'ultra') { f.level = 'best'; f.daysLeft = 0; }
      alert(`Congratulations! Friendship with ${f.name} upgraded!`);
    }
    saveState();
    renderFriendsTracker();
  }
}

function copyTrainerCode(code) {
  if (!code) return;
  navigator.clipboard.writeText(code.replace(/\s+/g, '')).then(() => {
    alert("Trainer Code copied!");
  });
}

// --- TAB 5: STORAGE MANAGER & ITEMS ---

function updateStorageProgress() {
  const cap = parseInt(document.getElementById('input-storage-cap').value) || 300;
  const used = parseInt(document.getElementById('input-storage-used').value) || 0;
  
  state.storageCap = cap;
  state.storageUsed = used;
  saveState();
  
  const percent = Math.min(100, Math.round((used / cap) * 100));
  const bar = document.getElementById('storage-bar-fill');
  const label = document.getElementById('storage-percent-lbl');
  const desc = document.getElementById('storage-cap-text');
  
  if (bar && label && desc) {
    bar.style.width = `${percent}%`;
    label.textContent = `${percent}%`;
    desc.textContent = `${used.toLocaleString()} / ${cap.toLocaleString()} spaces used`;
    
    if (percent >= 85) {
      bar.classList.add('warning');
      label.style.color = 'var(--color-danger)';
    } else {
      bar.classList.remove('warning');
      label.style.color = 'var(--text-main)';
    }
  }
  generateStorageRecommendations();
}

function renderItemInventory() {
  const grid = document.getElementById('item-inventory-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const itemGroups = [
    { id: "group-balls", name: "Poké Balls", icon: "fa-circle-dot", cats: ["balls"] },
    { id: "group-healing", name: "Potions & Revives", icon: "fa-heart-pulse", cats: ["healing"] },
    { id: "group-berries", name: "Berries", icon: "fa-lemon", cats: ["berries"] },
    { id: "group-tms-stones", name: "TMs & Evolution Items", icon: "fa-gem", cats: ["tms", "stones"] },
    { id: "group-passes-boosts", name: "Passes & Boosts", icon: "fa-ticket", cats: ["passes", "boosts", "other"] }
  ];
  
  itemGroups.forEach(g => {
    const section = document.createElement('div');
    section.className = "item-group-section";
    section.innerHTML = `
      <h5 class="item-group-title"><i class="fa-solid ${g.icon}"></i> ${g.name}</h5>
      <div class="item-storage-grid"></div>
    `;
    const subGrid = section.querySelector('.item-storage-grid');
    
    Object.keys(itemRegistry).forEach(key => {
      const item = itemRegistry[key];
      if (g.cats.includes(item.cat)) {
        const qty = state.items[key] || 0;
        const div = document.createElement('div');
        div.className = "item-input-card";
        const spriteUrl = itemSprites[key] || "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png";
        div.innerHTML = `
          <div class="item-card-info">
            <img class="item-image-sprite" src="${spriteUrl}" alt="${item.name}" onerror="this.src='https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png';">
            <span class="item-label-text">${item.name}</span>
          </div>
          <input type="number" class="item-qty-input" value="${qty}" min="0" oninput="updateItemQuantity('${key}', this.value)">
        `;
        subGrid.appendChild(div);
      }
    });
    
    if (subGrid.children.length > 0) {
      grid.appendChild(section);
    }
  });
}

function updateItemQuantity(key, val) {
  const num = parseInt(val) || 0;
  state.items[key] = num;
  saveState();
  updateItemStorageProgress();
}

// Item Progress calculations
function updateItemStorageProgress() {
  const cap = parseInt(document.getElementById('input-item-cap').value) || 500;
  state.itemCap = cap;
  
  let totalItems = 0;
  Object.keys(state.items).forEach(key => {
    totalItems += state.items[key] || 0;
  });
  
  saveState();
  
  const percent = Math.min(100, Math.round((totalItems / cap) * 100));
  const bar = document.getElementById('item-bar-fill');
  const label = document.getElementById('item-percent-lbl');
  const desc = document.getElementById('item-cap-text');
  
  if (bar && label && desc) {
    bar.style.width = `${percent}%`;
    label.textContent = `${percent}%`;
    desc.textContent = `${totalItems.toLocaleString()} / ${cap.toLocaleString()} items used`;
    
    if (percent >= 85) {
      bar.classList.add('warning');
      label.style.color = 'var(--color-danger)';
    } else {
      bar.classList.remove('warning');
      label.style.color = 'var(--text-main)';
    }
  }
  generateStorageRecommendations();
}

function generateStorageRecommendations() {
  const container = document.getElementById('storage-recommendations-list');
  if (!container) return;
  
  container.innerHTML = '';
  let recommendations = [];
  
  const pokemonPercent = (state.storageUsed / state.storageCap) * 100;
  if (pokemonPercent >= 85) {
    recommendations.push({
      icon: "🚨", title: "Pokémon storage critically full!",
      desc: `Your storage is at ${Math.round(pokemonPercent)}% capacity. Buy storage extensions or clean out duplicate standard species.`
    });
  }

  let totalItems = 0;
  Object.keys(state.items).forEach(k => totalItems += state.items[k] || 0);
  const itemPercent = (totalItems / state.itemCap) * 100;
  if (itemPercent >= 85) {
    recommendations.push({
      icon: "🎒", title: "Item Bag critically full!",
      desc: `Your item storage is at ${Math.round(itemPercent)}% capacity. Discard regular potions/revives, use rare candies, or feed berries to gym defenders.`
    });
  }

  Object.keys(itemRegistry).forEach(key => {
    const item = itemRegistry[key];
    const qty = state.items[key] || 0;
    if (item.threshold !== undefined && qty > item.threshold && item.discardTip) {
      recommendations.push({
        icon: "🗑️", title: `Surplus ${item.name} stock (${qty} units)`,
        desc: `${item.discardTip}`
      });
    }
  });

  let duplicates = [];
  window.pokemonDatabase.forEach(p => {
    const uS = state.pokemonCollection[p.id] || {};
    if (p.utility === 'filler' && uS.owned) {
      let subchecks = 0;
      if (uS.shiny) subchecks++;
      if (uS.shadow) subchecks++;
      if (uS.hundo) subchecks++;
      if (subchecks > 0) duplicates.push(p.name);
    }
  });
  if (duplicates.length > 0) {
    const list = duplicates.slice(0, 3).join(', ') + (duplicates.length > 3 ? ` and ${duplicates.length - 3} others` : '');
    recommendations.push({
      icon: "⚠️", title: "Duplicate Standard Species Checked",
      desc: `You own multiple variants of standard species: <strong>${list}</strong>. Keep only the highest value version and delete others.`
    });
  }

  recommendations.forEach(r => {
    const card = document.createElement('div');
    card.className = "tip-card";
    card.innerHTML = `
      <div class="tip-card-icon">${r.icon}</div>
      <div class="tip-card-details">
        <h5>${r.title}</h5>
        <p>${r.desc}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- TAB 6: SEARCH STRING MAKER ---

function generateSearchString() {
  const parts = [];
  
  // IV Stars
  const ivs = [];
  for (let i = 0; i <= 4; i++) {
    if (document.getElementById(`ss-iv-${i}`).checked) ivs.push(`${i}*`);
  }
  if (ivs.length > 0) parts.push(ivs.join(','));
  
  // Age
  const age = document.getElementById('ss-age-select').value;
  if (age !== 'all') {
    if (age === 'age0') parts.push('age0');
    else if (age === 'age1') parts.push('age0-1');
    else if (age === 'age7') parts.push('age0-7');
    else if (age === 'age30') parts.push('age0-30');
  }

  // Distance
  const dist = [];
  if (document.getElementById('ss-dist-0').checked) dist.push('distance-9');
  if (document.getElementById('ss-dist-10').checked) dist.push('distance10-99');
  if (document.getElementById('ss-dist-100').checked) dist.push('distance100-');
  if (dist.length > 0) parts.push(dist.join(','));

  // Buddies
  const buddies = [];
  for (let b = 0; b <= 5; b++) {
    if (document.getElementById(`ss-buddy-${b}`).checked) buddies.push(`buddy${b}`);
  }
  if (buddies.length > 0) parts.push(buddies.join(','));
  
  // Rarity tags
  if (document.getElementById('ss-exc-legendary').checked) parts.push('legendary');
  if (document.getElementById('ss-exc-mythical').checked) parts.push('mythical');
  if (document.getElementById('ss-exc-ultra').checked) parts.push('ultrabeast');
  if (document.getElementById('ss-exc-baby').checked) parts.push('baby');
  if (document.getElementById('ss-exc-eggonly').checked) parts.push('eggonly');
  if (document.getElementById('ss-exc-mega').checked) parts.push('mega');
  
  // Special states
  if (document.getElementById('ss-state-shiny').checked) parts.push('shiny');
  if (document.getElementById('ss-state-shadow').checked) parts.push('shadow');
  if (document.getElementById('ss-state-purified').checked) parts.push('purified');
  if (document.getElementById('ss-state-lucky').checked) parts.push('lucky');
  if (document.getElementById('ss-state-costume').checked) parts.push('costume');
  if (document.getElementById('ss-state-evolve').checked) parts.push('evolve');
  if (document.getElementById('ss-state-exclmove').checked) parts.push('@special');

  // CP / HP ranges
  const cpMin = document.getElementById('ss-cp-min').value;
  const cpMax = document.getElementById('ss-cp-max').value;
  if (cpMin || cpMax) {
    parts.push(`cp${cpMin || '10'}-${cpMax || ''}`);
  }

  const hpMin = document.getElementById('ss-hp-min').value;
  const hpMax = document.getElementById('ss-hp-max').value;
  if (hpMin || hpMax) {
    parts.push(`hp${hpMin || '10'}-${hpMax || ''}`);
  }
  
  // Custom species or move type
  const cust = document.getElementById('ss-custom-species').value.trim();
  if (cust) parts.push(cust);
  
  let searchStr = parts.join(' & ');
  if (!searchStr) searchStr = "4*"; 
  
  document.getElementById('search-string-output').textContent = searchStr;
}

function loadSearchTemplate(templateName) {
  document.querySelectorAll('[id*="ss-iv-"], [id*="ss-exc-"], [id*="ss-state-"], [id*="ss-buddy-"], [id*="ss-dist-"]').forEach(el => {
    el.checked = false;
  });
  document.getElementById('ss-age-select').value = 'all';
  document.getElementById('ss-custom-species').value = '';
  document.getElementById('ss-cp-min').value = '';
  document.getElementById('ss-cp-max').value = '';
  document.getElementById('ss-hp-min').value = '';
  document.getElementById('ss-hp-max').value = '';
  
  if (templateName === 'trash') {
    document.getElementById('ss-iv-0').checked = true;
    document.getElementById('ss-iv-1').checked = true;
    document.getElementById('ss-iv-2').checked = true;
    document.getElementById('ss-age-select').value = 'age0';
  } else if (templateName === 'hundo') {
    document.getElementById('ss-iv-4').checked = true;
  } else if (templateName === 'pvp') {
    document.getElementById('ss-iv-3').checked = true;
    document.getElementById('ss-iv-4').checked = true;
  } else if (templateName === 'evolve') {
    document.getElementById('ss-state-evolve').checked = true;
  } else if (templateName === 'safe-transfer') {
    document.getElementById('ss-custom-species').value = "!shiny & !legendary & !mythical & !shadow & !purified & !4* & !buddy5 & !favorite";
  }
  
  generateSearchString();
}

function copySearchString() {
  const str = document.getElementById('search-string-output').textContent;
  navigator.clipboard.writeText(str).then(() => {
    const btnIcon = document.querySelector('#btn-copy-string i');
    btnIcon.className = "fa-solid fa-circle-check";
    btnIcon.style.color = "var(--color-success)";
    setTimeout(() => {
      btnIcon.className = "fa-regular fa-copy";
      btnIcon.style.color = "var(--text-main)";
    }, 2000);
  });
}
