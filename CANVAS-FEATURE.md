# CANVAS FEATURE - Usage Guide

## Overview

Friday Voice App now includes a **Canvas** feature inspired by ChatGPT Canvas and Claude Artifacts. This provides a dedicated workspace for creating, editing, and collaborating on:

- **Text documents** (rich text with Quill.js)
- **Code** (syntax highlighting with Monaco Editor)
- **Drawings** (vector graphics with Fabric.js)

## Features

### ✨ Core Capabilities

1. **Split View**
   - Chat interface on left (existing voice)
   - Canvas workspace on right
   - Responsive layout (mobile/desktop)

2. **Three Canvas Types**
   - 📝 **Text Editor**: Rich text with formatting, comments, inline suggestions
   - 💻 **Code Editor**: Syntax highlighting, autocomplete, code execution (Python/JS)
   - 🎨 **Drawing Canvas**: Freehand + shapes, infinite zoom/pan

3. **Version History**
   - Git-like diff viewer
   - Visual additions/deletions
   - Back/forward navigation
   - Rollback to previous versions

4. **Voice Commands** (Danish + English)
   - "gør det kortere" / "make it shorter"
   - "tilføj flere detaljer" / "add more details"
   - "tilføj emojis" / "add emojis"
   - "fix bugs" (for code)
   - "oversæt til engelsk" / "translate to English"

5. **Shortcuts Menu**
   - Foreslå ændringer (Suggest edits)
   - Juster længde (Adjust length)
   - Final polish
   - Add emojis
   - Fix bugs (code)
   - Translate to language

6. **Export Options**
   - 📄 PDF
   - 📝 Markdown
   - 📘 Word (DOCX)
   - 💻 Code files (.js, .py, .html, etc.)
   - 🖼️ PNG (drawings)

7. **Sharing**
   - Generate public read-only URLs
   - Copy link to clipboard
   - Shareable across devices

8. **Real-time Sync**
   - WebSocket integration
   - Auto-save every 5 seconds
   - Offline-capable (IndexedDB)

9. **Mobile Optimized**
   - Touch gestures (pinch-zoom, swipe)
   - Responsive layout (<768px breakpoint)
   - Large touch targets

## Usage

### Opening Canvas

```javascript
import CanvasView from './canvas/components/CanvasView';

// In your React component:
const [showCanvas, setShowCanvas] = useState(false);

{showCanvas && (
  <CanvasView
    websocket={websocketConnection}
    onClose={() => setShowCanvas(false)}
  />
)}
```

### Voice Command Integration

Canvas automatically listens for voice commands when active:

```javascript
// User says: "gør det kortere"
// → Canvas sends to Friday AI:
//   "Canvas action: adjust-length shorter on content: [...]"

// Friday processes and returns updated content
// → Canvas updates automatically
```

### Text Editor

- **Rich formatting**: Bold, italic, lists, colors
- **Inline comments**: Select text → click comment bubble → add note
- **Auto-save**: Saves to IndexedDB every 5 seconds

### Code Editor

- **14 languages**: JavaScript, Python, TypeScript, HTML, CSS, etc.
- **Code execution**:
  - Python: Via Pyodide WASM (runs in browser)
  - JavaScript: Sandboxed execution with custom console
- **Features**: Autocomplete, IntelliSense, syntax highlighting

### Drawing Canvas

- **Tools**: Pen, rectangle, circle, line, text
- **Zoom**: 0.1x - 5x (buttons or pinch gesture)
- **Colors**: Full color picker
- **Brush size**: 1-50px
- **Export**: PNG with transparent background

### Version History

- **Open**: Click 📜 button in top-right
- **Navigate**: Back/Forward buttons
- **Diff modes**:
  - **Unified**: Git-style +/- lines
  - **Side-by-side**: Old vs New comparison
- **Rollback**: Navigate to version → content updates

### Export & Share

1. Click 🔗 button in top-right
2. Choose export format:
   - PDF (preserves formatting)
   - Markdown (plain text)
   - Word (DOCX for Office)
   - Code file (with correct extension)
3. Or copy share link for public access

## API Reference

### Canvas State Structure

