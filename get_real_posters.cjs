const fs = require('fs');

const movies = [
  { id: "babygirl", title: "Babygirl" },
  { id: "beau-is-afraid", title: "Beau Is Afraid" },
  { id: "bring-her-back", title: "Bring Her Back" },
  { id: "civil-war", title: "Civil War" },
  { id: "eddington", title: "Eddington" },
  { id: "the-green-knight", title: "The Green Knight" },
  { id: "heretic", title: "Heretic" },
  { id: "highest-2-lowest", title: "Highest 2 Lowest" },
  { id: "the-legend-of-ochi", title: "The Legend of Ochi" },
  { id: "love-lies-bleeding", title: "Love Lies Bleeding" },
  { id: "materialists", title: "Materialists" },
  { id: "maxxxine", title: "MaXXXine" },
  { id: "moonlight", title: "Moonlight" },
  { id: "past-lives", title: "Past Lives" },
  { id: "pearl", title: "Pearl" },
  { id: "sharper", title: "Sharper" },
  { id: "uncut-gems", title: "Uncut Gems" },
  { id: "warfare", title: "Warfare" },
  { id: "x", title: "X" },
  { id: "the-zone-of-interest", title: "The Zone of Interest" }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPoster(movie) {
  try {
    const url = `https://www.themoviedb.org/search/movie?query=${encodeURIComponent(movie.title)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.log(`[${movie.title}] Failed to fetch: status ${res.status}`);
      return null;
    }
    const html = await res.text();
    // Look for relative or lazy loaded image pathways like: /t/p/w94_and_h141_face/3rWk9g0Oup5WHcrpjvw5zW1WhLc.jpg
    const regex = /\/t\/p\/w[^"'\s]+\/([a-zA-Z0-9_\-]+\.jpg)/g;
    let m;
    const matches = [];
    while ((m = regex.exec(html)) !== null) {
      matches.push(m[1]);
    }

    if (matches.length > 0) {
      const unique = [...new Set(matches)];
      const hash = unique[0];
      const posterUrl = `https://image.tmdb.org/t/p/w500/${hash}`;
      console.log(`[${movie.title}] Successfully matched poster: ${posterUrl}`);
      return posterUrl;
    } else {
      console.log(`[${movie.title}] No poster images found on search result page.`);
      
      // Fallback: search for visual film stock photo if search results are thin
      return null;
    }
  } catch (error) {
    console.error(`Error for ${movie.title}:`, error.message);
    return null;
  }
}

async function run() {
  const results = {};
  for (const m of movies) {
    console.log(`Fetching from TMDB for "${m.title}"...`);
    const poster = await fetchPoster(m);
    if (poster) {
      results[m.id] = poster;
    } else {
      // General fallbacks in case of missing matches or local media like Highest 2 Lowest
      results[m.id] = null;
    }
    await delay(350); // slight throttle to respect TMDB capacity
  }
  fs.writeFileSync('poster_results.json', JSON.stringify(results, null, 2));
  console.log('Finished compiling real posters! Saved to poster_results.json.');
}

run();
