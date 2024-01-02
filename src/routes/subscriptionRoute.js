import express from 'express';
import { createSub, getSubs, getSubById,  updateSub, updateSubStatus, } from '../controllers/subscribtion/subscription.js';
import { verifyToken, uploaded, isAdmin } from '../middleware';

const subRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: MOVIE API
 */

/**
 * @swagger
 * 
 * components:
 *   securitySchemes:
 *      bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: string
 *         subscriptionType:
 *           type: string
 *           enum: ['Basic', 'Premium', 'Gold', 'Diamond']
 *         duration:
 *           type: string
 *           enum: ['3 months', '6 months', '1 year', '2 years', '10 years']
 *         userNumber:
 *           type: string
 *           
 *       required:
    *         - name
 */


/**
 * @swagger
 * /sub/create:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               subscriptionType:
 *                 type: string
 *                 enum: ['Basic', 'Premium', 'Gold', 'Diamond']
 *               duration:
 *                 type: string
 *                 enum: ['3 months', '6 months', '1 year', '2 years', '10 years']
 *               userNumber:
 *                 type: string
 *                 enum: ['no Other number allowed', '0784600762']
 *                 
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */

subRouter.post('/create', uploaded, createSub);


/**
 * @swagger
 * /sub/all:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Subscriptions]
 *     description: Retrieve a list of all subscriptions.
 *     responses:
 *       200:
 *         description: Success
 */

subRouter.get('/all', getSubs);

/**
 * @swagger
 * /sub/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscriptions]
 *     description: Retrieve a subscription by its unique identifier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the subscription
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 */

subRouter.get('/:id', getSubById);

/**
 * @swagger
 * /sub/update/{id}:
 *   put:
 *     summary: Update a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the subscription to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               subscriptionType:
 *                 type: string
 *                 enum: ['Basic', 'Premium', 'Gold', 'Diamond']
 *               subscriptionDuration:
 *                 type: string
 *                 enum: ['3 months', '6 months', '1 year', '2 years', '10 years']
 *               subscriptionPaymentMethod:
 *                 type: string
 *                 enum: ['Cash', 'Card', 'Cheque']
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       404:
 *         description: Subscription not found
 */

subRouter.put('/update/:id', uploaded, updateSub);

/**
 * @swagger
 * /sub/updateStatus/{id}:
 *   put:
 *     summary: Update subscription status
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the subscription to update status
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionStatus:
 *                 type: string
 *                 enum: ['Pending', 'Approved', 'Rejected']
 *               subscriptionPaymentStatus:
 *                 type: string
 *                 enum: ['Pending', 'Approved', 'Rejected']
 *     responses:
 *       200:
 *         description: Subscription status updated successfully
 *       404:
 *         description: Subscription not found
 */

subRouter.put('/updateStatus/:id', uploaded, updateSubStatus);

export default subRouter;