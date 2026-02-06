# CANVAS ARCHITECTURE

## System Overview

The Canvas feature is a **split-view collaborative workspace** integrated into Friday Voice App, inspired by ChatGPT Canvas and Claude Artifacts. It provides a dedicated editing environment for text, code, and drawings with real-time sync and version control.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │  Voice Interface │  │   Canvas View    │                  │
│  │   (Existing)     │  │    (New)         │                  │
│  └─────────────────┘  └──────────────────┘                  │
│          │                     │                             │
│          └─────────┬───────────┘                             │
│                    │                                         │
│            ┌───────▼──────────┐                              │
│            │  WebSocket Client │                              │
│            └───────┬──────────┘                              │
│                    │                                         │
│     ┌──────────────┼──────────────┐                          │
│     │              │              │                          │
│  ┌──▼───┐   ┌─────▼────┐   ┌────▼────┐                      │
│  │ Text │   │   Code   │   │ Drawing │                      │
│  │Editor│   │  Editor  │   │ Canvas  │                      │
│  │Quill │   │  Monaco  │   │ Fabric  │                      │
│  └──┬───┘   └─────┬────┘   └────┬────┘                      │
│     │             │             │                            │
│     └──────┬──────┴──────┬──────┘                            │
│            │             │                                   │
│      ┌─────▼─────┐  ┌────▼─────┐                            │
│      │ IndexedDB │  │LocalStorage│                            │
│      │ (Primary) │  │ (Fallback) │                            │
│      └───────────┘  └──────────┘                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                    WebSocket (wss://)
                            │
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│          ┌───────────────────────────┐                       │
│          │   Friday Voice Server     │                       │
│          │   (server.js)             │                       │
│          └───────────┬───────────────┘                       │
│                      │                                       │
│      ┌───────────────┼───────────────┐                       │
│      │               │               │                       │
│  ┌───▼────┐  ┌───────▼──────┐  ┌────▼────┐                  │
│  │ Voice  │  │   Canvas     │  │  Friday │                  │
│  │Handler │  │   Handler    │  │   AI    │                  │
│  │        │  │ (WebSocket)  │  │(OpenClaw)│                  │
│  └────────┘  └──────────────┘  └─────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. CanvasView (Main Container)

**Purpose**: Orchestrates the entire Canvas feature

**State Management**:
```javascript
{
  canvasType: 'text' | 'code' | 'drawing',
  content: string,
  language: string, // For code
  versions: Version[],
  currentVersionIndex: number,
  isAutoSaveEnabled: boolean,
  splitRatio: number,
  isMobile: boolean
}
```

**Responsibilities**:
- Render appropriate editor based on `canvasType`
- Handle WebSocket communication
- Manage version history
- Auto-save every 5 seconds
- Voice command processing
- Mobile/desktop layout switching

**Data Flow**:
```
User Edit → Editor Component → CanvasView.handleContentChange()
         → WebSocket.send(canvasUpdate)
         → Auto-save timer (5s)
         → saveCanvasState() → IndexedDB
```

### 2. TextEditor (Quill.js)

**Purpose**: Rich text editing with inline comments

**Features**:
- Toolbar: Headers, bold, italic, lists, colors, links
- Inline comment bubbles (select text → add comment)
- Dark theme styling
- Mobile-optimized (18px font, large tap targets)

**Data Format**:
```javascript
// Quill Delta (JSON)
{
  "ops": [
    { "insert": "Hello " },
    { "insert": "world", "attributes": { "bold": true } },
    { "insert": "\n" }
  ]
}
```

**Integration**:
```javascript
// Initialize
const quill = new Quill(container, {
  theme: 'snow',
  modules: { toolbar: [...] }
});

// Handle changes
quill.on('text-change', () => {
  const delta = quill.getContents();
  onChange(JSON.stringify(delta));
});
```

### 3. CodeEditor (Monaco)

**Purpose**: Professional code editing with execution

**Features**:
- Syntax highlighting (14 languages)
- Autocomplete & IntelliSense
- Code execution:
  - **Python**: Pyodide WASM (browser-based)
  - **JavaScript**: Sandboxed with custom console
- Execution output console
- VS Code keybindings

**Languages Supported**:
- JavaScript, TypeScript, Python
- HTML, CSS, JSON, Markdown
- SQL, Java, C++, C#, PHP, Go, Rust

**Code Execution Pipeline**:
```
User clicks "Run" → handleExecute()
  ├─ Python: Pyodide.runPythonAsync(code)
  │         → Capture stdout
  │         → Display output
  └─ JavaScript: new Function('console', code)
              → Custom console logs
              → Display output
```

**Pyodide Integration**:
```javascript
// Load Pyodide
const pyodide = await loadPyodide({
  indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
});

// Execute code
await pyodide.runPythonAsync(`
  import sys
  from io import StringIO
  sys.stdout = StringIO()
`);
await pyodide.runPythonAsync(userCode);
const output = await pyodide.runPythonAsync('sys.stdout.getvalue()');
```

### 4. DrawingCanvas (Fabric.js)

**Purpose**: Vector drawing with infinite canvas

**Features**:
- Tools: Pen, shapes (rect, circle, line), text
- Pan & zoom (0.1x - 5x)
- Touch gestures (2-finger zoom, 1-finger draw)
- Color picker & brush size slider
- Export PNG/SVG

**Data Format**:
```javascript
// Fabric.js JSON
{
  "version": "5.3.0",
  "objects": [
    {
      "type": "rect",
      "left": 100,
      "top": 100,
      "width": 200,
      "height": 100,
      "fill": "transparent",
      "stroke": "#ffffff",
      "strokeWidth": 3
    }
  ],
  "background": "#1a1a1a"
}
```

**Touch Gesture Handling**:
```javascript
canvas.on('touch:gesture', (e) => {
  if (e.e.touches.length === 2) {
    const distance = Math.sqrt(...); // Calculate pinch distance
    if (distance > lastDistance) zoom += 0.1; // Zoom in
    else zoom -= 0.1; // Zoom out
  }
});
```

### 5. ShortcutsMenu

**Purpose**: Quick actions inspired by ChatGPT Canvas

**Danish UI Actions**:
- Foreslå ændringer → AI suggestions
- Gør kortere/længere → Adjust length
- Final polish → Add finishing touches
- Tilføj emojis → Inject emojis
- Fix bugs → Code debugging (code only)
- Oversæt til [sprog] → Translate

**Integration Flow**:
```
User clicks shortcut → onAction('adjust-length', 'shorter')
  → CanvasView.handleShortcutAction()
  → WebSocket.send({
      type: 'voice_message',
      transcript: 'Canvas action: adjust-length shorter on content: [...]'
    })
  → Friday AI processes
  → WebSocket.send({ type: 'canvasUpdate', content: newContent })
  → CanvasView updates content
```

### 6. VersionHistory

**Purpose**: Git-like diff viewer with time travel

**Features**:
- List all saved versions with timestamps
- Visual diff (additions/deletions)
- Two modes:
  - **Unified**: +/- lines like `git diff`
  - **Side-by-side**: Old vs New comparison
- Back/Forward navigation
- Rollback to any version

**Diff Algorithm**:
```javascript
import { DiffMatchPatch } from 'diff-match-patch';

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main(oldText, newText);
dmp.diff_cleanupSemantic(diffs);

// diffs = [
//   [0, "unchanged text"], // 0 = no change
//   [-1, "deleted text"],  // -1 = deletion
//   [1, "added text"]      // 1 = addition
// ]
```

**Rendering**:
```
┌─────────────────────────────────────┐
│  Unified View                       │
├─────────────────────────────────────┤
│   unchanged line                    │
│ - deleted line (red background)     │
│ + added line (green background)     │
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│  Old Version     │  New Version     │
├──────────────────┼──────────────────┤
│  unchanged       │  unchanged       │
│  deleted (red)   │  added (green)   │
└──────────────────┴──────────────────┘
```

### 7. ShareDialog

**Purpose**: Export and share canvas content

**Export Formats**:
1. **PDF** (jsPDF)
   - Converts text to PDF with formatting
   - Canvas screenshots for drawings
   
2. **Markdown**
   - Plain text export
   - Preserves structure
   
3. **Word** (docx.js)
   - DOCX format for Office
   - Paragraph-based conversion
   
4. **Code Files**
   - Correct extension (.js, .py, .html, etc.)
   - Plain text with syntax

**Share Link Generation**:
```javascript
const shareId = nanoid(10); // Unique ID
const shareUrl = `${baseUrl}/canvas/share/${shareId}`;

// Save to backend (would need API endpoint):
await fetch('/api/canvas/share', {
  method: 'POST',
  body: JSON.stringify({
    id: shareId,
    content: content,
    type: canvasType,
    language: language,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  })
});
```

### 8. canvasStorage Service

**Purpose**: Offline-first persistent storage

**Storage Strategy**:
```
┌────────────────────────────────────┐
│  Storage Priority                  │
├────────────────────────────────────┤
│  1. IndexedDB (100MB+, structured) │
│  2. localStorage (5-10MB, backup)  │
│  3. Memory (session only)          │
└────────────────────────────────────┘
```

**IndexedDB Schema**:
```javascript
{
  dbName: 'FridayCanvasDB',
  version: 1,
  stores: {
    canvasStates: {
      keyPath: 'id',
      data: {
        id: 'current',
        type: 'text' | 'code' | 'drawing',
        content: string,
        language: string,
        versions: Version[],
        lastModified: ISO8601 timestamp
      }
    }
  }
}
```

**API**:
```javascript
// Save
await saveCanvasState({ type, content, versions });
  → Try IndexedDB
  → Fallback to localStorage
  → Throw if both fail

// Load
const state = await loadCanvasState();
  → Try IndexedDB
  → Fallback to localStorage
  → Return null if not found

// Clear
await clearCanvasState();
  → Clear IndexedDB
  → Clear localStorage
```

## WebSocket Protocol

### Message Types

**Client → Server:**

```javascript
// 1. Canvas content update (real-time sync)
{
  type: 'canvasUpdate',
  content: string,
  canvasType: 'text' | 'code' | 'drawing',
  language: string
}

// 2. Save version snapshot
{
  type: 'canvasSave',
  version: {
    id: string,
    timestamp: ISO8601,
    content: string,
    type: string,
    language: string
  }
}

// 3. Request canvas state
{
  type: 'canvasLoad'
}

// 4. Voice command for canvas action
{
  type: 'voice_message',
  transcript: 'Canvas action: [action] [param] on content: [...]'
}
```

**Server → Client:**

```javascript
// 1. Broadcast canvas update to other clients
{
  type: 'canvasUpdate',
  content: string,
  canvasType: string,
  language: string
}

// 2. Confirm version saved
{
  type: 'canvasSaved',
  success: boolean,
  versionCount: number
}

// 3. Return loaded state
{
  type: 'canvasLoaded',
  state: {
    content: string,
    canvasType: string,
    language: string,
    lastModified: ISO8601
  },
  versions: Version[]
}

// 4. Friday AI response (updated content)
{
  type: 'friday_response',
  text: string,
  audioUrl: string,
  canvasUpdate: {
    content: string
  }
}
```

### Server-Side Implementation

**server.js enhancements:**

```javascript
class FridayVoiceServer {
  async handleClientMessage(ws, message) {
    switch (message.type) {
      case 'canvasUpdate':
        // Store in session
        ws.canvasState = {
          content: message.content,
          canvasType: message.canvasType,
          language: message.language,
          lastModified: new Date().toISOString()
        };
        
        // Broadcast to other clients (collaboration)
        this.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            this.send(client, {
              type: 'canvasUpdate',
              ...ws.canvasState
            });
          }
        });
        break;
        
      case 'canvasSave':
        if (!ws.canvasVersions) ws.canvasVersions = [];
        ws.canvasVersions.push(message.version);
        
        this.send(ws, {
          type: 'canvasSaved',
          success: true,
          versionCount: ws.canvasVersions.length
        });
        break;
        
      case 'canvasLoad':
        this.send(ws, {
          type: 'canvasLoaded',
          state: ws.canvasState || null,
          versions: ws.canvasVersions || []
        });
        break;
    }
  }
}
```

## Data Flow Diagrams

### Auto-Save Flow

```
┌────────────┐
│ User edits │
└─────┬──────┘
      │
      ▼
┌────────────────────┐
│ onChange triggered │
└─────┬──────────────┘
      │
      ▼
┌────────────────────────┐
│ Update local state     │
│ (content = newContent) │
└─────┬──────────────────┘
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
┌──────────────┐   ┌─────────────────┐
│ WebSocket    │   │ Auto-save timer │
│ broadcast    │   │ (5 seconds)     │
└──────────────┘   └─────┬───────────┘
                         │
                         ▼
                   ┌────────────────┐
                   │ saveCanvasState│
                   └─────┬──────────┘
                         │
                         ├────────────────┐
                         │                │
                         ▼                ▼
                   ┌──────────┐    ┌─────────────┐
                   │IndexedDB │    │localStorage │
                   │ (primary)│    │ (backup)    │
                   └──────────┘    └─────────────┘
```

### Voice Command Flow

```
┌──────────────┐
│ User speaks  │
│ "gør kortere"│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Voice recognition│
│ (existing system)│
└──────┬───────────┘
       │
       ▼
┌───────────────────────┐
│ CanvasView detects    │
│ canvas-related command│
└──────┬────────────────┘
       │
       ▼
┌──────────────────────────┐
│ handleVoiceCommand()     │
│ Maps to action:          │
│ 'adjust-length', 'shorter'│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Send to Friday AI:       │
│ "Canvas action: adjust-  │
│  length shorter on       │
│  content: [first 200ch]" │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Friday processes via     │
│ OpenClaw CLI             │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Response:                │
│ { type: 'friday_response'│
│   canvasUpdate: {...} }  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Canvas updates content   │
│ Saves new version        │
└──────────────────────────┘
```

### Version Navigation Flow

```
┌──────────────────┐
│ User clicks      │
│ "← Tilbage"      │
└────┬─────────────┘
     │
     ▼
┌──────────────────────┐
│ onNavigate(-1)       │
│ newIndex = current-1 │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Load version data    │
│ from versions[index] │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Update state:        │
│ - content            │
│ - canvasType         │
│ - language           │
│ - currentIndex       │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Generate diff:       │
│ compare with         │
│ versions[index-1]    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Render diff view:    │
│ - Additions (green)  │
│ - Deletions (red)    │
│ - Unchanged (gray)   │
└──────────────────────┘
```

## Performance Optimizations

### 1. Lazy Loading

```javascript
// Load Monaco only when code canvas opened
if (canvasType === 'code' && !monacoRef.current) {
  const monaco = await import('monaco-editor');
  // Initialize...
}

// Load Fabric only when drawing canvas opened
if (canvasType === 'drawing' && !fabricRef.current) {
  const { fabric } = await import('fabric');
  // Initialize...
}
```

### 2. Debounced Auto-Save

```javascript
// Don't save on every keystroke
let saveTimer;
const debouncedSave = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (content !== lastSaved) {
      saveCanvasState();
    }
  }, 5000); // 5 seconds
};
```

### 3. WebSocket Throttling

```javascript
// Don't broadcast every character typed
let broadcastTimer;
const throttledBroadcast = (content) => {
  if (!broadcastTimer) {
    websocket.send({ type: 'canvasUpdate', content });
    broadcastTimer = setTimeout(() => {
      broadcastTimer = null;
    }, 1000); // Max 1 update per second
  }
};
```

### 4. IndexedDB Batching

```javascript
// Batch version saves
let pendingVersions = [];
const batchSaveVersions = async () => {
  if (pendingVersions.length === 0) return;
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  for (const version of pendingVersions) {
    store.put(version);
  }
  
  await transaction.complete;
  pendingVersions = [];
};

setInterval(batchSaveVersions, 10000); // Every 10 seconds
```

### 5. Diff Caching

```javascript
// Cache computed diffs
const diffCache = new Map();

const getCachedDiff = (oldId, newId) => {
  const key = `${oldId}-${newId}`;
  if (diffCache.has(key)) return diffCache.get(key);
  
  const diff = generateDiff(old, new);
  diffCache.set(key, diff);
  
  // Limit cache size
  if (diffCache.size > 50) {
    const firstKey = diffCache.keys().next().value;
    diffCache.delete(firstKey);
  }
  
  return diff;
};
```

## Mobile Responsive Design

### Breakpoints

```css
/* Desktop: 768px+ */
.canvas-view {
  flex-direction: row;
  /* Side-by-side: Chat | Canvas */
}

/* Mobile: <768px */
@media (max-width: 768px) {
  .canvas-view {
    flex-direction: column;
    /* Stacked: Chat on top, Canvas below */
  }
  
  .ql-editor {
    font-size: 18px; /* Larger for readability */
  }
  
  .toolbar button {
    min-width: 44px; /* Larger touch targets */
    min-height: 44px;
  }
}
```

### Touch Optimizations

```javascript
// Detect touch device
const isTouchDevice = 'ontouchstart' in window;

if (isTouchDevice) {
  // Larger buttons
  buttonSize = '48px';
  
  // Disable hover effects
  disableHover = true;
  
  // Enable touch gestures
  enableGestures = true;
}
```

## Security Considerations

### 1. Code Execution Sandboxing

```javascript
// Python: Pyodide runs in WASM sandbox
// - No file system access
// - No network access
// - Isolated from main thread

// JavaScript: Function() sandbox
const customConsole = { log: (...args) => logs.push(args) };
const func = new Function('console', userCode);
func(customConsole); // No access to window, document
```

### 2. XSS Prevention

```javascript
// Sanitize user content before rendering
import DOMPurify from 'dompurify';

const cleanContent = DOMPurify.sanitize(userContent);
```

### 3. Share Link Security

```javascript
// Generate cryptographically secure IDs
import { nanoid } from 'nanoid';
const shareId = nanoid(10); // 10 chars = 64^10 combinations

// Expire links after 30 days
const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

// Read-only access
// Server checks: if (shareMode === 'view') disableEditing = true;
```

### 4. Storage Quota Management

```javascript
// Check IndexedDB quota before saving
const estimate = await navigator.storage.estimate();
const percentUsed = (estimate.usage / estimate.quota) * 100;

if (percentUsed > 80) {
  // Warn user
  // Clean old versions
  await cleanupOldVersions();
}
```

## Testing Strategy

### Unit Tests

```javascript
// Component tests with React Testing Library
import { render, fireEvent } from '@testing-library/react';

test('TextEditor saves content on change', async () => {
  const mockOnChange = jest.fn();
  const { container } = render(
    <TextEditor content="" onChange={mockOnChange} />
  );
  
  const editor = container.querySelector('.ql-editor');
  fireEvent.input(editor, { target: { textContent: 'Hello' } });
  
  expect(mockOnChange).toHaveBeenCalled();
});
```

### Integration Tests

```javascript
// WebSocket integration
test('Canvas syncs changes via WebSocket', async () => {
  const ws = new WebSocket('ws://localhost:8765/ws');
  
  ws.send(JSON.stringify({
    type: 'canvasUpdate',
    content: 'Test content'
  }));
  
  const response = await waitForMessage(ws);
  expect(response.type).toBe('canvasUpdate');
});
```

### E2E Tests

```javascript
// Playwright browser automation
test('User can create, edit, and export document', async ({ page }) => {
  await page.goto('http://localhost:8765');
  
  // Open canvas
  await page.click('[data-testid="open-canvas"]');
  
  // Type content
  await page.fill('.ql-editor', 'Hello Friday!');
  
  // Export PDF
  await page.click('[data-testid="export-pdf"]');
  
  // Verify download
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
```

## Future Enhancements

### Phase 2 Features (Planned)

1. **Real-time Collaboration**
   - Multiple users editing simultaneously
   - Cursor tracking
   - User presence indicators
   - Conflict resolution

2. **AI Assistants**
   - Grammar checking (LanguageTool API)
   - Code suggestions (GitHub Copilot)
   - Auto-complete for Danish

3. **Templates**
   - Pre-built templates (blog post, code snippet, diagram)
   - User-created templates
   - Template marketplace

4. **Advanced Export**
   - LaTeX/PDF for scientific papers
   - PowerPoint presentations
   - Interactive HTML with embedded widgets

5. **Version Control Integration**
   - Git backend for version storage
   - Branch/merge workflows
   - GitHub integration

6. **Voice Dictation**
   - Real-time speech-to-text in canvas
   - Voice editing commands
   - Danish voice models

---

**Version**: 0.3.0-canvas  
**Architecture by**: Friday (AI Agent) 🤖  
**Last Updated**: 2026-02-06
