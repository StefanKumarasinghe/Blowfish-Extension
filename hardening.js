// Blowfish ASE - Web Hardening Protection System

(function() {
    'use strict';

    console.log('🛡️ Hardening script loading at', document.readyState, 'on', window.location.href);

    let hardeningLevel = 'off';
    let protectionActive = false;
    let blockedElements = [];
    let observer = null;
    let originalAPIs = {};
    let cspInjected = false;
    let earlyBlockingActive = false;
    let initializationPromise = null;


    window.hardeningActive = false;
    window.hardeningLevel = 'off';
    window.hardeningBlockedCount = 0;


    const ORIGINAL_METHODS = {
        createElement: document.createElement.bind(document),
        appendChild: Node.prototype.appendChild,
        insertBefore: Node.prototype.insertBefore,
        setAttribute: Element.prototype.setAttribute,
        eval: window.eval,
        Function: window.Function,
        setTimeout: window.setTimeout,
        setInterval: window.setInterval,
        XMLHttpRequest: window.XMLHttpRequest,
        fetch: window.fetch,
        WebSocket: window.WebSocket
    };


    let emergencyBlock = false;
    try {
    
        const cached = sessionStorage.getItem('blowfish_hardening_level');
        if (cached && cached !== 'off') {
            console.log('🛡️ Emergency hardening activated from cache:', cached);
            emergencyBlock = true;
            hardeningLevel = cached;
            activateEmergencyProtection(cached);
        }
    } catch (e) {
        console.log('🛡️ No cached hardening level available');
    }


    const TRUSTED_DOMAINS = [
        'google.com', 'googleapis.com', 'gstatic.com',
        'microsoft.com', 'microsoftonline.com', 'office.com',
        'amazon.com', 'amazonaws.com', 'cloudfront.net',
        'github.com', 'githubusercontent.com',
        'mozilla.org', 'firefox.com',
        'apple.com', 'icloud.com',
        'cloudflare.com', 'cdnjs.cloudflare.com',
        'jquery.com', 'bootstrap.com',
        'stackoverflow.com', 'stackexchange.com'
    ];


    const PROTECTION_LEVELS = {
        mega: {
            name: 'Mega Protection',
            description: 'Maximum security - blocks all JavaScript and dangerous elements',
            blockJavaScript: true,
            blockInlineScripts: true,
            blockExternalScripts: true,
            blockIframes: true,
            blockObjects: true,
            blockEmbeds: true,
            blockForms: true,
            blockEventHandlers: true,
            blockDangerousAttributes: true,
            blockWebAPIs: true,
            allowTrustedDomains: false
        },
        medium: {
            name: 'Medium Protection',
            description: 'Balanced security - blocks dangerous scripts while preserving functionality',
            blockJavaScript: false,
            blockInlineScripts: true,
            blockExternalScripts: true,
            blockIframes: true,
            blockObjects: true,
            blockEmbeds: true,
            blockForms: false,
            blockEventHandlers: true,
            blockDangerousAttributes: true,
            blockWebAPIs: true,
            allowTrustedDomains: true
        },
        low: {
            name: 'Low Protection',
            description: 'Minimal protection - basic security without breaking functionality',
            blockJavaScript: false,
            blockInlineScripts: false,
            blockExternalScripts: false,
            blockIframes: false,
            blockObjects: false,
            blockEmbeds: false,
            blockForms: false,
            blockEventHandlers: false,
            blockDangerousAttributes: true,
            blockWebAPIs: false,
            allowTrustedDomains: true
        }
    };


    initializationPromise = init();

    function activateEmergencyProtection(level) {
        console.log('🛡️ EMERGENCY: Activating immediate protection for level:', level);
        const config = PROTECTION_LEVELS[level];
        if (!config) return;

    
        if (config.blockWebAPIs || config.blockJavaScript) {
            blockWebAPIsImmediate(config);
        }

    
        if (config.blockJavaScript || config.blockInlineScripts) {
            injectCSPImmediate(config);
        }

    
        activateEarlyBlockingImmediate(config);
        
        protectionActive = true;
        window.hardeningActive = true;
        window.hardeningLevel = level;
        console.log('🛡️ EMERGENCY: Protection activated immediately');
    }

    function blockWebAPIsImmediate(config) {
        try {
            if (config.blockJavaScript) {
            
                window.eval = function() {
                    console.log('🛡️ eval() blocked by emergency hardening');
                    throw new Error('eval() is disabled by Blowfish ASE Hardening');
                };
                
                window.Function = function() {
                    console.log('🛡️ Function constructor blocked by emergency hardening');
                    throw new Error('Function constructor is disabled by Blowfish ASE Hardening');
                };

            
                window.setTimeout = function() {
                    console.log('🛡️ setTimeout blocked by emergency hardening');
                    return 0;
                };
                
                window.setInterval = function() {
                    console.log('🛡️ setInterval blocked by emergency hardening');
                    return 0;
                };

            
                window.XMLHttpRequest = function() {
                    console.log('🛡️ XMLHttpRequest blocked by emergency hardening');
                    throw new Error('XMLHttpRequest is disabled by Blowfish ASE Hardening');
                };

                if (window.fetch) {
                    window.fetch = function() {
                        console.log('🛡️ fetch blocked by emergency hardening');
                        return Promise.reject(new Error('fetch is disabled by Blowfish ASE Hardening'));
                    };
                }

                if (window.WebSocket) {
                    window.WebSocket = function() {
                        console.log('🛡️ WebSocket blocked by emergency hardening');
                        throw new Error('WebSocket is disabled by Blowfish ASE Hardening');
                    };
                }
            }
        } catch (error) {
            console.error('🛡️ Error in emergency API blocking:', error);
        }
    }

    function injectCSPImmediate(config) {
        try {
            if (document.head || document.documentElement) {
                const meta = document.createElement('meta');
                meta.httpEquiv = 'Content-Security-Policy';
                
                if (config.blockJavaScript) {
                    meta.content = "script-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none';";
                } else if (config.blockInlineScripts) {
                    if (config.allowTrustedDomains) {
                        const trustedSources = TRUSTED_DOMAINS.map(domain => `https://*.${domain} https://${domain}`).join(' ');
                        meta.content = `script-src 'self' ${trustedSources}; object-src 'none'; frame-src 'self' ${trustedSources};`;
                    } else {
                        meta.content = "script-src 'self'; object-src 'none'; frame-src 'self';";
                    }
                }
                
                (document.head || document.documentElement).insertBefore(meta, (document.head || document.documentElement).firstChild);
                console.log('🛡️ EMERGENCY: CSP injected immediately');
                cspInjected = true;
            }
        } catch (error) {
            console.error('🛡️ Error injecting emergency CSP:', error);
        }
    }

    function activateEarlyBlockingImmediate(config) {
        try {
        
            document.createElement = function(tagName) {
                const element = ORIGINAL_METHODS.createElement(tagName);
                const tag = tagName.toLowerCase();
                
            
                if (tag === 'script') {
                    if (config.blockJavaScript || config.blockInlineScripts) {
                        console.log('🛡️ Script creation blocked:', tagName);
                        element.type = 'text/plain';
                        element.disabled = true;
                        element.setAttribute('data-hardening-blocked', 'true');
                        blockedElements.push({
                            element: element,
                            tag: tag,
                            reason: 'Script creation blocked',
                            timestamp: Date.now()
                        });
                        window.hardeningBlockedCount = blockedElements.length;
                    }
                }
                
            
                if ((config.blockIframes && tag === 'iframe') ||
                    (config.blockObjects && tag === 'object') ||
                    (config.blockEmbeds && tag === 'embed') ||
                    (config.blockForms && tag === 'form')) {
                    console.log('🛡️ Element creation blocked:', tagName);
                    element.style.display = 'none';
                    element.disabled = true;
                    element.setAttribute('data-hardening-blocked', 'true');
                    blockedElements.push({
                        element: element,
                        tag: tag,
                        reason: 'Element creation blocked',
                        timestamp: Date.now()
                    });
                    window.hardeningBlockedCount = blockedElements.length;
                }
                
                return element;
            };

            earlyBlockingActive = true;
            console.log('🛡️ EMERGENCY: Early blocking activated immediately');
        } catch (error) {
            console.error('🛡️ Error in emergency early blocking:', error);
        }
    }

    async function init() {
        console.log('🛡️ Hardening init starting...');
        let loadedLevel = 'off';
        
        try {
        
            try {
                const result = await chrome.storage.sync.get(['hardeningLevel']);
                loadedLevel = result.hardeningLevel || 'off';
                console.log('🛡️ Loaded hardening level from storage:', loadedLevel);
            } catch (storageError) {
                console.warn('🛡️ Storage access failed, trying alternative methods:', storageError);
                
            
                try {
                    const cached = sessionStorage.getItem('blowfish_hardening_level');
                    if (cached) {
                        loadedLevel = cached;
                        console.log('🛡️ Using cached hardening level:', loadedLevel);
                    }
                } catch (sessionError) {
                    console.warn('🛡️ Session storage also failed:', sessionError);
                }
            }

        
            try {
                sessionStorage.setItem('blowfish_hardening_level', loadedLevel);
            } catch (e) {
                console.warn('🛡️ Could not cache hardening level');
            }

        
            hardeningLevel = loadedLevel;
            
        
            if (emergencyBlock && hardeningLevel !== 'off') {
                console.log('🛡️ Emergency protection already active, upgrading to full protection...');
                await activateProtection(hardeningLevel);
            } else if (!emergencyBlock && hardeningLevel !== 'off') {
            
                await activateProtection(hardeningLevel);
            } else if (emergencyBlock && hardeningLevel === 'off') {
            
                console.log('🛡️ Deactivating emergency protection...');
                deactivateProtection();
            }

        } catch (error) {
            console.error('🛡️ Hardening init error:', error);
        
            if (!emergencyBlock) {
                console.log('🛡️ Fallback: Activating basic protection due to init error');
                try {
                    await activateProtection('low');
                } catch (fallbackError) {
                    console.error('🛡️ Even fallback protection failed:', fallbackError);
                }
            }
        }

    
        try {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                console.log('🛡️ Received message:', message);
                
                try {
                    if (message.type === 'UPDATE_HARDENING') {
                        console.log('🛡️ Processing hardening update to level:', message.level);
                        updateHardeningLevel(message.level).then(() => {
                            console.log('🛡️ Hardening level updated successfully');
                            sendResponse({ success: true, level: hardeningLevel, active: protectionActive });
                        }).catch(error => {
                            console.error('🛡️ Error updating hardening level:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                        return true; // Keep message channel open for async response
                        
                    } else if (message.type === 'GET_HARDENING_STATUS') {
                        console.log('🛡️ Returning hardening status');
                        sendResponse({
                            active: protectionActive,
                            level: hardeningLevel,
                            blockedCount: blockedElements.length
                        });
                        return false; // Synchronous response
                    }
                } catch (error) {
                    console.error('🛡️ Error processing message:', error);
                    sendResponse({ success: false, error: error.message });
                }
                
                return false;
            });
            console.log('🛡️ Message listener set up successfully');
        } catch (error) {
            console.error('🛡️ Error setting up message listener:', error);
        }
        
        console.log('🛡️ Hardening init completed');
    }

    async function updateHardeningLevel(level) {
        console.log('🛡️ Updating hardening level to:', level);
        hardeningLevel = level;
        window.hardeningLevel = level;
        
    
        try {
            sessionStorage.setItem('blowfish_hardening_level', level);
        } catch (e) {
            console.warn('🛡️ Could not cache new hardening level');
        }
        
        if (level === 'off') {
            deactivateProtection();
        } else {
            await activateProtection(level);
        }
        
        showProtectionNotification(level);
    }

    async function activateProtection(level) {
        console.log('🛡️ Activating protection:', level);
        const config = PROTECTION_LEVELS[level];
        if (!config) {
            console.error('🛡️ Unknown protection level:', level);
            return;
        }

        protectionActive = true;
        window.hardeningActive = true;
        window.hardeningLevel = level;
        blockedElements = [];

    
        console.log('🛡️ Activating early blocking...');
        activateEarlyBlocking(config);

    
        if ((config.blockJavaScript || config.blockInlineScripts) && !cspInjected) {
            console.log('🛡️ Injecting CSP...');
            injectCSP(config);
        }

    
        console.log('🛡️ Blocking existing elements...');
        blockExistingElements(config);

    
        console.log('🛡️ Setting up mutation observer...');
        setupMutationObserver(config);

    
        if (config.blockWebAPIs && !originalAPIs.eval) {
            console.log('🛡️ Blocking Web APIs...');
            blockWebAPIs(config);
        }

    
        window.hardeningBlockedCount = blockedElements.length;

        console.log(`🛡️ Hardening activated: ${config.name}, blocked ${blockedElements.length} elements`);
    }

    function deactivateProtection() {
        console.log('🛡️ Deactivating protection...');
        protectionActive = false;
        emergencyBlock = false;
        blockedElements = [];
        window.hardeningActive = false;
        window.hardeningLevel = 'off';
        window.hardeningBlockedCount = 0;

    
        deactivateEarlyBlocking();

    
        if (observer) {
            observer.disconnect();
            observer = null;
        }

    
        restoreWebAPIs();

    
        cspInjected = false;

        console.log('🛡️ Hardening deactivated');
    }

    function activateEarlyBlocking(config) {
        if (earlyBlockingActive) {
            console.log('🛡️ Early blocking already active, upgrading configuration...');
        }
        
        console.log('🛡️ Setting up early DOM blocking...');
        
    
        document.createElement = function(tagName) {
            const element = ORIGINAL_METHODS.createElement(tagName);
            const tag = tagName.toLowerCase();
            
        
            if (tag === 'script') {
                if (config.blockJavaScript || config.blockInlineScripts) {
                    console.log('🛡️ Script creation blocked:', tagName);
                    element.type = 'text/plain';
                    element.disabled = true;
                    element.setAttribute('data-hardening-blocked', 'true');
                    blockedElements.push({
                        element: element,
                        tag: tag,
                        reason: 'Script creation blocked',
                        timestamp: Date.now()
                    });
                    window.hardeningBlockedCount = blockedElements.length;
                }
            }
            
        
            if ((config.blockIframes && tag === 'iframe') ||
                (config.blockObjects && tag === 'object') ||
                (config.blockEmbeds && tag === 'embed') ||
                (config.blockForms && tag === 'form')) {
                console.log('🛡️ Element creation blocked:', tagName);
                element.style.display = 'none';
                element.disabled = true;
                element.setAttribute('data-hardening-blocked', 'true');
                blockedElements.push({
                    element: element,
                    tag: tag,
                    reason: 'Element creation blocked',
                    timestamp: Date.now()
                });
                window.hardeningBlockedCount = blockedElements.length;
            }
            
            return element;
        };

    
        Node.prototype.appendChild = function(child) {
            if (child && child.nodeType === Node.ELEMENT_NODE) {
                if (shouldBlockElement(child, config)) {
                    console.log('🛡️ appendChild blocked:', child.tagName);
                    blockElement(child, config);
                    return child; // Return without actually appending
                }
            }
            return ORIGINAL_METHODS.appendChild.call(this, child);
        };

    
        Node.prototype.insertBefore = function(newNode, referenceNode) {
            if (newNode && newNode.nodeType === Node.ELEMENT_NODE) {
                if (shouldBlockElement(newNode, config)) {
                    console.log('🛡️ insertBefore blocked:', newNode.tagName);
                    blockElement(newNode, config);
                    return newNode; // Return without actually inserting
                }
            }
            return ORIGINAL_METHODS.insertBefore.call(this, newNode, referenceNode);
        };

    
        Element.prototype.setAttribute = function(name, value) {
            if (config.blockEventHandlers) {
                const eventAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
                if (eventAttributes.includes(name.toLowerCase())) {
                    console.log('🛡️ Event attribute blocked:', name);
                    return; // Don't set the attribute
                }
            }
            
            if (config.blockDangerousAttributes) {
                const dangerousAttrs = ['javascript:', 'data:', 'vbscript:'];
                if (value && dangerousAttrs.some(dangerous => value.toLowerCase().includes(dangerous))) {
                    console.log('🛡️ Dangerous attribute blocked:', name, value);
                    return; // Don't set the attribute
                }
            }
            
            return ORIGINAL_METHODS.setAttribute.call(this, name, value);
        };

        earlyBlockingActive = true;
        console.log('🛡️ Early blocking activated');
    }

    function deactivateEarlyBlocking() {
        if (!earlyBlockingActive) return;
        
        console.log('🛡️ Deactivating early blocking...');
        
    
        document.createElement = ORIGINAL_METHODS.createElement;
        Node.prototype.appendChild = ORIGINAL_METHODS.appendChild;
        Node.prototype.insertBefore = ORIGINAL_METHODS.insertBefore;
        Element.prototype.setAttribute = ORIGINAL_METHODS.setAttribute;
        
        earlyBlockingActive = false;
        console.log('🛡️ Early blocking deactivated');
    }

    function injectCSP(config) {
        if (cspInjected) {
            console.log('🛡️ CSP already injected');
            return;
        }

        try {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            
            if (config.blockJavaScript) {
            
                meta.content = "script-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none';";
                console.log('🛡️ CSP injected: Mega protection (no scripts)');
            } else if (config.blockInlineScripts) {
            
                if (config.allowTrustedDomains) {
                    const trustedSources = TRUSTED_DOMAINS.map(domain => `https://*.${domain} https://${domain}`).join(' ');
                    meta.content = `script-src 'self' ${trustedSources}; object-src 'none'; frame-src 'self' ${trustedSources};`;
                    console.log('🛡️ CSP injected: Medium protection (trusted domains)');
                } else {
                    meta.content = "script-src 'self'; object-src 'none'; frame-src 'self';";
                    console.log('🛡️ CSP injected: Medium protection (self only)');
                }
            }
            
        
            const target = document.head || document.documentElement;
            if (target) {
                target.insertBefore(meta, target.firstChild);
                cspInjected = true;
                console.log('🛡️ CSP meta tag inserted successfully');
            } else {
                console.warn('🛡️ No head or documentElement found for CSP injection');
            }
        } catch (error) {
            console.error('🛡️ Error injecting CSP:', error);
        }
    }

    function blockExistingElements(config) {
        try {
            const allElements = document.querySelectorAll('*');
            let blockedCount = 0;
            
            allElements.forEach(element => {
                if (shouldBlockElement(element, config)) {
                    blockElement(element, config);
                    blockedCount++;
                }
            });
            
            console.log(`🛡️ Blocked ${blockedCount} existing elements out of ${allElements.length} total`);
        } catch (error) {
            console.error('🛡️ Error blocking existing elements:', error);
        }
    }

    function setupMutationObserver(config) {
        try {
            if (observer) {
                observer.disconnect();
            }
            
            observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (shouldBlockElement(node, config)) {
                                console.log('🛡️ Mutation observer blocked:', node.tagName);
                                blockElement(node, config);
                            }
                            
                        
                            const childElements = node.querySelectorAll ? node.querySelectorAll('*') : [];
                            childElements.forEach(child => {
                                if (shouldBlockElement(child, config)) {
                                    console.log('🛡️ Mutation observer blocked child:', child.tagName);
                                    blockElement(child, config);
                                }
                            });
                        }
                    });
                    
                
                    if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
                        if (shouldBlockElement(mutation.target, config)) {
                            console.log('🛡️ Mutation observer blocked attribute change:', mutation.target.tagName);
                            blockElement(mutation.target, config);
                        }
                    }
                });
            });
            
            observer.observe(document.documentElement || document.body || document, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'href', 'onclick', 'onload', 'onerror']
            });
            
            console.log('🛡️ Mutation observer set up successfully');
        } catch (error) {
            console.error('🛡️ Error setting up mutation observer:', error);
        }
    }

    function shouldBlockElement(element, config) {
        if (!element || !element.tagName) return false;
        
        const tag = element.tagName.toLowerCase();
        const eventAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
        
    
        if (element.hasAttribute('data-hardening-blocked')) {
            return false;
        }
        
    
        if (tag === 'script') {
            if (config.blockJavaScript) {
                console.log('🛡️ Script blocked (all JS blocked):', element);
                return true;
            }
            
            if (config.blockInlineScripts && !element.src) {
                console.log('🛡️ Inline script blocked:', element);
                return true;
            }
            
            if (config.blockExternalScripts && element.src) {
                if (config.allowTrustedDomains && isTrustedDomain(element.src, config)) {
                    console.log('🛡️ Script allowed - trusted domain:', element.src);
                    return false;
                }
                console.log('🛡️ External script blocked:', element.src);
                return true;
            }
        }
        
    
        if ((config.blockIframes && tag === 'iframe') ||
            (config.blockObjects && tag === 'object') ||
            (config.blockEmbeds && tag === 'embed') ||
            (config.blockForms && tag === 'form')) {
            
            if (config.allowTrustedDomains) {
                const src = element.src || element.action || element.data;
                if (src && isTrustedDomain(src, config)) {
                    console.log('🛡️ Element allowed - trusted domain:', tag, src);
                    return false;
                }
            }
            console.log('🛡️ Element blocked:', tag);
            return true;
        }

    
        if (config.blockEventHandlers) {
            if (eventAttributes.some(attr => element.hasAttribute(attr))) {
                console.log('🛡️ Event handler blocked on:', tag);
                return true;
            }
        }

    
        if (config.blockDangerousAttributes) {
            const dangerousAttrs = ['javascript:', 'data:', 'vbscript:'];
            const attributes = ['href', 'src', 'action', 'formaction'];
            
            for (const attr of attributes) {
                const value = element.getAttribute(attr);
                if (value && dangerousAttrs.some(dangerous => value.toLowerCase().includes(dangerous))) {
                    console.log('🛡️ Dangerous attribute blocked:', attr, value);
                    return true;
                }
            }
        }

        return false;
    }

    function blockElement(element, config) {
        try {
            const tag = element.tagName.toLowerCase();
            console.log('🛡️ Blocking element:', tag, element);
            
        
            if (tag === 'script') {
                element.removeAttribute('src');
                element.textContent = '';
                element.type = 'text/plain'; // Change type to prevent execution
                console.log('🛡️ Script neutralized');
            }
            
        
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.disabled = true;
            
        
            const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'href', 'src', 'action'];
            dangerousAttrs.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    element.removeAttribute(attr);
                }
            });

        
            element.setAttribute('data-hardening-blocked', 'true');
            element.title = `Blocked by Blowfish ASE Hardening (${config.name})`;
            
            blockedElements.push({
                element: element,
                tag: tag,
                reason: getBlockReason(element, config),
                timestamp: Date.now()
            });

            console.log('🛡️ Element blocked successfully, total blocked:', blockedElements.length);

        } catch (error) {
            console.error('🛡️ Error blocking element:', error);
        }
    }

    function getBlockReason(element, config) {
        const tag = element.tagName.toLowerCase();
        
        if (tag === 'script') {
            if (config.blockJavaScript) return 'All JavaScript blocked';
            if (!element.src) return 'Inline script blocked';
            return 'External script blocked';
        }
        
        const reasonMap = {
            iframe: 'Iframe blocked',
            object: 'Object element blocked',
            embed: 'Embed element blocked',
            form: 'Form element blocked'
        };
        
        return reasonMap[tag] || 'Dangerous element blocked';
    }

    function isTrustedDomain(url, config) {
        if (!config.allowTrustedDomains || !url) return false;
        
        try {
            const urlObj = new URL(url, window.location.href);
            const hostname = urlObj.hostname.toLowerCase();
            
            return TRUSTED_DOMAINS.some(trusted => 
                hostname === trusted || hostname.endsWith('.' + trusted)
            );
        } catch (error) {
            console.warn('🛡️ Error checking trusted domain:', url, error);
            return false;
        }
    }

    function blockWebAPIs(config) {
        try {
        
            originalAPIs.eval = window.eval;
            originalAPIs.Function = window.Function;
            
        
            window.eval = function() {
                console.log('🛡️ eval() blocked by hardening');
                throw new Error('eval() is disabled by Blowfish ASE Hardening');
            };
            
            window.Function = function() {
                console.log('🛡️ Function constructor blocked by hardening');
                throw new Error('Function constructor is disabled by Blowfish ASE Hardening');
            };
            
            if (config.blockJavaScript) {
            
                originalAPIs.setTimeout = window.setTimeout;
                originalAPIs.setInterval = window.setInterval;
                originalAPIs.XMLHttpRequest = window.XMLHttpRequest;
                originalAPIs.fetch = window.fetch;
                originalAPIs.WebSocket = window.WebSocket;
                
            
                window.setTimeout = function() {
                    console.log('🛡️ setTimeout blocked by hardening');
                    return 0;
                };
                
                window.setInterval = function() {
                    console.log('🛡️ setInterval blocked by hardening');
                    return 0;
                };
                
            
                window.XMLHttpRequest = function() {
                    console.log('🛡️ XMLHttpRequest blocked by hardening');
                    throw new Error('XMLHttpRequest is disabled by Blowfish ASE Hardening');
                };
                
            
                if (window.fetch) {
                    window.fetch = function() {
                        console.log('🛡️ fetch blocked by hardening');
                        return Promise.reject(new Error('fetch is disabled by Blowfish ASE Hardening'));
                    };
                }
                
            
                if (window.WebSocket) {
                    window.WebSocket = function() {
                        console.log('🛡️ WebSocket blocked by hardening');
                        throw new Error('WebSocket is disabled by Blowfish ASE Hardening');
                    };
                }
            }
            
            console.log('🛡️ Web APIs blocked successfully');
        } catch (error) {
            console.error('🛡️ Error blocking Web APIs:', error);
        }
    }

    function restoreWebAPIs() {
        try {
        
            Object.keys(originalAPIs).forEach(api => {
                if (originalAPIs[api]) {
                    window[api] = originalAPIs[api];
                    console.log('🛡️ Restored API:', api);
                }
            });
            
            originalAPIs = {};
            console.log('🛡️ All Web APIs restored');
        } catch (error) {
            console.error('🛡️ Error restoring Web APIs:', error);
        }
    }

    function showProtectionNotification(level) {
        try {
        
            const existing = document.querySelector('#blowfish-hardening-notification');
            if (existing) {
                existing.remove();
            }

            if (level === 'off') return;

            const notification = document.createElement('div');
            notification.id = 'blowfish-hardening-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                z-index: 999999;
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                font-weight: 600;
                max-width: 300px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid rgba(255,255,255,0.2);
            `;

            const config = PROTECTION_LEVELS[level];
            const levelEmojis = { mega: '🔒', medium: '⚖️', low: '🟡' };
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">${levelEmojis[level] || '🛡️'}</div>
                    <div>
                        <div style="margin-bottom: 4px;">Hardening Active</div>
                        <div style="font-size: 12px; opacity: 0.9;">${config ? config.name : level}</div>
                        <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${blockedElements.length} elements blocked</div>
                    </div>
                </div>
            `;

        
            notification.addEventListener('mouseenter', () => {
                notification.style.transform = 'translateY(-2px)';
                notification.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
            });

            notification.addEventListener('mouseleave', () => {
                notification.style.transform = 'translateY(0)';
                notification.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            });

        
            notification.addEventListener('click', () => {
                notification.remove();
            });

        
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);

            document.body.appendChild(notification);

        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }


    window.addEventListener('beforeunload', () => {
        try {
            if (hardeningLevel !== 'off') {
                sessionStorage.setItem('blowfish_hardening_level', hardeningLevel);
                console.log('🛡️ Hardening level cached for next page');
            }
        } catch (e) {
            console.warn('🛡️ Could not cache hardening level on unload');
        }
    });

    console.log('🛡️ Hardening script loaded and ready');

})(); 