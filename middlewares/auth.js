const Trade = require('../models/trade');
const Offer = require('../models/offer');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};

//check if user is host of the trade
exports.isHost = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
        .then(trade => {
            if (trade) {
                if (trade.host == req.session.user) {
                    return next();
                } else {
                    req.flash('error', 'Unauthorized to access the resource');
                    return res.redirect('/users/profile');
                    // let err = new Error('Unauthorized to access the resource');
                    // err.status = 401;
                    // return next(err);
                }
            } else {
                let err = new Error('Cannot find a connection with id ' + req.params.id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};

exports.isNotHost = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
        .then(trade => {
            if (trade) {
                if (trade.host != req.session.user) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return res.redirect('/users/profile');
                }
            } else {
                let err = new Error('Cannot find a connection with id ' + req.params.id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};
