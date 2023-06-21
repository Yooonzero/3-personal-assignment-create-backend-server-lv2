const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

postSchema.set('timestamps', { createdAt: true, updatedAt: true });

module.exports = mongoose.model('Posts', postSchema);
