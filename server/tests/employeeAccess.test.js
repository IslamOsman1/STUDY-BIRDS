const { test } = require("node:test");
const assert = require("node:assert/strict");
const { authorizeAdminSection, requireSection, authorizeApplicationRead, validPermissions } = require("../src/middleware/employeeAccess");
const sections = require("../src/constants/employeeSections.json");

const allowed = (middleware, permissions, path, method = "GET", role = "employee") => {
  let passed = false;
  let status;
  middleware({ user: { role, permissions }, path, method }, {
    status(value) { status = value; return this; }, json() {},
  }, () => { passed = true; });
  if (!passed) assert.equal(status, 403);
  return passed;
};

test("frontend and backend section catalogs stay identical", () => {
  assert.deepEqual(sections, require("../../client/src/constants/employeeSections.json"));
});
test("every section grants only its own resource mutations", () => {
  for (const section of sections) {
    for (const target of sections) {
      for (const resource of target.resources) {
        assert.equal(allowed(authorizeAdminSection, [section.key], `/${resource}/123`, "PATCH"), section.key === target.key, `${section.key} -> ${resource}`);
      }
    }
  }
});
test("multiple sections work; no permissions deny all administrative data", () => {
  for (const key of ["faqs", "testimonials"]) assert.equal(allowed(authorizeAdminSection, ["faqs", "testimonials"], `/${key}`), true);
  for (const section of sections) for (const resource of section.resources) assert.equal(allowed(authorizeAdminSection, [], `/${resource}`), false);
});
test("all sections still cannot grant roles, permissions or global overview access", () => {
  for (const path of ["/users", "/users/123", "/employees", "/employees/123/role", "/overview", "/stats", "/unknown"]) {
    for (const method of ["GET", "POST", "PATCH", "DELETE"]) assert.equal(allowed(authorizeAdminSection, sections.map((s) => s.key), path, method), false);
  }
});
test("lookup dependencies are read-only and do not expose student details", () => {
  assert.equal(allowed(authorizeAdminSection, ["student-financials"], "/students"), true);
  assert.equal(allowed(authorizeAdminSection, ["student-financials"], "/students/123"), false);
  assert.equal(allowed(authorizeAdminSection, ["programs"], "/study-fields"), true);
  assert.equal(allowed(authorizeAdminSection, ["programs"], "/study-fields", "POST"), false);
  assert.equal(allowed(authorizeAdminSection, ["faqs"], "/countries"), true);
  assert.equal(allowed(authorizeAdminSection, ["faqs"], "/countries/123", "DELETE"), false);
});
test("separate application, university and program APIs enforce section access", () => {
  for (const key of ["applications", "universities", "programs"]) {
    assert.equal(allowed(requireSection(key), [key], "/", "POST"), true);
    assert.equal(allowed(requireSection(key), ["faqs"], "/", "POST"), false);
  }
  assert.equal(allowed(authorizeApplicationRead, ["applications"], "/123"), true);
  for (const role of ["employee", "parent", "university", "partner"]) assert.equal(allowed(authorizeApplicationRead, [], "/123", "GET", role), false);
  assert.equal(allowed(authorizeApplicationRead, [], "/123", "GET", "student"), true);
});
test("admins keep access and unknown permissions are rejected", () => {
  assert.equal(allowed(authorizeAdminSection, [], "/users", "PATCH", "admin"), true);
  assert.equal(validPermissions(["faqs", "programs"]), true);
  assert.equal(validPermissions([]), true);
  for (const input of [undefined, "faqs", ["admin"], ["*"], ["users"], [null]]) assert.equal(validPermissions(input), false);
});
