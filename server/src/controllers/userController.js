const UserService = require('../services/userService');
const { validateUUID } = require('../middleware/validators');
const { logger } = require('../config/logger');

// Procesar el login del usuario
const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        logger.info('Login attempt:', { 
            email,
            hasPassword: !!password 
        });

        if (!email || !password) {
            logger.warn('Datos de login incompletos');
            return res.status(400).json({
                status: 'ERROR',
                message: 'Email y password son obligatorios',
                data: { token: '' }
            });
        }

        const user = await UserService.validateLogin(email, password);

        if (!user) {
            return res.status(401).json(
                { 
                    status: 'ERROR',
                    message: 'Invalid Credentials',
                    data: { token: '' }
                }
            );
        }

        res.status(200).json(
            { 
                status: 'ok',
                message: 'Login Successful',
                data: {
                    token: user.token
                }
             }
        );
    } catch (error) {
        logger.error('Error durante el login', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};


// información del usuario a partir del token
const profileInfo = async (req, res) => {
    try {
        // obtener bearer token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: 'ERROR', message: 'Falta token' });
        }

        // buscar el usuario del token
        const user = await User.findOne({ where: { token } });
        if (!user) {
            return res.status(401).json({ status: 'ERROR', message: 'Token invalido' });
        }

        return res.status(200).json({
            status: 'OK',
            data: {
                nickname: user.username || '',
                email: user.email || '',
                telefon: user.phone || ''
            }
        });

    }
    catch (error) {
        logger.error('Error obteniendo información de perfil', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ping pa testear
const ping = async (req, res) => {
    res.status(200).json({ message: 'Pong' });
};


module.exports = {
    userLogin,
    profileInfo,
    ping
};
