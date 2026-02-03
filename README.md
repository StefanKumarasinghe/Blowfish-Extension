# Blowfish Extension

Chrome extension for real-time website security analysis.

## Features

- Automatic SSL certificate validation
- Security header analysis
- Vulnerability detection
- Real-time threat alerts
- Customizable scanning modes

## Installation

1. Clone repository
2. Create required icon files (see below)
3. Navigate to `chrome://extensions/`
4. Enable Developer mode
5. Load unpacked extension

### Required Icons

Create three PNG files in project root:

- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## Usage

Click extension icon → Scan Page

### Severity Levels

- **Critical** - Immediate action required
- **High** - Address soon
- **Medium** - Fix when possible
- **Low** - Minor improvements

### Status Indicators

- Safe
- Scanning
- Issues detected

## Security Checks

- HTTPS validation
- Security headers
- Form/cookie analysis
- XSS vulnerabilities
- Third-party content

All processing is local. No external data transmission.

## Project Structure

```
manifest.json    Extension configuration
background.js    Background processes
content.js       Page interaction
scanner.js       Security analysis
popup.html       Interface
popup.js         UI logic
```

## Troubleshooting

**Extension fails to load**
- Verify icon files exist
- Check file naming matches exactly
- Reload extension

**No scan results**
- Allow scan completion
- Manual trigger via "Scan Page"
- Refresh target page

**Incompatible pages**
- Chrome internal pages
- Local files
- CSP-restricted sites

## Development

Edit `scanner.js` to add security checks. Test across multiple sites before deployment.

## Contributing

Fork → Branch → Test → Pull Request

## License

MIT

**Author:** Stefan Ralph Kumarasinghe