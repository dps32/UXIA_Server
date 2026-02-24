const { UserService } = require('../services/userService');
const { User } = require('../models/index');
const { validateUUID } = require('../middleware/validators');
const { logger } = require('../config/logger');

// comprobar auth de admin
const authenticateAdmin = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return { status: 401, response: { status: 'ERROR', message: 'Falta token' } };
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
        return { status: 401, response: { status: 'ERROR', message: 'Token invalido' } };
    }
    if (!user.isAdmin) {
        return { status: 403, response: { status: 'ERROR', message: 'Access Denied' } };
    }
    return { status: 200, user };
};
const adminLogin = async (req, res, next) => {
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

        if (!user.isAdmin) {
            logger.warn(`Intento de login no autorizado para usuario (${email})`);
            return res.status(403).json({
                status: 'ERROR',
                message: 'Access Denied',
                data: { token: '' }
            });
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

// crear un nuevo usuario
const addUser = async (req, res, next) => {
    try {
        const auth = await authenticateAdmin(req, res);

        if (auth.status !== 200) {
            return res.status(auth.status).json(auth.response);
        }

        const { username, email, password, phone } = req.body;

        if (!username || !email || !password) {
            logger.warn('Datos de registro incompletos');
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan parámetros'
            });
        }

        await UserService.addUser(username, email, password, phone);

        res.status(200).json({
            status: 'OK',
            message: 'Usuario creado'
        });
    } catch (error) {
        logger.error('Error creando usuario', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// modificar un usuario existente
const modifyUser = async (req, res, next) => {
    try {
        const auth = await authenticateAdmin(req, res);

        if (auth.status !== 200) {
            return res.status(auth.status).json(auth.response);
        }

        const { id, username, email, password, phone, removeToken } = req.body;
        
        if (!id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan parámetros'
            });
        }

        const user = await UserService.modifyUser(id, { username, email, password, phone, removeToken });
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            status: 'OK',
            message: 'Usuario modificado'
        });
    } catch (error) {
        logger.error('Error modificando usuario', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// eliminar un usuario
const deleteUser = async (req, res, next) => {
    try {
        const auth = await authenticateAdmin(req, res);

        if (auth.status !== 200) {
            return res.status(auth.status).json(auth.response);
        }

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan parámetros'
            });
        }
        const result = await UserService.deleteUser(id);
        if (!result) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            status: 'OK',
            message: 'Usuario eliminado'
        });
    } catch (error) {
        logger.error('Error eliminando usuario', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// listar todos los usuarios
const listUsers = async (req, res, next) => {
    try {
        const auth = await authenticateAdmin(req, res);

        if (auth.status !== 200) {
            return res.status(auth.status).json(auth.response);
        }

        const users = await UserService.listUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error listando usuarios', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// cerrar sesión del usuario
const userLogout = async (req, res, next) => {
    try {
        // obtener bearer token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Falta token'
            });
        }

        const result = await UserService.logout(token);

        if (!result) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Token invalido'
            });
        }

        res.status(200).json({
            status: 'OK',
            message: 'Logout exitoso'
        });
    } catch (error) {
        logger.error('Error durante el logout', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// ping pa testear
const ping = async (req, res) => {
    res.status(200).json({ message: 'Pong' });
};

module.exports = {
    adminLogin,
    profileInfo,
    addUser,
    modifyUser,
    deleteUser,
    listUsers,
    userLogout,
    ping
};
