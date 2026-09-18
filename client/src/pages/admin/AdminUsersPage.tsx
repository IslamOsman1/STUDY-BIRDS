import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Shield, UserCog } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { Role, University, User } from "../../types";
import { universityService } from "../../services/universityService";
import { getPaginatedItems } from "../../utils/pagination";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";

const roleOptions: Role[] = ["student", "partner", "admin", "parent", "university"];

export const AdminUsersPage = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [formError, setFormError] = useState("");
  const isArabic = language === "ar";
  const universityDialog = useRef<HTMLDialogElement>(null);
  const [universityUser, setUniversityUser] = useState<User | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [savingUniversity, setSavingUniversity] = useState(false);
  const [universityError, setUniversityError] = useState("");

  useEffect(() => {
    if (!universityUser) {
      universityDialog.current?.close();
      return;
    }
    universityDialog.current?.showModal();
    let cancelled = false;
    setLoadingUniversities(true);
    setUniversities([]);
    universityService.getAll().then((data) => {
      if (!cancelled) setUniversities(getPaginatedItems(data));
    }).catch((error) => {
      if (!cancelled) setUniversityError(getErrorMessage(error, isArabic ? "تعذر تحميل الجامعات. أغلق النافذة وحاول مجددًا." : "Unable to load universities. Close and try again."));
    }).finally(() => {
      if (!cancelled) setLoadingUniversities(false);
    });
    return () => { cancelled = true; };
  }, [universityUser, isArabic]);

  const openUniversityDialog = (user: User) => {
    setUniversityId(typeof user.linkedUniversity === "string" ? user.linkedUniversity : user.linkedUniversity?._id || "");
    setUniversityError("");
    setUniversityUser(user);
  };

  const saveUniversity = async () => {
    if (!universityUser || !universityId || savingUniversity) return;
    setSavingUniversity(true);
    setUniversityError("");
    try {
      const updated = await adminService.updateUser(universityUser._id, { role: "university", linkedUniversity: universityId });
      setUsers((current) => current.map((user) => user._id === updated._id ? updated : user));
      setUniversityUser(null);
    } catch (error) {
      setUniversityError(getErrorMessage(error, isArabic ? "تعذر ربط الحساب بالجامعة." : "Unable to link the university account."));
    } finally {
      setSavingUniversity(false);
    }
  };

  useEffect(() => {
    adminService.getUsers().then(setUsers).catch((error) => setFormError(getErrorMessage(error, "Unable to load users.")));
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery =
          !query ||
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesQuery && matchesRole;
      }),
    [query, roleFilter, users]
  );

  const handlePatch = async (id: string, payload: Partial<User>) => {
    setFormError("");
    try {
      const updated = await adminService.updateUser(id, payload);
      setUsers((current) => current.map((user) => (user._id === id ? updated : user)));
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update this account."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Users & access</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{dt(language, "manageAllUsers")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {dt(language, "accessHelp")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{dt(language, "search")}</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" className="w-full border-none p-0 outline-none" />
              </div>
            </label>
            <label className="rounded-2xl border border-slate-200 px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{dt(language, "roleFilter")}</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | Role)} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="all">{dt(language, "allRoles")}</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">{dt(language, "roleFilter")}</th>
                <th className="px-6 py-4 font-medium">{dt(language, "status")}</th>
                <th className="px-6 py-4 font-medium">{dt(language, "joined")}</th>
                <th className="px-6 py-4 font-medium">{dt(language, "lastLogin")}</th>
                <th className="px-6 py-4 font-medium">{dt(language, "actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-slate-100 align-top">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <UserCog className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="mt-1 text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={user.role}
                      aria-label={isArabic ? `نوع حساب ${user.name}` : `Account role for ${user.name}`}
                      onChange={(event) => event.target.value === "university"
                        ? openUniversityDialog(user)
                        : handlePatch(user._id, { role: event.target.value as Role })}
                      className="rounded-full border border-slate-200 px-3 py-2 capitalize outline-none"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    {user.role === "university" ? (
                      <button type="button" onClick={() => openUniversityDialog(user)} className="mt-2 block text-sm text-brand-700 underline">
                        {isArabic ? "اختيار الجامعة المرتبطة" : "Choose linked university"}
                      </button>
                    ) : null}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {user.isActive === false ? dt(language, "inactive") : dt(language, "active")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-5 text-slate-600">{user.lastLoginAt ? formatDate(user.lastLoginAt) : dt(language, "notYet")}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handlePatch(user._id, { isActive: user.isActive === false })}
                        className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                      >
                        {user.isActive === false ? dt(language, "activate") : dt(language, "deactivate")}
                      </button>
                      <button
                        onClick={() => handlePatch(user._id, { role: "admin" })}
                        className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white"
                      >
                        {dt(language, "makeAdmin")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 ? <div className="px-6 py-10 text-center text-sm text-slate-500">{dt(language, "noUsersMatch")}</div> : null}
      </section>

      <dialog ref={universityDialog} aria-labelledby="link-university-title" dir={isArabic ? "rtl" : "ltr"}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
        onCancel={(event) => { event.preventDefault(); if (!savingUniversity) setUniversityUser(null); }}>
        <form onSubmit={(event) => { event.preventDefault(); void saveUniversity(); }} className="space-y-5">
          <h2 id="link-university-title" className="text-xl font-semibold">{isArabic ? "اختيار الجامعة المرتبطة" : "Choose linked university"}</h2>
          <p className="text-sm text-slate-500">{universityUser?.name} — {universityUser?.email}</p>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">{isArabic ? "الجامعة" : "University"}</span>
            <select autoFocus required value={universityId} onChange={(event) => setUniversityId(event.target.value)}
              disabled={loadingUniversities || savingUniversity} className="w-full rounded-xl border border-slate-200 px-3 py-3">
              <option value="">{isArabic ? "اختر جامعة" : "Select a university"}</option>
              {universities.map((university) => <option key={university._id} value={university._id}>{university.name}{university.city ? ` — ${university.city}` : ""}</option>)}
            </select>
          </label>
          {loadingUniversities ? <p role="status">{isArabic ? "جارٍ تحميل الجامعات…" : "Loading universities…"}</p> : null}
          {!loadingUniversities && !universityError && universities.length === 0 ? <p>{isArabic ? "لا توجد جامعات. أضف جامعة أولًا من إدارة الجامعات." : "No universities available. Add a university first."}</p> : null}
          {universityError ? <p role="alert" className="text-sm text-rose-700">{universityError}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" disabled={savingUniversity} onClick={() => setUniversityUser(null)} className="rounded-full border px-5 py-2 disabled:opacity-50">{isArabic ? "إلغاء" : "Cancel"}</button>
            <button type="submit" disabled={savingUniversity || loadingUniversities || !universities.some((item) => item._id === universityId)} className="rounded-full bg-slate-950 px-5 py-2 text-white disabled:opacity-50">
              {savingUniversity ? (isArabic ? "جارٍ الحفظ…" : "Saving…") : (isArabic ? "تأكيد وحفظ" : "Confirm and save")}
            </button>
          </div>
        </form>
      </dialog>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-brand-700" />
            <p className="font-semibold text-slate-900">{dt(language, "accessPolicy")}</p>
          </div>
          <p className="mt-3 text-sm text-slate-500">{dt(language, "onlyActiveAccess")}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">{dt(language, "adminAccounts")}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{users.filter((user) => user.role === "admin").length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">{dt(language, "inactiveUsers")}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{users.filter((user) => user.isActive === false).length}</p>
        </div>
      </section>
    </div>
  );
};
