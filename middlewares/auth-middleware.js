const jws = require('jsonwebtoken');
const User = require('../schemas/user.js');

module.exports = async (req, res, next) => {
    const { Authorization } = req.cookies;

    // Authorization의 쿠키가 존재하지 않았을 때를 대비해서,
    // 병합 문자열 (??) 을 사용해 값이 없다면 빈 문자열로 대체,
    // split 을 사용해서 bearer 타입을 분리시켜준다.
    const [authType, authToken] = (Authorization ?? '').split(' ');

    // authType === bearer 검증
    // authToken 검증
    if (authType !== 'bearer' || !authToken) {
        res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
        return;
    }
    try {
        // 1. authToken이 만료된 경우
        // 2. authToken이 서버가 발급한 토큰이 맞는지 검증.
        const { userId } = jwt.verify(authToken, 'customized-secret-key');

        //3. authToken에 있는 userId의 사용자가 실제로 DB에 존재하는지 확인.
        const user = await User.findById(userId);
        res.locals.user = user;

        next(); // 이 다음의 미들웨어로 보낸다.
    } catch (error) {
        console.log(error);
        res.status(403).json({ errorMessage: '확인한 쿠키에서 오류가 발생하였습니다.' });
        return;
    }
};
