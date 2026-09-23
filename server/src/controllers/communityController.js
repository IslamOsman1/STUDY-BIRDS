const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const CommunityPost = require("../models/CommunityPost");
const CommunityComment = require("../models/CommunityComment");

// ---- Students: browse, post, comment on their own content ---------------

const listPosts = asyncHandler(async (req, res) => {
  const query = { status: "published" };
  if (req.query.country && mongoose.isValidObjectId(req.query.country)) query.country = req.query.country;
  if (req.query.university && mongoose.isValidObjectId(req.query.university)) query.university = req.query.university;
  const posts = await CommunityPost.find(query)
    .populate("author", "name").populate("country", "name").populate("university", "name")
    .sort({ createdAt: -1 }).limit(100).lean();
  res.json(posts);
});

const createPost = asyncHandler(async (req, res) => {
  const { title, body, country, university } = req.body;
  if (typeof title !== "string" || !title.trim() || title.length > 150
    || typeof body !== "string" || !body.trim() || body.length > 5000
    || (country && !mongoose.isValidObjectId(country)) || (university && !mongoose.isValidObjectId(university))) {
    return res.status(400).json({ message: "Invalid post" });
  }
  const post = await CommunityPost.create({
    author: req.user._id, title: title.trim(), body: body.trim(),
    country: country || undefined, university: university || undefined,
  });
  res.status(201).json(await CommunityPost.findById(post._id).populate("author", "name").lean());
});

const getPost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found" });
  const post = await CommunityPost.findOne({ _id: req.params.id, status: "published" }).populate("author", "name").populate("country", "name").populate("university", "name").lean();
  if (!post) return res.status(404).json({ message: "Post not found" });
  const comments = await CommunityComment.find({ post: post._id, status: "published" }).populate("author", "name").sort({ createdAt: 1 }).lean();
  res.json({ post, comments });
});

const deleteOwnPost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found" });
  const post = await CommunityPost.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!post) return res.status(404).json({ message: "Post not found" });
  await CommunityComment.deleteMany({ post: post._id });
  res.json({ message: "Post deleted" });
});

const createComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found" });
  const { body } = req.body;
  if (typeof body !== "string" || !body.trim() || body.length > 2000) return res.status(400).json({ message: "Invalid comment" });
  const post = await CommunityPost.findOne({ _id: req.params.id, status: "published" });
  if (!post) return res.status(404).json({ message: "Post not found" });
  const comment = await CommunityComment.create({ post: post._id, author: req.user._id, body: body.trim() });
  await CommunityPost.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  res.status(201).json(await CommunityComment.findById(comment._id).populate("author", "name").lean());
});

const deleteOwnComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Comment not found" });
  const comment = await CommunityComment.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  await CommunityPost.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });
  res.json({ message: "Comment deleted" });
});

// ---- Staff moderation (mounted under /admin/community, gated by the
// 'community' employee section) -------------------------------------------

const listPostsAdmin = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status && ["published", "hidden"].includes(req.query.status)) query.status = req.query.status;
  const posts = await CommunityPost.find(query).populate("author", "name email").populate("moderatedBy", "name").sort({ createdAt: -1 }).limit(300).lean();
  res.json(posts);
});

const moderatePost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found" });
  const { status, moderationNote = "" } = req.body;
  if (!["published", "hidden"].includes(status) || typeof moderationNote !== "string" || moderationNote.length > 500) {
    return res.status(400).json({ message: "Invalid moderation action" });
  }
  const post = await CommunityPost.findByIdAndUpdate(req.params.id, { status, moderationNote: moderationNote.trim(), moderatedBy: req.user._id }, { new: true });
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

const moderateComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Comment not found" });
  const { status } = req.body;
  if (!["published", "hidden"].includes(status)) return res.status(400).json({ message: "Invalid moderation action" });
  const comment = await CommunityComment.findByIdAndUpdate(req.params.id, { status, moderatedBy: req.user._id }, { new: true });
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  res.json(comment);
});

module.exports = { listPosts, createPost, getPost, deleteOwnPost, createComment, deleteOwnComment, listPostsAdmin, moderatePost, moderateComment };
