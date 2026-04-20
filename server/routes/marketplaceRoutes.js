const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');

// Child routes
router.get('/items', auth, marketplaceController.getMarketplace);
router.get('/purchases', auth, marketplaceController.getPurchases);
router.post('/purchase', auth, marketplaceController.purchaseItem);

// Parent routes
router.get('/parent/items', auth, marketplaceController.getMyRewardItems);
router.post('/parent/items', auth, marketplaceController.createRewardItem);
router.put('/parent/items/:itemId', auth, marketplaceController.updateRewardItem);
router.delete('/parent/items/:itemId', auth, marketplaceController.deleteRewardItem);
router.get('/parent/purchases', auth, marketplaceController.getAllPurchases);
router.put('/parent/purchases/:purchaseId', auth, marketplaceController.updatePurchaseStatus);

module.exports = router;