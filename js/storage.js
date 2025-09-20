// Local Storage Service for Good Night App
class StorageService {
    constructor() {
        this.prefix = 'goodnight_';
        this.version = '1.0';
        
        // Storage keys
        this.keys = {
            dreams: `${this.prefix}dreams`,
            tasks: `${this.prefix}tasks`,
            metrics: `${this.prefix}metrics`,
            settings: `${this.prefix}settings`,
            version: `${this.prefix}version`
        };
        
        this.init();
    }

    // Initialize storage and handle migrations
    init() {
        try {
            this.checkVersion();
            this.ensureStorageStructure();
            console.log('Storage service initialized');
        } catch (error) {
            console.error('Error initializing storage:', error);
        }
    }

    // Check storage version and migrate if needed
    checkVersion() {
        const storedVersion = localStorage.getItem(this.keys.version);
        
        if (!storedVersion) {
            // First time setup
            localStorage.setItem(this.keys.version, this.version);
        } else if (storedVersion !== this.version) {
            // Handle migration if needed
            this.migrateData(storedVersion, this.version);
            localStorage.setItem(this.keys.version, this.version);
        }
    }

    // Ensure all storage structures exist
    ensureStorageStructure() {
        const structures = {
            [this.keys.dreams]: [],
            [this.keys.tasks]: [],
            [this.keys.metrics]: {},
            [this.keys.settings]: {
                theme: 'purple',
                notifications: true,
                autoSave: true
            }
        };

        for (const [key, defaultValue] of Object.entries(structures)) {
            if (!localStorage.getItem(key)) {
                this.setItem(key, defaultValue);
            }
        }
    }

    // Generic storage methods
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Dream-related storage methods
    async saveDream(dream) {
        try {
            const dreams = this.getAllDreams();
            
            // Add metadata
            dream.id = dream.id || Date.now().toString();
            dream.createdAt = dream.createdAt || new Date().toISOString();
            dream.updatedAt = new Date().toISOString();
            
            // Check if dream already exists (update vs create)
            const existingIndex = dreams.findIndex(d => d.id === dream.id);
            
            if (existingIndex >= 0) {
                dreams[existingIndex] = dream;
            } else {
                dreams.unshift(dream); // Add to beginning for chronological order
            }
            
            // Limit storage to last 1000 dreams
            if (dreams.length > 1000) {
                dreams.splice(1000);
            }
            
            this.setItem(this.keys.dreams, dreams);
            return dream;
        } catch (error) {
            console.error('Error saving dream:', error);
            throw new Error('No se pudo guardar el sueño');
        }
    }

    getAllDreams() {
        return this.getItem(this.keys.dreams, []);
    }

    getDream(dreamId) {
        const dreams = this.getAllDreams();
        return dreams.find(dream => dream.id === dreamId);
    }

    async deleteDream(dreamId) {
        try {
            const dreams = this.getAllDreams();
            const filteredDreams = dreams.filter(dream => dream.id !== dreamId);
            this.setItem(this.keys.dreams, filteredDreams);
            return true;
        } catch (error) {
            console.error('Error deleting dream:', error);
            throw new Error('No se pudo eliminar el sueño');
        }
    }

    // Search dreams
    searchDreams(query, filters = {}) {
        const dreams = this.getAllDreams();
        const lowerQuery = query.toLowerCase();
        
        return dreams.filter(dream => {
            // Text search
            const textMatch = !query || 
                dream.dreamText.toLowerCase().includes(lowerQuery) ||
                (dream.interpretation && Object.values(dream.interpretation)
                    .some(text => typeof text === 'string' && text.toLowerCase().includes(lowerQuery)));
            
            // Date filter
            const dateMatch = !filters.date || dream.date.startsWith(filters.date);
            
            // Category filter
            const categoryMatch = !filters.category || 
                (dream.interpretation && dream.interpretation.category === filters.category);
            
            // Mood filter
            const moodMatch = !filters.mood || 
                (dream.interpretation && dream.interpretation.mood === filters.mood);
            
            return textMatch && dateMatch && categoryMatch && moodMatch;
        });
    }

