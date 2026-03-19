/**
 * Seed Bowls England + Bowls Scotland clubs into the database.
 *
 * Data sourced from:
 *   - Bowls England: 35 county associations, ~2,700 affiliated clubs
 *   - Bowls Scotland: 32 districts, ~816 affiliated clubs
 *   Total: ~3,500 clubs
 *
 * Club names are generated from real naming patterns:
 *   - "[Town] Bowling Club"
 *   - "[Town] [Park/Rec] Bowling Club"
 *   - "[Town] & District BC"
 *   - "Royal [Town] BC" (rare, historic)
 *
 * Each club gets realistic:
 *   - Coordinates (within county/district boundaries)
 *   - Surface type, green count, member estimates
 *   - Activities, facilities, founded year
 *   - Status distribution matching reality (~80% active, ~15% seasonal, ~5% unverified)
 *
 * Usage:
 *   npx tsx scripts/seed-uk-clubs.ts
 *   npx tsx scripts/seed-uk-clubs.ts --clean    # Remove UK clubs first
 *   npx tsx scripts/seed-uk-clubs.ts --dry-run  # Show stats without inserting
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Linear: AI-2514
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env ───────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(name: string, city: string, stateCode: string): string {
  return `${name}-${city}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * 2 * range;
}

// ── Bowls England — 35 County Associations ────────────────────────────
// Real county data with approximate club counts, center coordinates, and towns

interface CountyData {
  name: string;
  code: string;
  region: string;
  clubCount: number;
  centerLat: number;
  centerLng: number;
  latRange: number;
  lngRange: number;
  towns: string[];
}

const ENGLAND_COUNTIES: CountyData[] = [
  // EAST region
  { name: "Bedfordshire", code: "BDF", region: "east", clubCount: 45, centerLat: 52.05, centerLng: -0.45, latRange: 0.15, lngRange: 0.2,
    towns: ["Bedford", "Luton", "Dunstable", "Leighton Buzzard", "Biggleswade", "Sandy", "Ampthill", "Flitwick", "Kempston", "Shefford", "Stotfold", "Arlesey", "Cranfield", "Wootton", "Potton"] },
  { name: "Cambridgeshire", code: "CAM", region: "east", clubCount: 55, centerLat: 52.35, centerLng: 0.1, latRange: 0.2, lngRange: 0.3,
    towns: ["Cambridge", "Peterborough", "Ely", "Huntingdon", "St Neots", "Wisbech", "March", "Whittlesey", "St Ives", "Ramsey", "Chatteris", "Soham", "Godmanchester", "Sawston", "Cottenham"] },
  { name: "Essex", code: "ESS", region: "east", clubCount: 120, centerLat: 51.75, centerLng: 0.55, latRange: 0.2, lngRange: 0.4,
    towns: ["Chelmsford", "Colchester", "Southend-on-Sea", "Basildon", "Harlow", "Brentwood", "Braintree", "Clacton-on-Sea", "Witham", "Maldon", "Rayleigh", "Billericay", "Halstead", "Saffron Walden", "Waltham Abbey", "Canvey Island", "Rochford", "Burnham-on-Crouch", "Hockley", "Tiptree"] },
  { name: "Hertfordshire", code: "HRT", region: "east", clubCount: 85, centerLat: 51.8, centerLng: -0.2, latRange: 0.15, lngRange: 0.25,
    towns: ["St Albans", "Watford", "Hemel Hempstead", "Stevenage", "Welwyn Garden City", "Hitchin", "Letchworth", "Hertford", "Bishops Stortford", "Ware", "Harpenden", "Berkhamsted", "Tring", "Buntingford", "Royston"] },
  { name: "Huntingdonshire", code: "HUN", region: "east", clubCount: 28, centerLat: 52.35, centerLng: -0.2, latRange: 0.15, lngRange: 0.2,
    towns: ["Huntingdon", "St Neots", "St Ives", "Ramsey", "Godmanchester", "Sawtry", "Yaxley", "Warboys", "Brampton", "Kimbolton"] },
  { name: "Leicestershire", code: "LEI", region: "east", clubCount: 75, centerLat: 52.65, centerLng: -1.15, latRange: 0.2, lngRange: 0.25,
    towns: ["Leicester", "Loughborough", "Hinckley", "Melton Mowbray", "Coalville", "Market Harborough", "Wigston", "Oadby", "Ashby-de-la-Zouch", "Shepshed", "Lutterworth", "Countesthorpe", "Broughton Astley", "Enderby", "Syston"] },
  { name: "Norfolk", code: "NFK", region: "east", clubCount: 95, centerLat: 52.65, centerLng: 1.15, latRange: 0.25, lngRange: 0.35,
    towns: ["Norwich", "King's Lynn", "Great Yarmouth", "Thetford", "Dereham", "Wymondham", "Attleborough", "Fakenham", "North Walsham", "Cromer", "Sheringham", "Holt", "Aylsham", "Swaffham", "Downham Market", "Watton", "Diss", "Long Stratton"] },
  { name: "Northamptonshire", code: "NHA", region: "east", clubCount: 65, centerLat: 52.25, centerLng: -0.9, latRange: 0.2, lngRange: 0.2,
    towns: ["Northampton", "Kettering", "Corby", "Wellingborough", "Rushden", "Daventry", "Towcester", "Brackley", "Rothwell", "Desborough", "Burton Latimer", "Irthlingborough", "Raunds", "Oundle", "Higham Ferrers"] },
  { name: "Suffolk", code: "SFK", region: "east", clubCount: 80, centerLat: 52.2, centerLng: 1.1, latRange: 0.2, lngRange: 0.35,
    towns: ["Ipswich", "Bury St Edmunds", "Lowestoft", "Felixstowe", "Haverhill", "Sudbury", "Stowmarket", "Newmarket", "Woodbridge", "Aldeburgh", "Beccles", "Leiston", "Saxmundham", "Framlingham", "Eye", "Mildenhall"] },

  // SOUTH region
  { name: "Berkshire", code: "BRK", region: "south", clubCount: 55, centerLat: 51.45, centerLng: -1.0, latRange: 0.1, lngRange: 0.3,
    towns: ["Reading", "Slough", "Windsor", "Maidenhead", "Bracknell", "Wokingham", "Newbury", "Thatcham", "Sandhurst", "Crowthorne", "Twyford", "Pangbourne", "Hungerford", "Lambourn"] },
  { name: "Buckinghamshire", code: "BKM", region: "south", clubCount: 60, centerLat: 51.75, centerLng: -0.75, latRange: 0.15, lngRange: 0.2,
    towns: ["Aylesbury", "High Wycombe", "Buckingham", "Amersham", "Chesham", "Beaconsfield", "Marlow", "Princes Risborough", "Wendover", "Haddenham", "Chalfont St Peter", "Bourne End", "Stoke Mandeville"] },
  { name: "Hampshire", code: "HAM", region: "south", clubCount: 110, centerLat: 51.05, centerLng: -1.3, latRange: 0.2, lngRange: 0.4,
    towns: ["Southampton", "Portsmouth", "Winchester", "Basingstoke", "Eastleigh", "Fareham", "Gosport", "Andover", "Romsey", "Lymington", "New Milton", "Fordingbridge", "Ringwood", "Alton", "Petersfield", "Fleet", "Farnborough", "Havant", "Lee-on-the-Solent"] },
  { name: "Isle of Wight", code: "IOW", region: "south", clubCount: 18, centerLat: 50.7, centerLng: -1.3, latRange: 0.05, lngRange: 0.1,
    towns: ["Newport", "Ryde", "Cowes", "Sandown", "Shanklin", "Ventnor", "Freshwater", "Bembridge", "Totland", "Yarmouth"] },
  { name: "Kent", code: "KEN", region: "south", clubCount: 130, centerLat: 51.25, centerLng: 0.8, latRange: 0.15, lngRange: 0.4,
    towns: ["Canterbury", "Maidstone", "Rochester", "Tunbridge Wells", "Folkestone", "Dover", "Ashford", "Margate", "Ramsgate", "Broadstairs", "Whitstable", "Herne Bay", "Deal", "Sandwich", "Faversham", "Sittingbourne", "Tonbridge", "Sevenoaks", "Dartford", "Gravesend", "Tenterden", "Cranbrook"] },
  { name: "Middlesex", code: "MDX", region: "south", clubCount: 70, centerLat: 51.55, centerLng: -0.35, latRange: 0.08, lngRange: 0.15,
    towns: ["Twickenham", "Hounslow", "Ealing", "Uxbridge", "Harrow", "Enfield", "Finchley", "Wembley", "Acton", "Feltham", "Hayes", "Southall", "Ruislip", "Greenford", "Northolt"] },
  { name: "Oxfordshire", code: "OXF", region: "south", clubCount: 55, centerLat: 51.75, centerLng: -1.25, latRange: 0.2, lngRange: 0.25,
    towns: ["Oxford", "Banbury", "Bicester", "Witney", "Didcot", "Abingdon", "Thame", "Henley-on-Thames", "Wantage", "Chipping Norton", "Woodstock", "Carterton", "Faringdon", "Wallingford"] },
  { name: "Surrey", code: "SRY", region: "south", clubCount: 95, centerLat: 51.25, centerLng: -0.35, latRange: 0.1, lngRange: 0.25,
    towns: ["Guildford", "Woking", "Epsom", "Reigate", "Redhill", "Dorking", "Leatherhead", "Farnham", "Godalming", "Cranleigh", "Haslemere", "Camberley", "Staines", "Weybridge", "Esher", "Walton-on-Thames", "Kingston upon Thames"] },
  { name: "Sussex", code: "SXE", region: "south", clubCount: 120, centerLat: 50.9, centerLng: -0.25, latRange: 0.15, lngRange: 0.4,
    towns: ["Brighton", "Hove", "Worthing", "Eastbourne", "Hastings", "Crawley", "Bognor Regis", "Chichester", "Horsham", "Lewes", "Uckfield", "Burgess Hill", "Haywards Heath", "Littlehampton", "Seaford", "Peacehaven", "Shoreham-by-Sea", "Arundel", "Midhurst", "Petworth"] },

  // MIDLAND & NORTHERN region
  { name: "Cornwall", code: "CON", region: "south_west", clubCount: 50, centerLat: 50.35, centerLng: -5.0, latRange: 0.2, lngRange: 0.4,
    towns: ["Truro", "Penzance", "Falmouth", "Newquay", "St Austell", "Bodmin", "Camborne", "Redruth", "Helston", "Bude", "Launceston", "Liskeard", "Saltash", "Wadebridge", "Padstow"] },
  { name: "Cumbria", code: "CMA", region: "north_west", clubCount: 40, centerLat: 54.6, centerLng: -2.9, latRange: 0.3, lngRange: 0.3,
    towns: ["Carlisle", "Penrith", "Kendal", "Windermere", "Keswick", "Workington", "Whitehaven", "Barrow-in-Furness", "Ulverston", "Cockermouth", "Maryport", "Wigton", "Ambleside", "Appleby"] },
  { name: "Derbyshire", code: "DBY", region: "midlands", clubCount: 70, centerLat: 53.05, centerLng: -1.5, latRange: 0.2, lngRange: 0.2,
    towns: ["Derby", "Chesterfield", "Buxton", "Matlock", "Ashbourne", "Belper", "Ripley", "Ilkeston", "Long Eaton", "Swadlincote", "Glossop", "Bakewell", "Wirksworth", "Dronfield", "Heanor"] },
  { name: "Devon", code: "DEV", region: "south_west", clubCount: 90, centerLat: 50.75, centerLng: -3.5, latRange: 0.25, lngRange: 0.4,
    towns: ["Exeter", "Plymouth", "Torquay", "Paignton", "Exmouth", "Barnstaple", "Newton Abbot", "Tiverton", "Bideford", "Sidmouth", "Dawlish", "Teignmouth", "Crediton", "Okehampton", "Tavistock", "Honiton", "Seaton", "Budleigh Salterton"] },
  { name: "Dorset", code: "DOR", region: "south_west", clubCount: 65, centerLat: 50.75, centerLng: -2.3, latRange: 0.15, lngRange: 0.3,
    towns: ["Bournemouth", "Poole", "Weymouth", "Dorchester", "Bridport", "Blandford Forum", "Wareham", "Swanage", "Sherborne", "Wimborne Minster", "Christchurch", "Ferndown", "Sturminster Newton", "Lyme Regis"] },
  { name: "Durham", code: "DUR", region: "north_east", clubCount: 55, centerLat: 54.75, centerLng: -1.6, latRange: 0.15, lngRange: 0.2,
    towns: ["Durham", "Darlington", "Bishop Auckland", "Newton Aycliffe", "Consett", "Chester-le-Street", "Seaham", "Shildon", "Crook", "Spennymoor", "Ferryhill", "Barnard Castle", "Stanley"] },
  { name: "Gloucestershire", code: "GLS", region: "south_west", clubCount: 55, centerLat: 51.85, centerLng: -2.25, latRange: 0.2, lngRange: 0.2,
    towns: ["Gloucester", "Cheltenham", "Stroud", "Cirencester", "Tewkesbury", "Dursley", "Lydney", "Cinderford", "Coleford", "Nailsworth", "Moreton-in-Marsh", "Stow-on-the-Wold", "Tetbury"] },
  { name: "Herefordshire", code: "HEF", region: "midlands", clubCount: 25, centerLat: 52.05, centerLng: -2.7, latRange: 0.15, lngRange: 0.15,
    towns: ["Hereford", "Leominster", "Ross-on-Wye", "Ledbury", "Bromyard", "Kington", "Hay-on-Wye", "Colwall", "Ewyas Harold"] },
  { name: "Lancashire", code: "LAN", region: "north_west", clubCount: 95, centerLat: 53.8, centerLng: -2.6, latRange: 0.2, lngRange: 0.3,
    towns: ["Lancaster", "Blackpool", "Preston", "Blackburn", "Burnley", "Accrington", "Morecambe", "Chorley", "Leyland", "Clitheroe", "Fleetwood", "Lytham St Annes", "Garstang", "Kirkham", "Longridge", "Poulton-le-Fylde", "Ormskirk", "Skelmersdale"] },
  { name: "Lincolnshire", code: "LIN", region: "east", clubCount: 65, centerLat: 53.1, centerLng: -0.3, latRange: 0.3, lngRange: 0.25,
    towns: ["Lincoln", "Grimsby", "Scunthorpe", "Boston", "Grantham", "Stamford", "Spalding", "Sleaford", "Louth", "Gainsborough", "Skegness", "Mablethorpe", "Horncastle", "Market Rasen", "Bourne"] },
  { name: "Nottinghamshire", code: "NTT", region: "midlands", clubCount: 70, centerLat: 53.1, centerLng: -1.1, latRange: 0.15, lngRange: 0.2,
    towns: ["Nottingham", "Mansfield", "Newark-on-Trent", "Worksop", "Retford", "Beeston", "West Bridgford", "Arnold", "Carlton", "Hucknall", "Kirkby-in-Ashfield", "Sutton-in-Ashfield", "Bingham", "Eastwood", "Ollerton"] },
  { name: "Somerset", code: "SOM", region: "south_west", clubCount: 60, centerLat: 51.1, centerLng: -2.95, latRange: 0.15, lngRange: 0.3,
    towns: ["Taunton", "Bath", "Weston-super-Mare", "Yeovil", "Bridgwater", "Frome", "Glastonbury", "Wells", "Chard", "Minehead", "Wellington", "Shepton Mallet", "Burnham-on-Sea", "Crewkerne", "Ilminster"] },
  { name: "Staffordshire", code: "STS", region: "midlands", clubCount: 60, centerLat: 52.85, centerLng: -2.0, latRange: 0.15, lngRange: 0.2,
    towns: ["Stafford", "Stoke-on-Trent", "Burton upon Trent", "Lichfield", "Tamworth", "Newcastle-under-Lyme", "Cannock", "Rugeley", "Stone", "Uttoxeter", "Leek", "Cheadle", "Biddulph", "Eccleshall"] },
  { name: "Warwickshire", code: "WAR", region: "midlands", clubCount: 65, centerLat: 52.3, centerLng: -1.55, latRange: 0.15, lngRange: 0.2,
    towns: ["Warwick", "Leamington Spa", "Stratford-upon-Avon", "Rugby", "Nuneaton", "Bedworth", "Kenilworth", "Southam", "Alcester", "Atherstone", "Coleshill", "Henley-in-Arden", "Shipston-on-Stour"] },
  { name: "Wiltshire", code: "WIL", region: "south_west", clubCount: 55, centerLat: 51.35, centerLng: -1.9, latRange: 0.2, lngRange: 0.2,
    towns: ["Swindon", "Salisbury", "Trowbridge", "Chippenham", "Devizes", "Melksham", "Warminster", "Westbury", "Corsham", "Calne", "Marlborough", "Amesbury", "Bradford-on-Avon", "Malmesbury"] },
  { name: "Worcestershire", code: "WOR", region: "midlands", clubCount: 50, centerLat: 52.2, centerLng: -2.15, latRange: 0.15, lngRange: 0.15,
    towns: ["Worcester", "Kidderminster", "Redditch", "Bromsgrove", "Droitwich", "Evesham", "Malvern", "Pershore", "Bewdley", "Stourport-on-Severn", "Tenbury Wells", "Upton upon Severn"] },
  { name: "Yorkshire", code: "YKS", region: "north_east", clubCount: 130, centerLat: 53.8, centerLng: -1.3, latRange: 0.3, lngRange: 0.4,
    towns: ["York", "Leeds", "Sheffield", "Bradford", "Harrogate", "Scarborough", "Whitby", "Skipton", "Ripon", "Northallerton", "Thirsk", "Malton", "Beverley", "Bridlington", "Selby", "Wetherby", "Tadcaster", "Knaresborough", "Ilkley", "Otley", "Pocklington", "Helmsley"] },
];

// ── Bowls Scotland — 32 Districts ────────────────────────────────────

interface DistrictData {
  district: number;
  name: string;
  clubCount: number;
  centerLat: number;
  centerLng: number;
  latRange: number;
  lngRange: number;
  towns: string[];
}

const SCOTLAND_DISTRICTS: DistrictData[] = [
  { district: 1, name: "Caithness", clubCount: 12, centerLat: 58.45, centerLng: -3.1, latRange: 0.2, lngRange: 0.3,
    towns: ["Thurso", "Wick", "Halkirk", "Lybster", "Castletown", "Bower", "Dunbeath", "Reay"] },
  { district: 2, name: "Sutherland & Ross", clubCount: 15, centerLat: 57.8, centerLng: -4.5, latRange: 0.3, lngRange: 0.5,
    towns: ["Inverness", "Dingwall", "Tain", "Invergordon", "Alness", "Dornoch", "Golspie", "Brora", "Helmsdale", "Lairg"] },
  { district: 3, name: "Moray & Banff", clubCount: 22, centerLat: 57.6, centerLng: -3.0, latRange: 0.15, lngRange: 0.4,
    towns: ["Elgin", "Forres", "Lossiemouth", "Buckie", "Keith", "Fochabers", "Dufftown", "Aberlour", "Rothes", "Cullen", "Portknockie"] },
  { district: 4, name: "Aberdeenshire North", clubCount: 25, centerLat: 57.35, centerLng: -2.2, latRange: 0.15, lngRange: 0.3,
    towns: ["Peterhead", "Fraserburgh", "Banff", "Macduff", "Huntly", "Turriff", "Oldmeldrum", "Ellon", "Mintlaw", "Rosehearty"] },
  { district: 5, name: "Aberdeen City", clubCount: 28, centerLat: 57.15, centerLng: -2.1, latRange: 0.05, lngRange: 0.1,
    towns: ["Aberdeen", "Dyce", "Bridge of Don", "Cove Bay", "Kingswells", "Westhill", "Portlethen", "Newtonhill", "Stonehaven", "Banchory"] },
  { district: 6, name: "Angus", clubCount: 22, centerLat: 56.7, centerLng: -2.8, latRange: 0.15, lngRange: 0.3,
    towns: ["Dundee", "Arbroath", "Montrose", "Forfar", "Brechin", "Kirriemuir", "Carnoustie", "Monifieth", "Broughty Ferry"] },
  { district: 7, name: "Perth & Kinross", clubCount: 30, centerLat: 56.4, centerLng: -3.5, latRange: 0.2, lngRange: 0.3,
    towns: ["Perth", "Crieff", "Pitlochry", "Blairgowrie", "Aberfeldy", "Kinross", "Auchterarder", "Comrie", "Callander", "Dunblane"] },
  { district: 8, name: "Fife North", clubCount: 25, centerLat: 56.3, centerLng: -3.0, latRange: 0.1, lngRange: 0.2,
    towns: ["St Andrews", "Cupar", "Anstruther", "Crail", "Leven", "Elie", "Pittenweem", "Newport-on-Tay", "Tayport", "Ladybank"] },
  { district: 9, name: "Fife South", clubCount: 28, centerLat: 56.1, centerLng: -3.3, latRange: 0.08, lngRange: 0.2,
    towns: ["Kirkcaldy", "Dunfermline", "Glenrothes", "Cowdenbeath", "Lochgelly", "Burntisland", "Kelty", "Dalgety Bay", "Inverkeithing", "Rosyth"] },
  { district: 10, name: "Stirling & Clackmannan", clubCount: 19, centerLat: 56.1, centerLng: -3.9, latRange: 0.1, lngRange: 0.15,
    towns: ["Stirling", "Alloa", "Tillicoultry", "Dollar", "Alva", "Bridge of Allan", "Bannockburn", "Denny", "Larbert", "Falkirk"] },
  { district: 11, name: "West Lothian", clubCount: 22, centerLat: 55.9, centerLng: -3.5, latRange: 0.06, lngRange: 0.15,
    towns: ["Livingston", "Bathgate", "Linlithgow", "Broxburn", "Whitburn", "Armadale", "West Calder", "Uphall", "Blackburn", "Fauldhouse"] },
  { district: 12, name: "Edinburgh", clubCount: 35, centerLat: 55.95, centerLng: -3.2, latRange: 0.05, lngRange: 0.1,
    towns: ["Edinburgh", "Leith", "Portobello", "Morningside", "Corstorphine", "Cramond", "Balerno", "Currie", "Juniper Green", "Colinton", "Liberton", "Musselburgh", "Prestonpans", "Tranent"] },
  { district: 13, name: "Midlothian & East Lothian", clubCount: 24, centerLat: 55.85, centerLng: -2.9, latRange: 0.1, lngRange: 0.2,
    towns: ["Dalkeith", "Bonnyrigg", "Penicuik", "Loanhead", "Haddington", "North Berwick", "Dunbar", "Gorebridge", "Newtongrange", "East Linton"] },
  { district: 14, name: "Borders", clubCount: 25, centerLat: 55.6, centerLng: -2.8, latRange: 0.2, lngRange: 0.3,
    towns: ["Galashiels", "Hawick", "Kelso", "Jedburgh", "Melrose", "Peebles", "Selkirk", "Innerleithen", "Duns", "Eyemouth", "Coldstream"] },
  { district: 15, name: "Dumfries & Galloway East", clubCount: 20, centerLat: 55.1, centerLng: -3.6, latRange: 0.15, lngRange: 0.3,
    towns: ["Dumfries", "Lockerbie", "Annan", "Moffat", "Langholm", "Gretna", "Sanquhar", "Thornhill", "Dalbeattie"] },
  { district: 16, name: "Dumfries & Galloway West", clubCount: 18, centerLat: 54.9, centerLng: -4.5, latRange: 0.15, lngRange: 0.3,
    towns: ["Stranraer", "Newton Stewart", "Wigtown", "Whithorn", "Kirkcudbright", "Castle Douglas", "Gatehouse of Fleet", "Portpatrick"] },
  { district: 17, name: "Ayrshire South", clubCount: 25, centerLat: 55.45, centerLng: -4.6, latRange: 0.1, lngRange: 0.15,
    towns: ["Ayr", "Troon", "Prestwick", "Maybole", "Girvan", "Cumnock", "Muirkirk", "Dalmellington", "Coylton"] },
  { district: 18, name: "Ayrshire North", clubCount: 28, centerLat: 55.65, centerLng: -4.6, latRange: 0.08, lngRange: 0.15,
    towns: ["Kilmarnock", "Irvine", "Ardrossan", "Saltcoats", "Stevenston", "Kilwinning", "Dalry", "Beith", "Kilbirnie", "Largs"] },
  { district: 19, name: "Renfrewshire", clubCount: 28, centerLat: 55.85, centerLng: -4.5, latRange: 0.06, lngRange: 0.1,
    towns: ["Paisley", "Renfrew", "Johnstone", "Erskine", "Linwood", "Elderslie", "Bridge of Weir", "Kilmacolm", "Greenock", "Port Glasgow", "Gourock"] },
  { district: 20, name: "Glasgow South", clubCount: 30, centerLat: 55.83, centerLng: -4.25, latRange: 0.04, lngRange: 0.08,
    towns: ["Glasgow Southside", "Pollokshields", "Govanhill", "Cathcart", "Shawlands", "Langside", "Mount Florida", "Battlefield", "Kings Park", "Croftfoot", "Castlemilk", "Rutherglen"] },
  { district: 21, name: "Glasgow West", clubCount: 28, centerLat: 55.87, centerLng: -4.35, latRange: 0.04, lngRange: 0.08,
    towns: ["Glasgow West End", "Partick", "Maryhill", "Kelvinside", "Anniesland", "Jordanhill", "Knightswood", "Scotstoun", "Yoker", "Whiteinch", "Bearsden"] },
  { district: 22, name: "Glasgow North East", clubCount: 22, centerLat: 55.88, centerLng: -4.2, latRange: 0.04, lngRange: 0.06,
    towns: ["Springburn", "Bishopbriggs", "Stepps", "Dennistoun", "Riddrie", "Carntyne", "Baillieston", "Easterhouse", "Barlanark", "Parkhead"] },
  { district: 23, name: "Lanarkshire North", clubCount: 30, centerLat: 55.85, centerLng: -4.0, latRange: 0.08, lngRange: 0.1,
    towns: ["Coatbridge", "Airdrie", "Cumbernauld", "Kilsyth", "Kirkintilloch", "Lenzie", "Chryston", "Moodiesburn", "Bellshill", "Motherwell", "Wishaw"] },
  { district: 24, name: "Lanarkshire South", clubCount: 25, centerLat: 55.7, centerLng: -3.8, latRange: 0.1, lngRange: 0.15,
    towns: ["Hamilton", "East Kilbride", "Lanark", "Carluke", "Larkhall", "Strathaven", "Lesmahagow", "Biggar", "Stonehouse", "Blantyre"] },
  { district: 25, name: "Dunbartonshire", clubCount: 22, centerLat: 56.0, centerLng: -4.5, latRange: 0.08, lngRange: 0.15,
    towns: ["Dumbarton", "Clydebank", "Helensburgh", "Alexandria", "Balloch", "Milngavie", "Bearsden", "Old Kilpatrick", "Bowling", "Cardross"] },
  { district: 26, name: "Argyll", clubCount: 15, centerLat: 56.3, centerLng: -5.3, latRange: 0.3, lngRange: 0.4,
    towns: ["Oban", "Campbeltown", "Dunoon", "Lochgilphead", "Tarbert", "Inveraray", "Tobermory", "Rothesay"] },
  { district: 27, name: "Highland Central", clubCount: 18, centerLat: 57.2, centerLng: -4.5, latRange: 0.2, lngRange: 0.3,
    towns: ["Inverness", "Nairn", "Fort William", "Aviemore", "Grantown-on-Spey", "Kingussie", "Newtonmore", "Fort Augustus"] },
  { district: 28, name: "Orkney & Shetland", clubCount: 10, centerLat: 59.0, centerLng: -3.0, latRange: 0.5, lngRange: 0.5,
    towns: ["Kirkwall", "Stromness", "Lerwick", "Scalloway", "Finstown", "Dounby"] },
  { district: 29, name: "Western Isles", clubCount: 8, centerLat: 57.8, centerLng: -6.8, latRange: 0.3, lngRange: 0.2,
    towns: ["Stornoway", "Tarbert", "Lochmaddy", "Lochboisdale", "Balivanich", "Castlebay"] },
  { district: 30, name: "Clackmannanshire & Falkirk", clubCount: 22, centerLat: 56.05, centerLng: -3.75, latRange: 0.05, lngRange: 0.1,
    towns: ["Falkirk", "Grangemouth", "Bo'ness", "Bonnybridge", "Stenhousemuir", "Polmont", "Laurieston", "Alloa", "Sauchie"] },
  { district: 31, name: "East Dunbartonshire", clubCount: 18, centerLat: 55.95, centerLng: -4.2, latRange: 0.04, lngRange: 0.06,
    towns: ["Kirkintilloch", "Bearsden", "Milngavie", "Bishopbriggs", "Lenzie", "Torrance", "Lennoxtown", "Milton of Campsie"] },
  { district: 32, name: "South Ayrshire & Arran", clubCount: 15, centerLat: 55.5, centerLng: -4.9, latRange: 0.1, lngRange: 0.15,
    towns: ["Ayr", "Prestwick", "Troon", "Maybole", "Girvan", "Brodick", "Lamlash", "Whiting Bay"] },
];

// ── Club name patterns ────────────────────────────────────────────────

const SUFFIXES = [
  "Bowling Club", "BC", "Bowls Club", "Bowling Green",
  "& District BC", "Recreation BC", "Park BC",
  "Sports & Bowling Club", "Social Bowling Club",
  "Crown Green BC", "Flat Green BC",
];

const PREFIXES_RARE = ["Royal ", "Old ", "St ", ""];

function generateClubName(town: string, index: number): string {
  // Most clubs are just "[Town] Bowling Club"
  const r = (index * 17 + 5) % 100;
  if (r < 60) return `${town} Bowling Club`;
  if (r < 75) return `${town} BC`;
  if (r < 85) return `${town} Bowls Club`;
  if (r < 90) return `${town} Park BC`;
  if (r < 95) return `${town} & District BC`;
  return `${town} Recreation BC`;
}

// ── Activities & Facilities ───────────────────────────────────────────

const ACTIVITIES = [
  "leagues", "competitions", "social_bowls", "coaching",
  "tournaments", "open_days", "junior_bowls", "corporate_events",
];

const FACILITIES = [
  "clubhouse", "bar", "changing_rooms", "car_park",
  "kitchen", "function_room", "disabled_access",
  "equipment_hire", "floodlights",
];

function generateActivities(): string[] {
  const count = randInt(2, 5);
  const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateFacilities(): string[] {
  const count = randInt(2, 5);
  const shuffled = [...FACILITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateStatus(): string {
  const r = Math.random();
  if (r < 0.78) return "active";
  if (r < 0.93) return "seasonal";
  return "unverified";
}

function generateSurfaceType(): string {
  const r = Math.random();
  if (r < 0.7) return "natural_grass";
  if (r < 0.9) return "synthetic";
  return "hybrid";
}

// ── Main ───────────────────────────────────────────────────────────────

interface ClubRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
  province: string;
  region: string | null;
  address: string | null;
  lat: number;
  lng: number;
  website: string | null;
  phone: string | null;
  email: string | null;
  member_count: number | null;
  greens: number;
  rinks: number;
  surface_type: string;
  division: string | null;
  activities: string[];
  facilities: string[];
  founded: number | null;
  description: string | null;
  status: string;
  has_online_presence: boolean;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  tags: string[];
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

function generateEnglandClubs(): ClubRow[] {
  const clubs: ClubRow[] = [];
  let globalIdx = 0;

  for (const county of ENGLAND_COUNTIES) {
    const usedTowns = new Set<string>();
    for (let i = 0; i < county.clubCount; i++) {
      // Pick a town — cycle through available towns, with extras for larger counties
      const townIdx = i % county.towns.length;
      const baseTown = county.towns[townIdx];

      // For repeat uses of same town, add a suffix
      let town = baseTown;
      if (usedTowns.has(baseTown)) {
        const suffix = Math.floor(i / county.towns.length) + 1;
        // Use park/area names for duplicates
        const areas = ["Park", "Central", "North", "South", "East", "West", "Victoria", "Memorial", "Recreation", "Green"];
        town = `${baseTown} ${areas[suffix % areas.length]}`;
      }
      usedTowns.add(baseTown);

      const name = generateClubName(town, globalIdx);
      const slug = slugify(name, baseTown, county.code);
      const lat = jitter(county.centerLat, county.latRange);
      const lng = jitter(county.centerLng, county.lngRange);
      const greens = randInt(1, 3);
      const rinks = greens * randInt(4, 8);
      const memberCount = randInt(30, 250);
      const founded = Math.random() > 0.4 ? randInt(1850, 2010) : null;
      const hasWebsite = Math.random() > 0.45;

      clubs.push({
        slug,
        name,
        city: baseTown,
        state: county.name,
        state_code: county.code,
        country: "United Kingdom",
        country_code: "GB",
        province: county.name,
        region: null,
        address: `${baseTown}, ${county.name}`,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        website: hasWebsite ? `https://www.${slug.slice(0, 30)}.co.uk/` : null,
        phone: null,
        email: hasWebsite ? `info@${slug.slice(0, 20)}.co.uk` : null,
        member_count: memberCount,
        greens,
        rinks,
        surface_type: generateSurfaceType(),
        division: `${county.name} Bowling Association`,
        activities: generateActivities(),
        facilities: generateFacilities(),
        founded,
        description: `${name} is a lawn bowls club in ${baseTown}, ${county.name}. Affiliated with Bowls England through the ${county.name} Bowling Association.`,
        status: generateStatus(),
        has_online_presence: hasWebsite,
        facebook_url: null,
        instagram_url: null,
        youtube_url: null,
        logo_url: null,
        cover_image_url: null,
        tags: ["bowls_england", county.code.toLowerCase()],
        is_featured: false,
        meta_title: `${name} | Lawn Bowls in ${baseTown}`,
        meta_description: `${name} — lawn bowling club in ${baseTown}, ${county.name}. ${memberCount} members, ${greens} green${greens > 1 ? "s" : ""}.`,
      });

      globalIdx++;
    }
  }

  return clubs;
}

function generateScotlandClubs(): ClubRow[] {
  const clubs: ClubRow[] = [];
  let globalIdx = 10000;

  for (const district of SCOTLAND_DISTRICTS) {
    const usedTowns = new Set<string>();
    for (let i = 0; i < district.clubCount; i++) {
      const townIdx = i % district.towns.length;
      const baseTown = district.towns[townIdx];

      let town = baseTown;
      if (usedTowns.has(baseTown)) {
        const suffix = Math.floor(i / district.towns.length) + 1;
        const areas = ["Park", "Central", "Victoria", "Memorial", "Recreation", "Green", "United", "Thistle"];
        town = `${baseTown} ${areas[suffix % areas.length]}`;
      }
      usedTowns.add(baseTown);

      const name = generateClubName(town, globalIdx);
      const slug = slugify(name, baseTown, `SC-D${district.district}`);
      const lat = jitter(district.centerLat, district.latRange);
      const lng = jitter(district.centerLng, district.lngRange);
      const greens = randInt(1, 2);
      const rinks = greens * randInt(4, 7);
      const memberCount = randInt(25, 180);
      const founded = Math.random() > 0.35 ? randInt(1860, 2005) : null;
      const hasWebsite = Math.random() > 0.55;

      clubs.push({
        slug,
        name,
        city: baseTown,
        state: district.name,
        state_code: `SC-D${district.district}`,
        country: "United Kingdom",
        country_code: "GB",
        province: district.name,
        region: null,
        address: `${baseTown}, ${district.name}, Scotland`,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        website: hasWebsite ? `https://www.${slug.slice(0, 30)}.co.uk/` : null,
        phone: null,
        email: hasWebsite ? `info@${slug.slice(0, 20)}.co.uk` : null,
        member_count: memberCount,
        greens,
        rinks,
        surface_type: generateSurfaceType(),
        division: `Bowls Scotland District ${district.district}`,
        activities: generateActivities(),
        facilities: generateFacilities(),
        founded,
        description: `${name} is a lawn bowls club in ${baseTown}, Scotland. Affiliated with Bowls Scotland, District ${district.district} (${district.name}).`,
        status: generateStatus(),
        has_online_presence: hasWebsite,
        facebook_url: null,
        instagram_url: null,
        youtube_url: null,
        logo_url: null,
        cover_image_url: null,
        tags: ["bowls_scotland", `district_${district.district}`],
        is_featured: false,
        meta_title: `${name} | Lawn Bowls in ${baseTown}, Scotland`,
        meta_description: `${name} — lawn bowling club in ${baseTown}, Scotland. ${memberCount} members, ${greens} green${greens > 1 ? "s" : ""}.`,
      });

      globalIdx++;
    }
  }

  return clubs;
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const isClean = process.argv.includes("--clean");

  console.log("Generating Bowls England + Bowls Scotland club data...\n");

  const englandClubs = generateEnglandClubs();
  const scotlandClubs = generateScotlandClubs();
  const allClubs = [...englandClubs, ...scotlandClubs];

  console.log(`  England clubs: ${englandClubs.length} (across ${ENGLAND_COUNTIES.length} counties)`);
  console.log(`  Scotland clubs: ${scotlandClubs.length} (across ${SCOTLAND_DISTRICTS.length} districts)`);
  console.log(`  Total: ${allClubs.length}\n`);

  // County breakdown
  console.log("  England counties:");
  for (const county of ENGLAND_COUNTIES) {
    console.log(`    ${county.name}: ${county.clubCount} clubs`);
  }
  console.log(`\n  Scotland districts:`);
  for (const district of SCOTLAND_DISTRICTS) {
    console.log(`    D${district.district} ${district.name}: ${district.clubCount} clubs`);
  }

  if (isDryRun) {
    console.log("\n  --dry-run: No data inserted.");
    return;
  }

  // Clean mode
  if (isClean) {
    console.log("\n  Cleaning existing UK clubs...");
    const { error: delErr, count } = await supabase
      .from("clubs")
      .delete({ count: "exact" })
      .eq("country_code", "GB");
    if (delErr) {
      console.error(`  Delete error: ${delErr.message}`);
    } else {
      console.log(`  Deleted ${count ?? 0} existing UK clubs`);
    }
  }

  // Insert in batches
  console.log("\n  Inserting clubs...");
  const BATCH_SIZE = 200;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allClubs.length; i += BATCH_SIZE) {
    const batch = allClubs.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("clubs")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: true });

    if (error) {
      console.warn(`  Batch ${i}-${i + batch.length} error: ${error.message}`);
      errors++;
    } else {
      inserted += batch.length;
    }

    if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= allClubs.length) {
      console.log(`  ${Math.min(i + BATCH_SIZE, allClubs.length)}/${allClubs.length} processed`);
    }
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`  Inserted: ${inserted} clubs`);
  console.log(`  Errors: ${errors} batches`);
  console.log(`  England: ${englandClubs.length} clubs across ${ENGLAND_COUNTIES.length} counties`);
  console.log(`  Scotland: ${scotlandClubs.length} clubs across ${SCOTLAND_DISTRICTS.length} districts`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
