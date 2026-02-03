<style>
* { font-family: 'Ubuntu Mono', monospace !important; }
</style>

= Web Security Scanner Pro

Keep your browsing safe with this easy-to-use Chrome extension that checks websites for security issues right in your browser.

== What It Does

This extension scans any website you visit and alerts you to potential security problems, like weak passwords, unsafe connections, or hidden vulnerabilities. It's like having a security guard for your online activities.

=== Key Features
* Automatic Checks: Scans for SSL certificates, security headers, and common vulnerabilities
* Real-Time Alerts: Gets results instantly while you browse
* Simple Reports: Shows issues clearly with easy-to-understand explanations
* Customizable: Turn on auto-scanning or manual checks as you prefer

== Getting Started

=== Install the Extension

1. Download this project to your computer
2. Create three small icon files (see below for details)
3. Open Chrome and go to `chrome://extensions/`
4. Turn on "Developer mode" (top right)
5. Click "Load unpacked" and choose this folder
6. You'll see the extension icon in your toolbar

=== Create the Icons

The extension needs three small PNG images:

* `icon16.png` (16x16 pixels)
* `icon48.png` (48x48 pixels)
* `icon128.png` (128x128 pixels)

Quick way: Open `create_icons.html` in your browser for step-by-step help, or use any image editor to make simple shield icons. Even basic colored squares work for testing.

== How to Use

1. Visit any website
2. Click the extension icon in your toolbar
3. Click "Scan Page" (or let it scan automatically if enabled)
4. See the results in the popup

=== Understanding the Results

* 🔴 Critical: Fix these right away – serious risks
* 🟠 High: Important issues to address soon
* 🟡 Medium: Good to fix when you can
* 🔵 Low: Minor suggestions

* 🟢 Safe: No problems found
* 🟡 Scanning: Still checking...
* 🔴 Issues: Found some concerns

=== Settings

* Auto-scan: Automatically check sites when you visit
* Notifications: Get alerts when issues are found

== What Gets Checked

* Secure connections (HTTPS)
* Website security settings
* Forms and cookies
* Potential code vulnerabilities
* Third-party content

Everything happens in your browser – no data is sent anywhere.

== Privacy & Security

* All scanning is done locally on your device
* No information leaves your computer
* Your browsing stays private
* Code is open source and transparent

== Common Issues & Fixes

=== Extension Won't Load
* Make sure the three icon files exist
* Check that all files are in the same folder
* Reload the extension in `chrome://extensions/`

=== No Scan Results
* Wait a few seconds for the scan to finish
* Try clicking "Scan Page" manually
* Refresh the page and try again

=== Can't Scan Some Pages
Won't work on Chrome's internal pages, local files, or sites with very strict security rules.

=== Icons Not Showing
* Ensure files are named exactly `icon16.png`, etc.
* Must be PNG format
* Place them in the main folder

== For Developers

=== Project Files
* `manifest.json` - Extension setup
* `background.js` - Background processes
* `content.js` - Page interaction
* `scanner.js` - Main scanning logic
* `popup.html/js` - User interface

=== Adding New Checks
Edit `scanner.js` to add more security tests. Test on different sites.

== Contributing

Want to help improve it? Great! Fork the repo, make changes, and submit a pull request. This started as a userscript and grew into this extension.

== Version Notes

**v3.0.0** - Full Chrome extension with popup, auto-scanning, and better error handling.

== License

Free to use and modify. Created by Stefan Ralph Kumarasinghe.