    // Get dreams by date range
    getDreamsByDateRange(startDate, endDate) {
        const dreams = this.getAllDreams();
        return dreams.filter(dream => {
            const dreamDate = new Date(dream.date);
            return dreamDate >= new Date(startDate) && dreamDate <= new Date(endDate);
        });
    }

    // Task-related storage methods
    async saveTask(task) {
        try {
            const tasks = this.getAllTasks();
            
            // Add metadata
            task.id = task.id || Date.now().toString();
            task.createdAt = task.createdAt || new Date().toISOString();
            task.updatedAt = new Date().toISOString();
            
            // Check if task already exists
            const existingIndex = tasks.findIndex(t => t.id === task.id);
            
            if (existingIndex >= 0) {
                tasks[existingIndex] = task;
            } else {
                tasks.push(task);
            }
            
            this.setItem(this.keys.tasks, tasks);
            return task;
        } catch (error) {
            console.error('Error saving task:', error);
            throw new Error('No se pudo guardar la tarea');
        }
    }

    getAllTasks() {
        return this.getItem(this.keys.tasks, []);
    }

    getTask(taskId) {
        const tasks = this.getAllTasks();
        return tasks.find(task => task.id === taskId);
    }

    async updateTask(task) {
        return await this.saveTask(task);
    }

    async deleteTask(taskId) {
        try {
            const tasks = this.getAllTasks();
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            this.setItem(this.keys.tasks, filteredTasks);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw new Error('No se pudo eliminar la tarea');
        }
    }

