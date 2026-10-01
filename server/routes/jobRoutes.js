const express = require('express');

const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} = require('../controllers/jobController');

const {
    protect,
    recruiterOnly
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, recruiterOnly);

router.post('/', createJob);

router.get('/', getJobs);

router.get('/:id', getJobById);

router.put('/:id', updateJob);

router.delete('/:id', deleteJob);

module.exports = router;