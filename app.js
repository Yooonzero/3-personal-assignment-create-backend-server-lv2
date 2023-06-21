const express = require('express'); // 프레임워크
const app = express();
const port = 3050;

const postRouter = require('./routes/posts.js'); // post 관련 module
const commentRouter = require('./routes/comments.js');
const connect = require('./schemas'); // 몽고디비 관련 module
connect();

app.use(express.json()); // req.body() 문법을 사용하기 위함이다.

app.get('/', (req, res) => {
    const waitASecond = {
        현상: '잠시 환기 필요',
        결과: '잠시 나갔다 오겠습니다.',
        시간: '10분 소요 예정',
    };

    res.status(200).json(waitASecond);
});

app.get('/api', (req, res) => {
    const welcome = {
        postSection: 'URI에 /posts 를 추가하시면 이동이 가능합니다.',
        commentSection: 'URI에 /comments/postId 를 추가하시면 이동이 가능합니다.',
    };
    res.status(200).json(welcome);
});

app.use('/api', [postRouter, commentRouter]);

app.listen(port, () => {
    console.log(port, '포트로 서버가 열렸어요!');
});
