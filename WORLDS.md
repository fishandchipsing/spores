# ambient world — worlds reference

Three worlds: **water**, **city**, **forest**. Each has named agents with persistent states, a system prompt, and a set of weathers and times of day.

---

## how it works

On each tick Claude receives the current world, weather, time of day, all agent states, and the last 5 events. It returns structured JSON describing one sound event:

```json
{
  "description": "one sentence — only what is heard",
  "agent": "agent label",
  "type": "distant|passing|moment|shift|interaction|residue|conflict",
  "direction": "ahead|behind|left|right|above|all around",
  "sounds": [
    { "prompt": "sound description, max 10 words", "delay": 0,    "vol": 0.70 },
    { "prompt": "second sound, max 10 words",      "delay": 1200, "vol": 0.42 },
    { "prompt": "third sound, max 10 words",       "delay": 2800, "vol": 0.25 }
  ],
  "agent_updates": { "agent_id": "new state string" }
}
```

- `sounds` — 1 required, 2–3 optional. Spread across 0–4 seconds. First is the main event, second is context or echo, third is distant residue.
- `agent_updates` — states persist between events and feed back into the next call.
- `direction` — maps to a stereo panner: ahead/behind/all-around → centre; left/right → ±0.7.

Each prompt in `sounds` → ElevenLabs `/v1/sound-generation` → decoded as Web Audio buffer → played spatially.

---

## event types

| type | meaning |
|------|---------|
| `distant` | heard far away, low presence |
| `passing` | moving through, brief |
| `moment` | a specific thing happening now |
| `shift` | the environment changes state |
| `interaction` | two agents affecting each other |
| `residue` | aftermath — something just happened |
| `conflict` | direct collision or confrontation |

---

## world — water

**Weathers:** dry still · overcast · light rain · heavy rain · wind · after rain  
**Times:** pre-dawn · dawn · morning · midday · afternoon · dusk · evening · night

### agents

| id | label | description | initial state |
|----|-------|-------------|---------------|
| heron | heron | solitary, hunts from stillness, strikes fast, territorial of its bank | motionless at water edge |
| otter | otter | splashing, chewing audibly, high whistle, moves unpredictably along the bank | somewhere on near bank |
| swan | swan | mostly silent but takeoff wingbeat is enormous, displaces every other sound | resting on far water |
| coot | coot | aggressive, repetitive single-note call, skirmishes with other coots over territory | patrolling mid-water |
| water_rail | water rail | hidden deep in reeds — bizarre pig-like squeal, rarely but memorably | concealed in reeds |
| moorhen | moorhen | nervous, constant soft clucking, panics easily and runs across the surface | close to reed edge |
| kingfisher | kingfisher | piercing call then a dive, surgical and fast, gone before you registered it | perched unseen upstream |
| frogs | frogs | colony in reeds, chorus rises and falls, instantly silenced by disturbance | calling softly |
| fish | fish | shoal moving beneath surface, occasional feeding frenzies, surface breaks | drifting midwater |
| reed_warblers | reed warblers | dense chattering chorus from inside the reeds, rises and falls with wind and disturbance | singing low |
| midges | midges | thin high collective hum over the surface, thickens in warm still air, disappears in wind | faint in the air |
| wind | wind | moves through reeds and across the surface, shifts direction, stirs everything | barely present |
| ducks | ducks | small group, social, dabbling, squabbling, landing noisily, suddenly taking flight | resting on far bank |
| rain | rain | arrives gradually or suddenly, drums on every surface, changes everything else | absent |
| fisherman | fisherman | distant, mostly silent — occasional tackle sound, a cough, a low radio, a slow movement | settled on far bank, quiet |
| drain | drain / sluice | man-made control — a trickle normally, becomes a rush after rain, gurgles and echoes | slow trickle |
| bat | bat | nocturnal, echolocation clicks over the surface, erratic darting flight, hunting midges | inactive — daytime |
| willows | willows | weeping willows at the bank — trail in water, wind moves them differently from reeds, creaking | still |
| woodpigeon | woodpigeon | distant cooing from treeline beyond the far bank, drowsy and repetitive, occasionally takes flight | cooing in far treeline |

### system prompt

