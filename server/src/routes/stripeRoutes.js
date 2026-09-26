// #34: Stripe payment gateway — uses raw fetch so no stripe npm package needed.
// Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const run = require('../utils/asyncHandler');
const Invoice = require('../models/Invoice');
const StudentWalletEntry = require('../models/StudentWalletEntry');
const Notification = require('../models/Notification');
const { sendPushToUser } = require('../utils/pushNotifications');

const router = express.Router();

const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

async function stripePost(path, params) {
  if (!stripeEnabled()) throw Object.assign(new Error('Stripe not configured'), { httpStatus: 503 });
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.STRIPE_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error?.message || 'Stripe error'), { httpStatus: 502 });
  return data;
}

function verifyStripeSignature(rawBody, sigHeader) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) return null;
  const { createHmac } = require('node:crypto');
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
  const timestamp = parts.t;
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return null;
  const expected = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`).digest('hex');
  return parts.v1 === expected ? JSON.parse(rawBody) : null;
}

router.get('/status', (req, res) => res.json({ enabled: stripeEnabled() }));

router.post('/checkout', protect, run(async (req, res) => {
  const { invoiceId } = req.body;
  if (!invoiceId) return res.status(400).json({ message: 'invoiceId required' });
  const invoice = await Invoice.findOne({ _id: invoiceId, student: req.user._id, status: 'unpaid' });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found or already paid' });
  const origin = process.env.CLIENT_URL || 'https://studybirds.net';
  const session = await stripePost('checkout/sessions', {
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(Math.round((invoice.amount - (invoice.walletCreditApplied || 0)) * 100)),
    'line_items[0][price_data][product_data][name]': invoice.description || `Invoice ${invoice.invoiceNumber}`,
    'line_items[0][quantity]': '1',
    mode: 'payment',
    success_url: `${origin}/student/payments?stripe=success&invoice=${invoice._id}`,
    cancel_url: `${origin}/student/payments?stripe=cancel`,
    'metadata[invoiceId]': String(invoice._id),
    'metadata[studentId]': String(req.user._id),
  });
  res.json({ url: session.url, sessionId: session.id });
}));

// Stripe sends raw body — must be registered BEFORE express.json() parses it.
// Since app.js applies express.json() globally before this router, we parse
// via the raw body stored by express. As a workaround, we collect the raw
// body using a dedicated middleware registered here before the route.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ message: 'Missing signature' });
  let event;
  try {
    event = verifyStripeSignature(req.body.toString('utf8'), sig);
  } catch {
    return res.status(400).json({ message: 'Invalid signature' });
  }
  if (!event) return res.status(400).json({ message: 'Signature verification failed' });

  if (event.type === 'checkout.session.completed') {
    const meta = event.data.object.metadata;
    const invoiceId = meta?.invoiceId;
    const studentId = meta?.studentId;
    if (invoiceId && studentId) {
      try {
        const updated = await Invoice.findOneAndUpdate(
          { _id: invoiceId, status: 'unpaid' },
          { $set: { status: 'paid', reviewedAt: new Date(), stripeSessionId: event.data.object.id } },
          { new: true }
        );
        if (updated) {
          await Notification.create({ user: studentId, title: 'تم استلام الدفع بنجاح', message: `تم تأكيد دفع الفاتورة ${updated.invoiceNumber || ''}.`, type: 'success', link: '/student/payments' });
          sendPushToUser(studentId, { title: 'تم استلام الدفع', body: 'تم تأكيد دفعتك بنجاح.', link: '/student/payments' }).catch(() => {});
        }
      } catch (err) {
        console.error('[Stripe webhook] failed to mark invoice paid:', err.message);
      }
    }
  }
  res.json({ received: true });
});

module.exports = router;
