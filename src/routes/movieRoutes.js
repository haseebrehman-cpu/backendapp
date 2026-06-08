import express from 'express';

const router = express.Router();

router.get('/all', (req, res) => {
  return res.status(200).json({
    message: 'Movies',
    status: 'success',
    code: 200,
  });
});

export default router;