```
You are a world engine for a living pond and its banks, edged by trees and marsh. Agents have territories, behaviors, and relationships.

Agents interact: heron strike silences frogs and coots. Swan takeoff displaces everything. Kingfisher dart scatters surface fish. Wind stirs willows and reeds together — they sound different. Rain activates drain. Otter surprises moorhen. Coot skirmishes when territory is crossed. Water rail never leaves reeds — heard but never seen. Midges thicken in warm still air, gone in wind. Bat only at dusk or night, hunting midges. Woodpigeon startles when something large moves. Willows creak in sudden wind gusts.

When two agents with conflicting territory are close, generate "conflict" type: coot vs moorhen, coot vs coot, otter chasing fish to surface.

RULES: 1 sentence — only what is heard. Evolve agent states. Rain absent unless weather says rain. Bat absent unless dusk or night. Vary type: distant/passing/moment/shift/interaction/residue/conflict
```

---

## world — city

**Weathers:** clear · overcast · light rain · heavy rain · wind · fog  
**Times:** early morning · morning rush · midday · afternoon · evening rush · evening · night

### agents

| id | label | description | initial state |
|----|-------|-------------|---------------|
| pedestrian | pedestrian stream | continuous foot traffic — heels, soles, shuffling, conversations in passing, shopping bags | moderate flow both directions |
| cyclist | cyclist | wheels on tarmac, bell when weaving, chain, gear shift, acceleration burst | approaching from distance |
| car | car | engine idle at lights, acceleration, door slam, horn — character changes with weather and time | passing |
| tram | tram | iron wheels on rail, electric overhead hum, bell at stop, doors opening and closing | between stops |
| pigeons | pigeons | collective wing burst from ledge, cooing, settling, scattering when alarmed | settled on ledge above |
| busker | busker | music bleeding from an underpass or arcade — instrument changes by day. Coins in case. Echo | playing, few listeners |
| cafe | café | espresso machine burst, cups clinking, outdoor chairs scraping, brief laughter | steady trade |
| vendor | vendor | newspaper shout, market stall call, pricing exchange, cart wheels on stone | calling intermittently |
| construction | construction | pneumatic drill, scaffold clanging, cement mixer, shouted instruction, reversing beep | active nearby |
| shopkeeper | shopkeeper | door buzzer as customer enters, shutter rolling, stock movement, brief exchange | quiet |
| argument | argument | sudden raised voices, footsteps retreating fast, then silence — nearby pedestrians slow | absent |
| phone_call | phone call | one-sided loud conversation while walking — pacing footsteps, pause, laugh, hang up | absent |
| delivery | delivery | trolley wheels on kerb edge, hand truck banging, van engine idling, package dropped | elsewhere |
| rain_city | rain | rain on shop awnings, drain gurgle, umbrellas snapping open, running footsteps, puddle splash | absent |
| wind_city | wind | gust channelled between buildings — loose shop sign rattling, newspaper lifted, awning flap | still |

### system prompt

```
You are a world engine for a living city street. Sound events emerge from what agents are DOING and how they affect each other.

Agents interact: construction noise drowns out busker — busker moves when drill starts. Tram arrival scatters pigeons and pauses pedestrian flow. Argument draws nearby phone_call to silence. Delivery blocks cyclist, causing bell and sharp exchange. Rain triggers umbrella cascade through pedestrian stream. Café becomes audible when construction pauses. Vendor calls louder when tram passes. Shopkeeper reacts to nearby argument.

Time of day matters: early morning — cyclist and vendor dominate, footsteps echo. Rush hour — tram, pedestrian, car all layered dense. Night — busker echoes further, single footsteps, argument carries.

When two agents directly interact, generate "conflict" type: cyclist vs pedestrian near-miss, vendor vs shopkeeper territory dispute, construction vs café complaint.

RULES: 1 sentence — only what is heard. Evolve agent states. Rain and wind only in matching weather. Tram more frequent at rush hour. Night makes single sounds more prominent. Vary type: distant/passing/moment/shift/interaction/residue/conflict
```

---

## world — forest

**Weathers:** dry still · overcast · light rain · heavy rain · after rain · frost  
**Times:** pre-dawn · dawn chorus · morning · midday · afternoon · dusk · night

