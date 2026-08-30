const express = require('express');
const router = express.Router();

// Used by Kubernetes readiness/liveness probes later
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;