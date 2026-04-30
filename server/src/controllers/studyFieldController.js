const StudyField = require("../models/StudyField");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");

const studyFieldSort = { featured: -1, sortOrder: 1, createdAt: -1, name: 1 };

const getStudyFields = asyncHandler(async (req, res) => {
  const studyFields = await StudyField.find().sort(studyFieldSort);
  res.json(studyFields);
});

const createStudyField = asyncHandler(async (req, res) => {
  const studyField = await StudyField.create({
    name: req.body.name,
    description: req.body.description || "",
    image: req.body.image || "",
    featured: typeof req.body.featured === "boolean" ? req.body.featured : true,
    sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
  });

  res.status(201).json(studyField);
});

const updateStudyField = asyncHandler(async (req, res) => {
  const studyField = await StudyField.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description || "",
      image: req.body.image || "",
      featured: Boolean(req.body.featured),
      sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0,
    },
    { new: true, runValidators: true }
  );

  if (!studyField) {
    res.status(404);
    throw new Error("Study field not found");
  }

  res.json(studyField);
});

const deleteStudyField = asyncHandler(async (req, res) => {
  const studyField = await StudyField.findByIdAndDelete(req.params.id);

  if (!studyField) {
    res.status(404);
    throw new Error("Study field not found");
  }

  res.json({ message: "Study field deleted" });
});

const uploadStudyFieldImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Study field image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/study-fields");
  res.status(201).json({ url: uploadResult.url });
});

module.exports = {
  getStudyFields,
  createStudyField,
  updateStudyField,
  deleteStudyField,
  uploadStudyFieldImage,
};
