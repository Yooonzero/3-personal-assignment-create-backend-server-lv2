const mongoose = require('mongoose');

const connect = () => {
    mongoose
        .connect('mongodb://localhost:27017/3-personal-assignment-create-backend-server')
        .catch((err) => console.log(err));
};

mongoose.connection.on('error', (err) => {
    console.error('몽고디비 연결 에러', err);
});

module.exports = connect;
