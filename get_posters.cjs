const fs = require('fs');

const movies = [
  { id: "babygirl", title: "Babygirl", year: "2024" },
  { id: "beau-is-afraid", title: "Beau Is Afraid", year: "2023" },
  { id: "bring-her-back", title: "Bring Her Back", year: "2025" },
  { id: "civil-war", title: "Civil War", year: "2024" },
  { id: "eddington", title: "Eddington", year: "2025" },
  { id: "the-green-knight", title: "The Green Knight", year: "2021" },
  { id: "heretic", title: "Heretic", year: "2024" },
  { id: "highest-2-lowest", title: "Highest 2 Lowest", year: "2025" },
  { id: "the-legend-of-ochi", title: "The Legend of Ochi", year: "2025" },
  { id: "love-lies-bleeding", title: "Love Lies Bleeding", year: "2024" },
  { id: "materialists", title: "Materialists", year: "2025" },
  { id: "maxxxine", title: "MaXXXine", year: "2024" },
  { id: "moonlight", title: "Moonlight", year: "2016" },
  { id: "past-lives", title: "Past Lives", year: "2023" },
  { id: "pearl", title: "Pearl", year: "2022" },
  { id: "sharper", title: "Sharper", year: "2023" },
  { id: "uncut-gems", title: "Uncut Gems", year: "2019" },
  { id: "warfare", title: "Warfare", year: "2025" },
  { id: "x", title: "X", year: "2022" },
  { id: "the-zone-of-interest", title: "The Zone of Interest", year: "2023" }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findPoster(movie) {
  try {
    const q1 = encodeURIComponent(`site:themoviedb.org/movie/ "${movie.title}" ${movie.year}`);
    let res = await fetch(`https://html.duckduckgo.com/html/?q=${q1}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    let html = await res.text();
    let match = html.match(/themoviedb\.org\/movie\/(\d+-[a-zA-Z0-9\-]+)/);
    
    if (!match) {
      // Retry without year
      const q2 = encodeURIComponent(`site:themoviedb.org/movie/ "${movie.title}"`);
      await delay(300);
      res = await fetch(`https://html.duckduckgo.com/html/?q=${q2}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      html = await res.text();
      match = html.match(/themoviedb\.org\/movie\/(\d+-[a-zA-Z0-9\-]+)/);
    }

    if (!match) {
      console.log(`[${movie.title}] No TMDB movie page found on DDG.`);
      return null;
    }

    const tmdbUrl = `https://www.themoviedb.org/movie/${match[1]}`;
    await delay(300);
    const tmdbRes = await fetch(tmdbUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const tmdbHtml = await tmdbRes.text();
    const regex = /image\.tmdb\.org\/t\/p\/\w+\/([^"']+)/g;
    let m;
    const matches = [];
    while ((m = regex.exec(tmdbHtml)) !== null) {
      if (m[1].endsWith('.jpg') && !m[1].includes('logo') && !m[1].includes('avatar')) {
        matches.push(m[1]);
      }
    }

    if (matches.length > 0) {
      const unique = [...new Set(matches)];
      console.log(`[${movie.title}] Found: ${unique[0]}`);
      return `https://image.tmdb.org/t/p/w500/${unique[0]}`;
    } else {
      console.log(`[${movie.title}] TMDB page found (${tmdbUrl}), but no poster paths inside.`);
      return null;
    }
  } catch (error) {
    console.error(`Error searching for ${movie.title}:`, error.message);
    return null;
  }
}

async function run() {
  const results = {};
  for (const m of movies) {
    console.log(`Searching for "${m.title}" (${m.year})...`);
    const posterUrl = await findPoster(m);
    if (posterUrl) {
      results[m.id] = posterUrl;
    } else {
      results[m.id] = null;
    }
    await delay(300);
  }
  fs.writeFileSync('poster_results.json', JSON.stringify(results, null, 2));
  console.log('Done! Output saved to poster_results.json');
}

run();
