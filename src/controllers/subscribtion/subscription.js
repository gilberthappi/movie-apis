import {Subscription} from '../../models';
const PaypackJs = require("paypack-js").default;
require('dotenv').config();

const paypack = PaypackJs.config({ 
  client_id: process.env.clientId, 
  client_secret: process.env.clientSecret,
});


export const createSub = async (req, res) => {
  try {
    const { name, description, price, duration, subscriptionType,userNumber } = req.body;
    
    const newSubscription = new Subscription({
      name,
      description,
      price,
      duration,
      userNumber,
      subscriptionType,
    });

    // Save the subscription to the database
    const savedSubscription = await newSubscription.save();

    // Process payment using Paypack-js
    paypack.cashin({
      amount: price,
      number: userNumber,
      environment: "production",
    })
    .then((paymentResponse) => {
      console.log('Payment successful:', paymentResponse.data);

      // Optionally, you can update the subscription status or store payment details

      res.status(201).json({
        subscription: savedSubscription,
        payment: paymentResponse.data,
      });
    })
    .catch((paymentError) => {
      console.error('Payment failed:', paymentError);
      res.status(500).json({ error: 'Payment failed' });
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Route to get all subscriptions
export const getSubs = async (req, res) => {
    try {
        // Pagination and sorting options
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: { subscriptionDate: -1 } // Sort by subscriptionDate in descending order
        };

        // Fetch subscriptions from the database with pagination and sorting
        const subscriptions = await Subscription.paginate({}, options);

        // Respond with paginated subscriptions
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Route to get a subscription by id
export const getSubById = async (req, res) => {
    try {
        // Extract subscription id from the request params
        const { id } = req.params;

        // Fetch subscription from database
        const subscription = await Subscription.findById(id);

        // Respond with subscription
        res.status(200).json(subscription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Route to update a subscription 
export const updateSub = async (req, res) => {
    try {
        // Extract subscription id from the request params
        const { id } = req.params;

        // Fetch subscription from database
        const subscription = await Subscription.findById(id);
  
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        // Extract fields to update from the request body
        const {
            name,
            email,
            phone,
            subscriptionType,
            subscriptionDuration,
            subscriptionPaymentMethod,
        } = req.body;

        // Calculate subscription amount based on type and duration (you may need more complex logic)
        const subscriptionAmount = calculateSubscriptionAmount(subscriptionType, subscriptionDuration);

        // Set subscription date to the current time
        const subscriptionDate = new Date();

        // Set initial payment status based on whether the user has chosen a payment method
        const subscriptionPaymentStatus = subscriptionPaymentMethod ? 'Pending' : 'Not Applicable';

        // Set initial payment date based on whether the user has paid
        const subscriptionPaymentDate = subscriptionPaymentStatus === 'Pending' ? null : subscriptionDate;

        // Update the subscription
        const updatedSubscription = await Subscription.findByIdAndUpdate(id, {
            name,
            email,
            phone,
            subscriptionType,
            subscriptionDuration,
            subscriptionAmount,
            subscriptionDate,
            subscriptionPaymentMethod,
            subscriptionPaymentStatus,
            subscriptionPaymentDate,
        }, { new: true });

        // Respond with updated subscription
        res.status(200).json(updatedSubscription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateSubStatus = async (req, res) => {
    try {
        // Extract subscription id from the request params
        const { id } = req.params;

        // Fetch subscription from database
        const subscription = await Subscription.findById(id);
  
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        // Extract fields to update from the request body
        const {
            subscriptionStatus,
            subscriptionPaymentStatus,
        } = req.body;

        // Update the subscription
        const updatedSubscription = await Subscription.findByIdAndUpdate(id, {
            subscriptionStatus,
            subscriptionPaymentStatus,
        }, { new: true });

        // Respond with updated subscription
        res.status(200).json(updatedSubscription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


