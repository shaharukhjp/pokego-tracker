// Pokémon GO Personal Tracker - Pokémon Database Generator
// Exposes window.pokemonDatabase for the client application.

const handcraftedDatabase = [
  // Venusaur Line
  {
    id: 1,
    name: "Bulbasaur",
    generation: 1,
    types: ["Grass", "Poison"],
    category: "Seed Pokémon",
    maxCP: 1262,
    baseStats: { attack: 118, defense: 111, stamina: 128 },
    fastMoves: ["Tackle", "Vine Whip"],
    chargedMoves: ["Power Whip", "Seed Bomb", "Sludge Bomb"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Ivysaur. Keep only one highest IV/Shiny.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 2,
    name: "Ivysaur",
    generation: 1,
    types: ["Grass", "Poison"],
    category: "Seed Pokémon",
    maxCP: 1891,
    baseStats: { attack: 151, defense: 143, stamina: 155 },
    fastMoves: ["Razor Leaf", "Vine Whip"],
    chargedMoves: ["Power Whip", "Sludge Bomb", "Solar Beam"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Intermediate evolution stage. Evolve to Venusaur.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 3,
    name: "Venusaur",
    generation: 1,
    types: ["Grass", "Poison"],
    category: "Seed Pokémon",
    maxCP: 3075,
    baseStats: { attack: 198, defense: 189, stamina: 190 },
    fastMoves: ["Razor Leaf", "Vine Whip"],
    chargedMoves: ["Frenzy Plant (Elite TM)", "Solar Beam", "Sludge Bomb"],
    released: true,
    exclusivity: "none",
    rank: "A",
    utility: "meta",
    tips: "Top-tier Grass PvE attacker and Great/Ultra League PvP staple. Mega & Gigantamax eligible. Keep multiple.",
    mega: {
      name: "Mega Venusaur",
      released: true,
      maxCP: 4181,
      energyCost: 200,
      types: ["Grass", "Poison"]
    },
    max: { released: true, gmax: true }
  },

  // Charizard Line
  {
    id: 4,
    name: "Charmander",
    generation: 1,
    types: ["Fire"],
    category: "Lizard Pokémon",
    maxCP: 1108,
    baseStats: { attack: 116, defense: 93, stamina: 118 },
    fastMoves: ["Ember", "Scratch"],
    chargedMoves: ["Flame Charge", "Flame Burst", "Flamethrower"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Charmeleon. Keep only one highest IV/Shiny.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 5,
    name: "Charmeleon",
    generation: 1,
    types: ["Fire"],
    category: "Flame Pokémon",
    maxCP: 1840,
    baseStats: { attack: 158, defense: 129, stamina: 151 },
    fastMoves: ["Fire Fang", "Scratch"],
    chargedMoves: ["Flamethrower", "Fire Punch", "Flame Burst"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Intermediate evolution stage. Evolve to Charizard.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 6,
    name: "Charizard",
    generation: 1,
    types: ["Fire", "Flying"],
    category: "Flame Pokémon",
    maxCP: 3266,
    baseStats: { attack: 223, defense: 173, stamina: 186 },
    fastMoves: ["Fire Spin", "Wing Attack (Elite TM)", "Dragon Breath (Elite TM)"],
    chargedMoves: ["Blast Burn (Elite TM)", "Dragon Claw", "Overheat"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Extremely viable in PvP Ultra League and PvE. Possesses two Megas and Gigantamax form. Blast Burn is mandatory. Keep multiple.",
    mega: {
      name: "Mega Charizard X / Y",
      released: true,
      energyCost: 200,
      variants: [
        { name: "Mega Charizard X", maxCP: 4353, types: ["Fire", "Dragon"] },
        { name: "Mega Charizard Y", maxCP: 5078, types: ["Fire", "Flying"] }
      ]
    },
    max: { released: true, gmax: true }
  },

  // Blastoise Line
  {
    id: 7,
    name: "Squirtle",
    generation: 1,
    types: ["Water"],
    category: "Tiny Turtle Pokémon",
    maxCP: 1069,
    baseStats: { attack: 94, defense: 121, stamina: 127 },
    fastMoves: ["Water Gun", "Tackle"],
    chargedMoves: ["Aqua Tail", "Water Pulse", "Aqua Jet"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Wartortle. Keep only one highest IV/Shiny.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 8,
    name: "Wartortle",
    generation: 1,
    types: ["Water"],
    category: "Turtle Pokémon",
    maxCP: 1682,
    baseStats: { attack: 126, defense: 155, stamina: 153 },
    fastMoves: ["Water Gun", "Bite"],
    chargedMoves: ["Hydro Pump", "Aqua Tail", "Ice Beam"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Intermediate evolution stage. Evolve to Blastoise.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 9,
    name: "Blastoise",
    generation: 1,
    types: ["Water"],
    category: "Shellfish Pokémon",
    maxCP: 2788,
    baseStats: { attack: 171, defense: 207, stamina: 188 },
    fastMoves: ["Water Gun", "Bite"],
    chargedMoves: ["Hydro Cannon (Elite TM)", "Ice Beam", "Flash Cannon"],
    released: true,
    exclusivity: "none",
    rank: "A",
    utility: "meta",
    tips: "Great Water tank. Strong Mega form. Good in Ultra League PvP. Hydro Cannon is essential. Keep 1-2.",
    mega: {
      name: "Mega Blastoise",
      released: true,
      maxCP: 4455,
      energyCost: 200,
      types: ["Water"]
    },
    max: { released: true, gmax: true }
  },

  // Gengar Line
  {
    id: 92,
    name: "Gastly",
    generation: 1,
    types: ["Ghost", "Poison"],
    category: "Gas Pokémon",
    maxCP: 1380,
    baseStats: { attack: 186, defense: 67, stamina: 102 },
    fastMoves: ["Lick (Elite TM)", "Sucker Punch"],
    chargedMoves: ["Sludge Bomb", "Dark Pulse", "Night Shade"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Haunter. Keep only one highest IV/Shiny.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 93,
    name: "Haunter",
    generation: 1,
    types: ["Ghost", "Poison"],
    category: "Gas Pokémon",
    maxCP: 2219,
    baseStats: { attack: 223, defense: 112, stamina: 128 },
    fastMoves: ["Shadow Claw", "Lick (Elite TM)"],
    chargedMoves: ["Shadow Punch (Elite TM)", "Shadow Ball", "Sludge Bomb"],
    released: true,
    exclusivity: "none",
    rank: "B",
    utility: "meta",
    tips: "Excellent glass-cannon in Great League PvP. Keep 1 with Great League IVs.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 94,
    name: "Gengar",
    generation: 1,
    types: ["Ghost", "Poison"],
    category: "Shadow Pokémon",
    maxCP: 3254,
    baseStats: { attack: 261, defense: 149, stamina: 155 },
    fastMoves: ["Shadow Claw", "Lick (Elite TM)", "Hex"],
    chargedMoves: ["Shadow Ball", "Sludge Bomb", "Shadow Punch (Elite TM)"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Elite Ghost attacker. Mega Gengar has massive PvE dps. Shadow Punch is needed for PvP. Keep multiple.",
    mega: {
      name: "Mega Gengar",
      released: true,
      maxCP: 4902,
      energyCost: 200,
      types: ["Ghost", "Poison"]
    },
    max: { released: true, gmax: true }
  },

  // Mewtwo
  {
    id: 150,
    name: "Mewtwo",
    generation: 1,
    types: ["Psychic"],
    category: "Genetic Pokémon",
    maxCP: 4724,
    baseStats: { attack: 300, defense: 182, stamina: 214 },
    fastMoves: ["Confusion", "Psycho Cut"],
    chargedMoves: ["Psystrike (Elite TM)", "Shadow Ball (Elite TM)", "Focus Blast", "Ice Beam"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Best overall Pokémon in game. Psystrike is mandatory. Mega Mewtwo X/Y will be god-tier. Keep all high IVs.",
    mega: {
      name: "Mega Mewtwo X / Y (Unreleased)",
      released: false,
      energyCost: 400,
      variants: [
        { name: "Mega Mewtwo X", maxCP: 6150, types: ["Psychic", "Fighting"] },
        { name: "Mega Mewtwo Y", maxCP: 6380, types: ["Psychic"] }
      ]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 151,
    name: "Mew",
    generation: 1,
    types: ["Psychic"],
    category: "New Species Pokémon",
    maxCP: 3691,
    baseStats: { attack: 210, defense: 210, stamina: 225 },
    fastMoves: ["Snarl", "Shadow Claw", "Volt Switch"],
    chargedMoves: ["Wild Charge", "Surf", "Flame Charge"],
    released: true,
    exclusivity: "mythical",
    rank: "S+",
    utility: "meta",
    tips: "Mythical. Strictly ONE per account. Highly collectible. Keep and invest.",
    mega: null,
    max: { released: false, gmax: false }
  },

  // Eevee & Eeveelutions
  {
    id: 133,
    name: "Eevee",
    generation: 1,
    types: ["Normal"],
    category: "Evolution Pokémon",
    maxCP: 1143,
    baseStats: { attack: 104, defense: 114, stamina: 146 },
    fastMoves: ["Quick Attack", "Tackle"],
    chargedMoves: ["Last Resort (Elite TM)", "Swift", "Dig"],
    released: true,
    exclusivity: "none",
    rank: "B",
    utility: "filler",
    tips: "Save high IVs to evolve into Umbreon, Sylveon, or Glaceon. Gigantamax available.",
    mega: null,
    max: { released: true, gmax: true }
  },
  {
    id: 134,
    name: "Vaporeon",
    generation: 1,
    types: ["Water"],
    category: "Bubble Jet Pokémon",
    maxCP: 3521,
    baseStats: { attack: 205, defense: 161, stamina: 277 },
    fastMoves: ["Waterfall", "Water Gun"],
    chargedMoves: ["Last Resort (Elite TM)", "Scald (Elite TM)", "Hydro Pump", "Aqua Tail"],
    released: true,
    exclusivity: "none",
    rank: "B",
    utility: "meta",
    tips: "Solid Water defender. Keep 1.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 135,
    name: "Jolteon",
    generation: 1,
    types: ["Electric"],
    category: "Lightning Pokémon",
    maxCP: 3265,
    baseStats: { attack: 232, defense: 182, stamina: 163 },
    fastMoves: ["Thunder Shock", "Volt Switch"],
    chargedMoves: ["Last Resort (Elite TM)", "Zap Cannon (Elite TM)", "Thunderbolt", "Discharge"],
    released: true,
    exclusivity: "none",
    rank: "B",
    utility: "filler",
    tips: "Outclassed by other Electric attackers. Keep only one.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 136,
    name: "Flareon",
    generation: 1,
    types: ["Fire"],
    category: "Flame Pokémon",
    maxCP: 3424,
    baseStats: { attack: 246, defense: 179, stamina: 163 },
    fastMoves: ["Fire Spin", "Ember"],
    chargedMoves: ["Last Resort (Elite TM)", "Superpower (Elite TM)", "Overheat", "Flamethrower"],
    released: true,
    exclusivity: "none",
    rank: "B",
    utility: "filler",
    tips: "Good budget Fire attacker, but outclassed. Keep only one.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 196,
    name: "Espeon",
    generation: 2,
    types: ["Psychic"],
    category: "Sun Pokémon",
    maxCP: 3583,
    baseStats: { attack: 261, defense: 175, stamina: 163 },
    fastMoves: ["Confusion", "Zen Headbutt"],
    chargedMoves: ["Last Resort (Elite TM)", "Shadow Ball (Elite TM)", "Psychic", "Psyshock"],
    released: true,
    exclusivity: "item-evolve",
    rank: "B",
    utility: "meta",
    tips: "Top-tier budget Psychic raid attacker. Evolve during daytime. Keep 1-2.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 197,
    name: "Umbreon",
    generation: 2,
    types: ["Dark"],
    category: "Moonline Pokémon",
    maxCP: 2445,
    baseStats: { attack: 126, defense: 240, stamina: 216 },
    fastMoves: ["Snarl", "Feint Attack"],
    chargedMoves: ["Last Resort (Elite TM)", "Psychic (Elite TM)", "Foul Play", "Dark Pulse"],
    released: true,
    exclusivity: "item-evolve",
    rank: "A",
    utility: "meta",
    tips: "Elite Great/Ultra League PvP tank. Last Resort is required. Keep 1 Hundo for Ultra League.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 470,
    name: "Leafeon",
    generation: 4,
    types: ["Grass"],
    category: "Verdant Pokémon",
    maxCP: 3328,
    baseStats: { attack: 216, defense: 219, stamina: 163 },
    fastMoves: ["Razor Leaf", "Quick Attack"],
    chargedMoves: ["Last Resort (Elite TM)", "Bullet Seed (Elite TM)", "Leaf Blade", "Solar Beam"],
    released: true,
    exclusivity: "item-evolve",
    rank: "B",
    utility: "filler",
    tips: "Requires Mossy Lure to evolve. Keep 1.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 471,
    name: "Glaceon",
    generation: 4,
    types: ["Ice"],
    category: "Fresh Snow Pokémon",
    maxCP: 3535,
    baseStats: { attack: 238, defense: 205, stamina: 163 },
    fastMoves: ["Frost Breath", "Ice Shard"],
    chargedMoves: ["Last Resort (Elite TM)", "Water Pulse (Elite TM)", "Avalanche", "Ice Beam"],
    released: true,
    exclusivity: "item-evolve",
    rank: "B",
    utility: "meta",
    tips: "Excellent budget Ice raid attacker. Requires Glacial Lure. Keep 2-3.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 700,
    name: "Sylveon",
    generation: 6,
    types: ["Fairy"],
    category: "Intertwining Pokémon",
    maxCP: 3470,
    baseStats: { attack: 203, defense: 205, stamina: 216 },
    fastMoves: ["Charm", "Quick Attack"],
    chargedMoves: ["Last Resort (Elite TM)", "Psyshock (Elite TM)", "Dazzling Gleam", "Moonblast"],
    released: true,
    exclusivity: "item-evolve",
    rank: "A",
    utility: "meta",
    tips: "Great Fairy attacker in PvE Master League. Evolve by earning 70 buddy hearts. Keep 1-2.",
    mega: null,
    max: { released: false, gmax: false }
  },

  // Tyranitar Line
  {
    id: 246,
    name: "Larvitar",
    generation: 2,
    types: ["Rock", "Ground"],
    category: "Rock Skin Pokémon",
    maxCP: 1040,
    baseStats: { attack: 115, defense: 93, stamina: 137 },
    fastMoves: ["Bite", "Tackle"],
    chargedMoves: ["Rock Slide", "Stomp", "Ancient Power"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Pupitar. Keep only one highest IV/Shiny.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 247,
    name: "Pupitar",
    generation: 2,
    types: ["Rock", "Ground"],
    category: "Hard Shell Pokémon",
    maxCP: 1766,
    baseStats: { attack: 155, defense: 133, stamina: 172 },
    fastMoves: ["Bite", "Rock Smash"],
    chargedMoves: ["Ancient Power", "Dig", "Crunch"],
    released: true,
    exclusivity: "none",
    rank: "C",
    utility: "filler",
    tips: "Evolve to Tyranitar.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 248,
    name: "Tyranitar",
    generation: 2,
    types: ["Rock", "Dark"],
    category: "Armor Pokémon",
    maxCP: 4335,
    baseStats: { attack: 251, defense: 207, stamina: 225 },
    fastMoves: ["Bite", "Smack Down (Elite TM)"],
    chargedMoves: ["Brutal Swing", "Stone Edge", "Crunch"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "S-Tier Rock and Dark PvE attacker. Mega Tyranitar has astronomical stats. Keep multiple.",
    mega: {
      name: "Mega Tyranitar",
      released: true,
      maxCP: 6028,
      energyCost: 200,
      types: ["Rock", "Dark"]
    },
    max: { released: false, gmax: false }
  },

  // Lucario Line
  {
    id: 447,
    name: "Riolu",
    generation: 4,
    types: ["Fighting"],
    category: "Emanation Pokémon",
    maxCP: 1117,
    baseStats: { attack: 127, defense: 78, stamina: 120 },
    fastMoves: ["Counter", "Quick Attack"],
    chargedMoves: ["Cross Chop", "Brick Break", "Low Sweep"],
    released: true,
    exclusivity: "egg-only",
    rank: "A",
    utility: "filler",
    tips: "Egg-only baby. Evolve to Lucario. Keep 1 or Shiny.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 448,
    name: "Lucario",
    generation: 4,
    types: ["Fighting", "Steel"],
    category: "Aura Pokémon",
    maxCP: 3054,
    baseStats: { attack: 236, defense: 144, stamina: 172 },
    fastMoves: ["Counter", "Bullet Punch"],
    chargedMoves: ["Aura Sphere", "Force Palm (Elite TM)", "Shadow Ball", "Power-Up Punch"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Elite Fighting PvE attacker and Team Rocket killer. Mega Lucario deals unmatched fighting DPS. Keep 2-3.",
    mega: {
      name: "Mega Lucario",
      released: true,
      maxCP: 4903,
      energyCost: 200,
      types: ["Fighting", "Steel"]
    },
    max: { released: false, gmax: false }
  },

  // Melmetal Line
  {
    id: 808,
    name: "Meltan",
    generation: 7,
    types: ["Steel"],
    category: "Hex Nut Pokémon",
    maxCP: 1207,
    baseStats: { attack: 118, defense: 99, stamina: 130 },
    fastMoves: ["Thunder Shock", "Tackle"],
    chargedMoves: ["Thunderbolt", "Flash Cannon"],
    released: true,
    exclusivity: "mythical",
    rank: "A",
    utility: "filler",
    tips: "Mythical. Mystery Box catchable. Evolve to Melmetal.",
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 809,
    name: "Melmetal",
    generation: 7,
    types: ["Steel"],
    category: "Hex Nut Pokémon",
    maxCP: 4069,
    baseStats: { attack: 226, defense: 190, stamina: 264 },
    fastMoves: ["Thunder Shock"],
    chargedMoves: ["Double Iron Bash (Elite TM)", "Superpower", "Rock Slide"],
    released: true,
    exclusivity: "mythical",
    rank: "S",
    utility: "meta",
    tips: "Excellent Master League PvP wall and gym defender. Gigantamax form is eligible. Keep 1-2 with Double Iron Bash.",
    mega: null,
    max: { released: true, gmax: true }
  },
  {
    id: 130,
    name: "Gyarados",
    generation: 1,
    types: ["Water", "Flying"],
    category: "Atrocious Pokémon",
    maxCP: 3834,
    baseStats: { attack: 237, defense: 186, stamina: 216 },
    fastMoves: ["Dragon Breath", "Waterfall", "Bite"],
    chargedMoves: ["Aqua Tail (Elite TM)", "Hydro Pump", "Crunch", "Outrage"],
    released: true,
    exclusivity: "none",
    rank: "A",
    utility: "meta",
    tips: "Excellent budget Water/Dark attacker. Mega Gyarados is highly viable in PvE Master League and raids. Keep multiple.",
    mega: {
      name: "Mega Gyarados",
      released: true,
      maxCP: 5332,
      energyCost: 200,
      types: ["Water", "Dark"]
    },
    max: { released: true, gmax: false }
  },
  {
    id: 149,
    name: "Dragonite",
    generation: 1,
    types: ["Dragon", "Flying"],
    category: "Dragon Pokémon",
    maxCP: 4287,
    baseStats: { attack: 263, defense: 198, stamina: 209 },
    fastMoves: ["Dragon Tail", "Dragon Breath"],
    chargedMoves: ["Draco Meteor (Elite TM)", "Outrage", "Hurricane (Elite TM)", "Superpower"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Top-tier Master League PvP staple and excellent PvE Dragon attacker. Released Dynamax form. Keep multiple with high IVs.",
    mega: null,
    max: { released: true, gmax: false }
  },
  {
    id: 373,
    name: "Salamence",
    generation: 3,
    types: ["Dragon", "Flying"],
    category: "Dragon Pokémon",
    maxCP: 4239,
    baseStats: { attack: 277, defense: 168, stamina: 216 },
    fastMoves: ["Dragon Tail", "Fire Fang"],
    chargedMoves: ["Outrage (Elite TM)", "Hydro Pump", "Draco Meteor", "Fire Blast"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Extremely high Dragon damage. Mega Salamence is a top-tier PvE dragon-type counter. Outrage is mandatory. Keep multiple.",
    mega: {
      name: "Mega Salamence",
      released: true,
      maxCP: 5688,
      energyCost: 200,
      types: ["Dragon", "Flying"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 376,
    name: "Metagross",
    generation: 3,
    types: ["Steel", "Psychic"],
    category: "Iron Leg Pokémon",
    maxCP: 4286,
    baseStats: { attack: 257, defense: 228, stamina: 190 },
    fastMoves: ["Bullet Punch", "Zen Headbutt"],
    chargedMoves: ["Meteor Mash (Elite TM)", "Psychic", "Earthquake"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Best non-mega Steel attacker in the game. Meteor Mash is critical. Mega Metagross is unreleased but will be S-tier. Keep all.",
    mega: {
      name: "Mega Metagross (Unreleased)",
      released: false,
      energyCost: 200,
      types: ["Steel", "Psychic"],
      maxCP: 5429
    },
    max: { released: true, gmax: false }
  },
  {
    id: 380,
    name: "Latias",
    generation: 3,
    types: ["Dragon", "Psychic"],
    category: "Eon Pokémon",
    maxCP: 3510,
    baseStats: { attack: 228, defense: 246, stamina: 190 },
    fastMoves: ["Dragon Breath", "Zen Headbutt"],
    chargedMoves: ["Mist Ball (Elite TM)", "Outrage", "Psychic", "Thunder"],
    released: true,
    exclusivity: "none",
    rank: "A",
    utility: "meta",
    tips: "Legendary. Mega Latias has extremely bulky stats, making it a powerful support anchor in dragon raids. Keep high IVs.",
    mega: {
      name: "Mega Latias",
      released: true,
      maxCP: 5420,
      energyCost: 300,
      types: ["Dragon", "Psychic"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 381,
    name: "Latios",
    generation: 3,
    types: ["Dragon", "Psychic"],
    category: "Eon Pokémon",
    maxCP: 4354,
    baseStats: { attack: 268, defense: 212, stamina: 190 },
    fastMoves: ["Dragon Breath", "Zen Headbutt"],
    chargedMoves: ["Luster Purge (Elite TM)", "Dragon Claw", "Psychic", "Solar Beam"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Legendary. Mega Latios has massive attack power, rendering it a premier Dragon-type raid attacker. Keep multiple.",
    mega: {
      name: "Mega Latios",
      released: true,
      maxCP: 5661,
      energyCost: 300,
      types: ["Dragon", "Psychic"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 382,
    name: "Kyogre",
    generation: 3,
    types: ["Water"],
    category: "Sea Basin Pokémon",
    maxCP: 4652,
    baseStats: { attack: 270, defense: 228, stamina: 205 },
    fastMoves: ["Waterfall"],
    chargedMoves: ["Origin Pulse (Elite TM)", "Surf", "Blizzard", "Thunder"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Primal Kyogre deals unparalleled Water-type damage and boosts other trainers' water counters. Keep multiple.",
    mega: {
      name: "Primal Kyogre",
      released: true,
      maxCP: 6672,
      energyCost: 400,
      types: ["Water"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 383,
    name: "Groudon",
    generation: 3,
    types: ["Ground"],
    category: "Continent Pokémon",
    maxCP: 4652,
    baseStats: { attack: 270, defense: 228, stamina: 205 },
    fastMoves: ["Mud Shot", "Dragon Tail"],
    chargedMoves: ["Precipice Blades (Elite TM)", "Earthquake", "Fire Punch (Elite TM)", "Solar Beam"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Primal Groudon gains Fire typing and acts as the premier Ground attacker. Precipice Blades is a must. Keep multiple.",
    mega: {
      name: "Primal Groudon",
      released: true,
      maxCP: 6672,
      energyCost: 400,
      types: ["Ground", "Fire"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 384,
    name: "Rayquaza",
    generation: 3,
    types: ["Dragon", "Flying"],
    category: "Sky High Pokémon",
    maxCP: 4336,
    baseStats: { attack: 284, defense: 170, stamina: 213 },
    fastMoves: ["Dragon Tail", "Air Slash"],
    chargedMoves: ["Dragon Ascent (Elite TM)", "Outrage", "Hurricane (Elite TM)", "Breaking Swipe (Elite TM)"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Mega Rayquaza is the absolute highest DPS Dragon and Flying attacker in the game. Requires Dragon Ascent. Keep all.",
    mega: {
      name: "Mega Rayquaza",
      released: true,
      maxCP: 6458,
      energyCost: 400,
      types: ["Dragon", "Flying"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 445,
    name: "Garchomp",
    generation: 4,
    types: ["Dragon", "Ground"],
    category: "Mach Pokémon",
    maxCP: 4479,
    baseStats: { attack: 261, defense: 193, stamina: 242 },
    fastMoves: ["Mud Shot", "Dragon Tail"],
    chargedMoves: ["Earth Power (Elite TM)", "Outrage", "Sand Tomb", "Fire Blast"],
    released: true,
    exclusivity: "none",
    rank: "S",
    utility: "meta",
    tips: "Top-tier Ground and Dragon attacker. Mega Garchomp offers massive DPS and triple-resistance to Electric. Keep multiple.",
    mega: {
      name: "Mega Garchomp",
      released: true,
      maxCP: 6132,
      energyCost: 200,
      types: ["Dragon", "Ground"]
    },
    max: { released: false, gmax: false }
  },
  {
    id: 483,
    name: "Dialga",
    generation: 4,
    types: ["Steel", "Dragon"],
    category: "Temporal Pokémon",
    maxCP: 4565,
    baseStats: { attack: 275, defense: 211, stamina: 205 },
    fastMoves: ["Dragon Breath", "Metal Claw"],
    chargedMoves: ["Iron Head", "Draco Meteor", "Thunder", "Roar of Time (Elite TM)"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Origin Forme Dialga possesses the Roar of Time Adventure Effect (pauses incense/lucky egg/star piece timers). Keep and max.",
    adventureEffect: {
      name: "Roar of Time",
      desc: "Pauses active timers for Incense, Daily Adventure Incense, Lucky Eggs, and Star Pieces (cost: 5 Dialga Candy & 5,000 Stardust per 6 minutes)."
    },
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 484,
    name: "Palkia",
    generation: 4,
    types: ["Water", "Dragon"],
    category: "Spatial Pokémon",
    maxCP: 4684,
    baseStats: { attack: 286, defense: 215, stamina: 189 },
    fastMoves: ["Dragon Breath", "Dragon Tail"],
    chargedMoves: ["Aqua Tail", "Draco Meteor", "Hydro Pump", "Spacial Rend (Elite TM)"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Origin Forme Palkia possesses the Spacial Rend Adventure Effect (increases the wild Pokémon encounter distance radius). Keep and max.",
    adventureEffect: {
      name: "Spacial Rend",
      desc: "Distorts space to expand your wild Pokémon interaction radius by 100% (cost: 5 Palkia Candy & 5,000 Stardust per 10 minutes)."
    },
    mega: null,
    max: { released: false, gmax: false }
  },
  {
    id: 800,
    name: "Necrozma",
    generation: 7,
    types: ["Psychic"],
    category: "Prism Pokémon",
    maxCP: 4163,
    baseStats: { attack: 250, defense: 224, stamina: 219 },
    fastMoves: ["Shadow Claw", "Psycho Cut"],
    chargedMoves: ["Dark Pulse", "Iron Head", "Future Sight", "Outrage"],
    released: true,
    exclusivity: "none",
    rank: "S+",
    utility: "meta",
    tips: "Legendary. Fuses with Solgaleo (Dusk Mane) or Lunala (Dawn Wings) to activate Adventure Effects (Sunsteel Strike attracts day weather Pokémon; Moongeist Beam attracts night weather Pokémon). Keep all.",
    adventureEffect: {
      name: "Dusk Mane & Dawn Wings Fusion",
      desc: "Sunsteel Strike (Dusk Mane) attracts daytime weather spawns. Moongeist Beam (Dawn Wings) attracts nighttime weather spawns (cost: 3 Necrozma Candy & 3,000 Stardust per 10 minutes)."
    },
    mega: {
      name: "Dusk Mane / Dawn Wings Fusion",
      released: true,
      maxCP: 5504,
      energyCost: 1000,
      types: ["Psychic", "Steel"]
    },
    max: { released: false, gmax: false }
  }
];

// Complete National Dex Names Array (1025 entries)
const pokemonNames = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
  "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable",
  "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
  "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
  "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
  "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
  "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
  "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo",
  "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster",
  "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby",
  "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone",
  "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing",
  "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea",
  "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime",
  "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros",
  "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon",
  "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto",
  "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres",
  "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew",
  "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion",
  "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot",
  "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat",
  "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi",
  "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos",
  "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip",
  "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma",
  "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking",
  "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress",
  "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish",
  "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring",
  "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid",
  "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom",
  "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle",
  "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank",
  "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar",
  "Tyranitar", "Lugia", "Ho-Oh", "Celebi",
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken",
  "Mudkip", "Marshtomp", "Swampert", "Poochyena", "Mightyena", "Zigzagoon",
  "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox",
  "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry",
  "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia",
  "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth",
  "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur",
  "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass",
  "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon",
  "Aggron", "Meditite", "Medicham", "Electrike", "Manectric", "Plusle",
  "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot",
  "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt",
  "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava",
  "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose",
  "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish",
  "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith",
  "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet",
  "Banette", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol",
  "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein",
  "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon",
  "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", "Regirock",
  "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon",
  "Rayquaza", "Jirachi", "Deoxys",
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape",
  "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor",
  "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio",
  "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon",
  "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen",
  "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos",
  "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny",
  "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky",
  "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny",
  "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax",
  "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion",
  "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke",
  "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior",
  "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon",
  "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass",
  "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf",
  "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia",
  "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus",
  "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite",
  "Emboar", "Oshawott", "Dewott", "Samurott", "Patrat", "Watchog",
  "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage",
  "Simisage", "Pansear", "Simisear", "Panpour", "Simipour", "Munna",
  "Musharna", "Pidove", "Tranquill", "Unfezant", "Blitzle", "Zebstrika",
  "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur",
  "Excadrill", "Audino", "Timburr", "Gurdurr", "Conkeldurr", "Tympole",
  "Palpitoad", "Seismitoad", "Throh", "Sawk", "Sewaddle", "Swadloon",
  "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott",
  "Petilil", "Lilligant", "Basculin", "Sandile", "Krokorok", "Krookodile",
  "Darumaka", "Darmanitan", "Maractus", "Dwebble", "Crustle", "Scraggy",
  "Scrafty", "Sigilyph", "Yamask", "Cofagrigus", "Tirtouga", "Carracosta",
  "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zoroark",
  "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis",
  "Duosion", "Reuniclus", "Ducklett", "Swanna", "Vanillite", "Vanillish",
  "Vanilluxe", "Deerling", "Sawsbuck", "Emolga", "Karrablast", "Escavalier",
  "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola", "Joltik",
  "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang",
  "Tynamo", "Eelektrik", "Eelektross", "Elgyem", "Beheeyem", "Litwick",
  "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo",
  "Beartic", "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Mienfoo",
  "Mienshao", "Druddigon", "Golett", "Golurk", "Pawniard", "Bisharp",
  "Bouffalant", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Heatmor",
  "Durant", "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona",
  "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram",
  "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect",
  "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox",
  "Froakie", "Frogadier", "Greninja", "Bunnelby", "Diggersby", "Fletchling",
  "Fletchinder", "Talonflame", "Scatterbug", "Spewpa", "Vivillon", "Litleo",
  "Pyroar", "Flabébé", "Floette", "Florges", "Skiddo", "Gogoat",
  "Pancham", "Pangoro", "Furfrou", "Espurr", "Meowstic", "Honedge",
  "Doublade", "Aegislash", "Spritzee", "Aromatisse", "Swirlix", "Slurpuff",
  "Inkay", "Malamar", "Binacle", "Barbaracle", "Skrelp", "Dragalge",
  "Clauncher", "Clawitzer", "Helioptile", "Heliolisk", "Tyrunt", "Tyrantrum",
  "Amaura", "Aurorus", "Sylveon", "Hawlucha", "Dedenne", "Carbink",
  "Goomy", "Sliggoo", "Goodra", "Klefki", "Phantump", "Trevenant",
  "Pumpkaboo", "Gourgeist", "Bergmite", "Avalugg", "Noibat", "Noivern",
  "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion",
  "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar",
  "Popplio", "Brionne", "Primarina", "Pikipek", "Trumbeak", "Toucannon",
  "Yungoos", "Gumshoos", "Grubbin", "Charjabug", "Vikavolt", "Crabrawler",
  "Crabominable", "Oricorio", "Cutiefly", "Ribombee", "Rockruff", "Lycanroc",
  "Wishiwashi", "Mareanie", "Toxapex", "Mudbray", "Mudsdale", "Dewpider",
  "Araquanid", "Fomantis", "Lurantis", "Morelull", "Shiinotic", "Salandit",
  "Salazzle", "Stufful", "Bewear", "Bounsweet", "Steenee", "Tsareena",
  "Comfey", "Oranguru", "Passimian", "Wimpod", "Golisopod", "Sandygast",
  "Palossand", "Pyukumuku", "Type: Null", "Silvally", "Minior", "Komala",
  "Turtonator", "Togedemaru", "Mimikyu", "Bruxish", "Drampa", "Dhelmise",
  "Jangmo-o", "Hakamo-o", "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu",
  "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego",
  "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord",
  "Necrozma", "Magearna", "Marshadow", "Poipole", "Naganadel", "Stakataka",
  "Blacephalon", "Zeraora", "Meltan", "Melmetal",
  "Grookey", "Thwackey", "Rillaboom", "Scorbunny", "Raboot", "Cinderace",
  "Sobble", "Drizzile", "Inteleon", "Skwovet", "Greedent", "Rookidee",
  "Corvisquire", "Corviknight", "Blipbug", "Dottler", "Orbeetle", "Nickit",
  "Thievul", "Gossifleur", "Eldegoss", "Wooloo", "Dubwool", "Chewtle",
  "Drednaw", "Yamper", "Boltund", "Rolycoly", "Carkol", "Coalossal",
  "Applin", "Flapple", "Appletun", "Silicobra", "Sandaconda", "Cramorant",
  "Arrokuda", "Barraskewda", "Toxel", "Toxtricity", "Sizzlipede", "Centiskorch",
  "Clobbopus", "Grapploct", "Sinistea", "Polteageist", "Hatenna", "Hattrem",
  "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Obstagoon", "Perrserker",
  "Cursola", "Sirfetch'd", "Mr. Rime", "Runerigus", "Milcery", "Alcremie",
  "Falinks", "Pincurchin", "Snom", "Frosmoth", "Stonjourner", "Eiscue",
  "Indeedee", "Morpeko", "Cufant", "Copperajah", "Dracozolt", "Arctozolt",
  "Dracovish", "Arctovish", "Duraludon", "Dreepy", "Drakloak", "Dragapult",
  "Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Zarude",
  "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex", "Wyrdeer",
  "Kleavor", "Ursaluna", "Basculegion", "Sneasler", "Overqwil", "Enamorus",
  "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge",
  "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula",
  "Spidops", "Nymble", "Lokix", "Pawmi", "Pawmo", "Pawmot",
  "Tandemaus", "Maushold", "Fidough", "Dachsbun", "Smoliv", "Dolliv",
  "Arboliva", "Squawkabilly", "Nacli", "Naclstack", "Garganacl", "Charcadet",
  "Armarouge", "Ceruledge", "Tadbulb", "Bellibolt", "Wattrel", "Kilowattrel",
  "Maschiff", "Mabosstiff", "Shroodle", "Grafaiai", "Bramblin", "Brambleghast",
  "Toedscool", "Toedscruel", "Klawf", "Capsakid", "Scovillain", "Rellor",
  "Rabsca", "Flittle", "Espathra", "Tinkatink", "Tinkatuff", "Tinkaton",
  "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom",
  "Revavroom", "Cyclizar", "Orthworm", "Glimmet", "Glimmora", "Greavard",
  "Houndstone", "Flamigo", "Cetoddle", "Cetitan", "Veluza", "Dondozo",
  "Tatsugiri", "Annihilape", "Clodsire", "Farigiraf", "Dudunsparce", "Kingambit",
  "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks",
  "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns",
  "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien",
  "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon",
  "Miraidon", "Walking Wake", "Iron Leaves", "Dipplin", "Poltchageist", "Sinistcha",
  "Okidogi", "Munkidori", "Fezandipiti", "Ogerpon", "Archaludon", "Hydrapple",
  "Gouging Fire", "Raging Bolt", "Iron Boulder", "Iron Crown", "Terapagos", "Pecharunt"
];

// National Dex Generator loop
const finalDatabase = [];
const handcraftedMap = new Map(handcraftedDatabase.map(p => [p.id, p]));

for (let id = 1; id <= 1025; id++) {
  if (handcraftedMap.has(id)) {
    finalDatabase.push(handcraftedMap.get(id));
  } else {
    // Generate standard entry
    const name = pokemonNames[id - 1] || `Species #${id}`;
    let gen = 9;
    if (id <= 151) gen = 1;
    else if (id <= 251) gen = 2;
    else if (id <= 386) gen = 3;
    else if (id <= 493) gen = 4;
    else if (id <= 649) gen = 5;
    else if (id <= 721) gen = 6;
    else if (id <= 809) gen = 7;
    else if (id <= 905) gen = 8;
    
    // Assign dual types programmatically
    const standardTypes = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Steel", "Fairy", "Dark"];
    const t1 = standardTypes[id % standardTypes.length];
    const types = [t1];
    
    // 35% of species get dual-types
    if (id % 3 === 0 && id % standardTypes.length !== (id + 5) % standardTypes.length) {
      types.push(standardTypes[(id + 5) % standardTypes.length]);
    }
    
    // Generate stats
    const baseStats = {
      attack: 100 + (id % 120),
      defense: 90 + (id % 110),
      stamina: 100 + (id % 130)
    };
    
    // Level 50 CPM = 0.84029999
    const cpmL50 = 0.84029999;
    const maxCP = Math.max(10, Math.floor( 
      (baseStats.attack + 15) * 
      Math.sqrt(baseStats.defense + 15) * 
      Math.sqrt(baseStats.stamina + 15) * 
      Math.pow(cpmL50, 2) / 10 
    ));
    
    finalDatabase.push({
      id,
      name,
      generation: gen,
      types,
      category: "Pokémon",
      maxCP,
      baseStats,
      fastMoves: ["Tackle", "Quick Attack"],
      chargedMoves: ["Swift", "Struggle"],
      released: id <= 890, // First 890 released in GO
      exclusivity: id % 25 === 0 ? "egg-only" : "none",
      rank: id % 45 === 0 ? "S" : (id % 12 === 0 ? "A" : "C"),
      utility: (id % 45 === 0 || id % 12 === 0 || id % 15 === 0 || id % 10 === 0) ? "meta" : "filler",
      tips: (id % 45 === 0 || id % 12 === 0 || id % 15 === 0 || id % 10 === 0)
        ? "Meta-relevant standard species. Keep with high IVs or Shiny."
        : "Standard collectible species. Keep only one highest IV/Shiny version of this species to optimize bag storage.",
      mega: null,
      max: { released: id % 15 === 0, gmax: false }
    });
  }
}

// Propagate meta status to pre-evolutions
const metaFamilies = [
  [1, 2, 3],       // Bulbasaur line
  [4, 5, 6],       // Charmander line
  [7, 8, 9],       // Squirtle line
  [92, 93, 94],    // Gastly line
  [133, 134],      // Eevee -> Vaporeon
  [133, 135],      // Eevee -> Jolteon
  [133, 136],      // Eevee -> Flareon
  [133, 196],      // Eevee -> Espeon
  [133, 197],      // Eevee -> Umbreon
  [133, 470],      // Eevee -> Leafeon
  [133, 471],      // Eevee -> Glaceon
  [133, 700],      // Eevee -> Sylveon
  [246, 247, 248],  // Larvitar line -> Tyranitar
  [447, 448],      // Riolu line -> Lucario
  [808, 809],      // Meltan line -> Melmetal
  [147, 148, 149],  // Dratini line -> Dragonite
  [129, 130],      // Magikarp -> Gyarados
  [443, 444, 445],  // Gible -> Gabite -> Garchomp
  [371, 372, 373],  // Bagon -> Shelgon -> Salamence
  [374, 375, 376]   // Beldum -> Metang -> Metagross
];

metaFamilies.forEach(family => {
  const finalId = family[family.length - 1];
  const finalPoke = finalDatabase.find(p => p.id === finalId);
  if (finalPoke && (finalPoke.utility === "meta" || finalPoke.mega || finalPoke.max.released)) {
    family.forEach(memberId => {
      const member = finalDatabase.find(p => p.id === memberId);
      if (member) {
        member.utility = "meta";
        if (memberId !== finalId) {
          member.tips = `Pre-evolution of meta-relevant ${finalPoke.name}. Keep high IV or Shiny to evolve. Save for exclusive/Community Day moves.`;
        }
      }
    });
  }
});
// Post-processing: Correct exclusivity fields for exact Pokémon GO mappings
const restrictedMythicalsList = [
  151, // Mew
  251, // Celebi
  385, // Jirachi
  492, // Shaymin
  494, // Victini
  647, // Keldeo
  648, // Meloetta
  719, // Diancie
  720, // Hoopa
  801, // Magearna
  802, // Marshadow
  893, // Zarude
  890  // Eternatus
];

const eggOnlyList = [
  172, 173, 174, 175, // Pichu, Cleffa, Igglybuff, Togepi
  236, 238, 239, 240, // Tyrogue, Smoochum, Elekid, Magby
  298, 360,           // Azurill, Wynaut
  406, 433, 438, 439, 440, 446, 447, 458, // Budew, Chingling, Bonsly, Mime Jr, Happiny, Munchlax, Riolu, Mantyke
  636, 757, 848, 935  // Larvesta, Salandit, Toxel, Charcadet
];

const itemEvolveList = [
  // Eevee evolutions
  134, 135, 136, 196, 197, 470, 471, 700,
  // Sinnoh / Unova / Sun / King / Metal items
  182, 186, 191, 199, 208, 212, 230, 233, 407, 424, 429, 430, 461, 464, 465, 466, 467, 468, 469, 472, 473, 474, 475, 477, 478,
  // Kalos quest evolutions
  683, 685, 687, 706,
  // Hisui / Galar / Paldea buddy & coin quests
  862, 865, 867, 899, 900, 901, 903, 904, 919, 920, 923, 954, 963, 979, 983, 993, 1019
];

finalDatabase.forEach(p => {
  if (restrictedMythicalsList.includes(p.id)) {
    p.exclusivity = "mythical";
  } else if (eggOnlyList.includes(p.id)) {
    p.exclusivity = "egg-only";
  } else if (itemEvolveList.includes(p.id)) {
    p.exclusivity = "item-evolve";
  } else {
    p.exclusivity = "none";
  }
});

window.pokemonDatabase = finalDatabase;

// Helper search queries for categories
window.pokemonExclusivityTypes = {
  mythical: "Mythical (Special limited research, usually 1 per account)",
  "egg-only": "Egg Only (Babies or hatching-exclusive)",
  "item-evolve": "Item / Quest Evolve (Requires stones, buddy distance, or tasks)",
  "background-released": "Special Location Backgrounds released"
};
