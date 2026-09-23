const { isPostAdmissionEligible } = require('./postAdmissionJourney');

// PRD item 37 (Visa Processing Center) states, in the documented order.
const VISA_STATES = ['not-started', 'preparing-documents', 'ready', 'submitted', 'under-review', 'approved', 'rejected'];

function isVisaCaseEligible(app) {
  return isPostAdmissionEligible(app);
}

function visaCaseView(app) {
  const visaCase = app.visaCase || {};
  return {
    version: app.__v,
    eligible: isVisaCaseEligible(app),
    status: visaCase.status || 'not-started',
    requirements: (visaCase.requirements || []).map(r => ({ label: r.label, done: Boolean(r.done) })),
    appointment: { date: visaCase.appointment?.date || null, location: visaCase.appointment?.location || '' },
    insurance: {
      provider: visaCase.insurance?.provider || '',
      policyNumber: visaCase.insurance?.policyNumber || '',
      expiresAt: visaCase.insurance?.expiresAt || null,
    },
    notes: visaCase.notes || '',
    updatedAt: visaCase.updatedAt || null,
  };
}

module.exports = { VISA_STATES, isVisaCaseEligible, visaCaseView };
