const { User } = require('../models/index');
const { logger } = require('../config/logger');

/**
 * Middleware per autenticar el bearer token.
 */
const authToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            logger.warn('Petició sense token d\'autenticació', {
                url: req.url,
                ip: req.ip
            });
            return res.status(401).json({
                status: 'ERROR',
                message: 'Token d\'autenticació requerit',
                data: null
            });
        }

        const user = await User.findOne({ where: { token } });

        if (!user) {
            logger.warn('Token invàlid', { ip: req.ip });
            return res.status(401).json({
                status: 'ERROR',
                message: 'API_KEY invàlida',
                data: null
            });
        }


        // adjuntar usuari a la petició per utilitzar-ho als controllers
        req.user = user;
        next();

    } catch (error) {
        logger.error('Error en autenticació', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error intern d\'autenticació',
            data: null
        });
    }
};

module.exports = { authToken };
