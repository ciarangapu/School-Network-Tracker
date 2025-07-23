import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('Basic imports successful');

dotenv.config();
console.log('Dotenv configured');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

console.log('Express configured');

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
