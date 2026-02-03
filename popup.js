const FEEDBACK_API_URL = 'https://t5bc2asx5vnslwg27zpah7w5pi0mqkoq.lambda-url.ap-southeast-2.on.aws';
const TAGS_API_BASE = 'https://api.blowfish-security.com/v1/tags';
const MAX_WHITELIST_SITES = 50;
const SCAN_TIMEOUT_ATTEMPTS = 90;
const SCAN_PROGRESS_INTERVAL = 1000;

class PopupManager {
    constructor() {
        this.elements = {};
        this.state = {
            currentTab: null,
            currentWhitelist: [],
            currentHardeningLevel: 'off',
            highlightedIssues: new Set(),
            currentWebsiteTags: {},
            selectedQuickTags: new Set()
        };
        this.initElements();
    }

    initElements() {
        const elementIds = [
            'statusIndicator', 'statusText', 'domainInfo', 'scanButton', 'content',
            'resultsSummary', 'issuesList', 'noIssues', 'scanUrl',
            'autoScanToggle', 'notificationsToggle', 'themeToggle', 'highlightToggle', 'hideBubbleToggle',
            'addToWhitelistBtn', 'whitelistItems', 'noWhitelistItems', 'clearWhitelistBtn',
            'hardeningStatus', 'hardeningMegaBtn', 'hardeningMediumBtn',
            'hardeningLowBtn', 'hardeningOffBtn', 'hardeningInfo', 'hardeningInfoTitle',
            'hardeningInfoDesc', 'hardeningInfoDetails', 'hardeningStats', 'blockedElementsCount',
            'communityConfidence', 'meterFill', 'meterPercentage', 'safeVotes', 'unsafeVotes',
            'safeFeedbackBtn', 'unsafeFeedbackBtn', 'feedbackStatus', 'clearHighlightsBtn',
            'criticalCount', 'highCount', 'mediumCount', 'lowCount'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    async init() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.state.currentTab = tab;

            this.elements.domainInfo.textContent = 'Unknown domain';
            this.elements.statusText.textContent = 'Ready';

            if (this.state.currentTab?.url) {
                const url = new URL(this.state.currentTab.url);
                this.elements.domainInfo.textContent = url.hostname;
                this.elements.statusText.textContent = url.hostname;
            }

            const settings = await chrome.storage.sync.get([
                'autoScan', 'showNotifications', 'showHighlights', 'hideBubble',
                'whitelist', 'hardeningLevel', 'theme'
            ]);

            this.applySettings(settings);
            this.state.currentWhitelist = settings.whitelist || [];
            this.state.currentHardeningLevel = settings.hardeningLevel || 'off';

            
            const theme = settings.theme || 'dark';
            this.applyTheme(theme);

            this.updateHardeningUI(this.state.currentHardeningLevel);
            this.displayWhitelist();
            this.updateAddToWhitelistButton();

            this.loadScanResults();
            if (settings.autoScan !== false) {
                try {
                    const existing = await chrome.runtime.sendMessage({ type: 'GET_SCAN_RESULTS', tabId: this.state.currentTab?.id });
                    if (!existing) await this.startManualScan();
                } catch (e) {
                    console.debug('Auto-scan check failed:', e);
                }
            }
            this.loadCommunityStats();
            this.loadHardeningStatus();

            this.setupEventListeners();
            this.setupRuntimeListeners();

            // Ensure detailed findings/report UI are hidden by default
            this.elements.issuesList.style.display = 'none';
            const reportElement = document.getElementById('reportContainer');
            if (reportElement) { reportElement.hidden = true; reportElement.innerHTML = ''; }

            this.checkScannablePage();
        } catch (error) {
            console.error('Failed to initialize popup:', error);
        }
    }

    applySettings(settings) {
        this.elements.autoScanToggle.classList.toggle('active', settings.autoScan !== false);
        this.elements.notificationsToggle.classList.toggle('active', settings.showNotifications !== false);
        this.elements.highlightToggle.classList.toggle('active', settings.showHighlights !== false);
        this.elements.hideBubbleToggle.classList.toggle('active', settings.hideBubble === true);
    }

