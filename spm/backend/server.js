const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/web_points_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, points: 0 });
  await user.save();
  res.status(201).send('註冊成功');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ email: user.email }, 'secretkey');
    res.json({ token });
  } else {
    res.status(401).send('登入失敗');
  }
});

app.get('/points', async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const decoded = jwt.verify(token, 'secretkey');
  const user = await User.findOne({ email: decoded.email });
  res.json({ points: user.points });
});

app.post('/points', async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const { points } = req.body;
  const decoded = jwt.verify(token, 'secretkey');
  const user = await User.findOne({ email: decoded.email });
  user.points += points;
  await user.save();
  res.json({ points: user.points });
});

app.listen(port, () => {
  console.log(`會員系統運行於 http://localhost:${port}`);
});
