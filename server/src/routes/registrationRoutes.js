const express = require('express');
const router = express.Router();
const { registerUser, validateUser } = require('../controllers/registrationController');

/**
 * @swagger
 * /api/usuaris/registrar:
 *   post:
 *     summary: Registrar un nou usuari i enviar SMS de verificació
 *     tags: [Usuaris]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *               - email
 *               - telefon
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: Nom d'usuari amb el qual serà identificat al sistema
 *                 example: SparkleFuzzMcGee
 *               email:
 *                 type: string
 *                 description: Adreça de correu electrònic de l'usuari
 *                 example: user@example.com
 *               telefon:
 *                 type: string
 *                 description: Número de telèfon de l'usuari (9 dígits, amb o sense prefixe +34)
 *                 example: "+34 600 000 000"
 *     responses:
 *       201:
 *         description: Usuari creat correctament, SMS enviat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: L'usuari s'ha creat correctament
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       example: SparkleFuzzMcGee
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: Dades invàlides o telèfon no vàlid
 *       409:
 *         description: Ja existeix un usuari amb aquest email o nickname
 */
// POST /api/usuaris/registrar - Registrar un nou usuari
router.post('/registrar', registerUser);

/**
 * @swagger
 * /api/usuaris/validar:
 *   post:
 *     summary: Validar un usuari amb el codi de verificació rebut per SMS
 *     tags: [Usuaris]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telefon
 *               - codi_validacio
 *             properties:
 *               telefon:
 *                 type: string
 *                 description: Número de telèfon de l'usuari (9 dígits, amb o sense prefixe +34)
 *                 example: "+34 600 000 000"
 *               codi_validacio:
 *                 type: integer
 *                 description: Codi de validació de 6 dígits rebut per SMS
 *                 example: 817921
 *     responses:
 *       200:
 *         description: Usuari validat correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Usuari validat correctament
 *                 data:
 *                   type: object
 *                   properties:
 *                     api_key:
 *                       type: string
 *                       description: Token d'autenticació per a l'usuari
 *                       example: ABCD1234EFGH5678IJKL
 *       400:
 *         description: Dades invàlides o telèfon no vàlid
 *       401:
 *         description: Codi de verificació incorrecte
 *       404:
 *         description: No s'ha trobat cap usuari amb aquest telèfon
 */
// POST /api/usuaris/validar - Validar un usuari amb codi SMS
router.post('/validar', validateUser);

module.exports = router;
