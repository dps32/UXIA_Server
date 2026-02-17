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

    // crear un nuevo usuario
    static async addUser(username, email, password, phone) {
        const user = await User.create({ username, email, password, phone });
        logger.info(`usuario creado: ${user.id}`);
        return user;
    }

    // modificar un usuario existente
    static async modifyUser(id, data) {
        const user = await User.findByPk(id);
        if (!user) {
            logger.warn(`usuario no encontrado (${id})`);
            return null;
        }

        const updateFields = {};
        if (data.username !== undefined) updateFields.username = data.username;
        if (data.email !== undefined) updateFields.email = data.email;
        if (data.password !== undefined) updateFields.password = data.password;
        if (data.phone !== undefined) updateFields.phone = data.phone;
        if (data.removeToken) updateFields.token = null;

        await user.update(updateFields);
        logger.info(`usuario modificado: ${id}`);
        return user;
    }

    // eliminar un usuario
    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            logger.warn(`usuario no encontrado (${id})`);
            return null;
        }

        await user.destroy();
        logger.info(`usuario eliminado: ${id}`);
        return true;
    }

    // listar todos los usuarios
    static async listUsers() {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'phone']
        });
        logger.info(`listando ${users.length} usuarios`);
        return users;
    }

    // cerrar sesión (borrar token)
    static async logout(token) {
        const user = await User.findOne({ where: { token } });
        if (!user) {
            logger.warn(`token no encontrado para logout`);
            return null;
        }

        await user.update({ token: null });
        logger.info(`usuario deslogueado: ${user.id}`);
        return true;
    }
}


module.exports = {
    UserService
};
