const express = require('express');
const router = express.Router();
const User = require('../schemas/user.js');
const jwt = require('jsonwebtoken');

// 회원가입 API
router.post('/auth', async (req, res) => {
    const { nickname, password, confirm } = req.body;
    try {
        // 닉네임 중복 확인
        const existNickname = await User.findOne({ nickname }); // User스키마를 통해서 DB에 이미 입력한 nickname 값이 존재하는지 확인하고,
        if (existNickname) {
            // 만약 있다면,
            res.status(412).json({
                errorMessage: '이미 존재하는 닉네임 입니다.', // 에러메시지를 출력하고,
            });
            return; // 리턴시킨다.
        }

        // 패스워드 확인
        if (password !== confirm) {
            // body에 입력한 패스워드값과 확인값이 다르면,
            //
            res.status(412).json({
                errorMessage: '패스워드가 일치하지 않습니다.', // 해당 에러메시지를 출력하고,
            });
            return; // 리턴시킨다.
            // 리턴이 없으면, 오류를 출력하고 아래로 내려가 회원가입이 이루어진다.
            // 이유: nes User에 키값에는 confirm이 없기 때문, 따라서 꼭, return을 넣어주어야 한다. 없으면 서버도 끊긴다.
        }

        // 회원가입
        const user = new User({ nickname, password }); // body의 데이터를 담은 새로운 객체를 user에 할당하고,
        await user.save(); // 저장한다.

        res.status(201).json({ message: '회원가입을 축하드립니다.' });
    } catch (err) {
        res.status(400).json({ errorMessage: '요청하신 데이터 형식이 올바르지 않습니다.' });
        return;
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body; // body에 입력값을 받고,
    try {
        const user = await User.findOne({ nickname }); // DB에서 입력한 nickname을 가진 user를 찾아 변수에 할당하고,

        // DB에 해당하는 nickname이 없거나, 사용자의 password가 일치하지 않는경우.
        if (!nickname || password !== user.password) {
            res.status(412).json({ errorMessage: '회원 정보가 일치하지 않습니다.' }); // 해당 오류메시지 출력.
            return;
        }

        // jwt 생성
        const token = jwt.sign({ userId: user.userId }, 'customized-secret-key');

        // 쿠키 생성
        res.cookie('Authorization', `Bearer ${token}`); // Authorization이라는 이름의 bearer타입의 토큰 생성.
        res.status(200).json({ token });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
    }
});

module.exports = router;
