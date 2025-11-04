let scanResults = new Map();
let activeScans = new Set();
let scanTimeouts = new Map();
let scanRetries = new Map(); 
let whitelist = [];


const SCAN_TIMEOUT_MS = 60000; 
const MAX_SCAN_RETRIES = 2;
const SCRIPT_INJECTION_TIMEOUT = 10000;
const CONTENT_SCRIPT_READY_TIMEOUT = 5000;


async function loadWhitelist() {
    try {
        const settings = await chrome.storage.sync.get(['whitelist']);
        whitelist = settings.whitelist || [];
        console.log('Whitelist loaded:', whitelist);
    } catch (error) {
        console.error('Error loading whitelist:', error);
        whitelist = [];
    }
}


function isWhitelisted(url) {
    if (!url || whitelist.length === 0) return false;
    
    try {
        const hostname = new URL(url).hostname;
        return whitelist.includes(hostname);
    } catch (error) {
        console.error('Error checking whitelist for URL:', url, error);
        return false;
    }
}


chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Advanced Web Security Scanner Pro installed');
        
        chrome.storage.sync.set({
            autoScan: true,
            scanDelay: 2000,
            showNotifications: true,
            showHighlights: true,
            hideBubble: false,
            whitelist: [],
            hardeningLevel: 'off'
        });
        
        loadWhitelist();
    } else if (details.reason === 'update') {
        console.log('Advanced Web Security Scanner Pro updated to version', chrome.runtime.getManifest().version);
        
        loadWhitelist();
    }
});


loadWhitelist();


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        
        if (isWhitelisted(tab.url)) {
            console.log('Skipping scan for whitelisted site:', tab.url);
            
            if (chrome.action) {
                chrome.action.setBadgeText({
                    tabId: tabId,
                    text: '⚪'
                });
                chrome.action.setBadgeBackgroundColor({
                    tabId: tabId,
                    color: '#718096'
                });
            }
            return;
        }
        
        
        try {
            const settings = await chrome.storage.sync.get(['autoScan', 'scanDelay']);
            
            if (settings.autoScan !== false) {
                
                setTimeout(() => {
                    startScan(tabId, tab.url);
                }, settings.scanDelay || 2000);
            }
        } catch (error) {
            console.error('Error checking settings:', error);
        }
    }
});


async function startScan(tabId, url, allowManual = false) {
    if (activeScans.has(tabId)) {
        console.log('Scan already in progress for tab:', tabId);
        return; 
    }
    
    
    if (!canScanUrl(url)) {
        console.log('Cannot scan this URL:', url);
        
        if (chrome.action) {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: '–'
            });
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#718096'
            });
        }
        return;
    }
    
    
    if (!allowManual && isWhitelisted(url)) {
        console.log('Skipping auto-scan for whitelisted site:', url);
        
        if (chrome.action) {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: '⚪'
            });
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#718096'
            });
        }
        return;
    }
    
    activeScans.add(tabId);
    
    try {
        
        const settings = await chrome.storage.sync.get([
            'hideBubble', 
            'showHighlights'
        ]);
        
        
        if (chrome.action) {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: '...'
            });
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#ed8936'
            });
        }
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        
        const contentScriptReady = await injectContentScriptWithRetry(tabId);
        
        
        await injectScannerScriptWithRetry(tabId);
        
        
        await sendSettingsToScanner(tabId, settings, contentScriptReady);
        
        
        const scanTimeout = setTimeout(() => {
            console.log('Scan timeout - no completion signal received within', SCAN_TIMEOUT_MS / 1000, 'seconds');
            handleScanTimeout(tabId, url);
        }, SCAN_TIMEOUT_MS);
        
        
        scanTimeouts.set(tabId, scanTimeout);
        
        console.log('Scanner injection completed, waiting for scan results...');
        
    } catch (error) {
        console.error('Failed to start scan:', error);
        await handleScanError(tabId, url, error);
    }
}


