const axios = require('axios');
const crypto = require('crypto');
const { User } = require('../models/index');
const { logger } = require('../config/logger');

/**
 * Generar un codi de verificació de 6 dígits
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Enviar SMS amb el codi de verificació
 */
const sendSMS = async (phone, code) => {
    const smsUrl = process.env.SMS_API_URL;
    const apiToken = process.env.SMS_API_TOKEN;
    const username = process.env.SMS_API_USERNAME;
    const text = `Aquest es el teu codi de verificació: ${code}`;

    logger.info('Enviant SMS de verificació', { phone, smsUrl, username });


    const response = await axios.get(smsUrl, {
        params: {
            api_token: apiToken,
            username: username,
            text: text,
            receiver: phone
        },
        timeout: 10000
    });

    logger.info('SMS enviat correctament', { phone, status: response.status });
    return response;
};


/**
 * Aseguarse que el telefono tiene 9 digitos
 */
const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-9);
    return cleanPhone.length === 9 ? cleanPhone : null;
};


/**
 * POST /api/usuaris/registrar
 * Registrar un nou usuari
 */
const registerUser = async (req, res, next) => {
    try {

        const { nickname, email, telefon } = req.body;

        // Validar camps obligatoris
        if (!nickname || !email || !telefon) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan parámetros',
                data: null
            });
        }


        // Vlidar telèfon (9 dígits)
        const cleanPhone = validatePhone(telefon);
        if (!cleanPhone) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El telèfon ha de ser de 9 dígits',
                data: null
            });
        }

        // Si existeix un usuari amb aquest telèfon, l'eliminem
        const existingPhone = await User.findOne({
            where: { phone: cleanPhone }
        });
        if (existingPhone) {
            await existingPhone.destroy();
            logger.info('Usuari existent eliminat per un nou registre', {
                userId: existingPhone.id,
                phone: cleanPhone
            });
        }

        // Comprovem que no existeix un usuari amb el email
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                status: 'ERROR',
                message: 'Ja existeix un usuari amb aquest email',
                data: null
            });
        }


        // Comproevm que no existeix un usuari amb el nickname
        const existingUsername = await User.findOne({
            where: { username: nickname }
        });

        if (existingUsername) {
            return res.status(409).json({
                status: 'ERROR',
                message: 'Ja existeix un usuari amb aquest nickname',
                data: null
            });
        }


        // Generar codi de verificació de 6 dígits
        const verificationCode = generateVerificationCode();

        // Crear l'usuari a la BD amb el codi de verificació
        const user = await User.create({
            username: nickname,
            email,
            password: "password", // como no hay login ni pide pass, pues hardcodeada
            phone: cleanPhone,
            verificationCode
        });

        logger.info('Usuari registrat, enviant SMS de verificació', {
            userId: user.id,
            phone: cleanPhone
        });



        // Enviar SMS amb el codi
        try {
            await sendSMS(cleanPhone, verificationCode);
        } catch (smsError) {
            logger.warn('No s\'ha pogut enviar el SMS de verificació', {
                error: smsError.message,
                phone: cleanPhone,
                stack: smsError.stack
            });
        }


        return res.status(200).json({
            status: 'OK',
            message: 'L\'usuari s\'ha creat correctament',
            data: {
                nickname: user.username,
                email: user.email
            }
        });

    } catch (error) {
        logger.error('Error registrant usuari', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

/**
 * POST /api/usuaris/validar
 * Validar l'usuari amb el codi de verificació i retornar api_key
 */
const validateUser = async (req, res, next) => {
    try {
        const { telefon, codi_validacio } = req.body;

        // Validar camps obligatoris
        if (!telefon || !codi_validacio) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan parámetros',
                data: null
            });
        }

        // Validar telefon (9 dígits)
        const cleanPhone = validatePhone(telefon);
        if (!cleanPhone) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El telefon ha de tindre 9 dígits',
                data: null
            });
        }

        // Buscar l'usuari pel telefon
        const user = await User.findOne({ where: { phone: cleanPhone } });
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'No s\'ha trobat cap usuari amb aquest telèfon',
                data: null
            });
        }

        // convertim els codis a string per validar correctament
        const dbCode = String(user.verificationCode || '');
        const inputCode = String(codi_validacio || '');

        logger.info('Validant codi de verificació', {
            userId: user.id,
            phone: cleanPhone,
            dbCode,
            inputCode,
            dbCodeLength: dbCode.length,
            inputCodeLength: inputCode.length,
            match: dbCode === inputCode
        });

        // Comprovar el codi de verificació
        if (dbCode !== inputCode) {
            logger.warn('Codi de verificació incorrecte', {
                userId: user.id,
                expected: dbCode,
                received: inputCode
            });


            return res.status(401).json({
                status: 'ERROR',
                message: 'Codi de verificació incorrecte',
                data: null
            });
        }


        // Generar token (api_key) i netejar el codi de verificació
        const token = crypto.randomBytes(32).toString('hex');
        await user.update({
            token,
            verificationCode: null
        });

        logger.info('Usuari validat correctament', {
            userId: user.id
        });


        return res.status(200).json({
            status: 'OK',
            message: 'Usuari validat correctament',
            data: {
                api_key: token
            }
        });

    } catch (error) {
        logger.error('Error validant usuari', {
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    registerUser,
    validateUser
};
