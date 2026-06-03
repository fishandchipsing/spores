// generate-weather.js
// Run once to pre-generate all weather sounds into weather-cache/
// Requires the proxy to be running: node proxy.js
//
// Usage:
//   node generate-weather.js
//
// It hits POST /weather-sfx for each world+weather combo.
// Already-cached files are skipped (the proxy checks before calling ElevenLabs).

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PROXY_PORT = process.env.PORT || 3001;

// Must match the weather lists in murmur-radio-02.html
const WEATHER_PROMPTS = {
  water: {
    'glassy still':   'glassy calm water surface, faint lapping ripples, distant seabirds',
    'light swell':    'gentle ocean swell, soft waves rolling, subtle surf',
    'choppy':         'choppy waves splashing, wind over open water, spray',
    'incoming storm': 'storm waves building at sea, gusting wind, crashing surf',
    'steady rain':    'steady rain falling on water, soft continuous patter on the surface',
  },
  city: {
    'clear':     'city street ambience clear day, distant traffic hum, footsteps, pigeons',
    'overcast':  'overcast city, muffled traffic, grey quiet, distant horns',
    'light rain':'light rain on city pavement, umbrellas, tyres on wet road',
    'heavy rain':'heavy rain in city, puddles, thunder, overflowing gutters',
    'windy':     'wind through city buildings, whistling corners, paper rustling',
    'fog':       'foggy city morning, distant foghorns, muffled traffic, dripping eaves',
  },
  forest: {
    'dry still':  'dry summer forest, insects buzzing, cicadas, hot still air',
    'overcast':   'quiet overcast forest, muffled ambient rustling, subdued birds',
    'light rain': 'light rain falling through forest canopy, leaf drips, soft patter',
    'heavy rain': 'heavy rain in dense forest, rushing streams, thunder distant',
    'after rain': 'forest after rain, water dripping from leaves, fresh air, distant birdsong',
    'frost':      'frost in winter forest, frozen silence, occasional branch snap, crisp air',
  },
};

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

async function generate(world, weather, text) {
  const filename = `${world}-${slug(weather)}`;
  const outPath  = path.join(__dirname, 'weather-cache', filename + '.mp3');

  if (fs.existsSync(outPath)) {
    console.log(`  ✓ skip  ${filename}.mp3 (already cached)`);
    return;
  }

  console.log(`  → gen   ${filename}.mp3`);
  console.log(`          "${text}"`);

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text, filename, duration_seconds: 20 });
    const req  = http.request({
      hostname: 'localhost',
      port:     PROXY_PORT,
      path:     '/weather-sfx',
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`  ✓ saved ${filename}.mp3 (${Buffer.concat(chunks).length} bytes)`);
          resolve();
        } else {
          console.error(`  ✗ error ${filename}: HTTP ${res.statusCode}`);
          console.error(`          ${Buffer.concat(chunks).toString().slice(0, 200)}`);
          resolve(); // don't abort the whole run
        }
      });
    });
    req.on('error', err => { console.error(`  ✗ ${filename}: ${err.message}`); resolve(); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\nmurmur weather cache generator');
  console.log(`→ proxy: http://localhost:${PROXY_PORT}`);
  console.log(`→ output: weather-cache/\n`);

  // Ping proxy first
  await new Promise((resolve, reject) => {
    http.get(`http://localhost:${PROXY_PORT}/weather-cache`, res => {
      if (res.statusCode === 200) resolve();
      else reject(new Error(`proxy returned ${res.statusCode}`));
    }).on('error', () => reject(new Error('proxy not reachable — run: node proxy.js')));
  }).catch(err => { console.error(`\n✗ ${err.message}\n`); process.exit(1); });

  let total = 0, done = 0;
  for (const world of Object.keys(WEATHER_PROMPTS))
    total += Object.keys(WEATHER_PROMPTS[world]).length;
  console.log(`Generating ${total} sounds (skips already cached)...\n`);

  for (const [world, weathers] of Object.entries(WEATHER_PROMPTS)) {
    console.log(`[ ${world} ]`);
    for (const [weather, text] of Object.entries(weathers)) {
      await generate(world, weather, text);
      done++;
      // Small pause between ElevenLabs calls to avoid rate limiting
      await new Promise(r => setTimeout(r, 1200));
    }
    console.log('');
  }

  console.log(`Done — ${done}/${total} sounds processed.\n`);
  console.log('Now run:  git add weather-cache/ && git push\n');
}

main();
