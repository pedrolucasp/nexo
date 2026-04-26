import { createApp } from '@app/createApp';

const port = process.env.PORT || 3000;

const app = createApp();

app.listen(port, () => {
  console.log(`Server booted on port ${port}`)
})

