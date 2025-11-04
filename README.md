# Advanced Web Security Scanner Pro - Chrome & Edge Extension

A comprehensive web vulnerability scanner that runs directly in your browser to detect security issues and potential threats on any website.

## Features

🛡️ **Comprehensive Security Analysis**
- SSL/TLS certificate validation
- Security headers analysis
- Mixed content detection
- Form security assessment
- Cookie security evaluation
- DOM vulnerability scanning
- Third-party resource analysis

🔍 **Real-time Scanning**
- Automatic scanning on page load
- Manual scan trigger
- Live vulnerability counting
- Severity-based prioritization

📊 **Detailed Reporting**
- Issue categorization by severity
- Evidence collection
- Solution recommendations
- Security best practices

⚙️ **Customizable Settings**
- Auto-scan toggle
- Notification preferences
- Scan result persistence

## Installation

### Method 1: Developer Mode (Recommended for testing)

1. Download or clone this repository
2. **Create the required icon files** (see Icon Requirements below)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the extension folder
6. The extension will appear in your Chrome toolbar

### Method 2: Manual Installation

1. Download the extension files
2. Create a folder named "SecurityScannerPro"
3. Copy all files into this folder:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `scanner.js`
   - `popup.html`
   - `popup.js`



## Icon Requirements

**⚠️ CRITICAL**: The extension will not load without these icon files!

Create the following icon files and place them in the extension folder:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### Quick Icon Creation:
1. Open `create_icons.html` in your browser for detailed instructions
2. Or use any image editor to create simple shield/security icons
3. Suggested colors: #667eea (primary) and #764ba2 (secondary)
4. For testing: even simple colored squares with "S" will work

## Usage

### Quick Start

1. **Install the extension** following the installation steps above
2. **Navigate to any website** you want to scan
3. **Click the extension icon** in Chrome's toolbar
4. **Click "Scan Page"** or wait for auto-scan (if enabled)
5. **View results** in the popup window

### Understanding Results

**Severity Levels:**
- 🔴 **Critical**: Immediate security risks requiring urgent attention
- 🟠 **High**: Significant vulnerabilities that should be addressed
- 🟡 **Medium**: Moderate security concerns
- 🔵 **Low**: Minor issues or recommendations

**Status Indicators:**
- 🟢 **Safe**: No security issues detected
- 🟡 **Scanning**: Analysis in progress
- 🔴 **Issues**: Security vulnerabilities found

### Settings

**Auto-scan pages**: Automatically scan websites when you visit them
**Show notifications**: Display alerts when issues are detected

## What Gets Scanned

### Core Security Checks
- ✅ HTTPS protocol usage
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Mixed content detection
- ✅ SSL certificate validation
- ✅ Cookie security attributes
- ✅ Form CSRF protection
- ✅ DOM XSS vulnerability patterns

### Client-Side Analysis
- ✅ Inline event handlers
- ✅ Local/session storage usage
- ✅ Third-party resource loading
- ✅ Deprecated HTML elements
- ✅ JavaScript security patterns

### Advanced Features
- ✅ Certificate chain validation
- ✅ Hostname verification
- ✅ Vulnerability pattern matching
- ✅ Real-time threat assessment

## Privacy & Security

- **No data collection**: All scanning happens locally in your browser
- **No external requests**: Analysis is performed client-side only
- **No tracking**: Your browsing data never leaves your device
- **Open source**: All code is transparent and auditable

## Troubleshooting

### Service Worker Registration Failed (Status Code: 15)
This usually indicates missing permissions or syntax errors:
1. **Check icon files**: Ensure `icon16.png`, `icon48.png`, and `icon128.png` exist
2. **Verify manifest.json**: Make sure all syntax is correct
3. **Check file permissions**: Ensure all files are readable
4. **Reload extension**: Go to chrome://extensions/ and click the reload button
5. **Check console**: Look for specific error messages in the extension's service worker

### "Cannot read properties of undefined (reading 'onClicked')"
This error occurs when Chrome APIs aren't available:
1. **Update Chrome**: Ensure you're using Chrome 88+ for Manifest V3 support
2. **Check permissions**: Verify all required permissions are in manifest.json
3. **Reload extension**: Sometimes a simple reload fixes API availability issues

### Extension Not Working
1. Ensure all files are in the correct folder
2. Check that Developer Mode is enabled
3. Reload the extension from chrome://extensions/
4. Refresh the webpage you're trying to scan
5. Check browser console for errors (F12)

### Cannot Scan Certain Pages
The extension cannot scan:
- Chrome internal pages (chrome://)
- Extension pages (chrome-extension://)
- Local file:// URLs
- Some protected pages
- Pages with strict Content Security Policy

### No Results Showing
1. Wait for the scan to complete (usually 2-5 seconds)
2. Check browser console for errors (F12)
3. Try manually clicking "Scan Page"
4. Reload the page and try again
5. Ensure the page is not blocked by CSP or other security measures

### Icons Not Displaying
1. **Create icon files**: Use `create_icons.html` for instructions
2. **Check file names**: Must be exactly `icon16.png`, `icon48.png`, `icon128.png`
3. **Verify file format**: Must be PNG format
4. **Check file location**: Icons must be in the same folder as manifest.json

## Development

### File Structure
```
SecurityScannerPro/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script bridge
├── scanner.js            # Main scanning engine
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── README.md             # This file
├── create_icons.html     # Icon creation guide
├── install.html          # Installation guide
└── icons/                # Extension icons (create manually)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Adding New Checks
1. Add your scanning function to `scanner.js`
2. Call it from `runComprehensiveScan()`
3. Use `addIssue()` to report vulnerabilities
4. Test thoroughly on various websites

## Contributing

This extension is based on the Advanced Web Security Scanner Pro userscript. Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Version History

**v3.0.0** - Chrome Extension Release
- Converted from userscript to Chrome extension
- Added popup interface
- Implemented background scanning
- Added settings management
- Improved user experience
- Fixed Manifest V3 compatibility issues
- Added comprehensive error handling

## License

This project is open source. Feel free to modify and distribute according to your needs. This was developed by Stefan Ralph Kumarasinghe