import { useEffect, useRef, useState } from "react";
import { adminService } from "../../services/adminService";
import { employeeSections } from "../../utils/employeeAccess";
import { getErrorMessage } from "../../utils/errors";
import { useLanguage } from "../../hooks/useLanguage";
import type { User } from "../../types";

export const EmployeePermissionsDialog = ({ user, onClose, onSaved }: {
  user: User | null; onClose: () => void; onSaved: (user: User) => void;
}) => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) { dialog.current?.close(); return; }
    setSelected(employeeSections.filter((s) => user.permissions?.includes(s.key)).map((s) => s.key));
    setError("");
    dialog.current?.showModal();
  }, [user]);
  const save = async () => {
    if (!user || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await adminService.updateUser(user._id, { role: "employee", permissions: selected });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, ar ? "تعذر حفظ صلاحيات الموظف." : "Unable to save employee permissions."));
    } finally { setSaving(false); }
  };
  return <dialog ref={dialog} aria-labelledby="employee-permissions-title" dir={ar ? "rtl" : "ltr"}
    onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}
    className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl backdrop:bg-slate-950/50">
    <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-5">
      <h2 id="employee-permissions-title" className="text-xl font-semibold">{ar ? "صلاحيات الموظف" : "Employee permissions"}</h2>
      <p className="text-sm text-slate-600">{user?.name} — {user?.email}</p>
      <p className="text-sm text-slate-600">{ar ? "اختر قسمًا أو أكثر للسماح بعرض وإدارة بياناته. إدارة المستخدمين والصلاحيات للأدمن فقط." : "Choose one or more sections to view and manage. Only admins can manage users and permissions."}</p>
      <fieldset disabled={saving} className="space-y-3">
        <legend className="sr-only">{ar ? "الأقسام المسموحة" : "Allowed sections"}</legend>
        <div className="flex gap-4">
          <button type="button" onClick={() => setSelected(employeeSections.map((s) => s.key))} className="text-sm underline">{ar ? "تحديد الكل" : "Select all"}</button>
          <button type="button" onClick={() => setSelected([])} className="text-sm underline">{ar ? "إلغاء الكل" : "Clear all"}</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {employeeSections.map((section) => <label key={section.key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
            <input type="checkbox" checked={selected.includes(section.key)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, section.key] : current.filter((key) => key !== section.key))} />
            {ar ? section.ar : section.en}
          </label>)}
        </div>
      </fieldset>
      {!selected.length ? <p className="text-sm text-amber-700">{ar ? "بدون أقسام، لن يستطيع الموظف فتح أي قسم إداري." : "Without sections, this employee cannot access any management section."}</p> : null}
      {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onClose} className="rounded-full border px-5 py-2">{ar ? "إلغاء" : "Cancel"}</button>
        <button disabled={saving} type="submit" className="rounded-full bg-slate-950 px-5 py-2 text-white disabled:opacity-50">{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ الصلاحيات" : "Save permissions")}</button>
      </div>
    </form>
  </dialog>;
};
