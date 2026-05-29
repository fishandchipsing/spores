// warm-cache.js
// Generates the canonical sound library for all three worlds.
// Run once: node warm-cache.js
// Requires the proxy running: ANTHROPIC_KEY=... EL_KEY=... node proxy.js

const http  = require('http');
const https = require('https');

const PROXY = 'http://localhost:3001';
const CONCURRENCY = 2; // parallel requests (be gentle with ElevenLabs)

const LIBRARY = {

  // ── WATER ──────────────────────────────────────────────────────────────
  water: [
    { id:'heron-strike-at-fish',         prompt:'sudden heron lunge strike at fish surface splash' },
    { id:'heron-slow-wingflap',          prompt:'large heron slow powerful wingbeat flying low over water' },
    { id:'heron-alarm-bark',             prompt:'heron harsh deep alarm bark call taking flight' },
    { id:'heron-standing-still',         prompt:'complete stillness at water edge faint ripple' },
    { id:'otter-swimming-churning',      prompt:'otter splashing churning swimming along bank' },
    { id:'otter-chewing-fish',           prompt:'otter chewing crunching fish loudly on bank' },
    { id:'otter-high-whistle',           prompt:'otter sharp high pitched whistle contact call' },
    { id:'otter-diving',                 prompt:'otter plunging diving under water surface' },
    { id:'swan-takeoff-wingbeat',        prompt:'enormous swan massive wingbeat takeoff from water' },
    { id:'swan-landing-water',           prompt:'swan gliding landing on water surface' },
    { id:'swan-wing-display',            prompt:'swan aggressive wing spreading hissing territorial display' },
    { id:'coot-single-call',             prompt:'coot repetitive sharp single note aggressive call' },
    { id:'coot-skirmish-splashing',      prompt:'two coots splashing fighting wing beating on water' },
    { id:'coot-running-water',           prompt:'coot rapid feet pattering running across water surface' },
    { id:'water-rail-squeal',            prompt:'water rail bizarre pig-like squeal from dense reeds' },
    { id:'moorhen-soft-clucking',        prompt:'moorhen nervous soft continuous clucking call' },
    { id:'moorhen-running-surface',      prompt:'moorhen panicked running pattering across water surface' },
    { id:'kingfisher-call-dive',         prompt:'kingfisher piercing whistle call then plunge into water' },
    { id:'frog-chorus-rising',           prompt:'frog colony chorus rising and swelling from reeds' },
    { id:'frog-chorus-sudden-silence',   prompt:'frog chorus abruptly stopping complete sudden silence' },
    { id:'frog-single-plop',             prompt:'single frog jumping plopping into still water' },
    { id:'fish-surface-feeding-frenzy',  prompt:'fish surface feeding frenzy splashing bubbles churning' },
    { id:'fish-single-jump',             prompt:'single fish jumping splashing back into water' },
    { id:'fish-shoal-underwater',        prompt:'fish shoal subtle surface disturbance underwater movement' },
    { id:'reed-warbler-chorus',          prompt:'dense reed warbler chattering chorus inside reed bed' },
    { id:'reed-warbler-single-phrase',   prompt:'single reed warbler melodic repetitive rising phrase' },
    { id:'midges-hum-still-air',         prompt:'thin high collective midge hum over still warm water' },
    { id:'wind-through-reeds',           prompt:'wind moving through tall reed bed dry rattle' },
    { id:'wind-across-open-water',       prompt:'wind skimming across open water surface ripple' },
    { id:'duck-landing-splash',          prompt:'ducks landing noisily splashing on water' },
    { id:'duck-sudden-takeoff',          prompt:'ducks sudden noisy explosive takeoff from water' },
    { id:'duck-social-quacking',         prompt:'small group ducks social quacking dabbling' },
    { id:'rain-arriving-gradually',      prompt:'rain beginning gently increasing drumming on water surface' },
    { id:'rain-heavy-on-water',          prompt:'heavy rain drumming hard on water reeds leaves' },
    { id:'rain-dripping-after',          prompt:'rain dripping from reed stems leaves after downpour stops' },
    { id:'drain-slow-trickle',           prompt:'sluice drain slow water trickle echo concrete' },
    { id:'drain-rushing-after-rain',     prompt:'drain sluice rushing gurgling after heavy rain' },
    { id:'bat-echolocation-clicks',      prompt:'bat echolocation high clicks darting over water at night' },
    { id:'willow-creaking-wind',         prompt:'weeping willow branches creaking in sudden wind gust' },
    { id:'willow-trailing-water',        prompt:'willow branches trailing touching lapping water surface' },
    { id:'woodpigeon-distant-coo',       prompt:'woodpigeon drowsy cooing from distant treeline' },
    { id:'woodpigeon-startled-flight',   prompt:'woodpigeon sudden explosive wing clatter fleeing tree' },
    { id:'fisherman-tackle-rattle',      prompt:'fishing tackle rattle rod click on far bank' },
    { id:'fisherman-soft-cough',         prompt:'distant fisherman quiet cough clearing throat' },
    { id:'water-ripple-spreading',       prompt:'water ripple spreading outward lapping muddy bank' },
    { id:'reed-bed-rustle',              prompt:'dense reed bed dry stalks rustling in breeze' },
    { id:'water-surface-lap',            prompt:'water lapping against bank edge stones' },
    { id:'pre-dawn-stillness',           prompt:'complete pre-dawn stillness faint water breath' },
    { id:'underwater-bubble-pop',        prompt:'underwater bubble surfacing popping on still water' },
    { id:'heron-wading-slow',            prompt:'heron slow deliberate wading footstep in shallow water' },
  ],

  // ── CITY ───────────────────────────────────────────────────────────────
  city: [
    { id:'tram-iron-wheels-rail',        prompt:'tram iron wheels grinding on metal rail tracks' },
    { id:'tram-bell-approaching',        prompt:'tram bell ringing approaching stop slowing' },
    { id:'tram-doors-opening',           prompt:'tram pneumatic doors sliding open then closing' },
    { id:'tram-passing-distance',        prompt:'tram passing at distance iron wheel hum fading' },
    { id:'pedestrian-footsteps-stone',   prompt:'pedestrian footsteps heels on stone pavement' },
    { id:'pedestrian-crowd-passing',     prompt:'pedestrian crowd murmur conversation passing flow' },
    { id:'cyclist-wheel-tarmac',         prompt:'cyclist wheel spinning on wet tarmac surface' },
    { id:'cyclist-bell-warning',         prompt:'cyclist sharp bell ring warning pedestrian' },
    { id:'cyclist-gear-shift',           prompt:'bicycle gear shift click chain mechanism' },
    { id:'car-engine-idle-lights',       prompt:'car engine idling at traffic lights waiting' },
    { id:'car-accelerating',             prompt:'car accelerating pulling away from junction' },
    { id:'car-door-slam',                prompt:'car door slamming shut' },
    { id:'car-horn-brief',               prompt:'car horn brief sharp beep in traffic' },
    { id:'espresso-machine-burst',       prompt:'cafe espresso machine steam burst hissing' },
    { id:'cafe-cups-clinking',           prompt:'cafe cups saucers clinking glass counter' },
    { id:'cafe-chairs-scraping',         prompt:'outdoor cafe metal chair scraping stone pavement' },
    { id:'cafe-ambient-murmur',          prompt:'cafe indoor ambient murmur laughter background' },
    { id:'busker-guitar-melody',         prompt:'busker acoustic guitar melodic phrase underpass echo' },
    { id:'busker-coins-case',            prompt:'coins dropping into busker open case echoing' },
    { id:'vendor-newspaper-call',        prompt:'newspaper vendor calling out headlines street corner' },
    { id:'vendor-cart-wheels',           prompt:'market vendor cart wheels rolling cobblestone pavement' },
    { id:'construction-pneumatic-drill', prompt:'pneumatic drill jackhammer breaking up tarmac' },
    { id:'construction-scaffold-clang',  prompt:'scaffold metal pole clanging dropping loud bang' },
    { id:'construction-cement-mixer',    prompt:'cement mixer rotating churning mechanical drum' },
    { id:'construction-shout',           prompt:'construction worker shouting instruction over noise' },
    { id:'construction-reversing-beep',  prompt:'construction vehicle reversing warning beep' },
    { id:'shopkeeper-door-buzzer',       prompt:'shop entry door buzzer electronic beep customer' },
    { id:'shopkeeper-metal-shutter',     prompt:'metal shop shutter rolling up grinding opening' },
    { id:'argument-raised-voices',       prompt:'sudden raised voices argument in street retreating' },
    { id:'phone-call-walking',           prompt:'loud one-sided mobile phone call while walking pavement' },
    { id:'delivery-trolley-kerb',        prompt:'delivery trolley wheels bumping over kerb edge' },
    { id:'delivery-package-drop',        prompt:'heavy package dropped on doorstep loud thud' },
    { id:'rain-on-awnings',              prompt:'rain drumming on shop canvas awnings overhead' },
    { id:'rain-drain-gurgle',            prompt:'rain drain gurgling overflowing gutter' },
    { id:'rain-umbrella-snap',           prompt:'umbrella snapping open in sudden downpour' },
    { id:'rain-puddle-splash',           prompt:'footsteps splashing through puddles on pavement' },
    { id:'wind-building-channel',        prompt:'wind channelling between buildings sudden gust' },
    { id:'wind-shop-sign-rattle',        prompt:'loose metal shop sign rattling in wind' },
    { id:'pigeons-wing-burst',           prompt:'pigeons sudden explosive wing burst from ledge scattering' },
    { id:'pigeons-cooing-ledge',         prompt:'pigeons cooing settling ruffling on ledge' },
    { id:'morning-empty-street',         prompt:'early morning empty street distant traffic hum echo' },
    { id:'night-single-footsteps',       prompt:'late night single footsteps echoing on pavement' },
    { id:'bus-stop-announcement',        prompt:'automated bus stop announcement arrival time' },
    { id:'skateboard-pavement',          prompt:'skateboard wheels rolling over pavement cracks' },
    { id:'restaurant-kitchen-clatter',   prompt:'restaurant kitchen clatter plates shouted order service' },
    { id:'church-bells-distant',         prompt:'distant church bells ringing the hour' },
    { id:'market-crowd-busy',            prompt:'busy street market crowd noise voices general' },
    { id:'children-playground-distant',  prompt:'children distant playground shouts laughter' },
    { id:'night-club-bass',              prompt:'nightclub bass music thumping through closed wall' },
    { id:'evening-rush-crowd',           prompt:'evening rush hour dense crowd footsteps station' },
  ],

  // ── FOREST ─────────────────────────────────────────────────────────────
  forest: [
    { id:'woodpecker-drumming',          prompt:'woodpecker rapid drum burst on dead hollow wood' },
    { id:'woodpecker-listening-pause',   prompt:'woodpecker stops drumming silence listening' },
    { id:'woodpecker-distant-answer',    prompt:'distant woodpecker answering drum through trees' },
    { id:'woodpecker-flight',            prompt:'woodpecker undulating bounding flight between trees' },
    { id:'owl-deep-hoot',               prompt:'tawny owl deep territorial hoot carrying through still night' },
    { id:'owl-answering-hoot',          prompt:'second owl answering hoot from distant trees' },
    { id:'deer-footsteps-leaves',        prompt:'deer slow careful deliberate footsteps on dry leaf litter' },
    { id:'deer-twig-snap',               prompt:'single sharp twig snap then complete sudden freeze' },
    { id:'deer-alarm-bark',              prompt:'deer sharp explosive alarm bark then crashing flight' },
    { id:'deer-walking-away',            prompt:'deer retreating footsteps through rustling dry leaves' },
    { id:'crow-harsh-caw',               prompt:'crow harsh single cawing from high canopy' },
    { id:'crow-mob-alarm',               prompt:'crow mob alarm call spreading urgently tree to tree' },
    { id:'jay-screeching-alarm',         prompt:'jay loud explosive screeching alarm call' },
    { id:'jay-buzzard-mimic',            prompt:'jay mimicking buzzard mewing call overhead' },
    { id:'squirrel-chattering-scold',    prompt:'squirrel rapid chattering scolding alarm call' },
    { id:'squirrel-branch-leap',         prompt:'squirrel leaping between branches whole canopy shaking' },
    { id:'squirrel-acorn-drop',          prompt:'hard acorn dropping bouncing off branches hitting forest floor' },
    { id:'wind-arriving-canopy',         prompt:'wind arriving in high canopy slow building roar overhead' },
    { id:'wind-reaching-floor',          prompt:'wind descending canopy reaching forest floor rustle' },
    { id:'wind-bending-crowns',          prompt:'strong wind bending tree crowns waves through canopy' },
    { id:'leaves-footstep-crunch',       prompt:'footstep crunching deep dry autumn leaf litter' },
    { id:'leaves-rain-hitting-canopy',   prompt:'rain hitting high forest canopy distant roar' },
    { id:'leaves-rain-arriving-floor',   prompt:'rain arriving at forest floor delayed after canopy' },
    { id:'leaves-dripping-after-rain',   prompt:'water dripping from leaves and branches long after rain stops' },
    { id:'stream-gentle-distant',        prompt:'stream gentle distant trickle over smooth stones' },
    { id:'stream-rising-after-rain',     prompt:'stream rising rushing louder after heavy rain' },
    { id:'stream-over-stones',           prompt:'water flowing over stones gentle constant gurgle' },
    { id:'fox-careful-footstep',         prompt:'fox single careful soft footstep on dry leaves' },
    { id:'fox-sharp-night-bark',         prompt:'fox single sharp territorial bark cutting through night' },
    { id:'fox-cubs-playing',             prompt:'fox cubs tumbling playing in leaves distant' },
    { id:'insects-warm-hum',             prompt:'warm summer insects flies bees hum in forest clearing' },
    { id:'insects-fading-cold',          prompt:'insect hum fading disappearing as air cools' },
    { id:'treecreeper-thin-call',        prompt:'treecreeper thin high-pitched call spiralling up bark' },
    { id:'woodmice-leaf-scurry',         prompt:'tiny woodmice quick scurrying through dry leaf litter' },
    { id:'woodmice-sudden-gone',         prompt:'small animal rustle then complete sudden disappearance' },
    { id:'dawn-chorus-building',         prompt:'forest dawn chorus multiple birds building together' },
    { id:'single-warbler-phrase',        prompt:'single warbler melodic repetitive phrase in undergrowth' },
    { id:'great-tit-call',               prompt:'great tit sharp repetitive teacher teacher call' },
    { id:'robin-territorial-song',       prompt:'robin melodic territorial song autumn morning' },
    { id:'wren-loud-song',               prompt:'wren surprisingly loud territorial song from undergrowth' },
    { id:'pheasant-takeoff',             prompt:'pheasant sudden explosive noisy takeoff from ground' },
    { id:'branch-creak-slow',            prompt:'large branch creaking slowly under wind pressure' },
    { id:'hollow-wood-knock',            prompt:'hollow dead wood resonant deep knock' },
    { id:'acorn-bouncing-floor',         prompt:'acorn bouncing and rolling on hard dry forest floor' },
    { id:'badger-rooting-night',         prompt:'badger rooting digging in leaf litter at night' },
    { id:'chiffchaff-call',              prompt:'chiffchaff repetitive two-note call from canopy' },
    { id:'forest-deep-silence',          prompt:'forest complete deep stillness nothing moving' },
    { id:'rain-forest-beginning',        prompt:'rain beginning gently on outer forest leaves' },
    { id:'rain-forest-heavy',            prompt:'heavy rain dense drumming on whole forest canopy' },
    { id:'distant-aircraft',             prompt:'distant aircraft passing high over forest barely audible' },
    { id:'bark-stripping-rattle',        prompt:'dead bark stripping falling from tree trunk pieces' },
  ],
};

