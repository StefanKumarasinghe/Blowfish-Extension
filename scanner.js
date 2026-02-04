(function() {
    'use strict';
    const issues = new Map();
    let reputationData = {};
    let vulnerabilityCount = 0;

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const colors = {
        bg: '#ffffff',
        headerBg: '#f8f9fa',
        contentBg: '#ffffff',
        border: '#e9ecef',
        text: '#2d3748',
        textSecondary: '#718096',
        danger: '#e53e3e',
        warning: '#0099cc',
        success: '#38a169',
        info: '#0099cc',
        critical: '#c53030',
        high: '#dd6b20',
        medium: '#d69e2e',
        low: '#319795',
        shadow: '0 10px 25px rgba(0,0,0,0.1)',
        modalOverlay: 'rgba(0,0,0,0.6)',
        codeBg: '#f7fafc',
        codeText: '#2d3748'
    };

    const container = document.createElement('div');
    const header = document.createElement('div');
    const content = document.createElement('div');
    const hideBtn = document.createElement('button');
    const bubble = document.createElement('div');
    const bubbleBadge = document.createElement('div');
    const modal = document.createElement('div');
    const modalContent = document.createElement('div');
    const modalClose = document.createElement('span');
    const modalBody = document.createElement('div');

    Object.assign(container.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '450px',
        maxHeight: '600px',
        background: colors.bg,
        color: colors.text,
        fontFamily: "'Ubuntu Mono', monospace",
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: colors.shadow,
        zIndex: '9999999',
        display: 'none',
        flexDirection: 'column',
        userSelect: 'none',
        cursor: 'move',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(10px)',
    });

    Object.assign(header.style, {
        padding: '20px',
        background: `linear-gradient(135deg, ${colors.headerBg} 0%, #e2e8f0 100%)`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        fontWeight: '700',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'move',
        color: colors.text,
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: "'Ubuntu Mono', monospace",
    });

    Object.assign(content.style, {
        padding: '20px',
        overflowY: 'auto',
        flexGrow: '1',
        maxHeight: '520px',
        background: colors.contentBg,
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        lineHeight: '1.6',
        fontFamily: "'Ubuntu Mono', monospace",
    });


    hideBtn.textContent = '✕';

    Object.assign(bubble.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.bg} 0%, #f1f5f9 100%)`,
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: colors.shadow,
        cursor: 'pointer',
        fontWeight: '900',
        fontSize: '20px',
        userSelect: 'none',
        zIndex: '9999999',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease',
        fontFamily: "'Ubuntu Mono', monospace",
    });

    Object.assign(bubbleBadge.style, {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: colors.danger,
        color: 'white',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: "'Ubuntu Mono', monospace",
        border: '2px solid white',
        zIndex: '10000000',
    });

    bubble.innerHTML = '⛉<br><span style="font-size: 10px; margin-top: 4px;">INIT</span>';
    bubble.appendChild(bubbleBadge);

    Object.assign(modal.style, {
        display: 'none',
        position: 'fixed',
        zIndex: '10000000',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        backgroundColor: colors.modalOverlay,
        backdropFilter: 'blur(5px)',
    });

    Object.assign(modalContent.style, {
        backgroundColor: colors.bg,
        margin: '3% auto',
        padding: '0',
        border: 'none',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        fontFamily: "'Ubuntu Mono', monospace",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    });

    Object.assign(modalClose.style, {
        color: colors.textSecondary,
        fontSize: '24px',
        fontWeight: '700',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        fontFamily: "'Ubuntu Mono', monospace",
    });
    modalClose.innerHTML = '✕';

    Object.assign(modalBody.style, {
        padding: '24px',
        overflow: 'auto',
        flexGrow: '1',
        fontSize: '14px',
        lineHeight: '1.7',
        color: "#000",
        fontFamily: "'Ubuntu Mono', monospace",
    });

    const modalHeader = document.createElement('div');
    Object.assign(modalHeader.style, {
        padding: '24px 24px 0 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: `linear-gradient(135deg, ${colors.headerBg} 0%, #f1f5f9 100%)`,
        fontFamily: "'Ubuntu Mono', monospace",
    });

    const modalTitle = document.createElement('h2');
    Object.assign(modalTitle.style, {
        margin: '0 0 24px 0',
        fontSize: '20px',
        fontWeight: '700',
        color: colors.text,
        lineHeight: '1.3',
        fontFamily: "'Ubuntu Mono', monospace",
    });

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalClose);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);

    header.appendChild(document.createTextNode('Security Scanner Pro'));
    header.appendChild(hideBtn);
    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);
    document.body.appendChild(bubble);
    document.body.appendChild(modal);

    function addIssue(key, message, severity = 'warning', details = {}) {
        if (!issues.has(key)) {
            issues.set(key, {
                message,
                severity,
                details: {
                    description: '',
                    impact: '',
                    solution: '',
                    evidence: [],
                    references: [],
                    ...details
                }
            });
            vulnerabilityCount++;
            updateBubbleBadge();
            
            logMessage(`New issue detected: ${key} - ${message} (${severity})`, 'warn');
        }
    }

    function updateBubbleBadge() {
        if (vulnerabilityCount > 0) {
            bubbleBadge.textContent = vulnerabilityCount > 99 ? '99+' : vulnerabilityCount;
            bubbleBadge.style.display = 'flex';
            
    
            const severities = Array.from(issues.values()).map(issue => (issue.severity || '').toString().toLowerCase());
            const hasCritical = severities.includes('critical');
            const hasHigh = severities.includes('high');
            const hasMedium = severities.includes('medium');
            
            if (hasCritical) {
                bubbleBadge.style.background = colors.critical;
                bubble.style.borderColor = colors.critical;
                bubble.style.borderWidth = '2px';
            } else if (hasHigh) {
                bubbleBadge.style.background = colors.high;
                bubble.style.borderColor = colors.high;
                bubble.style.borderWidth = '2px';
            } else if (hasMedium) {
                bubbleBadge.style.background = colors.medium;
                bubble.style.borderColor = colors.medium;
                bubble.style.borderWidth = '2px';
            } else {
                bubbleBadge.style.background = colors.low;
                bubble.style.borderColor = colors.low;
                bubble.style.borderWidth = '2px';
            }
        } else {
            bubbleBadge.style.display = 'none';
            bubble.style.borderColor = colors.success;
            bubble.style.borderWidth = '2px';
        }
    }

    function createCodeSnippet(code, language = 'html') {
        return `
            <div style="
                background: ${colors.codeBg};
                border: 1px solid ${colors.border};
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
                font-family: 'Ubuntu Mono', monospace;
                font-size: 13px;
                overflow-x: auto;
                color: ${colors.codeText};
                line-height: 1.5;
            ">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        `;
    }

    function showModal(issueKey) {
        const issue = issues.get(issueKey);
        if (!issue || !issue.details) return;

        modalTitle.textContent = issue.details.title || issue.message;
        
        let modalHTML = `
            <div style="margin-bottom: 24px;">
                <div style="
                    display: inline-block;
                    background: ${getSeverityColor(issue.severity)};
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                ">${issue.severity} Risk</div>
                <h3 style="color: ${colors.danger}; margin-bottom: 12px; font-size: 16px;">Description</h3>
                <p style="margin-bottom: 16px;">${issue.details.description || issue.message}</p>
        `;

        if (issue.details.evidence && issue.details.evidence.length > 0) {
            modalHTML += `
                <h3 style="color: ${colors.warning}; margin-bottom: 12px; font-size: 16px;">Evidence Found</h3>
            `;
            issue.details.evidence.forEach((evidence, index) => {
                modalHTML += `
                    <div style="margin-bottom: 16px;">
                        <strong>${evidence.type}:</strong> ${evidence.description}
                        ${evidence.code ? createCodeSnippet(evidence.code) : ''}
                        ${evidence.location ? `<p style="font-size: 13px; color: ${colors.textSecondary};">Location: ${evidence.location}</p>` : ''}
            </div>
                `;
            });
        }

        modalHTML += `
            </div>
            <div style="margin-bottom: 24px;">
                <h3 style="color: ${colors.warning}; margin-bottom: 12px; font-size: 16px;">Security Impact</h3>
                <p>${issue.details.impact || 'This vulnerability could pose a security risk to users and the application.'}</p>
            </div>
            <div style="margin-bottom: 24px;">
                <h3 style="color: ${colors.success}; margin-bottom: 12px; font-size: 16px;">Recommended Solution</h3>
                <p>${issue.details.solution || 'Review and implement appropriate security measures.'}</p>
            </div>
        `;

        if (issue.details.references && issue.details.references.length > 0) {
            modalHTML += `
                <div>
                    <h3 style="color: ${colors.info}; margin-bottom: 12px; font-size: 16px;">References</h3>
                    <ul style="margin: 0; padding-left: 20px;">
            `;
            issue.details.references.forEach(ref => {
                modalHTML += `<li style="margin-bottom: 8px;"><a href="${ref.url}" target="_blank" style="color: ${colors.info}; text-decoration: none;">${ref.title}</a></li>`;
            });
            modalHTML += '</ul></div>';
        }

        modalBody.innerHTML = modalHTML;
        modal.style.display = 'block';
    }

    function getSeverityColor(severity) {
        const colorMap = {
            critical: colors.critical,
            high: colors.high,
            medium: colors.medium,
            low: colors.low,
            warning: colors.warning
        };
        return colorMap[severity] || colors.warning;
    }

    function displayIssues() {
        content.innerHTML = '';
        
        if (issues.size === 0) {
            const el = document.createElement('div');
            el.style.cssText = `
                color: ${colors.success};
                text-align: center;
                padding: 32px 20px;
                font-weight: 700;
                border: 2px solid ${colors.success};
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(56, 161, 105, 0.1) 0%, rgba(56, 161, 105, 0.05) 100%);
                font-size: 16px;
                font-family: 'Ubuntu Mono', monospace;
            `;
            el.innerHTML = '✅ No security issues detected<br><span style="font-size: 14px; font-weight: 400; opacity: 0.8;">Your site appears to be secure</span>';
            content.appendChild(el);
            return;
        }


        const stats = document.createElement('div');
        stats.style.cssText = `
            margin-bottom: 20px;
            padding: 16px;
            background: linear-gradient(135deg, ${colors.headerBg} 0%, #f1f5f9 100%);
            border-radius: 12px;
            font-weight: 700;
            border: 1px solid ${colors.border};
            font-family: 'Ubuntu Mono', monospace;
        `;
        
        const criticalCount = Array.from(issues.values()).filter(i => i.severity === 'critical').length;
        const highCount = Array.from(issues.values()).filter(i => i.severity === 'high').length;
        const mediumCount = Array.from(issues.values()).filter(i => i.severity === 'medium').length;
        const lowCount = Array.from(issues.values()).filter(i => i.severity === 'low').length;
        
        stats.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 16px;">Issues Found: ${issues.size}</span>
                <span style="font-size: 12px; color: ${colors.textSecondary};">Click for details</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px;">
                <div style="text-align: center; padding: 8px; border-radius: 6px; background: ${colors.critical}; color: white;">Critical: ${criticalCount}</div>
                <div style="text-align: center; padding: 8px; border-radius: 6px; background: ${colors.high}; color: white;">High: ${highCount}</div>
                <div style="text-align: center; padding: 8px; border-radius: 6px; background: ${colors.medium}; color: white;">Medium: ${mediumCount}</div>
                <div style="text-align: center; padding: 8px; border-radius: 6px; background: ${colors.low}; color: white;">Low: ${lowCount}</div>
            </div>
        `;
        content.appendChild(stats);


        if (Object.keys(reputationData).length > 0 && reputationData.status === 'completed') {
            const repEl = document.createElement('div');
            repEl.style.cssText = `
                margin-bottom: 20px;
                padding: 16px;
                background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
                border-radius: 12px;
                border: 1px solid ${colors.success};
                font-size: 13px;
                font-family: 'Ubuntu Mono', monospace;
            `;
            
            const summary = reputationData.summary || {};
            let ratingColor;
            if (summary.overall_rating === 'excellent') {
                ratingColor = '#10b981';
            } else if (summary.overall_rating === 'good') {
                ratingColor = colors.success;
            } else if (summary.overall_rating === 'moderate') {
                ratingColor = colors.warning;
            } else if (summary.overall_rating === 'suspicious') {
                ratingColor = '#f59e0b';
            } else {
                ratingColor = colors.danger;
            }
            
            let repHTML = `
                <div style="font-weight: 700; margin-bottom: 16px; color: ${colors.success}; display: flex; align-items: center; gap: 8px;">
                    🌐 Domain Intelligence Report
                    <span style="font-size: 11px; background: white; padding: 2px 6px; border-radius: 10px; color: ${colors.textSecondary};">
                        ${summary.available_services}/${summary.total_checks} sources
                    </span>
                </div>
            `;
            
        
            repHTML += `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: ${colors.textSecondary}; margin-bottom: 4px;">OVERALL RATING</div>
                        <div style="font-weight: 700; color: ${ratingColor}; text-transform: uppercase; font-size: 12px;">
                            ${summary.overall_rating?.replace('_', ' ') || 'Unknown'}
                        </div>
                    </div>
            `;
            
        
            if (summary.domain_info?.calculated_age_years !== undefined && summary.domain_info.calculated_age_years !== null) {
                const age = summary.domain_info.calculated_age_years;
                let ageColor;
                if (age >= 5) {
                    ageColor = colors.success;
                } else if (age >= 2) {
                    ageColor = colors.warning;
                } else {
                    ageColor = colors.danger;
                }
                repHTML += `
                    <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: ${colors.textSecondary}; margin-bottom: 4px;">DOMAIN AGE</div>
                        <div style="font-weight: 700; color: ${ageColor}; font-size: 12px;">
                            ${summary.domain_info.calculated_age_years} years
                        </div>
                    </div>
                `;
            } else {
                repHTML += `
                    <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: ${colors.textSecondary}; margin-bottom: 4px;">LAST ARCHIVED</div>
                        <div style="font-weight: 700; color: ${colors.textSecondary}; font-size: 12px;">
                            ${summary.domain_info?.first_seen || 'Unknown'}
                        </div>
                    </div>
                `;
            }
            
        
            if (summary.domain_info?.risk_level) {
                const trustColor = summary.domain_info.risk_level === 'very_low' ? colors.success :
                                 summary.domain_info.risk_level === 'low' ? '#10b981' :
                                 summary.domain_info.risk_level === 'medium' ? colors.warning : colors.danger;
                repHTML += `
                    <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: ${colors.textSecondary}; margin-bottom: 4px;">RISK LEVEL</div>
                        <div style="font-weight: 700; color: ${trustColor}; text-transform: uppercase; font-size: 12px;">
                            ${summary.domain_info.risk_level.replace('_', ' ')}
                        </div>
                    </div>
                `;
            } else {
                repHTML += `
                    <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: ${colors.textSecondary}; margin-bottom: 4px;">ANALYSIS</div>
                        <div style="font-weight: 700; color: ${colors.textSecondary}; font-size: 12px;">
                            ${summary.risk_indicators || 0} risks
                        </div>
                    </div>
                `;
            }
            
            repHTML += '</div>';
            
        
            if (summary.domain_info && Object.keys(summary.domain_info).length > 0) {
                repHTML += `
                    <div style="background: rgba(255,255,255,0.7); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-weight: 700; margin-bottom: 8px; color: ${colors.text}; font-size: 12px;">📊 Domain Details</div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px;">
                `;
                
            
                const domainInfo = summary.domain_info;
                const infoItems = [];
                
                if (domainInfo.creation_date) {
                    infoItems.push({
                        label: 'Created',
                        value: new Date(domainInfo.creation_date).toLocaleDateString()
                    });
                }
                
                if (domainInfo.registrar) {
                    infoItems.push({
                        label: 'Registrar',
                        value: domainInfo.registrar.substring(0, 20)
                    });
                }
                
                if (domainInfo.country) {
                    infoItems.push({
                        label: 'Location',
                        value: domainInfo.country
                    });
                }
                
                if (domainInfo.tld_category) {
                    infoItems.push({
                        label: 'TLD Type',
                        value: domainInfo.tld_category.replace('_', ' ')
                    });
                }
                
                if (domainInfo.age_assessment) {
                    infoItems.push({
                        label: 'Age Category',
                        value: domainInfo.age_assessment.replace('_', ' ')
                    });
                }
                
                if (domainInfo.hosting_org) {
                    infoItems.push({
                        label: 'Hosting',
                        value: domainInfo.hosting_org.substring(0, 20)
                    });
                }
                
                infoItems.forEach(item => {
                    repHTML += `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span style="color: ${colors.textSecondary};">${item.label}:</span>
                            <span style="color: ${colors.text}; font-weight: 600;">${item.value}</span>
                        </div>
                    `;
                });
                
                repHTML += '</div></div>';
            }
            
        
            if (reputationData.results && reputationData.results.length > 0) {
                repHTML += '<div style="margin-top: 12px;"><div style="font-size: 12px; font-weight: 700; margin-bottom: 8px; color: ${colors.text};">🔍 Analysis Sources</div>';
                
            
                const importantResults = reputationData.results.filter(r => 
                    r.service.includes('Domain Analysis') || 
                    r.service.includes('WHOIS') || 
                    r.service.includes('History')
                );
                
                const securityResults = reputationData.results.filter(r => 
                    r.service.includes('Malware') || 
                    r.service.includes('Threat') || 
                    r.service.includes('Safe')
                );
                
                const infrastructureResults = reputationData.results.filter(r => 
                    r.service.includes('Infrastructure') || 
                    r.service.includes('Geolocation') || 
                    r.service.includes('DNS')
                );
                
            
                [...importantResults, ...securityResults, ...infrastructureResults].forEach(result => {
                    if (result.status !== 'unavailable') {
                        const statusColor = result.status === 'found' ? colors.info : 
                                          result.status === 'analyzed' ? colors.success : colors.textSecondary;
                        
                        const riskLevel = result.data?.risk_assessment || result.data?.risk_level || 'none';
                        let riskBadge = '';
                        if (riskLevel && riskLevel !== 'none') {
                            let riskColor;
                            if (riskLevel === 'high' || riskLevel === 'critical') {
                                riskColor = colors.danger;
                            } else if (riskLevel === 'medium') {
                                riskColor = colors.warning;
                            } else {
                                riskColor = colors.success;
                            }
                            riskBadge = `<span style="background: ${riskColor}; 
                                          color: white; padding: 2px 6px; border-radius: 10px; font-size: 9px; margin-left: 8px;">
                                ${riskLevel.toUpperCase()}
                            </span>`;
                        }
                        
                        repHTML += `
                            <div style="margin-bottom: 6px; padding: 8px; background: white; border-radius: 6px; font-size: 11px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <span style="font-weight: 700;">${result.service}</span>
                                    <div>
                                        <span style="color: ${statusColor};">${result.status}</span>
                                        ${riskBadge}
                                    </div>
                                </div>
                                ${result.data && typeof result.data === 'object' ? 
                                    `<div style="margin-top: 6px; color: ${colors.textSecondary}; font-size: 10px; line-height: 1.4;">
                                        ${Object.entries(result.data)
                                            .filter(([key, value]) => value !== null && value !== undefined && value !== '' && !key.includes('analysis_summary'))
                                            .slice(0, 2)
                                            .map(([key, value]) => {
                                                const displayValue = Array.isArray(value) ? 
                                                    value.join(', ').substring(0, 40) : 
                                                    (typeof value === 'string' ? value.substring(0, 40) : String(value));
                                                return `<div><strong>${key.replace(/_/g, ' ')}:</strong> ${displayValue}</div>`;
                                            })
                                            .join('')}
                                    </div>` : ''}
                            </div>
                        `;
                    }
                });
                
                repHTML += '</div>';
            }
            
            repEl.innerHTML = repHTML;
            content.appendChild(repEl);
        } else if (reputationData.status === 'analyzing...') {
            const repEl = document.createElement('div');
            repEl.style.cssText = `
                margin-bottom: 20px;
                padding: 16px;
                background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                border-radius: 12px;
                border: 1px solid ${colors.warning};
                font-size: 13px;
                font-family: 'Ubuntu Mono', monospace;
                text-align: center;
            `;
            repEl.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 8px; color: ${colors.warning};">🔍 Analyzing Domain Intelligence...</div>
                <div style="color: ${colors.textSecondary};">Gathering comprehensive domain information from multiple sources</div>
            `;
            content.appendChild(repEl);
        }

        const sortedIssues = Array.from(issues.entries()).sort(([,a], [,b]) => {
            const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, warning: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });

        sortedIssues.forEach(([key, issue]) => {
            const el = document.createElement('div');
            const severityColor = getSeverityColor(issue.severity);

            el.style.cssText = `
                margin-bottom: 16px;
                border-radius: 12px;
                border: 1px solid ${colors.border};
                background: linear-gradient(135deg, ${colors.bg} 0%, #fafbfc 100%);
                cursor: pointer;
                transition: all 0.3s ease;
                overflow: hidden;
                position: relative;
                font-family: 'Ubuntu Mono', monospace;
            `;
            
    
            el.innerHTML = `
                <div style="
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    gap: 16px;
                    padding: 16px;
                    align-items: flex-start;
                ">
                    <div style="
                        background: ${severityColor};
                color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                        white-space: nowrap;
                        grid-column: 1;
                        font-family: 'Ubuntu Mono', monospace;
                    ">${issue.severity}</div>
                    
                    <div style="
                        grid-column: 2;
                        min-width: 0;
                        line-height: 1.5;
                        font-weight: 400;
                        font-family: 'Ubuntu Mono', monospace;
                    ">
                        <div style="margin-bottom: 4px; font-weight: 700;">${issue.message}</div>
                        ${issue.details.evidence ? 
                            `<div style="font-size: 12px; color: ${colors.textSecondary}; margin-top: 8px;">
                                ${issue.details.evidence.length} piece(s) of evidence found
                            </div>` : ''}
                    </div>
                    
                    <div style="
                        grid-column: 3;
                color: ${colors.info};
                        font-size: 12px;
                font-weight: 700;
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-family: 'Ubuntu Mono', monospace;
                    ">
                        DETAILS →
                    </div>
                </div>
            `;
            
            el.addEventListener('click', () => showModal(key));
            content.appendChild(el);
        });
    }


    hideBtn.onclick = () => {
        container.style.display = 'none';
        bubble.style.display = 'flex';
    };

    bubble.onclick = () => {
        container.style.display = 'flex';
        bubble.style.display = 'none';
    };

    modalClose.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // THESE ARE THE DOMAIN REPUTATION CHECKS

    async function checkDomainReputation() {
        try {
            const hostname = location.hostname;
            
            reputationData = {
                domain: hostname,
                checked: new Date().toISOString(),
                status: 'analyzing...'
            };
            
            const reputationChecks = await Promise.allSettled([
                checkWhoisData(hostname),
                checkDomainAge(hostname),
                checkShodanData(hostname),
                checkDomainHistory(hostname)
            ]);
            
            const results = reputationChecks.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.log(`Reputation check ${index} failed:`, result.reason);
                    return null;
                }
            }).filter(Boolean);
            
            reputationData = {
                ...reputationData,
                status: 'completed',
                results: results,
                summary: generateReputationSummary(results)
            };
            
        } catch (error) {
            console.log('Reputation check failed:', error);
            reputationData.status = 'failed';
            reputationData.error = error.message;
        }
    }

    async function checkShodanData(hostname) {
        try {
            const hostData = {};
            const dnsQueries = [
                { type: 'A', name: 'ipv4_addresses' },
                { type: 'AAAA', name: 'ipv6_addresses' },
                { type: 'MX', name: 'mail_servers' },
                { type: 'NS', name: 'name_servers' },
                { type: 'CNAME', name: 'aliases' }
            ];
            
            for (const query of dnsQueries) {
                try {
                    const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=${query.type}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.Answer && data.Answer.length > 0) {
                            hostData[query.name] = data.Answer.map(answer => answer.data).join(', ');
                        }
                    }
                } catch (e) {
                    console.warn(`DNS query for ${query.type} failed:`, e);
                }
            }
            
            const parts = hostname.split('.');
            if (parts.length > 2) {
                hostData.subdomain_structure = parts.slice(0, -2).join('.');
                hostData.apex_domain = parts.slice(-2).join('.');
            }
            
            const serviceIndicators = {
                'cdn': /cdn|cloudflare|fastly|maxcdn|akamai/i,
                'cloud': /aws|google|azure|cloud|compute/i,
                'security': /security|firewall|proxy|guard/i,
                'email': /mail|smtp|imap|pop/i
            };
            
            for (const [service, pattern] of Object.entries(serviceIndicators)) {
                if (pattern.test(hostname) || pattern.test(hostData.name_servers || '')) {
                    hostData[`uses_${service}`] = 'detected';
                }
            }
            
            if (Object.keys(hostData).length > 0) {
                return {
                    service: 'Infrastructure Analysis',
                    status: 'analyzed',
                    data: hostData
                };
            }
            
        } catch (e) {
            console.log('Infrastructure analysis failed:', e);
        }
        
        return { service: 'Infrastructure Analysis', status: 'unavailable' };
    }

    async function checkDomainHistory(hostname) {
        try {
            const historyData = {};
            try {
                const waybackResponse = await fetch(`https://archive.org/wayback/available?url=${hostname}`);
                if (waybackResponse.ok) {
                    const waybackData = await waybackResponse.json();
                    if (waybackData.archived_snapshots?.closest) {
                        const snapshot = waybackData.archived_snapshots.closest;
                        historyData.first_seen_wayback = snapshot.timestamp;
                        historyData.wayback_url = snapshot.url;
                        
                        const firstSeen = new Date(
                            snapshot.timestamp.substring(0, 4),
                            Number.parseInt(snapshot.timestamp.substring(4, 6)) - 1,
                            snapshot.timestamp.substring(6, 8)
                        );
                        const daysSinceFirstSeen = Math.floor((Date.now() - firstSeen) / (1000 * 60 * 60 * 24));
                        historyData.days_since_first_seen = daysSinceFirstSeen;
                        historyData.years_since_first_seen = Math.floor(daysSinceFirstSeen / 365);
                    }
                }
            } catch (e) {
                console.log('Wayback Machine check failed:', e);
            }
            
            const parts = hostname.split('.');
            const domain = parts[parts.length - 2];
            
            const establishedPatterns = {
                'common_words': /^(shop|store|news|blog|forum|wiki|help|support|docs|api|app|web|site|home|main|www)$/i,
                'company_pattern': /^[a-z]+(corp|inc|ltd|llc|co|company)$/i,
                'established_length': domain && domain.length >= 6 && domain.length <= 15
            };
            
            let establishedScore = 0;
            for (const [pattern, regex] of Object.entries(establishedPatterns)) {
                if (typeof regex === 'boolean' ? regex : regex.test(domain)) {
                    establishedScore++;
                    historyData[pattern] = 'yes';
                }
            }
            
            historyData.establishment_score = establishedScore;
            
            if (Object.keys(historyData).length > 0) {
                return {
                    service: 'Domain History',
                    status: 'analyzed',
                    data: historyData
                };
            }
            
        } catch (e) {
            console.log('Domain history check failed:', e);
        }
        
        return { service: 'Domain History', status: 'unavailable' };
    }
    

    
    async function checkWhoisData(hostname) {
        try {
        
            const results = await Promise.allSettled([
                checkDomainAPI(hostname),
                checkIPLocationData(hostname)
            ]);
            
            let combinedData = {};
            
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.data) {
                    combinedData = { ...combinedData, ...result.value.data };
                }
            }
            
            if (Object.keys(combinedData).length > 0) {
                return {
                    service: 'Enhanced WHOIS/Domain Info',
                    status: 'found',
                    data: combinedData
                };
            }
            
        
            const response = await fetch(`https://ipapi.co/${hostname}/json/`).catch(() => null);
            
            if (response && response.ok) {
                const data = await response.json();
                
                const cleanData = {};
                if (data.country_name) cleanData.country = data.country_name;
                if (data.region) cleanData.region = data.region;
                if (data.city) cleanData.city = data.city;
                if (data.org) cleanData.organization = data.org;
                if (data.timezone) cleanData.timezone = data.timezone;
                if (data.asn) cleanData.asn = data.asn;
                if (data.ip) cleanData.ip = data.ip;
                if (data.version) cleanData.ip_version = data.version;
                
                if (Object.keys(cleanData).length > 0) {
                    return {
                        service: 'WHOIS/IP Info',
                        status: 'found',
                        data: cleanData
                    };
                }
            }
            
        
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`).catch(() => null);
            if (dnsResponse?.ok) {
                const dnsData = await dnsResponse.json();
                
                const cleanDnsData = {};
                if (dnsData.Answer && dnsData.Answer.length > 0) {
                    cleanDnsData.ip_addresses = dnsData.Answer.map(answer => answer.data).filter(Boolean);
                }
                if (dnsData.Status !== undefined) {
                    cleanDnsData.dns_status = dnsData.Status === 0 ? 'resolved' : 'failed';
                }
                
                if (Object.keys(cleanDnsData).length > 0) {
                    return {
                        service: 'DNS Info',
                        status: 'found',
                        data: cleanDnsData
                    };
                }
            }
        } catch (e) {
            logMessage('WHOIS check failed: ' + e.message, 'warning');
        }
        
        return { service: 'WHOIS', status: 'unavailable' };
    }

    async function checkDomainAPI(hostname) {
        try {
        
            const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=TXT`).catch(() => null);
            
            if (response && response.ok) {
                const data = await response.json();
                const domainData = {};
                
            
                if (data.Answer) {
                    const txtRecords = data.Answer.map(answer => answer.data).filter(Boolean);
                    if (txtRecords.length > 0) {
                        domainData.txt_records_count = txtRecords.length;
                        
                    
                        const verificationRecords = txtRecords.filter(record => 
                            record.includes('v=spf') || 
                            record.includes('google-site-verification') ||
                            record.includes('facebook-domain-verification') ||
                            record.includes('_dmarc')
                        );
                        
                        if (verificationRecords.length > 0) {
                            domainData.has_verification_records = 'yes';
                            domainData.verification_types = verificationRecords.length;
                        } else {
                            domainData.has_verification_records = 'no';
                        }
                    }
                }
                
            
                const soaResponse = await fetch(`https://dns.google/resolve?name=${hostname}&type=SOA`).catch(() => null);
                if (soaResponse && soaResponse.ok) {
                    const soaData = await soaResponse.json();
                    if (soaData.Answer && soaData.Answer.length > 0) {
                        domainData.has_soa_record = 'yes';
                        domainData.primary_nameserver = soaData.Answer[0].data.split(' ')[0];
                    }
                }
                
                if (Object.keys(domainData).length > 0) {
                    return {
                        service: 'DNS Analysis',
                        status: 'found',
                        data: domainData
                    };
                }
            }
        } catch (e) {
            logMessage('Domain API check failed: ' + e.message, 'warning');
        }
        
        return { service: 'DNS Analysis', status: 'unavailable' };
    }


    async function checkIPLocationData(hostname) {
        try {
        
            const ipResponse = await fetch(`https://ipapi.co/${hostname}/json/`).catch(() => null);
            
            if (ipResponse && ipResponse.ok) {
                const data = await ipResponse.json();
                
                const locationData = {};
                if (data.country_name) locationData.country = data.country_name;
                if (data.country_code) locationData.country_code = data.country_code;
                if (data.region) locationData.region = data.region;
                if (data.city) locationData.city = data.city;
                if (data.org) locationData.organization = data.org;
                if (data.asn) locationData.asn = data.asn;
                if (data.ip) locationData.resolved_ip = data.ip;
                if (data.timezone) locationData.timezone = data.timezone;
                if (data.currency) locationData.currency = data.currency;
                if (data.languages) locationData.languages = data.languages;
                
            
                if (data.threat) {
                    locationData.threat_detected = data.threat;
                }
                
                return {
                    service: 'IP Geolocation',
                    status: 'found',
                    data: locationData
                };
            }
        } catch (e) {
            logMessage('IP location check failed: ' + e.message, 'warning');
        }
        
        return { service: 'IP Geolocation', status: 'unavailable' };
    }
    
    async function checkDomainAge(hostname) {
        try {
            const indicators = {
                service: 'Enhanced Domain Analysis',
                status: 'analyzed',
                data: {}
            };
            
        
            const parts = hostname.split('.');
            const tld = parts[parts.length - 1];
            const domain = parts[parts.length - 2] || hostname;
            
            indicators.data.domain_name = domain;
            indicators.data.tld = tld;
            indicators.data.full_domain = hostname;
            indicators.data.domain_length = domain.length;
            indicators.data.subdomain_count = Math.max(0, parts.length - 2);
            indicators.data.total_length = hostname.length;
            
        
            const suspiciousPatterns = [
                { pattern: /\d{4,}/, name: 'many_numbers', weight: 2 },
                { pattern: /[a-z]{20,}/, name: 'very_long_strings', weight: 2 },
                { pattern: /-{2,}/, name: 'multiple_hyphens', weight: 3 },
                { pattern: /^(www\d+|mail\d+|ftp\d+)/, name: 'numbered_subdomains', weight: 2 },
                { pattern: /[0-9]+-[0-9]+-[0-9]+-[0-9]+/, name: 'ip_like_structure', weight: 4 },
                { pattern: /[a-z]{1,3}\d{1,3}[a-z]{1,3}/, name: 'mixed_alphanumeric', weight: 1 },
                { pattern: /(.)\1{3,}/, name: 'repeated_characters', weight: 2 },
                { pattern: /^[a-z]{1,2}$/, name: 'very_short_domain', weight: 3 }
            ];
            
            const foundPatterns = suspiciousPatterns.filter(({pattern}) => pattern.test(hostname));
            indicators.data.suspicious_patterns = foundPatterns.length;
            indicators.data.pattern_details = foundPatterns.map(p => p.name).join(', ');
            
        
            const suspiciousTlds = {
                'high_risk': ['.tk', '.ml', '.ga', '.cf', '.pw'],
                'medium_risk': ['.click', '.download', '.club', '.top', '.work', '.party', '.racing'],
                'suspicious_new': ['.xyz', '.online', '.site', '.tech', '.store']
            };
            
            let tldRisk = 'low';
            if (suspiciousTlds.high_risk.includes('.' + tld)) {
                tldRisk = 'high';
                indicators.data.tld_risk_level = 'high';
            } else if (suspiciousTlds.medium_risk.includes('.' + tld)) {
                tldRisk = 'medium';
                indicators.data.tld_risk_level = 'medium';
            } else if (suspiciousTlds.suspicious_new.includes('.' + tld)) {
                tldRisk = 'low-medium';
                indicators.data.tld_risk_level = 'low-medium';
            } else {
                indicators.data.tld_risk_level = 'low';
            }
            
        
            const popularTlds = ['.com', '.org', '.net', '.edu', '.gov', '.mil'];
            const ccTlds = ['.us', '.uk', '.de', '.fr', '.jp', '.ca', '.au', '.br', '.in', '.cn'];
            
            if (popularTlds.includes('.' + tld)) {
                indicators.data.tld_category = 'popular_generic';
            } else if (ccTlds.includes('.' + tld)) {
                indicators.data.tld_category = 'country_code';
            } else {
                indicators.data.tld_category = 'other';
            }
            
        
            let riskScore = 0;
            foundPatterns.forEach(pattern => riskScore += pattern.weight);
            
            if (tldRisk === 'high') riskScore += 4;
            else if (tldRisk === 'medium') riskScore += 2;
            else if (tldRisk === 'low-medium') riskScore += 1;
            
            if (parts.length > 4) riskScore += 2;
            if (domain.length < 4) riskScore += 2;
            if (hostname.length > 50) riskScore += 1;
            
        
            if (riskScore >= 8) {
                indicators.data.risk_assessment = 'critical';
                indicators.data.estimated_age = 'likely_very_new';
                indicators.data.trust_score = 10;
            } else if (riskScore >= 6) {
                indicators.data.risk_assessment = 'high';
                indicators.data.estimated_age = 'likely_new';
                indicators.data.trust_score = 25;
            } else if (riskScore >= 3) {
                indicators.data.risk_assessment = 'medium';
                indicators.data.estimated_age = 'unknown';
                indicators.data.trust_score = 50;
            } else if (riskScore >= 1) {
                indicators.data.risk_assessment = 'low';
                indicators.data.estimated_age = 'likely_established';
                indicators.data.trust_score = 75;
            } else {
                indicators.data.risk_assessment = 'very_low';
                indicators.data.estimated_age = 'likely_well_established';
                indicators.data.trust_score = 90;
            }
            
            indicators.data.risk_score = riskScore;
            indicators.data.analysis_summary = `${domain}.${tld} (${indicators.data.risk_assessment} risk, trust: ${indicators.data.trust_score}%)`;
            
            return indicators;
        } catch (e) {
            console.log('Enhanced domain analysis failed:', e);
        }
        
        return { service: 'Enhanced Domain Analysis', status: 'unavailable' };
    }

    
    
    function generateReputationSummary(results) {
        const summary = {
            total_checks: results.length,
            available_services: results.filter(r => r.status !== 'unavailable').length,
            risk_indicators: 0,
            overall_rating: 'unknown',
            details: [],
            domain_info: {},
            security_metrics: {}
        };
        
    
        let domainAge = null;
        let trustScore = null;
        let creationDate = null;
        let firstSeen = null;
        
        results.forEach(result => {
            if (result.data && typeof result.data === 'object') {
                
            
                if (result.service === 'Enhanced Domain Analysis') {
                    if (result.data.trust_score) trustScore = result.data.trust_score;
                    if (result.data.domain_age_years) domainAge = result.data.domain_age_years;
                    if (result.data.risk_assessment) {
                        summary.domain_info.risk_level = result.data.risk_assessment;
                        summary.domain_info.estimated_age = result.data.estimated_age;
                    }
                    if (result.data.tld_category) summary.domain_info.tld_category = result.data.tld_category;
                    if (result.data.tld_risk_level) summary.domain_info.tld_risk = result.data.tld_risk_level;
                }
                
            
                if (result.service === 'WHOIS JSON API' || result.service === 'Enhanced WHOIS/Domain Info') {
                    if (result.data.creation_date) {
                        creationDate = result.data.creation_date;
                        summary.domain_info.creation_date = result.data.creation_date;
                    }
                    if (result.data.domain_age_days) {
                        summary.domain_info.age_days = result.data.domain_age_days;
                        domainAge = Math.floor(result.data.domain_age_days / 365);
                    }
                    if (result.data.registrar) summary.domain_info.registrar = result.data.registrar;
                    if (result.data.expiration_date) summary.domain_info.expiration_date = result.data.expiration_date;
                }
                
            
                if (result.service === 'Domain History') {
                    if (result.data.first_seen_wayback) {
                        firstSeen = result.data.first_seen_wayback;
                        
                        try {
                            const firstSeenTimestamp = result.data.first_seen_wayback.toString();
                            if (firstSeenTimestamp.length >= 8) {
                                const year = parseInt(firstSeenTimestamp.substring(0, 4));
                                const month = parseInt(firstSeenTimestamp.substring(4, 6)) - 1;
                                const day = parseInt(firstSeenTimestamp.substring(6, 8));
                                const firstSeenDate = new Date(year, month, day);
                                summary.domain_info.first_seen = firstSeenDate.toLocaleDateString();
                            } else {
                                summary.domain_info.first_seen = result.data.first_seen_wayback;
                            }
                        } catch (e) {
                            summary.domain_info.first_seen = result.data.first_seen_wayback;
                        }
                        summary.domain_info.years_since_first_seen = result.data.years_since_first_seen;
                    }
                }
                
            
                if (result.service === 'IP Geolocation') {
                    if (result.data.country) summary.domain_info.country = result.data.country;
                    if (result.data.organization) summary.domain_info.hosting_org = result.data.organization;
                }
                
                if (result.service === 'Infrastructure Analysis') {
                    if (result.data.uses_cdn) summary.security_metrics.uses_cdn = result.data.uses_cdn;
                    if (result.data.uses_cloud) summary.security_metrics.uses_cloud = result.data.uses_cloud;
                }
                
            
                if (result.data.risk_assessment === 'critical' || 
                    result.data.risk_level === 'critical') {
                    summary.risk_indicators += 3;
                    summary.details.push(`${result.service}: Critical risk detected`);
                } else if (result.data.risk_assessment === 'high' || 
                    result.data.risk_level === 'high' ||
                    (result.data.suspicious_patterns && result.data.suspicious_patterns > 2) || 
                    result.data.tld_risk_level === 'high') {
                    summary.risk_indicators += 2;
                    summary.details.push(`${result.service}: High risk detected`);
                } else if (result.data.risk_assessment === 'medium' || 
                          result.data.risk_level === 'medium' ||
                          result.data.tld_risk_level === 'medium') {
                    summary.risk_indicators += 1;
                    summary.details.push(`${result.service}: Medium risk detected`);
                }
                
            
                if ((result.service.includes('WHOIS') || result.service.includes('Domain')) && result.status === 'found') {
                    const dataKeys = Object.keys(result.data);
                    if (dataKeys.length > 3) {
                        summary.details.push(`${result.service}: Good data availability (${dataKeys.length} fields)`);
                    }
                }
            }
        });
        
    
        if (domainAge !== null) {
            summary.domain_info.calculated_age_years = domainAge;
            if (domainAge >= 10) {
                summary.domain_info.age_assessment = 'well_established';
            } else if (domainAge >= 5) {
                summary.domain_info.age_assessment = 'established';
            } else if (domainAge >= 2) {
                summary.domain_info.age_assessment = 'moderate';
            } else if (domainAge >= 1) {
                summary.domain_info.age_assessment = 'young';
            } else {
                summary.domain_info.age_assessment = 'very_new';
            }
        }
        
    
        const adjustedRiskScore = summary.risk_indicators;
        
    
        let finalRiskAdjustment = 0;
        if (trustScore && trustScore >= 75) finalRiskAdjustment -= 1;
        if (domainAge && domainAge >= 5) finalRiskAdjustment -= 1;
        if (domainAge && domainAge >= 10) finalRiskAdjustment -= 1;
        
        const adjustedRisk = Math.max(0, adjustedRiskScore + finalRiskAdjustment);
        
        if (adjustedRisk === 0 && summary.available_services >= 3) {
            summary.overall_rating = 'excellent';
        } else if (adjustedRisk <= 1) {
            summary.overall_rating = 'good';
        } else if (adjustedRisk <= 3) {
            summary.overall_rating = 'moderate';
        } else if (adjustedRisk <= 5) {
            summary.overall_rating = 'suspicious';
        } else {
            summary.overall_rating = 'high_risk';
        }
        
    
        if (creationDate) {
            summary.details.push(`Domain created: ${new Date(creationDate).toLocaleDateString()}`);
        }
        
        if (firstSeen && firstSeen !== creationDate) {
            const firstSeenDate = new Date(
                firstSeen.substring(0, 4),
                Number.parseInt(firstSeen.substring(4, 6)) - 1,
                firstSeen.substring(6, 8)
            );
            summary.details.push(`First archived: ${firstSeenDate.toLocaleDateString()}`);
        }
        
        if (domainAge !== null) {
            summary.details.push(`Domain age: ~${domainAge} years`);
        }
        
        if (trustScore !== null) {
            summary.details.push(`Trust score: ${trustScore}%`);
        }
        
    
        if (summary.details.length === 0) {
            summary.details.push('Basic reputation check completed');
        }
        
        return summary;
    }


    setTimeout(() => {
        bubble.innerHTML = '⚡<br><span style="font-size: 10px; margin-top: 4px;"></span>';
        setTimeout(runComprehensiveScan, 500);
    }, 1500);


    // THE COMPREHENSIVE SCAN FUNCTION

    async function runComprehensiveScan() {
        try {
            logMessage('Starting comprehensive security scan', 'info');
            let scanStartTime = Date.now();
            let lastProgressUpdate = Date.now();
            
            
            const progressMonitor = setInterval(() => {
                const now = Date.now();
                if (now - lastProgressUpdate > 10000) { 
                    logMessage('Scan progress check - ensuring scan is responsive', 'info');
                    globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                        detail: {
                            currentCheck: 'Scan in progress - performing deep analysis...',
                            vulnerabilityCount: vulnerabilityCount,
                            timestamp: now
                        }
                    }));
                    lastProgressUpdate = now;
                }
            }, 5000);
            
            bubble.innerHTML = '🔍<br><span style="font-size: 10px; margin-top: 4px;">SCAN</span>';
            
            container.style.display = 'none';
            bubble.style.display = 'flex';
            
            applySettings();
            
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Starting comprehensive security scan - this may take a while...',
                    vulnerabilityCount: 0,
                    timestamp: Date.now()
                }
            }));
            
            
            logMessage('Phase 1: Quick security checks...', 'info');
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 1: Scanning document for exposed API keys and secrets...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            
            logMessage('Phase 2: Domain reputation analysis...', 'info');
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 2: Analyzing domain reputation and threat intelligence...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            try {
                await checkDomainReputation();
                lastProgressUpdate = Date.now();
            } catch (reputationError) {
                logMessage(`Domain reputation check failed: ${reputationError.message}`, 'error');
            }
            
            
            logMessage('Phase 3: Core security analysis...', 'info');
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 3: Performing core security analysis...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            
            const coreChecks = [
                checkSecurityHeaders
            ];
            
            for (let i = 0; i < coreChecks.length; i++) {
                try {
                    globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                        detail: {
                            currentCheck: `Checking core security ${i + 1}/${coreChecks.length}...`,
                            vulnerabilityCount: vulnerabilityCount,
                            timestamp: Date.now()
                        }
                    }));
                    await coreChecks[i]();
                    lastProgressUpdate = Date.now();
                } catch (error) {
                    logMessage(`Core check ${i + 1} failed: ${error.message}`, 'error');
                }
            }
            
            
            logMessage('Phase 4: Advanced security analysis...', 'info');
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 4: Performing advanced security analysis...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            const advancedChecks = [
                checkAdvancedContentSecurityPolicy,
                checkInjectionVulnerabilities,
                checkCryptographicImplementation
            ];
            
            
            const advancedResults = await Promise.allSettled(advancedChecks.map(check => {
                return new Promise(async (resolve, reject) => {
                    try {
                        await check();
                        resolve();
                    } catch (error) {
                        logMessage(`Advanced check failed: ${error.message}`, 'error');
                        resolve(); 
                    }
                });
            }));
            
            lastProgressUpdate = Date.now();
            
            
            logMessage('Phase 5: Client-side security analysis...', 'info');
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 5: Analyzing client-side security...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            const clientSideChecks = [
                checkDOMVulnerabilities,
                checkBrowserFingerprinting
            ];
            
        
            for (let i = 0; i < clientSideChecks.length; i++) {
                try {
                    globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                        detail: {
                            currentCheck: `Client-side analysis ${i + 1}/${clientSideChecks.length}...`,
                            vulnerabilityCount: vulnerabilityCount,
                            timestamp: Date.now()
                        }
                    }));
                    await clientSideChecks[i]();
                    lastProgressUpdate = Date.now();
                } catch (error) {
                    logMessage(`Client-side check ${i + 1} failed: ${error.message}`, 'error');
                }
            }
            
            
            clearInterval(progressMonitor);
            
            globalThis.window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Finalizing scan results...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            const scanDuration = Date.now() - scanStartTime;
            
            logMessage(`Comprehensive scan completed in ${(scanDuration / 1000).toFixed(2)}s. Found ${vulnerabilityCount} issues`, 'info');
            
            updateBubbleBadge();
            
            const scanResults = {
                url: globalThis.window.location.href,
                vulnerabilityCount: vulnerabilityCount,
                issues: Array.from(issues.entries()).map(([key, issue]) => ({
                    key: key,
                    message: issue.message,
                    severity: issue.severity,
                    details: issue.details
                })),
                severityCounts: {
                    critical: Array.from(issues.values()).filter(i => i.severity === 'critical').length,
                    high: Array.from(issues.values()).filter(i => i.severity === 'high').length,
                    medium: Array.from(issues.values()).filter(i => i.severity === 'medium').length,
                    low: Array.from(issues.values()).filter(i => i.severity === 'low').length
                },
                timestamp: Date.now(),
                duration: scanDuration,
                reputationData: reputationData
            };
            
            logMessage('Dispatching scan complete event', 'info');
            
            globalThis.window.dispatchEvent(new CustomEvent('securityScanComplete', {
                detail: scanResults
            }));
            
            try {
                displayIssues();
            } catch (displayError) {
                logMessage(`Failed to display issues: ${displayError.message}`, 'error');
            }
            
            if (vulnerabilityCount === 0) {
                bubble.innerHTML = '✓<br><span style="font-size: 10px; margin-top: 4px;">SAFE</span>';
                logMessage('No security issues found - site appears secure', 'info');
            } else {
                bubble.innerHTML = '⚠<br><span style="font-size: 10px; margin-top: 4px;">ISSUES</span>';
                logMessage(`Security scan complete - ${vulnerabilityCount} issues detected`, 'warn');
            }
            
            try {
                applySettings();
            } catch (settingsError) {
                logMessage(`Failed to apply settings: ${settingsError.message}`, 'error');
            }
            
        } catch (error) {
            logMessage(`Comprehensive scan failed: ${error.message}`, 'error');
            handleScanError(error);
        }
    }
    
    function checkDOMVulnerabilities() {
        const evidence = [];
        

        const dangerousElements = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
        if (dangerousElements.length > 0) {
            dangerousElements.forEach((element, index) => {
        
                let selector = '';
                if (element.id) {
                    selector = `#${element.id}`;
                } else if (element.className) {
                    selector = `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
                } else {
                    selector = `${element.tagName.toLowerCase()}[${Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')}]`;
                }
                
                evidence.push({
                    type: 'Inline Event Handler',
                    description: 'Element with inline JavaScript event handler',
                    code: element.outerHTML.substring(0, 200) + '...',
                    location: `Element[${index}]`,
                    selector: selector,
                    element: element
                });
            });
            
            addIssue('dom-xss-risk', `${dangerousElements.length} potential DOM XSS vectors`, 'medium', {
                title: 'DOM XSS Vulnerability Risk',
                description: 'Inline event handlers can be exploited for DOM-based XSS.',
                impact: 'Medium - Potential for client-side code injection',
                solution: 'Use addEventListener instead of inline event handlers',
                evidence: evidence
            });
        }
        

        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            if (script.textContent.includes('eval(') || script.textContent.includes('Function(')) {
                evidence.push({
                    type: 'Dangerous Function',
                    description: 'Script contains eval() or Function() calls',
                    code: script.textContent.substring(0, 200) + '...',
                    location: `Script[${index}]`
                });
            }
        });
        
        if (evidence.some(e => e.type === 'Dangerous Function')) {
            addIssue('eval-usage', 'Dangerous eval() or Function() usage detected', 'high', {
                title: 'Code Injection Risk',
                description: 'Usage of eval() or Function() can lead to code injection.',
                impact: 'High - Arbitrary code execution possible',
                solution: 'Avoid eval() and Function(), use safer alternatives',
                evidence: evidence.filter(e => e.type === 'Dangerous Function')
            });
        }
    }
    
    function checkBrowserFingerprinting() {
        const evidence = [];
        const scriptNodes = Array.from(document.scripts || []);
        const usagePatterns = [/toDataURL\s*\(/i, /getImageData\s*\(/i, /FingerprintJS/i, /fingerprintjs/i, /\bfingerprint\b/i];

        scriptNodes.forEach((script, index) => {
            const content = (script.textContent || '').trim();
            if (!content) return;
            if (usagePatterns.some(p => p.test(content))) {
                evidence.push({
                    type: 'Fingerprinting Script',
                    description: 'Script appears to use fingerprinting APIs or libraries',
                    code: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
                    location: `script[${index}]`
                });
            }
        });

        const inlineHandlers = Array.from(document.querySelectorAll('[onload],[onerror],[onmouseenter],[onmousemove]'));
        inlineHandlers.forEach((el, idx) => {
            const moved = (el.getAttribute('onload') || '') + ' ' + (el.getAttribute('onerror') || '') + ' ' + (el.getAttribute('onmouseenter') || '') + ' ' + (el.getAttribute('onmousemove') || '');
            if (usagePatterns.some(p => p.test(moved))) {
                evidence.push({
                    type: 'Inline Fingerprinting',
                    description: 'Inline handler references fingerprinting APIs',
                    code: moved.substring(0, 200) + (moved.length > 200 ? '...' : ''),
                    location: `element[${idx}]`
                });
            }
        });

        if (evidence.length > 0) {
            addIssue('fingerprinting-risk', 'Browser fingerprinting detected', 'medium', {
                title: 'Browser Fingerprinting Detected',
                description: 'Scripts on this page appear to be using fingerprinting techniques.',
                impact: 'Medium - Tracking and privacy concerns',
                solution: 'Review and remove fingerprinting libraries or obtain user consent where appropriate',
                evidence: evidence,
                references: [
                    { title: 'Fingerprinting - EFF', url: 'https://privacybadger.org' }
                ]
            });
        }
    }

    async function checkSecurityHeaders() {
        try {
            const response = await fetch(location.href, { method: 'HEAD' });
            const headers = response.headers;
            const evidence = [];

            const securityHeaders = {
                'content-security-policy': {
                    severity: 'high',
                    title: 'Missing Content Security Policy',
                    description: 'CSP helps prevent XSS attacks and other code injection vulnerabilities.'
                },
                'x-frame-options': {
                    severity: 'medium',
                    title: 'Missing X-Frame-Options',
                    description: 'Protects against clickjacking attacks by controlling frame embedding.'
                },
                'strict-transport-security': {
                    severity: 'medium',
                    title: 'Missing HSTS Header',
                    description: 'HSTS forces browsers to use HTTPS connections only.'
                },
                'x-content-type-options': {
                    severity: 'low',
                    title: 'Missing X-Content-Type-Options',
                    description: 'Prevents browsers from MIME-sniffing responses.'
                },
                'referrer-policy': {
                    severity: 'low',
                    title: 'Missing Referrer-Policy',
                    description: 'Controls how much referrer information is shared.'
                }
            };

            Object.entries(securityHeaders).forEach(([header, config]) => {
                if (!headers.has(header)) {
                    evidence.push({
                        type: 'Missing Header',
                        description: `${header} header not found`,
                        location: 'HTTP Response Headers'
                    });
                    
                    addIssue(`missing-${header}`, config.title, config.severity, {
                        title: config.title,
                        description: config.description,
                        impact: `${config.severity} - Security feature not implemented`,
                        solution: `Add ${header} header to server response`,
                        evidence: evidence
                    });
                } else {
                    evidence.push({
                        type: 'Present Header',
                        description: `${header}: ${headers.get(header)}`,
                        location: 'HTTP Response Headers'
                    });
                }
            });

        } catch(e) {
            addIssue('headers-check-failed', 'Could not verify security headers', 'warning', {
                title: 'Security Headers Check Failed',
                description: 'Unable to retrieve HTTP headers for analysis.',
                impact: 'Warning - Cannot verify server security configuration',
                solution: 'Check server configuration manually',
                evidence: [{
                    type: 'Error',
                    description: e.message,
                    location: 'Header Check Process'
                }]
            });
        }
    }

    let scannerSettings = {
        hideBubble: false,
        showHighlights: true
    };


    globalThis.window.addEventListener('updateScannerSettings', (event) => {
        if (event.detail) {
            scannerSettings = { ...scannerSettings, ...event.detail };
            logMessage('Scanner settings updated', 'info');
            applySettings();
        }
    });


    function applySettings() {
        logMessage('Applying scanner settings', 'info');
        

        if (scannerSettings.hideBubble) {
            if (bubble?.style) {
                bubble.style.display = 'none';
                logMessage('Scanner bubble hidden successfully', 'info');
            } else {
                logMessage('Cannot hide bubble - element not ready yet', 'warning');
            }
        } else {
            if (bubble?.style) {
                bubble.style.display = 'flex';
                logMessage('Scanner bubble shown successfully', 'info');
            } else {
                logMessage('Cannot show bubble - element not ready yet', 'warning');
            }
        }
    }


    function logMessage(message, level = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [Security Scanner] [${level.toUpperCase()}] ${message}`);
    }


    function initializeScanner() {
        try {
            
            if (globalThis.window.securityScannerInitialized) {
                logMessage('Scanner already initialized, skipping duplicate initialization', 'info');
                return;
            }
            
            logMessage('Initializing Security Scanner Pro...', 'info');
            globalThis.window.securityScannerInitialized = true;
            
            
            checkWhitelistStatus().then(isWhitelisted => {
                if (isWhitelisted && !globalThis.window.manualScanTriggered) {
                    logMessage('Site is whitelisted, skipping auto-scan', 'info');
                    return;
                }
                
                
                continueInitialization();
            }).catch(error => {
                logMessage('Error checking whitelist status: ' + error.message, 'warning');
                
                continueInitialization();
            });

        } catch (error) {
            logMessage(`Scanner initialization failed: ${error.message}`, 'error');
            handleScanError(error);
        }
    }

    
    async function checkWhitelistStatus() {
        try {
            const hostname = globalThis.window.location.hostname;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                return new Promise((resolve) => {
                    chrome.storage.sync.get(['whitelist'], (result) => {
                        const whitelist = result.whitelist || [];
                        const isWhitelisted = whitelist.includes(hostname);
                        logMessage(`Whitelist check for ${hostname}: ${isWhitelisted ? 'whitelisted' : 'not whitelisted'}`, 'info');
                        resolve(isWhitelisted);
                    });
                });
            }
            
            return false;
        } catch (error) {
            logMessage('Error checking whitelist: ' + error.message, 'warning');
            return false;
        }
    }

    
    function continueInitialization() {
        try {
            
            if (typeof chrome !== 'undefined' && chrome?.storage?.sync) {
                chrome.storage.sync.get(['hideBubble', 'showHighlights'], (result) => {
                    if (result) {
                        scannerSettings = { ...scannerSettings, ...result };
                        logMessage('Loaded initial settings from storage', 'info');
                        
            
                        if (bubble?.style) {
                            applySettings();
                        }
                    }
                });
            }
            

            document.body.appendChild(container);
            document.body.appendChild(bubble);
            document.body.appendChild(modal);
            
            logMessage('Scanner UI elements added to page', 'info');
            

            header.textContent = 'Security Scanner Pro';
            hideBtn.textContent = '✕';
            hideBtn.style.cssText = `
                background: none;
                border: none;
                color: red;
                font-size: 18px;
                cursor: pointer;
                height: 100%;
                border-radius: 4px;
                transition: all 0.2s ease;
            `;
            
            header.appendChild(hideBtn);
            container.appendChild(header);
            container.appendChild(content);
            

            const modalHeader = document.createElement('div');
            modalHeader.style.cssText = `
                    padding: 24px 24px 24px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid ${colors.border};
                margin-bottom: 0;
            `;
            
            const modalTitle = document.createElement('h2');
            modalTitle.style.cssText = `
                margin: 0;
                font-size: 18px;
                font-weight: 700;
                color: ${colors.text};
                font-family: 'Ubuntu Mono', monospace;
            `;
            modalTitle.textContent = 'Issue Details';
            
            modalHeader.appendChild(modalTitle);
            modalHeader.appendChild(modalClose);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modal.appendChild(modalContent);
            

            logMessage('Applying initial scanner settings...', 'info');
            applySettings();
            
            logMessage('Scanner initialization complete', 'info');
            

            setTimeout(() => {
                    try {
                logMessage('Starting comprehensive security scan...', 'info');
                runComprehensiveScan();
                    } catch (scanError) {
                        logMessage(`Failed to start comprehensive scan: ${scanError.message}`, 'error');
                        handleScanError(scanError);
                    }
            }, 1000);

        
                logMessage('Starting continuous monitoring...', 'info');
                startContinuousMonitoring();
                
            } catch (error) {
                logMessage(`Scanner initialization failed: ${error.message}`, 'error');
                handleScanError(error);
            }
        }


        function handleScanError(error) {
            logMessage(`Scanner error: ${error.message}`, 'error');
            
            if (bubble) {
                bubble.innerHTML = '✗<br><span style="font-size: 10px; margin-top: 4px;">ERROR</span>';
                bubble.style.backgroundColor = '#c53030';
            }
            
            
            const errorResults = {
                url: globalThis.window.location.href,
                vulnerabilityCount: 0,
                issues: [],
                severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
                timestamp: Date.now(),
                error: `Scanner error: ${error.message}`,
                errorDetails: {
                    type: error.name || 'UnknownError',
                    message: error.message,
                    stack: error.stack,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: globalThis.window.location.href
                }
            };
            
            
            try {
                globalThis.window.dispatchEvent(new CustomEvent('securityScanComplete', {
                    detail: errorResults
                }));
                logMessage('Error event dispatched successfully', 'info');
            } catch (dispatchError) {
                console.error('Failed to dispatch error event:', dispatchError);
                
                
                console.error('Scanner Error Details:', {
                    originalError: error,
                    errorResults: errorResults,
                    dispatchError: dispatchError
                });
            }
            
            
            try {
                
                if (typeof monitoringInterval !== 'undefined' && monitoringInterval) {
                    clearInterval(monitoringInterval);
                    monitoringInterval = null;
                }
                
                
                if (typeof issues !== 'undefined') {
                    issues.clear();
                }
                if (typeof vulnerabilityCount !== 'undefined') {
                    vulnerabilityCount = 0;
                }
            } catch (cleanupError) {
                logMessage(`Error during cleanup: ${cleanupError.message}`, 'error');
            }
        }


        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                logMessage('DOM loaded, initializing scanner', 'info');
                try {
                initializeScanner();
                } catch (error) {
                    console.error('Scanner initialization failed:', error);
                    handleScanError(error);
                }
            });
        } else {
            logMessage('DOM already loaded, initializing scanner immediately', 'info');
            try {
            initializeScanner();
            } catch (error) {
                console.error('Scanner initialization failed:', error);
                handleScanError(error);
            }
        }


    globalThis.window.addEventListener('manualScanTrigger', () => {
        logMessage('Manual scan triggered, bypassing whitelist', 'info');
        globalThis.window.manualScanTriggered = true;
        try {
            initializeScanner();
        } catch (error) {
            console.error('Manual scan initialization failed:', error);
            handleScanError(error);
        }
    });


    globalThis.window.addEventListener('stopScanner', () => {
        logMessage('Scanner stop signal received', 'info');
        stopScanner();
    });


    function clearWhitelist() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({
                whitelist: []
            }, () => {
                logMessage('Whitelist cleared', 'info');
            });
        }
    }


    globalThis.window.securityScanner = {
        clearWhitelist: clearWhitelist,
        checkWhitelistStatus: checkWhitelistStatus,
        triggerManualScan: () => {
            window.manualScanTriggered = true;
            initializeScanner();
        }
    };

    function checkAdvancedContentSecurityPolicy() {
        const evidence = [];
        const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        if (!cspHeader) {
            evidence.push({
                type: 'Missing CSP',
                description: 'No Content Security Policy meta tag found',
                location: 'HTML Head'
            });
        } else {
            const cspContent = cspHeader.getAttribute('content');
            
    
            const unsafePatterns = [
                { pattern: /'unsafe-inline'/, issue: 'Allows inline scripts and styles' },
                { pattern: /'unsafe-eval'/, issue: 'Allows eval() and similar functions' },
                { pattern: /\*/, issue: 'Wildcard source allows any origin' },
                { pattern: /data:/, issue: 'Data URIs can be exploited' },
                { pattern: /'unsafe-hashes'/, issue: 'Unsafe hash usage detected' }
            ];

            unsafePatterns.forEach(({pattern, issue}) => {
                if (pattern.test(cspContent)) {
                    evidence.push({
                        type: 'Unsafe CSP Directive',
                        description: issue,
                        location: 'CSP Header',
                        directive: cspContent
                    });
                }
            });

    
            const importantDirectives = [
                'default-src', 'script-src', 'style-src', 'img-src', 
                'connect-src', 'font-src', 'object-src', 'media-src'
            ];

            importantDirectives.forEach(directive => {
                if (!cspContent.includes(directive)) {
                    evidence.push({
                        type: 'Missing CSP Directive',
                        description: `Missing ${directive} directive`,
                        location: 'CSP Header'
                    });
                }
            });
        }

        if (evidence.length > 0) {
            addIssue('csp-issues', 'Content Security Policy issues detected', 'medium', {
                title: 'Content Security Policy Vulnerabilities',
                description: 'CSP configuration has security weaknesses.',
                impact: 'Medium - Reduced protection against XSS and injection attacks',
                solution: 'Implement a strict CSP with specific source directives',
                evidence: evidence
            });
        }
    }

    function checkInjectionVulnerabilities() {
        const evidence = [];
        

        const forms = document.querySelectorAll('form');
        forms.forEach((form, formIndex) => {
    
            const action = form.getAttribute('action');
            const method = form.getAttribute('method') || 'GET';
            
    
            if (!action || action === '#' || action === '' || action.startsWith('javascript:')) {
                return;
            }
            
            const inputs = form.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], input[type="url"], textarea');
            inputs.forEach((input, inputIndex) => {
        
                const hasValidation = input.hasAttribute('pattern') || 
                                    input.hasAttribute('maxlength') || 
                                    input.getAttribute('type') === 'email' ||
                                    input.getAttribute('type') === 'url';
                
        
                const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                const hasStrictCSP = csp && csp.content.includes("'unsafe-inline'") === false;
                
        
                let riskFactors = [];
                let detailedEvidence = {
                    formHtml: form.outerHTML.substring(0, 500) + (form.outerHTML.length > 500 ? '...' : ''),
                    inputHtml: input.outerHTML,
                    formAction: action,
                    formMethod: method,
                    inputName: input.name || input.id || 'unnamed',
                    inputType: input.type || 'text',
                    inputAttributes: Array.from(input.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' '),
                    cspHeader: csp ? csp.content : 'None detected',
                    validationAttributes: []
                };
                
        
                ['pattern', 'maxlength', 'minlength', 'required', 'readonly', 'disabled'].forEach(attr => {
                    if (input.hasAttribute(attr)) {
                        detailedEvidence.validationAttributes.push(`${attr}="${input.getAttribute(attr) || 'true'}"`);
                    }
                });
                
        
                if (action && !action.startsWith('#') && !action.startsWith('javascript:')) {
                    riskFactors.push({
                        factor: 'Server-side processing detected',
                        details: `Form submits to: ${action} via ${method.toUpperCase()}`,
                        severity: 'high'
                    });
                }
                
        
                if (!hasValidation) {
                    riskFactors.push({
                        factor: 'No client-side input validation',
                        details: `Input lacks validation attributes. Current attributes: ${detailedEvidence.inputAttributes || 'none'}`,
                        severity: 'medium'
                    });
                }
                
        
                if (!hasStrictCSP) {
                    riskFactors.push({
                        factor: 'No strict Content Security Policy',
                        details: csp ? `Weak CSP detected: ${csp.content}` : 'No CSP meta tag found in document head',
                        severity: 'medium'
                    });
                }
                
        
                const name = input.getAttribute('name');
                const id = input.getAttribute('id');
                let reflectionDetails = null;
                if (name || id) {
            
                    const urlParams = new URLSearchParams(globalThis.window.location.search);
                    if ((name && urlParams.has(name)) || (id && urlParams.has(id))) {
                
                        const paramValue = urlParams.get(name) || urlParams.get(id);
                        if (paramValue && document.body.innerHTML.includes(paramValue)) {
                            reflectionDetails = {
                                parameter: name || id,
                                value: paramValue,
                                foundInContext: getReflectionContext(paramValue)
                            };
                            riskFactors.push({
                                factor: 'URL parameters reflected in page content',
                                details: `Parameter '${name || id}' with value '${paramValue}' appears unescaped in page HTML`,
                                severity: 'high',
                                codeSnippet: reflectionDetails.foundInContext
                            });
                        }
                    }
                }
                
        
                const inputContext = getInputContext(input);
                if (inputContext.includes('script') || inputContext.includes('innerHTML') || inputContext.includes('document.write')) {
                    const dangerousCode = extractDangerousContext(inputContext, input.name || input.id);
                    riskFactors.push({
                        factor: 'Input used in dangerous JavaScript context',
                        details: 'Input value is processed by potentially unsafe JavaScript functions',
                        severity: 'high',
                        codeSnippet: dangerousCode
                    });
                }
                
        
                if (riskFactors.length >= 3) {
                    const severity = riskFactors.filter(r => r.severity === 'high').length >= 2 ? 'high' : 'medium';
                    
            
                    const comprehensiveEvidence = generateDetailedXSSEvidence(form, input, riskFactors, hasStrictCSP, hasValidation);
                    
                    evidence.push({
                        type: 'Potential XSS Vulnerability',
                        description: `Input field may be vulnerable to XSS injection (${riskFactors.length} risk factors identified)`,
                        location: `Form[${formIndex}] Input[${inputIndex}] (${input.name || input.id || 'unnamed'})`,
                        riskFactors: riskFactors,
                        element: input,
                        severity: severity,
                        detailedEvidence: comprehensiveEvidence,
                        codeSnippets: {
                            formHtml: comprehensiveEvidence.formHtml,
                            vulnerableScripts: comprehensiveEvidence.vulnerableScripts,
                            reflectionEvidence: comprehensiveEvidence.reflectionEvidence
                        },
                        exploitabilityScore: calculateExploitabilityScore(riskFactors),
                        recommendations: generateXSSRecommendations(riskFactors, hasStrictCSP, hasValidation)
                    });
                }
            });
        });
        

        const url = globalThis.window.location.href;
        const sqlPatterns = [
            { pattern: /union\s+select.+from/i, confidence: 'high', description: 'UNION-based SQL injection attempt' },
            { pattern: /'.*or.*'.*=.*'/i, confidence: 'high', description: 'Boolean-based SQL injection with quoted values' },
            { pattern: /drop\s+table\s+\w+/i, confidence: 'high', description: 'Destructive SQL command (DROP TABLE)' },
            { pattern: /delete\s+from\s+\w+/i, confidence: 'medium', description: 'Destructive SQL command (DELETE)' },
            { pattern: /insert\s+into\s+\w+/i, confidence: 'medium', description: 'Data manipulation SQL command (INSERT)' },
            { pattern: /update\s+\w+\s+set/i, confidence: 'medium', description: 'Data manipulation SQL command (UPDATE)' },
            { pattern: /or\s+1\s*=\s*1/i, confidence: 'low', description: 'Classic SQL injection bypass attempt' },
            { pattern: /and\s+1\s*=\s*1/i, confidence: 'low', description: 'SQL injection enumeration attempt' }
        ];

        sqlPatterns.forEach(({pattern, confidence, description}) => {
            if (pattern.test(url)) {
        
                const match = url.match(pattern);
                const matchStart = url.indexOf(match[0]);
                const context = url.substring(Math.max(0, matchStart - 50), matchStart + match[0].length + 50);
                
        
                if (!context.includes('index.php') && !context.includes('search') && !context.includes('id=') && !context.includes('page=')) {
                    return;
                }
                
        
                const urlParams = new URLSearchParams(globalThis.window.location.search);
                const suspiciousParams = [];
                urlParams.forEach((value, key) => {
                    if (pattern.test(value)) {
                        suspiciousParams.push({
                            parameter: key,
                            value: value,
                            injectable: pattern.test(value)
                        });
                    }
                });
                
                evidence.push({
                    type: 'SQL Injection Pattern',
                    description: `URL contains ${confidence} confidence SQL injection pattern: ${description}`,
                    location: 'URL Parameters',
                    pattern: match[0],
                    confidence: confidence,
                    severity: confidence === 'high' ? 'critical' : confidence === 'medium' ? 'high' : 'medium',
                    detailedEvidence: {
                        fullUrl: globalThis.window.location.href,
                        matchedPattern: match[0],
                        urlContext: context,
                        suspiciousParameters: suspiciousParams,
                        patternDescription: description,
                        confidenceLevel: confidence
                    },
                    codeSnippets: {
                        urlWithHighlighting: formatUrlInjectionContext(url, pattern, match),
                        fullUrl: globalThis.window.location.href,
                        extractedParameters: suspiciousParams.map(p => ({
                            parameter: p.parameter,
                            value: p.value,
                            highlighted: p.value.replace(new RegExp(escapeRegExp(match[0]), 'gi'), `**INJECTION[${match[0]}]**`)
                        }))
                    },
                    rawEvidence: `URL: ${window.location.href}\nMatched Pattern: "${match[0]}"\nContext: ...${context}...`,
                    recommendations: generateSQLInjectionRecommendations(confidence, suspiciousParams)
                });
            }
        });


        const cmdPatterns = [
            { pattern: /;\s*(ls|cat|pwd|whoami|id|ps|netstat)\b/i, confidence: 'high', description: 'Unix command injection with semicolon separator' },
            { pattern: /\|\s*(nc|netcat|wget|curl|bash|sh)\b/i, confidence: 'high', description: 'Command injection with pipe to dangerous utilities' },
            { pattern: /`[^`]*\b(ls|cat|pwd|whoami|id|ps|netstat)\b[^`]*`/i, confidence: 'high', description: 'Command substitution injection (backticks)' },
            { pattern: /\$\([^)]*\b(ls|cat|pwd|whoami|id|ps|netstat)\b[^)]*\)/i, confidence: 'high', description: 'Command substitution injection (dollar-parentheses)' },
            { pattern: /&&\s*(rm|del|format)\b/i, confidence: 'medium', description: 'Command chaining with destructive commands' }
        ];


        const formData = Array.from(document.querySelectorAll('input, textarea')).map(i => ({
            name: i.name || i.id || 'unnamed',
            value: i.value,
            type: i.type
        }));
        const checkContent = url + ' ' + formData.map(f => f.value).join(' ');
        
        cmdPatterns.forEach(({pattern, confidence, description}) => {
            if (pattern.test(checkContent)) {
                const match = checkContent.match(pattern);
                const isInUrl = pattern.test(url);
                const matchLocation = isInUrl ? 'URL Parameters' : 'Form Data';
                
        
                let affectedField = null;
                let formattedFieldContext = null;
                if (!isInUrl) {
                    affectedField = formData.find(field => pattern.test(field.value));
                    if (affectedField) {
                        formattedFieldContext = formatFormFieldInjectionContext(affectedField, pattern, match);
                    }
                }
                
                evidence.push({
                    type: 'Command Injection Pattern',
                    description: `${confidence} confidence command injection pattern detected: ${description}`,
                    location: matchLocation,
                    pattern: match[0],
                    confidence: confidence,
                    severity: confidence === 'high' ? 'critical' : 'high',
                    detailedEvidence: {
                        matchedPattern: match[0],
                        patternDescription: description,
                        confidenceLevel: confidence,
                        detectionLocation: matchLocation,
                        affectedField: affectedField,
                        fullContext: isInUrl ? url : checkContent.substring(0, 200)
                    },
                    codeSnippets: {
                        ...(isInUrl ? {
                            urlWithHighlighting: formatUrlInjectionContext(url, pattern, match),
                            fullUrl: url
                        } : {
                            formFieldDetails: formattedFieldContext,
                            fieldHtml: affectedField ? affectedField.value : 'unknown'
                        }),
                        injectionPattern: match[0],
                        highlightedMatch: `**DANGEROUS_COMMAND[${match[0]}]**`
                    },
                    rawEvidence: isInUrl ? 
                        `URL: ${url}\nMatched Pattern: "${match[0]}"` :
                        `Field: ${affectedField?.name || 'unknown'}\nValue: "${affectedField?.value || 'unknown'}"\nMatched Pattern: "${match[0]}"`,
                    recommendations: generateCommandInjectionRecommendations(confidence, matchLocation)
                });
            }
        });


        const criticalEvidence = evidence.filter(e => e.severity === 'critical');
        const highEvidence = evidence.filter(e => e.severity === 'high');
        const mediumEvidence = evidence.filter(e => e.severity === 'medium');

        if (criticalEvidence.length > 0) {
            addIssue('critical-injection-vulnerabilities', 'Critical injection vulnerabilities detected', 'critical', {
                title: 'Critical Code Injection Vulnerabilities',
                description: 'High confidence injection vulnerabilities found that require immediate attention.',
                impact: 'Critical - Active exploitation attempts detected or highly vulnerable inputs found',
                solution: 'Immediately implement input validation, parameterized queries, and output encoding',
                evidence: criticalEvidence
            });
        }

        if (highEvidence.length > 0) {
            addIssue('high-injection-vulnerabilities', 'High-risk injection vulnerabilities detected', 'high', {
                title: 'High-Risk Code Injection Vulnerabilities',
                description: 'Likely injection vulnerabilities found with detailed evidence.',
                impact: 'High - Potential for system compromise through code injection',
                solution: 'Implement proper input validation, parameterized queries, and output encoding',
                evidence: highEvidence
            });
        }

        if (mediumEvidence.length > 0) {
            addIssue('medium-injection-vulnerabilities', 'Potential injection vulnerabilities detected', 'medium', {
                title: 'Potential Code Injection Vulnerabilities',
                description: 'Inputs that may be vulnerable to injection attacks with detailed analysis.',
                impact: 'Medium - Review inputs for proper validation and encoding',
                solution: 'Review input handling and implement comprehensive validation',
                evidence: mediumEvidence
            });
        }
    }


    function getReflectionContext(paramValue) {
        const bodyHtml = document.body.innerHTML;
        const index = bodyHtml.indexOf(paramValue);
        if (index === -1) return 'Not found in body';
        
        const start = Math.max(0, index - 100);
        const end = Math.min(bodyHtml.length, index + paramValue.length + 100);
        const context = bodyHtml.substring(start, end);
        

        const highlightedContext = context.replace(
            new RegExp(escapeRegExp(paramValue), 'gi'), 
            `**REFLECTED_VALUE[${paramValue}]**`
        );
        
        return `...${highlightedContext}...`;
    }


    function extractDangerousContext(fullContext, inputName) {
        const lines = fullContext.split('\n');
        const relevantLines = lines.filter(line => 
            line.includes(inputName) && 
            (line.includes('innerHTML') || line.includes('document.write') || line.includes('eval'))
        );
        
        if (relevantLines.length > 0) {
    
            return relevantLines.map(line => {
                const trimmedLine = line.trim();
        
                let highlighted = trimmedLine
                    .replace(/innerHTML/g, '**DANGEROUS[innerHTML]**')
                    .replace(/document\.write/g, '**DANGEROUS[document.write]**')
                    .replace(/eval\(/g, '**DANGEROUS[eval(**')
                    .replace(new RegExp(escapeRegExp(inputName), 'gi'), `**INPUT[${inputName}]**`);
                
                return highlighted;
            }).join('\n');
        }
        
        return fullContext.substring(0, 200);
    }


    function extractVulnerableScriptContent(scripts, inputName) {
        const vulnerableScripts = [];
        
        scripts.forEach((script, index) => {
            if (script.textContent && script.textContent.includes(inputName)) {
                const content = script.textContent;
                const lines = content.split('\n');
                const relevantLines = [];
                
                lines.forEach((line, lineIndex) => {
                    if (line.includes(inputName) && 
                        (line.includes('innerHTML') || line.includes('document.write') || line.includes('eval'))) {
                        
                
                        const startLine = Math.max(0, lineIndex - 2);
                        const endLine = Math.min(lines.length - 1, lineIndex + 2);
                        
                        const contextLines = lines.slice(startLine, endLine + 1).map((contextLine, contextIndex) => {
                            const actualLineIndex = startLine + contextIndex;
                            const isTargetLine = actualLineIndex === lineIndex;
                            let formatted = contextLine.trim();
                            
                            if (isTargetLine) {
                        
                                formatted = formatted
                                    .replace(/innerHTML/g, '**DANGEROUS[innerHTML]**')
                                    .replace(/document\.write/g, '**DANGEROUS[document.write]**')
                                    .replace(/eval\(/g, '**DANGEROUS[eval(**')
                                    .replace(new RegExp(escapeRegExp(inputName), 'gi'), `**INPUT[${inputName}]**`);
                                formatted = `>>> ${formatted} <<<  **VULNERABLE_LINE**`;
                            }
                            
                            return `${actualLineIndex + 1}: ${formatted}`;
                        });
                        
                        vulnerableScripts.push({
                            scriptIndex: index,
                            scriptSrc: script.src || 'inline',
                            vulnerableLine: lineIndex + 1,
                            codeSnippet: contextLines.join('\n'),
                            rawLine: line.trim()
                        });
                    }
                });
            }
        });
        
        return vulnerableScripts;
    }


    function formatFormHtml(form, input, riskFactors) {
        let formHtml = form.outerHTML;
        

        if (formHtml.length > 800) {
            const actionMatch = formHtml.match(/action\s*=\s*["'][^"']*["']/i);
            const methodMatch = formHtml.match(/method\s*=\s*["'][^"']*["']/i);
            
            let truncated = formHtml.substring(0, 400) + '\n... [TRUNCATED] ...\n' + formHtml.substring(formHtml.length - 200);
            
    
            if (actionMatch && !truncated.includes(actionMatch[0])) {
                truncated = truncated.replace('... [TRUNCATED] ...', `... [TRUNCATED - ${actionMatch[0]}] ...`);
            }
            
            formHtml = truncated;
        }
        

        formHtml = formHtml
            .replace(/action\s*=\s*["']([^"']*)["']/gi, '**ACTION[$1]**')
            .replace(/method\s*=\s*["']([^"']*)["']/gi, '**METHOD[$1]**');
        

        const inputPattern = new RegExp(escapeRegExp(input.outerHTML), 'gi');
        formHtml = formHtml.replace(inputPattern, `**VULNERABLE_INPUT[${input.outerHTML}]**`);
        
        return formHtml;
    }


    function formatUrlInjectionContext(url, pattern, match) {
        const matchIndex = url.indexOf(match[0]);
        const start = Math.max(0, matchIndex - 80);
        const end = Math.min(url.length, matchIndex + match[0].length + 80);
        
        let context = url.substring(start, end);
        

        context = context.replace(
            new RegExp(escapeRegExp(match[0]), 'gi'),
            `**INJECTION_PATTERN[${match[0]}]**`
        );
        

        context = context.replace(/([?&])([^=]+)=/g, '$1**PARAM[$2]**=');
        
        return `...${context}...`;
    }


    function formatFormFieldInjectionContext(field, pattern, match) {
        const value = field.value;
        const matchIndex = value.indexOf(match[0]);
        
        if (matchIndex === -1) return value;
        
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(value.length, matchIndex + match[0].length + 50);
        
        let context = value.substring(start, end);
        

        context = context.replace(
            new RegExp(escapeRegExp(match[0]), 'gi'),
            `**INJECTION_PATTERN[${match[0]}]**`
        );
        
        return {
            fieldName: field.name || field.id || 'unnamed',
            fieldType: field.type || 'text',
            fieldHtml: field.outerHTML,
            injectionContext: `...${context}...`,
            fullValue: value.length > 200 ? value.substring(0, 200) + '... [TRUNCATED]' : value
        };
    }


    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    function generateDetailedXSSEvidence(form, input, riskFactors, hasStrictCSP, hasValidation) {
        const scripts = document.querySelectorAll('script');
        const inputName = input.name || input.id || '';
        
        const evidence = {
            formHtml: formatFormHtml(form, input, riskFactors),
            inputDetails: {
                html: input.outerHTML,
                name: inputName,
                type: input.type || 'text',
                attributes: Array.from(input.attributes).map(attr => `${attr.name}="${attr.value}"`),
                validationAttributes: []
            },
            securityAnalysis: {
                cspHeader: hasStrictCSP ? 'Strict CSP detected' : (document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || 'No CSP detected'),
                hasValidation: hasValidation,
                formAction: form.getAttribute('action'),
                formMethod: form.getAttribute('method') || 'GET'
            },
            vulnerableScripts: [],
            reflectionEvidence: null
        };
        

        ['pattern', 'maxlength', 'minlength', 'required', 'readonly', 'disabled'].forEach(attr => {
            if (input.hasAttribute(attr)) {
                evidence.inputDetails.validationAttributes.push(`${attr}="${input.getAttribute(attr) || 'true'}"`);
            }
        });
        

        if (inputName) {
            evidence.vulnerableScripts = extractVulnerableScriptContent(scripts, inputName);
        }
        

        const urlParams = new URLSearchParams(globalThis.window.location.search);
        if (inputName && urlParams.has(inputName)) {
            const paramValue = urlParams.get(inputName);
            if (paramValue && document.body.innerHTML.includes(paramValue)) {
                evidence.reflectionEvidence = {
                    parameter: inputName,
                    value: paramValue,
                    context: getReflectionContext(paramValue),
                    location: 'Document body'
                };
            }
        }
        
        return evidence;
    }

    function checkCryptographicImplementation() {
        const evidence = [];
        

        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            if (script.textContent) {
                const content = script.textContent;
                
                
                const weakCryptoPatterns = [
                    
                    { 
                        pattern: /(?:crypto|hash|digest|encrypt|decrypt|md5|MD5)\s*[(\.].*?MD5|MD5.*?(?:hash|digest|encrypt|decrypt|create)/gi, 
                        issue: 'MD5 is cryptographically broken',
                        validate: (match) => {
                            
                            const lowerMatch = match.toLowerCase();
                            return !lowerMatch.includes('description') && 
                                   !lowerMatch.includes('desciption') &&
                                   !lowerMatch.includes('design') &&
                                   !lowerMatch.includes('desire') &&
                                   !lowerMatch.includes('desktop');
                        }
                    },
                    
                    { 
                        pattern: /(?:crypto|hash|digest|encrypt|decrypt|sha1|SHA1)\s*[(\.].*?SHA1|SHA1.*?(?:hash|digest|encrypt|decrypt|create)/gi, 
                        issue: 'SHA1 is deprecated and weak',
                        validate: (match) => true
                    },
                    
                    { 
                        pattern: /(?:crypto|cipher|encrypt|decrypt|algorithm|DES)\s*[(\.].*?\bDES\b|\bDES\b.*?(?:cipher|encrypt|decrypt|algorithm|create)/gi, 
                        issue: 'DES encryption is too weak',
                        validate: (match) => {
                            const lowerMatch = match.toLowerCase();
                            
                            const falsePositives = [
                                'description', 'describe', 'described', 'describes', 'descriptor',
                                'design', 'designer', 'designed', 'designs',
                                'desire', 'desired', 'desires',
                                'desktop', 'desktops',
                                'destroy', 'destroyed', 'destruction',
                                'destination', 'destinations',
                                'deserialize', 'deserialization',
                                'descendant', 'descendants', 'descend',
                                'deserve', 'deserved', 'deserves',
                                'despite', 'despair', 'desperate',
                                'address', 'addresses', 'addressed'
                            ];
                            return !falsePositives.some(fp => lowerMatch.includes(fp));
                        }
                    },
                    
                    { 
                        pattern: /(?:crypto|cipher|encrypt|decrypt|rc4|RC4)\s*[(\.].*?RC4|RC4.*?(?:cipher|encrypt|decrypt|create)/gi, 
                        issue: 'RC4 cipher is broken',
                        validate: (match) => true
                    },
                    
                    { 
                        pattern: /Math\.random\s*\(\s*\).*?(?:key|secret|token|salt|iv|nonce|password|crypto)|(?:key|secret|token|salt|iv|nonce|password|crypto).*?Math\.random\s*\(\s*\)/gi, 
                        issue: 'Math.random() is not cryptographically secure for security purposes',
                        validate: (match) => true
                    }
                ];

                weakCryptoPatterns.forEach(({pattern, issue, validate}) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        
                        const validMatches = matches.filter(match => validate(match));
                        if (validMatches.length > 0) {
                            evidence.push({
                                type: 'Weak Cryptography',
                                description: issue,
                                location: `Script[${index}]`,
                                occurrences: validMatches.length,
                                examples: validMatches.slice(0, 3) 
                            });
                        }
                    }
                });

                
                const keyPatterns = [
                    /(?:(?:encryption|crypto|aes|des)[\w]*\s*[=:]\s*['"][a-zA-Z0-9+/]{16,}['"])|(?:key\s*[=:]\s*['"][a-zA-Z0-9+/]{24,}['"])/gi,
                    /AES\s*\(\s*['"][a-zA-Z0-9+/]{16,}['"]\s*\)/gi,
                    /(?:createCipher|createDecipher|createHash)\s*\(\s*['"][^'"]{3,}['"]\s*,\s*['"][a-zA-Z0-9+/]{16,}['"]\s*\)/gi
                ];

                keyPatterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        evidence.push({
                            type: 'Hardcoded Encryption Key',
                            description: 'Encryption key or secret hardcoded in JavaScript',
                            location: `Script[${index}]`,
                            occurrences: matches.length,
                            examples: matches.slice(0, 2) 
                        });
                    }
                });
            }
        });

        if (evidence.length > 0) {
            addIssue('weak-cryptography', 'Weak cryptographic implementations', 'high', {
                title: 'Weak Cryptography',
                description: 'Weak or improper cryptographic implementations detected.',
                impact: 'High - Cryptographic weaknesses can be exploited',
                solution: 'Use strong, modern cryptographic algorithms and proper key management',
                evidence: evidence
            });
        }
    }

    if (typeof chrome !== 'undefined' && chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'CHECK_DYNAMIC_THREATS') {
        
                checkAdvancedContentSecurityPolicy();
                checkInjectionVulnerabilities();
                checkCryptographicImplementation();
                sendResponse({ status: 'checked' });
                return true;
            }
        });
    }


    let monitoringInterval = null;
    
    function startContinuousMonitoring() {

        if (monitoringInterval) {
            clearInterval(monitoringInterval);
        }


        monitoringInterval = setInterval(() => {
            performContinuousChecks();
        }, 10000);

        logMessage('Continuous monitoring started - checking every 10 seconds', 'info');
    }

    function performContinuousChecks() {
        try {
            checkSuspiciousDOMChanges();
            
        } catch (error) {
            logMessage(`Continuous monitoring error: ${error.message}`, 'error');
        }
    }


    function checkSuspiciousDOMChanges() {

        const iframes = document.querySelectorAll('iframe');
        if (window._lastIframeCount && iframes.length > window._lastIframeCount) {
            logMessage('New iframe detected - potential security risk', 'warn');
            
    
            for (let i = window._lastIframeCount; i < iframes.length; i++) {
                const iframe = iframes[i];
                const src = iframe.src || iframe.getAttribute('src');
                
                if (src && !src.startsWith(window.location.origin)) {
                    addIssue(`suspicious-iframe-${i}`, 'Suspicious iframe injection detected', 'high', {
                        title: 'Suspicious Iframe Injection',
                        description: 'New iframe from external source injected dynamically.',
                        impact: 'High - Potential for malicious content injection',
                        solution: 'Review iframe source and implement CSP restrictions',
                        evidence: [{
                            type: 'Dynamic Iframe',
                            description: `Iframe with src: ${src}`,
                            location: `Iframe[${i}]`
                        }]
                    });
                }
            }
        }
        window._lastIframeCount = iframes.length;
    }


    window.addEventListener('beforeunload', () => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            logMessage('Continuous monitoring stopped - page unloading', 'info');
        }
    });


    function calculateExploitabilityScore(riskFactors) {
        let score = 0;
        riskFactors.forEach(factor => {
            score += factor.severity === 'high' ? 3 : factor.severity === 'medium' ? 2 : 1;
        });
        return score;
    }


    function generateXSSRecommendations(riskFactors, hasStrictCSP, hasValidation) {
        const recommendations = [];
        
        if (!hasStrictCSP) {
            recommendations.push("Implement strict Content Security Policy with 'unsafe-inline' disabled");
        }
        if (!hasValidation) {
            recommendations.push("Add input validation attributes (pattern, maxlength, type validation)");
        }
        if (riskFactors.some(r => r.factor.includes('reflected'))) {
            recommendations.push("Implement proper output encoding for reflected parameters");
        }
        if (riskFactors.some(r => r.factor.includes('JavaScript context'))) {
            recommendations.push("Use safe DOM manipulation methods instead of innerHTML");
        }
        
        return recommendations;
    }


    function generateSQLInjectionRecommendations(confidence, suspiciousParams) {
        const recommendations = [
            "Use parameterized queries/prepared statements instead of string concatenation",
            "Implement strict input validation and sanitization",
            "Apply principle of least privilege to database connections"
        ];
        
        if (confidence === 'high') {
            recommendations.unshift("URGENT: Remove or sanitize the detected SQL injection pattern immediately");
        }
        
        if (suspiciousParams.length > 0) {
            recommendations.push(`Focus on securing these parameters: ${suspiciousParams.map(p => p.parameter).join(', ')}`);
        }
        
        return recommendations;
    }


    function generateCommandInjectionRecommendations(confidence, location) {
        const recommendations = [
            "Use safe APIs instead of system command execution",
            "Implement strict input validation with allowlists",
            "Apply proper escaping for shell commands if system calls are necessary"
        ];
        
        if (confidence === 'high') {
            recommendations.unshift("CRITICAL: Block or sanitize command injection patterns immediately");
        }
        
        if (location === 'URL Parameters') {
            recommendations.push("Validate and sanitize all URL parameters before processing");
        } else {
            recommendations.push("Validate and sanitize all form inputs before processing");
        }
        
        return recommendations;
    }


    function getInputContext(input) {
        const scripts = document.querySelectorAll('script');
        const inputName = input.name || input.id || '';
        let context = '';
        
        scripts.forEach(script => {
            if (script.textContent.includes(inputName)) {
                context += script.textContent;
            }
        });
        
        return context;
    }

    function stopScanner() {
        try {
            logMessage('Stopping scanner...', 'info');
            
            container?.remove();
            bubble?.remove();
            modal?.remove();
            
        
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                monitoringInterval = null;
            }
            
        
            window.dispatchEvent(new CustomEvent('securityScanComplete', {
                detail: {
                    url: window.location.href,
                    vulnerabilityCount: 0,
                    issues: [],
                    severityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
                    timestamp: Date.now(),
                    stopped: true,
                    message: 'Scanner stopped - site was added to whitelist'
                }
            }));
            
            logMessage('Scanner stopped successfully', 'info');
        } catch (error) {
            logMessage('Error stopping scanner: ' + error.message, 'error');
        }
    }
})();