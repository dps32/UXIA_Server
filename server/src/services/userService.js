const crypto = require('crypto');

const { User } = require('../models/index');
const { logger } = require('../config/logger');

// clase para manejar la lógica de usuarios
class UserService {

    // generar un token
    static generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // validar login y devolver token
    static async validateLogin(email, password) {
        logger.info('validateLogin called with:', { 
            email, 
            hasPassword: !!password 
        });

        if (!email || !password) {
            logger.warn('datos incompletos');
            return null;
        }

        const user = await User.findOne({ where: { email, password } });

        if (!user) {
            logger.warn(`usuario no encontrado (${email})`);
            return null;
        }

        // Generar y guardar el token
        const token = this.generateToken();
        await user.update({ token });

        logger.info(`usuario logueado: ${user.id}`);
        return { ...user.toJSON(), token };
    }
}


module.exports = {
    UserService
};
