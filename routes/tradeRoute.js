const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const { isLoggedIn, isHost, isNotHost } = require('../middlewares/auth');
const { validateId, validateTrade, validateStatus, validateResult } = require('../middlewares/validator');


router.get('/', controller.trades);

router.get('/new', isLoggedIn, controller.new);

router.post('/', isLoggedIn, validateTrade, validateStatus, validateResult, controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

router.put('/:id', validateId, isLoggedIn, isHost, validateTrade, validateStatus, validateResult, controller.update);

router.delete('/:id', validateId, isLoggedIn, isHost, controller.delete);

router.get('/:id/trade', validateId, isLoggedIn, isNotHost, controller.trade);

router.put('/:id/offer', validateId, isLoggedIn, isNotHost, controller.offer);

router.post('/:id/withdraw', validateId, isLoggedIn, controller.withdrawOffer);

router.get('/:id/manage', validateId, isLoggedIn, controller.manageOffer);

module.exports = router;
