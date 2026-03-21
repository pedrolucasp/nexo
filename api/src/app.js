import { createApp } from "./create-app.js";
import db from "./db.js";

const port = process.env.PORT || '3000'
const app = createApp(db);

app.listen(port, () => {
  console.log(`App running on ${port}`)
})

export default app;
