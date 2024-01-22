import express from 'express';
import {
  signup,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteClientById,
  verifyClientAndCompleteProfile,
  getAllClients,
  updateUser,
  getClientById,
} from '../controllers/authantecation/userAuth.js';
import { verifyToken, uploaded, isAdmin } from '../middleware/index.js';

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentications
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
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           required: true
 *           unique: true
 *         name:
 *           type: string
 *         password:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           default: 'user'
 *         confirmPassword:
 *           type: string
 *         photo:
 *                 type: file
 *                 items: 
 *                   type: String
 *                   format: binary
 *         documents:
 *                 type: file
 *                 items:
 *                   type: String
 *                   format: binary
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 */


/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Client Signup
 *     tags: [Authentications]
 *     description: Register a new Client user.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                type: string
 *                enum: ['individual', 'organization', 'author']
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *               
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - userType
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request - Invalid data
 *       409:
 *         description: Conflict - User already exists
 */
userRouter.post('/signup', uploaded, signup);


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: user Login
 *     tags: [Authentications]
 *     description: Authenticate a user and obtain an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User authenticated, access token obtained
 *       401:
 *         description: Unauthorized - Invalid credentials
 */

userRouter.post('/login', uploaded, login);

/**
 * @swagger
 * /user/changePassword:
 *   post:
 *     summary: user change Password
 *     tags: [Authentications]
 *     description: Change the password of an authenticated Client.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       400:
 *         description: Bad Request - Invalid data
 */

userRouter.post('/changePassword',uploaded, changePassword);

/**
 * @swagger
 * /user/forgotPassword:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentications]
 *     description: Initiate the process to reset the user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset link sent to the registered email address
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

  userRouter.post('/forgotPassword',uploaded, forgotPassword); 

/**
 * @swagger
 * /user/resetPassword:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentications]
 *     description: Reset the user's password using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successful
 *       401:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Internal Server Error
 */

userRouter.post('/resetPassword',uploaded, resetPassword);


  /**
 * @swagger
 * /user/verifyProfile:
 *   post:
 *     summary: user verifyProfile
 *     tags: [Authentications]
 *     description: user verifyProfile
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
 *                type: string
 *               phone: 
 *                type: string
 *               photo:
 *                 type: file
 *                 items: 
 *                   type: String
 *                   format: binary
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               sector:
 *                 type: string
 *               cell:
 *                 type: string
 *               nationalID:
 *                 type: string
 *               documents:
 *                 type: file
 *                 items: 
 *                   type: String
 *                   format: binary

 *     responses:
 *       201:
 *         description: verified successfully
 *       400:
 *         description: Bad Request - Invalid data
 *       409:
 *         description: Conflict - verifyProfile already exists
 */

  userRouter.post('/verifyProfile',uploaded, verifyClientAndCompleteProfile);


/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Delete a Client by ID
 *     tags: [Authentications]
 *     description: Delete a Client by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 */


  userRouter.delete('/delete/:id', deleteClientById);
/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Get all users
 *     tags: [Authentications]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               fullNames:
 *                 type: string
 *               location:
 *                 type: string
 */

userRouter.get('/all', getAllClients);
// ... (other routes)


 /**
 * @swagger
 * /user/edit/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Authentications]
 *     description: Edit user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User is edited successfully
 *       400:
 *         description: Bad Request - Invalid data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */


userRouter.put('/edit/:id',uploaded,updateUser);


/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a Client by ID
 *     tags: [Authentications]
 *     description: Get a Client by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Client ID
 *     responses:
 *       200:
 *         description: Client found successfully
 *       404:
 *         description: Client not found
 */


userRouter.get('/:id',uploaded, getClientById);

export default userRouter;
