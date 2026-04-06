import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from '@app/routes/users'
import authRouter from '@app/routes/auth'
import { errorHandler } from '@app/middleware/errorHandler';

const port = process.env.PORT || 3000;

const app = express();

// Configure CORS
// Fucking expo
app.use(cors({
  //origin: process.env.FRONTEND_URL || 'http://localhost:8081', // Expo default port
  origin: "*",
  credentials: true
}));

app.use(express.json())
app.use(morgan('combined'))

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.use(errorHandler); // always last

app.listen(port, () => {
  console.log(`Server booted on port ${port}`)
})

