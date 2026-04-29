import { useEffect, useMemo, useState } from "react";
import { Search, Shield, UserCog } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { Role, User } from "../../types";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";

const roleOptions: Role[] = ["student", "partner", "admin"];

export const AdminUsersPage = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [formError, setFormError] = useState("");

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
                      onChange={(event) => handlePatch(user._id, { role: event.target.value as Role })}
                      className="rounded-full border border-slate-200 px-3 py-2 capitalize outline-none"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
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
