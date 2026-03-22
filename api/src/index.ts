import express from 'express';
import userRouter from '@app/routes/users'
import { errorHandler } from '@app/middleware/errorHandler';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json())

app.use("/users", userRouter);

app.use(errorHandler); // always last

app.listen(port, () => {
  console.log(`Server booted on port ${port}`)
})