### agents

| id | label | description | initial state |
|----|-------|-------------|---------------|
| woodpecker | woodpecker | drums hard against dead wood in short bursts, stops abruptly, listens, drums again — territorial against any answering tap | drumming high up |
| owl | owl | nocturnal — territorial hoot carries far through still air, silent flight, hunts only at dusk and night. Daytime: completely silent | roosting, silent |
| deer | deer | slow deliberate footsteps on leaf litter, one snapping twig, full freeze at any sudden disturbance | moving through understory |
| crow | crow | harsh cawing from upper canopy, mob behaviour when a predator is spotted — alarm spreads tree to tree | perched in high canopy |
| jay | jay | loud screeching alarm, mimics buzzard when nervous, betrays the deer's position — explosive and unreliable | watching from oak |
| squirrel | squirrel | chattering scolding call, leaping between branches shakes the whole canopy, acorn dropped hard to ground | foraging in upper branches |
| wind_canopy | wind | arrives in the high canopy first — a slow roar above before it reaches the forest floor, bends the crowns in waves | still |
| leaves | leaves | dry leaf litter announces every footstep. Rain hits the canopy in layers: high crown first, then midlayer, then the floor | dry and deep |
| stream | stream | distant water over stones, rises after rain. Muffled by trees, heard only in gaps of silence | low trickle, far off |
| fox | fox | usually silent — a soft careful footstep on dry leaves, or at night a single sharp bark that cuts through everything | elsewhere |
| insects | insects | summer hum of flies and bees in warm light patches. Disappears completely in cold, rain, or after dark | faint in a clearing |
| treecreeper | treecreeper | thin high-pitched call, spirals up bark probing for insects, almost inaudible from more than a few metres | on oak trunk nearby |
| woodmice | woodmice | tiny scurrying in dry leaves, disturbs the litter without warning, gone before it fully registers | hidden below roots |
| rain_forest | rain | hits the high canopy first — a distant roar, then arrives in layers below. Drips from leaves long after it stops. Changes everything | absent |

### system prompt

```
You are a world engine for a living broadleaf forest. Sound events emerge from what agents are DOING and how they interact across layers — canopy, understory, forest floor.

Agents interact: Jay alarm call reveals the deer. Woodpecker drumming interrupted by wind moving the tree. Crow mobbing drives fox through the understory — deer hears and freezes. Stream rises audibly after rain. Squirrel dropping acorn startles woodmice below. Owl is silent in daylight — only calls at dusk and night. Wind moves canopy before it reaches the floor — two arrivals. Rain hits canopy first then floor — two separate sound events. Insects disappear in cold or rain. Leaves are the floor — every footstep and drip lands there.

When two agents directly interact, generate "conflict" type: crow mobbing owl at its roost, jay betraying deer to fox, two squirrels chasing along a branch.

RULES: 1 sentence — only what is heard. Evolve agent states. Rain and frost only in matching weather. Owl only at dusk or night. Insects only in warm daylight. Let the forest have long silences — the quiet is part of it. Vary type: distant/passing/moment/shift/interaction/residue/conflict
```

---

## adding a new world

Add an entry to the `WORLDS` object in `ambient-world.html` and `ambient-lab.html`:

```js
myworld: {
  label: 'myworld',
  weathers: ['...', '...'],
  times:    ['...', '...'],
  ambient: {
    noiseColor: 'brown',          // 'brown' or 'pink'
    rumble:  { freq: 80, gain: 0.04 },
    shimmer: { freq: 1800, q: 0.5, gain: 0.012 },
    lfo:     { rate: 0.05, depth: 0.22 },
  },
  agents: [
    { id: 'agent_id', label: 'display name', desc: 'behavioral description', state: 'initial state' },
    // 8–14 agents
  ],
  systemPrompt: `...`
}
```

Then:
1. Add `AGENT_POS.myworld` — grid positions `{gx, gz}` (0–8) for each agent id
2. Add mobile agents to `MOBILE` with `{speed, wander}` values
3. Add a melody config to `MELODY_CFG.myworld`
4. Add a world button in the HTML `#world-selector` div
5. Add a draw function and call it in `drawViz()`
