import { useEffect, useState } from "react";
import { Building2, PlusCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import { universityService } from "../../services/universityService";
import { getPaginatedItems } from "../../utils/pagination";
import type { University, User } from "../../types";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";
import { useLanguage } from "../../hooks/useLanguage";

const emptyForm = { name: "", email: "", password: "", universityId: "" };

export const AdminUniversityAccountsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [accounts, setAccounts] = useState<User[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    const [accountsData, universitiesData] = await Promise.all([
      adminService.getUniversityAccounts(),
      universityService.getAll(),
    ]);
    setAccounts(accountsData);
    setUniversities(getPaginatedItems(universitiesData));
  };

  useEffect(() => {
    loadData().catch((error) =>
      setFormError(getErrorMessage(error, isArabic ? "تعذر تحميل حسابات الجامعات." : "Unable to load university accounts."))
    );
  }, [isArabic]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.universityId) {
      setFormError(isArabic ? "كل الحقول مطلوبة." : "All fields are required.");
      return;
    }

    setCreating(true);
    setFormError("");
    try {
      const created = await adminService.createUniversityAccount(form);
      setAccounts((current) => [created, ...current]);
      setForm(emptyForm);
    } catch (error) {
      setFormError(getErrorMessage(error, isArabic ? "تعذر إنشاء الحساب." : "Unable to create the account."));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (account: User) => {
    try {
      const updated = await adminService.updateUniversityAccount(account._id, { isActive: account.isActive === false });
      setAccounts((current) => current.map((item) => (item._id === account._id ? updated : item)));
    } catch (error) {
      setFormError(getErrorMessage(error, isArabic ? "تعذر تحديث الحساب." : "Unable to update the account."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "حسابات الجامعات" : "University Accounts"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic
                ? "أنشئ حساب دخول لكل جامعة عشان تراجع طلباتها وتحدّث حالتها بنفسها."
                : "Create a login account for each university so it can review and update its own applications."}
            </p>
          </div>
        </div>

        {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 p-5 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الاسم" : "Name"}</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "البريد الإلكتروني" : "Email"}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "كلمة المرور" : "Password"}</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الجامعة" : "University"}</span>
            <select
              value={form.universityId}
              onChange={(event) => setForm((current) => ({ ...current, universityId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            >
              <option value="">{isArabic ? "اختر جامعة" : "Select a university"}</option>
              {universities.map((university) => (
                <option key={university._id} value={university._id}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            {creating ? (isArabic ? "جارٍ الإنشاء..." : "Creating...") : isArabic ? "إنشاء الحساب" : "Create Account"}
          </button>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">{isArabic ? "الحساب" : "Account"}</th>
                <th className="px-6 py-4 font-medium">{isArabic ? "الجامعة المرتبطة" : "Linked University"}</th>
                <th className="px-6 py-4 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-6 py-4 font-medium">{isArabic ? "تاريخ الإنشاء" : "Created"}</th>
                <th className="px-6 py-4 font-medium">{isArabic ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const linked = typeof account.linkedUniversity === "object" ? account.linkedUniversity : null;
                return (
                  <tr key={account._id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">{account.name}</p>
                      <p className="mt-1 text-slate-500">{account.email}</p>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{linked?.name || "—"}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          account.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {account.isActive === false ? (isArabic ? "معطّل" : "Inactive") : isArabic ? "نشط" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{formatDate(account.createdAt)}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleToggleActive(account)}
                        className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                      >
                        {account.isActive === false ? (isArabic ? "تفعيل" : "Activate") : isArabic ? "تعطيل" : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {isArabic ? "لا توجد حسابات جامعات بعد." : "No university accounts yet."}
          </div>
        ) : null}
      </section>
    </div>
  );
};
