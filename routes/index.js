const express = require('express');
const router = express.Router();

const userRouter = require('./users.js');
const loginRouter = require('./login.js');
const postRouter = require('./posts.js'); // post 관련 module
const commentRouter = require('./comments.js');

app.use('/api', [userRouter, loginRouter, postRouter, commentRouter]);

module.exports = router;
