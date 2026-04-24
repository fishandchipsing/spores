# ambient world

An infinite ambient audio world engine. Three environments (water, forest, city) with:
- **Agent population model** — Claude generates sound events from the behavior and interactions of named entities (heron, frogs, boat, pigeons, etc.)
- **Web Audio ambient layer** — continuous procedural noise shaped per environment, breathing with a slow LFO
- **ElevenLabs SFX** — each narrative event triggers a sound effect via ElevenLabs Sound Generation API, played spatially (left/right panning)
- **Local proxy** — routes ElevenLabs requests server-side to bypass browser CORS

---

## project structure

```
ambient-world/
  ambient-world.html   ← full frontend (Web Audio + narrative engine + UI)
  proxy.js             ← local Node.js proxy server (no npm needed)
  CLAUDE.md            ← this file
```

---

## how to run

```bash
node proxy.js
```

Then open `http://localhost:3001` in a browser.

The proxy:
- Serves `ambient-world.html` at `GET /`
- Forwards `POST /sfx` → ElevenLabs Sound Generation API
- No npm install needed — uses only Node stdlib (`http`, `https`, `fs`, `path`)

---

## api keys

Entered in the browser overlay on first load. Both stay in memory only, never persisted.

- **Anthropic key** — required, used to call `claude-sonnet-4-20250514` for narrative event generation
- **ElevenLabs key** — optional, used for SFX. If left blank the world runs with Web Audio ambient only

---

## architecture

### narrative engine (Claude API)

Each world has 8 named agents with:
- `id` — internal identifier
- `label` — display name
- `desc` — permanent character description
- `state` — current behavioral state (updated by Claude after each event)

On each event tick, Claude receives:
- Current world, weather, time of day
- Full agent population with current states
- Last 5 events (to avoid repetition and enable evolution)

Claude returns structured JSON:
```json
{
  "description": "one sentence — only what is heard",
  "agent": "which agent label caused this",
  "type": "distant|passing|moment|shift|interaction|residue",
  "direction": "ahead|behind|left|right|above|all around",
  "sound_prompt": "ElevenLabs SFX description, max 10 words",
  "agent_updates": { "agent_id": "new state string" }
}
```

Agent states persist across events — the heron that just struck is now "moving along bank, alert" and Claude uses that in the next call.

### rhythm system

Events fire on a Poisson-like schedule (randomised delay, not fixed timer), shaped by 6 mood phases cycling: still → still → building → active → settling → still. Each phase has min/max wait and cluster probability. A 7% chance of a long silence (1.5–2.8× multiplier) creates the feeling of time passing.

### Web Audio layer

Per-environment noise profile:
- **water** — brown noise, low shelf rumble at 60Hz, slow LFO at 0.08Hz
- **forest** — brown noise, higher shimmer at 2200Hz, slower LFO at 0.05Hz  
- **city** — pink noise, dense mid at 400Hz, faster LFO at 0.12Hz

Fades in on start, tears down cleanly on stop or world switch.

### SFX layer

Each event's `sound_prompt` → `POST /sfx` (local proxy) → ElevenLabs `/v1/sound-generation` → decoded as Web Audio buffer → played through a stereo panner node mapped from `direction`. Fires async so it never blocks the narrative rhythm.

---

## extending this

### add a new world

Add an entry to the `WORLDS` object in `ambient-world.html`:
```js
myworld: {
  label: 'myworld',
  weathers: [...],
  times: [...],
  ambient: {
    noiseColor: 'brown',       // 'brown' or 'pink'
    rumble: { freq: 80, gain: 0.06 },
    shimmer: { freq: 1200, q: 0.4, gain: 0.015 },
    lfo: { rate: 0.07, depth: 0.2 },
  },
  agents: [
    { id: 'agent_id', label: 'display name', desc: 'behavioral description', state: 'initial state' },
    // ... 6-8 agents
  ],
  systemPrompt: `...`
}
```

Then add a button in the HTML `#world-selector` div.

### tune the rhythm

Edit the `PHASES` array in the script section — each phase has `minW` / `maxW` (seconds between events), `clusterP` (probability of a burst), and `clusterN` (how many events in a burst).

### replace Web Audio with Amphion

The `startAmbient(world)` function in the script is the seam. Replace the noise graph with an Amphion-generated audio clip:
1. Pre-generate looping clips per world + weather state using Amphion
2. Load them as `AudioBuffer` via `fetch` → `ctx.decodeAudioData`
3. Play through a `BufferSourceNode` with `loop: true`
4. Crossfade between clips as weather changes

### add weather drift

The world state has `S.weather` and `S.timeOfDay` — both currently set on init and fixed. To make them drift:
1. Add a slow timer (every ~5 minutes) that advances `S.timeOfDay` through the times array
2. Pass weather intensity (0–1) to the LFO depth to make the ambient layer rougher in storms
3. Include the drift in the Claude prompt so events react to changing conditions

---

## known issues / next steps

- ElevenLabs SFX arrives 2–4s after the text event (API latency) — this feels natural but could be pre-fetched
- No Amphion integration yet — Web Audio is a placeholder for the background layer
- Weather is randomised on world init, not reactive to time
- No mobile layout
