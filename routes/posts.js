const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 1. post(게시글) 생성
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const { nickname, _id } = res.locals.user;
    // 아래 콘솔로그 확인을 해보니 local.user는 User테이블에서 현재 로그인되어 있는  위치한 _id필드의 값 또
    // console.log(nickname, userId); // test1 ,649338b6c360e48dae75bdbc
    // console.log(nickname, _id);    // test1 ,new ObjectId("649338b6c360e48dae75bdbc")

    // console.log(Object.keys(req.body)); // [ 'title', 'content' ]
    // title과 content 값이 없을 때,
    if (Object.keys(req.body).length === 0) {
        return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    // 제목의 입력값이 없을 때,
    if (title === '' || title === undefined) {
        return res.status(412).json({ errorMessage: '게시글 제목의 형식이 올바르지 않습니다.' });
    }
    // 내용의 입력값이 없을 때,
    if (content === '' || content === undefined) {
        return res.status(412).json({ errorMessage: '게시글 내용의 형식이 올바르지 않습니다.' });
    }

    try {
        const post = new Posts({ userId: _id, nickname, title, content }); // body와 locals.user 값을 가지는 새로운 객체를 post에 할당,
        await post.save(); // DB에 저장한다.
        res.status(201).json({ message: '게시글이 성공적으로 작성되었습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
});

// 2. 전체 post(게시글) 목록 조회
router.get('/', async (req, res) => {
    try {
        // 생성날짜 기준으로 내림차순 정렬하고, posts에 할당.
        const posts = await Posts.find().sort('-createdAt').exec();
        const data = {
            posts: posts.map((a) => {
                return {
                    postId: a._id,
                    userId: a.userId,
                    nickname: a.nickname,
                    title: a.title,
                    createdAt: a.createdAt,
                    updatedAt: a.updatedAt,
                };
            }),
        };
        res.status(200).json(data);
    } catch (error) {
        consolelog(error.message);
        res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
});

// 3. post(게시글) 상세 조회
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Posts.findById({ _id: postId }).exec();
        const data = {
            post: {
                postId: post._id,
                userId: post.userId,
                nickname: post.nickname,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
        };
        res.status(200).json(data);
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '게시글 조회에 실패 하였습니다.' });
    }
});

// 4. post(게시글) 수정
router.put('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    const { _id } = res.locals.user;

    console.log(Object.values(req.params)); // [ '6493eabcc5f367206d23993d' ]
    try {
        if (Object.keys(req.body).length === 0 || Object.values(req.params).length === 0) {
            return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }
        if (title === '' || title === undefined) {
            return res.status(412).json({ errorMessage: '제목의 형식이 올바르지 않습니다.' });
        }
        if (content === '' || content === undefined) {
            return res.status(412).json({ errorMessage: '내용의 형식이 올바르지 않습니다.' });
        }
        const post = await Posts.findOne({ _id: postId });
        if (post.userId !== _id.toString()) {
            return res.status(412).json({ errorMessage: '게시글 수정권한이 없습니다.' });
        }
        await Posts.updateOne({ _id: postId }, { $set: { title, content } }).catch((err) => {
            res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' });
        });
        res.status(201).json({ message: '게시글을 성공적으로 수정하였습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
});

// 5. post(게시글) 삭제
router.delete('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { _id } = res.locals.user; // 로그인된 user의 _id 필드 값. // new ObjectId("649338b6c360e48dae75bdbc")
    try {
        const post = await Posts.findById(postId); // postId라는 인자를 {}객체형태로 감싸서 전달할 경우, _id필드에 대한 Object 형변환에 실패한다.
        if (!post) {
            return res.status(403).json({ errorMessage: '게시글이 존재하지 않습니다..' });
        }
        if (!_id || post.userId !== _id.toString()) {
            return res.status(403).json({ errorMessage: '게시글 삭제 권한이 존재하지 않습니다.' });
        }
        await Posts.deleteOne({ _id: postId }).catch((err) => {
            res.status(401).json({ errorMessage: '게시글이 삭제되지 않았습니다.' });
        });
        return res.status(200).json({ message: '게시글을 성공적으로 삭제하였습니다.' });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
    }
});

module.exports = router;