async function injectContentScriptWithRetry(tabId, retryCount = 0) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        
        
        const testResponse = await Promise.race([
            chrome.tabs.sendMessage(tabId, { type: 'PING' }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Content script ping timeout')), CONTENT_SCRIPT_READY_TIMEOUT)
            )
        ]);
        
        console.log('Content script injected and ready');
        return true;
        
    } catch (error) {
        console.log('Content script injection attempt', retryCount + 1, 'failed:', error.message);
        
        if (retryCount < MAX_SCAN_RETRIES) {
            console.log('Retrying content script injection...');
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            return await injectContentScriptWithRetry(tabId, retryCount + 1);
        }
        
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: createFallbackContentScript
            });
            console.log('Fallback content script injected');
            return true;
        } catch (fallbackError) {
            console.error('All content script injection methods failed:', fallbackError);
            return false;
        }
    }
}


async function injectScannerScriptWithRetry(tabId, retryCount = 0) {
    try {
        await Promise.race([
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['scanner.js']
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Scanner injection timeout')), SCRIPT_INJECTION_TIMEOUT)
            )
        ]);
        
        console.log('Scanner script injected successfully');
        return true;
        
    } catch (error) {
        console.error('Scanner injection attempt', retryCount + 1, 'failed:', error);
        
        if (retryCount < MAX_SCAN_RETRIES) {
            console.log('Retrying scanner injection...');
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            return await injectScannerScriptWithRetry(tabId, retryCount + 1);
        }
        
        throw new Error(`Scanner injection failed after ${MAX_SCAN_RETRIES + 1} attempts: ${error.message}`);
    }
}


async function sendSettingsToScanner(tabId, settings, contentScriptReady) {
    if (!contentScriptReady) {
        console.log('Content script not ready, scanner will use default settings');
        return;
    }
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                type: 'UPDATE_SCANNER_SETTINGS',
                settings: settings
            });
            console.log('Settings sent to scanner successfully');
            return;
        } catch (error) {
            attempts++;
            console.log(`Settings update attempt ${attempts} failed:`, error.message);
            
            if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    console.log('Failed to send settings after', maxAttempts, 'attempts, scanner will use defaults');
}


function handleScanTimeout(tabId, url) {
    activeScans.delete(tabId);
    
    
    if (chrome.action) {
        chrome.action.setBadgeText({
            tabId: tabId,
            text: '⏱'
        });
        chrome.action.setBadgeBackgroundColor({
            tabId: tabId,
            color: '#d69e2e'
        });
    }
    
    
    const fallbackResult = {
        url: url,
        vulnerabilityCount: 0,
        issues: [],
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        timestamp: Date.now(),
        error: `Scan timeout after ${SCAN_TIMEOUT_MS / 1000} seconds - page may be too complex or unresponsive`
    };
    
    scanResults.set(tabId, fallbackResult);
    console.log('Scan timeout handled for tab:', tabId);
}


async function handleScanError(tabId, url, error) {
    activeScans.delete(tabId);
    
    
    const timeout = scanTimeouts.get(tabId);
    if (timeout) {
        clearTimeout(timeout);
        scanTimeouts.delete(tabId);
    }
    
    
    if (chrome.action) {
        chrome.action.setBadgeText({
            tabId: tabId,
            text: '✗'
        });
        chrome.action.setBadgeBackgroundColor({
            tabId: tabId,
            color: '#c53030'
        });
    }
    
    
    const errorResult = {
        url: url,
        vulnerabilityCount: 0,
        issues: [],
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        timestamp: Date.now(),
        error: `Scanner failed: ${error.message}`,
        errorDetails: {
            type: error.name || 'UnknownError',
            stack: error.stack,
            timestamp: Date.now()
        }
    };
    
    scanResults.set(tabId, errorResult);
    console.error('Scan error handled for tab:', tabId, error);
}


