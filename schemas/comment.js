const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    nickname: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

commentSchema.set('timestamps', { createdAt: true, updatedAt: true });

module.exports = mongoose.model('Comments', commentSchema);
