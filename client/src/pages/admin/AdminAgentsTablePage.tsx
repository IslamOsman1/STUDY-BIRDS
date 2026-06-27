import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Mail, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import type { AdminPartnerDetails, AdminPartnerItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";
import { formatCurrency, formatDate } from "../../utils/format";
import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";

const PAGE_SIZE = 8;

export const AdminAgentsTablePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();
  const { id } = useParams();
  const [agents, setAgents] = useState<AdminPartnerItem[]>([]);
  const [details, setDetails] = useState<AdminPartnerDetails | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate" | "clear">("activate");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  useEffect(() => {
    adminService.getPartners().then(setAgents).catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل الوكلاء." : "Unable to load agents.")));
  }, [isArabic]);

  useEffect(() => {
    if (!id) {
      setDetails(null);
      return;
    }

    setLoadingDetails(true);
    adminService
      .getPartnerDetails(id)
      .then(setDetails)
      .catch((issue) => {
        const message = getErrorMessage(issue, isArabic ? "تعذر تحميل بيانات الوكيل." : "Unable to load agent details.");
        setError(message);
        pushToast(message, "error");
      })
      .finally(() => setLoadingDetails(false));
  }, [id, isArabic, pushToast]);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return agents;
    }

    return agents.filter((agent) =>
      [agent.name, agent.email, agent.profile?.companyName || "", agent.profile?.location || "", agent.profile?.website || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [agents, query]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
  const visibleAgents = useMemo(() => filteredAgents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredAgents, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((agentId) => filteredAgents.some((agent) => agent._id === agentId)));
  }, [filteredAgents]);

  const allVisibleSelected = visibleAgents.length > 0 && visibleAgents.every((agent) => selectedIds.includes(agent._id));

  const toggleSelection = (agentId: string) => {
    setSelectedIds((current) => (current.includes(agentId) ? current.filter((value) => value !== agentId) : [...current, agentId]));
  };

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((value) => !visibleAgents.some((agent) => agent._id === value)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleAgents.map((agent) => agent._id)])));
  };

  const executeBulkAction = async () => {
    if (bulkAction === "clear") {
      setSelectedIds([]);
      setBulkOpen(false);
      pushToast(isArabic ? "تم إلغاء التحديد." : "Selection cleared.", "success");
      return;
    }

    setBulkLoading(true);
    setError("");

    try {
      const shouldActivate = bulkAction === "activate";
      const updatedAgents = await Promise.all(selectedIds.map((agentId) => adminService.updateUser(agentId, { isActive: shouldActivate })));
      const map = new Map(updatedAgents.map((agent) => [agent._id, agent]));
      setAgents((current) => current.map((agent) => (map.has(agent._id) ? ({ ...agent, ...map.get(agent._id) } as AdminPartnerItem) : agent)));
      if (details && map.has(details.partner._id)) {
        setDetails((current) => (current ? { ...current, partner: { ...current.partner, ...map.get(current.partner._id) } } : current));
      }
      setSelectedIds([]);
      setBulkOpen(false);
      pushToast(
        shouldActivate
          ? isArabic ? "تم تفعيل الوكلاء المحددين." : "Selected agents activated."
          : isArabic ? "تم تعطيل الوكلاء المحددين." : "Selected agents deactivated.",
        "success"
      );
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تنفيذ الإجراء الجماعي." : "Unable to complete the bulk action.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "كل الوكلاء" : "All Agents"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "عرض احترافي للوكلاء مع إجراءات جماعية وحالة التوثيق." : "Professional table view for agents with bulk actions and verification status."}</p>
          </div>
          <label className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالاسم أو البريد أو اسم الشركة" : "Search by name, email, or company"} className="w-full border-none p-0 outline-none" />
            </div>
          </label>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[560px_1fr]">
        <section className="space-y-4">
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectVisible} />
                  {isArabic ? "تحديد الصفحة" : "Select page"}
                </label>
                <span className="text-sm text-slate-500">{isArabic ? `${selectedIds.length} محدد` : `${selectedIds.length} selected`}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value as typeof bulkAction)} className="rounded-full border border-slate-200 px-3 py-2 text-sm outline-none">
                  <option value="activate">{isArabic ? "تفعيل المحدد" : "Activate selected"}</option>
                  <option value="deactivate">{isArabic ? "تعطيل المحدد" : "Deactivate selected"}</option>
                  <option value="clear">{isArabic ? "إلغاء التحديد" : "Clear selection"}</option>
                </select>
                <button type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOpen(true)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {isArabic ? "تنفيذ" : "Apply"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium"></th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "الوكيل" : "Agent"}</th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "الشركة" : "Company"}</th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "التوثيق" : "Verification"}</th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "الانضمام" : "Joined"}</th>
                    <th className="px-4 py-3 font-medium">{isArabic ? "إجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAgents.map((agent) => {
                    const isActiveAgent = details?.partner._id === agent._id || id === agent._id;
                    return (
                      <tr key={agent._id} className={`border-t border-slate-100 ${isActiveAgent ? "bg-brand-50/40" : ""}`}>
                        <td className="px-4 py-4">
                          <input type="checkbox" checked={selectedIds.includes(agent._id)} onChange={() => toggleSelection(agent._id)} />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{agent.name}</p>
                            <p className="mt-1 text-slate-500">{agent.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{agent.profile?.companyName || (isArabic ? "غير متوفر" : "Not provided")}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${agent.profile?.verificationStatus === "verified" ? "bg-emerald-100 text-emerald-700" : agent.profile?.verificationStatus === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                            {agent.profile?.verificationStatus || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${agent.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {agent.isActive === false ? (isArabic ? "معطل" : "Inactive") : isArabic ? "نشط" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(agent.createdAt)}</td>
                        <td className="px-4 py-4">
                          <button type="button" onClick={() => navigate(`/admin/agents/${agent._id}`)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                            {isArabic ? "عرض الملف" : "View profile"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          {filteredAgents.length === 0 ? <div className="panel px-6 py-12 text-center text-sm text-slate-500">{isArabic ? "لا توجد نتائج مطابقة." : "No agents match your search."}</div> : null}
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredAgents.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </section>

        <section className="panel p-6">
          {!id ? (
            <div className="flex min-h-[420px] items-center justify-center text-center text-sm text-slate-500">{isArabic ? "اختر وكيلًا من القائمة لعرض ملفه الكامل." : "Select an agent from the list to view the full profile."}</div>
          ) : loadingDetails ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">{isArabic ? "جارٍ تحميل بيانات الوكيل..." : "Loading agent details..."}</div>
          ) : details ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900">{details.partner.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{details.partner.profile?.companyName || (isArabic ? "ملف وكيل بدون اسم شركة" : "Agent profile without a company name")}</p>
                </div>
                <Link to="/admin/agents" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  <ArrowLeft className="h-4 w-4" />
                  {isArabic ? "العودة للقائمة" : "Back to list"}
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-brand-700" /> {isArabic ? "الطلاب" : "Students"}</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{details.students.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-brand-700" /> {isArabic ? "التوثيق" : "Verification"}</div>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{details.partner.profile?.verificationStatus || "pending"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{isArabic ? "إجمالي السحوبات" : "Payout Requests"}</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{details.payoutRequests.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{isArabic ? "التذاكر" : "Support Tickets"}</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{details.supportTickets.length}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "بيانات الوكيل" : "Agent Profile"}</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">{isArabic ? "البريد:" : "Email:"}</span> {details.partner.email}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "الهاتف:" : "Phone:"}</span> {details.partner.profile?.phone || "--"}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "الشركة:" : "Company:"}</span> {details.partner.profile?.companyName || "--"}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "الموقع:" : "Location:"}</span> {details.partner.profile?.location || "--"}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "الموقع الإلكتروني:" : "Website:"}</span> {details.partner.profile?.website ? <a href={details.partner.profile.website} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">{details.partner.profile.website}</a> : "--"}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "كود الإحالة:" : "Referral Code:"}</span> {details.partner.profile?.referralCode || "--"}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "تاريخ الانضمام:" : "Joined:"}</span> {formatDate(details.partner.createdAt)}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "ملخص مالي" : "Financial Snapshot"}</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">{isArabic ? "طلبات السحب المعلقة:" : "Pending payouts:"}</span> {details.payoutRequests.filter((item) => item.status === "pending").length}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "طلبات السحب المدفوعة:" : "Paid payouts:"}</span> {details.payoutRequests.filter((item) => item.status === "paid").length}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "قيود المحفظة:" : "Wallet entries:"}</span> {details.walletEntries.length}</p>
                    <p><span className="font-semibold text-slate-900">{isArabic ? "آخر حركة:" : "Latest entry:"}</span> {details.walletEntries[0] ? `${formatCurrency(details.walletEntries[0].amount)} • ${details.walletEntries[0].kind}` : "--"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "الطلاب التابعون للوكيل" : "Agent Students"}</h3>
                <div className="mt-4 space-y-3">
                  {details.students.map((student) => (
                    <div key={student._id} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{student.email}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{student.applicationStatus}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p><Mail className="mr-1 inline h-4 w-4" />{student.email}</p>
                        <p><Phone className="mr-1 inline h-4 w-4" />{student.phone}</p>
                        <p>{isArabic ? "الجامعة المطلوبة:" : "Desired University:"} {student.desiredUniversity || "--"}</p>
                        <p>{isArabic ? "البرنامج المطلوب:" : "Desired Program:"} {student.desiredProgram || "--"}</p>
                      </div>
                    </div>
                  ))}
                  {details.students.length === 0 ? <p className="text-sm text-slate-500">{isArabic ? "لا يوجد طلاب لهذا الوكيل حتى الآن." : "This agent has no students yet."}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "آخر طلبات السحب" : "Recent Payout Requests"}</h3>
                  <div className="mt-4 space-y-3">
                    {details.payoutRequests.slice(0, 5).map((request) => (
                      <div key={request._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{formatCurrency(request.amount)}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{request.status}</span>
                        </div>
                        <p className="mt-2">{request.method} • {formatDate(request.createdAt)}</p>
                      </div>
                    ))}
                    {details.payoutRequests.length === 0 ? <p className="text-sm text-slate-500">{isArabic ? "لا توجد طلبات سحب." : "No payout requests yet."}</p> : null}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "آخر التذاكر" : "Recent Tickets"}</h3>
                  <div className="mt-4 space-y-3">
                    {details.supportTickets.slice(0, 5).map((ticket) => (
                      <div key={ticket._id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{ticket.subject}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{ticket.status}</span>
                        </div>
                        <p className="mt-2 line-clamp-2">{ticket.message}</p>
                      </div>
                    ))}
                    {details.supportTickets.length === 0 ? <p className="text-sm text-slate-500">{isArabic ? "لا توجد تذاكر دعم." : "No support tickets yet."}</p> : null}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{isArabic ? "مستندات التوثيق" : "Verification Documents"}</h3>
                <div className="mt-4 space-y-3">
                  {details.verificationDocuments.map((document) => (
                    <div key={document._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <div>
                        <p className="font-semibold text-slate-900">{document.fileName}</p>
                        <p className="mt-1">{document.type} • {formatDate(document.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{document.status}</span>
                        <a href={document.filePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          {isArabic ? "فتح" : "Open"}
                        </a>
                      </div>
                    </div>
                  ))}
                  {details.verificationDocuments.length === 0 ? <p className="text-sm text-slate-500">{isArabic ? "لا توجد مستندات توثيق." : "No verification documents yet."}</p> : null}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
      <AdminConfirmationModal
        open={bulkOpen}
        title={isArabic ? "تأكيد الإجراء الجماعي" : "Confirm bulk action"}
        description={
          bulkAction === "activate"
            ? isArabic ? `سيتم تفعيل ${selectedIds.length} وكيل/وكلاء.` : `${selectedIds.length} selected agent(s) will be activated.`
            : bulkAction === "deactivate"
              ? isArabic ? `سيتم تعطيل ${selectedIds.length} وكيل/وكلاء.` : `${selectedIds.length} selected agent(s) will be deactivated.`
              : isArabic ? "سيتم إلغاء جميع التحديدات الحالية." : "The current selection will be cleared."
        }
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={bulkLoading}
        onConfirm={executeBulkAction}
        onClose={() => !bulkLoading && setBulkOpen(false)}
      />
    </div>
  );
};
