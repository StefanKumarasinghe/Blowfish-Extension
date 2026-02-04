if (typeof globalThis.window.scannerInjected === 'undefined') globalThis.window.scannerInjected = false; // avoid redeclaration across multiple injections
if (globalThis.window.scannerInjected) {
    console.log('Advanced Web Security Scanner Pro content script already injected, skipping re-injection.');
} else {
    globalThis.window.scannerInjected = true; 

    (function() {
        var scanResults = null;
        var highlightOverlays = new Map();
        var extensionContextValid = !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
        var pendingMessages = [];
        var MAX_MESSAGE_RETRIES = 5;
        var flushInterval = null;
        var DEBUG = false;

function isExtensionAvailable() {
    return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
}

function safeSendMessage(message) {
    try {
        if (isExtensionAvailable()) {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    const errMsg = chrome.runtime.lastError && chrome.runtime.lastError.message;
                    if (DEBUG) console.warn('sendMessage failed:', errMsg);
                    extensionContextValid = false;
                    pendingMessages.push({ message, retries: 0, lastFailedAt: Date.now(), lastErrorMsg: errMsg });
                    startFlushTimer();
                }
            });
            extensionContextValid = true;
            return true;
        } else {
            extensionContextValid = false;
            pendingMessages.push({ message, retries: 0, lastFailedAt: Date.now() });
            startFlushTimer();
            if (DEBUG) console.warn('Extension context invalidated. Queuing message.');
            return false;
        }
    } catch (err) {
        const em = err && err.message ? err.message : err;
        if (DEBUG) console.warn('Failed to send message (exception):', em);
        extensionContextValid = false;
        pendingMessages.push({ message, retries: 0, lastFailedAt: Date.now(), lastErrorMsg: em });
        startFlushTimer();
        return false;
    }
}

function startFlushTimer() {
    if (flushInterval) return;
    flushInterval = setInterval(() => {
        if (!isExtensionAvailable() || pendingMessages.length === 0) return;

        // Attempt to send messages that are due for retry
        const now = Date.now();
        const messagesToAttempt = pendingMessages.splice(0, pendingMessages.length);

        messagesToAttempt.forEach(entry => {
            // Exponential backoff window: only attempt if enough time passed since last failure
            const backoffMs = Math.min(60000, 1000 * Math.pow(2, entry.retries || 0));
            if (entry.lastFailedAt && (now - entry.lastFailedAt) < backoffMs) {
                // Not ready yet, put it back
                pendingMessages.push(entry);
                return;
            }

            try {
                chrome.runtime.sendMessage(entry.message, (response) => {
                    if (chrome.runtime.lastError) {
                        const errMsg = chrome.runtime.lastError && chrome.runtime.lastError.message;
                        entry.retries = (entry.retries || 0) + 1;
                        entry.lastFailedAt = Date.now();
                        entry.lastErrorMsg = errMsg;

                        if (entry.retries < MAX_MESSAGE_RETRIES) {
                            // Requeue for another attempt
                            pendingMessages.push(entry);
                        } else {
                            if (DEBUG) console.warn('Dropping message after max retries:', entry.message, 'lastError:', errMsg);
                        }

                        // Mark context invalid so we don't hammer further
                        extensionContextValid = false;
                    }
                });
            } catch (err) {
                entry.retries = (entry.retries || 0) + 1;
                entry.lastFailedAt = Date.now();
                entry.lastErrorMsg = err && err.message ? err.message : err;
                if (entry.retries < MAX_MESSAGE_RETRIES) pendingMessages.push(entry);
            }
        });

        if (pendingMessages.length === 0) {
            clearInterval(flushInterval);
            flushInterval = null;
            extensionContextValid = true;
        }
    }, 3000);
}

// Listen for visibility/focus to attempt immediate flush
globalThis.window.addEventListener('focus', () => {
    if (isExtensionAvailable() && pendingMessages.length > 0) startFlushTimer();
    // If extension becomes available, clear last-failure marks so messages can be retried sooner
    if (isExtensionAvailable()) {
        pendingMessages.forEach(entry => { if (entry && entry.lastFailedAt) entry.lastFailedAt = 0; });
    }
});

// Stop flush on unload
globalThis.window.addEventListener('beforeunload', () => {
    if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
    }
});

// Test/debug accessor: returns number of queued messages (safe to remove in prod)
globalThis.window.__getQueuedMessageCount = function() {
    return pendingMessages.length;
};

// For debugging: inspect queued messages (returns shallow copy)
globalThis.window.__peekQueuedMessages = function() {
    return pendingMessages.slice(0, 20).map(e => ({ retries: e.retries, lastErrorMsg: e.lastErrorMsg }));
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
    
    return false; // No async response is expected
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
globalThis.window.addEventListener('beforeunload', () => {
    globalThis.window.scannerInjected = false;
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
                highlight.style.left = (rect.left + globalThis.window.scrollX) + 'px';
                highlight.style.top = (rect.top + globalThis.window.scrollY) + 'px';
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

if (DEBUG) console.log('Advanced Web Security Scanner Pro content script loaded');

var lastUrl = globalThis.location.href;
new MutationObserver(() => {
    const url = globalThis.location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        scanResults = null;
        document.querySelectorAll('[id^="security-highlight-"]').forEach(h => h.remove());
    }
}).observe(document, { subtree: true, childList: true }); 
    })();
} 