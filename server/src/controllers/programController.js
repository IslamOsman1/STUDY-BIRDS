const Program = require("../models/Program");
const asyncHandler = require("../utils/asyncHandler");
const { uploadFileToCloudinary } = require("../utils/uploadToCloudinary");

const getPrograms = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.keyword) {
    query.title = { $regex: req.query.keyword, $options: "i" };
  }

  if (req.query.university) {
    query.university = req.query.university;
  }

  if (req.query.degreeLevel) {
    query.degreeLevel = req.query.degreeLevel;
  }

  if (req.query.fieldOfStudy) {
    query.fieldOfStudy = req.query.fieldOfStudy;
  }

  if (req.query.intake) {
    query.intake = req.query.intake;
  }

  if (req.query.tuitionMin || req.query.tuitionMax) {
    query.tuition = {};
    if (req.query.tuitionMin) {
      query.tuition.$gte = Number(req.query.tuitionMin);
    }
    if (req.query.tuitionMax) {
      query.tuition.$lte = Number(req.query.tuitionMax);
    }
  }

  const sortMap = {
    tuition: { tuition: 1 },
    deadline: { applicationDeadline: 1 },
    popularity: { popularity: -1 },
  };

  const programs = await Program.find(query)
    .populate({
      path: "university",
      populate: { path: "country" },
    })
    .sort(sortMap[req.query.sortBy] || { featured: -1, createdAt: -1 });

  const filteredPrograms = req.query.country
    ? programs.filter(
        (program) =>
          program.university &&
          String(program.university.country?._id) === String(req.query.country)
      )
    : programs;

  res.json(filteredPrograms);
});

const getProgramById = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id).populate({
    path: "university",
    populate: { path: "country" },
  });

  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }

  res.json(program);
});

const createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body);
  res.status(201).json(program);
});

const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }

  res.json(program);
});

const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndDelete(req.params.id);

  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }

  res.json({ message: "Program deleted" });
});

const uploadProgramCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Cover image is required");
  }

  const uploadResult = await uploadFileToCloudinary(req.file, "study-birds/programs");
  res.status(201).json({ url: uploadResult.url });
});

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  uploadProgramCover,
};