    // Get tasks by type
    getTasksByType(type) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.type === type);
    }

    // Get completed tasks
    getCompletedTasks() {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.completed);
    }

    // Get pending tasks
    getPendingTasks() {
        const tasks = this.getAllTasks();
        return tasks.filter(task => !task.completed);
    }

    // Metrics-related storage methods
    async saveMetrics(metrics) {
        try {
            const allMetrics = this.getItem(this.keys.metrics, {});
            
            // Use date as key
            const date = metrics.date || new Date().toISOString().split('T')[0];
            
            // Add metadata
            metrics.updatedAt = new Date().toISOString();
            
            allMetrics[date] = metrics;
            
            this.setItem(this.keys.metrics, allMetrics);
            return metrics;
        } catch (error) {
            console.error('Error saving metrics:', error);
            throw new Error('No se pudieron guardar las métricas');
        }
    }

    getMetrics(date) {
        const allMetrics = this.getItem(this.keys.metrics, {});
        return allMetrics[date] || null;
    }

    getAllMetrics() {
        return this.getItem(this.keys.metrics, {});
    }

    // Get metrics for date range
    getMetricsByDateRange(startDate, endDate) {
        const allMetrics = this.getAllMetrics();
        const result = {};
        
        for (const [date, metrics] of Object.entries(allMetrics)) {
            if (date >= startDate && date <= endDate) {
                result[date] = metrics;
            }
        }
        
        return result;
    }

    // Calculate average sleep metrics
    getAverageMetrics(days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        const metrics = this.getMetricsByDateRange(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );
        
        const values = Object.values(metrics);
        if (values.length === 0) return null;
        
        const totals = values.reduce((acc, metric) => {
            acc.totalSleepMinutes += this.parseTimeToMinutes(metric.totalSleep || '0h 0m');
            acc.qualitySum += metric.quality || 0;
            acc.interruptionsSum += metric.interruptions || 0;
            acc.count++;
            return acc;
        }, { totalSleepMinutes: 0, qualitySum: 0, interruptionsSum: 0, count: 0 });
        
        return {
            averageSleep: this.minutesToTimeString(totals.totalSleepMinutes / totals.count),
            averageQuality: (totals.qualitySum / totals.count).toFixed(1),
            averageInterruptions: (totals.interruptionsSum / totals.count).toFixed(1),
            daysTracked: totals.count
        };
    }

    // Settings-related methods
    getSetting(key, defaultValue = null) {
        const settings = this.getItem(this.keys.settings, {});
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    async saveSetting(key, value) {
        try {
            const settings = this.getItem(this.keys.settings, {});
            settings[key] = value;
            this.setItem(this.keys.settings, settings);
            return true;
        } catch (error) {
            console.error('Error saving setting:', error);
            return false;
        }
    }

    getAllSettings() {
        return this.getItem(this.keys.settings, {});
    }

    // Data export/import methods
    exportData() {
        try {
            const data = {
                dreams: this.getAllDreams(),
                tasks: this.getAllTasks(),
                metrics: this.getAllMetrics(),
                settings: this.getAllSettings(),
                exportDate: new Date().toISOString(),
                version: this.version
            };
            
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('No se pudieron exportar los datos');
        }
    }

    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.version || !data.dreams || !data.tasks || !data.metrics) {
                throw new Error('Formato de datos inválido');
            }
            
            // Backup current data
            const backup = this.exportData();
            localStorage.setItem(`${this.prefix}backup_${Date.now()}`, backup);
            
            // Import data
            this.setItem(this.keys.dreams, data.dreams);
            this.setItem(this.keys.tasks, data.tasks);
            this.setItem(this.keys.metrics, data.metrics);
            this.setItem(this.keys.settings, { ...this.getAllSettings(), ...data.settings });
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('No se pudieron importar los datos: ' + error.message);
        }
    }

    // Storage management methods
    getStorageUsage() {
        let totalSize = 0;
        const usage = {};
        
        for (const key of Object.values(this.keys)) {
            const item = localStorage.getItem(key);
            const size = item ? new Blob([item]).size : 0;
            usage[key] = size;
            totalSize += size;
        }
        
        return {
            total: totalSize,
            breakdown: usage,
            percentage: (totalSize / (5 * 1024 * 1024)) * 100 // Assuming 5MB limit
        };
    }

    clearAllData() {
        try {
            for (const key of Object.values(this.keys)) {
                localStorage.removeItem(key);
            }
            this.ensureStorageStructure();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Handle storage quota exceeded
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup...');
        
        // Remove old dreams (keep only last 100)
        const dreams = this.getAllDreams();
        if (dreams.length > 100) {
            const recentDreams = dreams.slice(0, 100);
            this.setItem(this.keys.dreams, recentDreams);
        }
        
        // Remove old metrics (keep only last 90 days)
        const allMetrics = this.getAllMetrics();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        const cutoffString = cutoffDate.toISOString().split('T')[0];
        
        const recentMetrics = {};
        for (const [date, metrics] of Object.entries(allMetrics)) {
            if (date >= cutoffString) {
                recentMetrics[date] = metrics;
            }
        }
        this.setItem(this.keys.metrics, recentMetrics);
        
        // Remove completed tasks older than 30 days
        const tasks = this.getAllTasks();
        const taskCutoff = new Date();
        taskCutoff.setDate(taskCutoff.getDate() - 30);
        
        const filteredTasks = tasks.filter(task => {
            if (!task.completed) return true;
            const taskDate = new Date(task.updatedAt || task.createdAt);
            return taskDate >= taskCutoff;
        });
        this.setItem(this.keys.tasks, filteredTasks);
    }

    // Utility methods
    parseTimeToMinutes(timeString) {
        const match = timeString.match(/(\d+)h\s*(\d+)m/);
        if (match) {
            return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return 0;
    }

    minutesToTimeString(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    }

    // Data migration (for future versions)
    migrateData(fromVersion, toVersion) {
        console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
        
        // Add migration logic here when needed
        // For now, no migration is needed
    }

    // Statistics methods
    getStatistics() {
        const dreams = this.getAllDreams();
        const tasks = this.getAllTasks();
        const metrics = this.getAllMetrics();
        
        return {
            totalDreams: dreams.length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            daysTracked: Object.keys(metrics).length,
            averageMetrics: this.getAverageMetrics(30),
            storageUsage: this.getStorageUsage()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
