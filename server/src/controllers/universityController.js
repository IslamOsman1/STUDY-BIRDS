const University = require("../models/University");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");

const getUniversities = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.country) {
    query.country = req.query.country;
  }

  if (req.query.featured) {
    query.featured = req.query.featured === "true";
  }

  const universities = await University.find(query)
    .populate("country")
    .sort({ featured: -1, name: 1 });

  res.json(universities);
});

const getUniversityById = asyncHandler(async (req, res) => {
  const university = await University.findById(req.params.id).populate("country");

  if (!university) {
    res.status(404);
    throw new Error("University not found");
  }

  res.json(university);
});

const createUniversity = asyncHandler(async (req, res) => {
  const university = await University.create(req.body);
  res.status(201).json(university);
});

const updateUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!university) {
    res.status(404);
    throw new Error("University not found");
  }

  res.json(university);
});

const deleteUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndDelete(req.params.id);

  if (!university) {
    res.status(404);
    throw new Error("University not found");
  }

  res.json({ message: "University deleted" });
});

const uploadUniversityImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    res.status(400);
    throw new Error("At least one image is required");
  }

  const uploads = await Promise.all(
    req.files.map((file) => uploadFileToCloudinary(file, "study-birds/universities"))
  );
  const urls = uploads.map((item) => item.url);
  res.status(201).json({ urls });
});

module.exports = {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  uploadUniversityImages,
};
