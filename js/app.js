// Good Night - Main Application Controller
class GoodNightApp {
    constructor() {
        this.currentSection = 'dreams';
        this.audioRecorder = null;
        this.storage = null;
        this.aiService = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize services
            this.storage = new StorageService();
            this.aiService = new AIService();
            this.audioRecorder = new AudioRecorder();
            
            // Setup event listeners
            this.setupNavigation();
            this.setupDreamInput();
            this.setupMetrics();
            this.setupTasks();
            this.setupHistory();
            
            // Load initial data
            this.loadInitialData();
            
            console.log('Good Night app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    // Navigation
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'history':
                this.loadDreamHistory();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'metrics':
                this.loadTodayMetrics();
                break;
        }
    }

    // Dream Input Setup
    setupDreamInput() {
        const recordBtn = document.getElementById('recordBtn');
        const dreamText = document.getElementById('dreamText');
        const interpretBtn = document.getElementById('interpretBtn');
        
        // Audio recording
        recordBtn.addEventListener('click', () => {
            this.toggleRecording();
        });
        
        // Text input
        dreamText.addEventListener('input', () => {
            this.updateInterpretButton();
            // Change text alignment when user starts typing
            if (dreamText.value.trim().length > 0) {
                dreamText.style.textAlign = 'left';
            } else {
                dreamText.style.textAlign = 'center';
            }
        });
        
        // Handle focus and blur for better UX
        dreamText.addEventListener('focus', () => {
            if (dreamText.value.trim().length === 0) {
                dreamText.style.textAlign = 'center';
            }
        });
        
        dreamText.addEventListener('blur', () => {
            if (dreamText.value.trim().length === 0) {
                dreamText.style.textAlign = 'center';
            }
        });
        
        // Interpret button
        interpretBtn.addEventListener('click', () => {
            this.interpretDream();
        });
        
        // Save interpretation
        const saveBtn = document.getElementById('saveInterpretation');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentInterpretation();
            });
        }
    }

    async toggleRecording() {
        try {
            if (this.audioRecorder.isRecording) {
                const audioBlob = await this.audioRecorder.stopRecording();
                await this.processAudioRecording(audioBlob);
            } else {
                await this.audioRecorder.startRecording();
                this.updateRecordingUI(true);
            }
        } catch (error) {
            console.error('Error with recording:', error);
            this.showError('Error con la grabación de audio');
        }
    }

    async processAudioRecording(audioBlob) {
        try {
            this.showLoading('Procesando audio...');
            
            // Convert audio to text using speech recognition or AI service
            const transcription = await this.aiService.transcribeAudio(audioBlob);
            
            // Update text area with transcription
            document.getElementById('dreamText').value = transcription;
            
            this.updateRecordingUI(false);
            this.updateInterpretButton();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error processing audio:', error);
            this.showError('Error al procesar el audio');
            this.hideLoading();
        }
    }

    updateRecordingUI(isRecording) {
        const recordBtn = document.getElementById('recordBtn');
        const indicator = document.querySelector('.recording-indicator');
        const status = document.querySelector('.recording-status');
        const timeDisplay = document.getElementById('recordingTime');
        
        if (isRecording) {
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
            indicator.classList.add('active');
            status.textContent = 'Grabando... Presiona para detener';
            
            // Start timer
            this.startRecordingTimer();
        } else {
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            indicator.classList.remove('active');
            status.textContent = 'Presiona para grabar';
            timeDisplay.textContent = '00:00';
            
            // Stop timer
            this.stopRecordingTimer();
        }
    }

    startRecordingTimer() {
        let seconds = 0;
        this.recordingTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            document.getElementById('recordingTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    updateInterpretButton() {
        const dreamText = document.getElementById('dreamText').value.trim();
        const interpretBtn = document.getElementById('interpretBtn');
        
        interpretBtn.disabled = dreamText.length === 0;
    }

    async interpretDream() {
        const dreamText = document.getElementById('dreamText').value.trim();
        
        if (!dreamText) {
            this.showError('Por favor, ingresa o graba tu sueño primero');
            return;
        }
        
        try {
            this.showLoading('Interpretando tu sueño...');
            
            const interpretation = await this.aiService.interpretDream(dreamText);
            this.displayInterpretation(interpretation);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error interpreting dream:', error);
            this.showError('Error al interpretar el sueño');
            this.hideLoading();
        }
    }

    displayInterpretation(interpretation) {
        const resultsContainer = document.getElementById('interpretationResults');
        const dateElement = resultsContainer.querySelector('.interpretation-date');
        
        // Set current date
        dateElement.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Display interpretation sections
        document.getElementById('psychologicalAnalysis').textContent = interpretation.psychological || 'Análisis no disponible';
        document.getElementById('symbolism').textContent = interpretation.symbolism || 'Simbolismo no disponible';
        document.getElementById('emotionalPatterns').textContent = interpretation.emotional || 'Patrones emocionales no disponibles';
        
        // Store current interpretation for saving
        this.currentInterpretation = {
            dreamText: document.getElementById('dreamText').value,
            interpretation: interpretation,
            date: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        // Show results
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    async saveCurrentInterpretation() {
        if (!this.currentInterpretation) {
            this.showError('No hay interpretación para guardar');
            return;
        }
        
        try {
            await this.storage.saveDream(this.currentInterpretation);
            this.showSuccess('Interpretación guardada exitosamente');
            
            // Clear form
            document.getElementById('dreamText').value = '';
            document.getElementById('interpretationResults').classList.add('hidden');
            this.updateInterpretButton();
            
        } catch (error) {
            console.error('Error saving interpretation:', error);
            this.showError('Error al guardar la interpretación');
        }
    }

    // Metrics Setup
    setupMetrics() {
        const bedTimeInput = document.getElementById('bedTime');
        const wakeTimeInput = document.getElementById('wakeTime');
        const qualityStars = document.querySelectorAll('.stars i');
        const saveMetricsBtn = document.getElementById('saveMetrics');
        
        // Calculate sleep duration
        [bedTimeInput, wakeTimeInput].forEach(input => {
            input.addEventListener('change', () => {
                this.calculateSleepDuration();
            });
        });
        
        // Quality rating
        qualityStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setQualityRating(index + 1);
            });
        });
        
        // Save metrics
        saveMetricsBtn.addEventListener('click', () => {
            this.saveMetrics();
        });
    }

    calculateSleepDuration() {
        const bedTime = document.getElementById('bedTime').value;
        const wakeTime = document.getElementById('wakeTime').value;
        
        if (bedTime && wakeTime) {
            const bed = new Date(`2000-01-01 ${bedTime}`);
            let wake = new Date(`2000-01-01 ${wakeTime}`);
            
            // Handle next day wake time
            if (wake < bed) {
                wake.setDate(wake.getDate() + 1);
            }
            
            const diffMs = wake - bed;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('totalSleep').textContent = `${hours}h ${minutes}m`;
        }
    }

    setQualityRating(rating) {
        const stars = document.querySelectorAll('.stars i');
        const qualityText = document.getElementById('qualityText');
        
        const qualityLabels = [
            'Muy malo',
            'Malo',
            'Regular',
            'Bueno',
            'Excelente'
        ];
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        qualityText.textContent = qualityLabels[rating - 1];
        this.currentQualityRating = rating;
    }

    async saveMetrics() {
        const bedTime = document.getElementById('bedTime').value;
        const wakeTime = document.getElementById('wakeTime').value;
        const interruptions = document.getElementById('interruptions').value;
        const interruptionNotes = document.getElementById('interruptionNotes').value;
        
        if (!bedTime || !wakeTime || !this.currentQualityRating) {
            this.showError('Por favor, completa todos los campos obligatorios');
            return;
        }
        
        const metrics = {
            date: new Date().toISOString().split('T')[0],
            bedTime,
            wakeTime,
            quality: this.currentQualityRating,
            interruptions: parseInt(interruptions) || 0,
            interruptionNotes,
            totalSleep: document.getElementById('totalSleep').textContent
        };
        
        try {
            await this.storage.saveMetrics(metrics);
            this.showSuccess('Métricas guardadas exitosamente');
            this.clearMetricsForm();
        } catch (error) {
            console.error('Error saving metrics:', error);
            this.showError('Error al guardar las métricas');
        }
    }

    clearMetricsForm() {
        document.getElementById('bedTime').value = '';
        document.getElementById('wakeTime').value = '';
        document.getElementById('interruptions').value = '';
        document.getElementById('interruptionNotes').value = '';
        document.getElementById('totalSleep').textContent = '0h 0m';
        
        // Reset quality rating
        document.querySelectorAll('.stars i').forEach(star => {
            star.classList.remove('active');
        });
        document.getElementById('qualityText').textContent = 'Selecciona una calificación';
        this.currentQualityRating = null;
    }

    // Tasks Setup
    setupTasks() {
        // Pre-sleep tasks
        document.getElementById('addPreSleepTask').addEventListener('click', () => {
            this.addTask('pre-sleep');
        });
        
        document.getElementById('newPreSleepTask').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask('pre-sleep');
            }
        });
        
        // Post-sleep tasks
        document.getElementById('addPostSleepTask').addEventListener('click', () => {
            this.addTask('post-sleep');
        });
        
        document.getElementById('newPostSleepTask').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask('post-sleep');
            }
        });
    }

    async addTask(type) {
        const inputId = type === 'pre-sleep' ? 'newPreSleepTask' : 'newPostSleepTask';
        const input = document.getElementById(inputId);
        const taskText = input.value.trim();
        
        if (!taskText) return;
        
        const task = {
            id: Date.now().toString(),
            text: taskText,
            type: type,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        try {
            await this.storage.saveTask(task);
            this.renderTask(task);
            input.value = '';
        } catch (error) {
            console.error('Error saving task:', error);
            this.showError('Error al guardar la tarea');
        }
    }

    renderTask(task) {
        const containerId = task.type === 'pre-sleep' ? 'preSleepTasks' : 'postSleepTasks';
        const container = document.getElementById(containerId);
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTask('${task.id}')"></div>
            <span class="task-text">${task.text}</span>
            <button class="task-delete" onclick="app.deleteTask('${task.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(taskElement);
    }

    async toggleTask(taskId) {
        try {
            const task = await this.storage.getTask(taskId);
            task.completed = !task.completed;
            await this.storage.updateTask(task);
            
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            const checkbox = taskElement.querySelector('.task-checkbox');
            
            if (task.completed) {
                taskElement.classList.add('completed');
                checkbox.classList.add('checked');
            } else {
                taskElement.classList.remove('completed');
                checkbox.classList.remove('checked');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showError('Error al actualizar la tarea');
        }
    }

    async deleteTask(taskId) {
        try {
            await this.storage.deleteTask(taskId);
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            taskElement.remove();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Error al eliminar la tarea');
        }
    }

    // History Setup
    setupHistory() {
        const dateFilter = document.getElementById('dateFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const searchFilter = document.getElementById('searchFilter');
        
        [dateFilter, categoryFilter, searchFilter].forEach(filter => {
            filter.addEventListener('change', () => {
                this.filterDreamHistory();
            });
            filter.addEventListener('input', () => {
                this.filterDreamHistory();
            });
        });
    }

    async loadDreamHistory() {
        try {
            const dreams = await this.storage.getAllDreams();
            this.renderDreamHistory(dreams);
        } catch (error) {
            console.error('Error loading dream history:', error);
            this.showError('Error al cargar el historial de sueños');
        }
    }

    renderDreamHistory(dreams) {
        const container = document.getElementById('dreamHistory');
        container.innerHTML = '';
        
        if (dreams.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--gray);">
                    <i class="fas fa-cloud" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No hay sueños registrados aún</p>
                    <p>¡Comienza registrando tu primer sueño!</p>
                </div>
            `;
            return;
        }
        
        dreams.forEach(dream => {
            const dreamElement = this.createDreamHistoryItem(dream);
            container.appendChild(dreamElement);
        });
    }

    createDreamHistoryItem(dream) {
        const element = document.createElement('div');
        element.className = 'dream-history-item';
        element.onclick = () => this.showDreamDetails(dream);
        
        const date = new Date(dream.date).toLocaleDateString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const preview = dream.dreamText.substring(0, 150) + (dream.dreamText.length > 150 ? '...' : '');
        
        element.innerHTML = `
            <div class="dream-header">
                <div class="dream-date">${date}</div>
                <div class="dream-category">${dream.category || 'General'}</div>
            </div>
            <div class="dream-preview">${preview}</div>
            <div class="dream-tags">
                ${dream.tags ? dream.tags.map(tag => `<span class="dream-tag">${tag}</span>`).join('') : ''}
            </div>
        `;
        
        return element;
    }

    showDreamDetails(dream) {
        // This could open a modal or navigate to a detailed view
        console.log('Show dream details:', dream);
        // For now, we'll just switch to the dreams section and populate it
        this.switchSection('dreams');
        document.getElementById('dreamText').value = dream.dreamText;
        this.displayInterpretation(dream.interpretation);
    }

    async filterDreamHistory() {
        const dateFilter = document.getElementById('dateFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
        
        try {
            let dreams = await this.storage.getAllDreams();
            
            // Apply filters
            if (dateFilter) {
                dreams = dreams.filter(dream => 
                    dream.date.startsWith(dateFilter)
                );
            }
            
            if (categoryFilter) {
                dreams = dreams.filter(dream => 
                    dream.category === categoryFilter
                );
            }
            
            if (searchFilter) {
                dreams = dreams.filter(dream => 
                    dream.dreamText.toLowerCase().includes(searchFilter) ||
                    (dream.interpretation && 
                     Object.values(dream.interpretation).some(text => 
                         text.toLowerCase().includes(searchFilter)
                     ))
                );
            }
            
            this.renderDreamHistory(dreams);
        } catch (error) {
            console.error('Error filtering dreams:', error);
            this.showError('Error al filtrar los sueños');
        }
    }

    // Data Loading
    async loadInitialData() {
        try {
            await this.loadTasks();
            await this.loadTodayMetrics();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadTasks() {
        try {
            const tasks = await this.storage.getAllTasks();
            
            // Clear existing tasks
            document.getElementById('preSleepTasks').innerHTML = '';
            document.getElementById('postSleepTasks').innerHTML = '';
            
            // Render tasks
            tasks.forEach(task => {
                this.renderTask(task);
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async loadTodayMetrics() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const metrics = await this.storage.getMetrics(today);
            
            if (metrics) {
                document.getElementById('bedTime').value = metrics.bedTime || '';
                document.getElementById('wakeTime').value = metrics.wakeTime || '';
                document.getElementById('interruptions').value = metrics.interruptions || '';
                document.getElementById('interruptionNotes').value = metrics.interruptionNotes || '';
                
                if (metrics.quality) {
                    this.setQualityRating(metrics.quality);
                }
                
                this.calculateSleepDuration();
            }
        } catch (error) {
            console.error('Error loading today metrics:', error);
        }
    }

    // UI Helpers
    showLoading(message = 'Cargando...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageElement = overlay.querySelector('p');
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper toast system
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple success display - could be enhanced with a proper toast system
        alert(`Éxito: ${message}`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GoodNightApp();
});
