// Pokémon GO Personal Tracker - Core Application Logic (Updated)

// --- SUPABASE CLIENT & AUTH CONFIG ---
let supabaseClient = null;
if (window.supabase && window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
  supabaseClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  console.log("Supabase Client initialized successfully.");
} else {
  console.log("Supabase config is missing or incomplete. Running in Guest/Offline mode.");
}

let currentUserSession = null;
let syncTimeoutId = null;
let currentAuthMode = 'login'; // 'login' or 'signup'
let activeSyncProvider = 'local'; // 'local', 'supabase', 'google-drive'
let googleDriveFileId = null;     // Cached file ID for Drive saves

window.BACKGROUND_URLS_MAP = {
  "Site-favicon.ico": "https://static.wikia.nocookie.net/pokemongo/images/4/4a/Site-favicon.ico/revision/latest?cb=20211028213125",
  "Location Card Jeju Latios": "https://static.wikia.nocookie.net/pokemongo/images/3/31/Location_Card_Jeju_Latios.png/revision/latest?cb=20230730145206",
  "Special Background GoFest2024 Wormhole": "https://static.wikia.nocookie.net/pokemongo/images/c/c8/Special_Background_GoFest2024_Wormhole.png/revision/latest?cb=20240625173835",
  "Special Background GoFest2024 Radiance": "https://static.wikia.nocookie.net/pokemongo/images/c/c5/Special_Background_GoFest2024_Radiance.png/revision/latest?cb=20240625175708",
  "Special Background GoFest2024 Umbra": "https://static.wikia.nocookie.net/pokemongo/images/5/5a/Special_Background_GoFest2024_Umbra.png/revision/latest?cb=20240625175742",
  "Special Background GoFest2024 Wormhole Sun": "https://static.wikia.nocookie.net/pokemongo/images/7/79/Special_Background_GoFest2024_Wormhole_Sun.png/revision/latest?cb=20240625175823",
  "Special Background GoFest2024 Wormhole Moon": "https://static.wikia.nocookie.net/pokemongo/images/4/47/Special_Background_GoFest2024_Wormhole_Moon.png/revision/latest?cb=20240625175802",
  "Special Background Valor": "https://static.wikia.nocookie.net/pokemongo/images/3/3c/Special_Background_Valor.png/revision/latest?cb=20240827010841",
  "Special Background Instinct": "https://static.wikia.nocookie.net/pokemongo/images/6/6a/Special_Background_Instinct.png/revision/latest?cb=20240827010906",
  "Special Background Mystic": "https://static.wikia.nocookie.net/pokemongo/images/0/00/Special_Background_Mystic.png/revision/latest?cb=20240827010923",
  "Special Background GoWildArea2024": "https://static.wikia.nocookie.net/pokemongo/images/e/eb/Special_Background_GoWildArea2024.png/revision/latest?cb=20241105202629",
  "Special Background DecCD2024": "https://static.wikia.nocookie.net/pokemongo/images/a/a1/Special_Background_DecCD2024.png/revision/latest?cb=20241205184149",
  "Special Background DualDestiny": "https://static.wikia.nocookie.net/pokemongo/images/c/ce/Special_Background_DualDestiny.png/revision/latest?cb=20241220195727",
  "Special Background Enigma": "https://static.wikia.nocookie.net/pokemongo/images/5/57/Special_Background_Enigma.png/revision/latest?cb=20250221121829",
  "Special Background BlackVersion": "https://static.wikia.nocookie.net/pokemongo/images/5/50/Special_Background_BlackVersion.png/revision/latest?cb=20250224145003",
  "Special Background WhiteVersion": "https://static.wikia.nocookie.net/pokemongo/images/6/6f/Special_Background_WhiteVersion.png/revision/latest?cb=20250224145022",
  "Special Background GreyVersion": "https://static.wikia.nocookie.net/pokemongo/images/0/01/Special_Background_GreyVersion.png/revision/latest?cb=20250225000717",
  "Special Background MightAndMastery": "https://static.wikia.nocookie.net/pokemongo/images/9/90/Special_Background_MightAndMastery.png/revision/latest?cb=20250226163951",
  "Special Background DelightfulDays": "https://static.wikia.nocookie.net/pokemongo/images/8/85/Special_Background_DelightfulDays.png/revision/latest?cb=20250613194829",
  "Special Background GOFest 2025": "https://static.wikia.nocookie.net/pokemongo/images/7/79/Special_Background_GOFest_2025.png/revision/latest?cb=20250508151346",
  "Special Background GOFest 2025 Sword": "https://static.wikia.nocookie.net/pokemongo/images/a/a4/Special_Background_GOFest_2025_Sword.png/revision/latest?cb=20250630090435",
  "Special Background GOFest 2025 Shield": "https://static.wikia.nocookie.net/pokemongo/images/d/d6/Special_Background_GOFest_2025_Shield.png/revision/latest?cb=20250630090530",
  "Special Background 9th Anniversary": "https://static.wikia.nocookie.net/pokemongo/images/9/94/Special_Background_9th_Anniversary.png/revision/latest?cb=20250528234103",
  "Special Background Max Finale": "https://static.wikia.nocookie.net/pokemongo/images/4/4f/Special_Background_Max_Finale.png/revision/latest?cb=20250722185312",
  "Special Background Tales of Transformation": "https://static.wikia.nocookie.net/pokemongo/images/2/20/Special_Background_Tales_of_Transformation.png/revision/latest?cb=20250901130826",
  "Special Background Concierge": "https://static.wikia.nocookie.net/pokemongo/images/b/bd/Special_Background_Concierge.png/revision/latest?cb=20250901130851",
  "Special Background Observatory Exhibition Tour": "https://static.wikia.nocookie.net/pokemongo/images/9/9e/Special_Background_Observatory_Exhibition_Tour.png/revision/latest?cb=20251023141804",
  "Special Background Wild Area Global 2025": "https://static.wikia.nocookie.net/pokemongo/images/e/e9/Special_Background_Wild_Area_Global_2025.png/revision/latest?cb=20251006211732",
  "Special Background Community 2026": "https://static.wikia.nocookie.net/pokemongo/images/0/09/Special_Background_Community_2026.png/revision/latest?cb=20251205175837",
  "Special Background X": "https://static.wikia.nocookie.net/pokemongo/images/0/0b/Special_Background_X.png/revision/latest?cb=20260123024708",
  "Special Background Y": "https://static.wikia.nocookie.net/pokemongo/images/0/06/Special_Background_Y.png/revision/latest?cb=20260123024717",
  "Special Background Mega": "https://static.wikia.nocookie.net/pokemongo/images/8/8a/Special_Background_Mega.png/revision/latest?cb=20260123024728",
  "Special Background Gold": "https://static.wikia.nocookie.net/pokemongo/images/b/b3/Special_Background_Gold.png/revision/latest?cb=20260123024541",
  "Special Background Silver": "https://static.wikia.nocookie.net/pokemongo/images/0/0a/Special_Background_Silver.png/revision/latest?cb=20260123024611",
  "Special Background Ruby": "https://static.wikia.nocookie.net/pokemongo/images/3/3c/Special_Background_Ruby.png/revision/latest?cb=20260123024623",
  "Special Background Sapphire": "https://static.wikia.nocookie.net/pokemongo/images/6/69/Special_Background_Sapphire.png/revision/latest?cb=20260123024634",
  "Special Background Diamond": "https://static.wikia.nocookie.net/pokemongo/images/e/e7/Special_Background_Diamond.png/revision/latest?cb=20260123024645",
  "Special Background Pearl": "https://static.wikia.nocookie.net/pokemongo/images/3/37/Special_Background_Pearl.png/revision/latest?cb=20260123024657",
  "Special Background Festival of Colors 2026": "https://static.wikia.nocookie.net/pokemongo/images/e/e6/Special_Background_Festival_of_Colors_2026.png/revision/latest?cb=20260226212741",
  "Special Background Pokopia": "https://static.wikia.nocookie.net/pokemongo/images/8/8c/Special_Background_Pokopia.png/revision/latest?cb=20260303194533",
  "Location Card Las Vegas": "https://static.wikia.nocookie.net/pokemongo/images/9/9d/Location_Card_Las_Vegas.png/revision/latest?cb=20230219150935",
  "Location Card Jeju": "https://static.wikia.nocookie.net/pokemongo/images/7/7c/Location_Card_Jeju.png/revision/latest?cb=20230807115332",
  "Location Card Osaka": "https://static.wikia.nocookie.net/pokemongo/images/6/68/Location_Card_Osaka.png/revision/latest?cb=20230807115307",
  "Location Card London": "https://static.wikia.nocookie.net/pokemongo/images/7/77/Location_Card_London.png/revision/latest?cb=20230807115307",
  "Location Card NYC": "https://static.wikia.nocookie.net/pokemongo/images/a/a8/Location_Card_NYC.png/revision/latest?cb=20230807115307",
  "Location Card Seoul": "https://static.wikia.nocookie.net/pokemongo/images/3/33/Location_Card_Seoul.png/revision/latest?cb=20231007124526",
  "Location Card Barcelona": "https://static.wikia.nocookie.net/pokemongo/images/7/78/Location_Card_Barcelona.png/revision/latest?cb=20231007124520",
  "Location Card Mexico City": "https://static.wikia.nocookie.net/pokemongo/images/1/1a/Location_Card_Mexico_City.png/revision/latest?cb=20230926183524",
  "Location Card Los Angeles": "https://static.wikia.nocookie.net/pokemongo/images/1/15/Location_Card_Los_Angeles.png/revision/latest?cb=20240123232850",
  "Location Card Bali": "https://static.wikia.nocookie.net/pokemongo/images/a/a3/Location_Card_Bali.png/revision/latest?cb=20240226214952",
  "Location Card Tainan": "https://static.wikia.nocookie.net/pokemongo/images/7/74/Location_Card_Tainan.png/revision/latest?cb=20240304140910",
  "Location Card Surabaya": "https://static.wikia.nocookie.net/pokemongo/images/3/39/Location_Card_Surabaya.png/revision/latest?cb=20240411005248",
  "Location Card Sendai": "https://static.wikia.nocookie.net/pokemongo/images/6/6d/Location_Card_Sendai.png/revision/latest?cb=20240429202613",
  "Location Card Madrid": "https://static.wikia.nocookie.net/pokemongo/images/9/9c/Location_Card_Madrid.png/revision/latest?cb=20240429202457",
  "Location Card NYC 2024": "https://static.wikia.nocookie.net/pokemongo/images/5/5a/Location_Card_NYC_2024.png/revision/latest?cb=20240429202542",
  "Location Background Honolulu": "https://static.wikia.nocookie.net/pokemongo/images/f/f8/Location_Background_Honolulu.png/revision/latest?cb=20240807152906",
  "Location Card Yogyakarta": "https://static.wikia.nocookie.net/pokemongo/images/9/94/Location_Card_Yogyakarta.png/revision/latest?cb=20240724003756",
  "Location Background MLB Miami Marlins": "https://static.wikia.nocookie.net/pokemongo/images/1/17/Location_Background_MLB_Miami_Marlins.png/revision/latest?cb=20240904192434",
  "Location Background MLB Seattle Mariners": "https://static.wikia.nocookie.net/pokemongo/images/e/ed/Location_Background_MLB_Seattle_Mariners.png/revision/latest?cb=20240904192413",
  "Location Background Jakarta": "https://static.wikia.nocookie.net/pokemongo/images/c/cc/Location_Background_Jakarta.png/revision/latest?cb=20240814203323",
  "Location Background Incheon": "https://static.wikia.nocookie.net/pokemongo/images/a/a9/Location_Background_Incheon.png/revision/latest?cb=20240820174558",
  "Location Background Fukuoka": "https://static.wikia.nocookie.net/pokemongo/images/4/4e/Location_Background_Fukuoka.png/revision/latest?cb=20241105202608",
  "Location Background Hong Kong": "https://static.wikia.nocookie.net/pokemongo/images/7/78/Location_Background_Hong_Kong.png/revision/latest?cb=20241120174542",
  "Location Background S\u00e3o Paulo": "https://static.wikia.nocookie.net/pokemongo/images/d/db/Location_Background_S%C3%A3o_Paulo.png/revision/latest?cb=20241120174853",
  "Location Background New Taipei City": "https://static.wikia.nocookie.net/pokemongo/images/7/73/Location_Background_New_Taipei_City.png/revision/latest?cb=20250221000906",
  "Location Background Los Angeles": "https://static.wikia.nocookie.net/pokemongo/images/5/54/Location_Background_Los_Angeles.png/revision/latest?cb=20250221000954",
  "Location Background Singapore": "https://static.wikia.nocookie.net/pokemongo/images/b/be/Location_Background_Singapore.png/revision/latest?cb=20250313124054",
  "Location Background Mumbai": "https://static.wikia.nocookie.net/pokemongo/images/0/0e/Location_Background_Mumbai.png/revision/latest?cb=20250313124138",
  "Location Background Milan": "https://static.wikia.nocookie.net/pokemongo/images/5/5e/Location_Background_Milan.png/revision/latest?cb=20250313124224",
  "Location Background Santiago": "https://static.wikia.nocookie.net/pokemongo/images/b/bb/Location_Background_Santiago.png/revision/latest?cb=20250313124255",
  "Location Background SpringBlossom2025": "https://static.wikia.nocookie.net/pokemongo/images/2/25/Location_Background_SpringBlossom2025.png/revision/latest?cb=20250321175418",
  "Location Background Expo2025 Starters": "https://static.wikia.nocookie.net/pokemongo/images/5/5e/Location_Background_Expo2025_Starters.png/revision/latest?cb=20250411172458",
  "Location Background Expo2025 Pikachu": "https://static.wikia.nocookie.net/pokemongo/images/c/c5/Location_Background_Expo2025_Pikachu.png/revision/latest?cb=20250411172623",
  "Location Background Osaka 2025": "https://static.wikia.nocookie.net/pokemongo/images/c/cb/Location_Background_Osaka_2025.png/revision/latest?cb=20250501174802",
  "Location Background Osaka GOFest 2025": "https://static.wikia.nocookie.net/pokemongo/images/2/2d/Location_Background_Osaka_GOFest_2025.png/revision/latest?cb=20250508151144",
  "Location Background Jersey City": "https://static.wikia.nocookie.net/pokemongo/images/d/d4/Location_Background_Jersey_City.png/revision/latest?cb=20250508151212",
  "Location Background Paris": "https://static.wikia.nocookie.net/pokemongo/images/0/0a/Location_Background_Paris.png/revision/latest?cb=20250508151325",
  "Location Background Sajik Baseball Stadium": "https://static.wikia.nocookie.net/pokemongo/images/6/62/Location_Background_Sajik_Baseball_Stadium.png/revision/latest?cb=20250613195034",
  "Location Background Road Trip 2025 Manchester": "https://static.wikia.nocookie.net/pokemongo/images/2/23/Location_Background_Road_Trip_2025_Manchester.png/revision/latest?cb=20250528232500",
  "Location Background Road Trip 2025 London": "https://static.wikia.nocookie.net/pokemongo/images/d/db/Location_Background_Road_Trip_2025_London.png/revision/latest?cb=20250528232645",
  "Location Background MLB Tampa Bay Rays": "https://static.wikia.nocookie.net/pokemongo/images/f/f6/Location_Background_MLB_Tampa_Bay_Rays.png/revision/latest?cb=20250625175736",
  "Location Background MLB Milwaukee Brewers": "https://static.wikia.nocookie.net/pokemongo/images/5/50/Location_Background_MLB_Milwaukee_Brewers.png/revision/latest?cb=20250626211008",
  "Location Background Road Trip 2025 Paris": "https://static.wikia.nocookie.net/pokemongo/images/c/c1/Location_Background_Road_Trip_2025_Paris.png/revision/latest?cb=20250528232907",
  "Location Background Jangheung Water Festival": "https://static.wikia.nocookie.net/pokemongo/images/3/30/Location_Background_Jangheung_Water_Festival.png/revision/latest?cb=20250710141753",
  "Location Background Road Trip 2025 Valencia": "https://static.wikia.nocookie.net/pokemongo/images/a/af/Location_Background_Road_Trip_2025_Valencia.png/revision/latest?cb=20250528233058",
  "Location Background MLB Washington Nationals": "https://static.wikia.nocookie.net/pokemongo/images/9/9a/Location_Background_MLB_Washington_Nationals.png/revision/latest?cb=20250625175806",
  "Location Background Road Trip 2025 Berlin": "https://static.wikia.nocookie.net/pokemongo/images/4/49/Location_Background_Road_Trip_2025_Berlin.png/revision/latest?cb=20250528233210",
  "Location Background MLB Arizona Diamondbacks": "https://static.wikia.nocookie.net/pokemongo/images/2/2e/Location_Background_MLB_Arizona_Diamondbacks.png/revision/latest?cb=20250626210934",
  "Location Background MLB Chicago White Sox": "https://static.wikia.nocookie.net/pokemongo/images/c/ce/Location_Background_MLB_Chicago_White_Sox.png/revision/latest?cb=20250626210954",
  "Location Background MLB Baltimore Orioles": "https://static.wikia.nocookie.net/pokemongo/images/3/3f/Location_Background_MLB_Baltimore_Orioles.png/revision/latest?cb=20250625175611",
  "Location Background MLB Cleveland Guardians": "https://static.wikia.nocookie.net/pokemongo/images/b/b0/Location_Background_MLB_Cleveland_Guardians.png/revision/latest?cb=20250501174742",
  "Location Background Anaheim": "https://static.wikia.nocookie.net/pokemongo/images/9/9a/Location_Background_Anaheim.png/revision/latest?cb=20250722185248",
  "Location Background Road Trip 2025 Hague": "https://static.wikia.nocookie.net/pokemongo/images/c/c4/Location_Background_Road_Trip_2025_Hague.png/revision/latest?cb=20250528233353",
  "Location Background Road Trip 2025 Cologne": "https://static.wikia.nocookie.net/pokemongo/images/f/f3/Location_Background_Road_Trip_2025_Cologne.png/revision/latest?cb=20250528234014",
  "Location Background MLB New York Mets": "https://static.wikia.nocookie.net/pokemongo/images/d/de/Location_Background_MLB_New_York_Mets.png/revision/latest?cb=20250625175658",
  "Location Background MLB Boston Red Sox": "https://static.wikia.nocookie.net/pokemongo/images/3/35/Location_Background_MLB_Boston_Red_Sox.png/revision/latest?cb=20250625175642",
  "Location Background MLB San Francisco Giants": "https://static.wikia.nocookie.net/pokemongo/images/8/80/Location_Background_MLB_San_Francisco_Giants.png/revision/latest?cb=20250625175712",
  "Location Background MLB Minnesota Twins": "https://static.wikia.nocookie.net/pokemongo/images/6/6d/Location_Background_MLB_Minnesota_Twins.png/revision/latest?cb=20250626211022",
  "Location Background MLB Texas Rangers": "https://static.wikia.nocookie.net/pokemongo/images/2/25/Location_Background_MLB_Texas_Rangers.png/revision/latest?cb=20250625175752",
  "Location Background Paris 2025": "https://static.wikia.nocookie.net/pokemongo/images/b/bd/Location_Background_Paris_2025.png/revision/latest?cb=20250901130232",
  "Location Background Paris 2025 2": "https://static.wikia.nocookie.net/pokemongo/images/e/e0/Location_Background_Paris_2025_2.png/revision/latest?cb=20250901130402",
  "Location Background City Safari Bangkok": "https://static.wikia.nocookie.net/pokemongo/images/f/f1/Location_Background_City_Safari_Bangkok.png/revision/latest?cb=20250901130447",
  "Location Background City Safari Amsterdam": "https://static.wikia.nocookie.net/pokemongo/images/d/d8/Location_Background_City_Safari_Amsterdam.png/revision/latest?cb=20250901130547",
  "Location Background City Safari Valencia": "https://static.wikia.nocookie.net/pokemongo/images/1/17/Location_Background_City_Safari_Valencia.png/revision/latest?cb=20251001235040",
  "Location Background City Safari Cancun": "https://static.wikia.nocookie.net/pokemongo/images/c/c4/Location_Background_City_Safari_Cancun.png/revision/latest?cb=20250901130713",
  "Location Background City Safari Vancouver": "https://static.wikia.nocookie.net/pokemongo/images/c/c3/Location_Background_City_Safari_Vancouver.png/revision/latest?cb=20250901130754",
  "Location Background Jeju Island Stamp Rally": "https://static.wikia.nocookie.net/pokemongo/images/4/40/Location_Background_Jeju_Island_Stamp_Rally.png/revision/latest?cb=20250919210009",
  "Location Background Taipei Childrens Amusement Park": "https://static.wikia.nocookie.net/pokemongo/images/b/b7/Location_Background_Taipei_Childrens_Amusement_Park.png/revision/latest?cb=20251023141701",
  "Location Background Wild Area Nagasaki": "https://static.wikia.nocookie.net/pokemongo/images/9/9f/Location_Background_Wild_Area_Nagasaki.png/revision/latest?cb=20251006211713",
  "Location Background Pokelid Fukuoka": "https://static.wikia.nocookie.net/pokemongo/images/d/d2/Location_Background_Pokelid_Fukuoka.png/revision/latest?cb=20251115114713",
  "Location Background Pokelid Kagoshima": "https://static.wikia.nocookie.net/pokemongo/images/c/cc/Location_Background_Pokelid_Kagoshima.png/revision/latest?cb=20251115114736",
  "Location Background Pokelid Miyazaki": "https://static.wikia.nocookie.net/pokemongo/images/3/39/Location_Background_Pokelid_Miyazaki.png/revision/latest?cb=20251115114600",
  "Location Background Pokelid Nagasaki": "https://static.wikia.nocookie.net/pokemongo/images/7/7c/Location_Background_Pokelid_Nagasaki.png/revision/latest?cb=20251115114606",
  "Location Background Pokelid Okinawa": "https://static.wikia.nocookie.net/pokemongo/images/a/a6/Location_Background_Pokelid_Okinawa.png/revision/latest?cb=20251115114621",
  "Location Background Pokelid Saga": "https://static.wikia.nocookie.net/pokemongo/images/1/13/Location_Background_Pokelid_Saga.png/revision/latest?cb=20251115114630",
  "Location Background City Safari Sydney": "https://static.wikia.nocookie.net/pokemongo/images/1/1c/Location_Background_City_Safari_Sydney.png/revision/latest?cb=20251214144626",
  "Location Background City Safari Buenos Aires": "https://static.wikia.nocookie.net/pokemongo/images/b/b6/Location_Background_City_Safari_Buenos_Aires.png/revision/latest?cb=20251214144641",
  "Location Background City Safari Miami": "https://static.wikia.nocookie.net/pokemongo/images/f/f9/Location_Background_City_Safari_Miami.png/revision/latest?cb=20251214144702",
  "Location Background NFL Arizona Cardinals": "https://static.wikia.nocookie.net/pokemongo/images/a/a4/Location_Background_NFL_Arizona_Cardinals.png/revision/latest?cb=20251222145653",
  "Location Background ID Car Free Day": "https://static.wikia.nocookie.net/pokemongo/images/2/2f/Location_Background_ID_Car_Free_Day.png/revision/latest?cb=20260108133357",
  "Location Background Pyeongchang Winter Festival": "https://static.wikia.nocookie.net/pokemongo/images/0/01/Location_Background_Pyeongchang_Winter_Festival.png/revision/latest?cb=20260119114151",
  "Location Background Pyeongchang Winter Festival old": "https://static.wikia.nocookie.net/pokemongo/images/5/51/Location_Background_Pyeongchang_Winter_Festival_old.png/revision/latest?cb=20251205175820",
  "Location Background Pokelid Aichi": "https://static.wikia.nocookie.net/pokemongo/images/7/7a/Location_Background_Pokelid_Aichi.png/revision/latest?cb=20251115114700",
  "Location Background Pokelid Akita": "https://static.wikia.nocookie.net/pokemongo/images/f/fd/Location_Background_Pokelid_Akita.png/revision/latest?cb=20251115114703",
  "Location Background Pokelid Aomori": "https://static.wikia.nocookie.net/pokemongo/images/2/22/Location_Background_Pokelid_Aomori.png/revision/latest?cb=20251115114705",
  "Location Background Pokelid Chiba": "https://static.wikia.nocookie.net/pokemongo/images/6/61/Location_Background_Pokelid_Chiba.png/revision/latest?cb=20251115114708",
  "Location Background Pokelid Ehime": "https://static.wikia.nocookie.net/pokemongo/images/f/fe/Location_Background_Pokelid_Ehime.png/revision/latest?cb=20260218135056",
  "Location Background Pokelid Fukui": "https://static.wikia.nocookie.net/pokemongo/images/7/7f/Location_Background_Pokelid_Fukui.png/revision/latest?cb=20251115114711",
  "Location Background Pokelid Fukushima": "https://static.wikia.nocookie.net/pokemongo/images/e/e1/Location_Background_Pokelid_Fukushima.png/revision/latest?cb=20251115114718",
  "Location Background Pokelid Gifu": "https://static.wikia.nocookie.net/pokemongo/images/9/94/Location_Background_Pokelid_Gifu.png/revision/latest?cb=20251115114721",
  "Location Background Pokelid Hokkaido": "https://static.wikia.nocookie.net/pokemongo/images/c/c9/Location_Background_Pokelid_Hokkaido.png/revision/latest?cb=20251115114724",
  "Location Background Pokelid Hyogo": "https://static.wikia.nocookie.net/pokemongo/images/b/b1/Location_Background_Pokelid_Hyogo.png/revision/latest?cb=20251115114726",
  "Location Background Pokelid Ibaraki": "https://static.wikia.nocookie.net/pokemongo/images/5/57/Location_Background_Pokelid_Ibaraki.png/revision/latest?cb=20251115114728",
  "Location Background Pokelid Ishikawa": "https://static.wikia.nocookie.net/pokemongo/images/1/1e/Location_Background_Pokelid_Ishikawa.png/revision/latest?cb=20251115114731",
  "Location Background Pokelid Iwate": "https://static.wikia.nocookie.net/pokemongo/images/e/e4/Location_Background_Pokelid_Iwate.png/revision/latest?cb=20251115114733",
  "Location Background Pokelid Kagawa": "https://static.wikia.nocookie.net/pokemongo/images/e/e7/Location_Background_Pokelid_Kagawa.png/revision/latest?cb=20260218135106",
  "Location Background Pokelid Kanagawa": "https://static.wikia.nocookie.net/pokemongo/images/f/f7/Location_Background_Pokelid_Kanagawa.png/revision/latest?cb=20251115114742",
  "Location Background Pokelid Kochi": "https://static.wikia.nocookie.net/pokemongo/images/8/8d/Location_Background_Pokelid_Kochi.png/revision/latest?cb=20260218135129",
  "Location Background Pokelid Kyoto": "https://static.wikia.nocookie.net/pokemongo/images/0/01/Location_Background_Pokelid_Kyoto.png/revision/latest?cb=20251115114744",
  "Location Background Pokelid Mie": "https://static.wikia.nocookie.net/pokemongo/images/a/a3/Location_Background_Pokelid_Mie.png/revision/latest?cb=20251115114553",
  "Location Background Pokelid Miyagi": "https://static.wikia.nocookie.net/pokemongo/images/0/08/Location_Background_Pokelid_Miyagi.png/revision/latest?cb=20251115114557",
  "Location Background Pokelid Nara": "https://static.wikia.nocookie.net/pokemongo/images/d/d4/Location_Background_Pokelid_Nara.png/revision/latest?cb=20251115114613",
  "Location Background Pokelid Niigata": "https://static.wikia.nocookie.net/pokemongo/images/b/b2/Location_Background_Pokelid_Niigata.png/revision/latest?cb=20251115114617",
  "Location Background Pokelid Okayama": "https://static.wikia.nocookie.net/pokemongo/images/e/e7/Location_Background_Pokelid_Okayama.png/revision/latest?cb=20260218135136",
  "Location Background Pokelid Osaka": "https://static.wikia.nocookie.net/pokemongo/images/b/b3/Location_Background_Pokelid_Osaka.png/revision/latest?cb=20251115114627",
  "Location Background Pokelid Saitama": "https://static.wikia.nocookie.net/pokemongo/images/7/77/Location_Background_Pokelid_Saitama.png/revision/latest?cb=20251115114637",
  "Location Background Pokelid Shiga": "https://static.wikia.nocookie.net/pokemongo/images/6/68/Location_Background_Pokelid_Shiga.png/revision/latest?cb=20251115114640",
  "Location Background Pokelid Shimane": "https://static.wikia.nocookie.net/pokemongo/images/d/d7/Location_Background_Pokelid_Shimane.png/revision/latest?cb=20260218135154",
  "Location Background Pokelid Shizuoka": "https://static.wikia.nocookie.net/pokemongo/images/a/aa/Location_Background_Pokelid_Shizuoka.png/revision/latest?cb=20251115114643",
  "Location Background Pokelid Tochigi": "https://static.wikia.nocookie.net/pokemongo/images/f/f1/Location_Background_Pokelid_Tochigi.png/revision/latest?cb=20251115114646",
  "Location Background Pokelid Tokushima": "https://static.wikia.nocookie.net/pokemongo/images/3/31/Location_Background_Pokelid_Tokushima.png/revision/latest?cb=20260218135201",
  "Location Background Pokelid Tokyo": "https://static.wikia.nocookie.net/pokemongo/images/2/23/Location_Background_Pokelid_Tokyo.png/revision/latest?cb=20251115114649",
  "Location Background Pokelid Tottori": "https://static.wikia.nocookie.net/pokemongo/images/e/e0/Location_Background_Pokelid_Tottori.png/revision/latest?cb=20260218135211",
  "Location Background Pokelid Toyama": "https://static.wikia.nocookie.net/pokemongo/images/5/50/Location_Background_Pokelid_Toyama.png/revision/latest?cb=20251115114652",
  "Location Background Pokelid Wakayama": "https://static.wikia.nocookie.net/pokemongo/images/e/e9/Location_Background_Pokelid_Wakayama.png/revision/latest?cb=20251115114655",
  "Location Background Pokelid Yamagata": "https://static.wikia.nocookie.net/pokemongo/images/a/a1/Location_Background_Pokelid_Yamagata.png/revision/latest?cb=20251115114657",
  "Location Background Pokelid Yamaguchi": "https://static.wikia.nocookie.net/pokemongo/images/d/da/Location_Background_Pokelid_Yamaguchi.png/revision/latest?cb=20260218135225",
  "Location Background Cologne": "https://static.wikia.nocookie.net/pokemongo/images/4/41/Location_Background_Cologne.png/revision/latest?cb=20260204142906",
  "Location Background Rio de Janeiro": "https://static.wikia.nocookie.net/pokemongo/images/e/eb/Location_Background_Rio_de_Janeiro.png/revision/latest?cb=20260204142930",
  "Location Background Pokemon Park": "https://static.wikia.nocookie.net/pokemongo/images/4/49/Location_Background_Pokemon_Park.png/revision/latest?cb=20260119120040",
  "Location Background Los Angeles 2026": "https://static.wikia.nocookie.net/pokemongo/images/a/a2/Location_Background_Los_Angeles_2026.png/revision/latest?cb=20260219211610",
  "Location Background Tainan 2026": "https://static.wikia.nocookie.net/pokemongo/images/0/08/Location_Background_Tainan_2026.png/revision/latest?cb=20260219211904",
  "Location Background Taipei Floral Picnic 2026": "https://static.wikia.nocookie.net/pokemongo/images/f/f5/Location_Background_Taipei_Floral_Picnic_2026.png/revision/latest?cb=20260310171736",
  "Location Background NPB 2026 Yomiuri Giants": "https://static.wikia.nocookie.net/pokemongo/images/5/59/Location_Background_NPB_2026_Yomiuri_Giants.png/revision/latest?cb=20260403153456",
  "Location Background NPB 2026 Rakuten Eagles": "https://static.wikia.nocookie.net/pokemongo/images/f/fe/Location_Background_NPB_2026_Rakuten_Eagles.png/revision/latest?cb=20260403153528",
  "Location Background NPB 2026 Koshien Hanshin Tigers": "https://static.wikia.nocookie.net/pokemongo/images/d/d0/Location_Background_NPB_2026_Koshien_Hanshin_Tigers.png/revision/latest?cb=20260403153604",
  "Location Background NPB 2026 Hiroshima Carp": "https://static.wikia.nocookie.net/pokemongo/images/e/ef/Location_Background_NPB_2026_Hiroshima_Carp.png/revision/latest?cb=20260403153629",
  "Location Background NPB 2026 Softbank Hawks": "https://static.wikia.nocookie.net/pokemongo/images/7/7f/Location_Background_NPB_2026_Softbank_Hawks.png/revision/latest?cb=20260403153701",
  "Location Background NPB 2026 Zozo Marine": "https://static.wikia.nocookie.net/pokemongo/images/4/46/Location_Background_NPB_2026_Zozo_Marine.png/revision/latest?cb=20260508202032",
  "Location Background NPB 2026 Yokohama Stadium": "https://static.wikia.nocookie.net/pokemongo/images/a/af/Location_Background_NPB_2026_Yokohama_Stadium.png/revision/latest?cb=20260508202111",
  "Location Background GO Fest 2026 Tokyo": "https://static.wikia.nocookie.net/pokemongo/images/0/05/Location_Background_GO_Fest_2026_Tokyo.png/revision/latest?cb=20260429132230",
  "Location Background GO Fest 2026 Chicago": "https://static.wikia.nocookie.net/pokemongo/images/2/2e/Location_Background_GO_Fest_2026_Chicago.png/revision/latest?cb=20260429132307",
  "Location Background NPB 2026 Hokkaido Fighters": "https://static.wikia.nocookie.net/pokemongo/images/b/b7/Location_Background_NPB_2026_Hokkaido_Fighters.png/revision/latest?cb=20260508202128",
  "Location Background NPB 2026 Chunichi Dragons": "https://static.wikia.nocookie.net/pokemongo/images/2/2e/Location_Background_NPB_2026_Chunichi_Dragons.png/revision/latest?cb=20260508202142",
  "Location Background Busan Fireworks Festival 2025": "https://static.wikia.nocookie.net/pokemongo/images/a/ac/Location_Background_Busan_Fireworks_Festival_2025.png/revision/latest?cb=20251001205322",
  "Location Background GO Fest 2026 Copenhagen": "https://static.wikia.nocookie.net/pokemongo/images/5/58/Location_Background_GO_Fest_2026_Copenhagen.png/revision/latest?cb=20260429132408",
  "Special Background GO Fest 2026 Mewtwo": "https://static.wikia.nocookie.net/pokemongo/images/4/43/Special_Background_GO_Fest_2026_Mewtwo.png/revision/latest?cb=20260429132424",
  "Special Background GO Fest 2026 Global": "https://static.wikia.nocookie.net/pokemongo/images/f/f8/Special_Background_GO_Fest_2026_Global.png/revision/latest?cb=20260429132438",
  "Location Background TokMun Koto": "https://static.wikia.nocookie.net/pokemongo/images/8/82/Location_Background_TokMun_Koto.png/revision/latest?cb=20260508202759",
  "Location Background TokMun Minato": "https://static.wikia.nocookie.net/pokemongo/images/2/21/Location_Background_TokMun_Minato.png/revision/latest?cb=20260508202817",
  "Location Background TokMun Shinagawa": "https://static.wikia.nocookie.net/pokemongo/images/3/3b/Location_Background_TokMun_Shinagawa.png/revision/latest?cb=20260508202830",
  "Special Background LEGO": "https://static.wikia.nocookie.net/pokemongo/images/7/70/Special_Background_LEGO.png/revision/latest?cb=20260528130655"
};