    setupEventListeners() {
        this.elements.scanButton.addEventListener('click', () => this.startManualScan());
        this.elements.autoScanToggle.addEventListener('click', () => this.toggleAutoScan());
        this.elements.notificationsToggle.addEventListener('click', () => this.toggleNotifications());
        this.elements.highlightToggle.addEventListener('click', () => this.toggleHighlights());
        this.elements.hideBubbleToggle.addEventListener('click', () => this.toggleHideBubble());
        this.elements.addToWhitelistBtn.addEventListener('click', () => this.addCurrentSiteToWhitelist());
        this.elements.clearWhitelistBtn.addEventListener('click', () => this.clearAllWhitelist());
        this.elements.safeFeedbackBtn.addEventListener('click', () => this.submitFeedback(true));
        this.elements.unsafeFeedbackBtn.addEventListener('click', () => this.submitFeedback(false));

        this.elements.hardeningMegaBtn.addEventListener('click', () => this.setHardeningLevel('mega'));
        this.elements.hardeningMediumBtn.addEventListener('click', () => this.setHardeningLevel('medium'));
        this.elements.hardeningLowBtn.addEventListener('click', () => this.setHardeningLevel('low'));
        this.elements.hardeningOffBtn.addEventListener('click', () => this.setHardeningLevel('off'));

        if (this.elements.clearHighlightsBtn) {
            this.elements.clearHighlightsBtn.addEventListener('click', () => this.clearAllHighlights());
        }

        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupRuntimeListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SCAN_PROGRESS') {
                const progressText = message.data.currentCheck || 'Scanning...';
                this.updateStatus(progressText, 'scanning');
            } else if (message.type === 'SCAN_COMPLETE') {
                setTimeout(() => {
                    this.loadScanResults();
                    this.updateStatus('Scan completed', 'ready');
                    this.elements.scanButton.disabled = false;
                }, 500);
            }
            return true;
        });
    }

    checkScannablePage() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.updateStatus('Cannot scan this page', 'error');
            this.elements.scanButton.disabled = true;

            const warning = document.createElement('div');
            warning.className = 'scan-warning';
            warning.textContent = 'Security scanning is not available on Chrome internal pages';
            this.elements.content.insertBefore(warning, this.elements.content.firstChild);
        }
    }

    
    applyTheme(theme) {
        const isLight = theme === 'light';
        document.body.classList.toggle('theme-light', isLight);
        if (this.elements.themeToggle) {
            this.elements.themeToggle.classList.toggle('active', isLight);
            this.elements.themeToggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
        }
    }

    async toggleTheme() {
        const isLight = document.body.classList.contains('theme-light');
        const newTheme = isLight ? 'dark' : 'light';
        await chrome.storage.sync.set({ theme: newTheme });
        this.applyTheme(newTheme);
    }

    
    async loadScanResults() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_SCAN_RESULTS', tabId: this.state.currentTab?.id });

            if (response && 'vulnerabilityCount' in response) {
                if (response.error) {
                    this.showScanError(response.error);
                } else {
                    this.displayResults(response);
                }
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Failed to load scan results:', error);
            this.showNoResults();
        }
    }

    async startManualScan() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.showScanError('Cannot scan this page type');
            return;
        }

        this.elements.scanButton.disabled = true;
        this.elements.scanButton.textContent = 'Scanning...';
        this.updateStatus('Starting scan...', 'scanning');

        try {
            await chrome.runtime.sendMessage({ type: 'START_MANUAL_SCAN', tabId: this.state.currentTab?.id });
            this.monitorScanProgress();
        } catch (error) {
            console.error('Failed to start scan:', error);
            this.elements.scanButton.disabled = false;
            this.elements.scanButton.textContent = 'Re-scan';
            this.showScanError('Failed to start scan');
            this.updateStatus('Scan failed', 'error');
        }
    }

    async monitorScanProgress() {
        let attempts = 0;
        let lastProgressTime = Date.now();
        let progressStalled = false;

        const progressInterval = setInterval(async () => {
            attempts++;

            try {
                const results = await chrome.runtime.sendMessage({ type: 'GET_SCAN_RESULTS', tabId: this.state.currentTab?.id });

                if (results?.timestamp) {
                    clearInterval(progressInterval);
                    this.elements.scanButton.disabled = false;
                    this.elements.scanButton.textContent = 'Re-scan';

                    if (results.error) {
                        this.showScanError(results.error);
                    } else {
                        this.displayResults(results);
                    }
                    return;
                }

                this.updateScanProgressText(attempts);

                const now = Date.now();
                if (now - lastProgressTime > 30000) {
                    if (!progressStalled) {
                        progressStalled = true;
                        this.updateStatus('Scan taking longer than expected...', 'scanning');
                    }
                }

                if (attempts >= SCAN_TIMEOUT_ATTEMPTS) {
                    clearInterval(progressInterval);
                    this.elements.scanButton.disabled = false;
                    this.elements.scanButton.textContent = 'Re-scan';

                    if (progressStalled) {
                        this.showScanError('Scan timeout - page may be too complex or unresponsive');
                    } else {
                        this.showScanError('Scan timeout - please try again');
                    }
                    this.updateStatus('Scan failed', 'error');
                }

            } catch (error) {
                console.error('Error checking scan progress:', error);

                if (attempts >= SCAN_TIMEOUT_ATTEMPTS) {
                    clearInterval(progressInterval);
                    this.elements.scanButton.disabled = false;
                    this.elements.scanButton.textContent = 'Re-scan';
                    this.showScanError('Scan failed - please try again');
                    this.updateStatus('Scan failed', 'error');
                }
            }
        }, SCAN_PROGRESS_INTERVAL);
    }

    updateScanProgressText(attempts) {
        let statusText;
        if (attempts <= 15) {
            statusText = 'Initializing scan...';
        } else if (attempts <= 30) {
            statusText = 'Analyzing security headers...';
        } else if (attempts <= 45) {
            statusText = 'Checking SSL configuration...';
        } else if (attempts <= 60) {
            statusText = 'Performing deep analysis...';
        } else if (attempts <= 75) {
            statusText = 'Finalizing results...';
        } else {
            statusText = 'Completing scan...';
        }
        this.updateStatus(statusText, 'scanning');
    }

    displayResults(results) {
        if (!results || results.vulnerabilityCount === 0) {
            this.showNoIssues();
            this.updateStatusWithCounts(0, {});
            globalThis.window.currentIssues = [];
            return;
        }

        globalThis.window.currentIssues = results.issues || [];
        this.elements.resultsSummary.style.display = 'block';
        this.elements.noIssues.style.display = 'none';

        const url = new URL(results.url || this.state.currentTab.url);
        this.elements.scanUrl.textContent = url.hostname;

        const counts = results.severityCounts || {};
        this.updateCounts(counts);
        // Remove detailed findings from the popup — keep summary only
        this.elements.issuesList.innerHTML = '';
        this.elements.issuesList.style.display = 'none';
        this.updateStatusWithCounts(results.vulnerabilityCount, counts);
        const report = document.getElementById('reportContainer');
        if (report) { report.hidden = true; report.innerHTML = ''; }
    }

    updateCounts(counts) {
        this.elements.criticalCount.textContent = counts.critical || 0;
        this.elements.highCount.textContent = counts.high || 0;
        this.elements.mediumCount.textContent = counts.medium || 0;
        this.elements.lowCount.textContent = counts.low || 0;
    }

    displayIssuesList(issues) {
        this.elements.issuesList.innerHTML = '';

        const sortedIssues = issues.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });

        sortedIssues.forEach((issue, index) => {
            const issueElement = this.createIssueElement(issue, index);
            this.elements.issuesList.appendChild(issueElement);
        });
    }

    createIssueElement(issue, index) {
        const issueElement = document.createElement('div');
        issueElement.className = `issue-item ${issue.severity}`;

        const hasElements = issue.details?.evidence?.some(e => e.element || e.selector);
        const isHighlighted = this.state.highlightedIssues.has(index);
        const highlightClass = isHighlighted ? 'active' : '';
        const highlightText = isHighlighted ? '🔍 Hide' : '🎯 Highlight';

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
                    <div class="action-btn highlight ${highlightClass}"
                         data-action="highlight" data-index="${index}">
                        ${highlightText}
                    </div>
                ` : ''}
            </div>
        `;

        issueElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const action = e.target.dataset.action;
                const idx = Number.parseInt(e.target.dataset.index);

                if (action === 'details') {
                    this.showIssueDetails(idx);
                } else if (action === 'highlight') {
                    this.toggleHighlight(idx);
                }
            } else {
                this.showIssueDetails(index);
            }
        });

        return issueElement;
    }

    renderReport(results) {
        const container = this.elements.reportContainer || document.getElementById('reportContainer');
        if (!container) return;

        container.innerHTML = '';
        container.hidden = false;

        const header = document.createElement('div');
        header.className = 'report-header';

        const title = document.createElement('div');
        title.innerHTML = `<strong>Scan Report</strong> <small>${new Date(results.timestamp || Date.now()).toLocaleString()}</small>`;

        const actions = document.createElement('div');
        actions.className = 'report-actions';
        const exportBtn = document.createElement('button');
        exportBtn.className = 'action-btn primary-btn';
        exportBtn.textContent = 'Export Report';
        exportBtn.addEventListener('click', () => this.exportReport(results));
        actions.appendChild(exportBtn);

        header.appendChild(title);
        header.appendChild(actions);

        container.appendChild(header);

        const summary = document.createElement('div');
        summary.className = 'report-summary';

        const statTotals = document.createElement('div');
        statTotals.className = 'stat';
        statTotals.textContent = `${results.vulnerabilityCount || 0} issues`;
        summary.appendChild(statTotals);

        const statCritical = document.createElement('div');
        statCritical.className = 'stat';
        statCritical.textContent = `Critical: ${(results.severityCounts?.critical) || 0}`;
        summary.appendChild(statCritical);

        const statHigh = document.createElement('div');
        statHigh.className = 'stat';
        statHigh.textContent = `High: ${(results.severityCounts?.high) || 0}`;
        summary.appendChild(statHigh);

        const statMedium = document.createElement('div');
        statMedium.className = 'stat';
        statMedium.textContent = `Medium: ${(results.severityCounts?.medium) || 0}`;
        summary.appendChild(statMedium);

        const statLow = document.createElement('div');
        statLow.className = 'stat';
        statLow.textContent = `Low: ${(results.severityCounts?.low) || 0}`;
        summary.appendChild(statLow);

        container.appendChild(summary);

        const issues = results.issues || [];
        if (!issues.length) {
            const empty = document.createElement('div');
            empty.className = 'report-empty';
            empty.textContent = 'No issues to show in the report.';
            container.appendChild(empty);
            return;
        }

        issues.forEach((issue, idx) => {
            const card = document.createElement('div');
            card.className = `finding-card ${issue.severity || ''}`;

            const title = document.createElement('div');
            title.className = 'title';
            title.innerHTML = `
                <div>${issue.message}</div>
                <div class="finding-actions">
                    <div class="finding-severity ${issue.severity || 'low'}">${(issue.severity || 'low').toUpperCase()}</div>
                    <button class="primary" data-idx="${idx}">Details</button>
                </div>
            `;

            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = issue.details?.description || ''; 

            const details = document.createElement('div');
            details.className = 'details';
            details.innerHTML = `<pre>${JSON.stringify(issue.details || {}, null, 2)}</pre>`;

            title.querySelector('button')?.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.toggle('expanded');
            });

            card.appendChild(title);
            if (meta.textContent) card.appendChild(meta);
            card.appendChild(details);

            container.appendChild(card);
        });
    }

    exportReport(results) {
        try {
            const data = {
                generated: new Date().toISOString(),
                url: results.url || this.state.currentTab?.url,
                counts: results.severityCounts || {},
                total: results.vulnerabilityCount || 0,
                issues: results.issues || []
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blowfish-report-${(new Date()).toISOString().replace(/[:.]/g,'-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    }

    showIssueDetails(issueIndex) {
        const issues = this.getCurrentIssues();
        if (!issues?.[issueIndex]) return;

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

    async toggleHighlight(issueIndex) {
        if (!this.state.currentTab) return;

        const settings = await chrome.storage.sync.get(['showHighlights']);
        if (settings.showHighlights === false) {
            alert('Element highlighting is disabled in settings');
            return;
        }

        const issues = this.getCurrentIssues();
        if (!issues?.[issueIndex]) return;

        const issue = issues[issueIndex];
        const isHighlighted = this.state.highlightedIssues.has(issueIndex);

        try {
            if (isHighlighted) {
                await chrome.tabs.sendMessage(this.state.currentTab.id, {
                    type: 'REMOVE_HIGHLIGHT',
                    issueIndex: issueIndex
                });
                this.state.highlightedIssues.delete(issueIndex);
            } else {
                await chrome.tabs.sendMessage(this.state.currentTab.id, {
                    type: 'ADD_HIGHLIGHT',
                    issueIndex: issueIndex,
                    issue: issue
                });
                this.state.highlightedIssues.add(issueIndex);
            }

            const results = await chrome.runtime.sendMessage({ type: 'GET_SCAN_RESULTS', tabId: this.state.currentTab?.id });
            if (results) {
                this.displayResults(results);
            }
        } catch (error) {
            console.error('Failed to toggle highlight:', error);
            alert('Could not highlight elements on this page');
        }
    }

    getCurrentIssues() {
        return globalThis.window.currentIssues || [];
    }

    async clearAllHighlights() {
        if (!this.state.currentTab) return;

        try {
            await chrome.tabs.sendMessage(this.state.currentTab.id, {
                type: 'CLEAR_ALL_HIGHLIGHTS'
            });
            this.state.highlightedIssues.clear();
        } catch (error) {
            console.error('Failed to clear highlights:', error);
        }
    }

    showNoIssues() {
        this.elements.resultsSummary.style.display = 'none';
        this.elements.noIssues.style.display = 'block';
        this.elements.issuesList.innerHTML = '';
        const report = document.getElementById('reportContainer');
        if (report) { report.hidden = true; report.innerHTML = ''; }
    }

    showNoResults() {
        this.elements.resultsSummary.style.display = 'none';
        this.elements.noIssues.style.display = 'none';
        this.updateStatus('Click to scan', 'ready');
        this.elements.scanButton.textContent = 'Scan Page';
        const report = document.getElementById('reportContainer');
        if (report) { report.hidden = true; report.innerHTML = ''; }
    }

    showScanError(errorMessage) {
        this.elements.resultsSummary.style.display = 'none';
        this.elements.noIssues.style.display = 'none';
        this.elements.issuesList.innerHTML = '';
        const report = document.getElementById('reportContainer');
        if (report) { report.hidden = true; report.innerHTML = ''; }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'scan-error';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-title">Scan Error</div>
            <div class="error-message">${errorMessage}</div>
        `;

        this.elements.issuesList.appendChild(errorDiv);
        this.updateStatus('Error', 'error');
    }

    
    async toggleAutoScan() {
        const isActive = this.elements.autoScanToggle.classList.contains('active');
        this.elements.autoScanToggle.classList.toggle('active');
        const newValue = !isActive;
        await chrome.storage.sync.set({ autoScan: newValue });

        try {
            await chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                setting: 'autoScan',
                value: newValue
            });
        } catch (error) {
            console.error('Failed to notify background of auto-scan change:', error);
        }
    }

    async toggleNotifications() {
        const isActive = this.elements.notificationsToggle.classList.contains('active');
        this.elements.notificationsToggle.classList.toggle('active');
        const newValue = !isActive;
        await chrome.storage.sync.set({ showNotifications: newValue });

        try {
            await chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                setting: 'showNotifications',
                value: newValue
            });
        } catch (error) {
            console.error('Failed to notify background of notifications change:', error);
        }
    }

    async toggleHighlights() {
        const isActive = this.elements.highlightToggle.classList.contains('active');
        this.elements.highlightToggle.classList.toggle('active');
        const newValue = !isActive;
        await chrome.storage.sync.set({ showHighlights: newValue });

        await this.updateScannerSettings();

        if (!newValue) {
            await this.clearAllHighlights();
        }
    }

    async toggleHideBubble() {
        const isActive = this.elements.hideBubbleToggle.classList.contains('active');
        this.elements.hideBubbleToggle.classList.toggle('active');
        const newValue = !isActive;
        await chrome.storage.sync.set({ hideBubble: newValue });

        await this.updateScannerSettings();
    }

    async updateScannerSettings() {
        if (!this.state.currentTab) return;

        try {
            const settings = await chrome.storage.sync.get(['showHighlights', 'hideBubble']);
            await chrome.tabs.sendMessage(this.state.currentTab.id, {
                type: 'UPDATE_SCANNER_SETTINGS',
                settings: settings
            });
        } catch (error) {
            console.error('Failed to update scanner settings:', error);
        }
    }

    
    displayWhitelist() {
        this.elements.whitelistItems.innerHTML = '';

        if (this.state.currentWhitelist.length === 0) {
            this.elements.noWhitelistItems.style.display = 'block';
            return;
        }

        this.elements.noWhitelistItems.style.display = 'none';

        this.state.currentWhitelist.forEach((site, index) => {
            const siteElement = this.createWhitelistItem(site, index);
            this.elements.whitelistItems.appendChild(siteElement);
        });
    }

    createWhitelistItem(site, index) {
        const siteElement = document.createElement('div');
        siteElement.className = 'whitelist-item';

        const domainSpan = document.createElement('span');
        domainSpan.className = 'whitelist-domain';
        domainSpan.textContent = site;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-whitelist-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => this.removeFromWhitelist(index));

        siteElement.appendChild(domainSpan);
        siteElement.appendChild(removeBtn);
        return siteElement;
    }

    updateAddToWhitelistButton() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.elements.addToWhitelistBtn.disabled = true;
            this.elements.addToWhitelistBtn.textContent = 'Cannot Add';
            return;
        }

        const site = new URL(this.state.currentTab.url).hostname;
        const isWhitelisted = this.state.currentWhitelist.includes(site);

        if (isWhitelisted) {
            this.elements.addToWhitelistBtn.disabled = true;
            this.elements.addToWhitelistBtn.textContent = 'Already Added';
        } else {
            this.elements.addToWhitelistBtn.disabled = false;
            this.elements.addToWhitelistBtn.textContent = 'Add Current Site';
        }
    }

    async addCurrentSiteToWhitelist() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.showScanError('Cannot whitelist this page type');
            return;
        }

        const site = new URL(this.state.currentTab.url).hostname;
        if (this.state.currentWhitelist.includes(site)) {
            this.showScanError('This site is already in the whitelist');
            return;
        }

        if (this.state.currentWhitelist.length >= MAX_WHITELIST_SITES) {
            this.showScanError('Whitelist is full (maximum 50 sites)');
            return;
        }

        this.state.currentWhitelist.push(site);
        await chrome.storage.sync.set({ whitelist: this.state.currentWhitelist });

        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: this.state.currentWhitelist
        });

        this.displayWhitelist();
        this.updateAddToWhitelistButton();
        this.updateStatus(`Added ${site} to whitelist`, 'safe');
    }

    async removeFromWhitelist(index) {
        const removedSite = this.state.currentWhitelist[index];
        this.state.currentWhitelist.splice(index, 1);

        await chrome.storage.sync.set({ whitelist: this.state.currentWhitelist });

        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: this.state.currentWhitelist
        });

        this.displayWhitelist();
        this.updateAddToWhitelistButton();
        this.updateStatus(`Removed ${removedSite} from whitelist`, 'safe');
    }

    async clearAllWhitelist() {
        this.state.currentWhitelist = [];
        await chrome.storage.sync.set({ whitelist: this.state.currentWhitelist });

        chrome.runtime.sendMessage({
            type: 'WHITELIST_UPDATED',
            whitelist: this.state.currentWhitelist
        });

        this.displayWhitelist();
        this.updateAddToWhitelistButton();
        this.updateStatus('Whitelist cleared', 'safe');
    }

    


    
    async setHardeningLevel(level) {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.showScanError('Cannot apply hardening to this page type');
            return;
        }

        this.state.currentHardeningLevel = level;
        await chrome.storage.sync.set({ hardeningLevel: level });
        this.updateHardeningUI(level);

        try {
            await chrome.runtime.sendMessage({ type: 'UPDATE_HARDENING_LEVEL', level: level });
            await chrome.tabs.sendMessage(this.state.currentTab.id, { type: 'UPDATE_HARDENING', level: level });

            if (level === 'off') {
                this.updateStatus('Hardening disabled', 'safe');
            } else {
                this.updateStatus(`${this.getHardeningLevelName(level)} protection enabled`, 'safe');
            }

            setTimeout(() => this.loadHardeningStatus(), 500);
        } catch (error) {
            console.error('Failed to update hardening:', error);
            this.showScanError('Could not apply hardening to this page');
        }
    }

    updateHardeningUI(level) {
        const statusText = level === 'off' ? 'OFF' : level.toUpperCase();
        this.elements.hardeningStatus.textContent = statusText;

        
        this.elements.hardeningStatus.classList.remove('hardening-mega', 'hardening-medium', 'hardening-low', 'hardening-off');
        this.elements.hardeningStatus.classList.add(level === 'off' ? 'hardening-off' : `hardening-${level}`);

        document.querySelectorAll('.hardening-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-level="${level}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        this.updateHardeningInfo(level);
    }

    updateHardeningInfo(level) {
        const levelInfo = this.getHardeningLevelInfo(level);

        if (level === 'off') {
            this.elements.hardeningInfo.style.display = 'none';
            this.elements.hardeningStats.style.display = 'none';
        } else {
            this.elements.hardeningInfo.style.display = 'block';
            this.elements.hardeningInfoTitle.textContent = levelInfo.name;
            this.elements.hardeningInfoDesc.textContent = levelInfo.description;
            this.elements.hardeningInfoDetails.textContent = levelInfo.details;
        }
    }

    getHardeningLevelInfo(level) {
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

    getHardeningLevelName(level) {
        const names = { mega: 'Mega', medium: 'Medium', low: 'Low', off: 'Off' };
        return names[level] || 'Unknown';
    }

    async loadHardeningStatus() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.elements.hardeningStats.style.display = 'none';
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(this.state.currentTab.id, { type: 'GET_HARDENING_STATUS' });

            if (response?.active) {
                this.elements.hardeningStats.style.display = 'block';
                this.elements.blockedElementsCount.textContent = response.blockedCount || 0;
            } else {
                this.elements.hardeningStats.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to get hardening status:', error);
            this.elements.hardeningStats.style.display = 'none';
        }
    }

    
    async loadCommunityStats() {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.showNoStatsAvailable();
            return;
        }

        try {
            const url = new URL(`${FEEDBACK_API_URL}/stats`);
            url.searchParams.append('url', this.state.currentTab.url);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const stats = await response.json();
                this.displayCommunityStats(stats);
            } else {
                this.showNoStatsAvailable();
            }
        } catch (error) {
            console.error('Failed to load community stats:', error);
            this.showNoStatsAvailable();
        }
    }

    displayCommunityStats(stats) {
        this.elements.communityConfidence.textContent = stats.confidence_level || 'Unknown';
        const percentage = Number.parseFloat(stats.safety_percentage) || 0;
        this.elements.meterFill.style.width = `${100 - percentage}%`;
        this.elements.meterPercentage.textContent = `${percentage}% Safe`;
        this.elements.safeVotes.textContent = `👍 ${stats.safe_votes || 0}`;
        this.elements.unsafeVotes.textContent = `👎 ${stats.unsafe_votes || 0}`;

        
        this.elements.communityConfidence.classList.remove('high', 'medium', 'low', 'no-data');
        const confidence = (stats.confidence_level || '').toLowerCase();
        if (!stats.confidence_level) {
            this.elements.communityConfidence.classList.add('no-data');
        } else if (confidence.includes('very high') || confidence.includes('high')) {
            this.elements.communityConfidence.classList.add('high');
        } else if (confidence.includes('medium')) {
            this.elements.communityConfidence.classList.add('medium');
        } else {
            this.elements.communityConfidence.classList.add('low');
        }

        
        this.elements.meterFill.classList.remove('safe', 'warning', 'danger');
        if (percentage >= 70) {
            this.elements.meterFill.classList.add('safe');
        } else if (percentage >= 40) {
            this.elements.meterFill.classList.add('warning');
        } else {
            this.elements.meterFill.classList.add('danger');
        }
    }

    showNoStatsAvailable() {
        this.elements.communityConfidence.textContent = 'No Data';
        this.elements.communityConfidence.classList.remove('high','medium','low');
        this.elements.communityConfidence.classList.add('no-data');
        this.elements.meterPercentage.textContent = '--';
        this.elements.safeVotes.textContent = '👍 0';
        this.elements.unsafeVotes.textContent = '👎 0';
        this.elements.meterFill.style.width = '0%';
        this.elements.meterFill.classList.remove('safe','warning','danger');
    }

    async submitFeedback(isSafe) {
        if (!this.state.currentTab || !this.canScanPage(this.state.currentTab.url)) {
            this.elements.feedbackStatus.textContent = 'Cannot submit feedback for this page';
            this.elements.feedbackStatus.className = 'feedback-status error';
            return;
        }

        this.elements.safeFeedbackBtn.disabled = true;
        this.elements.unsafeFeedbackBtn.disabled = true;
        this.elements.feedbackStatus.textContent = 'Submitting feedback...';
        this.elements.feedbackStatus.className = 'feedback-status loading';

        try {
            const response = await fetch(`${FEEDBACK_API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: this.state.currentTab.url,
                    is_safe: isSafe,
                    user_agent: navigator.userAgent
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.elements.feedbackStatus.textContent = 'Thank you for your feedback!';
                this.elements.feedbackStatus.className = 'feedback-status success';

                if (isSafe) {
                    this.elements.safeFeedbackBtn.classList.add('active');
                    this.elements.unsafeFeedbackBtn.classList.remove('active');
                } else {
                    this.elements.unsafeFeedbackBtn.classList.add('active');
                    this.elements.safeFeedbackBtn.classList.remove('active');
                }

                setTimeout(() => this.loadCommunityStats(), 1000);
            } else {
                this.elements.feedbackStatus.textContent = result.message || 'Failed to submit feedback';
                this.elements.feedbackStatus.className = 'feedback-status error';

                if (result.message?.includes('already submitted')) {
                    this.elements.feedbackStatus.textContent = 'You have already voted for this website';
                    this.elements.feedbackStatus.className = 'feedback-status error';
                }
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            this.elements.feedbackStatus.textContent = 'Network error occurred';
            this.elements.feedbackStatus.className = 'feedback-status error';
        } finally {
            setTimeout(() => {
                this.elements.safeFeedbackBtn.disabled = false;
                this.elements.unsafeFeedbackBtn.disabled = false;
            }, 2000);
        }
    }

    
    updateStatus(text, type) {
        this.elements.statusText.textContent = text;

        
        this.elements.statusIndicator.className = 'status-indicator';
        if (type === 'scanning') {
            this.elements.statusIndicator.classList.add('scanning');
        } else if (type === 'error' || type === 'warning' || type === 'issues') {
            this.elements.statusIndicator.classList.add('issues');
        }
    }

    updateStatusWithCounts(totalCount, counts) {
        if (totalCount === 0) {
            this.elements.statusText.textContent = 'No issues found';
            this.elements.statusIndicator.className = 'status-indicator';
            return;
        }

        let statusParts = [];
        if (counts.critical > 0) statusParts.push(`${counts.critical} Critical`);
        if (counts.high > 0) statusParts.push(`${counts.high} High`);
        if (counts.medium > 0) statusParts.push(`${counts.medium} Medium`);
        if (counts.low > 0) statusParts.push(`${counts.low} Low`);

        if (statusParts.length > 0) {
            this.elements.statusText.textContent = statusParts.join(', ');
        } else {
            this.elements.statusText.textContent = `${totalCount} issue${totalCount > 1 ? 's' : ''} found`;
        }

        const highestSeverity = this.getHighestSeverity(counts);
        if (highestSeverity === 'critical') {
            this.elements.statusIndicator.className = 'status-indicator issues';
        } else if (highestSeverity === 'high' || highestSeverity === 'medium') {
            this.elements.statusIndicator.className = 'status-indicator scanning';
        } else {
            this.elements.statusIndicator.className = 'status-indicator';
        }
    }

    getHighestSeverity(counts) {
        if (counts.critical > 0) return 'critical';
        if (counts.high > 0) return 'high';
        if (counts.medium > 0) return 'medium';
        if (counts.low > 0) return 'low';
        return 'none';
    }

    canScanPage(url) {
        if (!url) return false;
        const unscannable = ['chrome://', 'chrome-extension://', 'moz-extension://', 'about:', 'file://', 'data:', 'blob:', 'javascript:'];
        return !unscannable.some(prefix => url.startsWith(prefix));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const popup = new PopupManager();
    popup.init();
}); 