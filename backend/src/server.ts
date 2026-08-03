import app from './app';
import connectDB from './config/db';
import { validateEnv } from './config/env';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  validateEnv();
  await connectDB();
  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Server running on port ${PORT}`);
    }
  });
};

startServer();