function getTypeIconSvg(type) {
  const pathMap = {
    Normal: "M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z",
    Fire: "M12,2C12,2,8,6.5,8,10.5C8,13.5,10,15.5,12,15.5C14,15.5,16,13.5,16,10.5C16,6.5,12,2,12,2ZM12,6C12,6,10,8.5,10,10.5C10,12,11,13,12,13C13,13,14,12,14,10.5C14,8.5,12,6,12,6Z",
    Water: "M12,2.5C12,2.5,6,10,6,14C6,17.3,8.7,20,12,20C15.3,20,18,17.3,18,14C18,10,12,2.5,12,2.5ZM12,17.5C10.1,17.5,8.5,15.9,8.5,14C8.5,12.5,10.5,8.5,12,6.5C13.5,8.5,15.5,12.5,15.5,14C15.5,15.9,13.9,17.5,12,17.5Z",
    Grass: "M17,3H14C9.5,3,6,6.5,6,11C6,14.5,8,17.5,11,19C11,19,12,17,12,15C12,13,10,12,10,9C10,6.5,12,5,15,5H17V3ZM18,7C18,7,17,9,15,10C13,11,13,13,14,15C15,17,18,18,18,18C18,18,20,14,20,11C20,8,18,7,18,7Z",
    Electric: "M11,21L13,13H19L10,3L8,11H3L11,21Z",
    Ice: "M12,2V22M2,12H22M5,5L19,19M19,5L5,19",
    Fighting: "M5,10V18A2,2,0,0,0,7,20H13A3,3,0,0,0,16,17V11H12V9H8V10ZM16,8H19A2,2,0,0,1,21,10V14A2,2,0,0,1,19,16H18V10H16Z",
    Poison: "M12,2A7,7,0,0,0,5,9C5,12,7.5,15,9,17V20A1,1,0,0,0,10,21H14A1,1,0,0,0,15,20V17C16.5,15,19,12,19,9A7,7,0,0,0,12,2ZM9,9A1.5,1.5,0,1,1,10.5,10.5,1.5,1.5,0,0,1,9,9ZM15,9A1.5,1.5,0,1,1,16.5,10.5,1.5,1.5,0,0,1,15,9Z",
    Ground: "M12,5L3,15H21L12,5ZM12,9L17,14.5H7L12,9ZM2,19H22V21H2V19Z",
    Flying: "M12,4C9,4,3,8,3,13C3,17,7,20,12,20C17,20,21,17,21,13C21,8,15,4,12,4ZM12,18C8.5,18,5.5,16,5.5,13C5.5,11,8,8,12,6.5C16,8,18.5,11,18.5,13C18.5,16,15.5,18,12,18Z",
    Psychic: "M12,4.5C7,4.5,2.7,7.7,1,12C2.7,16.3,7,19.5,12,19.5C17,19.5,21.3,16.3,23,12C21.3,7.7,17,4.5,12,4.5ZM12,17C9.2,17,7,14.8,7,12C7,9.2,9.2,7,12,7C14.8,7,17,9.2,17,12C17,14.8,14.8,17,12,17ZM12,9.5A2.5,2.5,0,1,0,14.5,12,2.5,2.5,0,0,0,12,9.5Z",
    Bug: "M12,2C10.9,2,10,2.9,10,4V5.1C7.2,5.6,5,8,5,11V16C5,19.3,7.7,22,11,22H13C16.3,22,19,19.3,19,16V11C19,8,16.8,5.6,14,5.1V4C14,2.9,13.1,2,12,2ZM9,11C9,9.3,10.3,8,12,8C13.7,8,15,9.3,15,11V16C15,17.7,13.7,19,12,19C10.3,19,9,17.7,9,16V11Z",
    Rock: "M12,2L2,9L4,19L12,22L20,19L22,9L12,2ZM12,6L18,10L12,14L6,10L12,6ZM6.2,12L10.5,15L8.5,19L4.8,17L6.2,12ZM17.8,12L19.2,17L15.5,19L13.5,15L17.8,12Z",
    Ghost: "M12,2C7.6,2,4,5.6,4,10V20L8,17L12,20L16,17L20,20V10C20,5.6,16.4,2,12,2ZM9,11A1.5,1.5,0,1,1,10.5,12.5,1.5,1.5,0,0,1,9,11ZM15,11A1.5,1.5,0,1,1,16.5,12.5,1.5,1.5,0,0,1,15,11Z",
    Dragon: "M12,2C6.5,2,2,6.5,2,12C2,17.5,6.5,22,12,22C17.5,22,22,17.5,22,12C22,9,20.5,6,18,4L15,8L12,2ZM12,6L14,10L9,8L12,6ZM9,11L15,12L12,15L9,11Z",
    Steel: "M12,2L4,5V11C4,16.5,8,21,12,22C16,21,20,16.5,20,11V5L12,2ZM12,19.5C9.5,18.5,6,15,6,11V6.5L12,4.2L18,6.5V11C18,15,14.5,18.5,12,19.5Z",
    Fairy: "M12,2L14.5,8.5L21,11L14.5,13.5L12,20L9.5,13.5L3,11L9.5,8.5L12,2Z",
    Dark: "M12,2A10,10,0,0,0,2,12A10,10,0,0,0,12,22A10,10,0,0,0,18,20.2A9,9,0,0,1,10.5,12A9,9,0,0,1,18,3.8A10,10,0,0,0,12,2Z"
  };
  const path = pathMap[type] || "M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Z";
  
  if (type === 'Ice') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${path}"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg>`;
}

function getTypeBadgeHtml(type, extraStyle = "") {
  const typeUpper = type.toUpperCase();
  const iconUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_${typeUpper}.png`;
  return `<span class="type-badge type-${type}" style="${extraStyle}"><img src="${iconUrl}" alt="${type}" class="type-badge-icon" onerror="this.style.display='none';">${type}</span>`;
}

function getTypeLogoOnlyHtml(type, extraStyle = "") {
  const typeUpper = type.toUpperCase();
  const iconUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_${typeUpper}.png`;
  return `<img src="${iconUrl}" alt="${type}" class="type-logo-only" title="${type}" style="width: 22px; height: 22px; object-fit: contain; vertical-align: middle; ${extraStyle}" onerror="this.style.display='none';">`;
}

function resolveUserAvatar(profile, session) {
  let avatarUrl = (profile && profile.avatarCustomUrl) || (session && session.user && session.user.user_metadata && session.user.user_metadata.avatar_url);
  const isDefaultBlank = !avatarUrl || avatarUrl.includes('blank-profile-picture') || avatarUrl === '';
  
  const pokeballAvatar = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%2310121a' stroke-width='4'/%3E%3Cpath d='M 2 50 A 48 48 0 0 1 98 50 Z' fill='%23e74c3c' stroke='%2310121a' stroke-width='4'/%3E%3Cline x1='2' y1='50' x2='98' y2='50' stroke='%2310121a' stroke-width='8'/%3E%3Ccircle cx='50' cy='50' r='16' fill='%23ffffff' stroke='%2310121a' stroke-width='8'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%23ffffff'/%3E%3C/svg%3E";
  
  if (isDefaultBlank) {
    return pokeballAvatar;
  }
  return avatarUrl;
}

function lockBodyScroll() {
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  const detailOpen = document.getElementById('detail-modal')?.style.display === 'flex';
  const authOpen = document.getElementById('auth-modal')?.style.display === 'flex';
  const profileOpen = document.getElementById('profile-modal')?.style.display === 'flex';
  const bgOpen = document.getElementById('backgrounds-popup')?.style.display === 'flex';
  
  if (!detailOpen && !authOpen && !profileOpen && !bgOpen) {
    document.body.classList.remove('modal-open');
  }
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    lockBodyScroll();
    const errEl = document.getElementById('auth-error-msg');
    const succEl = document.getElementById('auth-success-msg');
    if (errEl) errEl.style.display = 'none';
    if (succEl) succEl.style.display = 'none';
  }
}

