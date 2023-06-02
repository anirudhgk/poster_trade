const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const watchSchema = new Schema({
    userWatch: { type: Schema.Types.ObjectId, ref: 'User' },
    tradeWatch: { type: Schema.Types.ObjectId, ref: 'Trade' },
},
    { timestamps: true }
);

module.exports = mongoose.model('Watch', watchSchema);
