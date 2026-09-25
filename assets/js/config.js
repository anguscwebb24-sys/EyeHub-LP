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
    publicKey: 'dTQbp8j8tt5nCs9jz',
    serviceId: 'service_07qoduv',
    templateId: 'template_bnp3yyk',
    autoReplyTemplateId: '',   // optional: a second template that emails the visitor a "we've got it" note
  },

  // ---- Times offered in the booking widget (Queensland time, no daylight saving) ----
  availability: {
    daysAhead: 10,             // clinic days to offer
    startFromTomorrow: true,   // never offer same-day times (reception needs time to confirm)
    // Days the online assessment diary is open: 0 = Sunday ... 6 = Saturday
    weekdays: [1, 3, 5],       // Monday, Wednesday, Friday
    // 15-minute slots, 9:30am to 4:00pm AEST (the last slot starts at 3:45pm)
    slots: {
      morning: ['9:30', '9:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'],
      afternoon: ['12:00', '12:15', '12:30', '12:45', '1:00', '1:15', '1:30', '1:45', '2:00', '2:15', '2:30', '2:45', '3:00', '3:15', '3:30', '3:45'],
    },
    // Public holidays and clinic closures (YYYY-MM-DD). Refresh every year.
    closedDates: ['2026-10-05', '2026-12-25', '2026-12-28', '2027-01-01', '2027-01-26', '2027-03-26', '2027-03-29', '2027-04-26', '2027-05-03'],
    // Demo only: share of greyed-out "not offered" times shown while EmailJS keys are placeholders.
    // Ignored automatically once real keys are entered.
    mockBookedRatio: 0.22,
  },
};