function closeAuthModal(event) {
  if (!event || event.target.id === 'auth-modal' || event.target.className === 'close-modal-btn') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      unlockBodyScroll();
    }
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
  if (!supabaseClient) {
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
    const { error } = await supabaseClient.auth.signInWithOAuth({
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
  
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error-msg');
  const succEl = document.getElementById('auth-success-msg');
  
  if (errEl) errEl.style.display = 'none';
  if (succEl) succEl.style.display = 'none';

  // Intercept predefined Guest Credentials
  if (email.toLowerCase() === 'guest@tracker.com' && password === 'guestpassword123') {
    signInAsGuest(email);
    return;
  }
  
  const normEmail = email.toLowerCase();
  const isAdminCredentials = (
    (normEmail === 'admin' && password === 'admin123') ||
    (normEmail === 'admin@pokedex.com' && password === 'admin123') ||
    (normEmail === 'admin@tracker.com' && password === 'admin123') ||
    (normEmail === 'admin-dev-99@tracker.com' && password === 'adminSecurePass77!')
  );
  
  if (isAdminCredentials) {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile) {
      showAuthError("Admin login is only available on desktop devices.");
      return;
    }
    signInAsAdmin();
    return;
  }

  if (!supabaseClient) {
    alert("Supabase is not configured. Please use guest credentials (guest@tracker.com / guestpassword123) or add your credentials in config.js.");
    return;
  }

  // Force Google OAuth for Gmail accounts to facilitate Google Drive sync
  if (email.toLowerCase().endsWith('@gmail.com')) {
    showAuthError("Gmail accounts must use the 'Sign In with Google' button to store data in Google Drive.");
    return;
  }

  try {
    if (currentAuthMode === 'login') {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      console.log("Logged in successfully:", data);
      closeAuthModal(null);
    } else {
      const { data, error } = await supabaseClient.auth.signUp({
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

function handleGuestBeforeUnload(e) {
  if (currentUserSession && currentUserSession.user.id === "guest-user-123") {
    e.preventDefault();
    e.returnValue = 'Warning: You are in Demo Mode. Any changes you make will be lost when you refresh or close this page.';
    return e.returnValue;
  }
}

function signInAsGuest(email, shouldSave = true) {
  const session = {
    user: {
      id: "guest-user-123",
      email: email || "guest@tracker.com",
      user_metadata: {
        full_name: "Guest Trainer",
        avatar_url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      }
    },
    provider_token: null
  };
  
  currentUserSession = session;
  activeSyncProvider = 'local';
  
  if (shouldSave) {
    localStorage.setItem('pokego_tracker_guest_session', session.user.email);
    alert("Warning: You are entering Demo Mode. No data will be saved to your browser or cloud database. Any changes you make will be lost when you refresh or close this page.");
  }
  
  // Bind beforeunload confirmation warning
  window.addEventListener('beforeunload', handleGuestBeforeUnload);
  
  // Update UI elements
  const loggedOutEl = document.getElementById('auth-logged-out');
  const loggedInEl = document.getElementById('auth-logged-in');
  const syncStatusEl = document.getElementById('cloud-sync-status');
  
  if (loggedOutEl) loggedOutEl.style.display = 'none';
  if (loggedInEl) loggedInEl.style.display = 'flex';
  
  // Apply profile values from state if customized
  const profile = state.trainerProfile || {};
  const displayName = profile.username || session.user.user_metadata.full_name;
  const avatarUrl = resolveUserAvatar(profile, session);
  
  const nameEl = document.getElementById('user-display-name');
  const emailEl = document.getElementById('user-email-subtitle');
  const avatarEl = document.getElementById('user-avatar');
  
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = session.user.email;
  if (avatarEl) avatarEl.src = avatarUrl;
  
  if (syncStatusEl) {
    syncStatusEl.style.display = 'flex';
    updateSyncStatusIndicator('synced', 'Offline Guest Mode');
  }
  
  // Apply team theme if customized
  if (profile.team && profile.team !== 'None') {
    applyTeamTheme(profile.team);
  }
  
  closeAuthModal(null);
  
  // Unlock UI inputs for guest
  lockUIForLoggedOutUsers();
  
  // Render views that might depend on user session
  renderPokedex();
  renderLevelTracker();
  renderMedalTracker();
  renderFriendsTracker();
  renderItemInventory();
}

function signInAsAdmin(shouldSave = true) {
  const session = {
    user: {
      id: "admin-user-123",
      email: "admin@pokedex.com",
      user_metadata: {
        full_name: "Admin Developer",
        avatar_url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      }
    },
    provider_token: null
  };
  
  currentUserSession = session;
  activeSyncProvider = 'local';
  
  if (shouldSave) {
    localStorage.setItem('pokego_tracker_admin_session', 'true');
  }
  
  // Update UI elements
  const loggedOutEl = document.getElementById('auth-logged-out');
  const loggedInEl = document.getElementById('auth-logged-in');
  const syncStatusEl = document.getElementById('cloud-sync-status');
  
  if (loggedOutEl) loggedOutEl.style.display = 'none';
  if (loggedInEl) loggedInEl.style.display = 'flex';
  
  const nameEl = document.getElementById('user-display-name');
  const emailEl = document.getElementById('user-email-subtitle');
  const avatarEl = document.getElementById('user-avatar');
  
  if (nameEl) nameEl.textContent = "Admin Developer";
  if (emailEl) emailEl.textContent = "admin@pokedex.com";
  if (avatarEl) avatarEl.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  
  if (syncStatusEl) {
    syncStatusEl.style.display = 'flex';
    updateSyncStatusIndicator('synced', 'Admin Session');
  }
  
  // Show admin navigation link
  const adminNav = document.getElementById('nav-admin');
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (adminNav) {
    if (isMobile) {
      adminNav.style.display = 'none';
    } else {
      adminNav.style.display = 'flex';
    }
  }
  
  closeAuthModal(null);
  
  // Unlock UI inputs for admin
  lockUIForLoggedOutUsers();
  
  // Render views
  renderPokedex();
  renderLevelTracker();
  renderMedalTracker();
  renderFriendsTracker();
  renderItemInventory();
}

function applyTeamTheme(team) {
  const container = document.querySelector('.sidebar');
  if (!container) return;
  
  // Remove existing team themes
  container.classList.remove('theme-mystic', 'theme-instinct', 'theme-valor');
  document.body.classList.remove('theme-mystic', 'theme-instinct', 'theme-valor');
  
  const root = document.documentElement;
  
  if (team === 'Mystic') {
    container.classList.add('theme-mystic');
    document.body.classList.add('theme-mystic');
    root.style.setProperty('--color-primary', '#3498db');
    root.style.setProperty('--color-primary-glow', 'rgba(52, 152, 219, 0.4)');
    root.style.setProperty('--color-secondary', '#2980b9');
    root.style.setProperty('--color-secondary-glow', 'rgba(41, 128, 185, 0.4)');
    root.style.setProperty('--color-accent', '#5dade2');
  } else if (team === 'Instinct') {
    container.classList.add('theme-instinct');
    document.body.classList.add('theme-instinct');
    root.style.setProperty('--color-primary', '#f1c40f');
    root.style.setProperty('--color-primary-glow', 'rgba(241, 196, 15, 0.4)');
    root.style.setProperty('--color-secondary', '#d35400');
    root.style.setProperty('--color-secondary-glow', 'rgba(211, 84, 0, 0.4)');
    root.style.setProperty('--color-accent', '#f39c12');
  } else if (team === 'Valor') {
    container.classList.add('theme-valor');
    document.body.classList.add('theme-valor');
    root.style.setProperty('--color-primary', '#e74c3c');
    root.style.setProperty('--color-primary-glow', 'rgba(231, 76, 60, 0.4)');
    root.style.setProperty('--color-secondary', '#c0392b');
    root.style.setProperty('--color-secondary-glow', 'rgba(192, 57, 43, 0.4)');
    root.style.setProperty('--color-accent', '#e67e22');
  } else {
    // Reset to default Cyber theme
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-primary-glow');
    root.style.removeProperty('--color-secondary');
    root.style.removeProperty('--color-secondary-glow');
    root.style.removeProperty('--color-accent');
  }
}

function openProfileModal() {
  if (!currentUserSession) {
    alert("Please sign in or use the Guest login first to customize your trainer profile.");
    return;
  }
  
  const modal = document.getElementById('profile-modal');
  if (!modal) return;
  
  // Pre-fill form values from state
  const profile = state.trainerProfile || { username: "", team: "None", birthday: "", avatarCustomUrl: "", trainerCode: "" };
  document.getElementById('profile-username').value = profile.username || '';
  document.getElementById('profile-birthday').value = profile.birthday || '';
  
  // Set date picker max to today - 13 years
  const today = new Date();
  const maxYear = today.getFullYear() - 13;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const maxDateStr = `${maxYear}-${month}-${day}`;
  const birthdayInput = document.getElementById('profile-birthday');
  if (birthdayInput) {
    birthdayInput.max = maxDateStr;
  }
  document.getElementById('profile-avatar-url').value = profile.avatarCustomUrl || '';
  
  const trainerCodeInput = document.getElementById('profile-trainer-code');
  if (trainerCodeInput) {
    trainerCodeInput.value = formatTrainerCodeStr(profile.trainerCode || '');
  }
  
  const userIdEl = document.getElementById('profile-user-id');
  if (userIdEl) {
    userIdEl.textContent = currentUserSession ? currentUserSession.user.id : 'guest-user-123';
  }
  
  const finalAvatar = resolveUserAvatar(profile, currentUserSession);
  const previewImg = document.getElementById('profile-avatar-preview');
  if (previewImg) previewImg.src = finalAvatar;
  
  // Highlight predefined choice if it matches
  document.querySelectorAll('.avatar-choice-img').forEach(img => {
    if (img.src === profile.avatarCustomUrl) {
      img.style.borderColor = 'var(--color-primary)';
      img.style.transform = 'scale(1.1)';
    } else {
      img.style.borderColor = 'transparent';
      img.style.transform = 'none';
    }
  });
  
  // Configure password reset subform visibility
  const pwSection = document.getElementById('profile-password-section');
  if (pwSection) {
    const isStandardUser = supabaseClient && currentUserSession && currentUserSession.user.id !== "guest-user-123";
    const isGoogleUser = currentUserSession && (
      currentUserSession.user.app_metadata?.provider === 'google' || 
      currentUserSession.user.identities?.some(id => id.provider === 'google')
    );
    pwSection.style.display = (isStandardUser && !isGoogleUser) ? 'block' : 'none';
  }
  
  // Select radio button
  const radios = document.getElementsByName('profile-team');
  radios.forEach(r => {
    if (r.value === profile.team) {
      r.checked = true;
    } else {
      r.checked = false;
    }
  });
  
  modal.style.display = 'flex';
  lockBodyScroll();
}

function closeProfileModal(event) {
  if (!event || event.target.id === 'profile-modal' || event.target.className === 'close-modal-btn') {
    const modal = document.getElementById('profile-modal');
    if (modal) {
      modal.style.display = 'none';
      unlockBodyScroll();
    }
  }
}

function selectPredefinedAvatar(src) {
  const input = document.getElementById('profile-avatar-url');
  const preview = document.getElementById('profile-avatar-preview');
  if (input) input.value = src;
  if (preview) preview.src = src;
  
  // Highlight selected choice image
  document.querySelectorAll('.avatar-choice-img').forEach(img => {
    if (img.src === src) {
      img.style.borderColor = 'var(--color-primary)';
      img.style.transform = 'scale(1.1)';
    } else {
      img.style.borderColor = 'transparent';
      img.style.transform = 'none';
    }
  });
}

function formatTrainerCodeStr(value) {
  let clean = value.replace(/\D/g, '');
  if (clean.length > 12) clean = clean.slice(0, 12);
  let formatted = '';
  if (clean.length > 0) formatted += clean.substring(0, 4);
  if (clean.length > 4) formatted += ' ' + clean.substring(4, 8);
  if (clean.length > 8) formatted += ' ' + clean.substring(8, 12);
  return formatted;
}

let activeTrainerCodesCache = [];

async function updateActiveTrainerCodes() {
  try {
    const urls = [
      'https://corsproxy.io/?' + encodeURIComponent('https://fcswap.com/game/pokemon-go/'),
      'https://corsproxy.io/?' + encodeURIComponent('https://www.pokemongofriendcodes.com/')
    ];
    
    let allCodes = [];
    for (const proxyUrl of urls) {
      try {
        const res = await fetch(proxyUrl);
        if (!res.ok) continue;
        const text = await res.text();
        const matches = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b|\b\d{12}\b/g);
        if (matches) {
          matches.forEach(m => {
            const digits = m.replace(/\s+/g, '');
            if (digits.length === 12 && !isDummyTrainerCode(digits)) {
              allCodes.push(digits);
            }
          });
        }
      } catch (err) {
        console.warn("Proxy scrape failed for: " + proxyUrl, err);
      }
    }
    
    if (allCodes.length > 0) {
      activeTrainerCodesCache = [...new Set(allCodes)];
      localStorage.setItem('pokego_active_trainer_codes', JSON.stringify(activeTrainerCodesCache));
      localStorage.setItem('pokego_active_trainer_codes_time', Date.now().toString());
      console.log(`Successfully scraped and cached ${activeTrainerCodesCache.length} active trainer codes.`);
    }
  } catch (e) {
    console.error("Failed to update active trainer codes:", e);
  }
}

function isDummyTrainerCode(code) {
  const clean = code.replace(/\s+/g, '');
  if (clean.length !== 12) return true;
  if (/^(\d)\1{11}$/.test(clean)) return true; // All same digits like 000000000000
  if (clean === '123456789012' || clean === '012345678901' || clean === '987654321098' || clean === '111111111111' || clean === '121212121212') return true;
  return false;
}

function validateTrainerFriendCode(code) {
  const clean = code.replace(/\s+/g, '');
  if (clean.length !== 12) {
    return { valid: false, reason: "Trainer Code must be exactly 12 digits." };
  }
  if (isDummyTrainerCode(clean)) {
    return { valid: false, reason: "Dummy or repetitive codes (like all zeroes or sequential digits) are not allowed." };
  }
  
  // Check against cache
  const cached = localStorage.getItem('pokego_active_trainer_codes');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.includes(clean)) {
        return { valid: true, verified: true };
      }
    } catch (e) {}
  }
  
  return { valid: true, verified: false }; // Valid format, but not in public database
}

async function updateTrainerPassword() {
  const newPassword = document.getElementById('profile-new-password').value;
  const confirmPassword = document.getElementById('profile-confirm-password').value;
  const errorDiv = document.getElementById('profile-password-error');
  
  if (errorDiv) errorDiv.style.display = 'none';
  
  if (!newPassword || newPassword.length < 6) {
    if (errorDiv) {
      errorDiv.textContent = "Password must be at least 6 characters long.";
      errorDiv.style.display = 'block';
    }
    return;
  }
  
  if (newPassword !== confirmPassword) {
    if (errorDiv) {
      errorDiv.textContent = "Passwords do not match.";
      errorDiv.style.display = 'block';
    }
    return;
  }
  
  if (!supabaseClient) return;
  
  try {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) throw error;
    
    alert("Password updated successfully!");
    document.getElementById('profile-new-password').value = '';
    document.getElementById('profile-confirm-password').value = '';
  } catch (err) {
    console.error("Password update failed:", err);
    if (errorDiv) {
      errorDiv.textContent = err.message || "Failed to update password.";
      errorDiv.style.display = 'block';
    }
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function lockUIForLoggedOutUsers() {
  const isLoggedIn = currentUserSession !== null;
  
  const fields = [
    'input-item-cap',
    'input-storage-cap',
    'input-storage-used',
    'friend-name-input',
    'friend-code-input',
    'friend-level-select',
    'friend-days-input',
    'friend-vivillon-select',
    'btn-add-friend'
  ];
  
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !isLoggedIn;
  });

  // Toggle storage & battle lock overlays
  const storageContent = document.getElementById('storage-manager-content');
  const storageOverlay = document.getElementById('storage-lock-overlay');
  const battleContent = document.getElementById('battle-parties-content');
  const battleOverlay = document.getElementById('battle-lock-overlay');

  if (isLoggedIn) {
    if (storageContent) storageContent.style.display = 'block';
    if (storageOverlay) storageOverlay.style.display = 'none';
    if (battleContent) battleContent.style.display = 'block';
    if (battleOverlay) battleOverlay.style.display = 'none';
  } else {
    if (storageContent) storageContent.style.display = 'none';
    if (storageOverlay) storageOverlay.style.display = 'flex';
    if (battleContent) battleContent.style.display = 'none';
    if (battleOverlay) battleOverlay.style.display = 'flex';
  }

  if (!isLoggedIn) {
    state.trainerLevel = 1;
    
    const lvlSelect = document.getElementById('level-select');
    if (lvlSelect) lvlSelect.value = 1;
    
    const targetLvlSelect = document.getElementById('select-target-level');
    if (targetLvlSelect) targetLvlSelect.value = 50;

    const statTrainerLvl = document.getElementById('stat-trainer-level');
    if (statTrainerLvl) statTrainerLvl.textContent = "Level 1";

    renderLevelTracker();
  }
}

async function saveTrainerProfile(event) {
  if (event) event.preventDefault();
  
  const username = document.getElementById('profile-username').value.trim();
  const birthday = document.getElementById('profile-birthday').value;
  const avatarUrl = document.getElementById('profile-avatar-url').value.trim();
  
  // Validate birthday age >= 13 years old
  const birthdayError = document.getElementById('profile-birthday-error');
  if (birthday) {
    const bDate = new Date(birthday);
    const today = new Date();
    const ageLimitDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (bDate > ageLimitDate) {
      if (birthdayError) {
        birthdayError.textContent = "Only users above age 13 are allowed to create a profile.";
        birthdayError.style.display = 'block';
      } else {
        alert("Only users above age 13 are allowed to create a profile.");
      }
      return;
    } else {
      if (birthdayError) birthdayError.style.display = 'none';
    }
  }
  
  let team = "None";
  const radios = document.getElementsByName('profile-team');
  radios.forEach(r => {
    if (r.checked) team = r.value;
  });
  
  const trainerCodeInput = document.getElementById('profile-trainer-code');
  const trainerCodeRaw = trainerCodeInput ? trainerCodeInput.value.replace(/\s+/g, '') : '';
  
  // Validate Trainer Code
  if (trainerCodeRaw) {
    const val = validateTrainerFriendCode(trainerCodeRaw);
    const errorLabel = document.getElementById('profile-code-error');
    if (!val.valid) {
      if (errorLabel) {
        errorLabel.textContent = val.reason;
        errorLabel.style.display = 'block';
      }
      return;
    } else {
      if (errorLabel) errorLabel.style.display = 'none';
    }
  }
  
  // Unique username check in Supabase
  if (username && supabaseClient && currentUserSession && currentUserSession.user.id !== "guest-user-123") {
    try {
      const { data, error } = await supabaseClient
        .from('user_states')
        .select('user_id, state')
        .neq('user_id', currentUserSession.user.id);
        
      if (error) throw error;
      
      const usernameExists = data.some(row => {
        const rowProfile = row.state?.trainerProfile;
        return rowProfile && rowProfile.username && rowProfile.username.toLowerCase() === username.toLowerCase();
      });
      
      if (usernameExists) {
        alert("Trainer username is already taken by another user. Please choose a different one.");
        return;
      }
    } catch (err) {
      console.error("Error checking unique username:", err);
    }
  }
  
  // Save to state
  state.trainerProfile = {
    username: username,
    team: team,
    birthday: birthday,
    avatarCustomUrl: avatarUrl,
    trainerCode: trainerCodeRaw
  };
  
  saveState();
  
  // Apply changes to UI
  const displayName = username || (currentUserSession ? currentUserSession.user.user_metadata.full_name : "Trainer");
  const finalAvatar = resolveUserAvatar(state.trainerProfile, currentUserSession);
  
  const nameEl = document.getElementById('user-display-name');
  const avatarEl = document.getElementById('user-avatar');
  
  if (nameEl) nameEl.textContent = displayName;
  if (avatarEl) avatarEl.src = finalAvatar;
  
  applyTeamTheme(team);
  
  closeProfileModal(null);
}

async function handleLogout() {
  if (currentUserSession && (currentUserSession.user.id === "guest-user-123" || currentUserSession.user.id === "admin-user-123")) {
    currentUserSession = null;
    localStorage.removeItem('pokego_tracker_guest_session');
    localStorage.removeItem('pokego_tracker_admin_session');
    window.removeEventListener('beforeunload', handleGuestBeforeUnload);
    window.location.reload();
    return;
  }
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.auth.signOut();
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
    const { data, error } = await supabaseClient
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
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
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
  pokemonCollection: {}, // { id: { owned, shiny, shadow, lucky, hundo, mega, max, caughtForms } }
  trainerLevel: 1,       
  levelTasks: {},        
  currentXP: 0,   
  targetLevel: 50,
  dailyXPGain: 150000,
  trainerProfile: {
    username: "",
    team: "None",
    birthday: "",
    avatarCustomUrl: ""
  },
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
    lucky_egg: 6, star_piece: 10, incense: 8, lure_module: 4,
    glacial_lure: 1, mossy_lure: 1, magnetic_lure: 1, rainy_lure: 1, golden_lure: 1, zygarde_cell: 0
  },
  battleParties: []
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
  { id: "kanto", name: "Kanto", desc: "Register Pokémon first discovered in Kanto.", category: "region", bronze: 10, silver: 50, gold: 100, platinum: 151, icon: "fa-solid fa-map-location-dot" },
  { id: "johto", name: "Johto", desc: "Register Pokémon first discovered in Johto.", category: "region", bronze: 10, silver: 30, gold: 70, platinum: 100, icon: "fa-solid fa-map-location-dot" },
  { id: "hoenn", name: "Hoenn", desc: "Register Pokémon first discovered in Hoenn.", category: "region", bronze: 10, silver: 40, gold: 90, platinum: 135, icon: "fa-solid fa-map-location-dot" },
  { id: "sinnoh", name: "Sinnoh", desc: "Register Pokémon first discovered in Sinnoh.", category: "region", bronze: 10, silver: 30, gold: 80, platinum: 107, icon: "fa-solid fa-map-location-dot" },
  { id: "unova", name: "Unova", desc: "Register Pokémon first discovered in Unova.", category: "region", bronze: 10, silver: 50, gold: 100, platinum: 156, icon: "fa-solid fa-map-location-dot" },
  { id: "kalos", name: "Kalos", desc: "Register Pokémon first discovered in Kalos.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 72, icon: "fa-solid fa-map-location-dot" },
  { id: "alola", name: "Alola", desc: "Register Pokémon first discovered in Alola.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 80, icon: "fa-solid fa-map-location-dot" },
  { id: "galar", name: "Galar", desc: "Register Pokémon first discovered in Galar.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 89, icon: "fa-solid fa-map-location-dot" },
  { id: "paldea", name: "Paldea", desc: "Register Pokémon first discovered in Paldea.", category: "region", bronze: 10, silver: 30, gold: 50, platinum: 120, icon: "fa-solid fa-map-location-dot" },
  { id: "hisui", name: "Hisui", desc: "Register Pokémon first discovered in Hisui.", category: "region", bronze: 5, silver: 15, gold: 30, platinum: 50, icon: "fa-solid fa-map-location-dot" },
  
  // Gameplay
  { id: "jogger", name: "Jogger", desc: "Walk distance in km.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 10000, icon: "fa-solid fa-person-running" },
  { id: "collector", name: "Collector", desc: "Catch Pokémon.", category: "gameplay", bronze: 100, silver: 1000, gold: 10000, platinum: 50000, icon: "fa-solid fa-circle-nodes" },
  { id: "scientist", name: "Scientist", desc: "Evolve Pokémon.", category: "gameplay", bronze: 10, silver: 50, gold: 500, platinum: 2000, icon: "fa-solid fa-flask" },
  { id: "breeder", name: "Breeder", desc: "Hatch Eggs.", category: "gameplay", bronze: 10, silver: 100, gold: 500, platinum: 2500, icon: "fa-solid fa-egg" },
  { id: "backpacker", name: "Backpacker", desc: "Spin PokéStops or Gyms.", category: "gameplay", bronze: 100, silver: 1000, gold: 10000, platinum: 50000, icon: "fa-solid fa-backpack" },
  { id: "battlegirl", name: "Battle Girl", desc: "Win Gym battles.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 4000, icon: "fa-solid fa-hand-fist" },
  { id: "champion", name: "Champion", desc: "Win Raids.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2000, icon: "fa-solid fa-trophy" },
  { id: "ranger", name: "Ranger", desc: "Complete Field Research tasks.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2500, icon: "fa-solid fa-compass" },
  { id: "purifier", name: "Purifier", desc: "Purify Shadow Pokémon.", category: "gameplay", bronze: 5, silver: 50, gold: 500, platinum: 1000, icon: "fa-solid fa-wand-magic-sparkles" },
  { id: "hero", name: "Hero", desc: "Defeat Team GO Rocket Grunts.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2000, icon: "fa-solid fa-mask" },
  { id: "ultrahero", name: "Giovanni Boss", desc: "Defeat Team GO Rocket Boss Giovanni.", category: "gameplay", bronze: 1, silver: 5, gold: 20, platinum: 50, icon: "fa-solid fa-crown" },
  { id: "pikachufan", name: "Pikachu Fan", desc: "Catch Pikachu.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000, icon: "fa-solid fa-bolt" },
  { id: "youngster", name: "Youngster", desc: "Catch tiny Rattata.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000, icon: "fa-solid fa-compress" },
  { id: "fisherman", name: "Fisherman", desc: "Catch big Magikarp.", category: "gameplay", bronze: 3, silver: 50, gold: 300, platinum: 1000, icon: "fa-solid fa-fish" },
  { id: "berrycatcher", name: "Berry Catcher", desc: "Feed berries at Gyms.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 15000, icon: "fa-solid fa-seedling" },
  { id: "gymleader", name: "Gym Leader", desc: "Hours defended gyms.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 15000, icon: "fa-solid fa-shield-halved" },
  { id: "idol", name: "Idol", desc: "Reach Best Friends status.", category: "gameplay", bronze: 1, silver: 2, gold: 3, platinum: 20, icon: "fa-solid fa-user-group" },
  { id: "gentleman", name: "Gentleman", desc: "Trade Pokémon.", category: "gameplay", bronze: 10, silver: 100, gold: 1000, platinum: 2500, icon: "fa-solid fa-handshake" },
  { id: "pilot", name: "Pilot", desc: "Earn distance on trades (km).", category: "gameplay", bronze: 1000, silver: 10000, gold: 100000, platinum: 1000000, icon: "fa-solid fa-plane" },
  { id: "cameraman", name: "Cameraman", desc: "Take buddy snapshot encounters.", category: "gameplay", bronze: 10, silver: 50, gold: 200, platinum: 400, icon: "fa-solid fa-camera" },
  { id: "wayfarer", name: "Wayfarer", desc: "Complete Wayfinder agreements.", category: "gameplay", bronze: 10, silver: 50, gold: 250, platinum: 1500, icon: "fa-solid fa-route" },
  { id: "risingstar", name: "Rising Star", desc: "Raid unique species.", category: "gameplay", bronze: 2, silver: 10, gold: 50, platinum: 150, icon: "fa-solid fa-star" },
  { id: "triathlete", name: "Triathlete", desc: "Get 7-day catch/spin streaks.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100, icon: "fa-solid fa-calendar-check" },
  { id: "showcasestar", name: "Showcase Star", desc: "Win PokéStop Showcases.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100, icon: "fa-solid fa-award" },
  { id: "maxbattle", name: "Max Battler", desc: "Win Max Battles.", category: "gameplay", bronze: 1, silver: 10, gold: 50, platinum: 100, icon: "fa-solid fa-share-nodes" },
  { id: "successor", name: "Successor", desc: "Mega Evolve Pokémon times.", category: "gameplay", bronze: 1, silver: 50, gold: 250, platinum: 1000, icon: "fa-solid fa-arrows-spin" },
  { id: "megaguru", name: "Mega Guru", desc: "Mega Evolve unique species.", category: "gameplay", bronze: 1, silver: 24, gold: 36, platinum: 46, icon: "fa-solid fa-atom" },
  
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
  lure_module: { name: "Lure Module", emoji: "🌸", cat: "boosts", threshold: 10 },
  glacial_lure: { name: "Glacial Lure", emoji: "❄️", cat: "boosts", threshold: 5 },
  mossy_lure: { name: "Mossy Lure", emoji: "🍃", cat: "boosts", threshold: 5 },
  magnetic_lure: { name: "Magnetic Lure", emoji: "🧲", cat: "boosts", threshold: 5 },
  rainy_lure: { name: "Rainy Lure", emoji: "☔", cat: "boosts", threshold: 5 },
  golden_lure: { name: "Golden Lure", emoji: "🟡", cat: "boosts", threshold: 5 },
  zygarde_cell: { name: "Zygarde Cell", emoji: "🟢", cat: "stones", threshold: 250, discardTip: "Collect to change Zygarde forms. Does not count towards item capacity." }
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
  max_particles: "https://archives.bulbagarden.net/media/upload/0/09/Max_Particles.png",
  
  premium_pass: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1402.png",
  remote_pass: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_1408.png",
  rocket_radar: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_Leader_MapCompass.png",
  super_radar: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Item_Giovanni_MapCompass.png",
  link_charge: "https://archives.bulbagarden.net/media/upload/e/e3/Link_Charges.png",
  
  lucky_egg: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/luckyegg.png",
  star_piece: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/starpiece.png",
  incense: "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/Incense_1.png",
  
  lure_module: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fea%2FLure_Module.png",
  glacial_lure: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F1%2F16%2FGlacial_Lure_Module.png",
  mossy_lure: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fc%2Fcc%2FMossy_Lure_Module.png",
  magnetic_lure: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F5%2F56%2FMagnetic_Lure_Module.png",
  rainy_lure: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F5%2F53%2FRainy_Lure_Module.png",
  golden_lure: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F7%2F7b%2FGolden_Lure_Module.png",
  zygarde_cell: "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F5%2F56%2FZygarde_Cell.png"
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
    // Perform fetches in parallel (skipping outdated fetchReleasedPokemon)
    await Promise.all([
      fetchPvPokeRankings(),
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
  
  // Restore sidebar collapsed preference on desktop
  if (window.innerWidth > 768) {
    const collapsed = localStorage.getItem('pokego_sidebar_collapsed') === 'true';
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed-active');
    }
  }
  
  // Restore admin session if persisted
  const isAdminSession = localStorage.getItem('pokego_tracker_admin_session') === 'true';
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (isAdminSession && !isMobile) {
    signInAsAdmin(false);
  } else {
    if (isAdminSession && isMobile) {
      localStorage.removeItem('pokego_tracker_admin_session');
    }
    // Restore guest session if persisted
    const guestEmail = localStorage.getItem('pokego_tracker_guest_session');
    if (guestEmail) {
      signInAsGuest(guestEmail, false);
    }
  }
  
  switchTab('pokedex');
  
  // Load global pokedex overrides first
  loadGlobalDatabaseOverrides();

  // Render initially with loaded cache or defaults
  try { renderPokedex(); } catch (e) { console.error("Error rendering pokedex:", e); }
  try { renderLevelTracker(); } catch (e) { console.error("Error rendering level tracker:", e); }
  try { renderMedalTracker(); } catch (e) { console.error("Error rendering medal tracker:", e); }
  try { renderFriendsTracker(); } catch (e) { console.error("Error rendering friends tracker:", e); }
  try { renderItemInventory(); } catch (e) { console.error("Error rendering items:", e); }
  try { updateStorageProgress(); } catch (e) { console.error("Error updating storage progress:", e); }
  try { updateItemStorageProgress(); } catch (e) { console.error("Error updating item storage:", e); }
  try { generateSearchString(); } catch (e) { console.error("Error generating search string:", e); }
  
  // Re-evaluate locked UI on load
  lockUIForLoggedOutUsers();
  
  // Programmatic listeners to ensure mobile sidebar menu drawer and backdrop close reliably on click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('active');
      }
    });
  });

  const overlayEl = document.getElementById('sidebar-overlay');
  if (overlayEl) {
    overlayEl.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('sidebar-open');
      overlayEl.classList.remove('active');
    });
  }
  
  // Trainer Code auto-formatting listener
  const profileTrainerCode = document.getElementById('profile-trainer-code');
  if (profileTrainerCode) {
    profileTrainerCode.addEventListener('input', (e) => {
      e.target.value = formatTrainerCodeStr(e.target.value);
    });
  }
  
  const friendCodeInput = document.getElementById('friend-code-input');
  const partyType = document.getElementById('party-type');
  if (partyType) {
    partyType.addEventListener('change', () => {
      populateBattlePartySelectors();
    });
  }
  if (friendCodeInput) {
    friendCodeInput.addEventListener('input', (e) => {
      e.target.value = formatTrainerCodeStr(e.target.value);
    });
  }
  
  // Profile avatar custom url typing preview listener
  const profileAvatarUrl = document.getElementById('profile-avatar-url');
  if (profileAvatarUrl) {
    profileAvatarUrl.addEventListener('input', (e) => {
      const preview = document.getElementById('profile-avatar-preview');
      if (preview) {
        preview.src = e.target.value.trim() || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      }
    });
  }

  // Hash listener for password recovery link
  const hash = window.location.hash;
  if (hash && hash.includes('type=recovery')) {
    alert("You have logged in via a password recovery link. Please choose a new password in the profile settings dialog.");
    setTimeout(() => {
      openProfileModal();
    }, 1500); // Wait for supabase session to populate
  }
  
  // Try to load events from cache (handles its own rendering)
  fetchLiveEvents();
  
  // Run background sync manager
  syncAllDataOnline(false);

  // Set up Supabase auth change listener
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (currentUserSession && currentUserSession.user.id === "guest-user-123") {
        console.log("Supabase Auth Change event ignored: Active Guest Session exists.");
        return;
      }
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
        const avatarUrl = resolveUserAvatar(state.trainerProfile, session);
        
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
        if (syncStatusEl) {
          syncStatusEl.style.display = 'flex';
          updateSyncStatusIndicator('local-offline', 'Offline Mode (Local Storage)');
        }
      }
      
      // Re-evaluate locked UI and refresh trackers
      lockUIForLoggedOutUsers();
      renderFriendsTracker();
      renderItemInventory();
      renderMedalTracker();
    });
  }
  
  // Load active trainer codes from cache or scrape fresh on load
  const lastScrape = localStorage.getItem('pokego_active_trainer_codes_time');
  const cachedCodes = localStorage.getItem('pokego_active_trainer_codes');
  if (cachedCodes) {
    try {
      activeTrainerCodesCache = JSON.parse(cachedCodes);
    } catch (e) {}
  }
  if (!lastScrape || Date.now() - parseInt(lastScrape) > 14400000) {
    updateActiveTrainerCodes();
  }
  
  // Set up periodic scraper (every 30 mins)
  setInterval(updateActiveTrainerCodes, 1800000);
});

async function fetchReleasedPokemon() {
  // Outdated third-party API, disabled to prevent database status pollution.
  return;
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
  try {
    const eventsLoading = document.getElementById('events-loading');
    const regionalLoading = document.getElementById('regional-loading');
    const raidsCol2Loading = document.getElementById('raids-col2-loading');
    const raidsCol3Loading = document.getElementById('raids-col3-loading');
    const eventsList = document.getElementById('events-list');
    const regionalEventsList = document.getElementById('regional-events-list');
    const raidsCol2Container = document.getElementById('raids-col2-container');
    const raidsCol3Container = document.getElementById('raids-col3-container');
    
    if (!eventsList || !raidsCol2Container || !raidsCol3Container) return;

    // Hide loading indicators
    if (eventsLoading) eventsLoading.style.display = 'none';
    if (regionalLoading) regionalLoading.style.display = 'none';
    if (raidsCol2Loading) raidsCol2Loading.style.display = 'none';
    if (raidsCol3Loading) raidsCol3Loading.style.display = 'none';
    
    eventsList.innerHTML = '';
    if (regionalEventsList) regionalEventsList.innerHTML = '';
    raidsCol2Container.innerHTML = '';
    raidsCol3Container.innerHTML = '';
    
    const now = new Date();
    
    // Sort events
    const activeEvents = data.filter(e => {
      if (!e || !e.start || !e.end) return false;
      const start = new Date(e.start);
      const end = new Date(e.end);
      return now >= start && now <= end;
    });

    const isRegional = (e) => {
      if (!e) return false;
      const name = (e.name || '').toLowerCase();
      const heading = (e.heading || '').toLowerCase();
      const type = (e.eventType || '').toLowerCase();
      const link = (e.link || '').toLowerCase();
      
      const regionalKeywords = [
        'safari', 'local', 'regional', 'in-person', 'city safari', 'championships',
        'tainan', 'jakarta', 'fukuoka', 'kyoto', 'sendai', 'madrid', 'barcelona',
        'seoul', 'jeju', 'incheon', 'london', 'osaka', 'singapore', 'tukwila',
        'seattle', 'berlin', 'goyang', 'kaohsiung', 'liverpool', 'philadelphia',
        'st. louis', 'taichung', 'new york', 'chicago', 'dortmund', 'yokohama',
        'chiba', 'munich', 'paris', 'sao paulo', 'buenos aires', 'santiago', 'lima', 
        'mexico city', 'copenhagen', 'seville', 'bali', 'shanghai', 'tokyo'
      ];
      
      const hasKeyword = regionalKeywords.some(k => name.includes(k) || heading.includes(k) || type.includes(k) || link.includes(k));
      if (hasKeyword) return true;
      
      if ((type.includes('go-fest') || heading.includes('go fest') || name.includes('go fest')) && !name.includes('global')) {
        return true;
      }
      
      return false;
    };

    // Standard Events
    const standardActive = activeEvents.filter(e => !isRegional(e));
    const displayEvents = standardActive.length > 0 ? standardActive : data.filter(e => !isRegional(e)).slice(0, 5);
    
    displayEvents.forEach(e => {
      if (!e) return;
      const card = document.createElement('a');
      card.href = e.link || '#';
      card.target = "_blank";
      card.className = "event-item-card";
      card.style.textDecoration = "none";
      card.style.color = "inherit";
      
      const start = e.start ? new Date(e.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--';
      const end = e.end ? new Date(e.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--';
      
      card.innerHTML = `
        <div class="event-card-inner">
          <img src="${e.image || 'https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'}" alt="${e.name || 'Event'}" onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'">
          <div class="event-card-details">
            <span class="event-type-badge">${e.heading || e.eventType || 'Event'}</span>
            <h4>${e.name || 'Unnamed Event'}</h4>
            <p><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${start} - ${end}</p>
          </div>
        </div>
      `;
      eventsList.appendChild(card);
    });

    // Regional Events
    const regionalActive = activeEvents.filter(e => isRegional(e));
    const displayRegional = regionalActive.length > 0 ? regionalActive : data.filter(e => isRegional(e)).slice(0, 5);
    
    displayRegional.forEach(e => {
      if (!e) return;
      const card = document.createElement('a');
      card.href = e.link || '#';
      card.target = "_blank";
      card.className = "event-item-card";
      card.style.textDecoration = "none";
      card.style.color = "inherit";
      
      const start = e.start ? new Date(e.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--';
      const end = e.end ? new Date(e.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--';
      
      card.innerHTML = `
        <div class="event-card-inner">
          <img src="${e.image || 'https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'}" alt="${e.name || 'Event'}" onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'">
          <div class="event-card-details">
            <span class="event-type-badge">${e.heading || e.eventType || 'Event'}</span>
            <h4>${e.name || 'Unnamed Event'}</h4>
            <p><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${start} - ${end}</p>
          </div>
        </div>
      `;
      if (regionalEventsList) regionalEventsList.appendChild(card);
    });
    
    // Parse Raids
    const tierMapping = {
      mega: [],
      t5: [],
      t3: [],
      max: []
    };
    
    data.forEach(e => {
      if (!e || !e.name) return;
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
          if (b && b.name && !tierMapping[tier].some(x => x.name === b.name)) {
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
      
      let bossesHTML = '';
      bosses.forEach(b => {
        const apiImg = getPokeAPISprite(b.name) || b.image;
        const found = findPokemonByBossName(b.name);
        const clickableClass = found ? 'clickable' : '';
        const onclickAttr = found ? `onclick="showPokemonDetail(${found.id})"` : '';
        
        let onerrorAttr = '';
        if (found) {
          const spriteFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png`;
          onerrorAttr = `onerror="if(this.src!=='${spriteFallback}'){this.src='${spriteFallback}';}else{this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg';this.onerror=null;}"`;
        } else {
          onerrorAttr = `onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg';this.onerror=null;"`;
        }

        bossesHTML += `
          <div class="raid-boss-item ${clickableClass}" ${onclickAttr}>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${apiImg || 'https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'}" alt="${b.name}" ${onerrorAttr}>
              <span>${b.name}</span>
            </div>
            ${b.shiny ? `<span class="shiny-indicator"><i class="fa-solid fa-star"></i> Shiny Eligible</span>` : ''}
          </div>
        `;
      });
      
      groupDiv.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; margin-bottom:8px; color:${t.color}; display:flex; align-items:center; gap:6px;">
          <i class="fa-solid ${t.icon}"></i> ${t.label}
        </h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${bossesHTML}
        </div>
      `;
      raidsCol2Container.appendChild(groupDiv);
    });
    
    // Render Column 3: Mega Raids & Max Battles
    const col3Tiers = [
      { id: "mega", label: "Mega Raids", color: "var(--color-mega)", icon: "fa-atom" },
      { id: "max", label: "Max Battles", color: "var(--color-max)", icon: "fa-bolt" }
    ];
    
    col3Tiers.forEach(t => {
      const bosses = tierMapping[t.id];
      if (bosses.length === 0) return;
      
      const groupDiv = document.createElement('div');
      groupDiv.className = "raid-tier-group";
      groupDiv.style.marginBottom = "14px";
      
      let bossesHTML = '';
      bosses.forEach(b => {
        const apiImg = getPokeAPISprite(b.name) || b.image;
        const found = findPokemonByBossName(b.name);
        const clickableClass = found ? 'clickable' : '';
        const onclickAttr = found ? `onclick="showPokemonDetail(${found.id})"` : '';
        
        let onerrorAttr = '';
        if (found) {
          const spriteFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png`;
          onerrorAttr = `onerror="if(this.src!=='${spriteFallback}'){this.src='${spriteFallback}';}else{this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg';this.onerror=null;}"`;
        } else {
          onerrorAttr = `onerror="this.src='https://cdn.leekduck.com/assets/img/events/events-default-img.jpg';this.onerror=null;"`;
        }

        bossesHTML += `
          <div class="raid-boss-item ${clickableClass}" ${onclickAttr}>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${apiImg || 'https://cdn.leekduck.com/assets/img/events/events-default-img.jpg'}" alt="${b.name}" ${onerrorAttr}>
              <span>${b.name}</span>
            </div>
            ${b.shiny ? `<span class="shiny-indicator"><i class="fa-solid fa-star"></i> Shiny Eligible</span>` : ''}
          </div>
        `;
      });
      
      groupDiv.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; margin-bottom:8px; color:${t.color}; display:flex; align-items:center; gap:6px;">
          <i class="fa-solid ${t.icon}"></i> ${t.label}
        </h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${bossesHTML}
        </div>
      `;
      raidsCol3Container.appendChild(groupDiv);
    });
    
    // Extract unique active raid bosses
    const currentBosses = [];
    const seenIds = new Set();
    Object.keys(tierMapping).forEach(tier => {
      if (tier === 'max') return; // Exclude max battles from target raid boss list
      tierMapping[tier].forEach(b => {
        const found = findPokemonByBossName(b.name);
        if (found && !seenIds.has(found.id)) {
          seenIds.add(found.id);
          currentBosses.push(found);
        }
      });
    });
    window.currentRaidBosses = currentBosses;
    populateRaidBossSelector();
  } catch (err) {
    console.error("Error rendering live events:", err);
    
    const eventsLoading = document.getElementById('events-loading');
    const regionalLoading = document.getElementById('regional-loading');
    const raidsCol2Loading = document.getElementById('raids-col2-loading');
    const raidsCol3Loading = document.getElementById('raids-col3-loading');
    
    if (eventsLoading) {
      eventsLoading.style.display = 'block';
      eventsLoading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Error parsing live events data.</span>`;
    }
    if (regionalLoading) {
      regionalLoading.style.display = 'block';
      regionalLoading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to parse.</span>`;
    }
    if (raidsCol2Loading) {
      raidsCol2Loading.style.display = 'block';
      raidsCol2Loading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to parse.</span>`;
    }
    if (raidsCol3Loading) {
      raidsCol3Loading.style.display = 'block';
      raidsCol3Loading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to parse.</span>`;
    }
  }
}

async function fetchLiveEvents() {
  const eventsLoading = document.getElementById('events-loading');
  const regionalErr = document.getElementById('regional-loading');
  const col2Err = document.getElementById('raids-col2-loading');
  const col3Err = document.getElementById('raids-col3-loading');
  
  const savedEvents = localStorage.getItem('pokego_tracker_events_json');
  const lastFetch = localStorage.getItem('pokego_tracker_events_last_fetch');
  const now = Date.now();
  const cacheDuration = 12 * 60 * 60 * 1000; // 12 hours
  
  let hasValidCache = false;
  if (savedEvents) {
    try {
      const parsed = JSON.parse(savedEvents);
      renderLiveEvents(parsed);
      hasValidCache = true;
      console.log("Loaded persisted live events from cache.");
    } catch (e) {
      console.error("Error parsing cached live events:", e);
    }
  }

  // Only skip fetch if we have a valid cache and it's fresh (less than 12 hours old)
  if (hasValidCache && lastFetch && (now - parseInt(lastFetch) < cacheDuration)) {
    console.log("Skipping live events fetch: cached data is still fresh.");
    return;
  }

  console.log("Fetching fresh events data from ScrapedDuck...");
  try {
    const response = await fetch('https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json');
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    
    // Save to localStorage with timestamp
    localStorage.setItem('pokego_tracker_events_json', JSON.stringify(data));
    localStorage.setItem('pokego_tracker_events_last_fetch', now.toString());
    
    // Render fresh data
    renderLiveEvents(data);
    console.log("Successfully fetched and cached fresh live events data.");
  } catch (error) {
    console.error('Error fetching live events:', error);
    
    // Only display error indicators if there was no cached data to display
    if (!hasValidCache) {
      if (eventsLoading) eventsLoading.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to load events.</span>`;
      if (regionalErr) regionalErr.innerHTML = `<span style="color:var(--color-danger);"><i class="fa-solid fa-circle-exclamation"></i> Failed to load.</span>`;
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

  if (tabId === 'battle') {
    try {
      populateBattlePartySelectors();
      populateRaidBossSelector();
      populateRaidPartySelectors();
      renderBattleParties();
    } catch (e) {
      console.error("Error rendering battle parties tab:", e);
    }
  } else if (tabId === 'admin') {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile) {
      alert("Admin panel is not accessible on mobile devices.");
      switchTab('pokedex');
      return;
    }
    const isAdmin = currentUserSession && currentUserSession.user && currentUserSession.user.id === "admin-user-123";
    const isAdminSession = localStorage.getItem('pokego_tracker_admin_session') === 'true';
    if (!isAdmin || !isAdminSession) {
      alert("Security Alert: Access Denied. Admin privileges are required to view this panel.");
      switchTab('pokedex');
      return;
    }
    try {
      renderAdminPokemonList();
    } catch (e) {
      console.error("Error rendering admin list:", e);
    }
  }

  // Auto-close sidebar drawer on mobile navigation
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('active');
  }
}

function toggleSidebar() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (isMobile) {
    if (sidebar) sidebar.classList.toggle('sidebar-open');
    if (overlay) overlay.classList.toggle('active');
  } else {
    document.body.classList.toggle('sidebar-collapsed-active');
    const collapsed = document.body.classList.contains('sidebar-collapsed-active');
    localStorage.setItem('pokego_sidebar_collapsed', collapsed ? 'true' : 'false');
  }
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
      state.battleParties = parsed.battleParties || [];
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
          // Only upgrade to released, never downgrade if already released in DB
          if (releasedSet.has(p.id)) {
            p.released = true;
          }
        });
        console.log(`Loaded persisted release status updates.`);
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
      owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: []
    };
  });
  state.trainerLevel = 1;
  state.currentXP = 0;
  state.targetLevel = 50;
  state.trainerProfile = {
    username: "",
    team: "None",
    birthday: "",
    avatarCustomUrl: ""
  };
  state.friends = [
    { id: "f1", name: "AshKetchum", code: "3892 4892 0184", level: "best", daysLeft: 0, giftSent: true, giftOpened: false, battled: true, lucky: false, vivillon: "Archipelago" },
    { id: "f2", name: "MistyWater", code: "8893 2284 1198", level: "ultra", daysLeft: 12, giftSent: false, giftOpened: true, battled: false, lucky: false, vivillon: "Marine" },
    { id: "f3", name: "BrockRock", code: "7729 0018 9982", level: "great", daysLeft: 20, giftSent: false, giftOpened: false, battled: false, lucky: false, vivillon: "Continental" }
  ];
  state.medals = {};
  medalsDatabase.forEach(m => {
    state.medals[m.id] = { tier: 'none', progress: 0, hidden: false };
  });
  state.items = {
    poke_ball: 120, great_ball: 60, ultra_ball: 25, master_ball: 1,
    potion: 15, super_potion: 12, hyper_potion: 8, max_potion: 30,
    revive: 25, max_revive: 20,
    razz_berry: 45, nanab_berry: 50, pinap_berry: 35, golden_razz: 12, silver_pinap: 6,
    sun_stone: 4, kings_rock: 3, metal_coat: 5, dragon_scale: 2, upgrade: 2, sinnoh_stone: 6, unova_stone: 4,
    fast_tm: 12, charged_tm: 18, elite_fast: 2, elite_charged: 3,
    rare_candy: 45, rare_candy_xl: 8, max_particles: 250,
    premium_pass: 5, remote_pass: 2, rocket_radar: 2, super_radar: 1, link_charge: 0,
    lucky_egg: 6, star_piece: 10, incense: 8, lure_module: 4,
    glacial_lure: 1, mossy_lure: 1, magnetic_lure: 1, rainy_lure: 1, golden_lure: 1, zygarde_cell: 0
  };
  state.version = 2;
  state.battleParties = [];
  saveState();
}

