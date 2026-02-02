const crypto = require('crypto');

const { User } = require('../models/index');
const { logger } = require('../config/logger');

// clase para manejar la lógica de usuarios
class UserService {

    static generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    static async createUser(userData) {
        try {
            const user = await User.create(userData);
            logger.info(`Usuario creado: ${user.id}`);

            return user;
        } catch (error) {
            logger.error('Error al crear usuario:', error);
            throw error;
        }
    }
}
