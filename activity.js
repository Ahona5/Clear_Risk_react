/**
 * Activity Log Logic
 * - Loads from localStorage "activityLogs"
 * - Handles filtering
 * - Renders timeline
 */

document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('activity-timeline');
    const searchInput = document.getElementById('log-search');
    const filterPills = document.querySelectorAll('.pill');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    let currentFilter = 'all';
    let searchQuery = '';

    // Handle Sidebar Toggle (consistent with other pages)
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });

    // Mock initial data if empty (for demonstration)
    if (!localStorage.getItem('activityLogs')) {
        const mockLogs = [
            { id: 1, user: 'Admin', action: 'CREATE', details: 'created new risk "Financial Leak"', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: 2, user: 'John Doe', action: 'UPDATE', details: 'updated status of "Server Down"', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 3, user: 'Jane Smith', action: 'DELETE', details: 'deleted user "Mark Wilson"', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
            { id: 4, user: 'Admin', action: 'ESCALATE', details: 'escalated risk "Data Breach"', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
            { id: 5, user: 'Admin', action: 'LOGIN', details: 'logged into the system', time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() }
        ];
        localStorage.setItem('activityLogs', JSON.stringify(mockLogs));
    }

    function getRelativeTime(isoDate) {
        const now = new Date();
        const then = new Date(isoDate);
        const diffInSeconds = Math.floor((now - then) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return then.toLocaleDateString();
    }

    function getActionIcon(action) {
        switch (action) {
            case 'CREATE': return '+';
            case 'UPDATE': return '✎';
            case 'DELETE': return '✕';
            case 'ESCALATE': return '⚠';
            case 'LOGIN': return '👤';
            case 'LOGOUT': return '⏻';
            default: return '•';
        }
    }

    function getActionTitle(action) {
        return action.charAt(0) + action.slice(1).toLowerCase() + 'd Action';
    }

    function renderLogs() {
        const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
        
        const filteredLogs = logs.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = currentFilter === 'all' || log.action === currentFilter;
            return matchesSearch && matchesFilter;
        });

        // Sort by time descending
        filteredLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

        if (filteredLogs.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <span>📭</span>
                    <p>No activity found matching your filters</p>
                </div>
            `;
            return;
        }

        timeline.innerHTML = filteredLogs.map(log => `
            <div class="timeline-item status-${log.action.toLowerCase()}">
                <div class="timeline-icon">${getActionIcon(log.action)}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${log.action}</span>
                        <span class="timeline-time">${getRelativeTime(log.time)}</span>
                    </div>
                    <p class="timeline-desc">
                        <span class="timeline-user">${log.user}</span> ${log.details}
                    </p>
                </div>
            </div>
        `).join('');
    }

    // Event Listeners for Filters
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderLogs();
    });

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.type;
            renderLogs();
        });
    });

    // Initial Render
    renderLogs();
});