function saveState() {
  if (currentUserSession && currentUserSession.user.id === "guest-user-123") {
    updateDashboardWidgets();
    return;
  }
  localStorage.setItem('pokego_tracker_state', JSON.stringify(state));
  updateDashboardWidgets();

  // If logged in to Supabase, sync changes (debounced) using active provider
  if (supabaseClient && currentUserSession) {
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
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (isMobile) {
    const adminNav = document.getElementById('nav-admin');
    if (adminNav) adminNav.remove();
  }
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
  
  const adminSearch = document.getElementById('admin-search');
  if (adminSearch) {
    adminSearch.addEventListener('input', () => renderAdminPokemonList());
  }
  
  const adminToggleReleased = document.getElementById('admin-toggle-released');
  if (adminToggleReleased) {
    adminToggleReleased.addEventListener('click', () => {
      window.adminShowAllPokemon = !window.adminShowAllPokemon;
      adminToggleReleased.textContent = window.adminShowAllPokemon ? 'Hide Released' : 'Show All';
      renderAdminPokemonList();
    });
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

const shadowReleasedIds = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 27, 28, 29, 30, 31, 32, 33, 34, 37,
  38, 41, 42, 43, 44, 45, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
  71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
  102, 103, 104, 105, 106, 107, 109, 110, 111, 112, 114, 116, 117, 120, 121, 123, 125, 126, 127, 129, 130, 131, 137,
  138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 152, 153, 154, 155, 156, 157, 158, 159, 160, 163,
  164, 165, 166, 169, 177, 178, 179, 180, 181, 182, 185, 186, 187, 188, 189, 190, 194, 195, 198, 199, 200, 202, 203,
  204, 205, 207, 208, 209, 210, 211, 212, 213, 215, 216, 217, 220, 221, 225, 227, 228, 229, 230, 231, 232, 233, 234,
  237, 243, 244, 245, 246, 247, 248, 249, 250, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 273,
  274, 275, 276, 277, 280, 281, 282, 287, 288, 289, 293, 294, 295, 296, 297, 299, 302, 303, 304, 305, 306, 309, 310,
  318, 319, 320, 321, 322, 323, 325, 326, 328, 329, 330, 331, 332, 333, 334, 339, 340, 341, 342, 343, 344, 345, 346,
  347, 348, 349, 350, 353, 354, 355, 356, 359, 361, 362, 363, 364, 365, 371, 372, 373, 374, 375, 376, 377, 378, 379,
  380, 381, 382, 383, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 403, 404, 405, 408, 409,
  410, 411, 424, 425, 426, 429, 430, 431, 432, 434, 435, 443, 444, 445, 449, 450, 451, 452, 453, 454, 459, 460, 461,
  462, 464, 465, 466, 467, 472, 473, 474, 475, 476, 477, 478, 483, 484, 485, 486, 487, 488, 491, 495, 496, 497, 498,
  499, 500, 501, 502, 503, 504, 505, 509, 510, 519, 520, 521, 522, 523, 524, 525, 526, 529, 530, 532, 533, 534, 538,
  539, 543, 544, 545, 554, 555, 557, 558, 562, 563, 564, 565, 566, 567, 568, 569, 574, 575, 576, 577, 578, 579, 580,
  581, 588, 589, 590, 591, 595, 596, 597, 598, 607, 608, 609, 616, 617, 622, 623, 633, 634, 635, 641, 642, 643, 645,
  650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 686, 687, 694, 695, 696, 697, 698, 699, 708,
  709, 714, 715, 731, 732, 733, 736, 737, 738, 751, 752, 755, 756, 759, 760, 821, 822, 823, 862, 901, 903, 979
]);

const shinyUnreleasedIds = new Set([
  494, 647, 648, 718, 720, 721, 789, 790, 801, 802, 807, 824, 825, 826, 848, 849, 854, 855, 856, 857, 858, 885, 886,
  887, 889, 890, 891, 892, 893, 906, 907, 908, 909, 910, 911, 912, 913, 914, 917, 918, 919, 920, 921, 922, 923, 924,
  925, 926, 927, 935, 936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954,
  955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977,
  978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 1001,
  1002, 1003, 1004, 1005, 1006, 1007, 1008
]);

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
    const fanFavoriteIds = [1, 3, 4, 6, 7, 9, 25, 94, 130, 133, 143, 149, 150, 151, 249, 384];
    if (currentUserSession === null && !fanFavoriteIds.includes(p.id)) {
      return false;
    }
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || 
                        p.id.toString().includes(searchQuery) ||
                        p.fastMoves.some(m => m.toLowerCase().includes(searchQuery)) ||
                        p.chargedMoves.some(m => m.toLowerCase().includes(searchQuery));
    const matchGen = genFilter === 'all' || p.generation.toString() === genFilter;
    const matchType = typeFilter === 'all' || p.types.includes(typeFilter);
    const matchRelease = releaseFilter === 'all' || 
                         (releaseFilter === 'released' && p.released) || 
                         (releaseFilter === 'unreleased' && !p.released) ||
                         (releaseFilter === 'max' && p.max && p.max.released) ||
                         (releaseFilter === 'mega' && p.mega && p.mega.released && !p.mega.name.toLowerCase().includes('primal')) ||
                         (releaseFilter === 'primal' && p.mega && p.mega.released && p.mega.name.toLowerCase().includes('primal')) ||
                         (releaseFilter === 'shadow' && shadowReleasedIds.has(p.id)) ||
                         (releaseFilter === 'shiny' && p.released && !shinyUnreleasedIds.has(p.id));
    const matchExclusivity = exclusivityFilter === 'all' || 
                             (exclusivityFilter === 'background-released' && pokemonBackgroundsMap[p.id]) ||
                             p.exclusivity === exclusivityFilter;
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
    else if (statusFilter === 'shiny-hundo') matchStatus = userState.shiny && userState.hundo;
    else if (statusFilter === 'shiny-shadow') matchStatus = userState.shiny && userState.shadow;
    else if (statusFilter === 'shadow-hundo') matchStatus = userState.shadow && userState.hundo;
    else if (statusFilter === 'shiny-shadow-hundo') matchStatus = userState.shiny && userState.shadow && userState.hundo;
    else if (statusFilter === 'lucky-hundo') matchStatus = userState.lucky && userState.hundo;
    else if (statusFilter === 'shiny-lucky') matchStatus = userState.shiny && userState.lucky;
    else if (statusFilter === 'shiny-lucky-hundo') matchStatus = userState.shiny && userState.lucky && userState.hundo;
    
    return matchSearch && matchGen && matchType && matchRelease && matchExclusivity && matchUtility && matchRank && matchStatus;
  });
  
  const countEl = document.getElementById('filter-results-count');
  if (countEl) {
    if (currentUserSession === null) {
      countEl.textContent = `Showing ${filtered.length} of 16 Pokémon`;
    } else {
      countEl.textContent = `Showing ${filtered.length} of ${window.pokemonDatabase.length} Pokémon`;
    }
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No Pokémon match filters.</div>`;
    return;
  }
  
  const isLoggedIn = (currentUserSession !== null);
  const visible = filtered;

  const generationNames = {
    1: "Generation 1 (Kanto)",
    2: "Generation 2 (Johto)",
    3: "Generation 3 (Hoenn)",
    4: "Generation 4 (Sinnoh)",
    5: "Generation 5 (Unova)",
    6: "Generation 6 (Kalos)",
    7: "Generation 7 (Alola)",
    8: "Generation 8 (Galar)",
    9: "Generation 9 (Paldea)"
  };

  let currentGen = null;
  visible.forEach(p => {
    if (p.generation !== currentGen) {
      currentGen = p.generation;
      const genHeader = document.createElement('div');
      genHeader.className = 'generation-header';
      genHeader.innerHTML = `<h3>${generationNames[currentGen] || `Generation ${currentGen}`}</h3>`;
      grid.appendChild(genHeader);
    }
    const userState = state.pokemonCollection[p.id] || { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false };
    
    // Special Pokémon (Legendary, Mythical, Ultra Beast - Rank S or S+)
    const isSpecial = p.exclusivity === 'mythical' || p.rank === 'S' || p.rank === 'S+';
    
    const card = document.createElement('div');
    card.className = `pokemon-card ${userState.shiny ? 'shiny-active' : ''} ${userState.hundo ? 'hundo-active' : ''} ${isSpecial ? 'special-card' : ''} ${!p.released ? 'unreleased-card' : ''}`;
    card.setAttribute('onclick', `showPokemonDetail(${p.id})`);
    
    let typesHTML = p.types.map(t => getTypeLogoOnlyHtml(t)).join(' ');
    let rankBadge = `<span class="pokemon-rarity-badge rarity-${p.rank.replace('+', '-plus')}">Rank ${p.rank}</span>`;
    
    let badgesHTML = '';
    let isReleasingSoon = false;
    if (!p.released) {
      const upcomingEvent = getUpcomingEventForPokemon(p.name);
      if (upcomingEvent) {
        isReleasingSoon = true;
        badgesHTML += `<span class="pokemon-rarity-badge badge-releasing-soon">Releasing Soon</span>`;
      } else {
        badgesHTML += `<span class="pokemon-rarity-badge badge-unreleased">Unreleased</span>`;
      }
    }

    // Safe to Transfer tag
    let transferHTML = '';
    if (p.utility === 'filler' && userState.owned) {
      transferHTML = `<div class="transfer-alert-badge"><i class="fa-solid fa-trash-can"></i> Safe to Transfer</div>`;
    }
    
    const hasMega = p.mega ? true : false;
    const hasMax = (p.max && p.max.released) ? true : false;
    
    // Artwork Sprites (PokeAPI high res)
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
    
    let formsHTML = '';
    if (p.forms) {
      const caughtCount = (userState.caughtForms || []).length;
      formsHTML = `<span class="pokemon-rarity-badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border-subtle); color:var(--text-muted); font-size:8px; margin:0;">Forms: ${caughtCount} / ${p.forms.length}</span>`;
    }

    let backgroundsHTML = '';
    if (pokemonBackgroundsMap[p.id]) {
      const bgs = userState.caughtBackgrounds || [];
      backgroundsHTML = `<span class="pokemon-rarity-badge" style="background:rgba(191, 85, 236, 0.05); border:1px solid rgba(191, 85, 236, 0.2); color:var(--color-primary); font-size:8px; margin:0;">Backgrounds: ${bgs.length} / ${pokemonBackgroundsMap[p.id].length}</span>`;
    }

    let checklistsSummaryHTML = '';
    if (formsHTML || backgroundsHTML) {
      checklistsSummaryHTML = `<div class="card-checklists-summary-row">${formsHTML}${backgroundsHTML}</div>`;
    } else {
      checklistsSummaryHTML = `<div class="card-checklists-summary-row" style="visibility: hidden; pointer-events: none; margin-top: 3px;"><span class="pokemon-rarity-badge" style="font-size:8px; margin:0;">Spacer</span></div>`;
    }

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
          ${checklistsSummaryHTML}
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
          <span class="check-btn"><i class="fa-solid fa-moon"></i></span>
          <span>Shadow</span>
        </label>

        <label class="check-label" title="Mark Lucky">
          <input type="checkbox" id="check-lucky-${p.id}" ${userState.lucky ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'lucky')">
          <span class="check-btn"><i class="fa-solid fa-clover"></i></span>
          <span>Lucky</span>
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

        <label class="check-label" title="Mark Favorite">
          <input type="checkbox" id="check-favorite-${p.id}" ${userState.favorite ? 'checked' : ''} onchange="togglePokeState(${p.id}, 'favorite')">
          <span class="check-btn"><i class="fa-solid fa-heart"></i></span>
          <span>Favorite</span>
        </label>
      </div>
    `;
    grid.appendChild(card);
  });

  if (!isLoggedIn) {
    const ctaCard = document.createElement('div');
    ctaCard.className = 'pokemon-card auth-cta-card';
    ctaCard.style.cssText = 'grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(191, 85, 236, 0.08), rgba(255, 42, 122, 0.08)); border: 1px dashed rgba(191, 85, 236, 0.3); border-radius: 12px; margin-top: 10px; cursor: pointer; transition: border-color 0.2s;';
    ctaCard.setAttribute('onclick', 'openAuthModal()');
    ctaCard.innerHTML = `
      <i class="fa-solid fa-lock" style="font-size: 24px; color: var(--color-primary); margin-bottom: 8px;"></i>
      <h3 style="font-family: var(--font-title); font-size: 16px; margin: 0 0 6px 0; color: var(--text-main);">Unlock All ${window.pokemonDatabase.length} Pokémon</h3>
      <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 12px 0; max-width: 420px; line-height: 1.4;">You are currently browsing a preview of 16 fan-favourite Pokémon. Sign in or use the Guest login to view the complete National Dex and track caught forms.</p>
      <button class="btn-primary" style="padding: 8px 16px; font-size: 11px;"><i class="fa-solid fa-right-to-bracket"></i> Sign In / Sync</button>
    `;
    grid.appendChild(ctaCard);
  }
}

function togglePokeState(id, key) {
  const checkbox = document.getElementById(`check-${key}-${id}`);
  const val = checkbox.checked;
  
  if (!state.pokemonCollection[id]) {
    state.pokemonCollection[id] = { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: [] };
  }
  
  state.pokemonCollection[id][key] = val;
  
  const p = window.pokemonDatabase.find(x => x.id === id);

  if (val && key === 'owned') {
    if (p && p.forms && (!state.pokemonCollection[id].caughtForms || state.pokemonCollection[id].caughtForms.length === 0)) {
      state.pokemonCollection[id].caughtForms = [p.forms[0]];
    }
  }
  
  if (val && key !== 'owned') {
    state.pokemonCollection[id].owned = true;
    const oC = document.getElementById(`check-owned-${id}`);
    if (oC) oC.checked = true;
    if (p && p.forms && (!state.pokemonCollection[id].caughtForms || state.pokemonCollection[id].caughtForms.length === 0)) {
      state.pokemonCollection[id].caughtForms = [p.forms[0]];
    }
  }
  
  if (!val && key === 'owned') {
    state.pokemonCollection[id].shiny = false;
    state.pokemonCollection[id].shadow = false;
    state.pokemonCollection[id].lucky = false;
    state.pokemonCollection[id].favorite = false;
    state.pokemonCollection[id].hundo = false;
    state.pokemonCollection[id].mega = false;
    state.pokemonCollection[id].max = false;
    if (state.pokemonCollection[id].caughtForms) {
      state.pokemonCollection[id].caughtForms = [];
    }
    
    const chShiny = document.getElementById(`check-shiny-${id}`);
    const chShadow = document.getElementById(`check-shadow-${id}`);
    const chLucky = document.getElementById(`check-lucky-${id}`);
    const chFavorite = document.getElementById(`check-favorite-${id}`);
    const chHundo = document.getElementById(`check-hundo-${id}`);
    const chMega = document.getElementById(`check-mega-${id}`);
    const chMax = document.getElementById(`check-max-${id}`);
    
    if (chShiny) chShiny.checked = false;
    if (chShadow) chShadow.checked = false;
    if (chLucky) chLucky.checked = false;
    if (chFavorite) chFavorite.checked = false;
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

function toggleFormCaught(id, formName, checked) {
  if (!state.pokemonCollection[id]) {
    state.pokemonCollection[id] = { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: [] };
  }
  
  if (!state.pokemonCollection[id].caughtForms) {
    state.pokemonCollection[id].caughtForms = [];
  }
  
  const caught = state.pokemonCollection[id].caughtForms;
  
  if (checked) {
    if (!caught.includes(formName)) {
      caught.push(formName);
    }
  } else {
    const idx = caught.indexOf(formName);
    if (idx > -1) {
      caught.splice(idx, 1);
    }
  }
  
  // If caught forms > 0, set owned = true, else owned = false
  const prevOwned = state.pokemonCollection[id].owned;
  state.pokemonCollection[id].owned = (caught.length > 0);
  
  // If owned status changed, update the UI checkbox on card and in detail modal if present
  const ownedCheckbox = document.getElementById(`check-owned-${id}`);
  if (ownedCheckbox) {
    ownedCheckbox.checked = state.pokemonCollection[id].owned;
  }
  
  // Update details page checkbox if open
  const detailOwnedCheckbox = document.getElementById(`modal-check-owned-${id}`);
  if (detailOwnedCheckbox) {
    detailOwnedCheckbox.checked = state.pokemonCollection[id].owned;
  }
  
  saveState();
  renderPokedex();
}

function toggleBackgroundCaught(id, backgroundName, checked) {
  if (!state.pokemonCollection[id]) {
    state.pokemonCollection[id] = { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: [], caughtBackgrounds: [] };
  }
  
  if (!state.pokemonCollection[id].caughtBackgrounds) {
    state.pokemonCollection[id].caughtBackgrounds = [];
  }
  
  const caught = state.pokemonCollection[id].caughtBackgrounds;
  
  if (checked) {
    if (!caught.includes(backgroundName)) {
      caught.push(backgroundName);
    }
  } else {
    const idx = caught.indexOf(backgroundName);
    if (idx > -1) {
      caught.splice(idx, 1);
    }
  }
  
  if (checked && !state.pokemonCollection[id].owned) {
    state.pokemonCollection[id].owned = true;
    const ownedCheckbox = document.getElementById(`check-owned-${id}`);
    if (ownedCheckbox) {
      ownedCheckbox.checked = true;
    }
    const detailOwnedCheckbox = document.getElementById(`modal-check-owned-${id}`);
    if (detailOwnedCheckbox) {
      detailOwnedCheckbox.checked = true;
    }
  }
  
  saveState();
  renderPokedex();
}

function getBackgroundImageUrl(name) {
  const normName = name.replace(/_/g, ' ').trim();
  let url = window.BACKGROUND_URLS_MAP && (window.BACKGROUND_URLS_MAP[name] || window.BACKGROUND_URLS_MAP[normName]);
  if (!url) {
    url = `https://pokemongo.fandom.com/wiki/Special:FilePath/${encodeURIComponent(name.replace(/ /g, '_'))}.png`;
  }
  if (url && (url.includes('wikia.nocookie.net') || url.includes('fandom.com') || url.includes('bulbagarden.net') || url.includes('bulbapedia'))) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function openBackgroundsPopup(id) {
  const p = window.pokemonDatabase.find(x => x.id === id);
  if (!p) return;
  
  const popup = document.getElementById('backgrounds-popup');
  if (!popup) return;
  
  const title = document.getElementById('bg-popup-title');
  if (title) title.textContent = `${p.name} Backgrounds`;
  
  const container = document.getElementById('bg-popup-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  const backgrounds = pokemonBackgroundsMap[p.id] || [];
  
  const getEventStyle = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('london')) {
      return 'linear-gradient(135deg, #1b3a4b, #8b0000)';
    } else if (nameLower.includes('osaka') || nameLower.includes('kyoto')) {
      return 'linear-gradient(135deg, #d4ac0d, #ba4a00)';
    } else if (nameLower.includes('new york') || nameLower.includes('nyc')) {
      return 'linear-gradient(135deg, #2471a3, #117a65)';
    } else if (nameLower.includes('sendai')) {
      return 'linear-gradient(135deg, #196f3d, #27ae60)';
    } else if (nameLower.includes('madrid')) {
      return 'linear-gradient(135deg, #78281f, #e74c3c)';
    } else if (nameLower.includes('global')) {
      return 'linear-gradient(135deg, #6c3483, #d35400)';
    } else if (nameLower.includes('jeju')) {
      return 'linear-gradient(135deg, #0e6251, #1abc9c)';
    } else if (nameLower.includes('incheon')) {
      return 'linear-gradient(135deg, #2e4053, #3498db)';
    } else if (nameLower.includes('fukuoka')) {
      return 'linear-gradient(135deg, #7d6608, #f4d03f)';
    } else if (nameLower.includes('jakarta')) {
      return 'linear-gradient(135deg, #b03a2e, #1f618d)';
    } else if (nameLower.includes('tainan')) {
      return 'linear-gradient(135deg, #1b4f72, #7d6608)';
    } else if (nameLower.includes('barcelona')) {
      return 'linear-gradient(135deg, #78281f, #f39c12)';
    } else if (nameLower.includes('mexico')) {
      return 'linear-gradient(135deg, #145a32, #b03a2e)';
    } else if (nameLower.includes('seoul')) {
      return 'linear-gradient(135deg, #512e5f, #1b4f72)';
    } else if (nameLower.includes('buenos aires')) {
      return 'linear-gradient(135deg, #2e86c1, #f4d03f)';
    }
    return 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))';
  };
  
  backgrounds.forEach(bg => {
    const userState = state.pokemonCollection[p.id] || {};
    const caughtBgs = userState.caughtBackgrounds || [];
    const isChecked = caughtBgs.includes(bg);
    
    const card = document.createElement('div');
    card.className = `bg-card-wrapper ${isChecked ? 'active' : ''}`;
    
    const imgUrl = getBackgroundImageUrl(bg);
    const bgGradient = getEventStyle(bg);
    
    let imgHTML = '';
    if (imgUrl) {
      imgHTML = `<img src="${imgUrl}" referrerpolicy="no-referrer" alt="${bg}" onerror="this.style.display='none';" />`;
    }
    
    const shineHTML = isChecked ? `
      <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(125deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.15) 100%); pointer-events: none; border-radius: 10px; z-index: 3;"></div>
    ` : '';
    
    const isSpecial = bg.toLowerCase().includes('special');
    const badgeText = isSpecial ? 'Special Background' : 'Location Background';
    
    card.innerHTML = `
      <div class="bg-card" style="background: ${bgGradient};">
        ${imgHTML}
        <div class="bg-card-overlay"></div>
        ${shineHTML}
        <div class="bg-check-indicator">
          <i class="fa-solid fa-check" style="font-size:10px; color:#fff;"></i>
        </div>
      </div>
      <div class="bg-card-info">
        <span class="bg-card-badge">${badgeText}</span>
        <div class="bg-card-title">${bg}</div>
      </div>
    `;
    
    card.onclick = () => {
      const uState = state.pokemonCollection[p.id] || {};
      const cBgs = uState.caughtBackgrounds || [];
      const currentChecked = cBgs.includes(bg);
      const newChecked = !currentChecked;
      
      toggleBackgroundCaught(p.id, bg, newChecked);
      
      if (newChecked) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
      
      const checkbox = document.querySelector(`#modal-backgrounds-checklist input[type="checkbox"][onchange*="'${bg.replace(/'/g, "\\'")}'"]`);
      if (checkbox) {
        checkbox.checked = newChecked;
      }
      
      renderPokedex();
    };
    
    container.appendChild(card);
  });
  
  popup.style.display = 'flex';
  lockBodyScroll();
  
  // Scroll reset double tap
  container.scrollTop = 0;
  setTimeout(() => {
    container.scrollTop = 0;
  }, 50);
}

