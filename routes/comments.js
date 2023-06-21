const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');
const Comments = require('../schemas/comment.js');

// 댓글 작성
router.post('/comments/:postId', async (req, res) => {
    const { postId } = req.params;
    const { user, password, content } = req.body;
    try {
        const createdComment = await Comments.create({
            postId,
            user,
            password, // body에 0이라는 숫자가 들어가면 SyntaxError: Unexpected number in JSON at position 49 라는 오류가 발생 이유는 모름.
            content,
        });
        res.status(200).send({ msg: '댓글을 생성하였습니다.' });
    } catch (error) {
        if (!content) {
            res.status(400).send({ msg: '댓글 내용을 입력해 주세요.' });
        }
        if (postId !== Posts.findOne({ postId })) {
            res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
        }
    }
});

// 댓글 목록 조회
router.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params;
    console.log(postId);
    try {
        const comment = await Comments.findOne({ postId }).sort({ createdAt: -1 });
        console.log(comment);
        res.json({ data: `${JSON.stringify(comment)}` });
    } catch (error) {
        res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 댓글 수정
router.put('/comments/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log(_id);
    const { password, content } = req.body;
    const existComment = await Comments.findOne({ _id });
    console.log(existComment);
    if (existComment && password === existComment.password) {
        await Comments.updateOne({ password: password }, { $set: { content: content } });
        return res.status(200).send({ msg: '댓글을 수정했습니다.' });

        // console.log(error);
        // res.status(400).json({ msg: '되나?' });
    }
    if (!content) {
        res.status(400).send({ msg: '댓글 내용을 입력해주세요.' });
    }
    if (_id !== existComment._id || password !== existComment.password) {
        res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 댓글 삭제
router.delete('/comments/:_id', async (req, res) => {
    const { _id } = req.params;
    const { password } = req.body;
    const existComment = await Comments.findOne({ _id });
    if (existComment && String(existComment.password) === password) {
        await Comments.deleteOne({ _id });
        res.status(200).send({ msg: '댓글을 삭제하였습니다.' });
    }
    if (password !== String(existComment.password)) {
        res.status(400).send({ msg: '데이터 형식이 올바르지 않습니다.' });
    }
    // res.status(404).send({ msg: '댓글 조회에 실패하였습니다.' });
});

module.exports = router;
