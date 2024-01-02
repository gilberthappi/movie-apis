import mongoose from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2');

const subscriptionSchema = new mongoose.Schema({
  // name, description, price, duration, userNumber 
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
        maxlength: 2000,
    },
    price: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    userNumber: {
      type: String,
      required: true,  
    },
    subscriptionDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    subscriptionType: {
        type: String,
        enum: ['Basic', 'Premium', 'Gold', 'Diamond'],
        required: true,
    },
     });
    
    subscriptionSchema.plugin(mongoosePaginate);
    export const Subscription = mongoose.model('subscription', subscriptionSchema);