// Per-application summary for "My Applications" (PRD 15) and the detail
// header (PRD 16), built from the student's own records and the journey
// stages already computed by studentJourneys.
const { applicationStatusInfo } = require('../constants/statusCatalog');
const { VISA_LABELS } = require('./studentHome');

// Journey stage states (utils/studentJourney.js) in plain language.
const STAGE_LABELS = {
  'action-required': ['مطلوب منك إجراء', 'Action needed from you', 'action'],
  waiting: ['بانتظار الفريق أو الجامعة', 'Waiting on the team or university', 'info'],
  completed: ['مكتمل', 'Completed', 'success'],
  overdue: ['متأخر', 'Overdue', 'danger'],
  'not-issued': ['لا توجد فاتورة بعد', 'No invoice yet', 'neutral'],
  rejected: ['غير مقبول', 'Not accepted', 'danger'],
};
const stageSummary = (stage) => {
  if (!stage) return null;
  const [labelAr, labelEn, tone] = STAGE_LABELS[stage.status] || [stage.status, stage.status, 'info'];
  return { status: stage.status, labelAr, labelEn, tone };
};
const id = (value) => String(value?._id || value || '');

function applicationCard(app, journey) {
  const program = app.program || {};
  const university = program.university || {};
  const stage = (key) => (journey?.stages || []).find((item) => item.key === key);
  const visaStatus = app.visaCase?.status;
  const lastTimeline = (app.statusTimeline || []).map((entry) => entry.changedAt).filter(Boolean)
    .map((date) => new Date(date)).sort((a, b) => b - a)[0];
  const lastUpdate = [lastTimeline, app.updatedAt && new Date(app.updatedAt)].filter(Boolean).sort((a, b) => b - a)[0] || null;
  return {
    university: university.name || '',
    program: program.title || '',
    degreeLevel: program.degreeLevel || '',
    language: program.language || '',
    duration: program.duration || '',
    country: university.country?.name || '',
    city: university.city || '',
    campus: university.city || '',
    intake: program.intake || app.applicantProfile?.intake || '',
    applicationStatus: applicationStatusInfo(app),
    admissionStatus: stageSummary(stage('admission')),
    documentsStatus: stageSummary(stage('documents')),
    paymentStatus: stageSummary(stage('payments')),
    visaStatus: visaStatus ? { status: visaStatus, labelAr: VISA_LABELS[visaStatus]?.[0] || visaStatus, labelEn: VISA_LABELS[visaStatus]?.[1] || visaStatus } : null,
    consultant: journey?.followUp?.advisor?.name || null,
    lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
    nextAction: journey?.nextAction ? {
      code: journey.nextAction.code, titleAr: journey.nextAction.titleAr, titleEn: journey.nextAction.titleEn,
      descriptionAr: journey.nextAction.descriptionAr, destination: journey.nextAction.destination, waiting: Boolean(journey.nextAction.waiting),
    } : null,
    applicationId: id(app),
  };
}

module.exports = { applicationCard };
