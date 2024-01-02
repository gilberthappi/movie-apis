import express from 'express';
import userRouter from './authRoute';
import subRouter from './subscriptionRoute';


const mainRouter = express.Router();

mainRouter.use('/user', userRouter);
mainRouter.use('/sub', subRouter);


export  default mainRouter;
