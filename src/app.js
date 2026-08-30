const express = require('express');
const healthRouter = require('./routes/health');
const resourcesRouter = require('./routes/resources');

const app = express();
app.use(express.json());

// These come from the Kubernetes ConfigMap later — env vars for now
const SITE_NAME = process.env.SITE_NAME || 'Deejoft LMS';
const MAX_UPLOAD_SIZE_MB = process.env.MAX_UPLOAD_SIZE_MB || '10';

app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${SITE_NAME}`,
    maxUploadSizeMb: MAX_UPLOAD_SIZE_MB
  });
});

app.use(healthRouter);
app.use(resourcesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${SITE_NAME} listening on port ${PORT}`);
});