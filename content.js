// Content script for Advanced Web Security Scanner Pro

let scannerInjected = false;
let scanResults = null;
let highlightOverlays = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        switch (message.type) {
            case 'PING':
                sendResponse({ success: true, timestamp: Date.now() });
                break;
                
            case 'GET_SCAN_RESULTS':
                sendResponse(scanResults);
                break;
                
            case 'UPDATE_SCANNER_SETTINGS':
             
                try {
                    window.dispatchEvent(new CustomEvent('updateScannerSettings', {
                        detail: message.settings
                    }));
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to forward settings to scanner:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'TRIGGER_MANUAL_SCAN':
             
                try {
                    window.dispatchEvent(new CustomEvent('manualScanTrigger'));
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to trigger manual scan:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'STOP_SCANNER':
             
                try {
                    window.dispatchEvent(new CustomEvent('stopScanner'));
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to stop scanner:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'ADD_HIGHLIGHT':
             
                try {
                    highlightElement(message.issue, message.issueIndex);
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to add highlight:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'REMOVE_HIGHLIGHT':
             
                try {
                    removeHighlight(message.issueIndex);
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to remove highlight:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown message type: ' + message.type });
        }
    } catch (error) {
        console.error('Content script message handler error:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async responses
});

// Listen for scanner events from the injected script with improved error handling
window.addEventListener('securityScanProgress', (event) => {
    try {
        if (event.detail) {
            chrome.runtime.sendMessage({
                type: 'SCAN_PROGRESS',
                data: event.detail
            }).catch(error => {
                console.error('Failed to send scan progress:', error);
             
            });
        }
    } catch (error) {
        console.error('Failed to send scan progress:', error);
    }
});

window.addEventListener('securityScanComplete', (event) => {
    try {
        if (event.detail) {
            scanResults = event.detail;
            chrome.runtime.sendMessage({
                type: 'SCAN_COMPLETE',
                data: event.detail
            }).catch(error => {
                console.error('Failed to send scan complete:', error);
             
                console.log('Scan results stored locally due to communication error:', scanResults);
            });
        }
    } catch (error) {
        console.error('Failed to send scan complete:', error);
    }
});

// Check if this is a page that can be scanned
function canScanPage() {
    const url = window.location.href;
    return !url.startsWith('chrome://') && 
           !url.startsWith('chrome-extension://') && 
           !url.startsWith('moz-extension://') &&
           !url.startsWith('about:') &&
           !url.startsWith('file://');
}

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    scannerInjected = false;
    scanResults = null;
    clearAllHighlights();
});

// Element highlighting functions
function highlightElement(issue, issueIndex) {
    if (!issue.details || !issue.details.evidence) {
        throw new Error('No evidence data for highlighting');
    }
    
    issue.details.evidence.forEach((evidence, evidenceIndex) => {
        if (evidence.element || evidence.selector) {
            const selector = evidence.selector || evidence.element;
            const elements = document.querySelectorAll(selector);
            
            elements.forEach((element, elementIndex) => {
                const highlightId = `security-highlight-${issueIndex}-${evidenceIndex}-${elementIndex}`;
                
             
                const existingHighlight = document.getElementById(highlightId);
                if (existingHighlight) {
                    existingHighlight.remove();
                }
                
             
                const highlight = document.createElement('div');
                highlight.id = highlightId;
                highlight.style.cssText = `
                    position: absolute;
                    background: rgba(255, 0, 0, 0.3);
                    border: 2px solid #ff0000;
                    pointer-events: none;
                    z-index: 999999;
                    box-sizing: border-box;
                `;
                
             
                const rect = element.getBoundingClientRect();
                highlight.style.left = (rect.left + window.scrollX) + 'px';
                highlight.style.top = (rect.top + window.scrollY) + 'px';
                highlight.style.width = rect.width + 'px';
                highlight.style.height = rect.height + 'px';
                
                document.body.appendChild(highlight);
            });
        }
    });
}

function removeHighlight(issueIndex) {
    const highlights = document.querySelectorAll(`[id^="security-highlight-${issueIndex}-"]`);
    highlights.forEach(highlight => highlight.remove());
}

// Highlighting functions
function addHighlight(issueIndex, issue) {
    if (!issue.details?.evidence) return;
    
    const elements = [];
    
 
    issue.details.evidence.forEach(evidence => {
        if (evidence.selector) {
            try {
                const found = document.querySelectorAll(evidence.selector);
                elements.push(...found);
            } catch (e) {
                console.warn('Invalid selector:', evidence.selector);
            }
        } else if (evidence.element) {
         
            elements.push(evidence.element);
        } else if (evidence.code) {
         
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                if (el.outerHTML.includes(evidence.code.substring(0, 50))) {
                    elements.push(el);
                    break;
                }
            }
        }
    });
    
 
    const overlays = [];
    elements.forEach((element, index) => {
        if (element && element.getBoundingClientRect) {
            const overlay = createHighlightOverlay(element, issue.severity, `${issue.message} (${index + 1})`);
            if (overlay) {
                overlays.push(overlay);
                document.body.appendChild(overlay);
            }
        }
    });
    
    if (overlays.length > 0) {
        highlightOverlays.set(issueIndex, overlays);
    }
}

function createHighlightOverlay(element, severity, tooltip) {
    try {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: ${rect.top + scrollTop}px;
            left: ${rect.left + scrollLeft}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            border: 3px solid ${getSeverityColor(severity)};
            background: ${getSeverityColor(severity)}20;
            pointer-events: none;
            z-index: 999999;
            border-radius: 4px;
            box-shadow: 0 0 10px ${getSeverityColor(severity)}40;
            animation: highlightPulse 2s infinite;
        `;
        
     
        const tooltipEl = document.createElement('div');
        tooltipEl.textContent = tooltip;
        tooltipEl.style.cssText = `
            position: absolute;
            top: -30px;
            left: 0;
            background: ${getSeverityColor(severity)};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-family: 'Ubuntu Mono', monospace;
            white-space: nowrap;
            z-index: 1000000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        
        overlay.appendChild(tooltipEl);
        
     
        if (!document.getElementById('highlight-styles')) {
            const style = document.createElement('style');
            style.id = 'highlight-styles';
            style.textContent = `
                @keyframes highlightPulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                }
            `;
            document.head.appendChild(style);
        }
        
        return overlay;
    } catch (error) {
        console.error('Failed to create highlight overlay:', error);
        return null;
    }
}

function getSeverityColor(severity) {
    const colors = {
        critical: '#c53030',
        high: '#dd6b20',
        medium: '#d69e2e',
        low: '#319795',
        warning: '#ed8936'
    };
    return colors[severity] || colors.warning;
}

function clearAllHighlights() {
    highlightOverlays.forEach((overlays) => {
        overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    });
    highlightOverlays.clear();
}

// Initialize content script
console.log('Advanced Web Security Scanner Pro content script loaded');

// Handle page navigation
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
     
        scanResults = null;
     
        const allHighlights = document.querySelectorAll('[id^="security-highlight-"]');
        allHighlights.forEach(highlight => highlight.remove());
    }
}).observe(document, { subtree: true, childList: true }); 