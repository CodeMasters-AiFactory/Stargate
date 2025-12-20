/**
 * Live Research Display System
 * Shows real-time research activities as they happen
 */

class LiveResearchDisplay {
    constructor() {
        this.feed = document.getElementById('researchFeed');
        this.currentPage = 'home';
        this.researchLog = [];
    }

    /**
     * Add a search activity to the feed
     */
    logSearch(query, description) {
        const activity = {
            type: 'search',
            icon: '🔍',
            timestamp: new Date(),
            query: query,
            description: description
        };
        
        this.addActivity(activity);
        this.researchLog.push(activity);
    }

    /**
     * Add an analysis activity to the feed
     */
    logAnalysis(description, findings = []) {
        const activity = {
            type: 'analysis',
            icon: '📊',
            timestamp: new Date(),
            description: description,
            findings: findings
        };
        
        this.addActivity(activity);
        this.researchLog.push(activity);
    }

    /**
     * Add a finding/insight to the feed
     */
    logFinding(title, details) {
        const activity = {
            type: 'finding',
            icon: '💡',
            timestamp: new Date(),
            title: title,
            details: details
        };
        
        this.addActivity(activity);
        this.researchLog.push(activity);
    }

    /**
     * Add activity to visual feed
     */
    addActivity(activity) {
        const div = document.createElement('div');
        div.className = `research-activity ${activity.type}`;
        
        const timeAgo = this.getTimeAgo(activity.timestamp);
        
        let findingsHTML = '';
        if (activity.findings && activity.findings.length > 0) {
            findingsHTML = `
                <div class="activity-findings">
                    <strong>Key Findings:</strong>
                    <ul>
                        ${activity.findings.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        let queryHTML = '';
        if (activity.query) {
            queryHTML = `<div class="activity-query">Searching: "${activity.query}"</div>`;
        }
        
        div.innerHTML = `
            <div class="activity-header">
                <span class="activity-icon">${activity.icon}</span>
                <span class="activity-type">${activity.type.toUpperCase()}</span>
                <span class="activity-time">${timeAgo}</span>
            </div>
            <div class="activity-content">
                ${queryHTML}
                ${activity.title ? `<strong>${activity.title}</strong>` : ''}
                <p>${activity.description || activity.details || ''}</p>
                ${findingsHTML}
            </div>
        `;
        
        // Insert at top of feed
        this.feed.insertBefore(div, this.feed.firstChild);
        
        // Auto-scroll to top
        this.feed.scrollTop = 0;
        
        // Update progress
        this.updateProgress();
    }

    /**
     * Get human-readable time ago
     */
    getTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        if (seconds < 10) return 'Just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return timestamp.toLocaleTimeString();
    }

    /**
     * Update overall progress bar
     */
    updateProgress() {
        // Calculate progress based on completed steps
        const totalSteps = 10;
        const completedSteps = document.querySelectorAll('.step-item.completed').length;
        const progress = (completedSteps / totalSteps) * 100;
        
        document.getElementById('overallProgress').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete`;
    }

    /**
     * Switch to different page research
     */
    switchPage(pageName) {
        this.currentPage = pageName;
        document.getElementById('currentPage').textContent = pageName;
        
        // Clear feed for new page
        this.feed.innerHTML = '';
        this.researchLog = [];
        
        // Log page switch
        this.logFinding(`Starting Research`, `Beginning deep research for ${pageName}...`);
    }

    /**
     * Mark page research as complete
     */
    completePage(pageName, stats) {
        const summary = document.getElementById('pageSummary');
        summary.style.display = 'block';
        
        summary.querySelector('.summary-title span:last-child').textContent = `${pageName} Research Complete`;
        summary.querySelector('.stat-value').textContent = stats.topics || 0;
        
        // Mark tab as completed
        document.querySelectorAll('.page-tab').forEach(tab => {
            if (tab.textContent.includes(pageName)) {
                tab.classList.add('completed');
                tab.classList.remove('active');
            }
        });
    }
}

// Export for use in research workflow
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveResearchDisplay;
}