```javascript
{
  type: 'text' | 'code' | 'drawing',
  content: string, // JSON for Quill, code string, or Fabric.js JSON
  language: string, // For code type
  versions: [
    {
      id: string,
      timestamp: string,
      content: string,
      type: string,
      language: string
    }
  ],
  lastModified: string
}
```

### WebSocket Events

**Client → Server:**

```javascript
// Update canvas content
{
  type: 'canvasUpdate',
  content: string,
  canvasType: 'text' | 'code' | 'drawing',
  language: string
}

// Save version
{
  type: 'canvasSave',
  version: { ... }
}

// Load canvas state
{
  type: 'canvasLoad'
}
```

**Server → Client:**

```javascript
// Canvas update confirmation
{
  type: 'canvasUpdate',
  content: string,
  canvasType: string,
  language: string
}

// Save confirmation
{
  type: 'canvasSaved',
  success: boolean,
  versionCount: number
}

// Load response
{
  type: 'canvasLoaded',
  state: { ... },
  versions: [ ... ]
}
```

### Storage Service

```javascript
import {
  saveCanvasState,
  loadCanvasState,
  clearCanvasState,
  exportCanvasState,
  importCanvasState
} from './canvas/services/canvasStorage';

// Save current state
await saveCanvasState({
  type: 'text',
  content: '...',
  versions: [...]
});

// Load saved state
const state = await loadCanvasState();

// Clear all data
await clearCanvasState();

// Export as JSON
const json = await exportCanvasState();

// Import from JSON
await importCanvasState(jsonString);
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current version |
| `Ctrl/Cmd + Z` | Undo (in editors) |
| `Ctrl/Cmd + Shift + Z` | Redo (in editors) |
| `Ctrl/Cmd + E` | Export menu |
| `Ctrl/Cmd + /` | Toggle shortcuts menu |
| `Esc` | Close Canvas |

## Mobile Gestures

- **Single finger**: Draw/select
- **Two fingers**: Pan canvas
- **Pinch**: Zoom in/out
- **Swipe left/right**: Navigate versions

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Mobile Safari (limited WASM support)

## Performance

- **Offline-first**: IndexedDB for local storage
- **Service worker**: Cache assets for offline use
- **Lazy loading**: Monaco/Fabric only loaded when needed
- **Optimized**: Auto-save debounced to 5 seconds

## Troubleshooting

### Canvas not opening
- Check browser console for errors
- Verify WebSocket connection
- Clear IndexedDB: `await clearCanvasState()`

### Code execution failing
- Python: Wait for Pyodide to load (indicator shown)
- JavaScript: Check syntax errors in output console
- Disable ad blockers (may block CDN scripts)

### Auto-save not working
- Check IndexedDB quota
- Verify localStorage not disabled
- Look for CORS errors

### Mobile gestures not responsive
- Ensure touch events enabled
- Disable browser zoom lock
- Update to latest browser version

## Examples

### Create a new text document

```javascript
// Canvas auto-opens when Friday generates text >10 lines
// Or manually:
<button onClick={() => setShowCanvas(true)}>
  Open Canvas
</button>
```

### Execute Python code

1. Switch to Code canvas
2. Select "Python" language
3. Write code:
```python
print("Hello from Friday!")
for i in range(5):
    print(f"Count: {i}")
```
4. Click "▶️ Kør kode"
5. See output below editor

### Draw a diagram

1. Switch to Drawing canvas
2. Select tool (pen/shape)
3. Choose color & brush size
4. Draw on canvas
5. Pinch to zoom for details
6. Export as PNG

### Version comparison

1. Make edits to content
2. Click 📜 to open Version History
3. Use Back/Forward to navigate
4. Toggle Unified/Side-by-side diff
5. See additions (green) and deletions (red)

## Credits

- **Text Editor**: Quill.js
- **Code Editor**: Monaco Editor (VS Code engine)
- **Drawing**: Fabric.js
- **Export**: jsPDF, docx.js
- **Diff**: diff-match-patch
- **Built by**: Friday (AI Agent) 🤖

---

**Version**: 0.3.0-canvas  
**Last Updated**: 2026-02-06
