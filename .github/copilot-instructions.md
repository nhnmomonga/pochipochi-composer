# PochiPochi Composer

PochiPochi Composer is a child-friendly music composition utility for Node.js that maps Japanese tags (like "ねこ" (cat), "ねむい" (sleepy), "だいぼうけん" (big adventure)) to musical attributes, provides safe audio mixing for children, and melody quantization. It's a pure JavaScript application with zero dependencies.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

- **IMPORTANT**: This application has ZERO dependencies - no `npm install` needed
- **Node.js Requirement**: Node.js 18+ (tested with v20.19.4)
- **Test the application**:
  - `npm test` -- completes in <1 second. NEVER CANCEL.
- **Run the web application**:
  - `npm start` -- starts immediately, serves on http://localhost:3000
  - Server starts instantly with no build step required
- **No build step required** - pure JavaScript CommonJS application

## Validation

- **ALWAYS manually validate any new code** by running the complete test suite and web interface after making changes.
- **Core validation scenarios**:
  1. Run `npm test` and verify all 9 tests pass (should complete in <1 second)
  2. Start server with `npm start`
  3. Test all three API endpoints:
     - `curl -X POST -H "Content-Type: application/json" -d '{"tags":["ねこ","だいぼうけん"]}' http://localhost:3000/api/map-tags`
     - `curl -X POST -H "Content-Type: application/json" -d '{"trebleGainDb":6,"lowpassHz":20000,"loudnessLUFS":-10}' http://localhost:3000/api/enforce-mix`
     - `curl -X POST -H "Content-Type: application/json" -d '{"melody":{"ppq":480,"length":4,"notes":[{"pitch":61,"start":0,"duration":0.5}]},"key":"C","scale":"major"}' http://localhost:3000/api/quantize`
  4. Visit http://localhost:3000 in browser and test interactive functionality
- **Expected API responses**:
  - Tag mapping returns musical attributes with BPM, instruments, drumPattern, and mix settings
  - Mix safety enforces kid-safe limits (trebleGainDb ≤ 0, lowpassHz ≤ 8000, loudnessLUFS ≥ -16)
  - Quantize clamps melody notes to scale (e.g., pitch 61 becomes 60 for C major)
- **Error handling validation**: Test invalid JSON returns `{"error":"invalid json"}`

## Common Tasks

### Repository Structure
```
/home/runner/work/pochipochi-composer/pochipochi-composer/
├── .github/
│   └── copilot-instructions.md
├── src/
│   └── prompt-mapper.js          # Core utility functions
├── public/
│   ├── index.html               # Web demo interface
│   └── script.js               # Frontend JavaScript
├── test/
│   └── prompt-mapper.test.js   # Node.js native tests
├── server.js                   # HTTP server with REST API
├── package.json               # Minimal config (no dependencies)
├── README.md                  # Japanese documentation
├── SRS.md                    # Software Requirements Specification
└── LICENSE
```

### Key Functions (src/prompt-mapper.js)
- `mapTagsToAttributes(tags, tempo?, key?)` - Maps up to 3 Japanese tags to BPM, instruments, drums, mix
- `enforceKidSafeMix(mix)` - Applies child-safe audio limits
- `quantizeAndClamp(melody, key, scale)` - Quantizes melody to scale, max 64 notes

### API Endpoints (server.js)
- `POST /api/map-tags` - Tag to musical attributes mapping
- `POST /api/enforce-mix` - Kid-safe mix enforcement  
- `POST /api/quantize` - Melody quantization and scale clamping
- `GET /` - Serves demo web interface
- `GET /script.js` - Serves frontend JavaScript

### Frequently Referenced Content

#### cat package.json
```json
{
  "name": "pochipochi-composer",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "node --test",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}
```

#### Supported Tags and Mappings
- `ねこ` (cat): BPM 112, pizzicato strings/marimba, brush drums
- `ねむい` (sleepy): BPM 80, no drums, lowpass filter 4000Hz
- `だいぼうけん` (big adventure): BPM 140, brass, snare drums
- Unknown tags are ignored, max 3 tags processed
- Conflicting tags: `ねむい` + `だいぼうけん` → BPM 108 (compromise)

#### Sample Test Output
```
npm test
✔ ねこ → 軽快、BPM=~112、ピッツィカート (1.420945ms)
✔ ねむい → スロー、ドラム無し、ローパス (0.194974ms)
✔ だいぼうけん → 速め、ブラス/スネア強調 (0.195285ms)
✔ 競合解決: ねむい + だいぼうけん → 中庸BPM (0.158036ms)
✔ 未知タグは無視しつつ既知タグ適用 (0.186589ms)
✔ タグ>3は切り詰め (0.154228ms)
✔ 高域ブースト過多を制限 (0.242142ms)
✔ スケール外音を最近傍音へ吸着 (0.282127ms)
✔ ノート数>64はエラー (0.462384ms)
ℹ tests 9
ℹ pass 9
ℹ duration_ms 81.039285
```

## Development Guidelines

- **Language**: Pure JavaScript (CommonJS), no TypeScript or build tools
- **Testing**: Uses Node.js built-in `node --test` runner, no external test frameworks
- **Dependencies**: ZERO dependencies, uses only Node.js built-in modules
- **API**: Simple HTTP server using `http` module, JSON request/response
- **Frontend**: Vanilla HTML/CSS/JavaScript, no frameworks
- **Text Encoding**: UTF-8 for Japanese characters in tags and UI
- **Error Handling**: Returns JSON error objects for API failures

## Performance Expectations

- **Test Suite**: Completes in <1 second (typically ~80ms)
- **Server Startup**: Instant (no build or compilation)
- **API Response Time**: <10ms for all endpoints
- **Memory Usage**: Minimal (no dependencies, simple HTTP server)

## Troubleshooting

- **Port 3000 already in use**: Change `PORT` environment variable or kill existing process
- **Japanese characters not displaying**: Ensure UTF-8 encoding in terminal/browser
- **API returning 404**: Verify exact endpoint paths (`/api/map-tags`, `/api/enforce-mix`, `/api/quantize`)
- **Tests failing**: Check Node.js version (requires 18+), no installation step needed

## Architecture Notes

- **No CI/CD configured**: No GitHub Actions, Docker, or build pipelines
- **No database**: Stateless application, tag mappings hardcoded in `TAG_RULES`
- **No authentication**: Simple demo server, no security layer
- **No external services**: Self-contained utility functions only
- **Japanese-first**: UI and documentation primarily in Japanese, for Japanese child users