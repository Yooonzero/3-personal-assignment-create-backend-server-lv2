const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: Number,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comments', commentSchema);
