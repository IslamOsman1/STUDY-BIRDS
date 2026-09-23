const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { protect, authorize } = require("../middleware/authMiddleware");
const { listPosts, createPost, getPost, deleteOwnPost, createComment, deleteOwnComment, reportPost, reportComment } = require("../controllers/communityController");

const router = express.Router();
router.use(protect, authorize("student"));

const postLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, keyGenerator: (req) => String(req.user._id), standardHeaders: "draft-7", legacyHeaders: false });
const commentLimit = rateLimit({ windowMs: 60 * 1000, limit: 20, keyGenerator: (req) => String(req.user._id), standardHeaders: "draft-7", legacyHeaders: false });
const reportLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, keyGenerator: (req) => String(req.user._id), standardHeaders: "draft-7", legacyHeaders: false });

router.get("/posts", listPosts);
router.post("/posts", postLimit, createPost);
router.get("/posts/:id", getPost);
router.delete("/posts/:id", deleteOwnPost);
router.post("/posts/:id/comments", commentLimit, createComment);
router.post("/posts/:id/report", reportLimit, reportPost);
router.delete("/comments/:id", deleteOwnComment);
router.post("/comments/:id/report", reportLimit, reportComment);

module.exports = router;
