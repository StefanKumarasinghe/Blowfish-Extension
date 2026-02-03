# Blowfish Extension

Welcome to Blowfish, a simple Chrome extension that helps keep your browsing safe. It checks websites for security issues right in your browser, giving you peace of mind without sending your data anywhere.

## What It Does

Blowfish automatically looks at websites you visit and points out potential security problems. Think of it as a friendly security checker that runs quietly in the background. It checks things like whether the site uses secure connections, if there are any hidden vulnerabilities, and more. Everything happens locally on your computer, so your browsing stays private.

## Getting Started

### Installing the Extension

First, you'll need to set up the extension for testing. Here's how:

1. Download this project to your computer by cloning the repository.

2. The extension needs some small icon files to work. Create three PNG images in the main project folder:
   - `icon16.png` (16 pixels by 16 pixels)
   - `icon48.png` (48 pixels by 48 pixels)
   - `icon128.png` (128 pixels by 128 pixels)
   
   You can make these yourself using any image editor – even simple colored squares work for testing. Just make sure they're exactly those sizes and named correctly.

3. Open Chrome and type `chrome://extensions/` in the address bar.

4. Turn on "Developer mode" using the switch in the top right corner.

5. Click the "Load unpacked" button and select the folder where you saved this project.

6. You should now see the Blowfish extension icon in your Chrome toolbar.

## How to Use It

Using Blowfish is straightforward:

- Visit any website you want to check.
- Look for the Blowfish icon in your Chrome toolbar (it might be hidden under the puzzle piece menu).
- Click the icon to open the extension popup.
- Click "Scan Page" to start checking the site.

The extension can also scan automatically when you visit pages if you turn that on in settings.

## Understanding the Results

After scanning, Blowfish shows you what it found. Here's what the different levels mean:

- **Critical**: These are serious issues that need fixing right away. They could put your security at risk.
- **High**: Important problems that should be addressed soon to keep things safe.
- **Medium**: Issues that are good to fix when you have time, but not urgent.
- **Low**: Small suggestions or minor improvements that don't affect security much.

You'll also see status messages like "Safe" (no issues), "Scanning" (still checking), or "Issues detected" (found some problems).

## What Gets Checked

Blowfish looks at several aspects of website security:

It verifies that the site uses HTTPS for secure connections. It examines security headers that websites use to protect against common attacks. The extension checks forms and cookies to make sure they're set up safely. It looks for potential cross-site scripting (XSS) vulnerabilities that could let attackers inject harmful code. Finally, it reviews third-party content like ads or scripts from other sites.

All of this analysis happens right in your browser. No information about the sites you visit or the results ever leaves your computer.

## Privacy and Security

Your privacy is important. Blowfish doesn't collect any data, doesn't track what you do, and doesn't send anything to external servers. It's completely open source, so you can see exactly how it works. The code is transparent and auditable.

## If Something Goes Wrong

### Extension Won't Load

If the extension doesn't appear after installation:
- Double-check that the three icon files exist in the project folder.
- Make sure the file names match exactly: `icon16.png`, `icon48.png`, and `icon128.png`.
- Try reloading the extension by clicking the reload button in `chrome://extensions/`.

### No Results After Scanning

If you click scan but don't see anything:
- Give it a moment – scans usually take just a few seconds.
- Try clicking "Scan Page" again manually.
- Refresh the webpage and scan once more.

### Can't Scan Certain Sites

Blowfish won't work on:
- Chrome's built-in pages (like `chrome://settings`)
- Files you open locally on your computer
- Sites with very strict security policies that block extensions

This is normal and for security reasons.

## For Developers

If you want to add more security checks or modify the extension:

The main files are:
- `manifest.json`: Sets up how the extension works
- `background.js`: Handles background tasks
- `content.js`: Interacts with web pages
- `scanner.js`: Contains the security scanning logic
- `popup.html` and `popup.js`: The user interface

To add new checks, edit `scanner.js`. Always test your changes on different types of websites to make sure they work well.

## Contributing

Want to help make Blowfish better? That's great! The process is simple: fork the repository, create a branch for your changes, test everything thoroughly, and submit a pull request.

## License

This project uses the MIT license, which means you're free to use, modify, and share it.

**Created by:** Stefan Ralph Kumarasinghe