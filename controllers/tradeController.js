const tradeModel = require('../models/trade');
const watchModel = require('../models/watch');
const offerModel = require('../models/offer');
const userModel = require('../models/user');

exports.trades = (req, res, next) => {
    let categories = [];
    tradeModel.distinct("topic", function (err, topics) {
        categories = topics.sort(function (a, b) { // Sorting in ascending order of topics
            return a.localeCompare(b)
        });
        return categories;
    });
    tradeModel.find()
        .then(trades => {
            res.render('./trade/trades', { trades, categories });
        })
        .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./trade/new');
};

exports.create = (req, res, next) => {
    let newTrade = new tradeModel(req.body);
    newTrade.host = req.session.user;
    newTrade.save()
        .then(newTrade => {
            req.flash('success', 'You have successfully created the trade');
            res.redirect('/trades')
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                next(err);
            }
        });
};

exports.show = (req, res, next) => {
    let id = req.params.id;

    tradeModel.findById(id).populate('host', 'firstName lastName')
        .then(trade => {
            if (trade) {
                let hasWatch = false;
                let user = req.session.user;
                if (user) {
                    watchModel.findOne({ userWatch: user, tradeWatch: id })
                        .then(tradeItem => {
                            hasWatch = tradeItem ? true : false
                            return res.render('./trade/trade', { trade, hasWatch });
                        })
                        .catch(err => next(err));
                } else {
                    return res.render('./trade/trade', { trade, hasWatch });
                }
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;

    tradeModel.findById(id)
        .then(trade => {
            if (trade) {
                return res.render('./trade/edit', { trade });
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.update = (req, res, next) => {
    let id = req.params.id;
    let trade = req.body;

    tradeModel.findByIdAndUpdate(id, trade, { useFindAndModify: false, runValidators: true })
        .then(trade => {
            if (trade) {
                req.flash('success', 'trade has been successfully updated');
                res.redirect('/trades/' + id);
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                next(err);
            }
        });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;

    tradeModel.findByIdAndDelete(id, { useFindAndModify: false })
        .then(trade => {
            if (trade) {
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};

// trade poster
exports.trade = (req, res, next)=>{
    let posterRequested = {id: req.params.id };
    let id = req.session.user;
    Promise.all([userModel.findById(id), tradeModel.find({host: id, status: "Available"})]) 
    .then(results=>{
        const [user, trades] = results;
        res.render('./user/tradeOffer', {user, trades, posterRequested})
    })
    .catch(err=>next(err));
};

// make an offer
exports.offer = (req, res, next) => { 
    let posterOffer = new offerModel(req.body);
    posterOffer.posterRequestedId = req.params.id;
    posterOffer.posterOwnerId = req.session.user;
    posterOffer.save()
    .then(offer => {
        tradeModel.updateMany(
            {"_id":{$in: [posterOffer.posterTradeId, posterOffer.posterRequestedId]}}, 
            {status: "Pending", offerId: offer.id})
        .then(result => {
            req.flash('success', 'Offer to trade poster has been placed successfully!');
            return res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};

exports.withdrawOffer = (req, res) => {
    let id = req.session.user;
    let trade = req.params.id;
    tradeModel.findById(trade)
        .then(tradeItem => {
            tradeItem.status = 'Available';
            tradeItem.offerId = null;
            tradeModel.findByIdAndUpdate(trade, tradeItem, { useFindAndModify: false, runValidators: true })
                .then(index => {
                    offerModel.findOneAndDelete({ posterOwnerId: id, posterRequestedId: trade })
                        .then(result => {
                            req.flash('success', 'Offer has been withdrawn')
                            res.redirect('back');
                        })
                        .catch(err => next(err));
                })
        })
};

exports.manageOffer = (req, res, next) => {
    const posterOwnerId = req.session.user;
    let id = req.params.id;
    offerModel.findById(req.params.id)
        .then(offer => {
            if (offer) {
                tradeModel.find({ "_id": { $in: [offer.posterTradeId, offer.posterRequestedId] } })
                    .then(result => {
                        if (result && result.length === 2) {
                            const user = { isOfferStart: offer.posterOwnerId == posterOwnerId ? true : false };
                            let trade1, trade2 = null;
                            if (result[0].host == posterOwnerId) {
                                trade1 = result[0];
                                trade2 = result[1];
                            }
                            else {
                                trade1 = result[1];
                                trade2 = result[0];
                            }
                            res.render('./offer/manage', { user, trade1, trade2, offer });
                        }
                        else {
                            let err = new Error('Cannot find trade with id ' + id)
                            err.status = 404;
                            next(err);
                        }

                    })
            }
            else {
                let err = new Error('Cannot find offer related with this trade')
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err))
};
