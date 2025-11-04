import {FEEDBACK_API_URL} from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const domainInfo = document.getElementById('domainInfo');
    const scanButton = document.getElementById('scanButton');
    const content = document.getElementById('content');
    const resultsSummary = document.getElementById('resultsSummary');
    const issuesList = document.getElementById('issuesList');
    const noIssues = document.getElementById('noIssues');
    const scanUrl = document.getElementById('scanUrl');
    const autoScanToggle = document.getElementById('autoScanToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const highlightToggle = document.getElementById('highlightToggle');
    const hideBubbleToggle = document.getElementById('hideBubbleToggle');


    const addToWhitelistBtn = document.getElementById('addToWhitelistBtn');
    const whitelistItems = document.getElementById('whitelistItems');
    const noWhitelistItems = document.getElementById('noWhitelistItems');
    const clearWhitelistBtn = document.getElementById('clearWhitelistBtn');

   
    const openProxyBtn = document.getElementById('openProxyBtn');

   
    const hardeningStatus = document.getElementById('hardeningStatus');
    const hardeningMegaBtn = document.getElementById('hardeningMegaBtn');
    const hardeningMediumBtn = document.getElementById('hardeningMediumBtn');
    const hardeningLowBtn = document.getElementById('hardeningLowBtn');
    const hardeningOffBtn = document.getElementById('hardeningOffBtn');
    const hardeningInfo = document.getElementById('hardeningInfo');
    const hardeningInfoTitle = document.getElementById('hardeningInfoTitle');
    const hardeningInfoDesc = document.getElementById('hardeningInfoDesc');
    const hardeningInfoDetails = document.getElementById('hardeningInfoDetails');
    const hardeningStats = document.getElementById('hardeningStats');
    const blockedElementsCount = document.getElementById('blockedElementsCount');

    let highlightedIssues = new Set();
    let currentTab = null;
    let currentWhitelist = [];
    let currentHardeningLevel = 'off';


    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    

    if (currentTab && currentTab.url) {
        try {
            const url = new URL(currentTab.url);
            domainInfo.textContent = url.hostname;
        } catch (e) {
            domainInfo.textContent = 'Unknown domain';
        }
    }
    

    const settings = await chrome.storage.sync.get([
        'autoScan',
        'showNotifications', 
        'showHighlights',
        'hideBubble',
        'whitelist',
        'hardeningLevel'
    ]);
    

    autoScanToggle.classList.toggle('active', settings.autoScan !== false);
    notificationsToggle.classList.toggle('active', settings.showNotifications !== false);
    highlightToggle.classList.toggle('active', settings.showHighlights !== false);
    hideBubbleToggle.classList.toggle('active', settings.hideBubble === true);

   
    currentHardeningLevel = settings.hardeningLevel || 'off';
    updateHardeningUI(currentHardeningLevel);


    currentWhitelist = settings.whitelist || [];
    displayWhitelist();
    updateAddToWhitelistButton();


    loadScanResults();
    loadCommunityStats();

    loadHardeningStatus();


    scanButton.addEventListener('click', startManualScan);
    autoScanToggle.addEventListener('click', toggleAutoScan);
    notificationsToggle.addEventListener('click', toggleNotifications);
    highlightToggle.addEventListener('click', toggleHighlights);
    hideBubbleToggle.addEventListener('click', toggleHideBubble);
    addToWhitelistBtn.addEventListener('click', addCurrentSiteToWhitelist);
    clearWhitelistBtn.addEventListener('click', clearAllWhitelist);

   
    openProxyBtn.addEventListener('click', openViaProxy);

   
    hardeningMegaBtn.addEventListener('click', () => setHardeningLevel('mega'));
    hardeningMediumBtn.addEventListener('click', () => setHardeningLevel('medium'));
    hardeningLowBtn.addEventListener('click', () => setHardeningLevel('low'));
    hardeningOffBtn.addEventListener('click', () => setHardeningLevel('off'));

    const clearHighlightsBtn = document.getElementById('clearHighlightsBtn');
    clearHighlightsBtn.addEventListener('click', clearAllHighlights);


    async function loadScanResults() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_SCAN_RESULTS'
            });

            if (response && response.vulnerabilityCount !== undefined) {
            
                if (response.error) {
                    showScanError(response.error);
                } else {
                    displayResults(response);
                }
            } else {
            
                showNoResults();
            }
        } catch (error) {
            console.error('Failed to load scan results:', error);
        
            showNoResults();
        }
    }


    async function startManualScan() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            showScanError('Cannot scan this page type');
            return;
        }

        scanButton.disabled = true;
        scanButton.textContent = 'Scanning...';
        statusText.textContent = 'Starting scan...';
        statusIndicator.className = 'status-indicator scanning';
        
        try {
            await chrome.runtime.sendMessage({
                type: 'START_MANUAL_SCAN'
            });
            
        
           
            const checkScanProgress = async () => {
                let attempts = 0;
                const maxAttempts = 90;
                let lastProgressTime = Date.now();
                let progressStalled = false;
                
                const progressInterval = setInterval(async () => {
                    attempts++;
                    
                    try {
                        const results = await chrome.runtime.sendMessage({
                            type: 'GET_SCAN_RESULTS'
                        });
                        
                        if (results && results.timestamp) {
                            clearInterval(progressInterval);
                            scanButton.disabled = false;
                            scanButton.textContent = 'Re-scan';
                            
                            if (results.error) {
                                showScanError(results.error);
                            } else {
                                displayResults(results);
                            }
                            return;
                        }
                        
                       
                        const elapsed = attempts;
                        if (elapsed <= 15) {
                            statusText.textContent = 'Initializing scan...';
                        } else if (elapsed <= 30) {
                            statusText.textContent = 'Analyzing security headers...';
                        } else if (elapsed <= 45) {
                            statusText.textContent = 'Checking SSL configuration...';
                        } else if (elapsed <= 60) {
                            statusText.textContent = 'Performing deep analysis...';
                        } else if (elapsed <= 75) {
                            statusText.textContent = 'Finalizing results...';
                        } else {
                            statusText.textContent = 'Completing scan...';
                        }
                        
                       
                        const now = Date.now();
                        if (now - lastProgressTime > 30000) {
                            if (!progressStalled) {
                                progressStalled = true;
                                statusText.textContent = 'Scan taking longer than expected...';
                                console.log('Scan progress appears stalled, but continuing to wait');
                            }
                        }
                        
                       
                        if (attempts >= maxAttempts) {
                            clearInterval(progressInterval);
                            scanButton.disabled = false;
                            scanButton.textContent = 'Re-scan';
                            
                            if (progressStalled) {
                                showScanError('Scan timeout - page may be too complex or unresponsive');
                            } else {
                                showScanError('Scan timeout - please try again');
                            }
                            statusText.textContent = 'Scan failed';
                            statusIndicator.className = 'status-indicator issues';
                        }
                        
                    } catch (error) {
                        console.error('Error checking scan progress:', error);
                        
                        if (attempts >= maxAttempts) {
                            clearInterval(progressInterval);
                            scanButton.disabled = false;
                            scanButton.textContent = 'Re-scan';
                            showScanError('Scan failed - please try again');
                            statusText.textContent = 'Scan failed';
                            statusIndicator.className = 'status-indicator issues';
                        }
                    }
                }, 1000);
            };
            
            checkScanProgress();
            
        } catch (error) {
            console.error('Failed to start scan:', error);
            scanButton.disabled = false;
            scanButton.textContent = 'Re-scan';
            showScanError('Failed to start scan');
            statusText.textContent = 'Scan failed';
            statusIndicator.className = 'status-indicator issues';
        }
    }


    function displayResults(results) {
        if (!results || results.vulnerabilityCount === 0) {
            showNoIssues();
            updateStatusWithCounts(0, {});
            window.currentIssues = [];
            return;
        }

    
        window.currentIssues = results.issues || [];

    
        resultsSummary.style.display = 'block';
        noIssues.style.display = 'none';

    
        const url = new URL(results.url || currentTab.url);
        scanUrl.textContent = url.hostname;

    
        const counts = results.severityCounts || {};
        document.getElementById('criticalCount').textContent = counts.critical || 0;
        document.getElementById('highCount').textContent = counts.high || 0;
        document.getElementById('mediumCount').textContent = counts.medium || 0;
        document.getElementById('lowCount').textContent = counts.low || 0;

    
        displayIssuesList(results.issues || []);

    
        updateStatusWithCounts(results.vulnerabilityCount, counts);
    }


    function displayIssuesList(issues) {
        issuesList.innerHTML = '';

    
        const sortedIssues = issues.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });

        sortedIssues.forEach((issue, index) => {
            const issueElement = document.createElement('div');
            issueElement.className = `issue-item ${issue.severity}`;
            
            const hasElements = issue.details?.evidence?.some(e => e.element || e.selector);
            const isHighlighted = highlightedIssues.has(index);
            
            issueElement.innerHTML = `
                <div class="issue-title">${issue.message}</div>
                <div class="issue-description">
                    ${issue.details?.description || 'Click for more information'}
                </div>
                <div class="issue-actions">
                    <div class="action-btn" data-action="details" data-index="${index}">
                        📋 Details
                    </div>
                    ${hasElements ? `
                        <div class="action-btn highlight ${isHighlighted ? 'active' : ''}" 
                             data-action="highlight" data-index="${index}">
                            ${isHighlighted ? '🔍 Hide' : '🎯 Highlight'}
                        </div>
                    ` : ''}
                </div>
            `;

            issueElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('action-btn')) {
                    const action = e.target.getAttribute('data-action');
                    const index = parseInt(e.target.getAttribute('data-index'));
                    
                    if (action === 'details') {
                        showIssueDetails(index);
                    } else if (action === 'highlight') {
                        toggleHighlight(index);
                    }
                } else {
                    showIssueDetails(index);
                }
            });

            issuesList.appendChild(issueElement);
        });
    }


    function showIssueDetails(issueIndex) {
        const issues = getCurrentIssues();
        if (!issues || !issues[issueIndex]) return;
        
        const issue = issues[issueIndex];
        
    
    
        let message = `${issue.message}\n\n`;
        if (issue.details?.description) {
            message += `Description: ${issue.details.description}\n\n`;
        }
        if (issue.details?.impact) {
            message += `Impact: ${issue.details.impact}\n\n`;
        }
        if (issue.details?.solution) {
            message += `Solution: ${issue.details.solution}`;
        }
        
        alert(message);
    }


    async function toggleHighlight(issueIndex) {
        if (!currentTab) return;
        
        const settings = await chrome.storage.sync.get(['showHighlights']);
        if (settings.showHighlights === false) {
            alert('Element highlighting is disabled in settings');
            return;
        }
        
        const issues = getCurrentIssues();
        if (!issues || !issues[issueIndex]) return;
        
        const issue = issues[issueIndex];
        const isHighlighted = highlightedIssues.has(issueIndex);
        
        try {
            if (isHighlighted) {
            
                await chrome.tabs.sendMessage(currentTab.id, {
                    type: 'REMOVE_HIGHLIGHT',
                    issueIndex: issueIndex
                });
                highlightedIssues.delete(issueIndex);
            } else {
            
                await chrome.tabs.sendMessage(currentTab.id, {
                    type: 'ADD_HIGHLIGHT',
                    issueIndex: issueIndex,
                    issue: issue
                });
                highlightedIssues.add(issueIndex);
            }
            
        
            const results = await chrome.runtime.sendMessage({
                type: 'GET_SCAN_RESULTS'
            });
            if (results) {
                displayResults(results);
            }
        } catch (error) {
            console.error('Failed to toggle highlight:', error);
            alert('Could not highlight elements on this page');
        }
    }


    function getCurrentIssues() {
    
        return window.currentIssues || [];
    }


    async function clearAllHighlights() {
        if (!currentTab) return;
        
        try {
            await chrome.tabs.sendMessage(currentTab.id, {
                type: 'CLEAR_ALL_HIGHLIGHTS'
            });
            highlightedIssues.clear();
        } catch (error) {
            console.error('Failed to clear highlights:', error);
        }
    }


    function showNoIssues() {
        resultsSummary.style.display = 'none';
        noIssues.style.display = 'block';
        issuesList.innerHTML = '';
    }


    function showNoResults() {
        resultsSummary.style.display = 'none';
        noIssues.style.display = 'none';
        statusText.textContent = 'Click to scan';
        statusIndicator.className = 'status-indicator';
        scanButton.textContent = 'Scan Page';
    }


    function updateStatus(text, type) {
        statusText.textContent = text;
        statusIndicator.className = 'status-indicator';
        
        switch (type) {
            case 'scanning':
                statusIndicator.classList.add('scanning');
                break;
            case 'error':
            case 'warning':
                statusIndicator.classList.add('issues');
                break;
            case 'safe':
            
                break;
            case 'ready':
            default:
                statusIndicator.style.background = '#718096';
                break;
        }
    }


    function getHighestSeverity(counts) {
        if (counts.critical > 0) return 'critical';
        if (counts.high > 0) return 'high';
        if (counts.medium > 0) return 'medium';
        if (counts.low > 0) return 'low';
        return 'none';
    }


    async function toggleAutoScan() {
        const isActive = autoScanToggle.classList.contains('active');
        autoScanToggle.classList.toggle('active');
        
        const newValue = !isActive;
        await chrome.storage.sync.set({
            autoScan: newValue
        });
        
    
        try {
            await chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                setting: 'autoScan',
                value: newValue
            });
        } catch (error) {
            console.error('Failed to notify background of auto-scan change:', error);
        }
        
        console.log('Auto-scan setting changed to:', newValue);
    }


    async function toggleNotifications() {
        const isActive = notificationsToggle.classList.contains('active');
        notificationsToggle.classList.toggle('active');
        
        const newValue = !isActive;
        await chrome.storage.sync.set({
            showNotifications: newValue
        });
        
    
        try {
            await chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                setting: 'showNotifications',
                value: newValue
            });
        } catch (error) {
            console.error('Failed to notify background of notifications change:', error);
        }
        
        console.log('Notifications setting changed to:', newValue);
    }


    async function toggleHighlights() {
        const isActive = highlightToggle.classList.contains('active');
        highlightToggle.classList.toggle('active');
        
        const newValue = !isActive;
        await chrome.storage.sync.set({
            showHighlights: newValue
        });
        
    
        await updateScannerSettings();
        
    
        if (!newValue) {
            await clearAllHighlights();
        }
        
        console.log('Highlights setting changed to:', newValue);
    }


    async function toggleHideBubble() {
        const isActive = hideBubbleToggle.classList.contains('active');
        hideBubbleToggle.classList.toggle('active');
        
        const newValue = !isActive;
        await chrome.storage.sync.set({
            hideBubble: newValue
        });
        
    
        await updateScannerSettings();
        
        console.log('Hide bubble setting changed to:', newValue);
    }
    

    async function updateScannerSettings() {
        if (!currentTab) return;
        
        try {
        
            const settings = await chrome.storage.sync.get([
                'showHighlights', 
                'hideBubble'
            ]);
            
        
            await chrome.tabs.sendMessage(currentTab.id, {
                type: 'UPDATE_SCANNER_SETTINGS',
                settings: settings
            });
            
            console.log('Scanner settings updated:', settings);
        } catch (error) {
            console.error('Failed to update scanner settings:', error);
        }
    }


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SCAN_PROGRESS') {
            const progressText = message.data.currentCheck || 'Scanning...';
            updateStatus(progressText, 'scanning');
        } else if (message.type === 'SCAN_COMPLETE') {
        
            setTimeout(() => {
                loadScanResults();
                updateStatus('Scan completed', 'ready');
                scanButton.disabled = false;
            }, 500);
        }
        
        return true;
    });


    if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        updateStatus('Cannot scan this page', 'error');
        scanButton.disabled = true;
        
        const warning = document.createElement('div');
        warning.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 12px;
            border-radius: 8px;
            margin: 16px 0;
            font-size: 12px;
            text-align: center;
        `;
        warning.textContent = 'Security scanning is not available on Chrome internal pages';
        content.insertBefore(warning, content.firstChild);
    }


    function showScanError(errorMessage) {
        resultsSummary.style.display = 'none';
        noIssues.style.display = 'none';
        issuesList.innerHTML = '';
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            border: 1px solid #fc8181;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 8px;">⚠️</div>
            <div style="font-weight: 700; margin-bottom: 4px;">Scan Error</div>
            <div style="font-size: 12px;">${errorMessage}</div>
        `;
        
        issuesList.appendChild(errorDiv);
        updateStatus('Error', 'error');
    }


    function canScanPage(url) {
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


    function displayWhitelist() {
        whitelistItems.innerHTML = '';

        if (currentWhitelist.length === 0) {
            noWhitelistItems.style.display = 'block';
            return;
        }

        noWhitelistItems.style.display = 'none';

        currentWhitelist.forEach((site, index) => {
            const siteElement = document.createElement('div');
            siteElement.className = 'whitelist-item';
            
            const domainSpan = document.createElement('span');
            domainSpan.className = 'whitelist-domain';
            domainSpan.textContent = site;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-whitelist-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                removeFromWhitelist(index);
            });

            siteElement.appendChild(domainSpan);
            siteElement.appendChild(removeBtn);
            whitelistItems.appendChild(siteElement);
        });
    }


    function updateAddToWhitelistButton() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            addToWhitelistBtn.disabled = true;
            addToWhitelistBtn.textContent = 'Cannot Add';
            return;
        }

        const site = new URL(currentTab.url).hostname;
        const isWhitelisted = currentWhitelist.includes(site);
        
        addToWhitelistBtn.disabled = isWhitelisted || currentWhitelist.length >= 50;
        addToWhitelistBtn.textContent = isWhitelisted ? 'Already Added' : 'Add Current Site';
        
        if (isWhitelisted) {
            addToWhitelistBtn.style.background = '#fed7d7';
            addToWhitelistBtn.style.borderColor = '#fc8181';
            addToWhitelistBtn.style.color = '#c53030';
        } else {
            addToWhitelistBtn.style.background = '#e6fffa';
            addToWhitelistBtn.style.borderColor = '#38a169';
            addToWhitelistBtn.style.color = '#38a169';
        }
    }

    function updateProxyButton() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            openProxyBtn.disabled = true;
            openProxyBtn.textContent = '🌐 Cannot Proxy';
            openProxyBtn.style.background = '#fed7d7';
            openProxyBtn.style.borderColor = '#fc8181';
            openProxyBtn.style.color = '#c53030';
            return;
        }

        openProxyBtn.disabled = false;
        openProxyBtn.textContent = '🌐 Open via Proxyium';
        openProxyBtn.style.background = '#ebf8ff';
        openProxyBtn.style.borderColor = '#3182ce';
        openProxyBtn.style.color = '#3182ce';
    }


    async function addCurrentSiteToWhitelist() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            showScanError('Cannot whitelist this page type');
            return;
        }

        const site = new URL(currentTab.url).hostname;
        if (currentWhitelist.includes(site)) {
            showScanError('This site is already in the whitelist');
            return;
        }

        if (currentWhitelist.length >= 50) {
            showScanError('Whitelist is full (maximum 50 sites)');
            return;
        }

        currentWhitelist.push(site);
        await chrome.storage.sync.set({
            whitelist: currentWhitelist
        });
        
    
        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: currentWhitelist
        });
        
        displayWhitelist();
        updateAddToWhitelistButton();
        
    
        updateStatus(`Added ${site} to whitelist`, 'safe');
    }


    async function removeFromWhitelist(index) {
        const removedSite = currentWhitelist[index];
        currentWhitelist.splice(index, 1);
        
        await chrome.storage.sync.set({
            whitelist: currentWhitelist
        });
        
    
        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: currentWhitelist
        });
        
        displayWhitelist();
        updateAddToWhitelistButton();
        
    
        updateStatus(`Removed ${removedSite} from whitelist`, 'safe');
    }


    async function clearAllWhitelist() {
        currentWhitelist = [];
        await chrome.storage.sync.set({
            whitelist: currentWhitelist
        });
        
    
        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: currentWhitelist
        });
        
        displayWhitelist();
        updateAddToWhitelistButton();
        
    
        updateStatus('Whitelist cleared', 'safe');
    }


    function updateStatusWithCounts(totalCount, counts) {
        if (totalCount === 0) {
            statusText.textContent = 'No issues found';
            statusIndicator.className = 'status-indicator';
            return;
        }

    
        let statusParts = [];
        if (counts.critical > 0) statusParts.push(`${counts.critical} Critical`);
        if (counts.high > 0) statusParts.push(`${counts.high} High`);
        if (counts.medium > 0) statusParts.push(`${counts.medium} Medium`);
        if (counts.low > 0) statusParts.push(`${counts.low} Low`);

        if (statusParts.length > 0) {
            statusText.textContent = statusParts.join(', ');
        } else {
            statusText.textContent = `${totalCount} issue${totalCount > 1 ? 's' : ''} found`;
        }

    
        const highestSeverity = getHighestSeverity(counts);
        if (highestSeverity === 'critical') {
            statusIndicator.className = 'status-indicator issues';
        } else if (highestSeverity === 'high' || highestSeverity === 'medium') {
            statusIndicator.className = 'status-indicator scanning';
        } else {
            statusIndicator.className = 'status-indicator';
        }
    }


    const communityConfidence = document.getElementById('communityConfidence');
    const meterFill = document.getElementById('meterFill');
    const meterPercentage = document.getElementById('meterPercentage');
    const safeVotes = document.getElementById('safeVotes');
    const unsafeVotes = document.getElementById('unsafeVotes');
    const safeFeedbackBtn = document.getElementById('safeFeedbackBtn');
    const unsafeFeedbackBtn = document.getElementById('unsafeFeedbackBtn');
    const feedbackStatus = document.getElementById('feedbackStatus');


    loadCommunityStats();


    safeFeedbackBtn.addEventListener('click', () => submitFeedback(true));
    unsafeFeedbackBtn.addEventListener('click', () => submitFeedback(false));

    async function loadCommunityStats() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            showNoStatsAvailable();
            return;
        }
    
        try {
            const url = new URL(`${FEEDBACK_API_URL}/stats`);
            url.searchParams.append('url', currentTab.url);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.ok) {
                const stats = await response.json();
                displayCommunityStats(stats);
            } else {
                showNoStatsAvailable();
            }
        } catch (error) {
            console.error('Failed to load community stats:', error);
            showNoStatsAvailable();
        }
    }

    function displayCommunityStats(stats) {
    
        communityConfidence.textContent = stats.confidence_level;
        
    
        const percentage = stats.safety_percentage;
        meterFill.style.width = `${100 - percentage}%`;
        meterPercentage.textContent = `${percentage}% Safe`;
        
    
        safeVotes.textContent = `👍 ${stats.safe_votes}`;
        unsafeVotes.textContent = `👎 ${stats.unsafe_votes}`;
        
    
        const confidence = stats.confidence_level.toLowerCase();
        if (confidence.includes('very high') || confidence.includes('high')) {
            communityConfidence.style.background = '#c6f6d5';
            communityConfidence.style.color = '#2f855a';
            communityConfidence.style.borderColor = '#9ae6b4';
        } else if (confidence.includes('medium')) {
            communityConfidence.style.background = '#fef5e7';
            communityConfidence.style.color = '#c05621';
            communityConfidence.style.borderColor = '#fbd38d';
        } else {
            communityConfidence.style.background = '#fed7d7';
            communityConfidence.style.color = '#c53030';
            communityConfidence.style.borderColor = '#fc8181';
        }
        
    
        if (percentage >= 70) {
            meterFill.style.background = 'rgba(56, 161, 105, 0.3)';
        } else if (percentage >= 40) {
            meterFill.style.background = 'rgba(214, 158, 46, 0.3)';
        } else {
            meterFill.style.background = 'rgba(229, 62, 62, 0.3)';
        }
    }

    function showNoStatsAvailable() {
        communityConfidence.textContent = 'No Data';
        meterPercentage.textContent = '--';
        safeVotes.textContent = '👍 0';
        unsafeVotes.textContent = '👎 0';
        meterFill.style.width = '0%';
        
        communityConfidence.style.background = '#f7fafc';
        communityConfidence.style.color = '#4a5568';
        communityConfidence.style.borderColor = '#e2e8f0';
    }

    async function submitFeedback(isSafe) {
        if (!currentTab || !canScanPage(currentTab.url)) {
            feedbackStatus.textContent = 'Cannot submit feedback for this page';
            feedbackStatus.className = 'feedback-status error';
            return;
        }

    
        safeFeedbackBtn.disabled = true;
        unsafeFeedbackBtn.disabled = true;
        feedbackStatus.textContent = 'Submitting feedback...';
        feedbackStatus.className = 'feedback-status loading';

        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: currentTab.url,
                    is_safe: isSafe,
                    user_agent: navigator.userAgent
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                feedbackStatus.textContent = 'Thank you for your feedback!';
                feedbackStatus.className = 'feedback-status success';
                
            
                if (isSafe) {
                    safeFeedbackBtn.classList.add('active');
                    unsafeFeedbackBtn.classList.remove('active');
                } else {
                    unsafeFeedbackBtn.classList.add('active');
                    safeFeedbackBtn.classList.remove('active');
                }
                
            
                setTimeout(() => {
                    loadCommunityStats();
                }, 1000);
                
            } else {
            
                feedbackStatus.textContent = result.message || 'Failed to submit feedback';
                feedbackStatus.className = 'feedback-status error';
                
            
                if (result.message && result.message.includes('already submitted')) {
                    feedbackStatus.textContent = 'You have already voted for this website';
                    feedbackStatus.className = 'feedback-status error';
                }
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            feedbackStatus.textContent = 'Network error occurred';
            feedbackStatus.className = 'feedback-status error';
        } finally {
        
            setTimeout(() => {
                safeFeedbackBtn.disabled = false;
                unsafeFeedbackBtn.disabled = false;
            }, 2000);
        }
    }

    async function generateUserHash(seed) {
        const encoder = new TextEncoder();
        const data = encoder.encode(seed + navigator.userAgent + Date.now());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }

   
    let currentWebsiteTags = {};
    let selectedQuickTags = new Set();

   
    const TAGS_API_BASE = 'https://api.blowfish-security.com/v1/tags';

   
    const MOCK_TAGS_DATA = {
        'example.com': {
            security: [
                { name: 'safe', votes: { up: 45, down: 2 }, verified: true },
                { name: 'https', votes: { up: 23, down: 0 }, verified: true }
            ],
            privacy: [
                { name: 'tracking', votes: { up: 12, down: 8 }, verified: false },
                { name: 'cookies', votes: { up: 15, down: 3 }, verified: false }
            ],
            advertising: [
                { name: 'minimal-ads', votes: { up: 18, down: 4 }, verified: false }
            ],
            technical: [
                { name: 'fast-loading', votes: { up: 32, down: 1 }, verified: true }
            ],
            other: []
        },
        'github.com': {
            security: [
                { name: 'secure', votes: { up: 156, down: 1 }, verified: true },
                { name: 'open-source', votes: { up: 89, down: 0 }, verified: true }
            ],
            privacy: [
                { name: 'privacy-friendly', votes: { up: 67, down: 5 }, verified: true }
            ],
            advertising: [],
            technical: [
                { name: 'developer-tools', votes: { up: 123, down: 2 }, verified: true },
                { name: 'reliable', votes: { up: 98, down: 1 }, verified: true }
            ],
            other: [
                { name: 'educational', votes: { up: 76, down: 0 }, verified: false }
            ]
        }
    };


   
    function setupEventListeners() {
       
        document.getElementById('scanButton').addEventListener('click', startManualScan);
        
       
        const clearHighlightsBtn = document.getElementById('clearHighlightsBtn');
        if (clearHighlightsBtn) {
            clearHighlightsBtn.addEventListener('click', clearAllHighlights);
        }

       
        document.getElementById('autoScanToggle').addEventListener('click', toggleAutoScan);
        document.getElementById('notificationsToggle').addEventListener('click', toggleNotifications);
        document.getElementById('highlightToggle').addEventListener('click', toggleHighlights);
        document.getElementById('hideBubbleToggle').addEventListener('click', toggleHideBubble);

       
        document.getElementById('addToWhitelistBtn').addEventListener('click', addCurrentSiteToWhitelist);
        document.getElementById('clearWhitelistBtn').addEventListener('click', clearAllWhitelist);

       
        document.getElementById('safeFeedbackBtn').addEventListener('click', () => submitFeedback(true));
        document.getElementById('unsafeFeedbackBtn').addEventListener('click', () => submitFeedback(false));

       
        document.getElementById('openProxyBtn').addEventListener('click', openViaProxy);
    }

   
    document.addEventListener('DOMContentLoaded', () => {
        loadScanResults();
        loadCommunityStats();
        updateAddToWhitelistButton();
        updateProxyButton();
        displayWhitelist();
        
       
        chrome.storage.sync.get([
            'autoScan', 
            'showNotifications', 
            'showHighlights', 
            'hideBubble'
        ], (settings) => {
           
            document.getElementById('autoScanToggle').classList.toggle('active', settings.autoScan !== false);
            document.getElementById('notificationsToggle').classList.toggle('active', settings.showNotifications !== false);
            document.getElementById('highlightToggle').classList.toggle('active', settings.showHighlights !== false);
            document.getElementById('hideBubbleToggle').classList.toggle('active', settings.hideBubble === true);
        });
        
       
        setupEventListeners();
        setupTagsEventListeners();
    });

   
    function openViaProxy() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            showScanError('Cannot proxy this page type');
            return;
        }

        showProxyWarningModal();
    }

    function showProxyWarningModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Ubuntu Mono', monospace;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 350px;
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;

        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                <div style="font-size: 18px; font-weight: 700; color: #c53030; margin-bottom: 8px;">
                    Security Warning
                </div>
                <div style="font-size: 14px; color: #2d3748; line-height: 1.5;">
                    You are about to access this website through Proxyium.
                </div>
            </div>
            
            <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="font-weight: 700; color: #c53030; margin-bottom: 8px; font-size: 14px;">
                    Important Security Notice:
                </div>
                <ul style="color: #c53030; font-size: 12px; line-height: 1.4; margin-left: 16px;">
                    <li>Proxyium can intercept and view your data</li>
                    <li>Do NOT enter passwords, credit card details, or personal information</li>
                    <li>Use only for browsing and basic safety testing</li>
                    <li>Your IP address will be hidden from the target website</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button id="cancelProxy" style="
                    flex: 1;
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    background: #f7fafc;
                    color: #4a5568;
                    border-radius: 8px;
                    font-family: 'Ubuntu Mono', monospace;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">
                    Cancel
                </button>
                <button id="proceedProxy" style="
                    flex: 1;
                    padding: 12px;
                    border: 2px solid #c53030;
                    background: #c53030;
                    color: white;
                    border-radius: 8px;
                    font-family: 'Ubuntu Mono', monospace;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">
                    I Understand, Proceed
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

       
        const cancelBtn = modal.querySelector('#cancelProxy');
        const proceedBtn = modal.querySelector('#proceedProxy');

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#edf2f7';
            cancelBtn.style.borderColor = '#cbd5e0';
        });

        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = '#f7fafc';
            cancelBtn.style.borderColor = '#e2e8f0';
        });

        proceedBtn.addEventListener('mouseenter', () => {
            proceedBtn.style.background = '#9c2626';
            proceedBtn.style.borderColor = '#9c2626';
        });

        proceedBtn.addEventListener('mouseleave', () => {
            proceedBtn.style.background = '#c53030';
            proceedBtn.style.borderColor = '#c53030';
        });

       
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        proceedBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            proceedWithProxy();
        });

       
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function proceedWithProxy() {
       
        updateStatus('Opening via Proxyium...', 'safe');
        
       
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://cdn.proxyium.com/proxyrequest.php';
        form.target = '_blank';
        form.style.display = 'none';
        
       
        const urlInput = document.createElement('input');
        urlInput.type = 'hidden';
        urlInput.name = 'url';
        urlInput.value = currentTab.url;
        
        form.appendChild(urlInput);
        document.body.appendChild(form);
        
       
        form.submit();
        
       
        document.body.removeChild(form);
    }

   
    async function setHardeningLevel(level) {
        if (!currentTab || !canScanPage(currentTab.url)) {
            showScanError('Cannot apply hardening to this page type');
            return;
        }

        currentHardeningLevel = level;
        
       
        await chrome.storage.sync.set({
            hardeningLevel: level
        });

       
        updateHardeningUI(level);

        try {
           
            await chrome.runtime.sendMessage({
                type: 'UPDATE_HARDENING_LEVEL',
                level: level
            });

           
            await chrome.tabs.sendMessage(currentTab.id, {
                type: 'UPDATE_HARDENING',
                level: level
            });

           
            if (level === 'off') {
                updateStatus('Hardening disabled', 'safe');
            } else {
                updateStatus(`${getHardeningLevelName(level)} protection enabled`, 'safe');
            }

           
            setTimeout(() => {
                loadHardeningStatus();
            }, 500);

        } catch (error) {
            console.error('Failed to update hardening:', error);
            showScanError('Could not apply hardening to this page');
        }
    }

    function updateHardeningUI(level) {
       
        const statusText = level === 'off' ? 'OFF' : level.toUpperCase();
        hardeningStatus.textContent = statusText;
        
       
        hardeningStatus.className = '';
        switch (level) {
            case 'mega':
                hardeningStatus.style.background = '#fed7d7';
                hardeningStatus.style.color = '#c53030';
                hardeningStatus.style.borderColor = '#fc8181';
                break;
            case 'medium':
                hardeningStatus.style.background = '#fef5e7';
                hardeningStatus.style.color = '#c05621';
                hardeningStatus.style.borderColor = '#fbd38d';
                break;
            case 'low':
                hardeningStatus.style.background = '#fefcbf';
                hardeningStatus.style.color = '#b7791f';
                hardeningStatus.style.borderColor = '#f6e05e';
                break;
            default:
                hardeningStatus.style.background = '#e6fffa';
                hardeningStatus.style.color = '#2f855a';
                hardeningStatus.style.borderColor = '#9ae6b4';
                break;
        }

       
        document.querySelectorAll('.hardening-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-level="${level}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

       
        updateHardeningInfo(level);
    }

    function updateHardeningInfo(level) {
        const levelInfo = getHardeningLevelInfo(level);
        
        if (level === 'off') {
            hardeningInfo.style.display = 'none';
            hardeningStats.style.display = 'none';
        } else {
            hardeningInfo.style.display = 'block';
            hardeningInfoTitle.textContent = levelInfo.name;
            hardeningInfoDesc.textContent = levelInfo.description;
            hardeningInfoDetails.textContent = levelInfo.details;
        }
    }

    function getHardeningLevelInfo(level) {
        const levelInfoMap = {
            mega: {
                name: 'Mega Protection',
                description: 'Maximum security - blocks all JavaScript and dangerous elements',
                details: 'Blocks: All JS, Iframes, Objects, Forms, Event handlers, Dangerous attributes, Web APIs'
            },
            medium: {
                name: 'Medium Protection', 
                description: 'Balanced security - blocks dangerous scripts while preserving functionality',
                details: 'Blocks: Inline scripts, Iframes, Objects, Event handlers, Dangerous attributes'
            },
            low: {
                name: 'Low Protection',
                description: 'Minimal protection - basic security without breaking functionality',
                details: 'Blocks: Dangerous attributes only'
            },
            off: {
                name: 'No Protection',
                description: 'All content allowed',
                details: 'No blocking applied'
            }
        };
        
        return levelInfoMap[level] || levelInfoMap.off;
    }

    function getHardeningLevelName(level) {
        const names = {
            mega: 'Mega',
            medium: 'Medium', 
            low: 'Low',
            off: 'Off'
        };
        return names[level] || 'Unknown';
    }

    async function loadHardeningStatus() {
        if (!currentTab || !canScanPage(currentTab.url)) {
            hardeningStats.style.display = 'none';
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(currentTab.id, {
                type: 'GET_HARDENING_STATUS'
            });

            if (response && response.active) {
                hardeningStats.style.display = 'block';
                blockedElementsCount.textContent = response.blockedCount || 0;
            } else {
                hardeningStats.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to get hardening status:', error);
            hardeningStats.style.display = 'none';
        }
    }

}); 