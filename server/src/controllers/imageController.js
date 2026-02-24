const OllamaService = require('../services/ollamaService');
const { Request, Tag, User } = require('../models/index');
const { logger } = require('../config/logger');
const { sequelize } = require('../config/database');

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
            const request = await Request.create({
                prompt,
                response: result.description,
                image: images[0],
                userId: req.user.id
            });

            // Guardar els tags associats a la request
            if (result.tags && result.tags.length > 0) {
                const tagPromises = result.tags.map(tag => 
                    Tag.create({
                        tag: tag,
                        requestId: request.id
                    })
                );
                await Promise.all(tagPromises);
                logger.debug('Tags guardats a la BD', {
                    requestId: request.id,
                    numTags: result.tags.length
                });
            }
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

/**
 * GET /api/getTags
 * Obtenir estadístiques dels tags
 */
const getTags = async (req, res, next) => {
    try {
        // Autenticar usuari amb token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Falta token'
            });
        }

        const user = await User.findOne({ where: { token } });
        if (!user) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Token invalido'
            });
        }
        if (!user.isAdmin) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Access Denied'
            });
        }

        logger.info('Obtenint estadístiques de tags', {
            adminId: user.id
        });

        // Obtenir el recompte de tags agrupats
        const tagStats = await Tag.findAll({
            attributes: [
                'tag',
                [sequelize.fn('COUNT', sequelize.col('tag')), 'count']
            ],
            group: ['tag'],
            order: [[sequelize.literal('count'), 'DESC']],
            raw: true
        });

        // aplicar el format a les stats
        const formattedStats = [];
        let totalTags = 0;
        for (let i = 0; i < tagStats.length; i++) {
            const stat = tagStats[i];
            const count = parseInt(stat.count);
            formattedStats.push({
                name: stat.tag,
                count: count
            });
            totalTags += count;
        }


        return res.status(200).json(formattedStats);

    } catch (error) {
        logger.error('Error obtenint estadístiques de tags', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    analyzeImage,
    getTags
};
