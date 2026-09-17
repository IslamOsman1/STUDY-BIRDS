const asyncHandler = require("../utils/asyncHandler");
const ParentLink = require("../models/ParentLink");
const User = require("../models/User");
const University = require("../models/University");
const { ALL_EMPLOYEE_ROLES } = require("../constants/roles");

// ---- Parent links -------------------------------------------------------

const getParentLinksAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const links = await ParentLink.find(filter)
    .populate("parent", "name email")
    .populate("student", "name email")
    .sort({ createdAt: -1 });
  res.json(links);
});

const updateParentLinkStatusAdmin = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const link = await ParentLink.findByIdAndUpdate(
    req.params.id,
    { status, adminNote, reviewedAt: new Date(), reviewedBy: req.user._id },
    { new: true }
  );

  if (!link) {
    res.status(404);
    throw new Error("Parent link request not found");
  }

  res.json(link);
});

// ---- University accounts -------------------------------------------------

const getUniversityAccountsAdmin = asyncHandler(async (req, res) => {
  const accounts = await User.find({ role: "university" })
    .select("-password")
    .populate("linkedUniversity", "name city country");
  res.json(accounts);
});

const createUniversityAccountAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, universityId } = req.body;

  if (!name || !email || !password || !universityId) {
    res.status(400);
    throw new Error("name, email, password, and universityId are required");
  }

  const university = await University.findById(universityId);
  if (!university) {
    res.status(404);
    throw new Error("University not found");
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const account = await User.create({
    name,
    email: String(email).toLowerCase().trim(),
    password,
    role: "university",
    linkedUniversity: university._id,
    emailVerified: true,
  });

  res.status(201).json({ ...account.toObject(), password: undefined });
});

const updateUniversityAccountAdmin = asyncHandler(async (req, res) => {
  const { isActive, linkedUniversity } = req.body;
  const account = await User.findOne({ _id: req.params.id, role: "university" });

  if (!account) {
    res.status(404);
    throw new Error("University account not found");
  }

  if (typeof isActive === "boolean") account.isActive = isActive;
  if (linkedUniversity) account.linkedUniversity = linkedUniversity;
  await account.save();

  res.json({ ...account.toObject(), password: undefined });
});

// ---- Employee sub-roles ---------------------------------------------------

const getEmployeesAdmin = asyncHandler(async (req, res) => {
  const employees = await User.find({ role: "admin" }).select("-password");
  res.json(employees);
});

const updateEmployeeRoleAdmin = asyncHandler(async (req, res) => {
  const { employeeRole, permissions } = req.body;

  if (employeeRole && !ALL_EMPLOYEE_ROLES.includes(employeeRole)) {
    res.status(400);
    throw new Error("Invalid employeeRole value");
  }

  const employee = await User.findOne({ _id: req.params.id, role: "admin" });
  if (!employee) {
    res.status(404);
    throw new Error("Employee account not found");
  }

  if (employeeRole !== undefined) employee.employeeRole = employeeRole;
  if (Array.isArray(permissions)) employee.permissions = permissions;
  await employee.save();

  res.json({ ...employee.toObject(), password: undefined });
});

module.exports = {
  getParentLinksAdmin,
  updateParentLinkStatusAdmin,
  getUniversityAccountsAdmin,
  createUniversityAccountAdmin,
  updateUniversityAccountAdmin,
  getEmployeesAdmin,
  updateEmployeeRoleAdmin,
};
