import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ForumPost from '../models/ForumPost.model';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { sort, page = 1, limit = 6, search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let sortQuery = {};
    if (sort === 'newest') sortQuery = { date: -1 };
    else if (sort === 'popular') sortQuery = { likesCount: -1 };

    const matchQuery: any = { isHidden: { $ne: true } };
    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalPosts = await ForumPost.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalPosts / limitNum);

    const posts = await ForumPost.aggregate([
      { $match: matchQuery },
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
          images: 1,
          'author.fullName': 1,
          'author.avatar': 1,
          'author.isVip': 1,
          isLiked: { 
            $cond: {
              if: { $and: [{ $gt: [(req as any).user?.id ? 1 : 0, 0] }, { $isArray: "$likes" }] },
              then: { $in: [new mongoose.Types.ObjectId((req as any).user?.id || "000000000000000000000000"), "$likes"] },
              else: false
            }
          }
        }
      },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Map to match frontend expectations
    const formattedPosts = posts.map(p => ({
      ...p,
      id: p._id,
      author: { name: p.author.fullName, avatar: p.author.avatar, isVip: p.author.isVip }
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        totalPosts,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const post = await ForumPost.findOne({ _id: req.params.id, isHidden: { $ne: true } })
      .populate('author', 'fullName avatar isVip')
      .populate('replies.author', 'fullName avatar isVip')
      .populate('replies.replies.author', 'fullName avatar isVip');

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
      isLiked: (req as any).user?.id ? post.likes.includes((req as any).user.id) : false,
      images: post.images,
      author: { 
        name: (post.author as any).fullName, 
        avatar: (post.author as any).avatar,
        role: (post.author as any).isVip ? 'VIP' : 'Member',
        isVip: (post.author as any).isVip
      },
      replies: post.replies.map((r: any) => ({
        id: r._id,
        content: r.content,
        date: r.date,
        likes: r.likes.length,
        isLiked: (req as any).user?.id ? r.likes.includes((req as any).user.id) : false,
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
    const author = (req as any).user.id;

    const newPost = new ForumPost({
      title,
      content,
      author,
      tags,
      images: req.body.images || []
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
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
    const author = (req as any).user.id;
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
    const userId = (req as any).user.id;
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
