const User = require('../schemas/user.js');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    const { Authorization } = req.cookies;

    // Authorization의 쿠키가 존재하지 않았을 때를 대비해서,
    // 병합 문자열 (??) 을 사용해 값이 없다면 빈 문자열로 대체,
    // split 을 사용해서 bearer 타입을 분리시켜준다.
    const [authType, authToken] = (Authorization ?? '').split(' ');

    // authType === bearer 검증
    // authToken 검증
    // console.log(authType); // Bearer
    // console.log(authToken); //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDkzMzhiNmMzNjBlNDhkYWU3NWJkYmMiLCJpYXQiOjE2ODc0MTU0NjV9.F6t5XyHBM2Xg1Jk3TAlCwkSgRf-YdxC4IQbtpR0fEHE
    if (authType !== 'Bearer' || !authToken) {
        res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
        return;
    }
    try {
        // 1. authToken이 만료된 경우
        // 2. authToken이 서버가 발급한 토큰이 맞는지 검증.
        // console.log(jwt.verify(authToken, 'customized-secret-key')); // { userId: '649338b6c360e48dae75bdbc', iat: 1687415465 }
        const { userId } = jwt.verify(authToken, 'customized-secret-key'); // 구조분해 할당으로 userId에 할당.

        //3. authToken에 있는 userId의 사용자가 실제로 DB에 존재하는지 확인.
        const user = await User.findById(userId); // 해당 userId로 찾은 데이터를 user에 할당.
        // console.log(user);
        //{
        //     _id: new ObjectId("649338b6c360e48dae75bdbc"),
        //     nickname: 'test1',
        //     password: '12',
        //     __v: 0
        //   }
        res.locals.user = user; // res.locals.user를 사용할 수 있게, 현재 로그인된 user의 데이터를 할당한다.

        next(); // 이 다음의 미들웨어로 보낸다.
    } catch (error) {
        console.log(error);
        res.status(403).json({ errorMessage: '확인한 쿠키에서 오류가 발생하였습니다.' });
        return;
    }
};
