import { createApp } from '@app/createApp';
import { logger } from '@app/lib/logger';

const port = process.env.PORT || 3000;

const app = createApp();

app.listen(port, () => {
  logger.info(`Server booted on port ${port}`)
})
