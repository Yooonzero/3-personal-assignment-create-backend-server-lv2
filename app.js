// express 라는 프레임워크는 미들웨어라는 개념을 중심으로 동작한다.
const express = require('express'); // 프레임워크
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index.js');

const connect = require('./schemas'); //
connect();

const app = express();

app.use(express.json()); // req.body() 문법을 사용하기 위함이다.
app.use(express.urlencoded({ extended: false })); // URL_encoded형식으로 전송된 데이터를 해석하여 req.body에 저장
app.use(cookieParser());
app.use('/', [indexRouter]);

app.get('/', (req, res) => {
    console.log('1차 확인');
    res.status(200).json({ msg: 'hi' });
});

const port = 3050;

app.listen(port, () => {
    console.log(port, '포트로 서버가 열렸어요!');
});
