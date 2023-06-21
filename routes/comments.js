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
        const post = await Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        const comments = await Comments.find({ postId: postId });
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
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const { _id } = res.locals.user;
    if (Object.keys(req.body).length === 0 || Object.value(req.params).length === 0) {
        return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (comment.trim() === '' || undefined) {
        return res.status(400).json({ errorMessage: '댓글 내용을 입력해주세요.' });
    }
    try {
        const post = await Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        const existComment = await Comments.findById(commentId);
        if (!existComment) {
            return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        if (existComment.userId !== _id.toString()) {
            return res.status(403).json({ errorMessage: '댓글 수정 권한이 존재하지 않습니다.' });
        }
        await Comments.updateOne({ _id: commentId }, { $set: { comment: comment } }).catch((err) => {
            res.status(400).json({ errorMessage: '댓글 수정이 처리되지 않았습니다.' });
        });
        res.status(200).json({ errorMessage: '댓글이 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
});

// 댓글 삭제
router.delete('/:postId/comments/commetId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const { _id } = res.locals.user;

    try {
        const post = await Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        const existComment = Comments.findById(commentId);
        if (!existComment) {
            return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        if (existComment.userId !== _id.toString()) {
            return res.status(403).json({ errorMessage: '댓글 삭제 권한이 존재하지 않습니다.' });
        }
        await Comments.deleteOne({ _id: commentId }).catch((err) => {
            res.status(400).json({ errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.' });
        });
        res.status(200).json({ errorMessage: '댓글 삭제에 성공하였습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
});

module.exports = router;
