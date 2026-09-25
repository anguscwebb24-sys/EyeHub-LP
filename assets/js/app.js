/* =========================================================
   EyeHub: Free Online Suitability Assessment
   Booking engine + page interactions (no frameworks)
   ========================================================= */
(function () {
  'use strict';

  // Entrance animations only apply once JS has booted, so no-JS viewers see the page at rest.
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------
     CONFIG: the only things the agency needs to change
     --------------------------------------------------------- */
  const DEFAULTS = {
    clinicName: 'EyeHub',
    clinicPhone: '07 5220 8990',
    emailjs: { publicKey: 'YOUR_PUBLIC_KEY', serviceId: 'YOUR_SERVICE_ID', templateId: 'YOUR_TEMPLATE_ID', autoReplyTemplateId: '' },
    availability: {
      daysAhead: 10, startFromTomorrow: true, weekdays: [1, 2, 3, 4, 5],
      slots: { morning: ['8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30'], afternoon: ['12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00'] },
      mockBookedRatio: 0.22, closedDates: [],
    },
  };
  // Everything editable lives in assets/js/config.js (window.EYEHUB_CONFIG); the defaults above are fallbacks.
  const USER = window.EYEHUB_CONFIG || {};
  const CONFIG = {
    ...DEFAULTS, ...USER,
    emailjs: { ...DEFAULTS.emailjs, ...(USER.emailjs || {}) },
    availability: { ...DEFAULTS.availability, ...(USER.availability || {}) },
  };

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('nofx');
  const TOUCH = matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (REDUCED) document.documentElement.classList.add('nofx');

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const isConfigured = () => !/^YOUR_/.test(CONFIG.emailjs.publicKey) && !/^YOUR_/.test(CONFIG.emailjs.serviceId) && !/^YOUR_/.test(CONFIG.emailjs.templateId);

  /* ---------------------------------------------------------
     Icons (inline SVG, stroke = currentColor)
     --------------------------------------------------------- */
  const svg = inner => `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const I = {
    calendar: svg('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    lock: svg('<rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  };

  /* ---------------------------------------------------------
     Date helpers (Queensland = UTC+10, no DST)
     --------------------------------------------------------- */
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const dayHint = () => {
    const w = CONFIG.availability.weekdays;
    if (w.length === 5 && [1, 2, 3, 4, 5].every(d => w.includes(d))) return "Mon to Fri";
    const names = w.map(d => DOW[d]);
    return names.length > 1 ? names.slice(0, -1).join(", ") + " & " + names[names.length - 1] : names[0];
  };

  function businessDays() {
    const out = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (CONFIG.availability.startFromTomorrow) d.setDate(d.getDate() + 1);
    let guard = 0;
    while (out.length < CONFIG.availability.daysAhead && guard++ < 60) {
      const key = iso(d);
      if (CONFIG.availability.weekdays.includes(d.getDay()) && !CONFIG.availability.closedDates.includes(key)) {
        out.push({ key, date: new Date(d), dow: DOW[d.getDay()], dowLong: DOW_LONG[d.getDay()], day: d.getDate(), mon: MON[d.getMonth()], monLong: MON_LONG[d.getMonth()] });
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  // Deterministic "not offered" pattern for the DEMO only. Always false once real EmailJS keys are set.
  function isTaken(dateKey, time) {
    if (isConfigured()) return false;
    // FNV-1a with a final avalanche, so the greyed-out pattern is evenly spread across days
    let h = 2166136261;
    const s = dateKey + '|' + time;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13; h >>>= 0;
    return (h % 1000) / 1000 < CONFIG.availability.mockBookedRatio;
  }

  function to24(t, period) {
    let [h, m] = t.split(':').map(Number);
    if (period === 'afternoon' && h < 12) h += 12;
    return { h, m };
  }
  function labelTime(t, period) {
    const { h, m } = to24(t, period);
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${pad(m)} ${h >= 12 ? 'pm' : 'am'}`;
  }

  /* ---------------------------------------------------------
     Lead source (UTM / click IDs): passed through to the clinic email so they can see which ad booked
     --------------------------------------------------------- */
  function leadSource() {
    const p = new URLSearchParams(location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    const parts = keys.filter(k => p.get(k)).map(k => `${k}=${p.get(k)}`);
    return parts.length ? parts.join(' · ') : 'Direct / untagged';
  }

  /* ---------------------------------------------------------
     Booking widget: can be mounted more than once (hero + final CTA)
     --------------------------------------------------------- */
  function mountBooking(root, idx) {
    const days = businessDays();
    const state = { day: null, time: null, period: null, about: null };
    const uid = `bk${idx}`;
    let sending = false;
    let aboutTouched = false; // once the visitor picks an answer themselves, the page never overrides it

    const field = (name, id, label, type, ac, extra, errText, full) => `
            <div class="input-wrap${full ? ' full' : ''}">
              <input class="input" type="${type}" name="${name}" id="${uid}-${id}" placeholder=" " autocomplete="${ac}" ${extra} required aria-describedby="${uid}-${id}-err">
              <label for="${uid}-${id}">${label}</label>
              <span class="err" id="${uid}-${id}-err">${errText}</span>
            </div>`;

    root.innerHTML = `
      <div class="booking-head">
        <h2>Book your free online assessment</h2>
        <span class="free-pill">Free</span>
        <p>Takes about a minute · confirmed within one business day</p>
      </div>
      <div class="steps" aria-hidden="true">
        <div class="step-ind active" data-step="1"><span class="n">1</span> Pick a time</div>
        <div class="step-ind" data-step="2"><span class="n">2</span> Your details</div>
      </div>

      <div class="pane active" data-pane="1">
        <div class="field-label"><span id="${uid}-dl">Choose a day</span><span class="hint">${dayHint()}</span></div>
        <div class="days-wrap"><div class="days" role="group" aria-labelledby="${uid}-dl">
          ${days.map((d, i) => `<button type="button" class="day${i === 0 ? ' selected' : ''}" aria-pressed="${i === 0}" aria-label="${d.dowLong} ${d.day} ${d.monLong}" data-key="${d.key}"><small>${d.dow}</small><b>${d.day}</b><em>${d.mon}</em></button>`).join('')}
        </div></div>
        <div class="slots-wrap">
          <div class="field-label"><span id="${uid}-tl">Choose a time</span><span class="hint" data-avail aria-live="polite"></span></div>
          <div data-slots role="group" aria-labelledby="${uid}-tl"></div>
        </div>
        <p class="tz-note">${I.clock}<span>All times are Queensland time (AEST). Your time is a request until our team confirms it.${isConfigured() ? '' : ' <span class="demo-tag">Sample availability shown.</span>'}</span></p>
        <div class="booking-actions">
          <button type="button" class="btn btn-primary btn-block" data-next disabled><span class="lbl">Continue</span>${I.arrow}</button>
        </div>
      </div>

      <div class="pane" data-pane="2">
        <div class="chosen">
          <span class="ic">${I.calendar}</span>
          <span class="txt"><b data-chosen-main></b><span data-chosen-sub></span></span>
          <button type="button" class="change" data-back>Change</button>
        </div>
        <form class="bk-form" novalidate>
          <div class="form-grid">
            ${field('first_name', 'fn', 'First name', 'text', 'given-name', 'enterkeyhint="next"', 'Please enter your first name', false)}
            ${field('last_name', 'ln', 'Last name', 'text', 'family-name', 'enterkeyhint="next"', 'Please enter your last name', false)}
            ${field('phone', 'ph', 'Mobile number', 'tel', 'tel', 'inputmode="tel" enterkeyhint="next"', 'Please enter an Australian mobile number, e.g. 0412 345 678', true)}
            ${field('email', 'em', 'Email address', 'email', 'email', 'inputmode="email" enterkeyhint="done"', 'Please check your email address', true)}
            <div class="full">
              <div class="field-label"><span id="${uid}-al">What best describes you?</span><span class="hint">Optional</span></div>
              <div class="choice-row" data-about role="group" aria-labelledby="${uid}-al">
                <button type="button" class="choice" aria-pressed="false" data-val="I wear glasses">Glasses</button>
                <button type="button" class="choice" aria-pressed="false" data-val="I wear contact lenses">Contacts</button>
                <button type="button" class="choice" aria-pressed="false" data-val="I wear both glasses and contacts">Both</button>
                <button type="button" class="choice" aria-pressed="false" data-val="I am over 45 and use reading glasses">Reading glasses (45+)</button>
              </div>
            </div>
          </div>
          <input class="honey" type="text" name="bk_hp_x7" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="form-msg" data-msg role="alert"></div>
          <div class="booking-actions">
            <button type="submit" class="btn btn-primary btn-block btn-lg"><span class="lbl">Book my free online assessment</span><span class="spin"></span>${I.arrow}</button>
          </div>
          <p class="privacy">${I.lock} We collect your name, mobile, email and optional answer only to arrange your assessment. Your request reaches EyeHub through EmailJS, a third-party form service, and is handled under EyeHub's <a href="https://eyehub.net.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>. No marketing list.</p>
        </form>
      </div>

      <div class="pane" data-pane="3" aria-live="polite">
        <div class="success">
          <div class="check-ring"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
          <h4 tabindex="-1">Thanks, <span data-s-name></span>. We have your request.</h4>
          <p>Our team will call or SMS you from ${CONFIG.clinicPhone} within one business day to confirm your time and send the call details. Save the number so you know it is us.</p>
          <div class="summary">
            <div><span>Requested</span><b data-s-when></b></div>
            <div><span>Where</span><b>Phone or video call, from home</b></div>
            <div><span>Cost</span><b>Free, no obligation</b></div>
          </div>
          <ul class="next-steps">
            <li>${I.check}<span>Keep your phone handy: a team member will confirm your time.</span></li>
            <li>${I.check}<span>If you have a recent glasses or contact lens prescription, have it nearby for the call. Not essential.</span></li>
            <li>${I.check}<span>Questions before then? Call <a href="tel:0752208990"><b>${CONFIG.clinicPhone}</b></a>.</span></li>
          </ul>
          <div class="booking-actions">
            <button type="button" class="btn btn-ghost btn-block" data-ics>${I.download}<span class="lbl">Add to my calendar</span></button>
          </div>
        </div>
      </div>

      <p class="bk-terms">Free 15-minute phone or video call with the EyeHub team, for adults 18 and over. A preliminary screening, not a diagnosis: suitability is confirmed at an in-clinic consultation, which carries a small deposit credited to your procedure. No obligation. Times are requests until confirmed.</p>
    `;

    const panes = $$('.pane', root);
    const inds = $$('.step-ind', root);
    const slotsEl = $('[data-slots]', root);
    const availEl = $('[data-avail]', root);
    const nextBtn = $('[data-next]', root);
    const backBtn = $('[data-back]', root);
    const form = $('.bk-form', root);
    const msg = $('[data-msg]', root);

    function go(step) {
      panes.forEach(p => p.classList.toggle('active', +p.dataset.pane === step));
      inds.forEach(s => {
        const n = +s.dataset.step;
        s.classList.toggle('active', n === step);
        s.classList.toggle('done', n < step);
      });
      root.classList.toggle('done', step === 3);
      if (step > 1) {
        const d = days.find(x => x.key === state.day);
        $('[data-chosen-main]', root).textContent = `${d.dowLong} ${d.day} ${d.monLong}, ${labelTime(state.time, state.period)}`;
        $('[data-chosen-sub]', root).textContent = 'Free online suitability assessment · 15 min';
      }
      // bring the top of the card back into view, so a phone user never lands halfway down the new pane
      const headerH = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) + 12;
      const top = root.getBoundingClientRect().top;
      if (top < headerH || top > innerHeight * 0.5) window.scrollTo({ top: scrollY + top - headerH, behavior: REDUCED ? 'auto' : 'smooth' });
      // move focus deliberately so keyboard and screen reader users are never stranded on a hidden pane.
      // On a touch screen the first input is not focused automatically: the keyboard would cover the chosen time.
      const target = step === 1 ? $('.day.selected', root) : step === 2 ? (TOUCH ? null : $('input[name=first_name]', root)) : $('.success h4', root);
      if (target) setTimeout(() => target.focus({ preventScroll: true }), REDUCED ? 0 : 350);
    }

    function renderSlots() {
      const groups = CONFIG.availability.slots;
      let free = 0, html = '';
      for (const period of ['morning', 'afternoon']) {
        html += `<div class="slot-group"><p class="slot-title">${period}</p><div class="slots">`;
        for (const t of groups[period]) {
          const taken = isTaken(state.day, t);
          if (!taken) free++;
          const sel = state.time === t && state.period === period;
          html += `<button type="button" class="slot${taken ? ' taken' : ''}${sel ? ' selected' : ''}" data-t="${t}" data-p="${period}" aria-pressed="${sel}" ${taken ? 'disabled title="Not offered"' : ''}>${labelTime(t, period)}</button>`;
        }
        html += '</div></div>';
      }
      slotsEl.innerHTML = free ? html : '<div class="slots-empty">No times offered on this day. Try another day.</div>';
      availEl.textContent = free ? `${free} times to choose from` : '';
    }

    function selectDay(key) {
      state.day = key; state.time = null; state.period = null;
      $$('.day', root).forEach(b => { const on = b.dataset.key === key; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', on); });
      nextBtn.disabled = true;
      $('.lbl', nextBtn).textContent = 'Continue';
      renderSlots();
    }

    $$('.day', root).forEach(b => b.addEventListener('click', () => selectDay(b.dataset.key)));
    const daysEl = $('.days', root), daysWrap = $('.days-wrap', root);
    const daysEdge = () => daysWrap.classList.toggle('at-end', daysEl.scrollLeft + daysEl.clientWidth >= daysEl.scrollWidth - 4);
    daysEl.addEventListener('scroll', daysEdge, { passive: true });
    requestAnimationFrame(daysEdge);
    slotsEl.addEventListener('click', e => {
      const s = e.target.closest('.slot');
      if (!s || s.classList.contains('taken')) return;
      state.time = s.dataset.t; state.period = s.dataset.p;
      $$('.slot', root).forEach(x => { x.classList.toggle('selected', x === s); x.setAttribute('aria-pressed', x === s); });
      nextBtn.disabled = false;
      $('.lbl', nextBtn).textContent = `Continue with ${labelTime(state.time, state.period)}`;
      if (innerWidth <= 640) setTimeout(() => nextBtn.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }), 120);
    });
    nextBtn.addEventListener('click', () => { go(2); if (isConfigured()) loadEmailJs().catch(() => {}); });
    backBtn.addEventListener('click', () => { if (!sending) go(1); });
    $('[data-about]', root).addEventListener('click', e => {
      const c = e.target.closest('.choice');
      if (!c) return;
      aboutTouched = true;
      const on = !c.classList.contains('selected');
      $$('.choice', root).forEach(x => { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); });
      if (on) { c.classList.add('selected'); c.setAttribute('aria-pressed', 'true'); }
      state.about = on ? c.dataset.val : null;
    });

    // Live validation
    const digits = v => v.replace(/[\s()-]/g, '');
    const validators = {
      first_name: v => v.trim().length >= 2,
      last_name: v => v.trim().length >= 2,
      phone: v => /^(?:\+?61|0)4\d{8}$/.test(digits(v)) || /^(?:\+?61|0)[2378]\d{8}$/.test(digits(v)),
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    };
    function validate(input, show) {
      const ok = validators[input.name](input.value);
      const wrap = input.closest('.input-wrap');
      if (show || wrap.classList.contains('has-error')) {
        wrap.classList.toggle('has-error', !ok);
        input.classList.toggle('invalid', !ok);
        input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      }
      return ok;
    }
    $$('.input', form).forEach((inp, i, all) => {
      inp.addEventListener('blur', () => validate(inp, true));
      inp.addEventListener('input', () => validate(inp, false));
      inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter' || inp.getAttribute('enterkeyhint') !== 'next') return;
        e.preventDefault(); validate(inp, true); (all[i + 1] || inp).focus();
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return; // in-flight guard: Enter key or a second tap must not send a duplicate lead
      msg.className = 'form-msg'; msg.textContent = '';
      const inputs = $$('.input', form);
      const allOk = inputs.map(i => validate(i, true)).every(Boolean);
      if (!allOk) { inputs.find(i => i.classList.contains('invalid')).focus(); return; }
      if (form.bk_hp_x7.value) { // honeypot: a bot does not care about the message, a real person gets the phone number
        msg.className = 'form-msg error';
        msg.innerHTML = `Something went wrong and your request did not send. Please call us on <a href="tel:0752208990"><b>${CONFIG.clinicPhone}</b></a> and we will book you in over the phone.`;
        return;
      }

      const d = days.find(x => x.key === state.day);
      const when = `${d.dowLong} ${d.day} ${d.monLong} ${d.date.getFullYear()} at ${labelTime(state.time, state.period)} (AEST)`;
      const params = {
        first_name: form.first_name.value.trim(),
        last_name: form.last_name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        preferred_date: `${d.dowLong} ${d.day} ${d.monLong} ${d.date.getFullYear()}`,
        preferred_time: labelTime(state.time, state.period) + ' AEST',
        preferred_datetime: when,
        about: state.about || 'Not specified',
        tuned: tunedLabel(),
        pain_points: tickedPains(),
        lead_source: leadSource(),
        page_url: location.href,
        submitted_at: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      };

      const btn = $('button[type=submit]', form);
      sending = true; btn.disabled = true; backBtn.disabled = true; btn.classList.add('loading');
      try {
        await sendLead(params);
        $('[data-s-name]', root).textContent = params.first_name;
        $('[data-s-when]', root).textContent = when.replace(' (AEST)', '') + ' (pending confirmation)';
        const icsBtn = $('[data-ics]', root);
        if (/FBAN|FBAV|FB_IAB|Instagram/i.test(navigator.userAgent)) {
          const { h, m } = to24(state.time, state.period);
          const [Y, M, D] = d.key.split('-').map(Number);
          const st = new Date(Date.UTC(Y, M - 1, D, h - 10, m)), en = new Date(st.getTime() + 15 * 60000);
          const z = x => x.toISOString().replace(/[-:]|\.\d{3}/g, '');
          icsBtn.onclick = () => window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('EyeHub free online suitability assessment (requested)') + '&dates=' + z(st) + '/' + z(en) + '&details=' + encodeURIComponent('15-minute phone or video call with the EyeHub team. Pending confirmation by phone or SMS. Questions: 07 5220 8990'), '_blank', 'noopener');
        } else {
          icsBtn.onclick = () => downloadIcs(d, state);
        }
        go(3);
        root.classList.remove('pulse');
        track('Lead', { content_name: 'Free online assessment', value: 0, currency: 'AUD' });
      } catch (err) {
        console.error('[EyeHub booking] send failed', err);
        try { localStorage.removeItem('eyehub_booking'); } catch (e2) {}
        msg.className = 'form-msg error';
        msg.innerHTML = `Something went wrong and your request did not send. Please try again, or call us on <a href="tel:0752208990"><b>${CONFIG.clinicPhone}</b></a> and we will book you in over the phone.`;
      } finally {
        sending = false; btn.disabled = false; backBtn.disabled = false; btn.classList.remove('loading');
      }
    });

    selectDay(days[0].key);
    return {
      root, state,
      // pre-select "What best describes you?" from what the visitor ticked further up the page
      setAbout(val) {
        if (aboutTouched) return;
        $$('.choice', root).forEach(x => { const on = x.dataset.val === val; x.classList.toggle('selected', on); x.setAttribute('aria-pressed', on); });
        state.about = val;
      },
    };
  }

  /* ---------------------------------------------------------
     Sending: EmailJS in production, simulated in the demo
     --------------------------------------------------------- */
  async function sendLead(params) {
    if (!isConfigured()) {
      console.info('%c[EyeHub booking] DEMO MODE: EmailJS keys not set. Lead that would be emailed:', 'color:#8D5138;font-weight:bold', params);
      await new Promise(r => setTimeout(r, 1400));
      return { status: 200, text: 'DEMO' };
    }
    // If the SDK cannot load (ad blocker, CDN outage) this throws, so the visitor sees the phone fallback
    // instead of a false "success" with no email sent.
    await loadEmailJs();
    const { serviceId, templateId, autoReplyTemplateId, publicKey } = CONFIG.emailjs;
    // Options are passed per send: init() without a storageProvider silently disables limitRate in SDK 4.4.x.
    const EJ = { publicKey, blockHeadless: true, storageProvider: webStore, limitRate: { id: 'eyehub_booking', throttle: 10000 } };
    const res = await emailjs.send(serviceId, templateId, params, EJ);
    if (autoReplyTemplateId) emailjs.send(serviceId, autoReplyTemplateId, params, { ...EJ, limitRate: { id: 'eyehub_autoreply', throttle: 0 } }).catch(() => {});
    return res;
  }

  const EMAILJS_SDK = {
    src: 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js',
    integrity: 'sha384-SALc35EccAf6RzGw4iNsyj7kTPr33K7RoGzYu+7heZhT8s0GZouafRiCg1qy44AS',
  };
  let sdkPromise = null;
  function loadEmailJs() {
    if (typeof emailjs !== 'undefined') return Promise.resolve();
    return sdkPromise || (sdkPromise = new Promise((resolve, reject) => {
      const fail = m => { sdkPromise = null; reject(new Error(m)); };
      const el = document.createElement('script');
      el.src = EMAILJS_SDK.src; el.integrity = EMAILJS_SDK.integrity; el.crossOrigin = 'anonymous';
      el.onload = resolve; el.onerror = () => fail('EmailJS SDK blocked');
      setTimeout(() => fail('EmailJS SDK timeout'), 8000);
      document.head.appendChild(el);
    }));
  }
  const webStore = (() => {
    try {
      localStorage.setItem('__eh', '1'); localStorage.removeItem('__eh');
      return { get: k => Promise.resolve(localStorage.getItem(k)), set: (k, v) => Promise.resolve(localStorage.setItem(k, v)), remove: k => Promise.resolve(localStorage.removeItem(k)) };
    } catch (e) { return undefined; }
  })();

  function track(event, data) {
    try { if (typeof fbq === 'function') fbq('track', event, data); } catch (e) {}
    try { if (typeof gtag === 'function') gtag('event', 'generate_lead', data); } catch (e) {}
  }

  function downloadIcs(d, state) {
    // Brisbane is fixed UTC+10 (no DST), so emit UTC times rather than a TZID that would need a VTIMEZONE block.
    const { h, m } = to24(state.time, state.period);
    const [Y, M, D] = d.key.split('-').map(Number);
    const start = new Date(Date.UTC(Y, M - 1, D, h - 10, m));
    const end = new Date(start.getTime() + 15 * 60000);
    const stamp = x => `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}${pad(x.getUTCSeconds())}Z`;
    const fold = line => line.replace(/(.{73})(?=.)/g, '$1\r\n ');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EyeHub//Free Assessment//EN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@eyehub.net.au`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      'SUMMARY:EyeHub free online suitability assessment (requested)',
      'DESCRIPTION:15-minute phone or video call with the EyeHub team. Pending confirmation by phone or SMS. Questions: 07 5220 8990',
      'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n');
    const a = document.createElement('a');
    a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    a.download = 'eyehub-free-assessment.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------------------------------------------------
     Page interactions
     --------------------------------------------------------- */
  function initHeader() {
    const h = $('.header');
    const onScroll = () => h.classList.toggle('scrolled', window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initHeadline() {
    const h1 = $('.h1[data-unblur]');
    if (!h1) return;
    // wrap each word for the blur-to-clear entrance, preserving the inline <span class="em"> emphasis
    const wrapWords = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) wrapWords(child);
      });
    };
    wrapWords(h1);
    $$('.w', h1).forEach((w, i) => w.style.setProperty('--i', i));
  }

  function initReveal() {
    const els = $$('.reveal, .reveal-scale, .how-steps');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  function initCompare() {
    $$('.compare').forEach(c => {
      const range = $('input[type=range]', c);
      const set = v => c.style.setProperty('--pos', v + '%');
      set(range.value);
      range.addEventListener('input', () => set(range.value));
      // gentle auto-demo until the user touches it
      let touched = false, t = 0, raf;
      const tick = () => { if (touched) return; t += 0.012; const v = 50 + Math.sin(t) * 22; range.value = v; set(v); raf = requestAnimationFrame(tick); };
      const stop = () => { touched = true; cancelAnimationFrame(raf); };
      ['focus', 'keydown'].forEach(ev => range.addEventListener(ev, stop, { passive: true }));
      // touch-action: pan-y on the container means a vertical swipe scrolls the page and a horizontal drag tracks the finger
      const fromX = x => { const r = c.getBoundingClientRect(); const v = Math.min(98, Math.max(2, (x - r.left) / r.width * 100)); range.value = v; set(v); };
      let drag = false;
      c.addEventListener('pointerdown', e => { drag = true; stop(); if (e.pointerType === 'mouse') { c.setPointerCapture(e.pointerId); fromX(e.clientX); } });
      c.addEventListener('pointermove', e => { if (drag) fromX(e.clientX); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => c.addEventListener(ev, () => { drag = false; }));
      if (!REDUCED && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(en => { cancelAnimationFrame(raf); if (en[0].isIntersecting && !touched) tick(); }, { threshold: 0.4 });
        io.observe(c);
      }
    });
  }

  function initCalc() {
    const r = $('#spend');
    if (!r) return;
    const fmt = n => '$' + Math.round(n).toLocaleString('en-AU');
    const out = { yr: $('#spend-yr'), ten: $('#spend-10'), twenty: $('#spend-20') };
    const animate = (el, from, to) => {
      if (REDUCED) { el.textContent = fmt(to); return; }
      const t0 = performance.now(), dur = 600;
      const step = now => { const p = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const update = () => {
      const v = +r.value;
      r.style.setProperty('--fill', ((v - r.min) / (r.max - r.min) * 100) + '%');
      r.setAttribute('aria-valuetext', `${fmt(v)} per year`);
      out.yr.textContent = fmt(v);
      out.ten.textContent = fmt(v * 10);
      out.twenty.textContent = fmt(v * 20);
    };
    r.addEventListener('input', update);
    update();
    // count up once, the first time the calculator scrolls into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { const v = +r.value; animate(out.ten, 0, v * 10); animate(out.twenty, 0, v * 20); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(r.closest('.calc'));
    }
  }

  const tickedPains = () => $$('#pain .hassle[aria-pressed="true"] b').map(b => b.textContent.trim()).join('; ') || 'None ticked';

  const ABOUT = { glasses: 'I wear glasses', contacts: 'I wear contact lenses', both: 'I wear both glasses and contacts', readers: 'I am over 45 and use reading glasses' };

  function initPains(widgets) {
    const sec = $('#pain');
    if (!sec) return null;
    const tabs = $$('.persona-tab', sec), panels = $$('.pain-panel', sec);
    const nEl = $('[data-tally-n]', sec), msgEl = $('[data-tally-msg]', sec), tally = $('.tally', sec);
    const note = $('[data-tuned-note]', sec);
    panels.forEach(pn => $$('.hassle', pn).forEach((h, i) => h.style.setProperty('--n', i)));
    const show = key => {
      tabs.forEach(t => { const on = t.dataset.persona === key; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      panels.forEach(pn => pn.classList.toggle('active', pn.dataset.persona === key));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t.dataset.persona));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        show(next.dataset.persona); next.focus();
      });
    });
    show('glasses');
    const update = () => {
      const n = $$('.hassle[aria-pressed="true"]', sec).length;
      nEl.textContent = n;
      msgEl.textContent = n === 0 ? 'Tick the ones that make sense to you.'
        : n < 3 ? `${n} so far. Keep going.`
        : `${n} ticked. That is ${n} reasons to spend 15 minutes finding out whether you can do something about it.`;
      if (!REDUCED) { tally.classList.remove('bump'); void tally.offsetWidth; tally.classList.add('bump'); }
      // pre-fill "what best describes you" in the widget from where the ticks are
      const c = {}; panels.forEach(pn => c[pn.dataset.persona] = $$('.hassle[aria-pressed="true"]', pn).length);
      const val = (c.both || (c.glasses && c.contacts)) ? ABOUT.both : c.glasses ? ABOUT.glasses : c.contacts ? ABOUT.contacts : c.readers ? ABOUT.readers : null;
      if (val) widgets.forEach(w => w.setAbout(val));
    };
    sec.addEventListener('click', e => {
      const h = e.target.closest('.hassle');
      if (!h) return;
      h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') !== 'true');
      update();
    });
    return {
      show,
      setTuned(text) { if (!note) return; note.hidden = !text; if (text) $('span', note).textContent = text; },
    };
  }

  function initMatcher() {
    const grid = $('.opt-grid');
    const chips = $$('.match-chip');
    const label = $('[data-match-label]');
    if (!grid || !chips.length) return null;
    const DEFAULT_LABEL = label ? label.textContent : '';
    const apply = (chip, on) => {
      chips.forEach(c => c.setAttribute('aria-pressed', c === chip && on));
      const want = on && chip ? chip.dataset.match.split(' ') : [];
      grid.classList.toggle('has-match', !!(on && chip));
      $$('.opt', grid).forEach(o => o.classList.toggle('is-match', want.includes(o.dataset.proc)));
    };
    chips.forEach(chip => chip.addEventListener('click', () => { apply(chip, chip.getAttribute('aria-pressed') !== 'true'); if (label) label.textContent = DEFAULT_LABEL; }));
    return {
      select(rx, text) {
        const chip = chips.find(c => c.dataset.rx === rx) || null;
        apply(chip, !!chip);
        if (label) label.textContent = chip && text ? text : DEFAULT_LABEL;
      },
    };
  }

  /* ---------------------------------------------------------
     Tuner: two taps under the hero that set the rest of the page
     --------------------------------------------------------- */
  const TUNE = { persona: null, rx: null };
  const PERSONA_TITLE = { glasses: 'Glasses', contacts: 'Contact lenses', both: 'Glasses and contacts', readers: 'Reading glasses' };
  const PERSONA_YOU = { glasses: 'you wear glasses', contacts: 'you wear contacts', both: 'you wear glasses and contacts', readers: 'you use reading glasses' };
  const RX_NAME = { short: 'short-sighted', long: 'long-sighted', astig: 'astigmatism', reading: 'reading vision', unsure: 'prescription not sure' };
  const RX_TEXT = {
    short: 'SMILE PRO®, LASIK and ICL are the procedures often considered for short-sighted eyes.',
    astig: 'SMILE PRO® and LASIK are the procedures often considered for astigmatism.',
    long: 'LASIK and Refractive Lens Exchange are often considered for long-sighted eyes.',
    reading: 'PRESBYOND® and Refractive Lens Exchange are often considered for reading vision.',
    unsure: 'No problem. Working that out is exactly what the free assessment is for.',
  };
  const tunedLabel = () => TUNE.persona ? `${PERSONA_TITLE[TUNE.persona]}${TUNE.rx ? ' · ' + RX_NAME[TUNE.rx] : ''}` : 'Not answered';

  function initTuner(widgets, pains, matcher) {
    const sec = $('#tune');
    if (!sec) return;
    const q1 = $('[data-q="1"]', sec), q2 = $('[data-q="2"]', sec), res = $('.tune-result', sec);
    const title = $('[data-tune-title]', sec), sub = $('[data-tune-sub]', sec);
    const personaBtns = $$('[data-persona]', q1), rxBtns = $$('[data-rx]', q2);
    const press = (btns, active) => btns.forEach(b => b.setAttribute('aria-pressed', b === active));

    const applyPersona = () => {
      const p = TUNE.persona;
      document.documentElement.dataset.persona = p || '';
      if (pains) { pains.show(p || 'glasses'); pains.setTuned(p ? `Tuned to you: ${PERSONA_YOU[p]}.` : null); }
      if (p) widgets.forEach(w => w.setAbout(ABOUT[p]));
    };
    const applyRx = () => {
      const { persona, rx } = TUNE;
      const mrx = rx === 'unsure' ? (persona === 'readers' ? 'reading' : null) : rx;
      if (matcher) matcher.select(mrx, 'Based on what you told us, these are often considered. Tap another to compare.');
      title.textContent = `Got it. ${PERSONA_TITLE[persona]}, ${RX_NAME[rx]}.`;
      sub.textContent = `${RX_TEXT[mrx || rx]} The annoyances list and the procedure guide below are now set to you.`;
      res.hidden = false;
    };
    personaBtns.forEach(b => b.addEventListener('click', () => {
      TUNE.persona = b.dataset.persona; press(personaBtns, b);
      q2.hidden = false; applyPersona();
      if (TUNE.rx) applyRx();
    }));
    rxBtns.forEach(b => b.addEventListener('click', () => {
      if (!TUNE.persona) return;
      TUNE.rx = b.dataset.rx; press(rxBtns, b); applyRx();
    }));
    $('[data-tune-reset]', sec).addEventListener('click', () => {
      TUNE.persona = null; TUNE.rx = null;
      press(personaBtns, null); press(rxBtns, null);
      q2.hidden = true; res.hidden = true;
      applyPersona(); if (matcher) matcher.select(null);
      personaBtns[0].focus();
    });
    // Ad message match: ?p=contacts (or utm_content=glasses|contacts|both|readers) pre-answers the first tap.
    const params = new URLSearchParams(location.search);
    const pre = params.get('p') || params.get('utm_content');
    if (pre && ABOUT[pre]) { const b = personaBtns.find(x => x.dataset.persona === pre); if (b) b.click(); }
  }

  function initFaq() {
    $$('.faq-item').forEach((item, i) => {
      const q = $('.faq-q', item), a = $('.faq-a', item);
      a.id = `faq-a-${i + 1}`;
      q.setAttribute('aria-controls', a.id);
      a.setAttribute('aria-hidden', 'true'); // collapsed answers stay out of the accessibility tree
      q.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.faq-item.open').forEach(o => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); $('.faq-a', o).setAttribute('aria-hidden', 'true'); });
        if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); a.setAttribute('aria-hidden', 'false'); }
      });
    });
  }

  function initVideos() {
    const modal = $('#video-modal');
    if (!modal) return;
    const frame = $('[data-frame]', modal);
    const empty = frame.innerHTML;
    let opener = null;
    const open = (id, from) => {
      opener = from;
      // data-video holds a YouTube id or a full embed URL; empty = placeholder panel for the mockup
      frame.innerHTML = id ? `<iframe src="${/^https?:/.test(id) ? id : 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0'}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Patient story"></iframe>` : empty;
      modal.hidden = false; document.body.style.overflow = 'hidden';
      $('.modal-x', modal).focus();
    };
    const close = () => {
      modal.hidden = true; frame.innerHTML = empty; document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    $$('.video[data-video]').forEach(v => v.addEventListener('click', () => open(v.dataset.video, v)));
    $$('[data-close]', modal).forEach(c => c.addEventListener('click', close));
    document.addEventListener('keydown', e => {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      // keep Tab inside the dialog
      const f = $$('button, iframe, [href]', $('.modal-box', modal));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function initCtas() {
    // every [data-book] control scrolls to the nearest sensible booking card and pulses it
    $$('[data-book]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.book === 'bottom' ? $('#book-bottom') : $('#book');
      const card = $('.booking', target) || target;
      const y = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
      setTimeout(() => {
        card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
        const focusTo = $('.pane.active .day.selected', card) || $('.pane.active input, .pane.active button', card);
        if (focusTo) focusTo.focus({ preventScroll: true });
      }, REDUCED ? 0 : 600);
    }));
  }

  function initStickyBar() {
    const bar = $('.sticky-bar');
    const hero = $('#book');
    const bottom = $('#book-bottom');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      // show once the hero booking card has scrolled out of view, hide again when the bottom card is visible
      const vis = {};
      entries.forEach(en => vis[en.target.id] = en.isIntersecting);
      if ('book' in vis) bar.dataset.heroVisible = vis.book;
      if ('book-bottom' in vis) bar.dataset.bottomVisible = vis['book-bottom'];
      bar.classList.toggle('show', bar.dataset.heroVisible === 'false' && bar.dataset.bottomVisible !== 'true');
    }, { threshold: 0, rootMargin: '-64px 0px 0px 0px' }); // any part of a booking card on screen (below the header) hides the bar
    io.observe(hero); if (bottom) io.observe(bottom);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initHeadline();
    const widgets = $$('[data-booking]').map((el, i) => mountBooking(el, i));
    // decorative sprite icons: keep them out of the accessibility tree
    $$('svg:not([aria-label])').forEach(s => { s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false'); });
    initReveal();
    initCompare();
    initCalc();
    const pains = initPains(widgets);
    const matcher = initMatcher();
    initTuner(widgets, pains, matcher);
    initFaq();
    initVideos();
    initCtas();
    initStickyBar();
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  });
})();
