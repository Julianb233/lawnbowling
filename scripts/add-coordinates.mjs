// Script to add lat/lng coordinates to all US clubs in clubs-data.ts
import { readFileSync, writeFileSync } from 'fs';

const coords = {
  "ca-san-francisco": { lat: 37.7694, lng: -122.4862 },
  "ca-berkeley": { lat: 37.8679, lng: -122.2774 },
  "ca-palo-alto": { lat: 37.4447, lng: -122.1625 },
  "ca-santa-cruz": { lat: 36.9692, lng: -122.0263 },
  "ca-oakland": { lat: 37.8103, lng: -122.2559 },
  "ca-rossmoor": { lat: 37.8867, lng: -122.0650 },
  "ca-san-jose": { lat: 37.3182, lng: -121.8846 },
  "ca-santa-clara": { lat: 37.3514, lng: -121.9541 },
  "ca-sunnyvale": { lat: 37.3552, lng: -122.0198 },
  "ca-del-mesa-carmel": { lat: 36.5378, lng: -121.8984 },
  "ca-fresno": { lat: 36.7539, lng: -119.7827 },
  "ca-oakmont-santa-rosa": { lat: 38.4388, lng: -122.5989 },
  "ca-laguna-beach": { lat: 33.5447, lng: -117.7838 },
  "ca-long-beach": { lat: 33.7848, lng: -118.1568 },
  "ca-santa-monica": { lat: 34.0289, lng: -118.4682 },
  "ca-beverly-hills": { lat: 34.0618, lng: -118.4086 },
  "ca-holmby-park": { lat: 34.0629, lng: -118.4381 },
  "ca-pasadena": { lat: 34.1392, lng: -118.1489 },
  "ca-san-diego": { lat: 32.7311, lng: -117.1506 },
  "ca-coronado": { lat: 32.6845, lng: -117.1749 },
  "ca-santa-anita": { lat: 34.1364, lng: -118.0468 },
  "ca-mackenzie-park": { lat: 34.4286, lng: -119.7107 },
  "ca-santa-barbara": { lat: 34.4293, lng: -119.7147 },
  "ca-newport-harbor": { lat: 33.5970, lng: -117.8760 },
  "ca-laguna-woods": { lat: 33.6100, lng: -117.7253 },
  "ca-redlands": { lat: 34.0577, lng: -117.1782 },
  "ca-riverside": { lat: 33.9788, lng: -117.3753 },
  "ca-santa-ana": { lat: 33.7575, lng: -117.8575 },
  "ca-oaks-north": { lat: 32.9819, lng: -117.0801 },
  "ca-oxnard": { lat: 34.2005, lng: -119.1792 },
  "ca-hermosa-beach": { lat: 33.8622, lng: -118.3965 },
  "ca-cambria": { lat: 35.5681, lng: -121.0831 },
  "ca-pomona": { lat: 34.0749, lng: -117.7425 },
  "ca-hemet": { lat: 33.7389, lng: -116.9906 },
  "ca-friendly-valley": { lat: 34.3859, lng: -118.5325 },
  "ca-sun-city-menifee": { lat: 33.6831, lng: -117.1980 },
  "ca-groves-irvine": { lat: 33.7256, lng: -117.7627 },
  "ca-casta-del-sol": { lat: 33.5983, lng: -117.6575 },
  "az-bell": { lat: 33.6251, lng: -112.2793 },
  "az-johnson": { lat: 33.6673, lng: -112.3555 },
  "az-lakeview": { lat: 33.6109, lng: -112.2739 },
  "az-oakmont": { lat: 33.6102, lng: -112.2847 },
  "az-leisure-world-mesa": { lat: 33.3984, lng: -111.6813 },
  "az-paradise-rv": { lat: 33.6534, lng: -112.2948 },
  "az-fairway-mountain-view": { lat: 33.5810, lng: -112.2643 },
  "fl-clearwater": { lat: 27.9703, lng: -82.7970 },
  "fl-sun-city-center": { lat: 27.7160, lng: -82.3529 },
  "fl-sarasota": { lat: 27.3333, lng: -82.5275 },
  "fl-lakeland": { lat: 28.0459, lng: -81.9389 },
  "fl-mount-dora": { lat: 28.8060, lng: -81.6434 },
  "fl-st-petersburg": { lat: 27.7725, lng: -82.6365 },
  "fl-delray-beach": { lat: 26.4616, lng: -80.0706 },
  "fl-kings-point": { lat: 27.7123, lng: -82.3569 },
  "fl-maple-leaf": { lat: 26.9916, lng: -82.0818 },
  "fl-villages": { lat: 28.9117, lng: -81.9753 },
  "fl-sun-n-fun": { lat: 27.3428, lng: -82.4573 },
  "fl-world-parkway": { lat: 27.9558, lng: -82.7555 },
  "ny-central-park": { lat: 40.7726, lng: -73.9758 },
  "ny-ausable": { lat: 44.1627, lng: -73.7665 },
  "ct-thistle": { lat: 41.7706, lng: -72.7226 },
  "ct-fernleigh": { lat: 41.7730, lng: -72.7283 },
  "ct-greenwich": { lat: 41.0344, lng: -73.6271 },
  "nj-essex-county": { lat: 40.7854, lng: -74.1854 },
  "pa-frick-park": { lat: 40.4302, lng: -79.9012 },
  "pa-buck-hill-falls": { lat: 41.0882, lng: -75.2588 },
  "pa-skytop": { lat: 41.1139, lng: -75.2917 },
  "de-dupont": { lat: 39.7705, lng: -75.5757 },
  "md-leisure-world": { lat: 39.0945, lng: -77.0784 },
  "va-chesapeake-bay": { lat: 37.5384, lng: -76.3898 },
  "nc-asheville": { lat: 35.5686, lng: -82.5710 },
  "nc-pinehurst": { lat: 35.1983, lng: -79.4693 },
  "ar-hot-springs-village": { lat: 34.6720, lng: -92.9987 },
  "tn-nashville-fogg-street": { lat: 36.1490, lng: -86.7858 },
  "il-chicago-lakeside": { lat: 41.7850, lng: -87.5818 },
  "wi-milwaukee-lake-park": { lat: 43.0823, lng: -87.8718 },
  "oh-cincinnati": { lat: 39.1283, lng: -84.3674 },
  "oh-lorain": { lat: 41.4565, lng: -82.1926 },
  "in-fort-wayne": { lat: 41.1027, lng: -85.1530 },
  "mn-brits-pub": { lat: 44.9706, lng: -93.2770 },
  "mn-brookview": { lat: 44.9901, lng: -93.3765 },
  "mn-centennial-lakes": { lat: 44.8751, lng: -93.3333 },
  "mn-maddens": { lat: 46.3505, lng: -94.3255 },
  "co-denver": { lat: 39.6977, lng: -104.9699 },
  "hi-honolulu": { lat: 21.2903, lng: -157.8480 },
  "ut-sunriver": { lat: 37.0593, lng: -113.5688 },
  "wa-jefferson-park": { lat: 47.5710, lng: -122.3105 },
  "wa-spokane": { lat: 47.6619, lng: -117.3723 },
  "wa-tacoma": { lat: 47.2578, lng: -122.4446 },
  "or-portland": { lat: 45.4753, lng: -122.6408 },
  "or-king-city": { lat: 45.4059, lng: -122.8015 },
};

