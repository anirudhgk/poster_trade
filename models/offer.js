const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const offerSchema = new Schema({
    posterOwnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    posterTradeId:{ type: Schema.Types.ObjectId, ref: 'Trade' },
    posterRequestedId:{ type: Schema.Types.ObjectId, ref: 'Trade' },
},
    { timestamps: true }
);
module.exports = mongoose.model('Offer', offerSchema);
