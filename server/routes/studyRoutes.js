const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const auth = require('../middleware/auth');

router.post('/', auth, studyController.createActivity);
router.get('/', auth, studyController.getActivities);
router.put('/:id', auth, studyController.updateActivityStatus);
router.delete('/:id', auth, studyController.deleteActivity);

module.exports = router;