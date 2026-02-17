const OllamaService = require('../services/ollamaService');
const { Request } = require('../models/index');
const { logger } = require('../config/logger');

/**
 * POST /api/analitzar-imatge
 * Analitza una imatge enviant-la al servidor Ollama.
 */
const analyzeImage = async (req, res, next) => {
    try {
        const { prompt, images, stream, model } = req.body;

        // Validar camps obligatoris
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El camp "prompt" és obligatori',
                data: null
            });
        }

        // si no hi han imatges, no es un array o l'array esta buit, retornem error
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El camp "images" és obligatori i ha de contenir almenys una imatge en base64',
                data: null
            });
        }

        logger.info("Petició d'anàlisi d'imatge rebuda", {
            userId: req.user.id,
            prompt,
            numImages: images.length,
            model: model || 'default',
            stream: !!stream
        });

        // Enviar la imatge a Ollama
        const result = await OllamaService.analyzeImage({
            prompt,
            images,
            stream: stream || false,
            model
        });

        // guardar la request a la base de dades
        try {
            await Request.create({
                prompt,
                response: result.description,
                image: images[0],
                userId: req.user.id
            });
        } catch (dbError) {
            // No fallar la resposta si falla el guardat a BD
            logger.warn('No s\'ha pogut guardar la request a la BD', {
                error: dbError.message
            });
        }

        return res.status(200).json({
            status: 'OK',
            message: 'Imatges processades correctament',
            data: result
        });

    } catch (error) {
        logger.error('Error analitzant imatge', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id
        });

        return res.status(500).json({
            status: 'ERROR',
            message: error.message || 'Error processant la imatge',
            data: null
        });
    }
};



module.exports = {
    analyzeImage
};
