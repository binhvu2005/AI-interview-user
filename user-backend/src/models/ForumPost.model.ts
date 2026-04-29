import mongoose, { Schema, Document } from 'mongoose';

export interface IReply extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  date: Date;
  likes: mongoose.Types.ObjectId[];
  replies: IReply[];
}

const ReplySchema: Schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  replies: [this] // Recursive for nested replies
});

export interface IForumPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  date: Date;
  likes: mongoose.Types.ObjectId[];
  views: number;
  replies: IReply[];
  isHidden: boolean;
}

const ForumPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  replies: [ReplySchema],
  isHidden: { type: Boolean, default: false }
});

export default mongoose.model<IForumPost>('ForumPost', ForumPostSchema);
