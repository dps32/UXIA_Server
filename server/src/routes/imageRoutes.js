const express = require('express');
const router = express.Router();
const { analyzeImage, getTags } = require('../controllers/imageController');
const { authToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/analitzar-imatge:
 *   post:
 *     summary: Analitzar una imatge amb IA (Ollama)
 *     tags: [Imatges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - images
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Text que demana una acció sobre la imatge
 *                 example: Descriu aquesta imatge
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Llista d'imatges en base64 (el model només admet una imatge)
 *               stream:
 *                 type: boolean
 *                 description: Si la resposta ha de ser en streaming
 *                 default: false
 *               model:
 *                 type: string
 *                 description: Model d'Ollama a utilitzar
 *                 default: qwen2.5vl:7b
 *     responses:
 *       200:
 *         description: Imatge processada correctament
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
 *                   example: Imatges processades correctament
 *                 data:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     processing_time:
 *                       type: string
 *                     model_used:
 *                       type: string
 *       400:
 *         description: Dades invàlides
 *       401:
 *         description: Token d'autenticació invàlid
 *       500:
 *         description: Error processant la imatge
 */
router.post('/analitzar-imatge', authToken, analyzeImage);

/**
 * @swagger
 * /api/getTags:
 *   get:
 *     summary: Obtenir estadístiques dels tags generats en els anàlisis d'imatges
 *     tags: [Imatges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadístiques de tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Nom del tag
 *                     example: cotxe
 *                   count:
 *                     type: integer
 *                     description: Nombre de vegades que s'ha utilitzat el tag
 *                     example: 15
 *       401:
 *         description: No autenticat o no és administrador
 *       403:
 *         description: Access Denied
 */
router.get('/getTags', getTags);

module.exports = router;
