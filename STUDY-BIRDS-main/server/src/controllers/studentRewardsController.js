const StudentRewardEntry = require("../models/StudentRewardEntry");

exports.getMyRewards = async (req, res) => {
  try {
    const entries = await StudentRewardEntry.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
    res.json({ totalPoints, entries });
  } catch {
    res.status(500).json({ message: "تعذر تحميل المكافآت" });
  }
};

exports.creditStudentRewards = async (req, res) => {
  try {
    const { points, type = "admin", description } = req.body;
    if (!points || points < 1)
      return res
        .status(400)
        .json({ message: "عدد النقاط يجب أن يكون أكبر من صفر" });
    if (!description)
      return res.status(400).json({ message: "السبب مطلوب" });

    const validTypes = ["referral", "stage", "bonus", "admin"];
    const entry = await StudentRewardEntry.create({
      student: req.params.id,
      points,
      type: validTypes.includes(type) ? type : "admin",
      description,
    });
    res.status(201).json(entry);
  } catch {
    res.status(500).json({ message: "تعذر إضافة المكافأة" });
  }
};
