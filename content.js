let scannerInjected = false;
let scanResults = null;
let highlightOverlays = new Map();

// Robust messaging: handle cases where extension context becomes invalidated (e.g., extension reload)
let extensionContextValid = !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
const pendingMessages = [];
let flushInterval = null;

function isExtensionAvailable() {
    return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
}

function safeSendMessage(message) {
    try {
        if (isExtensionAvailable()) {
            // Attempt to send and handle runtime.lastError in a callback
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn('sendMessage failed:', chrome.runtime.lastError.message);
                    extensionContextValid = false;
                    // Queue the message for retry
                    pendingMessages.push(message);
                    startFlushTimer();
                }
            });
            extensionContextValid = true;
            return true;
        } else {
            // Extension not available - queue message and start retry loop
            extensionContextValid = false;
            pendingMessages.push(message);
            startFlushTimer();
            console.warn('Extension context invalidated. Queuing message.');
            return false;
        }
    } catch (err) {
        console.warn('Failed to send message (exception):', err && err.message ? err.message : err);
        extensionContextValid = false;
        pendingMessages.push(message);
        startFlushTimer();
        return false;
    }
}

function startFlushTimer() {
    if (flushInterval) return;
    flushInterval = setInterval(() => {
        if (isExtensionAvailable() && pendingMessages.length > 0) {
            const messagesToSend = pendingMessages.splice(0, pendingMessages.length);
            messagesToSend.forEach(msg => {
                try {
                    chrome.runtime.sendMessage(msg, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn('Retry sendMessage failed:', chrome.runtime.lastError.message);
                            // push back to pending
                            pendingMessages.push(msg);
                        }
                    });
                } catch (err) {
                    pendingMessages.push(msg);
                }
            });
            if (pendingMessages.length === 0) {
                clearInterval(flushInterval);
                flushInterval = null;
                extensionContextValid = true;
            }
        }
    }, 3000);
}

// Listen for visibility/focus to attempt immediate flush
window.addEventListener('focus', () => {
    if (isExtensionAvailable() && pendingMessages.length > 0) startFlushTimer();
});

// Stop flush on unload
window.addEventListener('beforeunload', () => {
    if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
    }
});

// Test/debug accessor: returns number of queued messages (safe to remove in prod)
window.__getQueuedMessageCount = function() {
    return pendingMessages.length;
};

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
                    globalThis.dispatchEvent(new CustomEvent('updateScannerSettings', { detail: message.settings }));
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to forward settings to scanner:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'TRIGGER_MANUAL_SCAN':
             
                try {
                    globalThis.dispatchEvent(new CustomEvent('manualScanTrigger'));
                    sendResponse({ success: true });
                } catch (error) {
                    console.error('Failed to trigger manual scan:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'STOP_SCANNER':
             
                try {
                    globalThis.dispatchEvent(new CustomEvent('stopScanner'));
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
globalThis.addEventListener('securityScanProgress', (event) => {
    try {
        if (event.detail) {
            // Use safeSendMessage which queues and retries if extension context is invalid
            safeSendMessage({ type: 'SCAN_PROGRESS', data: event.detail });
        }
    } catch (error) {
        console.error('Failed to send scan progress:', error);
    }
});

globalThis.addEventListener('securityScanComplete', (event) => {
    try {
        if (event.detail) {
            scanResults = event.detail;
            // Queue/send using safeSendMessage to avoid exceptions when extension reloads
            safeSendMessage({ type: 'SCAN_COMPLETE', data: event.detail });
        }
    } catch (error) {
        console.error('Failed to send scan complete:', error);
    }
});

function canScanPage() {
    const url = globalThis.location.href;
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
    if (!issue.details?.evidence) {
        console.warn('No evidence for highlight', issue);
        return;
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
                    console.warn('Invalid selector:', evidence.selector, e);
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
        if (element?.getBoundingClientRect) {
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
        overlays.forEach(overlay => overlay?.remove());
    });
    highlightOverlays.clear();
}

console.log('Advanced Web Security Scanner Pro content script loaded');

let lastUrl = globalThis.location.href;
new MutationObserver(() => {
    const url = globalThis.location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        scanResults = null;
        document.querySelectorAll('[id^="security-highlight-"]').forEach(h => h.remove());
    }
}).observe(document, { subtree: true, childList: true }); 