function createFallbackContentScript() {
    
    if (!window.contentScriptReady) {
        window.contentScriptReady = true;
        
        
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                switch (message.type) {
                    case 'PING':
                        sendResponse({ success: true });
                        break;
                    case 'UPDATE_SCANNER_SETTINGS':
                        
                        window.dispatchEvent(new CustomEvent('updateScannerSettings', {
                            detail: message.settings
                        }));
                        sendResponse({ success: true });
                        break;
                    case 'TRIGGER_MANUAL_SCAN':
                        
                        window.dispatchEvent(new CustomEvent('manualScanTrigger'));
                        sendResponse({ success: true });
                        break;
                    case 'STOP_SCANNER':
                        
                        window.dispatchEvent(new CustomEvent('stopScanner'));
                        sendResponse({ success: true });
                        break;
                    default:
                        sendResponse({ success: false, error: 'Unknown message type' });
                }
            } catch (error) {
                console.error('Content script message handler error:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true;
        });
        
        
        window.addEventListener('securityScanProgress', (event) => {
            try {
                chrome.runtime.sendMessage({
                    type: 'SCAN_PROGRESS',
                    data: event.detail
                });
            } catch (error) {
                console.error('Failed to send scan progress:', error);
            }
        });

        window.addEventListener('securityScanComplete', (event) => {
            try {
                chrome.runtime.sendMessage({
                    type: 'SCAN_COMPLETE',
                    data: event.detail
                });
            } catch (error) {
                console.error('Failed to send scan complete:', error);
            }
        });
        
        console.log('Fallback content script initialized');
    }
}


function canScanUrl(url) {
    if (!url) return false;
    
    const unscannable = [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'about:',
        'file://',
        'data:',
        'blob:',
        'javascript:'
    ];
    
    return !unscannable.some(prefix => url.startsWith(prefix));
}


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    
    switch (message.type) {
        case 'SCAN_COMPLETE':
            handleScanComplete(tabId, message.data);
            break;
            
        case 'SCAN_PROGRESS':
            handleScanProgress(tabId, message.data);
            break;
            
        case 'GET_SCAN_RESULTS':
            sendResponse(scanResults.get(tabId) || null);
            break;
            
        case 'CLEAR_SCAN_RESULTS':
            clearScanResults(tabId);
            break;
            
        case 'START_MANUAL_SCAN':
            
            handleManualScan(tabId, sender);
            break;
            
        case 'WHITELIST_UPDATED':
            
            await loadWhitelist();
            console.log('Whitelist reloaded:', whitelist);
            
            
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    if (tab.url && isWhitelisted(tab.url)) {
                        console.log('Stopping scan for newly whitelisted site:', tab.url);
                        
                        
                        activeScans.delete(tab.id);
                        
                        
                        const timeout = scanTimeouts.get(tab.id);
                        if (timeout) {
                            clearTimeout(timeout);
                            scanTimeouts.delete(tab.id);
                        }
                        
                        
                        if (chrome.action) {
                            chrome.action.setBadgeText({
                                tabId: tab.id,
                                text: '⚪'
                            });
                            chrome.action.setBadgeBackgroundColor({
                                tabId: tab.id,
                                color: '#718096'
                            });
                        }
                        
                        
                        try {
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'STOP_SCANNER'
                            });
                        } catch (error) {
                            
                        }
                    }
                });
            });
            
            sendResponse({ success: true });
            break;
            
        case 'SETTINGS_UPDATED':
            handleSettingsUpdate(message.setting, message.value);
            sendResponse({ success: true });
            break;
            
        case 'UPDATE_HARDENING_LEVEL':
            
            try {
                await chrome.storage.sync.set({
                    hardeningLevel: message.level
                });
                
                
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        if (canScanUrl(tab.url)) {
                            try {
                                chrome.tabs.sendMessage(tab.id, {
                                    type: 'UPDATE_HARDENING',
                                    level: message.level
                                });
                            } catch (error) {
                                
                            }
                        }
                    });
                });
                
                sendResponse({ success: true });
            } catch (error) {
                console.error('Failed to update hardening level:', error);
                sendResponse({ success: false, error: error.message });
            }
            break;
    }
    
    return true; 
});


async function handleManualScan(tabId, sender) {
    
    if (!tabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs[0]) {
                
                try {
                    await chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'TRIGGER_MANUAL_SCAN'
                    });
                } catch (error) {
                    console.log('Content script not ready, proceeding with direct scan');
                }
                
                startScan(tabs[0].id, tabs[0].url, true);
            }
        });
    } else {
        
        try {
            await chrome.tabs.sendMessage(tabId, {
                type: 'TRIGGER_MANUAL_SCAN'
            });
        } catch (error) {
            console.log('Content script not ready, proceeding with direct scan');
        }
        
        startScan(tabId, sender.tab.url, true);
    }
}


