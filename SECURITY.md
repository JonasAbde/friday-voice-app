# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them privately:

1. **Discord:** DM @bangzito (tekup-dk guild)
2. **Email:** (Contact via GitHub profile)

**What to include in your report:**
- Type of vulnerability
- Affected version(s)
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response timeline:**
- **Initial response:** Within 48 hours
- **Status update:** Within 7 days
- **Fix timeline:** Depends on severity (critical: <48h, high: <7d, medium: <30d)

## Security Best Practices

**When using Friday Voice App:**

1. **API Keys:**
   - Never commit API keys to Git
   - Use `.env` file (gitignored)
   - Rotate keys if exposed

2. **Permissions:**
   - Only grant microphone permission when needed
   - Review permission requests before accepting

3. **Network:**
   - Use HTTPS/WSS in production
   - Validate all server responses
   - Implement rate limiting

4. **Data Privacy:**
   - Voice data is NOT stored permanently
   - Transcripts are session-only (cleared on restart)
   - ElevenLabs API usage follows their privacy policy

## Known Security Considerations

**Microphone Access:**
- App requires microphone permission for voice input
- Permission can be revoked in device settings
- No background recording (only when app is active)

**Network Communication:**
- WebSocket connection (unencrypted in development)
- Use WSS (WebSocket Secure) in production
- API keys transmitted over HTTPS only

**Third-Party Services:**
- ElevenLabs API (neural TTS)
- OpenClaw Gateway (AI orchestration)
- Review third-party privacy policies

## Vulnerability Disclosure

We follow responsible disclosure principles:
- We will acknowledge your report within 48 hours
- We will provide a status update within 7 days
- We will credit you in release notes (if you wish)
- We will not take legal action against security researchers

**Hall of Fame:**
(Security researchers who responsibly disclosed vulnerabilities will be listed here)

## Security Updates

Security updates are released as patch versions (e.g., 0.2.1 → 0.2.2) and announced in:
- [GitHub Releases](https://github.com/JonasAbde/friday-voice-app/releases)
- [CHANGELOG.md](CHANGELOG.md)
- Discord (tekup-dk guild)

**Subscribe to updates:**
- Watch this repository (GitHub)
- Enable security alerts (GitHub Settings)

## Additional Resources

- [Flutter Security Best Practices](https://docs.flutter.dev/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [ElevenLabs Privacy Policy](https://elevenlabs.io/privacy)

---

**Last updated:** 2026-02-06