function closeBackgroundsPopup(e) {
  if (e === null || e.target.id === 'backgrounds-popup' || e.target.className === 'close-modal-btn') {
    const popup = document.getElementById('backgrounds-popup');
    if (popup) {
      popup.style.display = 'none';
      unlockBodyScroll();
    }
  }
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

function filterByDashboard(status) {
  if (status === 'medals') {
    switchTab('medals');
    return;
  }
  if (status === 'level') {
    switchTab('levels');
    return;
  }
  
  // Switch to pokedex tab
  switchTab('pokedex');
  
  const select = document.getElementById('filter-status');
  if (select) {
    if (select.value === status) {
      select.value = 'all'; // Toggle off if already selected
    } else {
      select.value = status;
    }
    applyFilters();
  }
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

const pokemonBackgroundsMap = {
  1: ["Special Background Max Finale"], // Bulbasaur
  3: ["Special Background Mega"], // Venusaur
  4: ["Special Background Max Finale"], // Charmander
  6: ["Special Background Mega"], // Charizard
  7: ["Special Background Max Finale"], // Squirtle
  9: ["Special Background Mega"], // Blastoise
  10: ["Special Background Max Finale"], // Caterpie
  18: ["Special Background Mega"], // Pidgeot
  25: [
    "Location Card Las Vegas", "Location Card Jeju", "Location Card Osaka", "Location Card London", 
    "Location Card NYC", "Location Card Seoul", "Location Card Barcelona", "Location Card Mexico City", 
    "Location Card Los Angeles", "Location Card Bali", "Location Card Tainan", "Location Card Surabaya", 
    "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024", "Location Background Honolulu", 
    "Location Card Yogyakarta", "Location Background Jakarta", "Location Background Incheon", "Location Background Fukuoka",
    "Location Background Los Angeles 2026", "Location Background Tainan 2026", "Location Background Osaka 2025",
    "Location Background Osaka GOFest 2025", "Location Background Jersey City", "Location Background Paris",
    "Location Background Road Trip 2025 Manchester", "Location Background Road Trip 2025 London",
    "Location Background Road Trip 2025 Paris", "Location Background Road Trip 2025 Valencia",
    "Location Background Road Trip 2025 Berlin", "Location Background Road Trip 2025 Hague",
    "Location Background Road Trip 2025 Cologne", "Location Background Anaheim",
    "Location Background City Safari Bangkok", "Location Background City Safari Amsterdam",
    "Location Background City Safari Valencia", "Location Background City Safari Cancun",
    "Location Background City Safari Vancouver", "Location Background City Safari Sydney",
    "Location Background City Safari Buenos Aires", "Location Background City Safari Miami",
    "Location Background Taipei Childrens Amusement Park", "Location Background Taipei Floral Picnic 2026",
    "Location Background Expo2025 Pikachu", "Location Background Expo2025 Starters",
    "Location Background GO Fest 2026 Tokyo", "Location Background GO Fest 2026 Chicago", "Location Background GO Fest 2026 Copenhagen",
    "Location Background Pokelid Aichi", "Location Background Pokelid Akita", "Location Background Pokelid Aomori",
    "Location Background Pokelid Chiba", "Location Background Pokelid Ehime", "Location Background Pokelid Fukui",
    "Location Background Pokelid Fukushima", "Location Background Pokelid Fukuoka", "Location Background Pokelid Gifu",
    "Location Background Pokelid Hokkaido", "Location Background Pokelid Hyogo", "Location Background Pokelid Ibaraki",
    "Location Background Pokelid Ishikawa", "Location Background Pokelid Iwate", "Location Background Pokelid Kagawa",
    "Location Background Pokelid Kagoshima", "Location Background Pokelid Kanagawa", "Location Background Pokelid Kochi",
    "Location Background Pokelid Kyoto", "Location Background Pokelid Mie", "Location Background Pokelid Miyazaki",
    "Location Background Pokelid Miyagi", "Location Background Pokelid Nagasaki", "Location Background Pokelid Nara",
    "Location Background Pokelid Niigata", "Location Background Pokelid Okayama", "Location Background Pokelid Okinawa",
    "Location Background Pokelid Osaka", "Location Background Pokelid Saga", "Location Background Pokelid Saitama",
    "Location Background Pokelid Shiga", "Location Background Pokelid Shimane", "Location Background Pokelid Shizuoka",
    "Location Background Pokelid Tochigi", "Location Background Pokelid Tokushima", "Location Background Pokelid Tokyo",
    "Location Background Pokelid Tottori", "Location Background Pokelid Toyama", "Location Background Pokelid Wakayama",
    "Location Background Pokelid Yamagata", "Location Background Pokelid Yamaguchi"
  ], // Pikachu
  35: ["Special Background Observatory Exhibition Tour"], // Clefairy
  54: ["Special Background Concierge"], // Psyduck
  56: ["Special Background DecCD2024"], // Mankey
  66: ["Special Background Max Finale"], // Machop
  69: ["Special Background DecCD2024"], // Bellsprout
  71: ["Special Background Mega"], // Victreebel
  77: ["Special Background Valor", "Special Background DecCD2024", "Location Background GO Fest 2026 Copenhagen"], // Ponyta
  92: ["Special Background Max Finale"], // Gastly
  98: ["Special Background Max Finale"], // Krabby
  113: ["Special Background DecCD2024", "Special Background Max Finale"], // Chansey
  115: ["Special Background Mega"], // Kangaskhan
  128: [
    "Location Background GO Fest 2026 Tokyo", 
    "Location Background GO Fest 2026 Chicago", 
    "Location Background GO Fest 2026 Copenhagen"
  ], // Tauros
  131: ["Special Background Mystic", "Special Background Pokopia"], // Lapras
  132: ["Special Background Pokopia"], // Ditto
  133: [
    "Location Card Seoul", "Location Card Barcelona", "Location Card Mexico City", "Location Card Tainan", 
    "Location Background Jakarta", "Location Background Hong Kong", "Location Background São Paulo",
    "Location Background Fukuoka", "Location Background Incheon"
  ], // Eevee
  137: ["Special Background DecCD2024"], // Porygon
  138: ["Special Background Max Finale"], // Omanyte
  140: ["Special Background Max Finale"], // Kabuto
  143: ["Special Background Pokopia"], // Snorlax
  144: ["Special Background DelightfulDays", "Special Background Max Finale"], // Articuno
  145: ["Special Background Max Finale"], // Zapdos
  146: ["Special Background Max Finale", "Location Background GO Fest 2026 Copenhagen"], // Moltres
  149: ["Special Background Mega", "Special Background Pokopia"], // Dragonite
  150: [
    "Location Background GO Fest 2026 Tokyo", 
    "Location Background GO Fest 2026 Chicago", 
    "Location Background GO Fest 2026 Copenhagen",
    "Special Background GO Fest 2026 Mewtwo",
    "Special Background GO Fest 2026 Global"
  ], // Mewtwo
  155: ["Special Background DecCD2024"], // Cyndaquil
  212: ["Special Background Mega"], // Scizor
  213: ["Special Background Max Finale"], // Shuckle
  214: ["Special Background Mega"], // Heracross
  239: ["Special Background Instinct"], // Elekid
  243: ["Special Background Max Finale"], // Raikou
  244: ["Special Background Max Finale", "Location Background GO Fest 2026 Copenhagen"], // Entei
  245: ["Special Background Max Finale"], // Suicune
  248: ["Special Background Mega"], // Tyranitar
  249: ["Special Background Wild Area Global 2025", "Special Background Silver"], // Lugia
  250: ["Special Background Wild Area Global 2025", "Special Background Gold"], // Ho-Oh
  254: ["Special Background Mega"], // Sceptile
  257: ["Special Background Mega"], // Blaziken
  260: ["Special Background Mega"], // Swampert
  282: ["Special Background Mega"], // Gardevoir
  302: ["Special Background Max Finale"], // Sableye
  320: ["Special Background Max Finale"], // Wailmer
  359: ["Special Background Mega"], // Absol
  371: ["Special Background DecCD2024"], // Bagon
  373: ["Special Background Mega"], // Salamence
  374: ["Special Background DecCD2024", "Special Background Max Finale"], // Beldum
  376: ["Special Background Mega"], // Metagross
  377: ["Special Background GOFest 2025"], // Regirock
  378: ["Special Background GOFest 2025"], // Regice
  379: ["Special Background GOFest 2025"], // Registeel
  380: ["Special Background Max Finale", "Special Background Mega", "Location Card Jeju", "Location Card Bali", "Location Card Surabaya", "Location Card Yogyakarta", "Location Background Jakarta"], // Latias
  381: ["Special Background Max Finale", "Special Background Mega", "Location Card Jeju", "Location Card Bali", "Location Card Surabaya", "Location Card Yogyakarta", "Location Background Jakarta"], // Latios
  382: ["Special Background GoWildArea2024", "Special Background Sapphire", "Location Card Las Vegas", "Location Background GO Fest 2026 Copenhagen"], // Kyogre
  383: ["Special Background GoWildArea2024", "Special Background Ruby", "Location Card Las Vegas", "Location Background GO Fest 2026 Copenhagen"], // Groudon
  384: ["Location Card Las Vegas", "Location Card Osaka", "Location Card London", "Location Card NYC"], // Rayquaza
  393: ["Special Background Community 2026"], // Piplup
  445: ["Special Background Mega"], // Garchomp
  448: ["Special Background Mega"], // Lucario
  475: ["Special Background Mega"], // Gallade
  483: ["Special Background GoWildArea2024", "Special Background Diamond", "Location Card Los Angeles", "Location Background Fukuoka"], // Dialga
  484: ["Special Background GoWildArea2024", "Special Background Pearl", "Location Card Los Angeles", "Location Background Fukuoka"], // Palkia
  486: ["Special Background GOFest 2025"], // Regigigas
  488: ["Location Card Osaka", "Location Card London", "Location Card NYC"], // Cresselia
  509: ["Special Background Enigma"], // Purrloin
  519: ["Special Background Enigma", "Special Background Max Finale"], // Pidove
  525: ["Special Background Enigma"], // Boldore
  527: ["Special Background Enigma"], // Woobat
  529: ["Special Background Max Finale"], // Drilbur
  532: ["Special Background Enigma"], // Timburr
  535: ["Special Background Enigma"], // Tympole
  540: ["Special Background DecCD2024"], // Sewaddle
  551: ["Special Background Enigma"], // Sandile
  554: ["Special Background Enigma", "Special Background Max Finale"], // Darumaka
  555: ["Special Background Enigma"], // Darmanitan
  559: ["Special Background Enigma"], // Scraggy
  561: ["Special Background Enigma"], // Sigilyph
  568: ["Special Background Max Finale"], // Trubbish
  570: ["Special Background Enigma"], // Zorua
  595: ["Special Background Enigma"], // Joltik
  597: ["Special Background Enigma"], // Ferroseed
  599: ["Special Background Enigma"], // Klink
  602: ["Special Background DecCD2024"], // Tynamo
  615: ["Special Background Max Finale"], // Cryogonal
  638: ["Special Background BlackVersion", "Special Background WhiteVersion", "Special Background Tales of Transformation"], // Cobalion
  639: ["Special Background BlackVersion", "Special Background WhiteVersion"], // Terrakion
  640: ["Special Background BlackVersion", "Special Background WhiteVersion"], // Virizion
  641: ["Special Background BlackVersion"], // Tornadus
  642: ["Special Background WhiteVersion"], // Thundurus
  643: ["Special Background BlackVersion"], // Reshiram
  644: ["Special Background WhiteVersion"], // Zekrom
  645: ["Special Background BlackVersion", "Special Background WhiteVersion"], // Landorus
  646: ["Special Background GreyVersion"], // Kyurem
  649: ["Special Background BlackVersion", "Special Background WhiteVersion"], // Genesect
  672: ["Location Background Incheon"], // Skiddo
  687: ["Special Background Mega"], // Malamar
  704: ["Special Background DecCD2024"], // Goomy
  716: ["Special Background X", "Location Card Osaka", "Location Card London", "Location Card NYC"], // Xerneas
  717: ["Special Background Y", "Location Card Osaka", "Location Card London", "Location Card NYC"], // Yveltal
  722: ["Special Background DecCD2024"], // Rowlet
  725: ["Special Background DecCD2024"], // Litten
  728: ["Special Background DecCD2024"], // Popplio
  761: ["Special Background DecCD2024"], // Bounsweet
  766: ["Special Background Max Finale"], // Passimian
  785: ["Special Background Wild Area Global 2025"], // Tapu Koko
  786: ["Special Background Wild Area Global 2025"], // Tapu Lele
  787: ["Special Background Wild Area Global 2025"], // Tapu Bulu
  788: ["Special Background Wild Area Global 2025"], // Tapu Fini
  791: ["Special Background GoFest2024 Radiance", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Solgaleo
  792: ["Special Background GoFest2024 Umbra", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Lunala
  793: ["Special Background GoFest2024 Wormhole", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Nihilego
  794: ["Special Background GoFest2024 Wormhole", "Location Card NYC 2024"], // Buzzwole
  795: ["Special Background GoFest2024 Wormhole", "Location Card Madrid"], // Pheromosa
  796: ["Special Background GoFest2024 Wormhole", "Location Card Sendai"], // Xurkitree
  797: ["Special Background GoFest2024 Wormhole"], // Celesteela
  798: ["Special Background GoFest2024 Wormhole", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Kartana
  799: ["Special Background GoFest2024 Wormhole", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Guzzlord
  800: ["Special Background GoFest2024 Wormhole Sun", "Special Background GoFest2024 Wormhole Moon", "Special Background Wild Area Global 2025", "Location Card Sendai", "Location Card Madrid", "Location Card NYC 2024"], // Necrozma
  805: ["Special Background GoFest2024 Wormhole", "Location Card Sendai"], // Stakataka
  806: ["Special Background GoFest2024 Wormhole", "Location Card Madrid", "Location Card NYC 2024"], // Blacephalon
  807: ["Location Background GO Fest 2026 Copenhagen"], // Zeraora
  810: ["Special Background Max Finale"], // Grookey
  813: ["Special Background Max Finale"], // Scorbunny
  816: ["Special Background Max Finale"], // Sobble
  819: ["Special Background Max Finale"], // Skwovet
  821: ["Special Background Max Finale"], // Rookidee
  831: ["Special Background Max Finale"], // Wooloo
  849: ["Special Background GoWildArea2024", "Special Background Max Finale", "Location Background Fukuoka"], // Toxtricity
  856: ["Special Background Max Finale"], // Hatenna
  870: ["Special Background Max Finale"], // Falinks
  888: ["Special Background GOFest 2025 Sword"], // Zacian
  889: ["Special Background GOFest 2025 Shield"], // Zamazenta
  894: ["Special Background GOFest 2025"], // Regieleki
  895: ["Special Background GOFest 2025"], // Regidrago
  906: ["Special Background DualDestiny"], // Sprigatito
  909: ["Special Background MightAndMastery"], // Fuecoco
  999: ["Special Background 9th Anniversary"] // Gimmighoul
}

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

// --- FORM STATS & SPRITES MAPPING FOR ALTERNATE FORMS ---
const formStatsOverrides = {
  144: {
    "Kantonian": { attack: 192, defense: 236, stamina: 207, maxCP: 3450, types: ["Ice", "Flying"] },
    "Galarian": { attack: 250, defense: 197, stamina: 207, maxCP: 4075, types: ["Psychic", "Flying"] }
  },
  145: {
    "Kantonian": { attack: 253, defense: 185, stamina: 207, maxCP: 3987, types: ["Electric", "Flying"] },
    "Galarian": { attack: 252, defense: 189, stamina: 207, maxCP: 4012, types: ["Fighting", "Flying"] }
  },
  146: {
    "Kantonian": { attack: 251, defense: 181, stamina: 207, maxCP: 3913, types: ["Fire", "Flying"] },
    "Galarian": { attack: 202, defense: 231, stamina: 207, maxCP: 3513, types: ["Dark", "Flying"] }
  },
  483: {
    "Normal": { attack: 275, defense: 211, stamina: 205, maxCP: 4565 },
    "Origin": { attack: 270, defense: 225, stamina: 205, maxCP: 4625 }
  },
  484: {
    "Normal": { attack: 280, defense: 215, stamina: 189, maxCP: 4431 },
    "Origin": { attack: 286, defense: 223, stamina: 189, maxCP: 4683 }
  },
  487: {
    "Altered": { attack: 187, defense: 225, stamina: 284, maxCP: 3820 },
    "Origin": { attack: 225, defense: 187, stamina: 284, maxCP: 4164 }
  },
  888: {
    "Hero of Many Battles": { attack: 254, defense: 236, stamina: 192, maxCP: 4329 },
    "Crowned Sword": { attack: 332, defense: 240, stamina: 192, maxCP: 5548 }
  },
  889: {
    "Hero of Many Battles": { attack: 254, defense: 236, stamina: 192, maxCP: 4329 },
    "Crowned Shield": { attack: 254, defense: 312, stamina: 192, maxCP: 4655 }
  },
  479: {
    "Normal": { attack: 185, defense: 159, stamina: 137, maxCP: 2283 },
    "Wash": { attack: 204, defense: 219, stamina: 137, maxCP: 2883 },
    "Heat": { attack: 204, defense: 219, stamina: 137, maxCP: 2883 },
    "Mow": { attack: 204, defense: 219, stamina: 137, maxCP: 2883 },
    "Fan": { attack: 204, defense: 219, stamina: 137, maxCP: 2883 },
    "Frost": { attack: 204, defense: 219, stamina: 137, maxCP: 2883 }
  },
  492: {
    "Land": { attack: 210, defense: 210, stamina: 225, maxCP: 3726 },
    "Sky": { attack: 261, defense: 166, stamina: 225, maxCP: 4006 }
  },
  741: {
    "Baile": { attack: 196, defense: 145, stamina: 181, maxCP: 2633 },
    "Pom-Pom": { attack: 196, defense: 145, stamina: 181, maxCP: 2633 },
    "Pa'u": { attack: 196, defense: 145, stamina: 181, maxCP: 2633 },
    "Sensu": { attack: 196, defense: 145, stamina: 181, maxCP: 2633 }
  },
  646: {
    "Normal": { attack: 246, defense: 170, stamina: 245, maxCP: 4041 },
    "Black": { attack: 310, defense: 183, stamina: 245, maxCP: 5042 },
    "White": { attack: 310, defense: 183, stamina: 245, maxCP: 5042 }
  },
  720: {
    "Confined": { attack: 261, defense: 187, stamina: 173, maxCP: 3791 },
    "Unbound": { attack: 311, defense: 191, stamina: 191, maxCP: 4616 }
  },
  745: {
    "Midday": { attack: 231, defense: 140, stamina: 181, maxCP: 3073 },
    "Midnight": { attack: 218, defense: 152, stamina: 190, maxCP: 2999 },
    "Dusk": { attack: 234, defense: 139, stamina: 181, maxCP: 3105 }
  },
  800: {
    "Normal": { attack: 250, defense: 203, stamina: 220, maxCP: 4163 },
    "Dusk Mane": { attack: 277, defense: 220, stamina: 200, maxCP: 4634 },
    "Dawn Wings": { attack: 277, defense: 220, stamina: 200, maxCP: 4634 },
    "Ultra": { attack: 337, defense: 243, stamina: 220, maxCP: 5493 }
  },
  386: {
    "Normal": { attack: 345, defense: 115, stamina: 137, maxCP: 3573 },
    "Attack": { attack: 414, defense: 46, stamina: 137, maxCP: 2916 },
    "Defense": { attack: 144, defense: 330, stamina: 137, maxCP: 2246 },
    "Speed": { attack: 230, defense: 218, stamina: 137, maxCP: 3255 }
  }
};

const cloneSprites = {
  3: {
    normal: 'https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fec%2FVenusaur_clone.png',
    shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/3.png'
  },
  6: {
    normal: 'https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fd%2Fd3%2FCharizard_clone.png',
    shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png'
  },
  9: {
    normal: 'https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F22%2FBlastoise_clone.png',
    shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/9.png'
  },
  25: {
    normal: 'https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fe2%2FPikachu_clone.png',
    shiny: 'https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F9%2F96%2FPikachu_clone_shiny.png'
  }
};

const megaStatsOverrides = {
  "Mega Venusaur": {
    "attack": 241,
    "defense": 246,
    "stamina": 190,
    "maxCP": 4181,
    "types": [
      "Grass",
      "Poison"
    ]
  },
  "Mega Charizard X": {
    "attack": 273,
    "defense": 213,
    "stamina": 186,
    "maxCP": 4353,
    "types": [
      "Fire",
      "Dragon"
    ]
  },
  "Mega Charizard Y": {
    "attack": 319,
    "defense": 212,
    "stamina": 186,
    "maxCP": 5037,
    "types": [
      "Fire",
      "Flying"
    ]
  },
  "Mega Blastoise": {
    "attack": 264,
    "defense": 237,
    "stamina": 188,
    "maxCP": 4455,
    "types": [
      "Water"
    ]
  },
  "Mega Beedrill": {
    "attack": 303,
    "defense": 148,
    "stamina": 163,
    "maxCP": 3824,
    "types": [
      "Bug",
      "Poison"
    ]
  },
  "Mega Pidgeot": {
    "attack": 280,
    "defense": 175,
    "stamina": 195,
    "maxCP": 4160,
    "types": [
      "Normal",
      "Flying"
    ]
  },
  "Mega Alakazam": {
    "attack": 367,
    "defense": 207,
    "stamina": 146,
    "maxCP": 5099,
    "types": [
      "Psychic"
    ]
  },
  "Mega Victreebel": {
    "attack": 265,
    "defense": 181,
    "stamina": 190,
    "maxCP": 3963,
    "types": [
      "Grass",
      "Poison"
    ]
  },
  "Mega Slowbro": {
    "attack": 224,
    "defense": 259,
    "stamina": 216,
    "maxCP": 4245,
    "types": [
      "Water",
      "Psychic"
    ]
  },
  "Mega Gengar": {
    "attack": 349,
    "defense": 199,
    "stamina": 155,
    "maxCP": 4902,
    "types": [
      "Ghost",
      "Poison"
    ]
  },
  "Mega Kangaskhan": {
    "attack": 246,
    "defense": 210,
    "stamina": 233,
    "maxCP": 4353,
    "types": [
      "Normal"
    ]
  },
  "Mega Pinsir": {
    "attack": 305,
    "defense": 231,
    "stamina": 163,
    "maxCP": 4728,
    "types": [
      "Bug",
      "Flying"
    ]
  },
  "Mega Gyarados": {
    "attack": 292,
    "defense": 247,
    "stamina": 216,
    "maxCP": 5332,
    "types": [
      "Water",
      "Dark"
    ]
  },
  "Mega Aerodactyl": {
    "attack": 292,
    "defense": 210,
    "stamina": 190,
    "maxCP": 4655,
    "types": [
      "Rock",
      "Flying"
    ]
  },
  "Mega Dragonite": {
    "attack": 299,
    "defense": 255,
    "stamina": 209,
    "maxCP": 5452,
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  "Mega Mewtwo X": {
    "attack": 399,
    "defense": 215,
    "stamina": 228,
    "maxCP": 6910,
    "types": [
      "Psychic",
      "Fighting"
    ]
  },
  "Mega Mewtwo Y": {
    "attack": 413,
    "defense": 223,
    "stamina": 228,
    "maxCP": 7267,
    "types": [
      "Psychic"
    ]
  },
  "Mega Ampharos": {
    "attack": 294,
    "defense": 203,
    "stamina": 207,
    "maxCP": 4799,
    "types": [
      "Electric",
      "Dragon"
    ]
  },
  "Mega Steelix": {
    "attack": 212,
    "defense": 327,
    "stamina": 181,
    "maxCP": 4149,
    "types": [
      "Steel",
      "Ground"
    ]
  },
  "Mega Scizor": {
    "attack": 279,
    "defense": 250,
    "stamina": 172,
    "maxCP": 4621,
    "types": [
      "Bug",
      "Steel"
    ]
  },
  "Mega Heracross": {
    "attack": 334,
    "defense": 223,
    "stamina": 190,
    "maxCP": 5443,
    "types": [
      "Bug",
      "Fighting"
    ]
  },
  "Mega Skarmory": {
    "attack": 273,
    "defense": 228,
    "stamina": 163,
    "maxCP": 4229,
    "types": [
      "Steel",
      "Flying"
    ]
  },
  "Mega Houndoom": {
    "attack": 289,
    "defense": 194,
    "stamina": 181,
    "maxCP": 4344,
    "types": [
      "Dark",
      "Fire"
    ]
  },
  "Mega Tyranitar": {
    "attack": 309,
    "defense": 276,
    "stamina": 225,
    "maxCP": 6045,
    "types": [
      "Rock",
      "Dark"
    ]
  },
  "Mega Sceptile": {
    "attack": 320,
    "defense": 186,
    "stamina": 172,
    "maxCP": 4585,
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  "Mega Blaziken": {
    "attack": 329,
    "defense": 168,
    "stamina": 190,
    "maxCP": 4704,
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  "Mega Swampert": {
    "attack": 283,
    "defense": 218,
    "stamina": 225,
    "maxCP": 4975,
    "types": [
      "Water",
      "Ground"
    ]
  },
  "Mega Gardevoir": {
    "attack": 326,
    "defense": 229,
    "stamina": 169,
    "maxCP": 5101,
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  "Mega Sableye": {
    "attack": 151,
    "defense": 216,
    "stamina": 137,
    "maxCP": 2196,
    "types": [
      "Dark",
      "Ghost"
    ]
  },
  "Mega Mawile": {
    "attack": 188,
    "defense": 217,
    "stamina": 137,
    "maxCP": 2691,
    "types": [
      "Steel",
      "Fairy"
    ]
  },
  "Mega Aggron": {
    "attack": 247,
    "defense": 331,
    "stamina": 172,
    "maxCP": 4705,
    "types": [
      "Steel"
    ]
  },
  "Mega Medicham": {
    "attack": 205,
    "defense": 179,
    "stamina": 155,
    "maxCP": 2821,
    "types": [
      "Fighting",
      "Psychic"
    ]
  },
  "Mega Manectric": {
    "attack": 286,
    "defense": 179,
    "stamina": 172,
    "maxCP": 4048,
    "types": [
      "Electric"
    ]
  },
  "Mega Sharpedo": {
    "attack": 289,
    "defense": 144,
    "stamina": 172,
    "maxCP": 3701,
    "types": [
      "Water",
      "Dark"
    ]
  },
  "Mega Camerupt": {
    "attack": 253,
    "defense": 183,
    "stamina": 172,
    "maxCP": 3641,
    "types": [
      "Fire",
      "Ground"
    ]
  },
  "Mega Altaria": {
    "attack": 222,
    "defense": 218,
    "stamina": 181,
    "maxCP": 3576,
    "types": [
      "Dragon",
      "Fairy"
    ]
  },
  "Mega Banette": {
    "attack": 312,
    "defense": 160,
    "stamina": 162,
    "maxCP": 4063,
    "types": [
      "Ghost"
    ]
  },
  "Mega Absol": {
    "attack": 314,
    "defense": 130,
    "stamina": 163,
    "maxCP": 3732,
    "types": [
      "Dark"
    ]
  },
  "Mega Glalie": {
    "attack": 252,
    "defense": 168,
    "stamina": 190,
    "maxCP": 3651,
    "types": [
      "Ice"
    ]
  },
  "Mega Salamence": {
    "attack": 310,
    "defense": 251,
    "stamina": 216,
    "maxCP": 5688,
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  "Mega Metagross": {
    "attack": 300,
    "defense": 289,
    "stamina": 190,
    "maxCP": 5552,
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  "Mega Latias": {
    "attack": 289,
    "defense": 297,
    "stamina": 190,
    "maxCP": 5428,
    "types": [
      "Dragon",
      "Psychic"
    ]
  },
  "Mega Latios": {
    "attack": 335,
    "defense": 241,
    "stamina": 190,
    "maxCP": 5661,
    "types": [
      "Dragon",
      "Psychic"
    ]
  },
  "Mega Rayquaza": {
    "attack": 377,
    "defense": 210,
    "stamina": 227,
    "maxCP": 6458,
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  "Mega Lopunny": {
    "attack": 282,
    "defense": 214,
    "stamina": 163,
    "maxCP": 4234,
    "types": [
      "Normal",
      "Fighting"
    ]
  },
  "Mega Garchomp": {
    "attack": 339,
    "defense": 222,
    "stamina": 239,
    "maxCP": 6132,
    "types": [
      "Dragon",
      "Ground"
    ]
  },
  "Mega Lucario": {
    "attack": 310,
    "defense": 175,
    "stamina": 172,
    "maxCP": 4325,
    "types": [
      "Fighting",
      "Steel"
    ]
  },
  "Mega Abomasnow": {
    "attack": 240,
    "defense": 191,
    "stamina": 207,
    "maxCP": 3850,
    "types": [
      "Grass",
      "Ice"
    ]
  },
  "Mega Gallade": {
    "attack": 326,
    "defense": 230,
    "stamina": 169,
    "maxCP": 5112,
    "types": [
      "Psychic",
      "Fighting"
    ]
  },
  "Mega Audino": {
    "attack": 147,
    "defense": 239,
    "stamina": 230,
    "maxCP": 2853,
    "types": [
      "Normal",
      "Fairy"
    ]
  },
  "Mega Malamar": {
    "attack": 208,
    "defense": 222,
    "stamina": 200,
    "maxCP": 3554,
    "types": [
      "Dark",
      "Psychic"
    ]
  },
  "Mega Diancie": {
    "attack": 342,
    "defense": 235,
    "stamina": 137,
    "maxCP": 4913,
    "types": [
      "Rock",
      "Fairy"
    ]
  },
  "Mega Falinks": {
    "attack": 267,
    "defense": 229,
    "stamina": 163,
    "maxCP": 4149,
    "types": [
      "Fighting"
    ]
  }
};

const megaPrimalSprites = {
  "Mega Venusaur": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F4%2F4a%2FVenusaur_mega.png",
  "Mega Charizard X": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F1%2F1a%2FCharizard_x_mega.png",
  "Mega Charizard Y": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F0%2F08%2FCharizard_y_mega.png",
  "Mega Blastoise": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F23%2FBlastoise_mega.png",
  "Mega Beedrill": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F1%2F14%2FBeedrill_mega.png",
  "Mega Pidgeot": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fa%2Fa2%2FPidgeot_mega.png",
  "Mega Alakazam": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F2e%2FAlakazam_mega.png",
  "Mega Victreebel": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F1%2F12%2FVictreebel_mega.png",
  "Mega Slowbro": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fee%2FSlowbro_mega.png",
  "Mega Gengar": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F4%2F4f%2FGengar_mega.png",
  "Mega Kangaskhan": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fee%2FKangaskhan_mega.png",
  "Mega Pinsir": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F3%2F3f%2FPinsir_mega.png",
  "Mega Gyarados": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F9%2F96%2FGyarados_mega.png",
  "Mega Aerodactyl": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F0%2F06%2FAerodactyl_mega.png",
  "Mega Dragonite": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Ff%2Ffe%2FDragonite_mega.png",
  "Mega Mewtwo X": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F9%2F90%2FMewtwo_x_mega.png",
  "Mega Mewtwo Y": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F2a%2FMewtwo_y_mega.png",
  "Mega Ampharos": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F8%2F81%2FAmpharos_mega.png",
  "Mega Steelix": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F7%2F76%2FSteelix_mega.png",
  "Mega Scizor": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F3%2F36%2FScizor_mega.png",
  "Mega Heracross": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F6%2F64%2FHeracross_mega.png",
  "Mega Skarmory": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fa%2Fa1%2FSkarmory_mega.png",
  "Mega Houndoom": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F7%2F72%2FHoundoom_mega.png",
  "Mega Tyranitar": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F9%2F9d%2FTyranitar_mega.png",
  "Mega Sceptile": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F2c%2FSceptile_mega.png",
  "Mega Blaziken": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F7%2F76%2FBlaziken_mega.png",
  "Mega Swampert": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F4%2F4f%2FSwampert_mega.png",
  "Mega Gardevoir": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F8%2F8c%2FGardevoir_mega.png",
  "Mega Sableye": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fe3%2FSableye_mega.png",
  "Mega Mawile": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F9%2F97%2FMawile_mega.png",
  "Mega Aggron": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fa%2Fa5%2FAggron_mega.png",
  "Mega Medicham": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F6%2F64%2FMedicham_mega.png",
  "Mega Manectric": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Ff%2Ff4%2FManectric_mega.png",
  "Mega Sharpedo": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F21%2FSharpedo_mega.png",
  "Mega Camerupt": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fe%2Fea%2FCamerupt_mega.png",
  "Mega Altaria": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Ff%2Ffa%2FAltaria_mega.png",
  "Mega Banette": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F7%2F75%2FBanette_mega.png",
  "Mega Absol": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F2c%2FAbsol_mega.png",
  "Mega Glalie": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fa%2Fac%2FGlalie_mega.png",
  "Mega Salamence": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F3%2F3f%2FSalamence_mega.png",
  "Mega Metagross": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F1%2F19%2FMetagross_mega.png",
  "Mega Latias": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F2%2F21%2FLatias_mega.png",
  "Mega Latios": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F4%2F40%2FLatios_mega.png",
  "Mega Rayquaza": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Ff%2Ff4%2FRayquaza_mega.png",
  "Mega Lopunny": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fd%2Fd1%2FLopunny_mega.png",
  "Mega Garchomp": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fd%2Fdc%2FGarchomp_mega.png",
  "Mega Lucario": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fc%2Fc9%2FLucario_mega.png",
  "Mega Abomasnow": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fd%2Fd2%2FAbomasnow_mega.png",
  "Mega Gallade": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fb%2Fb0%2FGallade_mega.png",
  "Mega Audino": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F3%2F30%2FAudino_mega.png",
  "Mega Malamar": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fc%2Fc6%2FMalamar_mega.png",
  "Mega Diancie": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F0%2F03%2FDiancie_mega.png",
  "Mega Falinks": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Ff%2Ff9%2FFalinks_mega.png",
  "Primal Kyogre": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2F5%2F5f%2FKyogre_primal.png",
  "Primal Groudon": "https://images.weserv.nl/?url=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fpokemongo%2Fimages%2Fd%2Fdf%2FGroudon_primal.png"
};

function getFormSprite(pokemonId, formName) {
  const f = formName.toLowerCase();
  
  if (f === 'clone') {
    if (cloneSprites[pokemonId]) {
      return cloneSprites[pokemonId].normal;
    }
  }
  
  if (pokemonId === 649) { // Genesect
    if (f.includes('shock')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/649-shock.png';
    if (f.includes('burn')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/649-burn.png';
    if (f.includes('chill')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/649-chill.png';
    if (f.includes('douse')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/649-douse.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/649.png';
  }
  if (pokemonId === 144 && f === 'galarian') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10169.png';
  if (pokemonId === 145 && f === 'galarian') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10170.png';
  if (pokemonId === 146 && f === 'galarian') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10171.png';
  
  if (pokemonId === 483) {
    if (f === 'origin') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10245.png';
    }
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/483.png';
  }
  
  if (pokemonId === 484) {
    if (f === 'origin') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10246.png';
    }
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/484.png';
  }
  
  if (pokemonId === 487) {
    if (f === 'origin') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10007.png';
    }
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/487.png';
  }

  if (pokemonId === 479) { // Rotom
    if (f === 'wash') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10009.png';
    if (f === 'heat') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10008.png';
    if (f === 'mow') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10012.png';
    if (f === 'fan') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10011.png';
    if (f === 'frost') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10010.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png';
  }

  if (pokemonId === 492) { // Shaymin
    if (f === 'sky') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10006.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/492.png';
  }

  if (pokemonId === 741) { // Oricorio
    if (f === 'pom-pom') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10123.png';
    if (f === 'pa\'u' || f === 'pa-u') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10124.png';
    if (f === 'sensu') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10125.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/741.png';
  }

  if (pokemonId === 888) { // Zacian
    if (f.includes('crowned')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10188.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/888.png';
  }

  if (pokemonId === 889) { // Zamazenta
    if (f.includes('crowned')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10189.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/889.png';
  }

  if (pokemonId === 646) { // Kyurem
    if (f === 'black') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10022.png';
    if (f === 'white') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10023.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/646.png';
  }

  if (pokemonId === 720) { // Hoopa
    if (f === 'unbound') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10086.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/720.png';
  }

  if (pokemonId === 745) { // Lycanroc
    if (f === 'midnight') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10126.png';
    if (f === 'dusk') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10152.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/745.png';
  }

  if (pokemonId === 800) { // Necrozma
    if (f.includes('dusk') || f.includes('mane')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10155.png';
    if (f.includes('dawn') || f.includes('wings')) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10156.png';
    if (f === 'ultra') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10157.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/800.png';
  }

  if (pokemonId === 386) { // Deoxys
    if (f === 'attack') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10001.png';
    if (f === 'defense') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10002.png';
    if (f === 'speed') return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10003.png';
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/386.png';
  }

  if (pokemonId === 201) {
    if (f === 'a') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201.png';
    }
    if (f === '!') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-exclamation.png';
    }
    if (f === '?') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-question.png';
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-${f}.png`;
  }
  
  if (pokemonId === 327) {
    const match = f.match(/\d+/);
    if (match) {
      const idx = parseInt(match[0]);
      if (idx === 1) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/327.png';
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/327-${idx}.png`;
    }
  }

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

let carouselSlides = [];
let carouselCurrentIndex = 0;

function renderCarousel(p) {
  const track = document.getElementById('modal-carousel-track');
  const badge = document.getElementById('modal-carousel-badge');
  const container = document.getElementById('modal-carousel-container');
  if (!track || !badge || !container) return;

  carouselSlides = [];
  carouselCurrentIndex = 0;
  window.currentOpenPokemon = p;

  const forms = (p.forms && p.forms.length > 0) ? p.forms : ['Normal'];

  forms.forEach(formName => {
    const formSprite = getFormSprite(p.id, formName);
    
    let formShinySprite = '';
    if (formName.toLowerCase() === 'clone' && cloneSprites[p.id]) {
      formShinySprite = cloneSprites[p.id].shiny;
    } else if (formSprite.includes('official-artwork/')) {
      formShinySprite = formSprite.replace('official-artwork/', 'official-artwork/shiny/');
    } else if (formSprite.includes('pokemon/')) {
      formShinySprite = formSprite.replace('pokemon/', 'pokemon/shiny/');
    } else {
      formShinySprite = formSprite;
    }

    // Normal slide
    carouselSlides.push({
      label: formName === 'Normal' ? 'Normal' : formName,
      src: formSprite,
      isMax: false,
      formName: formName,
      slideType: 'normal'
    });

    // Shiny slide
    carouselSlides.push({
      label: formName === 'Normal' ? 'Shiny' : `Shiny ${formName}`,
      src: formShinySprite,
      isMax: false,
      formName: formName,
      slideType: 'shiny'
    });
  });

  // Megas / Primals
  if (p.mega) {
    if (p.mega.variants) {
      p.mega.variants.forEach(v => {
        const sprite = megaPrimalSprites[v.name] || getFormSprite(p.id, 'Normal');
        carouselSlides.push({
          label: v.name,
          src: sprite,
          isMax: false,
          formName: 'Normal',
          slideType: 'mega',
          megaData: v
        });
      });
    } else {
      const sprite = megaPrimalSprites[p.mega.name] || getFormSprite(p.id, 'Normal');
      carouselSlides.push({
        label: p.mega.name,
        src: sprite,
        isMax: false,
        formName: 'Normal',
        slideType: 'mega',
        megaData: p.mega
      });
    }
  }

  // Max
  if (p.max && p.max.released) {
    const label = p.max.gmax ? "Gigantamax" : "Dynamax";
    carouselSlides.push({
      label: label,
      src: getFormSprite(p.id, 'Normal'),
      isMax: true,
      formName: 'Normal',
      slideType: 'max'
    });
  }

  // Render track HTML
  track.innerHTML = carouselSlides.map((slide, idx) => {
    const maxStyle = slide.isMax ? 'filter: drop-shadow(0 0 12px rgba(155, 89, 182, 0.85)) drop-shadow(0 0 4px rgba(155, 89, 182, 0.5));' : '';
    return `
      <div class="carousel-slide" data-index="${idx}">
        <img src="${slide.src}" alt="${slide.label}" style="max-width: 120px; max-height: 120px; object-fit: contain; ${maxStyle}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';">
      </div>
    `;
  }).join('');

  // Render dots HTML
  const dotsContainer = document.getElementById('modal-carousel-dots');
  if (dotsContainer) {
    if (carouselSlides.length > 1) {
      dotsContainer.style.display = 'flex';
      dotsContainer.innerHTML = carouselSlides.map((slide, idx) => {
        return `<span class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="jumpToCarouselSlide(${idx})"></span>`;
      }).join('');
    } else {
      dotsContainer.style.display = 'none';
      dotsContainer.innerHTML = '';
    }
  }

  updateCarouselDisplay();

  // Setup swipe handlers (if not already set)
  if (!container.dataset.swipeInitialized) {
    container.dataset.swipeInitialized = 'true';
    let startX = 0;
    container.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    container.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - startX;
      if (deltaX > 40) {
        changeCarouselSlide(-1);
      } else if (deltaX < -40) {
        changeCarouselSlide(1);
      }
    }, { passive: true });
  }
}

function changeCarouselSlide(direction) {
  if (carouselSlides.length <= 1) return;
  carouselCurrentIndex = (carouselCurrentIndex + direction + carouselSlides.length) % carouselSlides.length;
  updateCarouselDisplay();
}

function jumpToCarouselSlide(index) {
  if (carouselSlides.length <= 1) return;
  if (index < 0 || index >= carouselSlides.length) return;
  carouselCurrentIndex = index;
  updateCarouselDisplay();
}

function updateCarouselDisplay() {
  const track = document.getElementById('modal-carousel-track');
  const badge = document.getElementById('modal-carousel-badge');
  if (!track || !badge) return;

  track.style.transform = `translateX(-${carouselCurrentIndex * 100}%)`;
  const slide = carouselSlides[carouselCurrentIndex];
  if (slide) {
    badge.textContent = slide.label;
    updateStatsForCurrentSlide(slide);
  }

  // Update dots active class
  const dots = document.querySelectorAll('#modal-carousel-dots .carousel-dot');
  dots.forEach((dot, idx) => {
    if (idx === carouselCurrentIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function updateStatsForCurrentSlide(slide) {
  const p = window.currentOpenPokemon;
  if (!p) return;

  let attack = p.baseStats.attack;
  let defense = p.baseStats.defense;
  let stamina = p.baseStats.stamina;
  let maxCP = p.maxCP;
  let types = p.types;

  if (slide.slideType === 'mega' && slide.megaData) {
    const m = slide.megaData;
    maxCP = m.maxCP;
    types = m.types;
    
    const megaName = m.name;
    const overrides = megaStatsOverrides[megaName];
    if (overrides) {
      attack = overrides.attack;
      defense = overrides.defense;
      stamina = overrides.stamina;
      if (overrides.types) types = overrides.types;
      if (overrides.maxCP) maxCP = overrides.maxCP;
    }
  } else {
    const formName = slide.formName;
    if (formName && formStatsOverrides[p.id] && formStatsOverrides[p.id][formName]) {
      const s = formStatsOverrides[p.id][formName];
      attack = s.attack;
      defense = s.defense;
      stamina = s.stamina;
      maxCP = s.maxCP;
      if (s.types) types = s.types;
    }
  }

  const cpEl = document.getElementById('modal-stat-cp');
  if (cpEl) cpEl.textContent = maxCP;
  
  const attEl = document.getElementById('modal-base-att');
  if (attEl) attEl.textContent = attack;
  
  const defEl = document.getElementById('modal-base-def');
  if (defEl) defEl.textContent = defense;
  
  const staEl = document.getElementById('modal-base-sta');
  if (staEl) staEl.textContent = stamina;

  const typesEl = document.getElementById('modal-poke-types');
  if (typesEl) {
    typesEl.innerHTML = types.map(t => getTypeBadgeHtml(t)).join(' ');
  }

  const coverage = calculateTypeEffectiveness(types);
  const strengthDiv = document.getElementById('modal-strengths');
  const weaknessDiv = document.getElementById('modal-weaknesses');
  
  if (strengthDiv) {
    strengthDiv.innerHTML = coverage.strengths.length > 0
      ? coverage.strengths.map(t => `<span class="coverage-badge-strong">${t}</span>`).join(' ')
      : `<span style="font-size:11px; color:var(--text-dim);">None</span>`;
  }
  if (weaknessDiv) {
    weaknessDiv.innerHTML = coverage.weaknesses.length > 0
      ? coverage.weaknesses.map(w => `<span class="coverage-badge-weak">${w.type} (${w.mult})</span>`).join(' ')
      : `<span style="font-size:11px; color:var(--text-dim);">None</span>`;
  }

  const hundoTable = document.getElementById('modal-hundo-cp-table-body');
  if (hundoTable) {
    const tempStats = { attack, defense, stamina };
    hundoTable.innerHTML = `
      <tr><td>Research Task</td><td>Level 15</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(tempStats, 15).toLocaleString()} CP</td></tr>
      <tr><td>Eggs / Raids</td><td>Level 20</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(tempStats, 20).toLocaleString()} CP</td></tr>
      <tr><td>Weather Boosted Raids</td><td>Level 25</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(tempStats, 25).toLocaleString()} CP</td></tr>
      <tr><td>Wild Encounters</td><td>Level 30</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(tempStats, 30).toLocaleString()} CP</td></tr>
      <tr><td>Weather Boosted Wild</td><td>Level 35</td><td style="font-weight:700; color:var(--color-accent);">${calculateHundoCP(tempStats, 35).toLocaleString()} CP</td></tr>
    `;
  }

  try { balanceModalColumns(); } catch (e) {}
}

function getUpcomingEventForPokemon(pokemonName) {
  const savedEvents = localStorage.getItem('pokego_tracker_events_json');
  if (!savedEvents) return null;
  let events = [];
  try {
    events = JSON.parse(savedEvents);
  } catch (e) {
    return null;
  }
  
  let baseDate = new Date();
  if (baseDate.getFullYear() !== 2026) {
    baseDate = new Date('2026-06-10T17:52:29+05:30');
  }
  const fourWeeksLater = new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000);
  
  for (const e of events) {
    if (!e || !e.start || !e.name) continue;
    const start = new Date(e.start);
    if (start >= baseDate && start <= fourWeeksLater) {
      const nameLower = e.name.toLowerCase();
      const pNameLower = pokemonName.toLowerCase();
      if (nameLower.includes(pNameLower) || (pNameLower === 'squawkabilly' && nameLower.includes('flying taxi'))) {
        return e;
      }
    }
  }
  return null;
}

async function fetchRealtimeAvailability(pokemonName) {
  const query = encodeURIComponent(`site:pokemongo.fandom.com pokemon go how to get ${pokemonName}`);
  const url = `https://corsproxy.io/?https://html.duckduckgo.com/html/?q=${query}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch from search');
    const text = await res.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const snippets = doc.querySelectorAll('.result__snippet');
    
    if (snippets.length > 0) {
      let combinedText = "";
      let count = 0;
      snippets.forEach(s => {
        if (count < 3) {
          const content = s.textContent.trim();
          if (content && !combinedText.includes(content.substring(0, 20))) {
            combinedText += (combinedText ? " " : "") + content;
            count++;
          }
        }
      });
      if (combinedText.trim()) {
        return {
          method: "Real-time Web Search",
          details: combinedText,
          sources: ["DuckDuckGo Web Index"]
        };
      }
    }
  } catch (e) {
    console.error("Real-time search error:", e);
  }
  return null;
}

function showPokemonDetail(id) {
  const p = window.pokemonDatabase.find(x => x.id === id);
  if (!p) return;
  
  // Reset modal scroll position to top (instant)
  const modalBody = document.querySelector('#detail-modal .modal-body');
  if (modalBody) {
    modalBody.scrollTop = 0;
  }
  
  document.getElementById('modal-poke-id').textContent = `#${String(p.id).padStart(3, '0')}`;
  
  const rarityBadge = document.getElementById('modal-poke-rarity');
  rarityBadge.className = `pokemon-rarity-badge rarity-${p.rank.replace('+', '-plus')}`;
  rarityBadge.textContent = `Rank ${p.rank}`;
  
  document.getElementById('modal-poke-name').textContent = p.name;
  document.getElementById('modal-poke-category').textContent = p.category;
  
  const typesCont = document.getElementById('modal-poke-types');
  typesCont.innerHTML = p.types.map(t => getTypeBadgeHtml(t)).join(' ');

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

  document.getElementById('modal-stat-utility').textContent = p.utility === 'meta' ? 'Meta Rank' : 'Standard';
  document.getElementById('modal-stat-exclusivity').textContent = p.exclusivity === 'none' ? 'Common' : p.exclusivity.toUpperCase();
  
  // Render Availability Section
  const availMethodEl = document.getElementById('modal-availability-method');
  const availDetailsEl = document.getElementById('modal-availability-details');
  const availSourcesEl = document.getElementById('modal-availability-sources');
  
  if (p.availability) {
    if (availMethodEl) availMethodEl.textContent = p.availability.method;
    
    let detailsText = p.availability.details;
    const upcomingEvent = getUpcomingEventForPokemon(p.name);
    if (upcomingEvent) {
      const eventStart = new Date(upcomingEvent.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      detailsText += `\n\n🚀 Upcoming Event: "${upcomingEvent.name}" starting on ${eventStart}.`;
    }
    if (availDetailsEl) {
      availDetailsEl.style.whiteSpace = 'pre-wrap';
      availDetailsEl.textContent = detailsText;
    }
    
    if (availSourcesEl) {
      availSourcesEl.textContent = `Sources cited: ${p.availability.sources.join(', ')}`;
    }
  }

  // Fetch and update availability in real-time in the background
  fetchRealtimeAvailability(p.name).then(realtime => {
    const currentNameEl = document.getElementById('modal-poke-name');
    if (realtime && currentNameEl && currentNameEl.textContent === p.name) {
      if (availMethodEl) availMethodEl.textContent = realtime.method;
      
      let detailsText = realtime.details;
      const upcomingEvent = getUpcomingEventForPokemon(p.name);
      if (upcomingEvent) {
        const eventStart = new Date(upcomingEvent.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        detailsText += `\n\n🚀 Upcoming Event: "${upcomingEvent.name}" starting on ${eventStart}.`;
      }
      
      if (availDetailsEl) {
        availDetailsEl.textContent = detailsText;
      }
      if (availSourcesEl) {
        availSourcesEl.textContent = `Sources cited: ${realtime.sources.join(', ')}`;
      }

      // Auto-toggle released state if real-time search finds it is released
      const methodLower = realtime.method.toLowerCase();
      const detailsLower = realtime.details.toLowerCase();
      const isUnreleased = methodLower.includes('unreleased') || 
                           detailsLower.includes('currently unreleased') || 
                           detailsLower.includes('is not yet released') || 
                           detailsLower.includes('not currently available') ||
                           detailsLower.includes('remains unreleased');
      
      if (!isUnreleased) {
        if (!p.released) {
          p.released = true;
          p.availability = realtime;
          
          // Persist the updated release status
          const savedReleased = localStorage.getItem('pokego_tracker_released_ids');
          let releasedIds = [];
          if (savedReleased) {
            try { releasedIds = JSON.parse(savedReleased); } catch (e) {}
          }
          if (!releasedIds.includes(p.id)) {
            releasedIds.push(p.id);
            localStorage.setItem('pokego_tracker_released_ids', JSON.stringify(releasedIds));
          }
          
          renderPokedex();
        }
      }
    }
  });

  // Render Carousel & Backgrounds Button
  const viewBgsBtn = document.getElementById('modal-view-backgrounds-btn');
  const hasBgs = pokemonBackgroundsMap[p.id] && pokemonBackgroundsMap[p.id].length > 0;
  
  if (viewBgsBtn) {
    if (hasBgs) {
      viewBgsBtn.style.display = 'flex';
      viewBgsBtn.onclick = () => openBackgroundsPopup(p.id);
    } else {
      viewBgsBtn.style.display = 'none';
    }
  }

  // Initialize unified carousel
  renderCarousel(p);


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
                <li>• <strong style="color: var(--text-main);">${v.name}</strong>: Max CP <span style="color: var(--color-secondary); font-weight: 700;">${v.maxCP}</span>, Type: ${v.types.map(t => getTypeBadgeHtml(t, "font-size: 7px; padding: 0px 4px;")).join(' ')}</li>
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
          <li><strong>Types:</strong> ${p.mega.types.map(t => getTypeBadgeHtml(t, "font-size: 7px; padding: 0px 4px;")).join(' ')}</li>
        </ul>
      `;
      megaDetails.innerHTML = listHTML;
    }
  } else {
    megaSection.style.display = 'none';
  }
  
  // Max details
  const maxSection = document.getElementById('modal-max-section');
  const maxDetails = document.getElementById('modal-max-details');
  if (p.max && p.max.released) {
    maxSection.style.display = 'block';
    if (maxDetails) {
      if (p.max.gmax) {
        maxDetails.textContent = `Can Dynamax in Max Battles and unlock Max Moves using Max Particles. Gigantamax form is eligible!`;
      } else {
        maxDetails.textContent = `Can Dynamax in Max Battles and unlock Max Moves using Max Particles.`;
      }
    }
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
  
  // Render Forms Caught Checklist
  const formsSection = document.getElementById('modal-forms-section');
  const formsChecklist = document.getElementById('modal-forms-checklist');
  if (p.forms && formsSection && formsChecklist) {
    formsSection.style.display = 'block';
    formsChecklist.innerHTML = '';
    
    const userState = state.pokemonCollection[id] || { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: [] };
    const caught = userState.caughtForms || [];
    
    p.forms.forEach(form => {
      const isChecked = caught.includes(form);
      const item = document.createElement('label');
      item.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px; cursor:pointer; color:var(--text-main); margin-bottom:4px;';
      item.innerHTML = `
        <input type="checkbox" style="accent-color:var(--color-primary);" ${isChecked ? 'checked' : ''} onchange="toggleFormCaught(${p.id}, '${form.replace(/'/g, "\\'")}', this.checked)">
        <span>${form}</span>
      `;
      formsChecklist.appendChild(item);
    });
  } else if (formsSection) {
    formsSection.style.display = 'none';
  }

  // Render Backgrounds Caught Checklist
  const bgSection = document.getElementById('modal-backgrounds-section');
  const bgChecklist = document.getElementById('modal-backgrounds-checklist');
  if (pokemonBackgroundsMap[id] && bgSection && bgChecklist) {
    bgSection.style.display = 'block';
    bgChecklist.innerHTML = '';
    
    const userState = state.pokemonCollection[id] || { owned: false, shiny: false, shadow: false, lucky: false, favorite: false, hundo: false, mega: false, max: false, caughtForms: [], caughtBackgrounds: [] };
    const caughtBgs = userState.caughtBackgrounds || [];
    
    pokemonBackgroundsMap[id].forEach(bg => {
      const isChecked = caughtBgs.includes(bg);
      const item = document.createElement('label');
      item.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px; cursor:pointer; color:var(--text-main); margin-bottom:4px;';
      item.innerHTML = `
        <input type="checkbox" style="accent-color:var(--color-primary);" ${isChecked ? 'checked' : ''} onchange="toggleBackgroundCaught(${id}, '${bg.replace(/'/g, "\\'")}', this.checked)">
        <span>${bg}</span>
      `;
      bgChecklist.appendChild(item);
    });
  } else if (bgSection) {
    bgSection.style.display = 'none';
  }
  
  document.getElementById('modal-opt-tip').textContent = p.tips;
  document.getElementById('detail-modal').style.display = 'flex';
  lockBodyScroll();
  try { balanceModalColumns(); } catch (e) { console.error("Error balancing modal:", e); }

  // Double scroll reset to make sure it scrolls to top
  if (modalBody) {
    modalBody.scrollTop = 0;
    setTimeout(() => {
      modalBody.scrollTop = 0;
    }, 50);
  }
}

function closeModal(event) {
  if (!event || event.target.id === 'detail-modal' || event.target.className === 'close-modal-btn') {
    document.getElementById('detail-modal').style.display = 'none';
    unlockBodyScroll();
    const modalBody = document.querySelector('#detail-modal .modal-body');
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
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
  
  let renderedCount = 0;
  medalsDatabase.forEach(m => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return;
    
    const medalState = state.medals[m.id] || { tier: 'none', progress: 0, hidden: false };
    
    if (medalState.hidden) {
      hasHiddenMedals = true;
      return; // Skip rendering
    }
    
    if (currentUserSession === null && renderedCount >= 6) {
      return; // Limit to 6 medals for guests
    }
    renderedCount++;
    
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
    
    let visualHTML = '';
    if (m.category === 'type') {
      const typeName = m.id.replace('type-', '');
      const typeNameCapitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      visualHTML = getTypeLogoOnlyHtml(typeNameCapitalized, "width: 32px; height: 32px;");
    } else {
      visualHTML = `<i class="${m.icon || 'fa-solid fa-award'}"></i>`;
    }
    
    const isLoggedIn = currentUserSession !== null;
    card.innerHTML = `
      <button class="medal-hide-btn" onclick="hideMedal('${m.id}')" title="Hide this medal from tracker" ${isLoggedIn ? '' : 'disabled'}>
        <i class="fa-solid fa-eye-slash"></i>
      </button>
      <div class="medal-top-row">
        <div class="medal-visual-container">${visualHTML}</div>
        <div class="medal-title-group">
          <h4>${m.name}</h4>
          <span class="medal-category-tag">${m.category}</span>
        </div>
      </div>
      <p style="font-size:11px; color:var(--text-muted); line-height:1.4; padding-right:16px;">${m.desc}</p>
      
      <div class="medal-tier-selector-group">
        <button class="medal-tier-btn bronze ${currentTier === 'bronze' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'bronze')" ${isLoggedIn ? '' : 'disabled'}>Bronze</button>
        <button class="medal-tier-btn silver ${currentTier === 'silver' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'silver')" ${isLoggedIn ? '' : 'disabled'}>Silver</button>
        <button class="medal-tier-btn gold ${currentTier === 'gold' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'gold')" ${isLoggedIn ? '' : 'disabled'}>Gold</button>
        <button class="medal-tier-btn platinum ${currentTier === 'platinum' ? 'active' : ''}" onclick="setMedalTier('${m.id}', 'platinum')" ${isLoggedIn ? '' : 'disabled'}>Platinum</button>
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
          <input type="number" class="medal-progress-input" value="${progressVal}" min="0" oninput="updateMedalValue('${m.id}', this.value)" ${isLoggedIn ? '' : 'disabled'}>
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

  // Guest CTA for medals
  if (currentUserSession === null) {
    const ctaCard = document.createElement('div');
    ctaCard.className = 'medal-card auth-cta-card';
    ctaCard.style.cssText = 'grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(191, 85, 236, 0.08), rgba(255, 42, 122, 0.08)); border: 1px dashed rgba(191, 85, 236, 0.3); border-radius: 12px; margin-top: 10px; cursor: pointer; transition: border-color 0.2s; width: 100%;';
    ctaCard.setAttribute('onclick', 'openAuthModal()');
    ctaCard.innerHTML = `
      <i class="fa-solid fa-lock" style="font-size: 24px; color: var(--color-accent); margin-bottom: 8px;"></i>
      <h3 style="font-family: var(--font-title); font-size: 16px; margin: 0 0 6px 0; color: var(--text-main);">Unlock All ${medalsDatabase.length} Medals</h3>
      <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 12px 0; max-width: 420px; line-height: 1.4;">You are currently viewing a preview of 6 medals. Sign in or create an account to view and track all region, type, and gameplay medals.</p>
      <button class="btn-primary" style="padding: 8px 16px; font-size: 11px;"><i class="fa-solid fa-right-to-bracket"></i> Sign In / Sync</button>
    `;
    grid.appendChild(ctaCard);
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

window.editingFriendId = null;

function startFriendEdit(id) {
  window.editingFriendId = id;
  renderFriendsTracker();
}

function cancelFriendEdit(e) {
  if (e) e.preventDefault();
  window.editingFriendId = null;
  renderFriendsTracker();
}

function toggleEditDaysVisibility(id) {
  const levelSelect = document.getElementById(`edit-friend-level-${id}`);
  const daysGroup = document.getElementById(`edit-days-group-${id}`);
  if (levelSelect && daysGroup) {
    daysGroup.style.display = levelSelect.value === 'best' ? 'none' : 'block';
  }
}

function saveFriendEdit(event, id) {
  if (event) event.preventDefault();
  const name = document.getElementById(`edit-friend-name-${id}`).value.trim();
  const code = document.getElementById(`edit-friend-code-${id}`).value.trim();
  const level = document.getElementById(`edit-friend-level-${id}`).value;
  const daysLeft = parseInt(document.getElementById(`edit-friend-days-${id}`)?.value || 0);
  const vivillon = document.getElementById(`edit-friend-vivillon-${id}`).value;

  if (!name) return;

  if (code) {
    const val = validateTrainerFriendCode(code);
    if (!val.valid) {
      alert(val.reason);
      return;
    }
  }

  const f = state.friends.find(x => x.id === id);
  if (f) {
    f.name = name;
    f.code = code;
    f.level = level;
    f.daysLeft = level === 'best' ? 0 : daysLeft;
    f.vivillon = vivillon;
    if (level !== 'best') {
      f.lucky = false;
    }
    saveState();
    window.editingFriendId = null;
    renderFriendsTracker();
  }
}

window.startFriendEdit = startFriendEdit;
window.cancelFriendEdit = cancelFriendEdit;
window.saveFriendEdit = saveFriendEdit;
window.toggleEditDaysVisibility = toggleEditDaysVisibility;

function renderFriendsTracker() {
  const container = document.getElementById('friends-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (currentUserSession === null) {
    container.innerHTML = `
      <div class="friends-lock-overlay" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; background: rgba(0,0,0,0.15); border: 1px dashed var(--border-subtle); border-radius: 12px; margin: 20px 0; width: 100%;">
        <i class="fa-solid fa-lock" style="font-size: 36px; color: var(--color-accent); margin-bottom: 16px;"></i>
        <h4 style="font-family: var(--font-title); margin-bottom: 8px; font-size: 16px; color: var(--text-main);">Friends List Locked</h4>
        <p style="font-size: 13px; color: var(--text-muted); max-width: 400px; line-height: 1.5; margin: 0 0 16px 0;">
          Friends list requires signing in. Sign in to add active friends, track daily gift exchanges, and log Lucky Friend achievements.
        </p>
        <button class="btn-primary" onclick="openAuthModal()" style="padding: 8px 16px; font-size: 12px; max-width: 200px;">
          <i class="fa-solid fa-right-to-bracket"></i> Sign In / Sync
        </button>
      </div>
    `;
    return;
  }
  
  if (state.friends.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No friends added.</div>`;
    return;
  }
  
  state.friends.forEach(f => {
    const card = document.createElement('div');
    card.className = `friend-card ${f.lucky ? 'lucky-friend' : ''}`;
    
    const isEditing = (window.editingFriendId === f.id);
    
    if (isEditing) {
      card.innerHTML = `
        <form onsubmit="saveFriendEdit(event, '${f.id}')" style="display:flex; flex-direction:column; gap:10px; width:100%;">
          <div class="form-group" style="margin:0;">
            <label style="font-size:10px; margin-bottom:2px; color:var(--text-muted); font-weight:700;">Friend Name</label>
            <input type="text" id="edit-friend-name-${f.id}" class="form-input" value="${escapeHtml(f.name)}" required style="padding:6px 10px; font-size:12px; background:rgba(0,0,0,0.3); width:100%; box-sizing:border-box;">
          </div>
          <div class="form-group" style="margin:0;">
            <label style="font-size:10px; margin-bottom:2px; color:var(--text-muted); font-weight:700;">Trainer Code</label>
            <input type="text" id="edit-friend-code-${f.id}" class="form-input" value="${escapeHtml(f.code || '')}" placeholder="0000 0000 0000" style="padding:6px 10px; font-size:12px; background:rgba(0,0,0,0.3); width:100%; box-sizing:border-box;">
          </div>
          <div style="display:flex; gap:8px; width:100%; box-sizing:border-box;">
            <div class="form-group" style="margin:0; flex:1;">
              <label style="font-size:10px; margin-bottom:2px; color:var(--text-muted); font-weight:700;">Level</label>
              <select id="edit-friend-level-${f.id}" class="filter-select" style="padding:6px 10px; font-size:12px; height:auto; width:100%; box-sizing:border-box;" onchange="toggleEditDaysVisibility('${f.id}')">
                <option value="good" ${f.level === 'good' ? 'selected' : ''}>Good Friend</option>
                <option value="great" ${f.level === 'great' ? 'selected' : ''}>Great Friend</option>
                <option value="ultra" ${f.level === 'ultra' ? 'selected' : ''}>Ultra Friend</option>
                <option value="best" ${f.level === 'best' ? 'selected' : ''}>Best Friend</option>
              </select>
            </div>
            <div class="form-group" id="edit-days-group-${f.id}" style="margin:0; flex:1; display: ${f.level === 'best' ? 'none' : 'block'};">
              <label style="font-size:10px; margin-bottom:2px; color:var(--text-muted); font-weight:700;">Days Left</label>
              <input type="number" id="edit-friend-days-${f.id}" class="form-input" value="${f.daysLeft}" min="0" max="90" style="padding:6px 10px; font-size:12px; background:rgba(0,0,0,0.3); width:100%; box-sizing:border-box;">
            </div>
          </div>
          <div class="form-group" style="margin:0;">
            <label style="font-size:10px; margin-bottom:2px; color:var(--text-muted); font-weight:700;">Vivillon Region</label>
            <select id="edit-friend-vivillon-${f.id}" class="filter-select" style="padding:6px 10px; font-size:12px; height:auto; width:100%; box-sizing:border-box;">
              <option value="none" ${f.vivillon === 'none' ? 'selected' : ''}>Unknown / None</option>
              <option value="Archipelago" ${f.vivillon === 'Archipelago' ? 'selected' : ''}>Archipelago 🦋</option>
              <option value="Continental" ${f.vivillon === 'Continental' ? 'selected' : ''}>Continental 🦋</option>
              <option value="Elegant" ${f.vivillon === 'Elegant' ? 'selected' : ''}>Elegant 🦋</option>
              <option value="Garden" ${f.vivillon === 'Garden' ? 'selected' : ''}>Garden 🦋</option>
              <option value="High Plains" ${f.vivillon === 'High Plains' ? 'selected' : ''}>High Plains 🦋</option>
              <option value="Icy Snow" ${f.vivillon === 'Icy Snow' ? 'selected' : ''}>Icy Snow 🦋</option>
              <option value="Jungle" ${f.vivillon === 'Jungle' ? 'selected' : ''}>Jungle 🦋</option>
              <option value="Marine" ${f.vivillon === 'Marine' ? 'selected' : ''}>Marine 🦋</option>
              <option value="Meadow" ${f.vivillon === 'Meadow' ? 'selected' : ''}>Meadow 🦋</option>
              <option value="Modern" ${f.vivillon === 'Modern' ? 'selected' : ''}>Modern 🦋</option>
              <option value="Monsoon" ${f.vivillon === 'Monsoon' ? 'selected' : ''}>Monsoon 🦋</option>
              <option value="Ocean" ${f.vivillon === 'Ocean' ? 'selected' : ''}>Ocean 🦋</option>
              <option value="Polar" ${f.vivillon === 'Polar' ? 'selected' : ''}>Polar 🦋</option>
              <option value="River" ${f.vivillon === 'River' ? 'selected' : ''}>River 🦋</option>
              <option value="Sandstorm" ${f.vivillon === 'Sandstorm' ? 'selected' : ''}>Sandstorm 🦋</option>
              <option value="Savanna" ${f.vivillon === 'Savanna' ? 'selected' : ''}>Savanna 🦋</option>
              <option value="Sun" ${f.vivillon === 'Sun' ? 'selected' : ''}>Sun 🦋</option>
              <option value="Tundra" ${f.vivillon === 'Tundra' ? 'selected' : ''}>Tundra 🦋</option>
            </select>
          </div>
          <div style="display:flex; gap:8px; margin-top:4px; width:100%; box-sizing:border-box;">
            <button type="submit" class="btn-primary" style="padding:6px 12px; font-size:11px; flex:1;"><i class="fa-solid fa-floppy-disk"></i> Save</button>
            <button type="button" class="btn-secondary" onclick="cancelFriendEdit(event)" style="padding:6px 12px; font-size:11px; flex:1;"><i class="fa-solid fa-xmark"></i> Cancel</button>
          </div>
        </form>
      `;
    } else {
      const levelsMap = { good: "Good Friend", great: "Great Friend", ultra: "Ultra Friend", best: "Best Friend" };
      
      card.innerHTML = `
        <div class="friend-top">
          <div>
            <h4 class="friend-name">${escapeHtml(f.name)}</h4>
            <span class="friend-code" data-code="${escapeHtml(f.code)}" onclick="copyTrainerCode(this.getAttribute('data-code'))" title="Click to copy">${escapeHtml(f.code) || 'No Code'}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="delete-friend-btn" onclick="startFriendEdit('${f.id}')" title="Edit Friend" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:13px; padding:6px; display:inline-flex; align-items:center; justify-content:center; transition:var(--transition-smooth);">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="delete-friend-btn" onclick="deleteFriend('${f.id}')" title="Delete">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
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
    }
    
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
  
  if (code) {
    const val = validateTrainerFriendCode(code);
    const errEl = document.getElementById('friend-code-error');
    if (!val.valid) {
      if (errEl) {
        errEl.textContent = val.reason;
        errEl.style.display = 'block';
      } else {
        alert(val.reason);
      }
      return;
    } else {
      if (errEl) errEl.style.display = 'none';
    }
  }
  
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
    
    const isLoggedIn = currentUserSession !== null;
    Object.keys(itemRegistry).forEach(key => {
      const item = itemRegistry[key];
      if (g.cats.includes(item.cat)) {
        const qty = state.items[key] || 0;
        const div = document.createElement('div');
        div.className = "item-input-card";
        const spriteUrl = itemSprites[key] || "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png";
        div.innerHTML = `
          <div class="item-card-info">
            <img class="item-image-sprite" src="${spriteUrl}" referrerpolicy="no-referrer" alt="${item.name}" onerror="this.src='https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png';">
            <span class="item-label-text">${item.name}</span>
          </div>
          <input type="number" class="item-qty-input" value="${qty}" min="0" oninput="updateItemQuantity('${key}', this.value)" ${isLoggedIn ? '' : 'disabled'}>
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
    if (key !== 'max_particles' && key !== 'link_charge' && key !== 'zygarde_cell') {
      totalItems += state.items[key] || 0;
    }
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

  // Daily-cycling pool of high-quality tips
  const staticTipsPool = [
    { icon: "🍃", title: "Gym defender berry feeding", desc: "Feed Nanab and Razz Berries to gym defenders to clear bag space, gain stardust, and earn potential species candy." },
    { icon: "🍬", title: "Convert surplus Rare Candies", desc: "Convert Rare Candies into species-specific candy for legendary/mythical species to free up inventory space immediately." },
    { icon: "⛓️", title: "Trim evolution items", desc: "Keep at most 2-3 of each evolution item (like Sun Stones or Metal Coats). They are easily obtainable and rarely needed in bulk." },
    { icon: "🧪", title: "Discard low-tier potions", desc: "Discard standard and Super Potions if you have plenty of Hyper/Max Potions and Max Revives." },
    { icon: "🍒", title: "Keep standard Razz Berries in check", desc: "Keep standard Razz Berries below 20-30. Feed extras to gym defenders or discard them; save Golden Razz for raids." },
    { icon: "🔴", title: "Optimize Poke Ball inventory", desc: "If you don't use an auto-catcher device, discard standard Poke Balls and keep Great and Ultra Balls." },
    { icon: "⚡", title: "Tame your TM inventory", desc: "Keep around 25-30 of each standard Fast and Charged TM. Use surplus TMs to optimize your top combat species' movesets." },
    { icon: "🎟️", title: "Premium pass utilization", desc: "Premium Battle Passes don't stack. Participate in GO Battle League or host local raids to convert passes into rewards." },
    { icon: "🌀", title: "Max Particle daily spending", desc: "Use Max Particles daily to upgrade Max Moves or complete Max Battles. Hoarding them past the daily cap wastes collection opportunities." },
    { icon: "📦", title: "Clean storage during Spotlight Hours", desc: "Tag duplicate standard species and transfer them during double-transfer-candy Spotlight Hours to maximize rewards." },
    { icon: "🥚", title: "Keep incubators active", desc: "Always keep your infinite incubator active. Save blue/super incubators for high-distance (10km/12km) eggs or special events." },
    { icon: "🌟", title: "Synchronize Lucky Eggs & Star Pieces", desc: "Activate Lucky Eggs and Star Pieces together during double/triple XP/stardust events to clear bag space and boost gains." }
  ];

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  let poolIndex = dayOfYear % staticTipsPool.length;
  while (recommendations.length < 10) {
    const tip = staticTipsPool[poolIndex];
    if (!recommendations.some(r => r.title === tip.title)) {
      recommendations.push(tip);
    }
    poolIndex = (poolIndex + 1) % staticTipsPool.length;
  }

  recommendations = recommendations.slice(0, 10);

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

function clearSearchStringFilters() {
  document.querySelectorAll('[id*="ss-iv-"], [id*="ss-exc-"], [id*="ss-state-"], [id*="ss-buddy-"], [id*="ss-dist-"]').forEach(el => {
    el.checked = false;
  });
  document.getElementById('ss-age-select').value = 'all';
  document.getElementById('ss-custom-species').value = '';
  document.getElementById('ss-cp-min').value = '';
  document.getElementById('ss-cp-max').value = '';
  document.getElementById('ss-hp-min').value = '';
  document.getElementById('ss-hp-max').value = '';
  
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

// --- TAB 8: BATTLE PARTIES ---



function createBattleParty(event) {
  if (event) event.preventDefault();
  
  const nameInput = document.getElementById('party-name');
  const typeSelect = document.getElementById('party-type');
  const slot1Select = document.getElementById('party-slot-1');
  const slot2Select = document.getElementById('party-slot-2');
  const slot3Select = document.getElementById('party-slot-3');
  
  if (!nameInput || !typeSelect || !slot1Select || !slot2Select || !slot3Select) return;
  
  const nameVal = nameInput.value.trim();
  const categoryVal = typeSelect.value;
  const slot1Val = slot1Select.value;
  const slot2Val = slot2Select.value;
  const slot3Val = slot3Select.value;
  
  if (!nameVal || !slot1Val || !slot2Val || !slot3Val) {
    alert("Please fill in the party name and select Pokémon for all 3 slots.");
    return;
  }
  
  const newParty = {
    id: 'party_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: nameVal,
    category: categoryVal,
    slots: [
      parseInt(slot1Val),
      parseInt(slot2Val),
      parseInt(slot3Val)
    ]
  };
  
  state.battleParties = state.battleParties || [];
  state.battleParties.push(newParty);
  
  // Reset form
  nameInput.value = '';
  typeSelect.selectedIndex = 0;
  slot1Select.selectedIndex = 0;
  slot2Select.selectedIndex = 0;
  slot3Select.selectedIndex = 0;
  
  saveState();
  renderBattleParties();
}

function deleteBattleParty(partyId) {
  if (confirm("Are you sure you want to delete this battle party?")) {
    state.battleParties = (state.battleParties || []).filter(p => p.id !== partyId);
    saveState();
    renderBattleParties();
  }
}

// --- ADMIN PANEL AND OVERRIDES HELPERS ---

window.globalPokedexOverrides = {};

async function loadGlobalDatabaseOverrides() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('user_states')
      .select('state')
      .eq('user_id', 'global_pokedex_overrides')
      .maybeSingle();
      
    if (error) throw error;
    
    if (data && data.state && data.state.pokedexOverrides) {
      window.globalPokedexOverrides = data.state.pokedexOverrides;
      applyPokedexOverrides();
    }
  } catch (err) {
    console.error("Failed to load global database overrides:", err);
  }
}

function applyPokedexOverrides() {
  if (!window.globalPokedexOverrides) return;
  
  window.pokemonDatabase.forEach(p => {
    const override = window.globalPokedexOverrides[p.id];
    if (override) {
      Object.assign(p, override);
    }
  });
}

async function scrapeFandomWikiPokemonData(name) {
  const url = `https://pokemongo.fandom.com/api.php?action=parse&page=${encodeURIComponent(name)}&format=json&origin=*&prop=text`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.info || "Wiki page not found");
  
  const htmlText = data.parse.text["*"];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  
  let attack = null;
  let defense = null;
  let stamina = null;
  let maxCP = null;
  
  const textContent = doc.body.textContent;
  
  const attEl = doc.querySelector('[data-source="attack"] .pi-data-value');
  if (attEl) attack = parseInt(attEl.textContent.trim());
  
  const defEl = doc.querySelector('[data-source="defense"] .pi-data-value');
  if (defEl) defense = parseInt(defEl.textContent.trim());
  
  const staEl = doc.querySelector('[data-source="stamina"] .pi-data-value');
  if (staEl) stamina = parseInt(staEl.textContent.trim());
  
  const cpEl = doc.querySelector('[data-source="cp"] .pi-data-value');
  if (cpEl) maxCP = parseInt(cpEl.textContent.trim());
  
  if (!attack) {
    const attMatch = textContent.match(/Attack\s*:\s*(\d+)/i) || textContent.match(/Base Attack\s*(\d+)/i);
    if (attMatch) attack = parseInt(attMatch[1]);
  }
  if (!defense) {
    const defMatch = textContent.match(/Defense\s*:\s*(\d+)/i) || textContent.match(/Base Defense\s*(\d+)/i);
    if (defMatch) defense = parseInt(defMatch[1]);
  }
  if (!stamina) {
    const staMatch = textContent.match(/Stamina\s*:\s*(\d+)/i) || textContent.match(/Base Stamina\s*(\d+)/i);
    if (staMatch) stamina = parseInt(staMatch[1]);
  }
  if (!maxCP) {
    const cpMatch = textContent.match(/Max CP\s*(?:at level \d+)?\s*:\s*(\d+)/i) || textContent.match(/Maximum CP\s*(\d+)/i) || textContent.match(/L50 CP\s*(\d+)/i);
    if (cpMatch) maxCP = parseInt(cpMatch[1]);
  }
  
  let method = "Unknown";
  let details = "";
  
  const availHeader = doc.querySelector('#Availability, #In_the_wild');
  if (availHeader) {
    const parent = availHeader.closest('h2, h3');
    if (parent) {
      let next = parent.nextElementSibling;
      while (next && next.tagName !== 'H2' && next.tagName !== 'H3') {
        if (next.tagName === 'P') {
          details += next.textContent.trim() + " ";
        }
        next = next.nextElementSibling;
      }
    }
  }
  
  if (details) {
    details = details.trim();
    if (details.toLowerCase().includes("special research")) method = "Special Research";
    else if (details.toLowerCase().includes("raid")) method = "Raids";
    else if (details.toLowerCase().includes("egg")) method = "Eggs / Hatching";
    else if (details.toLowerCase().includes("wild")) method = "Wild Encounters";
    else method = "Event Exclusives";
  }
  
  return {
    name,
    baseStats: {
      attack: attack || 0,
      defense: defense || 0,
      stamina: stamina || 0
    },
    maxCP: maxCP || 0,
    availability: {
      method: method,
      details: details || "No detailed availability information found.",
      sources: ["Fandom Wiki"]
    }
  };
}

function selectPokemonForAdminEdit(id) {
  const p = window.pokemonDatabase.find(x => x.id === id);
  if (!p) return;
  
  const editPanel = document.getElementById('admin-edit-panel');
  if (!editPanel) return;
  
  document.querySelectorAll('.admin-poke-item').forEach(item => {
    if (parseInt(item.dataset.id) === id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const commonMethods = ["Wild Spawn", "Eggs", "Raids", "Research Task", "Special Research", "Live Event", "Unreleased"];
  const currentMethod = p.availability?.method || '';
  const selectValue = commonMethods.includes(currentMethod) ? currentMethod : (currentMethod ? 'custom' : 'Wild Spawn');

  editPanel.style.margin = '0';
  editPanel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-subtle); padding-bottom:12px;">
      <div>
        <span style="font-size:11px; color:var(--text-dim); font-weight:700;">ID #${String(p.id).padStart(3, '0')}</span>
        <h3 style="font-family: var(--font-title); font-size: 20px; margin: 2px 0 0 0; color: var(--color-secondary);">${p.name}</h3>
      </div>
      <button class="btn-primary" onclick="runWikiScrapeForAdmin(${p.id}, '${p.name.replace(/'/g, "\'")}')" style="padding: 6px 12px; font-size:11px; display:flex; align-items:center; gap:6px;">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Wiki Scrape Fandom
      </button>
    </div>
    
    <form id="admin-override-form" onsubmit="saveAdminOverride(event, ${p.id})" style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <div class="form-group">
          <label style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Release Status</label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-main);">
            <input type="checkbox" id="admin-released" ${p.released ? 'checked' : ''} style="accent-color: var(--color-primary);">
            <span>Released in Pokémon GO</span>
          </label>
        </div>
        
        <div class="form-group">
          <label for="admin-max-cp" style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Max CP (Level 50)</label>
          <input type="number" id="admin-max-cp" class="form-input" value="${p.maxCP || ''}" required>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
        <div class="form-group">
          <label for="admin-attack" style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Base Attack</label>
          <input type="number" id="admin-attack" class="form-input" value="${p.baseStats?.attack || ''}" required>
        </div>
        <div class="form-group">
          <label for="admin-defense" style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Base Defense</label>
          <input type="number" id="admin-defense" class="form-input" value="${p.baseStats?.defense || ''}" required>
        </div>
        <div class="form-group">
          <label for="admin-stamina" style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Base Stamina</label>
          <input type="number" id="admin-stamina" class="form-input" value="${p.baseStats?.stamina || ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Availability Method</label>
        <div style="display: flex; gap: 8px;">
          <select id="admin-avail-method-select" class="form-input" style="flex: 1; background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.08);" onchange="document.getElementById('admin-avail-method').value = this.value === 'custom' ? '' : this.value">
            <option value="Wild Spawn" ${selectValue === 'Wild Spawn' ? 'selected' : ''}>Wild Spawn</option>
            <option value="Eggs" ${selectValue === 'Eggs' ? 'selected' : ''}>Eggs</option>
            <option value="Raids" ${selectValue === 'Raids' ? 'selected' : ''}>Raids</option>
            <option value="Research Task" ${selectValue === 'Research Task' ? 'selected' : ''}>Research Task</option>
            <option value="Special Research" ${selectValue === 'Special Research' ? 'selected' : ''}>Special Research</option>
            <option value="Live Event" ${selectValue === 'Live Event' ? 'selected' : ''}>Live Event</option>
            <option value="Unreleased" ${selectValue === 'Unreleased' ? 'selected' : ''}>Unreleased</option>
            <option value="custom" ${selectValue === 'custom' ? 'selected' : ''}>Custom (Enter right)...</option>
          </select>
          <input type="text" id="admin-avail-method" class="form-input" style="flex: 1;" value="${currentMethod}" placeholder="Enter manual value..." required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="admin-avail-details" style="font-weight:700; font-size:12px; display:block; margin-bottom:6px;">Availability Details</label>
        <textarea id="admin-avail-details" class="form-input" style="height: 80px; resize: vertical;" required>${p.availability?.details || ''}</textarea>
      </div>
      
      <div style="border-top:1px solid var(--border-subtle); padding-top:16px; margin-top:8px; display:flex; justify-content:flex-end; gap:12px;">
        <button type="submit" class="btn-primary" style="padding: 10px 24px; font-weight:700;">
          <i class="fa-solid fa-floppy-disk"></i> Save & Broadcast Override
        </button>
      </div>
    </form>
  `;
}

async function runWikiScrapeForAdmin(id, name) {
  const isAdmin = currentUserSession && currentUserSession.user && currentUserSession.user.id === "admin-user-123";
  const isAdminSession = localStorage.getItem('pokego_tracker_admin_session') === 'true';
  if (!isAdmin || !isAdminSession) {
    alert("Security Alert: Admin privileges required to run scraper.");
    return;
  }
  const btn = document.querySelector('#admin-edit-panel button[onclick^="runWikiScrapeForAdmin"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Scraping...`;
  }
  
  try {
    const scraped = await scrapeFandomWikiPokemonData(name);
    console.log("Scraped data successfully:", scraped);
    
    const releasedEl = document.getElementById('admin-released');
    const cpEl = document.getElementById('admin-max-cp');
    const attEl = document.getElementById('admin-attack');
    const defEl = document.getElementById('admin-defense');
    const staEl = document.getElementById('admin-stamina');
    const methodEl = document.getElementById('admin-avail-method');
    const detailsEl = document.getElementById('admin-avail-details');
    
    if (releasedEl) releasedEl.checked = true;
    if (cpEl && scraped.maxCP) cpEl.value = scraped.maxCP;
    if (attEl && scraped.baseStats.attack) attEl.value = scraped.baseStats.attack;
    if (defEl && scraped.baseStats.defense) defEl.value = scraped.baseStats.defense;
    if (staEl && scraped.baseStats.stamina) staEl.value = scraped.baseStats.stamina;
    if (methodEl && scraped.availability.method) {
      methodEl.value = scraped.availability.method;
      const selectEl = document.getElementById('admin-avail-method-select');
      if (selectEl) {
        const commonMethods = ["Wild Spawn", "Eggs", "Raids", "Research Task", "Special Research", "Live Event", "Unreleased"];
        selectEl.value = commonMethods.includes(scraped.availability.method) ? scraped.availability.method : 'custom';
      }
    }
    if (detailsEl && scraped.availability.details) detailsEl.value = scraped.availability.details;
    
    alert(`Successfully scraped reference data for ${name}! Please review the filled details and click Save to confirm.`);
  } catch (err) {
    alert(`Scraping failed: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Wiki Scrape Fandom`;
    }
  }
}

async function saveAdminOverride(event, id) {
  if (event) event.preventDefault();
  
  const isAdmin = currentUserSession && currentUserSession.user && currentUserSession.user.id === "admin-user-123";
  const isAdminSession = localStorage.getItem('pokego_tracker_admin_session') === 'true';
  if (!isAdmin || !isAdminSession) {
    alert("Security Alert: Admin privileges required to save overrides.");
    return;
  }
  
  const released = document.getElementById('admin-released').checked;
  const maxCP = parseInt(document.getElementById('admin-max-cp').value);
  const attack = parseInt(document.getElementById('admin-attack').value);
  const defense = parseInt(document.getElementById('admin-defense').value);
  const stamina = parseInt(document.getElementById('admin-stamina').value);
  const method = document.getElementById('admin-avail-method').value.trim();
  const details = document.getElementById('admin-avail-details').value.trim();
  
  const override = {
    released,
    maxCP,
    baseStats: { attack, defense, stamina },
    availability: {
      method,
      details,
      sources: ["Fandom Wiki", "Admin Override"]
    }
  };
  
  window.globalPokedexOverrides = window.globalPokedexOverrides || {};
  window.globalPokedexOverrides[id] = override;
  
  applyPokedexOverrides();
  
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('user_states')
        .upsert({
          user_id: 'global_pokedex_overrides',
          state: { pokedexOverrides: window.globalPokedexOverrides },
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      alert("Override saved and broadcasted to all users successfully!");
    } catch (err) {
      console.error("Failed to broadcast overrides:", err);
      alert(`Saved locally, but failed to upload to Supabase: ${err.message}`);
    }
  } else {
    alert("Saved locally. Supabase is not configured to broadcast globally.");
  }
}

window.adminShowAllPokemon = false;

function renderAdminPokemonList() {
  const container = document.getElementById('admin-poke-list');
  if (!container) return;
  
  const query = (document.getElementById('admin-search')?.value || '').toLowerCase().trim();
  const showAll = window.adminShowAllPokemon || false;
  
  const filtered = window.pokemonDatabase.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || String(p.id).includes(query);
    if (!matchesQuery) return false;
    
    // Hide released Pokémon by default
    if (!showAll && p.released) return false;
    
    return true;
  });
  
  container.innerHTML = '';
  filtered.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-poke-item';
    item.dataset.id = p.id;
    item.style.cssText = 'padding: 8px 10px; border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 12px; transition: all 0.2s; background: rgba(255,255,255,0.01); color: var(--text-main);';
    
    item.onmouseenter = () => { item.style.borderColor = 'var(--color-primary)'; };
    item.onmouseleave = () => {
      const active = item.classList.contains('active');
      item.style.borderColor = active ? 'var(--color-primary)' : 'var(--border-subtle)';
    };
    item.onclick = () => selectPokemonForAdminEdit(p.id);
    
    item.innerHTML = `
      <span>#${String(p.id).padStart(3, '0')} ${p.name}</span>
      <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; ${p.released ? 'background: rgba(46,204,113,0.15); color: var(--color-success);' : 'background: rgba(255,42,122,0.15); color: var(--color-secondary);'}">${p.released ? 'Released' : 'Unreleased'}</span>
    `;
    
    container.appendChild(item);
  });
}

function balanceModalColumns() {
  const colLeft = document.querySelector('#detail-modal .modal-col-left');
  const colRight = document.querySelector('#detail-modal .modal-col-right');
  const stickyHeader = document.getElementById('modal-sticky-header');
  if (!colLeft || !colRight || !stickyHeader) return;

  const sections = Array.from(document.querySelectorAll('#detail-modal .detail-section'));
  if (sections.length === 0) return;

  colLeft.innerHTML = '';
  colRight.innerHTML = '';
  stickyHeader.innerHTML = '';

  const isMobile = window.innerWidth < 768;

  const getSectionWeight = (sec) => {
    if (sec.style.display === 'none') return 0;
    const id = sec.id;
    if (id === 'modal-sprite-section') return 180;
    if (id === 'modal-desc-section') return 60;
    if (id === 'modal-combat-metrics-section') return 130;
    if (id === 'modal-adventure-section') return 80;
    if (id === 'modal-effectiveness-section') return 150;
    if (id === 'modal-moves-section') return 110;
    if (id === 'modal-pvp-rankings-section') return 100;
    if (id === 'modal-hundo-section') return 220;
    if (id === 'modal-mega-section') {
      const items = sec.querySelectorAll('li');
      return 60 + (items.length * 18);
    }
    if (id === 'modal-max-section') return 90;
    if (id === 'modal-availability-section') return 120;
    if (id === 'modal-forms-section') {
      const items = sec.querySelectorAll('#modal-forms-checklist label');
      return 50 + (items.length * 20);
    }
    if (id === 'modal-backgrounds-section') {
      const items = sec.querySelectorAll('#modal-backgrounds-checklist label');
      return 50 + (items.length * 20);
    }
    if (id === 'modal-optimize-section') return 80;
    if (id === 'modal-fun-fact-section') return 80;
    return sec.offsetHeight || 80;
  };

  if (isMobile) {
    stickyHeader.style.display = 'none';

    // Mobile layout order:
    // 1. Sprite
    // 2. Desc
    // 3. Combat Metrics
    // 4. Adventure, Effectiveness, Moves, PvP Rankings
    const staticLeftIds = [
      'modal-sprite-section',
      'modal-desc-section',
      'modal-combat-metrics-section',
      'modal-adventure-section',
      'modal-effectiveness-section',
      'modal-moves-section',
      'modal-pvp-rankings-section'
    ];

    const staticRightIds = [
      'modal-hundo-section',
      'modal-mega-section',
      'modal-max-section',
      'modal-availability-section'
    ];

    const staticLeftElements = [];
    const staticRightElements = [];
    const dynamicElements = [];

    staticLeftIds.forEach(id => {
      const sec = sections.find(s => s.id === id);
      if (sec) staticLeftElements.push(sec);
    });

    staticRightIds.forEach(id => {
      const sec = sections.find(s => s.id === id);
      if (sec) staticRightElements.push(sec);
    });

    sections.forEach(sec => {
      const id = sec.id;
      if (!staticLeftIds.includes(id) && !staticRightIds.includes(id)) {
        dynamicElements.push(sec);
      }
    });

    staticLeftElements.forEach(sec => {
      colLeft.appendChild(sec);
    });

    staticRightElements.forEach(sec => {
      colRight.appendChild(sec);
    });

    dynamicElements.forEach(sec => {
      colLeft.appendChild(sec);
    });

  } else {
    // Desktop layout
    stickyHeader.style.display = 'grid';

    // Append sprite and combat metrics to the sticky header row
    const spriteSec = sections.find(s => s.id === 'modal-sprite-section');
    const combatSec = sections.find(s => s.id === 'modal-combat-metrics-section');
    if (spriteSec) stickyHeader.appendChild(spriteSec);
    if (combatSec) stickyHeader.appendChild(combatSec);

    // Other elements go to columns
    const staticLeftIds = [
      'modal-desc-section',
      'modal-adventure-section',
      'modal-effectiveness-section',
      'modal-moves-section',
      'modal-pvp-rankings-section'
    ];

    const staticRightIds = [
      'modal-hundo-section',
      'modal-mega-section',
      'modal-max-section',
      'modal-availability-section'
    ];

    const staticLeftElements = [];
    const staticRightElements = [];
    const dynamicElements = [];

    staticLeftIds.forEach(id => {
      const sec = sections.find(s => s.id === id);
      if (sec) staticLeftElements.push(sec);
    });

    staticRightIds.forEach(id => {
      const sec = sections.find(s => s.id === id);
      if (sec) staticRightElements.push(sec);
    });

    sections.forEach(sec => {
      const id = sec.id;
      if (id !== 'modal-sprite-section' && id !== 'modal-combat-metrics-section') {
        if (!staticLeftIds.includes(id) && !staticRightIds.includes(id)) {
          dynamicElements.push(sec);
        }
      }
    });

    let leftWeight = 0;
    let rightWeight = 0;

    staticLeftElements.forEach(sec => {
      colLeft.appendChild(sec);
      if (sec.style.display !== 'none') {
        leftWeight += getSectionWeight(sec);
      }
    });

    staticRightElements.forEach(sec => {
      colRight.appendChild(sec);
      if (sec.style.display !== 'none') {
        rightWeight += getSectionWeight(sec);
      }
    });

    dynamicElements.forEach(sec => {
      if (sec.style.display !== 'none') {
        const w = getSectionWeight(sec);
        if (leftWeight <= rightWeight) {
          colLeft.appendChild(sec);
          leftWeight += w;
        } else {
          colRight.appendChild(sec);
          rightWeight += w;
        }
      } else {
        colLeft.appendChild(sec);
      }
    });
  }
}

// Add event listener for screen resizing to balance columns dynamically
window.addEventListener('resize', () => {
  const modal = document.getElementById('detail-modal');
  if (modal && modal.style.display === 'flex') {
    balanceModalColumns();
  }
});

// --- NEW BATTLE PARTIES & ROLE RECOMMENDATIONS SYSTEM ---

const META_RECOMMENDATIONS = {
  "Great League": {
    lead: ["Lickitung", "Lanturn", "Skarmory", "Gligar", "Registeel", "Cresselia", "Medicham", "Whiscash"],
    switch: ["Sableye", "Gligar", "Vigoroth", "Charizard", "Stunfisk", "Dewgong", "Chesnaught", "Pidgeot"],
    closer: ["Registeel", "Clodsire", "Bastiodon", "Carbink", "Azumarill", "Talonflame", "Jellicent", "Scrafty"]
  },
  "Ultra League": {
    lead: ["Registeel", "Cresselia", "Cobalion", "Pidgeot", "Giratina (Altered)", "Steelix", "Talonflame"],
    switch: ["Gliscor", "Charizard", "Snorlax", "Greedent", "Guzzlord", "Tapu Fini", "Ampharos", "Obstagoon"],
    closer: ["Registeel", "Giratina (Altered)", "Swampert", "Walrein", "Virizion", "Aurorus", "Trevenant", "Skeledirge"]
  },
  "Master League": {
    lead: ["Dialga", "Giratina (Origin)", "Lugia", "Zekrom", "Dragonite", "Groudon", "Kyogre", "Mewtwo", "Xerneas"],
    switch: ["Palkia (Origin)", "Mewtwo", "Giratina (Altered)", "Zacian", "Landorus (Therian)", "Melmetal", "Garchomp"],
    closer: ["Dialga (Origin)", "Kyogre", "Groudon", "Rayquaza", "Mewtwo", "Zekrom", "Togekiss", "Florges", "Ho-Oh"]
  },
  "Team GO Rocket": {
    lead: ["Machamp", "Lucario", "Terrakion", "Melmetal", "Kyogre", "Groudon"],
    switch: ["Kartana", "Swampert", "Mewtwo", "Rayquaza", "Tyranitar"],
    closer: ["Tyranitar", "Hydreigon", "Dragonite", "Charizard", "Heatran"]
  },
  "Max Battles": {
    lead: ["Charizard", "Metagross", "Venusaur", "Blastoise", "Machamp", "Toxtricity", "Zacian"],
    switch: ["Drilbur", "Excadrill", "Falinks", "Greedent", "Dubwool", "Gengar", "Zamazenta"],
    closer: ["Charizard", "Metagross", "Eternatus", "Blastoise", "Venusaur", "Machamp", "Gengar"]
  }
};

function getRecommendedRaidCounters(bossPokemon) {
  const generalRaidMeta = [
    "Mewtwo", "Rayquaza", "Machamp", "Kyogre", "Groudon", 
    "Kartana", "Terrakion", "Zekrom", "Reshiram", "Tyranitar", 
    "Rampardos", "Metagross", "Lucario", "Hydreigon", "Garchomp",
    "Origin Forme Dialga", "Origin Forme Palkia", "Shadow Mewtwo",
    "Xurkitree", "Raikou", "Entei", "Moltres", "Salamence", "Dragonite"
  ];
  
  if (!bossPokemon) {
    return generalRaidMeta;
  }
  
  const coverage = calculateTypeEffectiveness(bossPokemon.types || []);
  const weakTypes = (coverage.weaknesses || []).map(w => w.type);
  
  if (weakTypes.length === 0) {
    return generalRaidMeta;
  }
  
  const counters = window.pokemonDatabase.filter(p => {
    if (!p.released) return false;
    return p.types.some(t => weakTypes.includes(t));
  });
  
  counters.sort((a, b) => {
    const attA = a.baseStats?.attack || 0;
    const attB = b.baseStats?.attack || 0;
    return attB - attA;
  });
  
  return counters.slice(0, 20).map(p => p.name);
}

function populateBattlePartySelectors(query = '') {
  const select1 = document.getElementById('party-slot-1');
  const select2 = document.getElementById('party-slot-2');
  const select3 = document.getElementById('party-slot-3');
  if (!select1 || !select2 || !select3) return;
  
  const category = document.getElementById('party-type')?.value || "Great League";
  const recommendations = META_RECOMMENDATIONS[category] || { lead: [], switch: [], closer: [] };
  
  let sortedPokemon = [...window.pokemonDatabase]
    .filter(p => p.released)
    .sort((a, b) => a.id - b.id);
    
  if (category === "Max Battles") {
    sortedPokemon = sortedPokemon.filter(p => {
      const nameL = p.name.toLowerCase();
      return (p.max && p.max.released) || 
             nameL.includes('eternatus') || 
             nameL.includes('zacian') || 
             nameL.includes('zamazenta');
    });
  }
  
  const q = query.toLowerCase().trim();
  
  const buildOptions = (roleRecommendations) => {
    const recommended = [];
    const others = [];
    
    sortedPokemon.forEach(p => {
      if (q && !p.name.toLowerCase().includes(q)) {
        return;
      }
      
      const isRec = roleRecommendations.some(name => name.toLowerCase() === p.name.toLowerCase());
      if (isRec) {
        recommended.push(p);
      } else {
        others.push(p);
      }
    });
    
    recommended.sort((a, b) => {
      const idxA = roleRecommendations.findIndex(name => name.toLowerCase() === a.name.toLowerCase());
      const idxB = roleRecommendations.findIndex(name => name.toLowerCase() === b.name.toLowerCase());
      return idxA - idxB;
    });
    
    let html = '<option value="" disabled selected>Select a Pokémon...</option>';
    
    if (recommended.length > 0) {
      html += '<optgroup label="⭐ Recommended Meta">';
      recommended.forEach(p => {
        html += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
      });
      html += '</optgroup>';
    }
    
    html += '<optgroup label="All Released Pokémon">';
    others.forEach(p => {
      html += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
    });
    html += '</optgroup>';
    
    return html;
  };
  
  const val1 = select1.value;
  const val2 = select2.value;
  const val3 = select3.value;
  
  select1.innerHTML = buildOptions(recommendations.lead);
  select2.innerHTML = buildOptions(recommendations.switch);
  select3.innerHTML = buildOptions(recommendations.closer);
  
  if (val1) select1.value = val1;
  if (val2) select2.value = val2;
  if (val3) select3.value = val3;
}

function populateRaidBossSelector() {
  const select = document.getElementById('raid-party-boss');
  if (!select) return;
  
  let options = '<option value="">None (Gym / General Raid)</option>';
  
  if (window.currentRaidBosses && window.currentRaidBosses.length > 0) {
    const sorted = [...window.currentRaidBosses]
      .sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(p => {
      options += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
    });
  } else {
    // Default fallback bosses if live ones are not parsed yet
    const fallbackBosses = [
      { id: 250, name: "Ho-Oh" },
      { id: 382, name: "Kyogre" },
      { id: 383, name: "Groudon" },
      { id: 384, name: "Rayquaza" },
      { id: 487, name: "Giratina" },
      { id: 643, name: "Reshiram" },
      { id: 644, name: "Zekrom" }
    ];
    fallbackBosses.forEach(p => {
      options += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
    });
  }
  
  const currentVal = select.value;
  select.innerHTML = options;
  if (currentVal) select.value = currentVal;
}

function populateRaidPartySelectors(query = '') {
  const selects = [
    document.getElementById('raid-slot-1'),
    document.getElementById('raid-slot-2'),
    document.getElementById('raid-slot-3'),
    document.getElementById('raid-slot-4'),
    document.getElementById('raid-slot-5'),
    document.getElementById('raid-slot-6')
  ];
  if (!selects[0]) return;
  
  const bossSelect = document.getElementById('raid-party-boss');
  const bossId = bossSelect ? parseInt(bossSelect.value) : null;
  const bossPokemon = bossId ? window.pokemonDatabase.find(x => x.id === bossId) : null;
  
  const recommendedNames = getRecommendedRaidCounters(bossPokemon);
  const q = query.toLowerCase().trim();
  
  const recommended = [];
  const others = [];
  
  const sortedPokemon = [...window.pokemonDatabase]
    .filter(p => p.released)
    .sort((a, b) => a.id - b.id);
    
  sortedPokemon.forEach(p => {
    if (q && !p.name.toLowerCase().includes(q)) {
      return;
    }
    
    const isRec = recommendedNames.some(name => name.toLowerCase() === p.name.toLowerCase());
    if (isRec) {
      recommended.push(p);
    } else {
      others.push(p);
    }
  });
  
  recommended.sort((a, b) => {
    const idxA = recommendedNames.findIndex(name => name.toLowerCase() === a.name.toLowerCase());
    const idxB = recommendedNames.findIndex(name => name.toLowerCase() === b.name.toLowerCase());
    return idxA - idxB;
  });
  
  let html = '<option value="" disabled selected>Select a Pokémon...</option>';
  
  if (recommended.length > 0) {
    html += '<optgroup label="⭐ Recommended Meta Counters">';
    recommended.forEach(p => {
      html += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
    });
    html += '</optgroup>';
  }
  
  html += '<optgroup label="All Released Pokémon">';
  others.forEach(p => {
    html += `<option value="${p.id}">#${String(p.id).padStart(3, '0')} ${p.name}</option>`;
  });
  html += '</optgroup>';
  
  selects.forEach(sel => {
    if (sel) {
      const currentVal = sel.value;
      sel.innerHTML = html;
      if (currentVal) {
        sel.value = currentVal;
      }
    }
  });
}

function createRaidBattleParty(event) {
  if (event) event.preventDefault();
  
  const nameInput = document.getElementById('raid-party-name');
  const bossSelect = document.getElementById('raid-party-boss');
  const selects = [
    document.getElementById('raid-slot-1'),
    document.getElementById('raid-slot-2'),
    document.getElementById('raid-slot-3'),
    document.getElementById('raid-slot-4'),
    document.getElementById('raid-slot-5'),
    document.getElementById('raid-slot-6')
  ];
  
  if (!nameInput || !bossSelect || !selects[0]) return;
  
  const nameVal = nameInput.value.trim();
  const bossVal = bossSelect.value;
  const slotsVals = selects.map(sel => parseInt(sel.value));
  
  if (!nameVal || slotsVals.some(v => isNaN(v))) {
    alert("Please fill in the party name and select Pokémon for all 6 slots.");
    return;
  }
  
  const newParty = {
    id: 'party_raid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: nameVal,
    category: 'Raid & Gym',
    targetBoss: bossVal ? parseInt(bossVal) : null,
    slots: slotsVals
  };
  
  state.battleParties = state.battleParties || [];
  state.battleParties.push(newParty);
  
  nameInput.value = '';
  bossSelect.selectedIndex = 0;
  selects.forEach(sel => sel.selectedIndex = 0);
  
  saveState();
  renderBattleParties();
}

function renderBattleParties() {
  const container = document.getElementById('battle-parties-list');
  if (!container) return;
  
  const parties = state.battleParties || [];
  if (parties.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted); background: rgba(255, 255, 255, 0.01); border: 1px dashed var(--border-subtle); border-radius: 12px;">
        <i class="fa-solid fa-people-group" style="font-size: 32px; color: var(--color-primary-glow); margin-bottom: 12px; display: block;"></i>
        <p style="font-family: var(--font-title); font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">No Battle Parties Created</p>
        <p style="font-size: 13px;">Use the forms above to build and save your custom 3-Pokémon or 6-Pokémon teams.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  parties.forEach(party => {
    let categoryBadgeStyle = 'background: rgba(191, 85, 236, 0.15); border: 1px solid rgba(191, 85, 236, 0.3); color: var(--color-primary);';
    if (party.category.includes('Great')) {
      categoryBadgeStyle = 'background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.3); color: var(--color-success);';
    } else if (party.category.includes('Ultra')) {
      categoryBadgeStyle = 'background: rgba(245, 176, 65, 0.15); border: 1px solid rgba(245, 176, 65, 0.3); color: var(--color-accent);';
    } else if (party.category.includes('Master')) {
      categoryBadgeStyle = 'background: rgba(255, 42, 122, 0.15); border: 1px solid rgba(255, 42, 122, 0.3); color: var(--color-secondary);';
    } else if (party.category.includes('Rocket')) {
      categoryBadgeStyle = 'background: rgba(181, 23, 158, 0.15); border: 1px solid rgba(181, 23, 158, 0.3); color: var(--color-shadow);';
    } else if (party.category.includes('Raid')) {
      categoryBadgeStyle = 'background: rgba(0, 240, 255, 0.15); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--color-favorite);';
    }
    
    let bossHtml = '';
    if (party.category.includes('Raid') && party.targetBoss) {
      const boss = window.pokemonDatabase.find(x => x.id === party.targetBoss);
      if (boss) {
        bossHtml = `<span class="battle-party-league-badge" style="background: rgba(255, 42, 122, 0.12); border: 1px solid rgba(255, 42, 122, 0.25); color: var(--color-secondary); margin-left: 6px;">vs. ${boss.name}</span>`;
      }
    }
    
    let slotsHtml = '';
    party.slots.forEach((slotId, index) => {
      const p = window.pokemonDatabase.find(x => x.id === slotId);
      let roleName = `Attacker ${index + 1}`;
      let roleColor = 'var(--text-muted)';
      if (party.slots.length === 3) {
        if (index === 0) { roleName = 'Lead'; roleColor = 'var(--color-primary)'; }
        else if (index === 1) { roleName = 'Safe Switch'; roleColor = 'var(--color-secondary)'; }
        else if (index === 2) { roleName = 'Closer / Cover'; roleColor = 'var(--color-accent)'; }
      } else {
        if (index === 0) roleColor = 'var(--color-primary)';
        else if (index === 1) roleColor = 'var(--color-secondary)';
        else if (index === 2) roleColor = 'var(--color-accent)';
      }
      slotsHtml += renderPartySlot(p, roleName, roleColor);
    });
    
    html += `
      <div class="battle-party-card">
        <div class="battle-party-card-header">
          <div>
            <h4 class="battle-party-card-title">${escapeHtml(party.name)}</h4>
            <span class="battle-party-league-badge" style="${categoryBadgeStyle}">${party.category}</span>
            ${bossHtml}
          </div>
          <button class="battle-party-delete-btn" onclick="deleteBattleParty('${party.id}')" title="Delete Party">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        
        <div class="battle-party-slots-grid">
          ${slotsHtml}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderPartySlot(p, role, roleColor) {
  if (!p) {
    return `
      <div class="battle-party-slotempty">
        <span style="font-size:10px; color:var(--text-dim); text-transform:uppercase; font-weight:800;">${role}</span>
        <div style="width:50px; height:50px; border-radius:50%; border:2px dashed var(--border-subtle); display:flex; align-items:center; justify-content:center; margin: 4px 0;">
          <i class="fa-solid fa-plus" style="color:var(--text-dim);"></i>
        </div>
        <span style="font-size:11px; color:var(--text-muted);">Empty</span>
      </div>
    `;
  }
  
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
  const typeBadges = p.types.map(t => getTypeBadgeHtml(t, "font-size: 8px; padding: 2px 6px;")).join(' ');
  
  return `
    <div class="battle-party-slot">
      <span class="battle-party-slot-role" style="color:${roleColor}">${role}</span>
      <div class="battle-party-slot-sprite-container">
        <img class="battle-party-slot-sprite" src="${spriteUrl}" alt="${p.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';">
      </div>
      <span class="battle-party-slot-name">${p.name}</span>
      <div class="battle-party-slot-types">
        ${typeBadges}
      </div>
    </div>
  `;
}

function toggleAuthPasswordVisibility() {
  const passwordInput = document.getElementById('auth-password');
  const eyeIcon = document.getElementById('auth-password-eye-icon');
  if (!passwordInput || !eyeIcon) return;
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
}

function filterPvPSelectOptions(val) {
  populateBattlePartySelectors(val);
}

function filterRaidSelectOptions(val) {
  populateRaidPartySelectors(val);
}
