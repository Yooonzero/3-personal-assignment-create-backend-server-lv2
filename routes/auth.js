const express = require('express');
const router = express.Router();
const User = require('../schemas/user.js');
const jwt = require('cookie-parser');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 회원가입 API
router.post('/auth', async (req, res) => {
    const { nickname, password, confirm } = req.body;
    try {
        // 닉네임 중복 확인
        const existNickname = await User.findOne({ nickname });
        if (existNickname) {
            res.status(412).json({
                errorMessage: '이미 존재하는 닉네임 입니다.',
            });
            return;
        }

        // 패스워드 확인
        if (password !== confirm) {
            res.status(412).json({
                errorMessage: '패스워드가 일치하지 않습니다.',
            });
        }

        // 회원가입
        const user = new User({ nickname, password });
        await user.save();

        res.status(201).json({ message: '회원가입을 축하드립니다.' });
    } catch (err) {
        res.status(400).json({ errorMessage: '요청하신 데이터 형식이 올바르지 않습니다.' });
        return;
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;
    try {
        const user = await User.findOne({ nickname });

        // DB에 해당하는 nickname이 없거나, 사용자의 password가 일치하지 않는경우.
        if (!nickname || password !== user.password) {
            res.status(412).json({ errorMessage: '회원 정보가 일치하지 않습니다.' });
            return;
        }

        // jwt 생성
        const token = jwt.sign({ userId: user.userId }, 'customized-secret-key');

        // 쿠키 생성
        res.cookie('Authorization', `Bearer ${token}`);
        res.status(200).json({ token });
    } catch (err) {
        res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
    }
});

module.exports = router;
