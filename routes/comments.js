const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');
const Comments = require('../schemas/comment.js');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 1. 댓글 작성
router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { nickname, _id } = res.locals.user;

    if (req.body.length === 0) {
        return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (!content || content.trim() === '') {
        return res.status(400).json({ errorMessage: '댓글 내용을 입력해 주십시오.' });
    }

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(403).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        await Comments.create({
            postId: postId,
            userId: _id,
            nickname: nickname,
            content: content,
        });
        res.status(200).json({ message: '댓글이 성공적으로 작성되었습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
});

// 2. 댓글 목록 조회
router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    try {
        const post = Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        const comments = Comments.find({ postId: postId });
        const data = {
            comments: comments.map((a) => {
                return {
                    commentId: a._id,
                    userId: a.userId,
                    comment: a.comment,
                    nickname: a.nickname,
                    createdAt: a.createdAt,
                    updatedAt: a.updatedAt,
                };
            }),
        };
        res.status(200).json(data);
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
    }
});

// 댓글 수정
router.put('/:postId/comments/:commentId', async (req, res) => {
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
router.delete('/:postId/comments', async (req, res) => {
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
