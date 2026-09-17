import { useEffect, useState } from "react";
import { IdCard } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { EmployeeRole, User } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { useLanguage } from "../../hooks/useLanguage";

const EMPLOYEE_ROLE_OPTIONS: Array<{ value: EmployeeRole; labelAr: string; labelEn: string }> = [
  { value: "educational_consultant", labelAr: "مستشار تعليمي", labelEn: "Educational Consultant" },
  { value: "sales", labelAr: "مبيعات", labelEn: "Sales" },
  { value: "admission", labelAr: "قبول", labelEn: "Admission" },
  { value: "admission_manager", labelAr: "مدير قبول", labelEn: "Admission Manager" },
  { value: "visa_officer", labelAr: "مسؤول تأشيرات", labelEn: "Visa Officer" },
  { value: "travel_coordinator", labelAr: "منسق سفر", labelEn: "Travel Coordinator" },
  { value: "accommodation_officer", labelAr: "مسؤول سكن", labelEn: "Accommodation Officer" },
  { value: "finance", labelAr: "مالية", labelEn: "Finance" },
  { value: "customer_support", labelAr: "دعم العملاء", labelEn: "Customer Support" },
  { value: "branch_manager", labelAr: "مدير فرع", labelEn: "Branch Manager" },
  { value: "operations", labelAr: "عمليات", labelEn: "Operations" },
  { value: "marketing", labelAr: "تسويق", labelEn: "Marketing" },
  { value: "university_relations", labelAr: "علاقات الجامعات", labelEn: "University Relations" },
  { value: "agent_manager", labelAr: "مدير الوكلاء", labelEn: "Agent Manager" },
  { value: "content_manager", labelAr: "مدير محتوى", labelEn: "Content Manager" },
  { value: "super_admin", labelAr: "مدير عام (Super Admin)", labelEn: "Super Admin" },
];

export const AdminEmployeesPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [employees, setEmployees] = useState<User[]>([]);
  const [formError, setFormError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    adminService
      .getEmployees()
      .then(setEmployees)
      .catch((error) => setFormError(getErrorMessage(error, isArabic ? "تعذر تحميل قائمة الموظفين." : "Unable to load employees.")));
  }, [isArabic]);

  const handleRoleChange = async (id: string, employeeRole: EmployeeRole) => {
    setSavingId(id);
    setFormError("");
    try {
      const updated = await adminService.updateEmployeeRole(id, { employeeRole });
      setEmployees((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch (error) {
      setFormError(getErrorMessage(error, isArabic ? "تعذر تحديث دور الموظف." : "Unable to update the employee role."));
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <IdCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "أدوار الموظفين" : "Employee Roles"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic
                ? "حدد الدور الفرعي لكل موظف (قبول، مالية، دعم...) عشان تجربته داخل التطبيق تتخصص حسب شغله."
                : "Assign each employee's sub-role (Admission, Finance, Support...) so their in-app experience is tailored to their job."}
            </p>
          </div>
        </div>

        {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">{isArabic ? "الموظف" : "Employee"}</th>
                <th className="px-6 py-4 font-medium">{isArabic ? "الدور الفرعي" : "Sub-role"}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">{employee.name}</p>
                    <p className="mt-1 text-slate-500">{employee.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={employee.employeeRole || ""}
                      disabled={savingId === employee._id}
                      onChange={(event) => handleRoleChange(employee._id, event.target.value as EmployeeRole)}
                      className="w-full max-w-xs rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {isArabic ? "لم يُحدد بعد" : "Not assigned yet"}
                      </option>
                      {EMPLOYEE_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {isArabic ? option.labelAr : option.labelEn}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {isArabic ? "لا يوجد موظفون بعد." : "No employee accounts yet."}
          </div>
        ) : null}
      </section>
    </div>
  );
};
