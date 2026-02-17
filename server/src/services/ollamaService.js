const axios = require('axios');
const { logger } = require('../config/logger');

// URL base de l'API d'Ollama - MarIA24 (24GB VRAM) per models de visió
const OLLAMA_BASE_URL = process.env.CHAT_API_OLLAMA_URL || 'http://192.168.1.24:11434/api';
const DEFAULT_MODEL = process.env.CHAT_API_OLLAMA_MODEL || 'qwen2.5vl:7b';

class OllamaService {

    /**
     * Analitzar una imatge al servidor Ollama.
     * Utilitza l'endpoint /api/chat amb missatges que tenen imatges.
     *
     * @param {string} prompt - Text descriptiu sobre què fer amb la imatge
     * @param {string[]} images - Llista d'imatges en base64
     * @param {boolean} stream - Si la resposta ha de ser en streaming
     * @param {string} model - Model d'Ollama a utilitzar
     * @returns {object} - Resposta amb descripció, tags, temps i model
     */
    static async analyzeImage({ prompt, images, stream = false, model }) {
        const selectedModel = model || DEFAULT_MODEL;
        const startTime = Date.now();

        logger.info('Envian imatge a Ollama per analitzar', {
            model: selectedModel,
            prompt,
            numImages: images.length,
            stream
        });

        try {
            // Afegir instrucció per generar tags al final del prompt
            const enhancedPrompt = `${prompt}

            Al final del texte, afegeix una llista de 10 tags rellevants d'una sola paraula en català sobre el que apareix a l'imatge en el format [tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, ta10].`;

            // Ollama /api/chat accepta imatges dins dels missatges
            const response = await axios.post(`${OLLAMA_BASE_URL}/chat`, {
                model: selectedModel,
                stream,
                messages: [
                    {
                        role: 'user',
                        content: enhancedPrompt,
                        images: images.slice(0, 1) // El model nomes admet una imatge
                    }
                ]
            }, {
                timeout: 120000, // 2 minuts timeout
                headers: { 'Content-Type': 'application/json' }
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const content = response.data?.message?.content || '';

            logger.info('Resposta rebuda d\'Ollama', {
                model: selectedModel,
                processingTime: `${elapsed}s`,
                responseLength: content.length
            });

            // Extreure tags i netejar la descripció
            const { description, tags } = OllamaService.extractTagsFromResponse(content);

            return {
                description,
                tags,
                processing_time: `${elapsed}s`,
                model_used: selectedModel
            };

        } catch (error) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            logger.error('Error en la comunicació amb Ollama', {
                error: error.message,
                model: selectedModel,
                processingTime: `${elapsed}s`,
                status: error.response?.status,
                responseData: error.response?.data
            });

            throw new Error(
                error.response?.data?.error ||
                `Error connectant amb Ollama: ${error.message}`
            );
        }
    }

    /**
     * Extreure els tags amb format [tag1, tag2, tag3] al final de la resposta
     */
    static extractTagsFromResponse(text) {
        if (!text) return { description: '', tags: [] };

        // Buscar el patró [tag1, tag2, tag3, ...] al final del text
        let tagPattern = /\[([^\]]+)\]\s*$/;
        let match = text.match(tagPattern);

        // Si no troba claudators, buscar l'última línia amb comes
        if (!match) {
            const lines = text.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            
            // Si l'última línia té comes i no té punts, probablement són tags
            if (lastLine.includes(',') && !lastLine.includes('.')) {
                const tags = lastLine
                    .split(',')
                    .map(tag => tag.trim().toLowerCase())
                    .filter(tag => tag.length > 0 && tag.length < 20);
                
                if (tags.length >= 5) {
                    // Eliminar l'última línia de la descripció
                    const description = lines.slice(0, -1).join('\n').trim();
                    
                    logger.debug('Tags extrets sense claudators', { tags, descriptionLength: description.length });
                    return { description, tags: tags.slice(0, 10) };
                }
            }
            
            logger.warn('No s\'han trobat tags');
            return { description: text, tags: [] };
        }

        // Extreure els tags amb claudators
        const tagsString = match[1];
        const tags = tagsString
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        // Netejar la descripció eliminant els tags
        const description = text.replace(tagPattern, '').trim();

        logger.debug('Tags extrets', { tags, descriptionLength: description.length });

        return { description, tags };
    }
}

module.exports = OllamaService;
