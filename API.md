# Friday Voice App - WebSocket API Documentation

## 🔌 Connection

**Endpoint:** `wss://<domain>/ws`

**Example:**
```javascript
const ws = new WebSocket('wss://witnesses-presenting-foods-collaborative.trycloudflare.com/ws');
```

---

## 📨 Message Protocol

All messages are JSON-encoded objects sent over WebSocket.

### **General Structure:**
```json
{
  "type": "message_type",
  "data": { ... },
  "timestamp": 1234567890
}
```

---

## 📤 Client → Server Messages

### **1. Voice Message**

User's transcribed voice input.

```json
{
  "type": "voice_message",
  "transcript": "Hvad er vejret i morgen?",
  "timestamp": 1707213456789
}
```

**Fields:**
- `type` (string, required): Always `"voice_message"`
- `transcript` (string, required): Transcribed text from Web Speech API
- `timestamp` (number, required): Unix timestamp (milliseconds)

**Response:** Server sends `friday_response` (see below)

---

### **2. Ping (Future)**

Keepalive heartbeat to prevent connection timeout.

```json
{
  "type": "ping",
  "timestamp": 1707213456789
}
```

**Response:** Server sends `pong`

---

## 📥 Server → Client Messages

### **1. Friday Response**

Friday's AI-generated response to user's message.

```json
{
  "type": "friday_response",
  "text": "I morgen bliver det omkring 8 grader med let regn om eftermiddagen.",
  "audioUrl": "/audio/response-abc123.mp3",
  "timestamp": 1707213457000
}
```

**Fields:**
- `type` (string): Always `"friday_response"`
- `text` (string): Friday's text response
- `audioUrl` (string | null): URL to TTS audio file (null if TTS not available)
- `timestamp` (number): Server response timestamp

---

### **2. Status Update**

Server status or connection info.

```json
{
  "type": "status",
  "message": "Connected to Friday Voice Server 🟢",
  "timestamp": 1707213456789
}
```

**Fields:**
- `type` (string): Always `"status"`
- `message` (string): Human-readable status message
- `timestamp` (number): Event timestamp

---

### **3. Error**

Error occurred during processing.

```json
{
  "type": "error",
  "message": "Failed to get response from Friday",
  "code": "AI_PROCESSING_ERROR",
  "timestamp": 1707213457000
}
```

**Fields:**
- `type` (string): Always `"error"`
- `message` (string): Human-readable error description
- `code` (string, optional): Machine-readable error code
- `timestamp` (number): Error timestamp

**Error Codes:**
- `WEBSOCKET_ERROR` - WebSocket connection failed
- `AI_PROCESSING_ERROR` - Friday AI failed to process request
- `TTS_ERROR` - Text-to-speech generation failed
- `INVALID_MESSAGE` - Client sent malformed message

---

### **4. Pong (Future)**

Response to client's `ping`.

```json
{
  "type": "pong",
  "timestamp": 1707213456789
}
```

---

## 🔄 Connection Lifecycle

```
1. Client connects → WebSocket open
   ↓
2. Server sends 'status' message (connected)
   ↓
3. Client sends 'voice_message'
   ↓
4. Server processes → sends 'friday_response'
   ↓
5. (Repeat step 3-4 for each message)
   ↓
6. Client disconnects OR connection lost
   ↓
7. Server removes client from active list
```

---

## 🛡️ Error Handling

### **Client-Side:**

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Show error to user
  // Attempt reconnect after delay
};

ws.onclose = (event) => {
  if (event.code !== 1000) {
    // Abnormal closure - attempt reconnect
    setTimeout(() => connectWebSocket(), 3000);
  }
};
```

### **Server-Side:**

Server validates all incoming messages:
- Type must be valid
- Required fields must be present
- Transcript must be non-empty string

Invalid messages → server sends `error` message, does NOT close connection.

---

## 📊 Rate Limiting (Future)

**Current:** No rate limiting (single-user MVP)

**Future:**
- Max 10 messages per minute per client
- Exceeding limit → `error` message with code `RATE_LIMIT_EXCEEDED`
- Cooldown period: 60 seconds

---

## 🔐 Authentication (Future)

**Current:** No authentication required

**Future (Production):**

### **JWT Token Authentication:**

```javascript
// Client sends token on connect
const ws = new WebSocket('wss://friday.tekup.dk/ws?token=eyJhbGciOi...');

// Server validates token
// Invalid token → connection rejected (403)
```

---

## 🧪 Testing the API

### **Manual Testing (Browser Console):**

```javascript
// Connect
const ws = new WebSocket('wss://witnesses-presenting-foods-collaborative.trycloudflare.com/ws');

// Listen for messages
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Send test message
ws.send(JSON.stringify({
  type: 'voice_message',
  transcript: 'Test besked',
  timestamp: Date.now()
}));
```

### **Automated Testing (Node.js):**

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:8765/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'voice_message',
    transcript: 'Automated test',
    timestamp: Date.now()
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Response:', message);
  
  // Assert expected response
  if (message.type === 'friday_response') {
    console.log('✅ Test passed!');
  }
  
  ws.close();
});
```

---

## 📈 Future Enhancements

### **Planned Features:**

1. **Streaming Responses**
   - Server sends partial responses as they generate
   - Client displays typing indicator

2. **Voice Activity Detection**
   - Server detects when user stops speaking
   - Auto-submit without button press

3. **Multi-turn Conversations**
   - Session management
   - Context preservation across messages

4. **Audio Upload**
   - Client sends raw audio instead of transcript
   - Server handles speech-to-text

---

**Last updated:** 2026-02-06  
**Version:** 0.1.0-alpha  
**Maintainer:** Friday (AI Agent)
