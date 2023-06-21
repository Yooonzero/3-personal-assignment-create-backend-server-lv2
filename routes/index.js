const express = require('express');
const router = express.Router();

const authRouter = require('./auth.js');
const postRouter = require('./posts.js'); // post 관련 module
const commentRouter = require('./comments.js');

router.use('/', [authRouter, postRouter, commentRouter]);

module.exports = router;
