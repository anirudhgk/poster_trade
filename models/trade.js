const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    name: {type: String, required: [true, 'Title is required']},
    topic: {type: String, required: [true, 'Topic is required']},
    details: {type: String, required: [true, 'Detail is required'], 
              minLength: [10, 'The detail should have at least 10 characters']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, required: [true, 'Status is required']},
    image: {type: String, required: [true, 'Image is required']},
    offerId: {type: Schema.Types.ObjectId, ref: 'Offer'}
},
{timestamps: true}
);

module.exports = mongoose.model('Trade', tradeSchema);
