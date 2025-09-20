// Audio Recording Service for Good Night App
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.recordingStartTime = null;
    }

    async startRecording() {
        try {
            // Request microphone permission
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });

            // Create MediaRecorder instance
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.getSupportedMimeType()
            });

            // Reset audio chunks
            this.audioChunks = [];

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.stopStream();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                throw new Error('Error durante la grabación');
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            this.recordingStartTime = Date.now();

            console.log('Recording started');
            return true;

        } catch (error) {
            console.error('Error starting recording:', error);
            
            if (error.name === 'NotAllowedError') {
                throw new Error('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No se encontró micrófono. Por favor, conecta un micrófono.');
            } else if (error.name === 'NotSupportedError') {
                throw new Error('Grabación de audio no soportada en este navegador.');
            } else {
                throw new Error('Error al iniciar la grabación: ' + error.message);
            }
        }
    }

    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('No hay grabación activa'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                try {
                    // Create blob from recorded chunks
                    const audioBlob = new Blob(this.audioChunks, { 
                        type: this.getSupportedMimeType() 
                    });

                    // Calculate recording duration
                    const duration = Date.now() - this.recordingStartTime;

                    // Stop the stream
                    this.stopStream();

                    // Reset state
                    this.isRecording = false;
                    this.mediaRecorder = null;
                    this.audioChunks = [];

                    console.log(`Recording stopped. Duration: ${duration}ms, Size: ${audioBlob.size} bytes`);

                    resolve({
                        blob: audioBlob,
                        duration: duration,
                        size: audioBlob.size,
                        mimeType: this.getSupportedMimeType()
                    });

                } catch (error) {
                    console.error('Error processing recorded audio:', error);
                    reject(new Error('Error al procesar la grabación'));
                }
            };

            // Stop recording
            this.mediaRecorder.stop();
        });
    }

    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm'; // Fallback
    }

    // Convert audio blob to base64 for storage or transmission
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Create audio URL for playback
    createAudioURL(blob) {
        return URL.createObjectURL(blob);
    }

    // Clean up audio URL
    revokeAudioURL(url) {
        URL.revokeObjectURL(url);
    }

    // Check if audio recording is supported
    static isSupported() {
        return !!(navigator.mediaDevices && 
                 navigator.mediaDevices.getUserMedia && 
                 window.MediaRecorder);
    }

    // Get audio recording permissions status
    async getPermissionStatus() {
        try {
            const permission = await navigator.permissions.query({ name: 'microphone' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.warn('Could not check microphone permission:', error);
            return 'unknown';
        }
    }

    // Request microphone permission without starting recording
    async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    }

    // Get available audio input devices
    async getAudioInputDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'audioinput');
        } catch (error) {
            console.error('Error getting audio devices:', error);
            return [];
        }
    }

    // Analyze audio level (for visual feedback)
    setupAudioAnalysis() {
        if (!this.stream) return null;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(this.stream);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            microphone.connect(analyser);

            return {
                analyser,
                dataArray,
                getVolume: () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    return sum / bufferLength;
                }
            };
        } catch (error) {
            console.error('Error setting up audio analysis:', error);
            return null;
        }
    }

    // Convert audio to different format (if needed)
    async convertAudio(blob, targetMimeType) {
        // This is a placeholder for audio conversion
        // In a real implementation, you might use libraries like ffmpeg.js
        // For now, we'll just return the original blob
        console.log(`Audio conversion requested: ${blob.type} -> ${targetMimeType}`);
        return blob;
    }

    // Compress audio (reduce file size)
    async compressAudio(blob, quality = 0.7) {
        // This is a placeholder for audio compression
        // In a real implementation, you might use audio processing libraries
        console.log(`Audio compression requested with quality: ${quality}`);
        return blob;
    }

    // Get recording duration in human-readable format
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Validate audio blob
    validateAudioBlob(blob) {
        if (!blob || blob.size === 0) {
            throw new Error('Audio blob is empty or invalid');
        }

        if (blob.size > 50 * 1024 * 1024) { // 50MB limit
            throw new Error('Audio file is too large (max 50MB)');
        }

        if (!blob.type.startsWith('audio/')) {
            throw new Error('Invalid audio format');
        }

        return true;
    }

    // Create audio preview element
    createAudioPreview(blob) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = this.createAudioURL(blob);
        audio.style.width = '100%';
        audio.style.marginTop = '10px';
        
        // Clean up URL when audio is removed
        audio.addEventListener('remove', () => {
            this.revokeAudioURL(audio.src);
        });

        return audio;
    }

    // Save audio to local storage (as base64)
    async saveAudioToStorage(blob, key) {
        try {
            const base64 = await this.blobToBase64(blob);
            localStorage.setItem(key, base64);
            return true;
        } catch (error) {
            console.error('Error saving audio to storage:', error);
            return false;
        }
    }

    // Load audio from local storage
    async loadAudioFromStorage(key) {
        try {
            const base64 = localStorage.getItem(key);
            if (!base64) return null;

            const response = await fetch(base64);
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error loading audio from storage:', error);
            return null;
        }
    }

    // Clean up resources
    cleanup() {
        this.stopStream();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingStartTime = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioRecorder;
}
