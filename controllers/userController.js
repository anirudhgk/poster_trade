const model = require('../models/user');
const Trade = require('../models/trade');
const Watch = require('../models/watch');
const Offer = require('../models/offer');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.create = (req, res, next) => {
    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    if (user.email) {
        user.email = user.email.toLowerCase();
    }
    user.save()//insert the document to the database
        .then(user => {
            req.flash('success', 'You have registered successfully');
            res.redirect('/users/login')
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                // return res.redirect('/users/new');
                return res.redirect('back');
            }

            if (err.code === 11000) {
                req.flash('error', 'Email has been used');
                // return res.redirect('/users/new');
                return res.redirect('back');
            }

            next(err);
        });
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next) => {

    let email = req.body.email;
    if (email) {
        email = email.toLowerCase();
    }
    let password = req.body.password;
    model.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('wrong email address');
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            // req.session.firstName = user.firstName;
                            // req.session.lastName = user.lastName;
                            req.flash('success', 'You have successfully logged in ' + user.firstName);
                            res.redirect('/users/profile');
                        } else {
                            req.flash('error', 'wrong password');
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([model.findById(id), Trade.find({ host: id }), Offer.find({posterOwnerId: id }).populate('posterRequestedId'), Watch.find({ userWatch: id }).populate('tradeWatch')])
        .then(results => {
            const [user, trades, offers, watchlist] = results;
            console.log(offers);
            res.render('./user/profile', { user, trades, offers, watchlist });
        })
        .catch(err => next(err));
};

exports.watch = (req, res, next) => {
    let id = req.session.user;
    let trade = req.params.id;
    Watch.findOne({ watchedByUser: id, tradeWatch: trade }) // filter out 
        .then(result => {
            if (!result) {
                let watch = new Watch({ userWatch: id, tradeWatch: trade });
                watch.save()
                    .then((results) => {
                        req.flash('success', 'This trade has been added to the watch')
                        res.redirect(`/trades/${trade}`);
                    })
                    .catch(err => {
                        next(err);
                    });
            } else {
                req.flash('success', 'You have already added this trade to the watch')
                res.redirect(`/trades/${trade}`);
            }
        })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back')
        }
        next(err);
    });
};

exports.unwatch = (req, res) => {
    console.log(req)
    let id = req.session.user;
    let trade = req.params.id;
    Watch.findOneAndDelete({ userWatch: id, tradeWatch: trade })
        .then(result => {
            req.flash('success', 'Trade removed from watchlist')
            res.redirect('back');
        })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
    })
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return next(err);
        }
        else {
            res.redirect('/');
        }
    });
};
