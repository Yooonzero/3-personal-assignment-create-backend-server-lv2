const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');

// 1. post 생성
router.post('/posts', async (req, res) => {
    const { user, password, title, content } = req.body;
    try {
        const createdPost = await Posts.create({
            user,
            password,
            title,
            content,
        });
        res.send({ message: '게시글을 작성하였습니다.' }).json({ post: createdPost });
    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
        // 위 코드를 활성화 시키면, Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client 라는 오류가 출력.
    }
});

// 2. 전체 post 목록 조회
router.get('/posts', async (req, res) => {
    const posts = await Posts.find().sort({ createdAt: -1 });
    res.status(200).json({ data: posts });
});

// 3. post 상세 조회
router.get('/posts/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const posts = await Posts.find({ _id });
        res.status(200).json({ data: posts });
    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 4. post 수정
router.put('/posts/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const { user = '', password, title = '', content = '' } = req.body;

        const existPost = await Posts.findOne({ _id });
        if (existPost && user !== '' && content !== '' && title !== '' && password === existPost.password) {
            await Posts.updateOne(
                { _id: _id },
                { $set: { user: user, password: password, title: title, content: content } }
            );
            res.status(200).send({ msg: '게시글을 수정하였습니다.' });
        } else {
            res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
        }
    } catch (error) {
        res.status(404).send({ msg: '해당 게시글이 존재하지 않습니다.' });
    }
});

// 5. post 삭제
router.delete('/posts/:_id', async (req, res) => {
    const { _id } = req.params;
    const { password } = req.body;
    const existPost = await Posts.findOne({ _id });
    console.log(existPost);
    try {
        if (existPost && existPost.password === password) {
            await Posts.deleteOne({ _id });
            res.status(200).send({ msg: '게시글이 삭제되었습니다.' });
        } else {
            res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
        }
    } catch (error) {
        // error가 나오면 여기로 안와짐.
        console.log(error);
        // res.status(404).send({ msg: '게시글 조회에 실패하였습니다.' });
    }
});

module.exports = router;
