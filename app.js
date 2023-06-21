const express = require('express'); // 프레임워크
const app = express();
const port = 3050;

const indexRouter = require('./routes/index.js');
const cookieParser = require('cookie-parser');

const connect = require('./schemas'); //
connect();

app.use(express.json()); // req.body() 문법을 사용하기 위함이다.
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', [indexRouter]);

app.listen(port, () => {
    console.log(port, '포트로 서버가 열렸어요!');
});
