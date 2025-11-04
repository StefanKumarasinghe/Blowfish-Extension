(function() {
    'use strict';

    const issues = new Map();
    let scanComplete = false;
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
            
    
            const severities = Array.from(issues.values()).map(issue => issue.severity);
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
            const ratingColor = summary.overall_rating === 'excellent' ? '#10b981' :
                               summary.overall_rating === 'good' ? colors.success : 
                               summary.overall_rating === 'moderate' ? colors.warning : 
                               summary.overall_rating === 'suspicious' ? '#f59e0b' : colors.danger;
            
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
            
        
            if (summary.domain_info && summary.domain_info.calculated_age_years !== undefined) {
                const ageColor = summary.domain_info.calculated_age_years >= 5 ? colors.success :
                               summary.domain_info.calculated_age_years >= 2 ? colors.warning : colors.danger;
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
                        const riskBadge = riskLevel !== 'none' ? 
                            `<span style="background: ${riskLevel === 'high' || riskLevel === 'critical' ? colors.danger : 
                                                     riskLevel === 'medium' ? colors.warning : colors.success}; 
                                          color: white; padding: 2px 6px; border-radius: 10px; font-size: 9px; margin-left: 8px;">
                                ${riskLevel.toUpperCase()}
                            </span>` : '';
                        
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
            
            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                el.style.transform = 'translateY(-2px)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = 'none';
                el.style.transform = 'translateY(0)';
            });
            
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


    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    header.addEventListener('mousedown', e => {
        isDragging = true;
        dragOffsetX = e.clientX - container.getBoundingClientRect().left;
        dragOffsetY = e.clientY - container.getBoundingClientRect().top;
        container.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            container.style.transition = 'all 0.3s ease';
        }
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        let newRight = window.innerWidth - e.clientX - dragOffsetX;
        let newBottom = window.innerHeight - e.clientY - dragOffsetY;

        newRight = Math.min(Math.max(newRight, 10), window.innerWidth - container.offsetWidth - 10);
        newBottom = Math.min(Math.max(newBottom, 10), window.innerHeight - container.offsetHeight - 10);

        container.style.right = newRight + 'px';
        container.style.bottom = newBottom + 'px';
    });


    async function sha256(str) {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

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
                checkMalwareDomains(hostname),
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
                    if (waybackData.archived_snapshots && waybackData.archived_snapshots.closest) {
                        const snapshot = waybackData.archived_snapshots.closest;
                        historyData.first_seen_wayback = snapshot.timestamp;
                        historyData.wayback_url = snapshot.url;
                        
                        const firstSeen = new Date(
                            snapshot.timestamp.substring(0, 4),
                            parseInt(snapshot.timestamp.substring(4, 6)) - 1,
                            snapshot.timestamp.substring(6, 8)
                        );
                        const daysSinceFirstSeen = Math.floor((new Date() - firstSeen) / (1000 * 60 * 60 * 24));
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
            if (dnsResponse && dnsResponse.ok) {
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
            console.log('WHOIS check failed:', e);
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
            console.log('Domain API check failed:', e);
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
            console.log('IP location check failed:', e);
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
    
    async function checkMalwareDomains(hostname) {
        try {
    
            const malwarePatterns = [
                /bit\.ly|tinyurl\.com|short\.link/i, // URL shorteners
                /[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}/, // IP-like domains
                /xn--/, // Punycode (internationalized domains)
                /(facebook|google|microsoft|apple|amazon|paypal)-?(login|secure|account|verify)/i, // Phishing patterns
            ];
            
            const matchedPatterns = malwarePatterns.filter(pattern => pattern.test(hostname));
            
            return {
                service: 'Malware Pattern Check',
                status: 'analyzed',
                data: {
                    suspicious_patterns: matchedPatterns.length,
                    risk_level: matchedPatterns.length > 0 ? 'high' : 'low',
                    patterns: matchedPatterns.map(p => p.toString())
                }
            };
        } catch (e) {}
        
        return { service: 'Malware Pattern Check', status: 'unavailable' };
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
                        // Convert YYYYMMDDHHMMSS format to human readable date
                        try {
                            const firstSeenTimestamp = result.data.first_seen_wayback.toString();
                            if (firstSeenTimestamp.length >= 8) {
                                const firstSeenDate = new Date(
                                    firstSeenTimestamp.substring(0, 4),  // year
                                    parseInt(firstSeenTimestamp.substring(4, 6)) - 1,  // month (0-indexed)
                                    firstSeenTimestamp.substring(6, 8)   // day
                                );
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
        
    
        const riskRatio = summary.risk_indicators / Math.max(summary.available_services, 1);
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
                parseInt(firstSeen.substring(4, 6)) - 1,
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

        bubble.innerHTML = '⚡<br><span style="font-size: 10px; margin-top: 4px;">READY</span>';
        

        setTimeout(runComprehensiveScan, 500);
    }, 1500);


    
    async function runComprehensiveScan() {
        try {
            logMessage('Starting comprehensive security scan', 'info');
            
            // Initialize scan state
            scanComplete = false;
            let scanStartTime = Date.now();
            let lastProgressUpdate = Date.now();
            
            // Set up progress monitoring
            const progressMonitor = setInterval(() => {
                const now = Date.now();
                if (now - lastProgressUpdate > 10000) { // 10 seconds without progress
                    logMessage('Scan progress check - ensuring scan is responsive', 'info');
                    window.dispatchEvent(new CustomEvent('securityScanProgress', {
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
            
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Starting comprehensive security scan - this may take a while...',
                    vulnerabilityCount: 0,
                    timestamp: Date.now()
                }
            }));
            
            // Phase 1: Quick checks
            logMessage('Phase 1: Quick security checks...', 'info');
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 1: Scanning document for exposed API keys and secrets...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            try {
                checkAPIKeys();
                lastProgressUpdate = Date.now();
            } catch (apiError) {
                logMessage(`API key check failed: ${apiError.message}`, 'error');
            }
            
            // Phase 2: Domain reputation
            logMessage('Phase 2: Domain reputation analysis...', 'info');
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
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
            
            // Phase 3: Core security checks
            logMessage('Phase 3: Core security analysis...', 'info');
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 3: Performing core security analysis...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            // Group checks into batches for better progress reporting
            const coreChecks = [
                { name: 'Protocol Security', func: checkProtocolSecurity },
                { name: 'Security Headers', func: checkSecurityHeaders },
                { name: 'SSL Certificate', func: checkSSLCertificate },
                { name: 'Mixed Content', func: checkMixedContent }
            ];
            
            for (const check of coreChecks) {
                try {
                    window.dispatchEvent(new CustomEvent('securityScanProgress', {
                        detail: {
                            currentCheck: `Checking ${check.name}...`,
                            vulnerabilityCount: vulnerabilityCount,
                            timestamp: Date.now()
                        }
                    }));
                    await check.func();
                    lastProgressUpdate = Date.now();
                } catch (error) {
                    logMessage(`${check.name} check failed: ${error.message}`, 'error');
                }
            }
            
            // Phase 4: Advanced security checks
            logMessage('Phase 4: Advanced security analysis...', 'info');
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 4: Performing advanced security analysis...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            const advancedChecks = [
                checkAdvancedContentSecurityPolicy,
                checkInjectionVulnerabilities,
                checkCryptographicImplementation,
                checkPrivacyLeaks,
                checkResourceIntegrity,
                checkCertificateTransparency,
                checkHSTSPreload,
                checkCookieSecurity,
                checkCORSConfiguration,
                checkFormSecurity,
                checkPasswordSecurity
            ];
            
            // Run advanced checks with error isolation
            const advancedResults = await Promise.allSettled(advancedChecks.map(check => {
                return new Promise(async (resolve, reject) => {
                    try {
                        await check();
                        resolve();
                    } catch (error) {
                        logMessage(`Advanced check failed: ${error.message}`, 'error');
                        resolve(); // Don't reject, continue with other checks
                    }
                });
            }));
            
            lastProgressUpdate = Date.now();
            
            // Phase 5: Client-side security checks
            logMessage('Phase 5: Client-side security analysis...', 'info');
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Phase 5: Analyzing client-side security...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            const clientSideChecks = [
                checkDOMVulnerabilities,
                checkClientSideVulnerabilities,
                checkWebSocketSecurity,
                checkBrowserExtensions,
                checkBrowserFingerprinting,
                checkWebAPISecurity,
                checkModernSecurityFeatures,
                checkThirdPartyResources,
                checkDNSRebindingProtection,
                checkAdvancedSecurity,
                checkDeprecatedFeatures
            ];
            
            // Run client-side checks with progress updates
            for (let i = 0; i < clientSideChecks.length; i++) {
                try {
                    window.dispatchEvent(new CustomEvent('securityScanProgress', {
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
            
            // Clear progress monitor
            clearInterval(progressMonitor);
            
            window.dispatchEvent(new CustomEvent('securityScanProgress', {
                detail: {
                    currentCheck: 'Finalizing scan results...',
                    vulnerabilityCount: vulnerabilityCount,
                    timestamp: Date.now()
                }
            }));
            
            scanComplete = true;
            const scanDuration = Date.now() - scanStartTime;
            
            logMessage(`Comprehensive scan completed in ${(scanDuration / 1000).toFixed(2)}s. Found ${vulnerabilityCount} issues`, 'info');
            
            updateBubbleBadge();
            
            const scanResults = {
                url: window.location.href,
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
            
            window.dispatchEvent(new CustomEvent('securityScanComplete', {
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

    async function checkCertificateHostname() {
        const evidence = [];
        const hostname = location.hostname;
        

        const hostnameIssues = [];
        

        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            hostnameIssues.push('Using IP address instead of domain name');
        }
        

        if (hostname.includes('_')) {
            hostnameIssues.push('Hostname contains invalid underscore characters');
        }
        

        if (hostname.length > 253) {
            hostnameIssues.push('Hostname exceeds maximum length');
        }
        

        if (/^(www\d+|mail\d+|server\d+)/.test(hostname)) {
            hostnameIssues.push('Hostname uses suspicious numbered pattern');
        }
        
        if (hostnameIssues.length > 0) {
            hostnameIssues.forEach(issue => {
                evidence.push({
                    type: 'Hostname Issue',
                    description: issue,
                    location: hostname
                });
            });
            
            addIssue('hostname-issues', 'Certificate hostname issues detected', 'medium', {
                title: 'Certificate Hostname Issues',
                description: 'Certificate hostname has potential security concerns.',
                impact: 'Medium - May cause certificate validation issues',
                solution: 'Use proper domain name with valid characters',
                evidence: evidence
            });
        }
    }
    
    async function checkCertificateExpiration() {
        const evidence = [];
        
        try {
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const expirationHeaders = [
                'expires',
                'x-certificate-expiry',
                'certificate-expiry'
            ];
            
            expirationHeaders.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    evidence.push({
                        type: 'Expiration Info',
                        description: `${header}: ${value}`,
                        location: 'HTTP Headers'
                    });
                }
            });
            
    
    
            const now = new Date();
            const warningPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
            
            evidence.push({
                type: 'Expiration Check',
                description: 'Certificate expiration monitoring recommended',
                location: 'Certificate management'
            });
            
        } catch (error) {
            console.log('Certificate expiration check failed:', error);
        }
    }
    
    async function checkCertificateAuthority() {
        const evidence = [];
        
        try {
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const evIndicators = [
                'x-ev-certificate',
                'extended-validation',
                'organization-validated'
            ];
            
            let certificateType = 'Domain Validated (DV)';
            
            evIndicators.forEach(indicator => {
                const value = response.headers.get(indicator);
                if (value) {
                    certificateType = 'Extended Validation (EV)';
                    evidence.push({
                        type: 'Certificate Type',
                        description: `EV certificate detected: ${indicator}`,
                        location: 'Certificate'
                    });
                }
            });
            
            evidence.push({
                type: 'Certificate Authority',
                description: `Certificate type: ${certificateType}`,
                        location: 'Certificate validation'
            });
            
    
            const serverHeader = response.headers.get('server');
            if (serverHeader && serverHeader.toLowerCase().includes('letsencrypt')) {
                evidence.push({
                    type: 'Certificate Authority',
                    description: 'Let\'s Encrypt certificate detected',
                    location: 'Server headers'
                });
            }
            
        } catch (error) {
            console.log('Certificate authority check failed:', error);
        }
    }
    
    async function testSSLVulnerabilities() {
        const evidence = [];
        

        const vulnerabilityTests = [
            {
                name: 'POODLE',
                description: 'Tests for SSLv3 POODLE vulnerability',
                test: () => testPOODLE()
            },
            {
                name: 'BEAST',
                description: 'Tests for TLS 1.0 BEAST vulnerability',
                test: () => testBEAST()
            },
            {
                name: 'Heartbleed',
                description: 'Tests for OpenSSL Heartbleed vulnerability',
                test: () => testHeartbleed()
            },
            {
                name: 'FREAK',
                description: 'Tests for FREAK vulnerability',
                test: () => testFREAK()
            },
            {
                name: 'Logjam',
                description: 'Tests for Logjam vulnerability',
                test: () => testLogjam()
            }
        ];
        
        for (const vulnTest of vulnerabilityTests) {
            try {
                const result = await vulnTest.test();
                if (result.vulnerable) {
                    evidence.push({
                        type: 'SSL Vulnerability',
                        description: `${vulnTest.name}: ${result.description}`,
                        location: 'SSL/TLS configuration'
                    });
                    
                    addIssue(`ssl-vuln-${vulnTest.name.toLowerCase()}`, 
                             `SSL vulnerability: ${vulnTest.name}`, 
                             'high', {
                        title: `SSL/TLS Vulnerability: ${vulnTest.name}`,
                        description: `${vulnTest.description} - ${result.description}`,
                        impact: 'High - SSL/TLS connection can be compromised',
                        solution: result.solution,
                        evidence: evidence,
                        references: [{
                            title: `${vulnTest.name} Vulnerability Info`,
                            url: result.referenceUrl || 'https://www.owasp.org/index.php/Transport_Layer_Protection_Cheat_Sheet'
                    }]
                    });
                }
            } catch (e) {
        
            }
        }
    }
    

    async function checkSSLCertificate() {
        const evidence = [];
        
        if (location.protocol === 'https:') {
            try {
        
                const certificateChecks = await Promise.allSettled([
                    checkCertificateValidity(),
                    checkCertificateChain(),
                    checkCertificateRevocation(),
                    checkCertificateTransparency(),
                    checkWeakCryptography(),
                    checkCertificateHostname(),
                    checkCertificateExpiration(),
                    checkCertificateAuthority(),
                    checkMixedContent(),
                    checkHSTSPreload(),
                    checkTLSConfiguration(),
                    checkCertificateTransparencyLogs(),
                    checkModernTLSFeatures()
                ]);
                
        
                certificateChecks.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.warn(`Certificate check ${index} failed:`, result.reason);
                    }
                });
                
        
                await testSSLVulnerabilities();
                
        
                const sslInfo = await getCertificateInfo();
                if (sslInfo) {
                    evidence.push({
                        type: 'SSL Summary',
                        description: `Protocol: ${sslInfo.protocol}, Cipher: ${sslInfo.cipher}`,
                        location: 'TLS Handshake'
                    });
                }
                
            } catch (e) {
                addIssue('ssl-check-failed', 'SSL certificate validation failed', 'medium', {
                    title: 'SSL Certificate Check Failed',
                    description: 'Unable to fully validate SSL certificate security.',
                    impact: 'Medium - Certificate security status unknown',
                    solution: 'Manually verify certificate using browser dev tools',
                    evidence: [{
                        type: 'Error',
                        description: e.message,
                        location: 'Certificate validation'
                    }]
                });
            }
        } else {
    
            addIssue('no-ssl', 'Site not using HTTPS encryption', 'critical', {
                title: 'No SSL/TLS Encryption',
                description: 'Site is served over unencrypted HTTP connection.',
                impact: 'Critical - All data transmitted in plain text',
                solution: 'Implement HTTPS with proper SSL/TLS certificate',
                evidence: [{
                    type: 'Protocol Check',
                    description: `Site using ${location.protocol}`,
                    location: location.href
                }],
                references: [
                    {
                        title: 'Why HTTPS Matters - Google',
                        url: 'https://developers.google.com/web/fundamentals/security/encrypt-in-transit/why-https'
                    }
                ]
            });
        }
    }

    async function checkWeakCryptography() {
        const evidence = [];
        
        try {
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            if (navigator.connection && navigator.connection.effectiveType) {
                evidence.push({
                    type: 'Connection Info',
                    description: `Effective connection type: ${navigator.connection.effectiveType}`,
                    location: 'Browser API'
                });
            }
            
    
            const serverHeader = response.headers.get('server');
            const weakCryptoIndicators = [];
            
            if (serverHeader) {
                const serverLower = serverHeader.toLowerCase();
                
        
                if (serverLower.includes('sslv2') || serverLower.includes('ssl 2')) {
                    weakCryptoIndicators.push('SSLv2 protocol detected');
                }
                if (serverLower.includes('sslv3') || serverLower.includes('ssl 3')) {
                    weakCryptoIndicators.push('SSLv3 protocol detected');
                }
                if (serverLower.includes('tls/1.0') || serverLower.includes('tls 1.0')) {
                    weakCryptoIndicators.push('TLS 1.0 protocol detected');
                }
                if (serverLower.includes('rc4')) {
                    weakCryptoIndicators.push('RC4 cipher detected');
                }
                if (serverLower.includes('des') && !serverLower.includes('3des')) {
                    weakCryptoIndicators.push('DES cipher detected');
                }
            }
            
    
            const securityHeaders = {
                hsts: response.headers.get('strict-transport-security'),
                hpkp: response.headers.get('public-key-pins'),
                expectCT: response.headers.get('expect-ct'),
                csp: response.headers.get('content-security-policy')
            };
            
    
            const securityFeatures = Object.values(securityHeaders).filter(Boolean).length;
            
    
            if (weakCryptoIndicators.length > 0) {
                weakCryptoIndicators.forEach(indicator => {
                    evidence.push({
                        type: 'Weak Cryptography',
                        description: indicator,
                        location: 'Server configuration'
                    });
                });
                
                addIssue('weak-crypto-detected', 'Weak cryptographic algorithms detected', 'high', {
                    title: 'Weak Cryptographic Algorithms',
                    description: 'Server is using outdated or weak cryptographic protocols/ciphers.',
                    impact: 'High - Vulnerable to cryptographic attacks',
                    solution: 'Upgrade to modern TLS versions (1.2+) and disable weak cipher suites',
                    evidence: evidence,
                    references: [{
                        title: 'TLS Security Best Practices',
                        url: 'https://wiki.mozilla.org/Security/Server_Side_TLS'
                    }]
                });
                return;
            }
            
    
            if (securityHeaders.hsts) {
                const hstsValue = securityHeaders.hsts.toLowerCase();
                const hstsIssues = [];
                
                if (!hstsValue.includes('includesubdomains')) {
                    hstsIssues.push('HSTS missing includeSubDomains directive');
                }
                
        
                const maxAgeMatch = hstsValue.match(/max-age=(\d+)/);
                if (maxAgeMatch) {
                    const maxAge = parseInt(maxAgeMatch[1]);
                    if (maxAge < 31536000) { // Less than 1 year
                        hstsIssues.push(`HSTS max-age too short: ${maxAge} seconds`);
                    }
                }
                
                if (hstsIssues.length > 0) {
                    hstsIssues.forEach(issue => {
                        evidence.push({
                            type: 'HSTS Configuration',
                            description: issue,
                            location: 'HSTS header'
                        });
                    });
                    
                    addIssue('hsts-config-weak', 'HSTS configuration could be improved', 'low', {
                        title: 'HSTS Configuration Improvement',
                        description: 'HSTS is configured but could be strengthened.',
                        impact: 'Low - HSTS protection could be enhanced',
                        solution: 'Add includeSubDomains and increase max-age to at least 1 year',
                        evidence: evidence
                    });
                }
            }
            
    
            if (securityFeatures === 0) {
                evidence.push({
                    type: 'Security Headers',
                    description: 'No modern security headers detected (HSTS, HPKP, Expect-CT, CSP)',
                    location: 'HTTP response headers'
                });
                
        
                const hostname = location.hostname;
                const isSensitiveSite = hostname.includes('login') || 
                                      hostname.includes('pay') || 
                                      hostname.includes('bank') ||
                                      hostname.includes('secure') ||
                                      document.querySelector('input[type="password"]');
                
                if (isSensitiveSite) {
                    addIssue('missing-security-headers-sensitive', 'Sensitive site missing security headers', 'medium', {
                        title: 'Missing Security Headers on Sensitive Site',
                        description: 'Site appears to handle sensitive data but lacks modern security headers.',
                        impact: 'Medium - Enhanced security recommended for sensitive sites',
                        solution: 'Implement HSTS, CSP, and other security headers',
                        evidence: evidence
                    });
                }
            } else {
        
                evidence.push({
                    type: 'Security Assessment',
                    description: `${securityFeatures} modern security features detected`,
                    location: 'Security headers analysis'
                });
            }
            
        } catch (error) {
            console.log('Crypto strength check failed:', error);
            
    
            if (error.message.toLowerCase().includes('weak') ||
                error.message.toLowerCase().includes('insecure') ||
                error.message.toLowerCase().includes('deprecated')) {
                addIssue('crypto-check-error', 'Cryptographic configuration check failed', 'medium', {
                    title: 'Cryptographic Check Error',
                    description: 'Unable to verify cryptographic configuration strength.',
                    impact: 'Medium - Crypto strength verification failed',
                    solution: 'Manually verify TLS configuration and cipher suites',
                    evidence: [{
                        type: 'Crypto Error',
                        description: error.message,
                        location: 'Cryptographic assessment'
                    }]
                });
            }
        }
    }
    

    async function getCertificateInfo() {
        try {
    
            if ('connection' in navigator && navigator.connection.effectiveType) {
                return {
                    protocol: 'TLS (Browser API limited)',
                    cipher: navigator.connection.effectiveType
                };
            }
            
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            const serverTiming = response.headers.get('server-timing');
            
            if (serverTiming) {
                return {
                    protocol: 'TLS',
                    cipher: 'Server timing available'
                };
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
    
    async function checkTLSConfiguration() {
        const evidence = [];
        
        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const tlsHeaders = [
                'strict-transport-security',
                'alt-svc', // HTTP/2 and HTTP/3 indicators
                'x-frame-options',
                'x-content-type-options'
            ];
            
            let modernTLSFeatures = 0;
            
            tlsHeaders.forEach(header => {
                        const value = response.headers.get(header);
                        if (value) {
                    modernTLSFeatures++;
                            evidence.push({
                        type: 'TLS Feature',
                        description: `${header}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`,
                                location: 'HTTP Headers'
                            });
                        }
            });
            
    
            const altSvc = response.headers.get('alt-svc');
            if (altSvc) {
                if (altSvc.includes('h3') || altSvc.includes('quic')) {
                    evidence.push({
                        type: 'Advanced Protocol',
                        description: 'HTTP/3 (QUIC) support detected',
                        location: 'Alt-Svc header'
                    });
                } else if (altSvc.includes('h2')) {
                    evidence.push({
                        type: 'Advanced Protocol',
                        description: 'HTTP/2 support detected',
                        location: 'Alt-Svc header'
                    });
                }
            }
            
            if (modernTLSFeatures < 2) {
                addIssue('minimal-tls-config', 'Minimal TLS configuration detected', 'medium', {
                    title: 'Basic TLS Configuration',
                    description: 'Server lacks modern TLS security features and headers.',
                    impact: 'Medium - Missing advanced security protections',
                    solution: 'Implement comprehensive TLS security headers and features',
                    evidence: evidence
                });
            }
            
        } catch (error) {
            console.log('TLS configuration check failed:', error);
        }
    }
    
    async function checkCertificateTransparencyLogs() {
        const evidence = [];
        
        try {
    
            const hostname = location.hostname;
            
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            const expectCT = response.headers.get('expect-ct');
            
            if (expectCT) {
                evidence.push({
                    type: 'Certificate Transparency',
                    description: `Expect-CT header: ${expectCT}`,
                    location: 'HTTP Headers'
                });
                
        
                if (expectCT.includes('enforce')) {
                    evidence.push({
                        type: 'CT Enforcement',
                        description: 'Certificate Transparency enforcement enabled',
                        location: 'Security policy'
                    });
                }
                
                if (expectCT.includes('report-uri')) {
                    const reportMatch = expectCT.match(/report-uri="([^"]+)"/);
                    if (reportMatch) {
                        evidence.push({
                            type: 'CT Reporting',
                            description: `CT violations reporting to: ${reportMatch[1]}`,
                            location: 'Security policy'
                        });
                    }
                }
            } else {
                addIssue('no-ct-monitoring', 'Certificate Transparency monitoring not configured', 'low', {
                    title: 'No Certificate Transparency Monitoring',
                    description: 'Site does not monitor certificate transparency logs.',
                    impact: 'Low - Reduced protection against certificate mis-issuance',
                    solution: 'Implement Expect-CT header with monitoring',
                    evidence: [{
                        type: 'Missing Feature',
                        description: 'No Expect-CT header found',
                        location: 'Security headers'
                    }]
                });
            }
            
        } catch (error) {
            console.log('Certificate transparency check failed:', error);
        }
    }
    
    async function checkModernTLSFeatures() {
        const evidence = [];
        
        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const modernFeatures = {
                'public-key-pins': 'HTTP Public Key Pinning',
                'public-key-pins-report-only': 'HPKP Report-Only',
                'nel': 'Network Error Logging',
                'report-to': 'Reporting API',
                'cross-origin-embedder-policy': 'Cross-Origin Embedder Policy',
                'cross-origin-opener-policy': 'Cross-Origin Opener Policy',
                'cross-origin-resource-policy': 'Cross-Origin Resource Policy'
            };
            
            let modernFeatureCount = 0;
            
            Object.entries(modernFeatures).forEach(([header, description]) => {
                const value = response.headers.get(header);
                if (value) {
                    modernFeatureCount++;
                evidence.push({
                        type: 'Modern Security Feature',
                        description: `${description}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`,
                        location: 'HTTP Headers'
                    });
                }
            });
            
    
            const deprecatedFeatures = {
                'x-frame-options': 'Consider upgrading to Content-Security-Policy frame-ancestors',
                'x-xss-protection': 'Consider relying on Content-Security-Policy',
                'x-content-type-options': 'Should be supplemented with CSP'
            };
            
            Object.entries(deprecatedFeatures).forEach(([header, recommendation]) => {
                const value = response.headers.get(header);
                if (value) {
                    evidence.push({
                        type: 'Legacy Security Feature',
                        description: `${header}: ${value} (${recommendation})`,
                        location: 'HTTP Headers'
                    });
                }
            });
            
            if (modernFeatureCount === 0) {
                addIssue('no-modern-tls-features', 'No modern TLS security features detected', 'medium', {
                    title: 'Missing Modern TLS Features',
                    description: 'Site lacks modern TLS security enhancements.',
                    impact: 'Medium - Missing cutting-edge security protections',
                    solution: 'Implement modern security headers like COEP, COOP, NEL',
                    evidence: evidence
                });
            }
            
        } catch (error) {
            console.log('Modern TLS features check failed:', error);
        }
    }
    
    async function getCertificateInfoFromBrowser() {

        const certInfo = {
            hasValidCert: false,
            isRevoked: false,
            issuer: null,
            subject: null,
            validFrom: null,
            validTo: null,
            fingerprint: null,
            source: 'unknown'
        };
        
        try {
    
            if (typeof chrome !== 'undefined' && chrome.certificateProvider) {
                try {
                    const certs = await chrome.certificateProvider.getCertificates();
                    if (certs && certs.length > 0) {
                        const cert = certs[0];
                        certInfo.hasValidCert = true;
                        certInfo.isRevoked = cert.revoked || false;
                        certInfo.issuer = cert.issuer;
                        certInfo.subject = cert.subject;
                        certInfo.source = 'chrome-api';
                        return certInfo;
                    }
                } catch (e) {
                    console.debug('Chrome certificate API not available:', e.message);
                }
            }
            
    
            if (window.crypto && window.crypto.subtle) {
                try {
            
                    await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(location.hostname));
                    certInfo.hasValidCert = true;
                    certInfo.source = 'webcrypto';
                } catch (e) {
                    console.debug('WebCrypto validation failed:', e.message);
                }
            }
            
    
            if (performance && performance.getEntriesByType) {
                try {
                    const navEntries = performance.getEntriesByType('navigation');
                    if (navEntries.length > 0) {
                        const entry = navEntries[0];
                
                        if (location.protocol === 'https:' && entry.secureConnectionStart > 0) {
                            certInfo.hasValidCert = true;
                            certInfo.source = 'performance-api';
                        }
                    }
                } catch (e) {
                    console.debug('Performance API check failed:', e.message);
                }
            }
            
    
            if (location.protocol === 'https:' && document.readyState === 'complete') {
                certInfo.hasValidCert = true;
                certInfo.source = 'https-connection';
            }
            
        } catch (error) {
            console.debug('Certificate info gathering failed:', error.message);
        }
        
        return certInfo;
    }

    async function checkCertificateValidity() {
        const evidence = [];
        
        try {
    
            const browserCertInfo = await getCertificateInfoFromBrowser();
            
                evidence.push({
                type: 'Certificate Detection',
                description: `Certificate info source: ${browserCertInfo.source}`,
                location: 'Browser validation'
            });
            
    
            if (browserCertInfo.isRevoked) {
                addIssue('certificate-revoked-browser', 'Certificate revoked (confirmed by browser)', 'critical', {
                    title: 'Revoked Certificate Detected',
                    description: 'Browser APIs confirm this certificate has been revoked.',
                    impact: 'Critical - Certificate is invalid and site will be inaccessible',
                    solution: 'Replace certificate immediately',
                    evidence: evidence
                });
                return;
            }
            
    
            const certificateTests = [
                { name: 'Self-Signed', test: testSelfSigned },
                { name: 'Expired', test: testExpiredCert },
                { name: 'Wrong Hostname', test: testWrongHostname },
                { name: 'Untrusted Root', test: testUntrustedRoot },
                { name: 'Revoked', test: testRevokedCert },
                { name: 'Weak Key', test: testWeakKey },
                { name: 'Incomplete Chain', test: testIncompleteChain },
                { name: 'Mixed CA', test: testMixedCA }
            ];
            
            const testResults = [];
            let criticalIssues = 0;
            let totalTests = certificateTests.length;
            
            for (const testCase of certificateTests) {
                try {
                    const result = await testCase.test();
                    testResults.push({ ...result, testName: testCase.name });
                    
                    if (result.hasIssue) {
                        criticalIssues++;
                        evidence.push({
                            type: 'Certificate Issue',
                            description: `${testCase.name}: ${result.description}`,
                            location: 'Certificate validation'
                        });
                        
                
                        if (testCase.name === 'Revoked' || 
                            testCase.name === 'Expired' ||
                            (testCase.name === 'Self-Signed' && !location.hostname.includes('localhost'))) {
                            
                            addIssue(`cert-${testCase.name.toLowerCase().replace(' ', '-')}`, 
                                     `Certificate issue: ${testCase.name}`, 
                                     'high', {
                                title: `Certificate ${testCase.name} Issue`,
                                description: result.description,
                                impact: result.impact,
                                solution: result.solution,
                evidence: evidence
            });
                        }
                    }
                } catch (testError) {
                    console.debug(`Certificate test "${testCase.name}" failed:`, testError.message);
            
                }
            }
            
    
            evidence.push({
                type: 'Certificate Validation',
                description: `${criticalIssues} of ${totalTests} certificate tests failed`,
                location: 'Certificate validation suite'
            });
            
    
            if (criticalIssues >= 3 || 
                (criticalIssues >= 1 && testResults.some(r => r.testName === 'Revoked' && r.hasIssue))) {
                
                addIssue('certificate-validity-issues', 'Multiple certificate validation issues', 'high', {
                    title: 'Certificate Validation Issues',
                    description: `Certificate failed ${criticalIssues} of ${totalTests} validation tests.`,
                    impact: 'High - Certificate may not be trustworthy',
                    solution: 'Review and fix certificate configuration issues',
                    evidence: evidence
                });
            } else if (criticalIssues > 0) {
        
                evidence.push({
                    type: 'Certificate Status',
                    description: `Minor certificate issues detected (${criticalIssues} tests failed)`,
                    location: 'Certificate assessment'
                });
            } else {
        
                evidence.push({
                    type: 'Certificate Status',
                    description: 'All certificate validation tests passed',
                    location: 'Certificate assessment'
                });
            }
            
        } catch (error) {
            console.log('Certificate validity check failed:', error);
            
    
            if (error.message.toLowerCase().includes('certificate') ||
                error.message.toLowerCase().includes('ssl') ||
                error.message.toLowerCase().includes('tls')) {
                
                addIssue('certificate-validation-error', 'Certificate validation error', 'medium', {
                    title: 'Certificate Validation Error',
                    description: 'Error occurred during certificate validation.',
                    impact: 'Medium - Unable to verify certificate status',
                    solution: 'Check certificate configuration and network connectivity',
                    evidence: [{
                        type: 'Validation Error',
                        description: error.message,
                        location: 'Certificate validation'
                    }]
                });
            }
        }
    }

    async function checkCertificateChain() {
        const evidence = [];
        
        try {
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const chainHeaders = [
                'x-certificate-chain',
                'x-ssl-certificate',
                'certificate-transparency',
                'x-certificate-transparency',
                'x-ct-sct-source'
            ];
            
            let chainInfoFound = false;
            chainHeaders.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    chainInfoFound = true;
                    evidence.push({
                        type: 'Certificate Chain Info',
                        description: `${header}: present`,
                        location: 'HTTP Headers'
                    });
                }
            });
            
    
            const serverHeader = response.headers.get('server');
            const hstsHeader = response.headers.get('strict-transport-security');
            const expectCTHeader = response.headers.get('expect-ct');
            
    
            const chainQualityIndicators = [
                !!hstsHeader,
                !!expectCTHeader,
                !!response.headers.get('x-frame-options'),
                !!response.headers.get('x-content-type-options')
            ].filter(Boolean).length;
            
            if (chainQualityIndicators < 2) {
                addIssue('potentially-incomplete-cert-chain', 'Potentially incomplete certificate chain', 'medium', {
                    title: 'Potentially Incomplete Certificate Chain',
                    description: 'Certificate chain may be incomplete based on missing security headers.',
                    impact: 'Medium - Some clients may have difficulty validating certificate',
                    solution: 'Verify complete certificate chain including intermediate certificates',
                    evidence: evidence.length > 0 ? evidence : [{
                        type: 'Missing Indicators',
                        description: 'Few chain quality indicators found',
                        location: 'Security headers analysis'
                    }]
                });
            }
            
    
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Mobile') && chainQualityIndicators < 3) {
            evidence.push({
                    type: 'Mobile Compatibility',
                    description: 'Mobile browser detected with potentially incomplete chain',
                    location: 'User agent analysis'
                });
                
                addIssue('mobile-cert-chain-issues', 'Potential mobile certificate issues', 'medium', {
                    title: 'Mobile Certificate Chain Issues',
                    description: 'Certificate chain may cause issues on mobile devices.',
                    impact: 'Medium - Mobile users may experience connection problems',
                    solution: 'Ensure complete certificate chain with all intermediate certificates',
                    evidence: evidence
                });
            }
            
        } catch (error) {
            console.log('Certificate chain check failed:', error);
            
            if (error.message.toLowerCase().includes('chain') ||
                error.message.toLowerCase().includes('intermediate')) {
                addIssue('cert-chain-error', 'Certificate chain validation error', 'high', {
                    title: 'Certificate Chain Error',
                    description: 'Error occurred while validating certificate chain.',
                    impact: 'High - Certificate chain may be broken',
                    solution: 'Check certificate chain configuration',
                    evidence: [{
                        type: 'Chain Error',
                        description: error.message,
                        location: 'Certificate validation'
                    }]
                });
            }
        }
    }

    async function checkCertificateRevocation() {
        const evidence = [];
        
        try {
    
            const response = await fetch(location.origin, { method: 'HEAD' });
            
            const revocationHeaders = [
                'ocsp-response',
                'crl-distribution-points',
                'authority-info-access',
                'x-ocsp-response',
                'x-certificate-status'
            ];
            
            let hasRevocationCheck = false;
            let ocspStaplingEnabled = false;
            let revocationStatus = 'unknown';
            
            revocationHeaders.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    hasRevocationCheck = true;
                    evidence.push({
                        type: 'Revocation Check',
                        description: `${header}: configured`,
                        location: 'Certificate headers'
                    });
                    
                    if (header.includes('ocsp')) {
                        ocspStaplingEnabled = true;
                        
                
                        const lowerValue = value.toLowerCase();
                        if (lowerValue.includes('good') || lowerValue.includes('status: good')) {
                            revocationStatus = 'good';
                        } else if (lowerValue.includes('revoked')) {
                            revocationStatus = 'revoked';
                        }
                    }
                }
            });
            
    
            const expectCTHeader = response.headers.get('expect-ct');
            if (expectCTHeader && expectCTHeader.includes('must-staple')) {
            evidence.push({
                    type: 'OCSP Must-Staple',
                    description: 'Certificate requires OCSP stapling',
                    location: 'Certificate policy'
                });
                
                if (!ocspStaplingEnabled) {
                    addIssue('ocsp-must-staple-violation', 'OCSP Must-Staple policy violation', 'high', {
                        title: 'OCSP Must-Staple Violation',
                        description: 'Certificate requires OCSP stapling but it\'s not configured.',
                        impact: 'High - Certificate policy violation',
                        solution: 'Configure OCSP stapling on web server',
                        evidence: evidence
                    });
                }
            }
            
    
    
            if (!hasRevocationCheck) {
        
                const hostname = location.hostname;
                const isHighValueTarget = hostname.includes('bank') || 
                                        hostname.includes('pay') || 
                                        hostname.includes('secure') ||
                                        hostname.includes('admin') ||
                                        hostname.includes('api');
                
                if (isHighValueTarget) {
                    addIssue('no-revocation-check-high-value', 'High-value site without explicit revocation checking', 'medium', {
                        title: 'Missing Revocation Checking for High-Value Site',
                        description: 'High-value domains should implement explicit certificate revocation checking.',
                        impact: 'Medium - Recommended security enhancement for sensitive sites',
                        solution: 'Consider implementing OCSP stapling for improved security assurance',
                        evidence: [{
                            type: 'Security Recommendation',
                            description: 'High-value domain detected without explicit revocation checking',
                            location: 'Security best practices'
                        }]
                    });
                } else {
            
                evidence.push({
                        type: 'Revocation Info',
                        description: 'No explicit revocation checking configured (this is normal for most sites)',
                        location: 'Certificate configuration'
                    });
                }
            } else if (ocspStaplingEnabled) {
                evidence.push({
                    type: 'OCSP Stapling',
                    description: `OCSP stapling enabled - Status: ${revocationStatus}`,
                    location: 'Certificate validation'
                });
                
        
                if (revocationStatus === 'revoked') {
                    addIssue('certificate-revoked', 'Certificate is revoked', 'critical', {
                        title: 'Revoked Certificate Detected',
                        description: 'The certificate has been revoked by the certificate authority.',
                        impact: 'Critical - Site will be inaccessible to users',
                        solution: 'Replace certificate immediately',
                        evidence: evidence
                    });
                }
            }
            
        } catch (error) {
            console.log('Revocation check failed:', error);
            
    
            if (error.message.toLowerCase().includes('revoked') ||
                error.message.toLowerCase().includes('ocsp') && error.message.toLowerCase().includes('fail')) {
                addIssue('revocation-check-error', 'Certificate revocation check failed', 'medium', {
                    title: 'Revocation Check Error',
                    description: 'Error occurred while checking certificate revocation status.',
                    impact: 'Medium - Unable to verify certificate validity',
                    solution: 'Verify certificate status manually with certificate authority',
                    evidence: [{
                        type: 'Revocation Error',
                        description: error.message,
                        location: 'Certificate validation'
                    }]
                });
            }
        }
    }
    
    async function testSSLVulnerabilities() {
        const evidence = [];
        

        const vulnerabilityTests = [
            {
                name: 'POODLE',
                description: 'Tests for SSLv3 POODLE vulnerability (CVE-2014-3566)',
                test: () => testPOODLE()
            },
            {
                name: 'BEAST',
                description: 'Tests for TLS 1.0 BEAST vulnerability (CVE-2011-3389)',
                test: () => testBEAST()
            },
            {
                name: 'Heartbleed',
                description: 'Tests for OpenSSL Heartbleed vulnerability (CVE-2014-0160)',
                test: () => testHeartbleed()
            },
            {
                name: 'FREAK',
                description: 'Tests for FREAK vulnerability (CVE-2015-0204)',
                test: () => testFREAK()
            },
            {
                name: 'Logjam',
                description: 'Tests for Logjam vulnerability (CVE-2015-4000)',
                test: () => testLogjam()
            },
            {
                name: 'CRIME',
                description: 'Tests for CRIME compression vulnerability',
                test: () => testCRIME()
            },
            {
                name: 'BREACH',
                description: 'Tests for BREACH compression vulnerability',
                test: () => testBREACH()
            }
        ];
        
        const vulnerabilityResults = [];
        
        for (const vulnTest of vulnerabilityTests) {
            try {
                const result = await vulnTest.test();
                vulnerabilityResults.push({ ...result, testName: vulnTest.name });
                
                if (result.vulnerable) {
                    evidence.push({
                        type: 'SSL Vulnerability',
                        description: `${vulnTest.name}: ${result.description}`,
                        location: 'SSL/TLS configuration'
                    });
                    
                    addIssue(`ssl-vuln-${vulnTest.name.toLowerCase()}`, 
                             `SSL vulnerability: ${vulnTest.name}`, 
                             'high', {
                        title: `SSL/TLS Vulnerability: ${vulnTest.name}`,
                        description: `${vulnTest.description} - ${result.description}`,
                        impact: 'High - SSL/TLS connection can be compromised',
                        solution: result.solution,
                        evidence: evidence,
                        references: [{
                            title: `${vulnTest.name} Vulnerability Info`,
                            url: result.referenceUrl || 'https://www.owasp.org/index.php/Transport_Layer_Protection_Cheat_Sheet'
                    }]
                });
                }
            } catch (e) {
        
                console.debug(`SSL vulnerability test "${vulnTest.name}" failed:`, e.message);
            }
        }
        

        const vulnerabilities = vulnerabilityResults.filter(r => r.vulnerable);
        if (vulnerabilities.length === 0) {
            evidence.push({
                type: 'SSL Vulnerability Scan',
                description: `All ${vulnerabilityResults.length} SSL vulnerability tests passed`,
                location: 'SSL security assessment'
            });
        } else {
            evidence.push({
                type: 'SSL Vulnerability Scan',
                description: `${vulnerabilities.length} of ${vulnerabilityResults.length} SSL vulnerability tests failed`,
                location: 'SSL security assessment'
            });
        }
    }

    async function testCRIME() {

        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
    
            
    
            const serverHeader = response.headers.get('server');
            const serverLower = serverHeader ? serverHeader.toLowerCase() : '';
            
    
            const hasOldTLS = serverLower.includes('tls/1.0') || 
                             serverLower.includes('tls 1.0') ||
                             serverLower.includes('ssl') ||
                             serverLower.includes('openssl/0.') ||
                             serverLower.includes('openssl/1.0');
            
    
            const contentEncoding = response.headers.get('content-encoding');
            const hasHttpCompression = contentEncoding && 
                (contentEncoding.includes('gzip') || 
                 contentEncoding.includes('deflate') || 
                 contentEncoding.includes('compress'));
            
    
            const securityHeaders = {
                hsts: response.headers.get('strict-transport-security'),
                csp: response.headers.get('content-security-policy'),
                frameOptions: response.headers.get('x-frame-options')
            };
            
            const protectionCount = Object.values(securityHeaders).filter(Boolean).length;
            
    
            if (hasOldTLS && hasHttpCompression) {
        
                const modernServerIndicators = [
                    serverLower.includes('nginx/1.'),
                    serverLower.includes('apache/2.4'),
                    serverLower.includes('cloudflare'),
                    serverLower.includes('h2'), // HTTP/2 support
                    !!response.headers.get('alt-svc') // Alternative services header
                ].filter(Boolean).length;
                
                if (modernServerIndicators < 2) {
                    return {
                        vulnerable: true,
                        description: 'Potential CRIME vulnerability (old TLS version with compression)',
                        solution: 'Upgrade to TLS 1.2+ and disable TLS compression',
                        referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
                    };
                }
            }
            
    
    
            const userAgent = navigator.userAgent.toLowerCase();
            const modernBrowser = userAgent.includes('chrome') || 
                                 userAgent.includes('firefox') ||
                                 userAgent.includes('safari') ||
                                 userAgent.includes('edge');
            
            if (modernBrowser && protectionCount >= 2) {
        return {
            vulnerable: false,
                    description: 'CRIME vulnerability mitigated by modern browser and server protections',
                    solution: 'Continue monitoring TLS configuration',
                    referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
                };
            }
            
    
            if (hasHttpCompression && !securityHeaders.hsts) {
        
                const hasSessionCookies = document.cookie.includes('session') || 
                                         document.cookie.includes('auth') ||
                                         document.cookie.includes('login');
                
                if (hasSessionCookies) {
                    return {
                        vulnerable: true,
                        description: 'Potential CRIME risk (compression + session cookies without HSTS)',
                        solution: 'Implement HSTS and monitor TLS compression settings',
                        referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
                    };
                }
            }
            
    
            if (hasHttpCompression) {
        return {
            vulnerable: false,
                    description: 'HTTP compression detected but CRIME risk minimal with current configuration',
                    solution: 'Ensure TLS compression is disabled on server',
                    referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
                };
            } else {
                return {
                    vulnerable: false,
                    description: 'No compression detected - not vulnerable to CRIME',
                    solution: 'Continue monitoring compression settings',
                    referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
                };
            }
            
        } catch (error) {
        return {
            vulnerable: false,
                description: 'CRIME assessment inconclusive due to error',
                solution: 'Manual verification of TLS compression settings recommended',
                referenceUrl: 'https://en.wikipedia.org/wiki/CRIME'
            };
        }
    }

    async function testBREACH() {

        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            
    
            if (location.protocol !== 'https:') {
        return {
            vulnerable: false,
                    description: 'No BREACH vulnerability - site not using HTTPS',
                    solution: 'Not applicable for HTTP sites',
                    referenceUrl: 'https://breachattack.com/'
                };
            }
            
    
            const contentEncoding = response.headers.get('content-encoding');
            const varyHeader = response.headers.get('vary');
            const acceptEncoding = response.headers.get('accept-encoding');
            
            const hasHttpCompression = contentEncoding && 
                (contentEncoding.includes('gzip') || contentEncoding.includes('deflate') || contentEncoding.includes('br'));
            
            if (!hasHttpCompression) {
        return {
            vulnerable: false,
                    description: 'No BREACH vulnerability - HTTP compression not detected',
                    solution: 'Continue monitoring compression settings',
                    referenceUrl: 'https://breachattack.com/'
                };
            }
            
    
            const securityHeaders = {
                csp: response.headers.get('content-security-policy'),
                csrf: response.headers.get('x-csrf-token') || response.headers.get('csrf-token'),
                frameOptions: response.headers.get('x-frame-options'),
                sameSite: document.cookie.includes('SameSite='),
                strictTransport: response.headers.get('strict-transport-security')
            };
            
    
            let protectionCount = 0;
            if (securityHeaders.csp && securityHeaders.csp.includes('frame-ancestors')) protectionCount++;
            if (securityHeaders.csrf) protectionCount++;
            if (securityHeaders.frameOptions) protectionCount++;
            if (securityHeaders.sameSite) protectionCount++;
            if (securityHeaders.strictTransport) protectionCount++;
            
    
            const sensitiveInputs = document.querySelectorAll(
                'input[type="password"], input[name*="password"], input[name*="token"], ' +
                'input[name*="secret"], input[name*="key"], input[name*="csrf"]'
            );
            
            const forms = document.querySelectorAll('form');
            let hasAuthForms = false;
            forms.forEach(form => {
                const action = form.getAttribute('action') || '';
                if (action.includes('login') || action.includes('auth') || 
                    action.includes('signin') || action.includes('password')) {
                    hasAuthForms = true;
                }
            });
            
    
            const bodyText = document.body.textContent.toLowerCase();
            const reflectsSecrets = bodyText.includes('csrf') || 
                                  bodyText.includes('session') ||
                                  bodyText.includes('token') ||
                                  (document.querySelector('meta[name="csrf-token"]') !== null);
            
    
            const riskFactors = {
                hasCompression: hasHttpCompression,
                hasSensitiveInputs: sensitiveInputs.length > 0,
                hasAuthForms: hasAuthForms,
                reflectsSecrets: reflectsSecrets,
                protectionMechanisms: protectionCount
            };
            
    
            const highRiskConditions = [
                riskFactors.hasSensitiveInputs,
                riskFactors.hasAuthForms,
                riskFactors.reflectsSecrets
            ].filter(Boolean).length;
            
            if (highRiskConditions >= 2 && protectionCount < 2) {
        
                const hasJavaScript = document.scripts.length > 0;
                const hasAjax = document.body.innerHTML.includes('ajax') || 
                               document.body.innerHTML.includes('xhr') ||
                               document.body.innerHTML.includes('fetch');
                
                if (hasJavaScript || hasAjax) {
                    return {
                        vulnerable: true,
                        description: `Potential BREACH vulnerability detected (compression + ${highRiskConditions} risk factors, ${protectionCount} protections)`,
                        solution: 'Implement CSRF tokens, disable compression for sensitive responses, or use length-hiding techniques',
                        referenceUrl: 'https://breachattack.com/'
                    };
                }
            }
            
    
            const currentUrl = window.location.href;
            const isAPIEndpoint = currentUrl.includes('/api/') || 
                                 currentUrl.includes('/rest/') ||
                                 currentUrl.includes('.json') ||
                                 document.querySelector('script[type="application/json"]');
            
            if (isAPIEndpoint && reflectsSecrets && protectionCount === 0) {
                return {
                    vulnerable: true,
                    description: 'BREACH vulnerability in API endpoint with secret reflection',
                    solution: 'Disable compression for API responses containing secrets',
                    referenceUrl: 'https://breachattack.com/'
                };
            }
            
    
            if (protectionCount >= 3) {
                return {
                    vulnerable: false,
                    description: `BREACH risk mitigated by ${protectionCount} protection mechanisms`,
                    solution: 'Continue monitoring compression and secret handling',
                    referenceUrl: 'https://breachattack.com/'
                };
            }
            
    
            return {
                vulnerable: false,
                description: 'HTTP compression detected but BREACH risk appears minimal',
                solution: 'Monitor for secret reflection in compressed responses',
                referenceUrl: 'https://breachattack.com/'
            };
            
        } catch (error) {
            return {
                vulnerable: false,
                description: 'BREACH assessment inconclusive due to error',
                solution: 'Manual verification recommended',
                referenceUrl: 'https://breachattack.com/'
            };
        }
    }
    
    function checkMixedContent() {
        const evidence = [];
        

        const httpResources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"], iframe[src^="http:"]');
        
        if (httpResources.length > 0 && location.protocol === 'https:') {
            httpResources.forEach((resource, index) => {
                evidence.push({
                    type: 'Mixed Content',
                    description: `${resource.tagName.toLowerCase()} loaded over HTTP`,
                    code: resource.outerHTML,
                    location: `${resource.tagName}[${index}]`
                });
            });
            
            addIssue('mixed-content', `${httpResources.length} mixed content resources detected`, 'high', {
                title: 'Mixed Content Vulnerability',
                description: 'HTTPS page loading HTTP resources compromises security.',
                impact: 'High - Allows man-in-the-middle attacks on resources',
                solution: 'Update all resource URLs to use HTTPS',
                evidence: evidence,
                references: [
                    {
                        title: 'Mixed Content - MDN',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content'
                    }
                ]
            });
        }
    }
    
    function checkCertificateTransparency() {

        fetch(location.origin, { method: 'HEAD' })
            .then(response => {
                const ctHeader = response.headers.get('expect-ct');
                if (!ctHeader) {
                    addIssue('no-certificate-transparency', 'Certificate Transparency not enforced', 'low', {
                        title: 'Missing Certificate Transparency',
                        description: 'Site does not enforce Certificate Transparency monitoring.',
                        impact: 'Low - Reduced protection against rogue certificates',
                        solution: 'Implement Expect-CT header',
                        evidence: [{
                            type: 'Missing Header',
                            description: 'Expect-CT header not present',
                            location: 'HTTP Response Headers'
                        }]
                    });
                }
            })
            .catch(() => {});
    }
    
    function checkHSTSPreload() {
        fetch(location.origin, { method: 'HEAD' })
            .then(response => {
                const hstsHeader = response.headers.get('strict-transport-security');
                if (hstsHeader) {
                    if (!hstsHeader.includes('preload')) {
                        addIssue('hsts-no-preload', 'HSTS preload not enabled', 'medium', {
                            title: 'HSTS Preload Missing',
                            description: 'HSTS header present but preload not enabled.',
                            impact: 'Medium - First visit vulnerable to downgrade attacks',
                            solution: 'Add preload directive to HSTS header and submit to preload list',
                            evidence: [{
                                type: 'HSTS Header',
                                description: `Current header: ${hstsHeader}`,
                                location: 'HTTP Response Headers'
                            }]
                        });
                    }
                }
            })
            .catch(() => {});
    }
    
    function checkCookieSecurity() {
        const evidence = [];
        const cookies = document.cookie.split(';');
        
        if (cookies.length > 0 && cookies[0] !== '') {
            cookies.forEach((cookie, index) => {
                const cookieName = cookie.trim().split('=')[0];
                
        
                if (location.protocol === 'https:' && !cookie.includes('Secure')) {
                    evidence.push({
                        type: 'Insecure Cookie',
                        description: `Cookie "${cookieName}" missing Secure flag`,
                        location: `Cookie[${index}]`
                    });
                }
                
        
                if (!cookie.includes('HttpOnly')) {
                    evidence.push({
                        type: 'Accessible Cookie',
                        description: `Cookie "${cookieName}" missing HttpOnly flag`,
                        location: `Cookie[${index}]`
                    });
                }
                
        
                if (!cookie.includes('SameSite')) {
                    evidence.push({
                        type: 'CSRF Vulnerable Cookie',
                        description: `Cookie "${cookieName}" missing SameSite attribute`,
                        location: `Cookie[${index}]`
                    });
                }
            });
            
            if (evidence.length > 0) {
                addIssue('cookie-security', `${evidence.length} cookie security issues`, 'medium', {
                    title: 'Cookie Security Issues',
                    description: 'Cookies missing important security attributes.',
                    impact: 'Medium - Cookies vulnerable to theft or CSRF attacks',
                    solution: 'Add Secure, HttpOnly, and SameSite attributes to all cookies',
                    evidence: evidence
                });
            }
        }
    }
    
    function checkCORSConfiguration() {
        const evidence = [];
        
        fetch(location.origin, { method: 'OPTIONS' })
            .then(response => {
                const corsHeaders = [
                    'access-control-allow-origin',
                    'access-control-allow-credentials',
                    'access-control-allow-methods',
                    'access-control-allow-headers'
                ];
                
                corsHeaders.forEach(header => {
                    const value = response.headers.get(header);
                    if (value) {
                        evidence.push({
                            type: 'CORS Header',
                            description: `${header}: ${value}`,
                            location: 'HTTP Response Headers'
                        });
                        
                
                        if (header === 'access-control-allow-origin' && value === '*') {
                            addIssue('permissive-cors', 'Overly permissive CORS policy', 'high', {
                                title: 'Permissive CORS Configuration',
                                description: 'CORS allows all origins (*) which can be dangerous.',
                                impact: 'High - Allows any website to make requests',
                                solution: 'Restrict CORS to specific trusted domains',
                                evidence: evidence
                            });
                        }
                    }
                });
            })
            .catch(() => {});
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
    
    function checkClientSideVulnerabilities() {
        const evidence = [];
        

        try {
            if (localStorage.length > 0) {
                evidence.push({
                    type: 'Local Storage',
                    description: `${localStorage.length} items in localStorage`,
                    location: 'Browser Storage'
                });
            }
            
            if (sessionStorage.length > 0) {
                evidence.push({
                    type: 'Session Storage',
                    description: `${sessionStorage.length} items in sessionStorage`,
                    location: 'Browser Storage'
                });
            }
            
    
            const sensitivePatterns = [/password/i, /token/i, /secret/i, /key/i, /auth/i];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                sensitivePatterns.forEach(pattern => {
                    if (pattern.test(key) || pattern.test(value)) {
                        evidence.push({
                            type: 'Sensitive Data in Storage',
                            description: `Potential sensitive data in localStorage: ${key}`,
                            location: 'localStorage'
                        });
                    }
                });
            }
            
        } catch (e) {
    
        }
        

        if (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection) {
            evidence.push({
                type: 'WebRTC Available',
                description: 'WebRTC may leak local IP addresses',
                location: 'Browser APIs'
            });
        }
        
        if (evidence.length > 0) {
            addIssue('client-side-risks', 'Client-side security risks detected', 'low', {
                title: 'Client-Side Security Risks',
                description: 'Various client-side security concerns identified.',
                impact: 'Low to Medium - Depends on data sensitivity',
                solution: 'Review storage usage and implement proper data protection',
                evidence: evidence
            });
        }
    }
    
    function checkBrowserFingerprinting() {
        const evidence = [];
        

        const fingerprintingAPIs = [
            'navigator.plugins',
            'navigator.mimeTypes',
            'screen.width',
            'screen.height',
            'navigator.language',
            'navigator.languages',
            'navigator.platform',
            'navigator.hardwareConcurrency'
        ];
        

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                evidence.push({
                    type: 'Canvas Fingerprinting',
                    description: 'Canvas API available for fingerprinting',
                    location: 'Browser APIs'
                });
            }
        } catch (e) {}
        

        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                evidence.push({
                    type: 'WebGL Fingerprinting',
                    description: 'WebGL available for fingerprinting',
                    location: 'Browser APIs'
                });
            }
        } catch (e) {}
        

        if (window.AudioContext || window.webkitAudioContext) {
            evidence.push({
                type: 'Audio Fingerprinting',
                description: 'Audio API available for fingerprinting',
                location: 'Browser APIs'
            });
        }
        
        if (evidence.length > 0) {
            addIssue('fingerprinting-risk', 'Browser fingerprinting possible', 'low', {
                title: 'Browser Fingerprinting Risk',
                description: 'Multiple APIs available for browser fingerprinting.',
                impact: 'Low - Privacy concerns, user tracking possible',
                solution: 'Consider implementing fingerprinting protection',
                evidence: evidence
            });
        }
    }
    
    function checkPasswordSecurity() {
        const evidence = [];
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach((field, index) => {
            const form = field.closest('form');
            
    
            if (field.getAttribute('autocomplete') === 'off') {
                evidence.push({
                    type: 'Password Manager Blocked',
                    description: 'Password field blocks password managers',
                    code: field.outerHTML,
                    location: `Password field[${index}]`
                });
            }
            
    
            if (form && (!form.action || form.action === location.href)) {
                evidence.push({
                    type: 'Weak Form Action',
                    description: 'Form submits to same page or no action specified',
                    location: `Form containing password field[${index}]`
                });
            }
            
    
            const parentForm = field.closest('form') || field.parentElement;
            const toggleButton = parentForm.querySelector('[type="button"]');
            if (!toggleButton) {
                evidence.push({
                    type: 'No Password Toggle',
                    description: 'No password visibility toggle found',
                    location: `Password field[${index}]`
                });
            }
        });
        
        if (evidence.length > 0) {
            addIssue('password-security', 'Password security issues detected', 'medium', {
                title: 'Password Security Issues',
                description: 'Password fields have security or usability issues.',
                impact: 'Medium - Affects password security and user experience',
                solution: 'Implement proper password field security practices',
                evidence: evidence
            });
        }
    }

    function checkFormSecurity() {
        const evidence = [];
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
    
            const csrfToken = form.querySelector('input[name*="csrf"], input[name*="token"], input[name="_token"]');
            if (!csrfToken) {
                evidence.push({
                    type: 'Missing CSRF Protection',
                    description: 'Form lacks CSRF token protection',
                    code: form.outerHTML.substring(0, 200) + '...',
                    location: `Form[${index}]`
                });
            }
            
    
            if (form.method.toLowerCase() === 'get') {
                const sensitiveInputs = form.querySelectorAll('input[type="password"], input[name*="pass"], input[name*="secret"]');
                if (sensitiveInputs.length > 0) {
                    evidence.push({
                        type: 'Sensitive Data via GET',
                        description: 'Sensitive form data sent via GET method',
                        location: `Form[${index}]`
                    });
                }
            }
            
    
            const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
            textInputs.forEach((input, inputIndex) => {
                if (!input.hasAttribute('maxlength') && !input.hasAttribute('pattern')) {
                    evidence.push({
                        type: 'No Input Validation',
                        description: 'Input field lacks client-side validation',
                        location: `Form[${index}] Input[${inputIndex}]`
                    });
                }
            });
        });
        
        if (evidence.length > 0) {
            addIssue('form-security', 'Form security issues detected', 'medium', {
                title: 'Form Security Issues',
                description: 'Forms missing important security measures.',
                impact: 'Medium - Forms vulnerable to various attacks',
                solution: 'Implement CSRF protection, proper methods, and validation',
                evidence: evidence
            });
        }
    }
    
    function checkWebSocketSecurity() {
        const evidence = [];
        

        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            if (script.textContent.includes('WebSocket') || script.textContent.includes('ws://') || script.textContent.includes('wss://')) {
        
                if (script.textContent.includes('ws://')) {
                    evidence.push({
                        type: 'Insecure WebSocket',
                        description: 'WebSocket connection over unencrypted protocol',
                        code: script.textContent.substring(0, 200) + '...',
                        location: `Script[${index}]`
                    });
                }
                
        
                if (script.textContent.includes('wss://')) {
                    evidence.push({
                        type: 'Secure WebSocket',
                        description: 'WebSocket connection over encrypted protocol',
                        location: `Script[${index}]`
                    });
                }
            }
        });
        
        if (evidence.some(e => e.type === 'Insecure WebSocket')) {
            addIssue('insecure-websocket', 'Insecure WebSocket connections detected', 'high', {
                title: 'Insecure WebSocket Protocol',
                description: 'WebSocket connections using unencrypted ws:// protocol.',
                impact: 'High - WebSocket traffic can be intercepted',
                solution: 'Use wss:// for encrypted WebSocket connections',
                evidence: evidence.filter(e => e.type === 'Insecure WebSocket')
            });
        }
    }
    
    async function checkDNSRebindingProtection() {
        const evidence = [];
        const hostname = location.hostname;
        

        const privateIPPatterns = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./,
            /^169\.254\./,
            /^::1$/,
            /^fc00:/,
            /^fe80:/
        ];
        
        const isPrivateIP = privateIPPatterns.some(pattern => pattern.test(hostname));
        
        if (isPrivateIP) {
            evidence.push({
                type: 'Private IP Access',
                description: `Site accessed via private IP: ${hostname}`,
                location: 'URL'
            });
            
            addIssue('dns-rebinding-risk', 'DNS rebinding attack risk', 'medium', {
                title: 'DNS Rebinding Attack Risk',
                description: 'Site accessible via private IP address.',
                impact: 'Medium - Potential for DNS rebinding attacks',
                solution: 'Implement Host header validation and use public domains',
                evidence: evidence
            });
        }
        

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            addIssue('localhost-access', 'Localhost development environment', 'low', {
                title: 'Development Environment Detected',
                description: 'Site running on localhost development environment.',
                impact: 'Low - Development environment security concerns',
                solution: 'Ensure proper security measures before production deployment',
                evidence: [{
                    type: 'Localhost Access',
                    description: `Accessed via: ${hostname}`,
                    location: 'URL'
                }]
            });
        }
    }
    
    function checkDeprecatedFeatures() {
        const evidence = [];
        

        const deprecatedElements = document.querySelectorAll('font, center, marquee, blink, applet, embed[type="application/x-shockwave-flash"]');
        deprecatedElements.forEach((element, index) => {
    
            let selector = '';
            if (element.id) {
                selector = `#${element.id}`;
            } else if (element.className) {
                selector = `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
            } else {
                selector = element.tagName.toLowerCase();
            }
            
            evidence.push({
                type: 'Deprecated HTML',
                description: `Deprecated ${element.tagName.toLowerCase()} element found`,
                code: element.outerHTML,
                location: `Element[${index}]`,
                selector: selector,
                element: element
            });
        });
        

        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            const content = script.textContent;
            
    
            const deprecatedMethods = [
                'document.write',
                'escape(',
                'unescape(',
                'with(',
                '__defineGetter__',
                '__defineSetter__'
            ];
            
            deprecatedMethods.forEach(method => {
                if (content.includes(method)) {
                    evidence.push({
                        type: 'Deprecated JavaScript',
                        description: `Deprecated method ${method} found`,
                        location: `Script[${index}]`
                    });
                }
            });
        });
        
        if (evidence.length > 0) {
            addIssue('deprecated-features', 'Deprecated features detected', 'low', {
                title: 'Deprecated Features in Use',
                description: 'Site uses deprecated HTML elements or JavaScript methods.',
                impact: 'Low - May cause compatibility issues or security risks',
                solution: 'Update to modern web standards and practices',
                evidence: evidence
            });
        }
    }

    function checkProtocolSecurity() {
        const evidence = [];
        
        if (location.protocol !== 'https:') {
            evidence.push({
                type: 'Protocol Check',
                description: `Site served over ${location.protocol}`,
                location: location.href
            });
            
            addIssue('insecure-protocol', 'Site not using HTTPS', 'critical', {
                title: 'Insecure HTTP Protocol',
                description: 'Site is served over HTTP instead of HTTPS, making all data transmission vulnerable to interception.',
                impact: 'Critical - All data can be intercepted and modified in transit',
                solution: 'Implement HTTPS with a valid SSL/TLS certificate',
                evidence: evidence,
                references: [
                    {
                        title: 'Why HTTPS Matters - Google',
                        url: 'https://developers.google.com/web/fundamentals/security/encrypt-in-transit/why-https'
                    }
                ]
            });
        }
        

        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const passwordFields = form.querySelectorAll('input[type="password"]');
            if (passwordFields.length > 0) {
                if (location.protocol !== 'https:') {
                    evidence.push({
                        type: 'Password Form',
                        description: 'Password form over insecure connection',
                        code: form.outerHTML.substring(0, 200) + '...',
                        location: `form[${index}]`
                    });
                    
                    addIssue('password-over-http', 'Password form over insecure connection', 'critical', {
                        title: 'Password Form Over HTTP',
                        description: 'Password forms served over HTTP expose credentials to interception.',
                        impact: 'Critical - User credentials can be stolen during transmission',
                        solution: 'Serve all authentication pages over HTTPS',
                        evidence: evidence
                    });
                }
            }
        });
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

    function checkBrowserExtensions() {
        try {
    
            const extensionIndicators = [];
            
            if (window.chrome && window.chrome.runtime) {
                extensionIndicators.push('Chrome Extension API detected');
            }
            
            if (window.browser && window.browser.runtime) {
                extensionIndicators.push('WebExtension API detected');
            }

    
            const originalProperties = ['fetch', 'XMLHttpRequest', 'addEventListener'];
            originalProperties.forEach(prop => {
                if (window[prop] && window[prop].toString().includes('native code') === false) {
                    extensionIndicators.push(`Modified ${prop} detected`);
                }
            });

    
            if (typeof window.uBlock !== 'undefined' || typeof window.adblockplusInjected !== 'undefined') {
                extensionIndicators.push('Ad-blocker extension detected');
            }

            if (extensionIndicators.length > 0) {
                addIssue('browser-extensions', 'Browser extensions detected', 'low', {
                    title: 'Browser Extensions Active',
                    description: 'Browser extensions may modify page behavior and security context.',
                    impact: 'Low - Extensions may intercept or modify requests',
                    solution: 'Be aware that extensions can modify page behavior and data',
                    evidence: extensionIndicators.map(indicator => ({
                        type: 'Extension Detection',
                        description: indicator
                    }))
                });
            }
        } catch (error) {
            console.log('Extension check failed:', error);
        }
    }

    function checkWebAPISecurity() {
        const evidence = [];
        

        const dangerousAPIs = [
            'geolocation', 'camera', 'microphone', 'notifications', 
            'persistent-storage', 'midi', 'background-sync'
        ];

        if (navigator.permissions) {
            dangerousAPIs.forEach(async (api) => {
                try {
                    const permission = await navigator.permissions.query({name: api});
                    if (permission.state === 'granted') {
                        evidence.push({
                            type: 'Granted Permission',
                            description: `${api} permission is granted`,
                            location: 'Browser Permissions'
                        });
                    }
                } catch (e) {
            
                }
            });
        }


        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                if (registrations.length > 0) {
                    evidence.push({
                        type: 'Service Worker',
                        description: `${registrations.length} service worker(s) registered`,
                        location: 'Browser Service Workers'
                    });
                    
                    addIssue('service-workers', 'Service workers detected', 'low', {
                        title: 'Active Service Workers',
                        description: 'Service workers can intercept network requests and cache data.',
                        impact: 'Low - May intercept and modify network traffic',
                        solution: 'Review service worker code for security implications',
                        evidence: evidence
                    });
                }
            });
        }
    }

    function checkModernSecurityFeatures() {
        const evidence = [];
        

        const scriptsWithSRI = document.querySelectorAll('script[integrity]');
        const linksWithSRI = document.querySelectorAll('link[integrity]');
        const externalScripts = document.querySelectorAll('script[src]:not([integrity])');
        const externalLinks = document.querySelectorAll('link[rel="stylesheet"][href]:not([integrity])');

        if (externalScripts.length > 0 && scriptsWithSRI.length === 0) {
            evidence.push({
                type: 'Missing SRI',
                description: `${externalScripts.length} external scripts without integrity checks`,
                location: 'External Scripts'
            });
        }


        const securityMetas = document.querySelectorAll('meta[http-equiv]');
        securityMetas.forEach(meta => {
            const equiv = meta.getAttribute('http-equiv').toLowerCase();
            if (['content-security-policy', 'x-frame-options', 'x-content-type-options'].includes(equiv)) {
                evidence.push({
                    type: 'Security Meta Tag',
                    description: `${equiv} defined in meta tag`,
                    code: meta.outerHTML,
                    location: 'HTML Head'
                });
            }
        });

        if (evidence.length > 0) {
            addIssue('modern-security', 'Modern security features analysis', 'info', {
                title: 'Modern Security Features',
                description: 'Analysis of modern web security features implementation.',
                impact: 'Info - Security feature audit results',
                solution: 'Review and implement missing security features',
                evidence: evidence
            });
        }
    }

    function checkThirdPartyResources() {
        const evidence = [];
        const currentDomain = location.hostname;
        

        const externalScripts = document.querySelectorAll('script[src]');
        const externalDomains = new Set();
        
        externalScripts.forEach((script, index) => {
            try {
                const url = new URL(script.src);
                if (url.hostname !== currentDomain) {
                    externalDomains.add(url.hostname);
                    evidence.push({
                        type: 'External Script',
                        description: `Script loaded from ${url.hostname}`,
                        code: script.outerHTML,
                        location: `script[${index}]`
                    });
                }
            } catch (e) {
        
            }
        });


        const externalStyles = document.querySelectorAll('link[rel="stylesheet"][href]');
        externalStyles.forEach((link, index) => {
            try {
                const url = new URL(link.href);
                if (url.hostname !== currentDomain) {
                    externalDomains.add(url.hostname);
                    evidence.push({
                        type: 'External Stylesheet',
                        description: `Stylesheet loaded from ${url.hostname}`,
                        code: link.outerHTML,
                        location: `link[${index}]`
                    });
                }
            } catch (e) {
        
            }
        });

        if (externalDomains.size > 0) {
            addIssue('third-party-resources', `Resources loaded from ${externalDomains.size} external domains`, 'low', {
                title: 'Third-Party Resources',
                description: 'External resources can introduce security and privacy risks.',
                impact: 'Low to Medium - Depends on trust level of external domains',
                solution: 'Review all external resources and implement SRI where possible',
                evidence: evidence,
                references: [
                    {
                        title: 'Subresource Integrity - MDN',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity'
                    }
                ]
            });
        }
    }

    function checkAdvancedSecurity() {
        const evidence = [];
        

        const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (metaCsp) {
            evidence.push({
                type: 'Meta CSP Found',
                description: 'CSP defined in meta tag',
                code: metaCsp.outerHTML,
                location: 'HTML Head'
            });
        }


        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe, index) => {
            if (!iframe.hasAttribute('sandbox')) {
                evidence.push({
                    type: 'Unsandboxed iframe',
                    description: `iframe ${index + 1} lacks sandbox attribute`,
                    code: iframe.outerHTML,
                    location: `iframe[${index}]`
                });
            }
        });

        if (evidence.length > 0) {
            addIssue('iframe-security', 'iframe security issues detected', 'medium', {
                title: 'iframe Security Configuration',
                description: 'iframes without proper security attributes can pose risks.',
                impact: 'Medium - Potential for malicious content injection',
                solution: 'Add sandbox attributes to restrict iframe capabilities',
                evidence: evidence
            });
        }
    }


    let scannerSettings = {
        hideBubble: false,
        showHighlights: true
    };


    window.addEventListener('updateScannerSettings', (event) => {
        if (event.detail) {
            const oldSettings = { ...scannerSettings };
            scannerSettings = { ...scannerSettings, ...event.detail };
            
            console.log('Scanner settings updated:', scannerSettings);
            console.log('Previous settings:', oldSettings);
            
            applySettings();
        }
    });


    function applySettings() {
        console.log('Applying scanner settings:', scannerSettings);
        console.log('Bubble element exists:', !!bubble);
        console.log('Bubble style exists:', !!(bubble && bubble.style));
        

        if (scannerSettings.hideBubble) {
            if (bubble && bubble.style) {
                bubble.style.display = 'none';
                console.log('Scanner bubble hidden successfully');
            } else {
                console.log('Cannot hide bubble - element not ready yet');
            }
        } else {
            if (bubble && bubble.style) {
                bubble.style.display = 'flex';
                console.log('Scanner bubble shown successfully');
            } else {
                console.log('Cannot show bubble - element not ready yet');
            }
        }
    }


    function logMessage(message, level = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [Security Scanner] [${level.toUpperCase()}] ${message}`);
    }


    function initializeScanner() {
        try {
            // Prevent multiple scanner instances
            if (window.securityScannerInitialized) {
                logMessage('Scanner already initialized, skipping duplicate initialization', 'info');
                return;
            }
            
            logMessage('Initializing Security Scanner Pro...', 'info');
            window.securityScannerInitialized = true;
            
            // Check whitelist status first
            checkWhitelistStatus().then(isWhitelisted => {
                if (isWhitelisted && !window.manualScanTriggered) {
                    logMessage('Site is whitelisted, skipping auto-scan', 'info');
                    return;
                }
                
                // Continue with initialization
                continueInitialization();
            }).catch(error => {
                logMessage('Error checking whitelist status: ' + error.message, 'warning');
                // Continue with initialization even if whitelist check fails
                continueInitialization();
            });

        } catch (error) {
            logMessage(`Scanner initialization failed: ${error.message}`, 'error');
            handleScanError(error);
        }
    }

    // Check if current site is whitelisted
    async function checkWhitelistStatus() {
        try {
            const hostname = window.location.hostname;
            
    
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

    // Continue with scanner initialization (extracted from original initializeScanner)
    function continueInitialization() {
        try {
            
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.get(['hideBubble', 'showHighlights'], (result) => {
                    if (result) {
                        scannerSettings = { ...scannerSettings, ...result };
                        console.log('Loaded initial settings from storage:', scannerSettings);
                        
            
                        if (bubble && bubble.style) {
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
            
            // Ensure scan is marked as complete to prevent hanging
            scanComplete = true;
            
            // Update bubble to show error state
            if (bubble) {
                bubble.innerHTML = '✗<br><span style="font-size: 10px; margin-top: 4px;">ERROR</span>';
                bubble.style.backgroundColor = '#c53030';
            }
            
            // Create detailed error results
            const errorResults = {
                url: window.location.href,
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
                    url: window.location.href
                }
            };
            
            // Dispatch error event with retry information
            try {
                window.dispatchEvent(new CustomEvent('securityScanComplete', {
                    detail: errorResults
                }));
                logMessage('Error event dispatched successfully', 'info');
            } catch (dispatchError) {
                console.error('Failed to dispatch error event:', dispatchError);
                
                // Fallback: try to communicate error via console for debugging
                console.error('Scanner Error Details:', {
                    originalError: error,
                    errorResults: errorResults,
                    dispatchError: dispatchError
                });
            }
            
            // Additional cleanup
            try {
                // Stop any ongoing monitoring
                if (typeof monitoringInterval !== 'undefined' && monitoringInterval) {
                    clearInterval(monitoringInterval);
                    monitoringInterval = null;
                }
                
                // Reset scan state
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


    window.addEventListener('manualScanTrigger', () => {
        logMessage('Manual scan triggered, bypassing whitelist', 'info');
        window.manualScanTriggered = true;
        try {
            initializeScanner();
        } catch (error) {
            console.error('Manual scan initialization failed:', error);
            handleScanError(error);
        }
    });


    window.addEventListener('stopScanner', () => {
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


    window.securityScanner = {
        clearWhitelist: clearWhitelist,
        checkWhitelistStatus: checkWhitelistStatus,
        triggerManualScan: () => {
            window.manualScanTriggered = true;
            initializeScanner();
        }
    };


    function checkAPIKeys() {
        const evidence = [];
        

        const excludePatterns = [
            /integrity\s*=/, // SRI hashes
            /sha\d+-/, // SHA hashes
            /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)/, // File extensions
            /webpack/, // Webpack hashes
            /chunk/, // Code chunks
            /manifest/, // Manifest files
            /vendor/, // Vendor files
            /assets?\//, // Asset paths
            /build\//, // Build paths
            /dist\//, // Distribution paths
            /node_modules/, // Node modules
            /\.min\./, // Minified files
            /sourceMappingURL/, // Source maps
            /\/\*.*?\*\//, // CSS comments
            /<!--.*?-->/, // HTML comments
            /\/\/.*/, // JS comments
            /data:image/, // Data URLs for images
            /base64/, // Base64 data
            /charset/, // Character set declarations
            /encoding/, // Encoding declarations
            /version/, // Version strings
            /hash/, // Generic hash references
            /checksum/, // Checksum references
            /fingerprint/, // Fingerprint references
            /etag/, // ETags
            /cache/, // Cache identifiers
        ];


        const apiKeyPatterns = [
    
            { 
                pattern: /\bAKIA[0-9A-Z]{16}\b/, 
                type: 'AWS Access Key', 
                severity: 'critical',
                validate: (match, context) => {
            
                    return match.length === 20 && /^AKIA[0-9A-Z]{16}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/, 
                type: 'Google API Key', 
                severity: 'high',
                validate: (match, context) => {
                    return match.length === 39 && /^AIza[0-9A-Za-z\-_]{35}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bgh[pousr]_[a-zA-Z0-9]{36}\b/, 
                type: 'GitHub Token', 
                severity: 'critical',
                validate: (match, context) => {
                    return /^gh[pousr]_[a-zA-Z0-9]{36}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bxox[baprs]-[0-9a-zA-Z]{10,50}\b/, 
                type: 'Slack Token', 
                severity: 'high',
                validate: (match, context) => {
                    return /^xox[baprs]-[0-9a-zA-Z]{10,50}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bsk_(?:live|test)_[0-9a-zA-Z]{24}\b/, 
                type: 'Stripe Secret Key', 
                severity: 'critical',
                validate: (match, context) => {
                    return /^sk_(?:live|test)_[0-9a-zA-Z]{24}$/.test(match);
                }
            },
            { 
                pattern: /\bpk_(?:live|test)_[0-9a-zA-Z]{24}\b/, 
                type: 'Stripe Publishable Key', 
                severity: 'medium',
                validate: (match, context) => {
                    return /^pk_(?:live|test)_[0-9a-zA-Z]{24}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bSG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}\b/, 
                type: 'SendGrid API Key', 
                severity: 'high',
                validate: (match, context) => {
                    return /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bSK[a-z0-9]{32}\b/, 
                type: 'Twilio API Key', 
                severity: 'high',
                validate: (match, context) => {
                    return /^SK[a-z0-9]{32}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bsq0atp-[0-9A-Za-z\-_]{22}\b/, 
                type: 'Square Access Token', 
                severity: 'high',
                validate: (match, context) => {
                    return /^sq0atp-[0-9A-Za-z\-_]{22}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\baccess_token\$production\$[a-z0-9]{16}\$[a-f0-9]{32}\b/, 
                type: 'PayPal Access Token', 
                severity: 'critical',
                validate: (match, context) => {
                    return /^access_token\$production\$[a-z0-9]{16}\$[a-f0-9]{32}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\bkey-[a-z0-9]{32}\b/, 
                type: 'Mailgun API Key', 
                severity: 'medium',
                validate: (match, context) => {
                    return /^key-[a-z0-9]{32}$/.test(match);
                }
            },
            
    
            { 
                pattern: /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/, 
                type: 'JWT Token', 
                severity: 'medium',
                validate: (match, context) => {
                    const parts = match.split('.');
                    return parts.length === 3 && parts.every(part => part.length > 10);
                }
            },
            
    
            { 
                pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/, 
                type: 'Private Key', 
                severity: 'critical',
                validate: (match, context) => {
                    return context.includes('-----END') && context.length > 100;
                }
            },
            { 
                pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/, 
                type: 'SSH Private Key', 
                severity: 'critical',
                validate: (match, context) => {
                    return context.includes('-----END') && context.length > 100;
                }
            },
            
    
            { 
                pattern: /(?:api[_-]?key|apikey)['":\s]*['"]([a-zA-Z0-9]{20,})['"]/i, 
                type: 'Generic API Key', 
                severity: 'medium',
                validate: (match, context) => {
            
                    const keyMatch = context.match(/(?:api[_-]?key|apikey)['":\s]*['"]([a-zA-Z0-9]{20,})['"]/i);
                    if (!keyMatch) return false;
                    const keyValue = keyMatch[1];
                    
            
                    const placeholders = [
                        /^(your|my|test|demo|sample|example|placeholder|fake|dummy)[\w_-]*$/i,
                        /^[a-z]+$/i, // All lowercase letters only
                        /^[A-Z]+$/i, // All uppercase letters only
                        /^1+$/,  
                        /^0+$/,  
                        /^x+$/i, 
                        /^key$/i,
                        /^token$/i,  // Just "token"
                        /^secret$/i, // Just "secret"
                        /^[a-f0-9]{32}$/i, // Looks like MD5 hash
                        /^[a-f0-9]{40}$/i, // Looks like SHA1 hash
                        /^[a-f0-9]{64}$/i, // Looks like SHA256 hash
                    ];
                    
                    return !placeholders.some(pattern => pattern.test(keyValue)) && keyValue.length >= 20;
                }
            },
            
    
            { 
                pattern: /(?:mongodb|postgres|mysql):\/\/[^\s'"<>{}|\\\^`\[\]]+/i, 
                type: 'Database Connection String', 
                severity: 'high',
                validate: (match, context) => {
            
                    return /@/.test(match) && 
                           !/(localhost|127\.0\.0\.1|example\.com|test\.com)/.test(match) &&
                           !/(?:user|password|your|my|test|demo|sample|example|placeholder)/.test(match);
                }
            }
        ];


        function shouldExclude(match, context) {
            return excludePatterns.some(pattern => pattern.test(context));
        }


        function getContext(content, match, matchIndex) {
            const start = Math.max(0, matchIndex - 100);
            const end = Math.min(content.length, matchIndex + match.length + 100);
            return content.substring(start, end);
        }


        const htmlContent = document.documentElement.outerHTML;
        apiKeyPatterns.forEach(({pattern, type, severity, validate}) => {
            let match;
            const globalPattern = new RegExp(pattern.source, 'gi');
            
            while ((match = globalPattern.exec(htmlContent)) !== null) {
                const matchText = match[0];
                const context = getContext(htmlContent, matchText, match.index);
                
        
                if (shouldExclude(matchText, context)) {
                    continue;
                }
                
        
                if (validate && !validate(matchText, context)) {
                    continue;
                }
                
                evidence.push({
                    type: type,
                    description: `Found ${type}: ${matchText.substring(0, 20)}...`,
                    location: 'HTML Content',
                    severity: severity,
                    fullMatch: matchText,
                    context: context.substring(0, 200)
                });
            }
        });


        try {
            const storageKeys = Object.keys(localStorage);
            storageKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (!value || value.length < 10) return; // Skip short values
                
                apiKeyPatterns.forEach(({pattern, type, severity, validate}) => {
            
                    [key, value].forEach((text, index) => {
                        const match = text.match(pattern);
                        if (match) {
                            const matchText = match[0];
                            const context = `${key}=${value}`;
                            
                            if (shouldExclude(matchText, context)) return;
                            if (validate && !validate(matchText, context)) return;
                            
                            evidence.push({
                                type: type,
                                description: `Found ${type} in localStorage: ${key}`,
                                location: 'localStorage',
                                severity: severity,
                                fullMatch: matchText
                            });
                        }
                    });
                });
            });
        } catch (e) {
    
        }


        try {
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
                const value = sessionStorage.getItem(key);
                if (!value || value.length < 10) return; // Skip short values
                
                apiKeyPatterns.forEach(({pattern, type, severity, validate}) => {
                    [key, value].forEach((text, index) => {
                        const match = text.match(pattern);
                        if (match) {
                            const matchText = match[0];
                            const context = `${key}=${value}`;
                            
                            if (shouldExclude(matchText, context)) return;
                            if (validate && !validate(matchText, context)) return;
                            
                            evidence.push({
                                type: type,
                                description: `Found ${type} in sessionStorage: ${key}`,
                                location: 'sessionStorage',
                                severity: severity,
                                fullMatch: matchText
                            });
                        }
                    });
                });
            });
        } catch (e) {
    
        }


        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            if (!script.textContent || script.textContent.length < 50) return; // Skip very short scripts
            
            const scriptContent = script.textContent;
            
            apiKeyPatterns.forEach(({pattern, type, severity, validate}) => {
                let match;
                const globalPattern = new RegExp(pattern.source, 'gi');
                
                while ((match = globalPattern.exec(scriptContent)) !== null) {
                    const matchText = match[0];
                    const context = getContext(scriptContent, matchText, match.index);
                    
            
                    if (/webpack|chunk|vendor|\.min\.|sourceMappingURL/.test(context)) {
                        continue;
                    }
                    
                    if (shouldExclude(matchText, context)) continue;
                    if (validate && !validate(matchText, context)) continue;
                    
                    evidence.push({
                        type: type,
                        description: `Found ${type} in script tag`,
                        location: `Script[${index}]`,
                        severity: severity,
                        element: script,
                        fullMatch: matchText,
                        context: context.substring(0, 200)
                    });
                }
            });
        });


        const uniqueEvidence = [];
        const seenKeys = new Set();
        
        evidence.forEach(item => {
            const keyIdentifier = `${item.type}:${item.fullMatch}`;
            if (!seenKeys.has(keyIdentifier)) {
                seenKeys.add(keyIdentifier);
                uniqueEvidence.push(item);
            }
        });

        if (uniqueEvidence.length > 0) {
            const highestSeverity = uniqueEvidence.reduce((max, item) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[item.severity] > severityOrder[max] ? item.severity : max;
            }, 'low');

            addIssue('api-keys-exposed', `${uniqueEvidence.length} potential API key(s) or sensitive data exposed`, highestSeverity, {
                title: 'Exposed API Keys and Sensitive Data',
                description: 'Potential API keys, tokens, or other sensitive data found in the page source.',
                impact: 'Critical - Exposed credentials can lead to unauthorized access to external services',
                solution: 'Remove all hardcoded credentials from client-side code and use environment variables or secure server-side storage',
                evidence: uniqueEvidence
            });
        }

        return uniqueEvidence;
    }

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
            
                    const urlParams = new URLSearchParams(window.location.search);
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
        

        const url = window.location.href;
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
                
        
                const urlParams = new URLSearchParams(window.location.search);
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
                        fullUrl: window.location.href,
                        matchedPattern: match[0],
                        urlContext: context,
                        suspiciousParameters: suspiciousParams,
                        patternDescription: description,
                        confidenceLevel: confidence
                    },
                    codeSnippets: {
                        urlWithHighlighting: formatUrlInjectionContext(url, pattern, match),
                        fullUrl: window.location.href,
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
        

        const urlParams = new URLSearchParams(window.location.search);
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
                
                // More robust crypto detection - look for actual cryptographic usage patterns
                const weakCryptoPatterns = [
                    // MD5 usage in crypto contexts
                    { 
                        pattern: /(?:crypto|hash|digest|encrypt|decrypt|md5|MD5)\s*[(\.].*?MD5|MD5.*?(?:hash|digest|encrypt|decrypt|create)/gi, 
                        issue: 'MD5 is cryptographically broken',
                        validate: (match) => {
                            // Exclude common false positives
                            const lowerMatch = match.toLowerCase();
                            return !lowerMatch.includes('description') && 
                                   !lowerMatch.includes('desciption') &&
                                   !lowerMatch.includes('design') &&
                                   !lowerMatch.includes('desire') &&
                                   !lowerMatch.includes('desktop');
                        }
                    },
                    // SHA1 usage in crypto contexts
                    { 
                        pattern: /(?:crypto|hash|digest|encrypt|decrypt|sha1|SHA1)\s*[(\.].*?SHA1|SHA1.*?(?:hash|digest|encrypt|decrypt|create)/gi, 
                        issue: 'SHA1 is deprecated and weak',
                        validate: (match) => true
                    },
                    // DES usage in crypto contexts - much more specific
                    { 
                        pattern: /(?:crypto|cipher|encrypt|decrypt|algorithm|DES)\s*[(\.].*?\bDES\b|\bDES\b.*?(?:cipher|encrypt|decrypt|algorithm|create)/gi, 
                        issue: 'DES encryption is too weak',
                        validate: (match) => {
                            const lowerMatch = match.toLowerCase();
                            // Exclude very common false positives
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
                    // RC4 usage in crypto contexts
                    { 
                        pattern: /(?:crypto|cipher|encrypt|decrypt|rc4|RC4)\s*[(\.].*?RC4|RC4.*?(?:cipher|encrypt|decrypt|create)/gi, 
                        issue: 'RC4 cipher is broken',
                        validate: (match) => true
                    },
                    // Math.random in security contexts
                    { 
                        pattern: /Math\.random\s*\(\s*\).*?(?:key|secret|token|salt|iv|nonce|password|crypto)|(?:key|secret|token|salt|iv|nonce|password|crypto).*?Math\.random\s*\(\s*\)/gi, 
                        issue: 'Math.random() is not cryptographically secure for security purposes',
                        validate: (match) => true
                    }
                ];

                weakCryptoPatterns.forEach(({pattern, issue, validate}) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        // Additional validation for each match
                        const validMatches = matches.filter(match => validate(match));
                        if (validMatches.length > 0) {
                            evidence.push({
                                type: 'Weak Cryptography',
                                description: issue,
                                location: `Script[${index}]`,
                                occurrences: validMatches.length,
                                examples: validMatches.slice(0, 3) // Show first 3 examples
                            });
                        }
                    }
                });

                // Hardcoded encryption keys - more specific patterns
                const keyPatterns = [
                    // Look for actual key assignment patterns
                    /(?:(?:encryption|crypto|aes|des)[\w]*\s*[=:]\s*['"][a-zA-Z0-9+/]{16,}['"])|(?:key\s*[=:]\s*['"][a-zA-Z0-9+/]{24,}['"])/gi,
                    // AES initialization with hardcoded keys
                    /AES\s*\(\s*['"][a-zA-Z0-9+/]{16,}['"]\s*\)/gi,
                    // Crypto API usage with hardcoded values
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
                            examples: matches.slice(0, 2) // Show first 2 examples
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

    function checkPrivacyLeaks() {
        const evidence = [];
        

        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (img.width === 1 && img.height === 1) {
                evidence.push({
                    type: 'Tracking Pixel',
                    description: `1x1 tracking pixel detected: ${img.src}`,
                    location: `Image[${index}]`,
                    element: img
                });
            }
        });


        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach((script, index) => {
            const src = script.src.toLowerCase();
            const fingerprintingDomains = [
                'google-analytics.com',
                'googletagmanager.com',
                'facebook.com',
                'doubleclick.net',
                'hotjar.com',
                'fullstory.com',
                'mixpanel.com'
            ];

            fingerprintingDomains.forEach(domain => {
                if (src.includes(domain)) {
                    evidence.push({
                        type: 'Fingerprinting Script',
                        description: `Potential fingerprinting script from ${domain}`,
                        location: `Script[${index}]`,
                        element: script
                    });
                }
            });
        });


        if (navigator.geolocation) {
            const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
            navigator.geolocation.getCurrentPosition = function(...args) {
                evidence.push({
                    type: 'Geolocation Access',
                    description: 'Page attempts to access user location',
                    location: 'JavaScript API'
                });
                return originalGetCurrentPosition.apply(this, args);
            };
        }


        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function(constraints) {
                if (constraints.audio) {
                    evidence.push({
                        type: 'Microphone Access',
                        description: 'Page requests microphone access',
                        location: 'JavaScript API'
                    });
                }
                if (constraints.video) {
                    evidence.push({
                        type: 'Camera Access',
                        description: 'Page requests camera access',
                        location: 'JavaScript API'
                    });
                }
                return originalGetUserMedia.call(this, constraints);
            };
        }

        if (evidence.length > 0) {
            addIssue('privacy-leaks', 'Privacy and tracking concerns', 'medium', {
                title: 'Privacy and Tracking Issues',
                description: 'Potential privacy violations and tracking detected.',
                impact: 'Medium - User privacy may be compromised',
                solution: 'Review tracking implementations and ensure proper consent',
                evidence: evidence
            });
        }
    }

    function checkResourceIntegrity() {
        const evidence = [];
        

        const externalScripts = document.querySelectorAll('script[src]');
        externalScripts.forEach((script, index) => {
            const src = script.src;
            if (src && !src.startsWith(window.location.origin) && !script.hasAttribute('integrity')) {
                evidence.push({
                    type: 'Missing Subresource Integrity',
                    description: `External script without integrity check: ${src}`,
                    location: `Script[${index}]`,
                    element: script
                });
            }
        });


        const externalStyles = document.querySelectorAll('link[rel="stylesheet"][href]');
        externalStyles.forEach((link, index) => {
            const href = link.href;
            if (href && !href.startsWith(window.location.origin) && !link.hasAttribute('integrity')) {
                evidence.push({
                    type: 'Missing Subresource Integrity',
                    description: `External stylesheet without integrity check: ${href}`,
                    location: `Link[${index}]`,
                    element: link
                });
            }
        });

        if (evidence.length > 0) {
            addIssue('resource-integrity', 'Resource integrity issues', 'medium', {
                title: 'Subresource Integrity Missing',
                description: 'External resources loaded without integrity verification.',
                impact: 'Medium - Risk of loading tampered external resources',
                solution: 'Add integrity attributes to all external scripts and stylesheets',
                evidence: evidence
            });
        }
    }


    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'CHECK_API_KEYS') {
                const apiKeys = checkAPIKeys();
                sendResponse({ apiKeys: apiKeys });
                return true;
            }
            
            if (message.type === 'CHECK_DYNAMIC_THREATS') {
        
                checkAdvancedContentSecurityPolicy();
                checkInjectionVulnerabilities();
                checkCryptographicImplementation();
                checkPrivacyLeaks();
                checkResourceIntegrity();
                sendResponse({ status: 'checked' });
                return true;
            }
        });
    }


    let monitoringInterval = null;
    let lastAPIKeyCheck = 0;
    
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
    
            const currentTime = Date.now();
            if (currentTime - lastAPIKeyCheck > 30000) { // Check API keys every 30 seconds
                logMessage('Running continuous API key check...', 'info');
                checkAPIKeys();
                lastAPIKeyCheck = currentTime;
            }

    
            checkDynamicContentChanges();
            
    
            checkNewExternalResources();
            
    
            checkSuspiciousDOMChanges();
            
        } catch (error) {
            logMessage(`Continuous monitoring error: ${error.message}`, 'error');
        }
    }

    function checkDynamicContentChanges() {

        const scripts = document.querySelectorAll('script');
        const currentScriptCount = scripts.length;
        
        if (window._lastScriptCount && currentScriptCount > window._lastScriptCount) {
            logMessage(`New script detected - total scripts increased from ${window._lastScriptCount} to ${currentScriptCount}`, 'warn');
            
    
            for (let i = window._lastScriptCount; i < currentScriptCount; i++) {
                if (scripts[i] && scripts[i].textContent) {
                    checkScriptForAPIKeys(scripts[i], i);
                }
            }
        }
        window._lastScriptCount = currentScriptCount;
    }

    function checkScriptForAPIKeys(script, index) {
        const apiKeyPatterns = [
            { pattern: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key' },
            { pattern: /AIza[0-9A-Za-z\\-_]{35}/, type: 'Google API Key' },
            { pattern: /ghp_[a-zA-Z0-9]{36}/, type: 'GitHub Token' },
            { pattern: /sk_live_[0-9a-zA-Z]{24}/, type: 'Stripe Live Key' },
            { pattern: /(?:api[_-]?key|token)['\"\s]*[:=]['\"\s]*[a-zA-Z0-9\-_]{16,}/, type: 'Generic API Key' }
        ];

        apiKeyPatterns.forEach(({pattern, type}) => {
            if (pattern.test(script.textContent)) {
                logMessage(`API key detected in dynamically added script: ${type}`, 'error');
                addIssue(`dynamic-api-key-${index}`, `${type} detected in dynamic script`, 'critical', {
                    title: 'Dynamic API Key Exposure',
                    description: `${type} found in dynamically added script content.`,
                    impact: 'Critical - API key exposed in dynamic content',
                    solution: 'Remove hardcoded credentials from dynamic scripts',
                    evidence: [{
                        type: 'Dynamic Script',
                        description: `Found ${type} in script tag`,
                        location: `Dynamic Script[${index}]`
                    }]
                });
            }
        });
    }

    function checkNewExternalResources() {

        const externalScripts = document.querySelectorAll('script[src]:not([integrity])');
        const externalStyles = document.querySelectorAll('link[rel="stylesheet"][href]:not([integrity])');
        
        const currentExternalCount = externalScripts.length + externalStyles.length;
        
        if (window._lastExternalCount && currentExternalCount > window._lastExternalCount) {
            logMessage(`New external resource detected without integrity check`, 'warn');
            
            addIssue('dynamic-external-resource', 'New external resource without integrity', 'medium', {
                title: 'Dynamic External Resource',
                description: 'New external resource loaded without subresource integrity.',
                impact: 'Medium - Risk of loading tampered external content',
                solution: 'Add integrity attributes to external resources',
                evidence: [{
                    type: 'External Resource',
                    description: 'External resource added dynamically',
                    location: 'DOM'
                }]
            });
        }
        window._lastExternalCount = currentExternalCount;
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

    async function testIncompleteChain() {

        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const indicators = {
                missingHSTS: !response.headers.get('strict-transport-security'),
                missingExpectCT: !response.headers.get('expect-ct'),
                mobileUserAgent: navigator.userAgent.includes('Mobile')
            };
            
    
            if (indicators.missingHSTS && indicators.missingExpectCT && indicators.mobileUserAgent) {
                return {
                    hasIssue: true,
                    description: 'Potential incomplete certificate chain (mobile devices may have connection issues)',
                    impact: 'Mobile users may experience connection problems',
                    solution: 'Ensure complete certificate chain is configured including intermediate certificates'
                };
            }
            
            return {
                hasIssue: false,
                description: 'Certificate chain appears complete',
                impact: 'No impact',
                solution: 'Continue monitoring'
            };
            
        } catch (error) {
            if (error.message.toLowerCase().includes('chain') ||
                error.message.toLowerCase().includes('intermediate')) {
                return {
                    hasIssue: true,
                    description: 'Certificate chain validation failed',
                    impact: 'Some clients may not trust the certificate',
                    solution: 'Install complete certificate chain including intermediates'
                };
            }
            throw error;
        }
    }

    async function testMixedCA() {

        try {
            const response = await fetch(location.origin, { method: 'HEAD' });
            
    
            const serverHeader = response.headers.get('server');
            const hstsHeader = response.headers.get('strict-transport-security');
            
    
            if (serverHeader && hstsHeader) {
        
                return {
                    hasIssue: false,
                    description: 'Certificate authority practices appear consistent',
                    impact: 'No impact',
                    solution: 'Continue monitoring'
                };
            }
            
            return {
                hasIssue: false,
                description: 'No mixed CA indicators detected',
                impact: 'No impact',
                solution: 'Continue monitoring'
            };
            
        } catch (error) {
            throw error;
        }
    }


    function stopScanner() {
        try {
            logMessage('Stopping scanner...', 'info');
            
        
            scanComplete = true;
            
        
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            if (bubble && bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            
        
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