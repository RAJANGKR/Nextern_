const mongoose = require('mongoose');

const TopicProgressSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicCode: { type: String, required: true },           // matches Topic.code
  completed: { type: Boolean, default: true },
  source:    { type: String, enum: ['manual','assessment'], default: 'manual' },
}, { timestamps: true });

// One completion record per user+topic pair
TopicProgressSchema.index({ user: 1, topicCode: 1 }, { unique: true });

module.exports = mongoose.model('TopicProgress', TopicProgressSchema);