function handleScanComplete(tabId, data) {
    
    const timeout = scanTimeouts.get(tabId);
    if (timeout) {
        clearTimeout(timeout);
        scanTimeouts.delete(tabId);
    }
    
    activeScans.delete(tabId);
    
    
    const completeData = {
        ...data,
        timestamp: data.timestamp || Date.now(),
        url: data.url || 'unknown'
    };
    
    scanResults.set(tabId, completeData);
    
    
    updateBadge(tabId, completeData.vulnerabilityCount || 0);
    
    
    showNotification(tabId, completeData);
    
    console.log(`Scan completed for tab ${tabId} with ${completeData.vulnerabilityCount || 0} issues in ${completeData.duration ? (completeData.duration / 1000).toFixed(2) + 's' : 'unknown time'}`);
}


function handleScanProgress(tabId, data) {
    
    if (data.vulnerabilityCount > 0) {
        updateBadge(tabId, data.vulnerabilityCount);
    }
}


function updateBadge(tabId, count) {
    if (!chrome.action) return;
    
    try {
        if (count === 0) {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: '✓'
            });
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#38a169'
            });
        } else {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: count > 99 ? '99+' : count.toString()
            });
            
            
            const color = count >= 5 ? '#c53030' : count >= 2 ? '#dd6b20' : '#d69e2e';
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: color
            });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}


async function showNotification(tabId, data) {
    if (!chrome.notifications) return;
    
    try {
        const settings = await chrome.storage.sync.get(['showNotifications']);
        if (!settings.showNotifications) return;
        
        const count = data.vulnerabilityCount || 0;
        let title, message;
        
        if (count === 0) {
            title = 'Security Scan Complete';
            message = 'No security issues detected on this page.';
        } else {
            title = `${count} Security Issue${count > 1 ? 's' : ''} Found`;
            const critical = data.severityCounts?.critical || 0;
            const high = data.severityCounts?.high || 0;
            
            if (critical > 0) {
                message = `${critical} critical issue${critical > 1 ? 's' : ''} detected. Click to view details.`;
            } else if (high > 0) {
                message = `${high} high-priority issue${high > 1 ? 's' : ''} detected. Click to view details.`;
            } else {
                message = 'Security issues detected. Click to view details.';
            }
        }
        
        chrome.notifications.create(`scan-${tabId}`, {
            type: 'basic',
            iconUrl: 'icon48.png',
            title: title,
            message: message
        });
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}


function clearScanResults(tabId) {
    scanResults.delete(tabId);
    if (chrome.action) {
        try {
            chrome.action.setBadgeText({
                tabId: tabId,
                text: ''
            });
        } catch (error) {
            console.error('Error clearing badge:', error);
        }
    }
}


chrome.tabs.onRemoved.addListener((tabId) => {
    
    const timeout = scanTimeouts.get(tabId);
    if (timeout) {
        clearTimeout(timeout);
        scanTimeouts.delete(tabId);
    }
    
    activeScans.delete(tabId);
    scanResults.delete(tabId);
    
    console.log(`Cleaned up resources for removed tab ${tabId}`);
});


if (chrome.notifications) {
    chrome.notifications.onClicked.addListener((notificationId) => {
        if (notificationId.startsWith('scan-')) {
            const tabId = parseInt(notificationId.replace('scan-', ''));
            chrome.tabs.update(tabId, { active: true });
            chrome.notifications.clear(notificationId);
        }
    });
}


setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; 
    
    for (const [tabId, result] of scanResults.entries()) {
        if (now - result.timestamp > maxAge) {
            scanResults.delete(tabId);
        }
    }
}, 60 * 60 * 1000); 


async function handleSettingsUpdate(setting, value) {
    console.log(`Setting ${setting} updated to:`, value);
    
    
    if (['hideBubble', 'showHighlights'].includes(setting)) {
        const settings = await chrome.storage.sync.get([
            'hideBubble', 
            'showHighlights'
        ]);
        
        
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_SCANNER_SETTINGS',
                    settings: settings
                });
            } catch (error) {
                
            }
        }
    }
    
    
    if (setting === 'hardeningLevel') {
        
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (canScanUrl(tab.url)) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        type: 'UPDATE_HARDENING',
                        level: value
                    });
                } catch (error) {
                    
                }
            }
        }
    }
} 