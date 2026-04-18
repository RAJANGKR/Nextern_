const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true },   // e.g. 'd1', 'db3'
  subjectCode: { type: String, required: true, enum: ['DSA','DBMS','OOPS','OS','CN'] },
  title:       { type: String, required: true },
  level:       { type: String, required: true, enum: ['basic','intermediate','advanced'] },
  importance:  { type: Number, required: true, min: 1, max: 5 },
  companyType: { type: String, required: true, enum: ['product','service','both'] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

TopicSchema.index({ subjectCode: 1, level: 1 });

module.exports = mongoose.model('Topic', TopicSchema);