const filePath = 'src/lib/clubs-data.ts';
let content = readFileSync(filePath, 'utf-8');

let updated = 0;
for (const [id, { lat, lng }] of Object.entries(coords)) {
  // Match the club entry by id and add lat/lng after region field
  const idPattern = `id: "${id}"`;
  if (!content.includes(idPattern)) {
    console.log(`WARNING: Club "${id}" not found in file`);
    continue;
  }

  // Check if already has lat/lng
  const idx = content.indexOf(idPattern);
  const lineEnd = content.indexOf('\n', idx);
  const line = content.substring(idx, lineEnd);
  if (line.includes('lat:')) {
    console.log(`SKIP: "${id}" already has lat/lng`);
    continue;
  }

  // Add lat/lng after the region field value
  // Pattern: region: "xxx", -> region: "xxx", lat: X, lng: Y,
  const regionPattern = new RegExp(`(id: "${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*?region: "[^"]*")`);
  const match = content.match(regionPattern);
  if (match) {
    content = content.replace(match[1], `${match[1]}, lat: ${lat}, lng: ${lng}`);
    updated++;
  } else {
    console.log(`WARNING: Could not find region pattern for "${id}"`);
  }
}

writeFileSync(filePath, content, 'utf-8');
console.log(`\nDone! Updated ${updated} clubs with coordinates.`);
