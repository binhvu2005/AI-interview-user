import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User Backend Server running on port ${PORT}`);
  });
});
