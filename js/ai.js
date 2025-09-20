// AI Service for Dream Interpretation - Good Night App
class AIService {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 1500;
        this.temperature = 0.7;
        
        // Load API key from localStorage if available
        this.loadAPIKey();
    }

    // Load API key from localStorage
    loadAPIKey() {
        this.apiKey = localStorage.getItem('openai_api_key');
    }

    // Save API key to localStorage
    saveAPIKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('openai_api_key', apiKey);
    }

    // Check if API key is configured
    isConfigured() {
        return !!this.apiKey;
    }

    // Prompt user for API key if not configured
    async ensureAPIKey() {
        if (!this.isConfigured()) {
            const apiKey = prompt(
                'Para usar la interpretación de sueños con IA, necesitas una API key de OpenAI.\n\n' +
                'Puedes obtener una gratis en: https://platform.openai.com/api-keys\n\n' +
                'Ingresa tu API key:'
            );
            
            if (apiKey && apiKey.trim()) {
                this.saveAPIKey(apiKey.trim());
                return true;
            } else {
                throw new Error('API key requerida para la interpretación de sueños');
            }
        }
        return true;
    }

    // Main dream interpretation function
    async interpretDream(dreamText) {
        await this.ensureAPIKey();

        const prompt = this.createDreamInterpretationPrompt(dreamText);
        
        try {
            const response = await this.callOpenAI(prompt);
            return this.parseDreamInterpretation(response);
        } catch (error) {
            console.error('Error interpreting dream:', error);
            
            // Fallback to local interpretation if API fails
            return this.generateLocalInterpretation(dreamText);
        }
    }

    // Create comprehensive prompt for dream interpretation
    createDreamInterpretationPrompt(dreamText) {
        return `Eres un experto en interpretación de sueños con conocimientos en psicología, simbolismo y análisis de patrones emocionales. 

Analiza el siguiente sueño y proporciona una interpretación completa en español:

SUEÑO: "${dreamText}"

Por favor, proporciona tu análisis en el siguiente formato JSON:

{
    "psychological": "Análisis psicológico detallado del sueño, incluyendo posibles significados relacionados con el subconsciente, miedos, deseos y experiencias de vida",
    "symbolism": "Interpretación de los símbolos presentes en el sueño, explicando qué pueden representar en el contexto de la vida del soñador",
    "emotional": "Análisis de los patrones emocionales presentes en el sueño y cómo pueden relacionarse con el estado emocional actual",
    "recommendations": "Recomendaciones prácticas basadas en la interpretación del sueño",
    "category": "Categoría del sueño (pesadilla, lúcido, recurrente, profético, etc.)",
    "tags": ["tag1", "tag2", "tag3"],
    "mood": "Estado de ánimo general del sueño (positivo, negativo, neutro, mixto)"
}

Asegúrate de que la respuesta sea empática, constructiva y útil para el crecimiento personal.`;
    }

    // Call OpenAI API
    async callOpenAI(prompt) {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto intérprete de sueños especializado en psicología y simbolismo.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Parse AI response into structured format
    parseDreamInterpretation(response) {
        try {
            // Try to parse as JSON first
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    psychological: parsed.psychological || 'Análisis no disponible',
                    symbolism: parsed.symbolism || 'Simbolismo no disponible',
                    emotional: parsed.emotional || 'Patrones emocionales no disponibles',
                    recommendations: parsed.recommendations || 'Recomendaciones no disponibles',
                    category: parsed.category || 'general',
                    tags: parsed.tags || [],
                    mood: parsed.mood || 'neutro'
                };
            }
        } catch (error) {
            console.warn('Could not parse JSON response, using text parsing');
        }

        // Fallback to text parsing
        return this.parseTextResponse(response);
    }

    // Parse text response when JSON parsing fails
    parseTextResponse(response) {
        const sections = {
            psychological: this.extractSection(response, ['psicológico', 'psychological', 'psicologia']),
            symbolism: this.extractSection(response, ['simbolismo', 'symbolism', 'símbolos']),
            emotional: this.extractSection(response, ['emocional', 'emotional', 'emociones']),
            recommendations: this.extractSection(response, ['recomendaciones', 'recommendations', 'consejos']),
            category: 'general',
            tags: this.extractTags(response),
            mood: this.extractMood(response)
        };

        return sections;
    }

    // Extract specific section from text response
    extractSection(text, keywords) {
        const lines = text.split('\n');
        let sectionLines = [];
        let inSection = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            
            // Check if this line starts a section we're looking for
            if (keywords.some(keyword => lowerLine.includes(keyword))) {
                inSection = true;
                sectionLines = [];
                continue;
            }
            
            // Check if we've hit another section
            if (inSection && line.match(/^[A-Z][^:]*:/)) {
                break;
            }
            
            if (inSection && line.trim()) {
                sectionLines.push(line.trim());
            }
        }

        return sectionLines.join(' ') || 'Información no disponible';
    }

    // Extract tags from response
    extractTags(text) {
        const tagPatterns = [
            /tags?:\s*\[(.*?)\]/i,
            /etiquetas?:\s*\[(.*?)\]/i,
            /palabras clave:\s*(.*?)(?:\n|$)/i
        ];

        for (const pattern of tagPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
            }
        }

        return [];
    }

    // Extract mood from response
    extractMood(text) {
        const moodKeywords = {
            positivo: ['positivo', 'alegre', 'feliz', 'esperanzador', 'optimista'],
            negativo: ['negativo', 'triste', 'miedo', 'ansiedad', 'pesadilla'],
            neutro: ['neutro', 'neutral', 'equilibrado'],
            mixto: ['mixto', 'complejo', 'ambivalente']
        };

        const lowerText = text.toLowerCase();
        
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return mood;
            }
        }

        return 'neutro';
    }

    // Generate local interpretation when API is not available
    generateLocalInterpretation(dreamText) {
        const symbols = this.analyzeSymbols(dreamText);
        const emotions = this.analyzeEmotions(dreamText);
        const category = this.categorizeLocalDream(dreamText);

        return {
            psychological: `Tu sueño refleja aspectos de tu subconsciente relacionados con ${symbols.join(', ')}. ` +
                          `Esto puede indicar preocupaciones o intereses actuales en tu vida.`,
            symbolism: `Los elementos presentes en tu sueño (${symbols.join(', ')}) pueden simbolizar ` +
                      `diferentes aspectos de tu experiencia personal y emocional.`,
            emotional: `El tono emocional de tu sueño sugiere ${emotions.join(' y ')}. ` +
                      `Esto puede reflejar tu estado emocional actual.`,
            recommendations: 'Reflexiona sobre los elementos de tu sueño y cómo se relacionan con tu vida actual. ' +
                           'Considera llevar un diario de sueños para identificar patrones.',
            category: category,
            tags: symbols,
            mood: emotions.includes('positivo') ? 'positivo' : emotions.includes('negativo') ? 'negativo' : 'neutro'
        };
    }

    // Analyze symbols in dream text (local fallback)
    analyzeSymbols(text) {
        const symbolMap = {
            'agua': ['agua', 'mar', 'río', 'lluvia', 'océano'],
            'animales': ['perro', 'gato', 'pájaro', 'serpiente', 'león'],
            'familia': ['madre', 'padre', 'hermano', 'hermana', 'hijo'],
            'casa': ['casa', 'hogar', 'habitación', 'cocina', 'baño'],
            'trabajo': ['trabajo', 'oficina', 'jefe', 'compañero', 'reunión'],
            'viaje': ['viaje', 'coche', 'avión', 'tren', 'camino'],
            'muerte': ['muerte', 'funeral', 'cementerio', 'fantasma'],
            'volar': ['volar', 'vuelo', 'alas', 'cielo', 'altura']
        };

        const foundSymbols = [];
        const lowerText = text.toLowerCase();

        for (const [symbol, keywords] of Object.entries(symbolMap)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                foundSymbols.push(symbol);
            }
        }

        return foundSymbols.length > 0 ? foundSymbols : ['elementos cotidianos'];
    }

    // Analyze emotions in dream text (local fallback)
    analyzeEmotions(text) {
        const emotionMap = {
            'positivo': ['feliz', 'alegre', 'contento', 'emocionado', 'tranquilo'],
            'negativo': ['miedo', 'triste', 'asustado', 'preocupado', 'ansioso'],
            'confuso': ['confundido', 'perdido', 'extraño', 'raro', 'bizarro']
        };

        const foundEmotions = [];
        const lowerText = text.toLowerCase();

        for (const [emotion, keywords] of Object.entries(emotionMap)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                foundEmotions.push(emotion);
            }
        }

        return foundEmotions.length > 0 ? foundEmotions : ['neutro'];
    }

    // Categorize dream locally
    categorizeLocalDream(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('pesadilla') || lowerText.includes('miedo') || lowerText.includes('terror')) {
            return 'pesadilla';
        }
        if (lowerText.includes('volar') || lowerText.includes('controlar')) {
            return 'lúcido';
        }
        if (lowerText.includes('repetir') || lowerText.includes('siempre') || lowerText.includes('otra vez')) {
            return 'recurrente';
        }
        
        return 'general';
    }

    // Transcribe audio to text (placeholder for speech recognition)
    async transcribeAudio(audioBlob) {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            return await this.browserSpeechRecognition(audioBlob);
        }
        
        // Fallback: try OpenAI Whisper API if available
        if (this.isConfigured()) {
            try {
                return await this.whisperTranscription(audioBlob);
            } catch (error) {
                console.warn('Whisper transcription failed:', error);
            }
        }
        
        // Final fallback
        throw new Error('Transcripción de audio no disponible. Por favor, escribe tu sueño manualmente.');
    }

    // Browser-based speech recognition
    async browserSpeechRecognition(audioBlob) {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                reject(new Error('Reconocimiento de voz no soportado'));
                return;
            }

            // This is a simplified approach - in reality, you'd need to play the audio
            // and use real-time speech recognition
            reject(new Error('Transcripción automática no disponible. Por favor, escribe tu sueño.'));
        });
    }

    // OpenAI Whisper transcription
    async whisperTranscription(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'dream_audio.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'es');

        const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Whisper API Error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.text;
    }

    // Analyze dream patterns over time
    analyzeDreamPatterns(dreams) {
        if (!dreams || dreams.length === 0) {
            return {
                commonThemes: [],
                emotionalTrends: [],
                recommendations: 'Registra más sueños para obtener análisis de patrones.'
            };
        }

        const themes = {};
        const emotions = {};
        const categories = {};

        dreams.forEach(dream => {
            // Count themes
            if (dream.interpretation && dream.interpretation.tags) {
                dream.interpretation.tags.forEach(tag => {
                    themes[tag] = (themes[tag] || 0) + 1;
                });
            }

            // Count emotions
            if (dream.interpretation && dream.interpretation.mood) {
                emotions[dream.interpretation.mood] = (emotions[dream.interpretation.mood] || 0) + 1;
            }

            // Count categories
            if (dream.interpretation && dream.interpretation.category) {
                categories[dream.interpretation.category] = (categories[dream.interpretation.category] || 0) + 1;
            }
        });

        return {
            commonThemes: Object.entries(themes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([theme, count]) => ({ theme, count })),
            emotionalTrends: Object.entries(emotions)
                .sort(([,a], [,b]) => b - a)
                .map(([emotion, count]) => ({ emotion, count })),
            categories: Object.entries(categories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => ({ category, count })),
            totalDreams: dreams.length,
            recommendations: this.generatePatternRecommendations(themes, emotions, categories)
        };
    }

    // Generate recommendations based on dream patterns
    generatePatternRecommendations(themes, emotions, categories) {
        const recommendations = [];

        // Check for negative patterns
        if (emotions['negativo'] > emotions['positivo']) {
            recommendations.push('Considera técnicas de relajación antes de dormir para mejorar la calidad de tus sueños.');
        }

        // Check for recurring themes
        const topTheme = Object.entries(themes).sort(([,a], [,b]) => b - a)[0];
        if (topTheme && topTheme[1] > 3) {
            recommendations.push(`El tema "${topTheme[0]}" aparece frecuentemente en tus sueños. Reflexiona sobre su significado en tu vida.`);
        }

        // Check for nightmares
        if (categories['pesadilla'] > 2) {
            recommendations.push('Si tienes pesadillas frecuentes, considera hablar con un profesional de la salud mental.');
        }

        return recommendations.length > 0 ? recommendations.join(' ') : 
               'Continúa registrando tus sueños para obtener insights más personalizados.';
    }

    // Clear API key (for privacy)
    clearAPIKey() {
        this.apiKey = null;
        localStorage.removeItem('openai_api_key');
    }

    // Test API connection
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        try {
            const response = await this.callOpenAI('Test message');
            return true;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
}