// ── Generate sounds ───────────────────────────────────────────────────────

async function generate(world, sound) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      text:             sound.prompt,
      duration_seconds: 4,
      prompt_influence: 0.5,
      world:            `${world}_${sound.id}`,  // used for filename slug
    });

    const options = {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = http.request(`${PROXY}/sfx`, options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`  ✓ ${world}/${sound.id}`);
          resolve(true);
        } else {
          const msg = Buffer.concat(chunks).toString().slice(0,120);
          console.error(`  ✗ ${world}/${sound.id} → ${res.statusCode}: ${msg}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`  ✗ ${world}/${sound.id} → ${e.message}`);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

async function pool(tasks, concurrency) {
  let i = 0;
  const workers = Array(concurrency).fill(null).map(async () => {
    while (i < tasks.length) {
      const task = tasks[i++];
      await task();
      await new Promise(r => setTimeout(r, 400)); // small pause between requests
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log('\n🌿 warm-cache — sound library generator');
  console.log(`   proxy: ${PROXY}`);
  console.log(`   sounds: ${Object.values(LIBRARY).reduce((n, arr) => n + arr.length, 0)} total\n`);

  // Check proxy is up
  const up = await new Promise(r => {
    http.get(PROXY, res => r(res.statusCode === 200)).on('error', () => r(false));
  });
  if (!up) { console.error('✗ proxy not reachable — run: EL_KEY=... node proxy.js'); process.exit(1); }

  const worlds = process.argv[2] ? [process.argv[2]] : Object.keys(LIBRARY);

  for (const world of worlds) {
    const sounds = LIBRARY[world];
    if (!sounds) { console.warn(`unknown world: ${world}`); continue; }
    console.log(`\n── ${world} (${sounds.length} sounds) ──`);
    const tasks = sounds.map(s => () => generate(world, s));
    await pool(tasks, CONCURRENCY);
  }

  console.log('\n✓ done — commit sfx-cache/ to persist the library\n');
}

main().catch(console.error);
