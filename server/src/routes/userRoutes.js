const express = require('express');
const router = express.Router();
const { adminLogin, profileInfo, addUser, modifyUser, deleteUser, listUsers, userLogout, ping } = require('../controllers/userController');

/**
 * @swagger
 * /api/admin/usuaris/ping:
 *   get:
 *     summary: Comprovar que el servidor fa ping
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Servidor funcionant correctament
 */
router.get('/ping', ping);

/**
 * @swagger
 * /api/admin/usuaris/login:
 *   post:
 *     summary: Login d'administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login correcte
 *       401:
 *         description: Credencials invàlides
 *       400:
 *         description: Dades incompletes
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /api/admin/usuaris/logout:
 *   post:
 *     summary: Logout d'administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout correcte
 *       401:
 *         description: Token invàlid
 */
router.post('/logout', userLogout);

/**
 * @swagger
 * /api/admin/usuaris/perfil:
 *   get:
 *     summary: Obtenir informació del perfil d'administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informació del perfil
 *       401:
 *         description: Token invàlid
 */
router.get('/perfil', profileInfo);

/**
 * @swagger
 * /api/admin/usuaris/addUser:
 *   post:
 *     summary: Afegir un nou usuari (permisos admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: 123123123
 *     responses:
 *       201:
 *         description: Usuari creat correctament
 *       400:
 *         description: Dades invàlides
 *       401:
 *         description: No autenticat
 *       403:
 *         description: No és administrador
 */
router.post('/addUser', addUser);

/**
 * @swagger
 * /api/admin/usuaris/modifyUser:
 *   post:
 *     summary: Modificar un usuari existent (permisos admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuari modificat correctament
 *       404:
 *         description: Usuari no trobat
 *       401:
 *         description: No autenticat
 *       403:
 *         description: No és administrador
 */
router.post('/modifyUser', modifyUser);

/**
 * @swagger
 * /api/admin/usuaris/deleteUser:
 *   post:
 *     summary: Eliminar un usuari (permisos admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Usuari eliminat correctament
 *       404:
 *         description: Usuari no trobat
 *       401:
 *         description: No autenticat
 *       403:
 *         description: No és administrador
 */
router.post('/deleteUser', deleteUser);

/**
 * @swagger
 * /api/admin/usuaris/listUsers:
 *   get:
 *     summary: Llistar tots els usuaris (permisos admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llista d'usuaris
 *       401:
 *         description: No autenticat
 *       403:
 *         description: No és administrador
 */
router.get('/listUsers', listUsers);



module.exports = router;
