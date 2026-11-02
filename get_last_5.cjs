const fs = require('fs');

const movies = [
  { id: "sharper", title: "Sharper (2023)" },
  { id: "uncut-gems", title: "Uncut Gems" },
  { id: "warfare", title: "Warfare (2025)" },
  { id: "x", title: "X (2022)" },
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
      console.log(`[${movie.title}] No poster images found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error for ${movie.title}:`, error.message);
    return null;
  }
}

async function run() {
  const fileContent = JSON.parse(fs.readFileSync('poster_results.json'));
  for (const m of movies) {
    console.log(`Fetching from TMDB for "${m.title}" with a rate limit delay...`);
    await delay(4500); // Wait 4.5 seconds
    const poster = await fetchPoster(m);
    if (poster) {
      fileContent[m.id] = poster;
    }
  }
  fs.writeFileSync('poster_results.json', JSON.stringify(fileContent, null, 2));
  console.log('Finished updating poster_results.json.');
}

run();
