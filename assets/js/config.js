/* =========================================================
   EyeHub landing page settings
   This is the ONLY file you need to edit to go live.
   ========================================================= */
window.EYEHUB_CONFIG = {

  clinicPhone: '07 5220 8990',

  // ---- EmailJS (https://www.emailjs.com) ------------------------------------
  // 1. Email Services  ->  add the clinic mailbox  ->  copy the Service ID
  // 2. Email Templates ->  create the clinic notification template (see emailjs-templates/) -> copy the Template ID
  // 3. Account -> General -> copy the Public Key
  // Paste the three values below. Until all three are real, the form runs in demo mode (nothing is sent).
  emailjs: {
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    autoReplyTemplateId: '',   // optional: a second template that emails the visitor a "we've got it" note
  },

  // ---- Times offered in the booking widget (Queensland time, no daylight saving) ----
  availability: {
    daysAhead: 10,             // business days to offer
    startFromTomorrow: true,   // never offer same-day times (reception needs time to confirm)
    // Public holidays and clinic closures (YYYY-MM-DD). Refresh every year.
    closedDates: ['2026-10-05', '2026-12-25', '2026-12-28', '2027-01-01', '2027-01-26', '2027-03-26', '2027-03-29', '2027-04-26', '2027-05-03'],
    // Demo only: share of greyed-out "not offered" times shown while EmailJS keys are placeholders.
    // Ignored automatically once real keys are entered.
    mockBookedRatio: 0.22,
  },
};
