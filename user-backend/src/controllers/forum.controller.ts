import { Request, Response } from 'express';
import ForumPost from '../models/ForumPost.model';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { sort } = req.query;
    let sortQuery = {};
    if (sort === 'newest') sortQuery = { date: -1 };
    else if (sort === 'popular') sortQuery = { likesCount: -1 };

    const posts = await ForumPost.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          repliesCount: { $size: "$replies" }
        }
      },
      { $sort: sortQuery as any },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          title: 1,
          content: 1,
          tags: 1,
          date: 1,
          views: 1,
          likes: { $size: "$likes" },
          replies: { $size: "$replies" },
          'author.fullName': 1,
          'author.avatar': 1
        }
      }
    ]);

    // Map to match frontend expectations
    const formattedPosts = posts.map(p => ({
      ...p,
      author: { name: p.author.fullName, avatar: p.author.avatar }
    }));

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'fullName avatar')
      .populate('replies.author', 'fullName avatar')
      .populate('replies.replies.author', 'fullName avatar');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increase views
    post.views += 1;
    await post.save();

    // Map to match frontend expectations
    const formattedPost = {
      id: post._id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      date: post.date,
      views: post.views,
      likes: post.likes.length,
      author: { 
        name: (post.author as any).fullName, 
        avatar: (post.author as any).avatar,
        role: 'Premium User' // Can be dynamic if you add roles to User model
      },
      replies: post.replies.map((r: any) => ({
        id: r._id,
        content: r.content,
        date: r.date,
        likes: r.likes.length,
        isLiked: r.likes.includes((req as any).user?._id),
        author: { name: r.author.fullName, avatar: r.author.avatar },
        replies: r.replies?.map((rr: any) => ({
          id: rr._id,
          content: rr.content,
          date: rr.date,
          author: { name: rr.author.fullName, avatar: rr.author.avatar }
        }))
      }))
    };

    res.json(formattedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post detail' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const author = (req as any).user._id;

    const newPost = new ForumPost({
      title,
      content,
      author,
      tags
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(userId);
    if (index === -1) post.likes.push(userId);
    else post.likes.splice(index, 1);

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
};

export const addReply = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const author = (req as any).user._id;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.replies.push({
      author,
      content,
      date: new Date(),
      likes: [],
      replies: []
    } as any);

    await post.save();
    res.status(201).json({ message: 'Reply added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reply' });
  }
};

export const likeReply = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { postId, replyId } = req.params;
    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const reply = (post.replies as any).id(replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const index = reply.likes.indexOf(userId);
    if (index === -1) reply.likes.push(userId);
    else reply.likes.splice(index, 1);

    await post.save();
    res.json({ likes: reply.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error liking reply' });
  }
};
