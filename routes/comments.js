const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');
const Comments = require('../schemas/comment.js');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 1. 댓글 작성
router.post('/:postId/comments', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { nickname, _id } = res.locals.user;

    if (req.body.length === 0) {
        return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (!content || content.trim() === '') {
        // trim() = 문자열의 양 끝의 공백을 없애고 새로운 문자열을 반환해주는 메서드
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

// 3. 댓글 수정
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const { _id } = res.locals.user; // 옆의 코드를 사용하기 위해선 URI 경로에서 authMiddleware에 들어갔다 와야 함.

    // 입력해야할 값들의 공백값 오류 체크.
    if (Object.keys(req.body).length === 0 || Object.values(req.params).length === 0) {
        return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (content.trim() === '' || undefined) {
        return res.status(400).json({ errorMessage: '댓글 내용을 입력해주세요.' });
    }

    try {
        // 해당 게시글 존재여부 확인.
        const post = await Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }

        const existComment = await Comments.findById(commentId);
        // 수정하고자 하는 댓글의 존재여부 확인
        if (!existComment) {
            return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        // 댓글작성자의 id와 현재 로그인한 user의 id가 다를시.
        if (existComment.userId !== _id.toString()) {
            return res.status(403).json({ errorMessage: '댓글 수정 권한이 존재하지 않습니다.' });
        }
        // 업데이트 로직.
        await Comments.updateOne({ _id: commentId }, { $set: { content: content } }).catch((err) => {
            res.status(400).json({ errorMessage: '댓글 수정이 처리되지 않았습니다.' });
        });
        res.status(200).json({ errorMessage: '댓글이 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
});

// 4. 댓글 삭제
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { _id } = res.locals.user;

    try {
        // 게시글 존재여부 확인.
        const post = await Posts.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        // 댓글 존재 여부 확인.
        const existComment = await Comments.findById(commentId);
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
