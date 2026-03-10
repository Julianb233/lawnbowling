#!/usr/bin/env node
/**
 * Download and optimize sports stock images from Unsplash and Pexels.
 * Uses sharp (bundled via Next.js) for WebP conversion.
 */
import { writeFile, mkdir } from 'fs/promises';
import { statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const BASE_DIR = join(import.meta.dirname, '..', 'public', 'images', 'sports');

// All URLs verified as 200 OK
const PHOTOS = {
  pickleball: [
    {
      name: 'hero',
      // Venti Views - person playing pickleball on a sunny day
      url: 'https://images.unsplash.com/photo-1747027694173-93c7576ab263?w=1920&q=80',
      credit: 'Unsplash - Venti Views (xO8xgTKNB1s)'
    },
    {
      name: 'action-1',
      // Pexels - pickleball court and paddle
      url: 'https://images.pexels.com/photos/8224733/pexels-photo-8224733.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Pickleball scene (8224733)'
    },
    {
      name: 'action-2',
      // Pexels - pickleball paddle on court
      url: 'https://images.pexels.com/photos/8224726/pexels-photo-8224726.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Pickleball action (8224726)'
    }
  ],
  tennis: [
    {
      name: 'hero',
      // Female tennis player in action on the court
      url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
      credit: 'Unsplash - Jim Weatherford (lqU8diyO3WU)'
    },
    {
      name: 'action-1',
      // Man swinging tennis racquet
      url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
      credit: 'Unsplash - Andrew Heald (n9RZ0dCunpY)'
    },
    {
      name: 'action-2',
      // Tennis player walking across court - artistic silhouette
      url: 'https://images.unsplash.com/photo-1673694103737-5fd09c9decdc?w=1920&q=80',
      credit: 'Unsplash - d c (T_iinZIgR4w)'
    }
  ],
  'lawn-bowling': [
    {
      name: 'hero',
      // Boys playing ball on green grass
      url: 'https://images.unsplash.com/photo-1536252107959-9aa5927cc6de?w=1920&q=80',
      credit: 'Unsplash - Kelly Sikkema (IUttfjXcaA4)'
    },
    {
      name: 'action-1',
      // Pexels - bocce scene
      url: 'https://images.pexels.com/photos/6592674/pexels-photo-6592674.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Bocce scene (6592674)'
    },
    {
      name: 'action-2',
      // Pexels - bocce balls on grass
      url: 'https://images.pexels.com/photos/5303296/pexels-photo-5303296.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Bocce balls (5303296)'
    }
  ],
  badminton: [
    {
      name: 'hero',
      // Mahmur Marganti - badminton player at net (Asian Games)
      url: 'https://images.unsplash.com/photo-1595220427358-8cf2ce3d7f89?w=1920&q=80',
      credit: 'Unsplash - Mahmur Marganti (s7R3sGbiYvA)'
    },
    {
      name: 'action-1',
      // Tony Chen - badminton player stands with racquet
      url: 'https://images.unsplash.com/photo-1748323850805-5d6e76e59639?w=1920&q=80',
      credit: 'Unsplash - Tony Chen (SwZkgQw_qpQ)'
    },
    {
      name: 'action-2',
      // Pexels - badminton action
      url: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Badminton action (3660204)'
    }
  ],
  racquetball: [
    {
      name: 'hero',
      // Aryaman Agarwal - squash court with red markings
      url: 'https://images.unsplash.com/photo-1740813416116-a07511d2e188?w=1920&q=80',
      credit: 'Unsplash - Aryaman Agarwal (NQaK7kIYkeg)'
    },
    {
      name: 'action-1',
      // Aryaman Agarwal - squash court with glass walls
      url: 'https://images.unsplash.com/photo-1740813402046-08ec3e0ce5d2?w=1920&q=80',
      credit: 'Unsplash - Aryaman Agarwal (n6lJCaj81zQ)'
    },
    {
      name: 'action-2',
      // Pexels - squash/racquetball
      url: 'https://images.pexels.com/photos/6572969/pexels-photo-6572969.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Squash court (6572969)'
    }
  ],
  'flag-football': [
    {
      name: 'hero',
      // Pexels - Energetic young man playing flag football outdoors
      url: 'https://images.pexels.com/photos/33920365/pexels-photo-33920365.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Emanuel Pedro - Flag football outdoors (33920365)'
    },
    {
      name: 'action-1',
      // Joshua Hanson - man plays football
      url: 'https://images.unsplash.com/photo-1569949236204-2cbfaa21fbd2?w=1920&q=80',
      credit: 'Unsplash - Joshua Hanson (4YbssFeFwZk)'
    },
    {
      name: 'action-2',
      // Pexels - recreational football
      url: 'https://images.pexels.com/photos/2570139/pexels-photo-2570139.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels - Football action (2570139)'
    }
  ]
};

// Hero main: use the pickleball action shot (most popular sport in the app)
const HERO_MAIN = {
  name: 'hero-main',
  url: 'https://images.pexels.com/photos/17299534/pexels-photo-17299534.jpeg?auto=compress&cs=tinysrgb&w=1920',
  credit: 'Pexels - Mason Tuttle - Pickleball paddle and ball on court (17299534)'
};

async function downloadAndOptimize(url, outputPath) {
  process.stdout.write(`  Downloading ${url.substring(0, 70)}... `);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    },
    redirect: 'follow'
  });

  if (!res.ok) {
    console.log(`FAILED (${res.status})`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  try {
    await sharp(buffer)
      .resize(1920, 1280, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const stats = statSync(outputPath);
    console.log(`OK (${(stats.size / 1024).toFixed(0)}KB)`);
    return true;
  } catch (err) {
    console.log(`Sharp error: ${err.message}`);
    // Fallback: try with different settings
    try {
      await sharp(buffer)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(outputPath);
      const stats = statSync(outputPath);
      console.log(`  Fallback OK (${(stats.size / 1024).toFixed(0)}KB)`);
      return true;
    } catch (err2) {
      console.log(`  Fallback also failed: ${err2.message}`);
      return false;
    }
  }
}

async function main() {
  console.log('=== Sports Image Downloader v2 ===\n');

  // Create directories
  for (const sport of Object.keys(PHOTOS)) {
    await mkdir(join(BASE_DIR, sport), { recursive: true });
  }

  let total = 0;
  let success = 0;

  // Download per-sport images
  for (const [sport, photos] of Object.entries(PHOTOS)) {
    console.log(`\n--- ${sport.toUpperCase()} ---`);
    for (const photo of photos) {
      total++;
      const outputPath = join(BASE_DIR, sport, `${photo.name}.webp`);
      const ok = await downloadAndOptimize(photo.url, outputPath);
      if (ok) success++;
    }
  }

  // Download hero-main
  console.log('\n--- HERO MAIN ---');
  total++;
  const heroPath = join(BASE_DIR, 'hero-main.webp');
  const ok = await downloadAndOptimize(HERO_MAIN.url, heroPath);
  if (ok) success++;

  console.log(`\n=== Done: ${success}/${total} images downloaded and optimized ===`);

  // Write credits file
  const credits = ['# Image Credits', '', 'All images sourced from Unsplash and Pexels (free for commercial use).', ''];
  for (const [sport, photos] of Object.entries(PHOTOS)) {
    credits.push(`## ${sport}`);
    for (const photo of photos) {
      credits.push(`- ${photo.name}: ${photo.credit}`);
    }
    credits.push('');
  }
  credits.push(`## Hero Main`, `- ${HERO_MAIN.credit}`, '');
  await writeFile(join(BASE_DIR, 'CREDITS.md'), credits.join('\n'));
  console.log('Credits file written.');
}

main().catch(console.error);
