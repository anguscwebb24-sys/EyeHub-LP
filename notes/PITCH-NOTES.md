# EyeHub landing page: pitch notes for the client meeting

## The one-line pitch

A page built for one job (book the free 15-minute online assessment), in EyeHub's own visual language, with
every sales mechanic that works on Facebook traffic, and nothing that could put a RANZCO examiner in front
of Ahpra. King Kong's formula does the first half. It cannot do the second.

## What the page does (walk the client through it, top to bottom)

1. **Hero, booking widget in view on desktop.** Headline un-blurs word by word (the whole page is a metaphor
   for the outcome). Honest hook: "If you're not suitable, we'll tell you straight." Three trust lines, one
   CTA. On mobile the CTA jumps to the widget and a sticky bar follows the reader.
1b. **The tuner.** Straight under the hero: "First, what are you dealing with?" Two taps (I wear glasses /
   contacts / both / reading glasses, then short-sighted / long-sighted / astigmatism / reading only / not
   sure). The rest of the page then adjusts: the annoyances list, the benefits, the procedure guide and the
   booking widget's "what best describes you". Their answers go to reception in the email. Ads can pre-answer
   the first tap with `?p=contacts` etc., so each ad lands on a page already tuned to its audience.
2. **Custom booking widget.** Two steps: pick a day (next 10 business days, weekdays, AEST) and a 15-minute
   time, then name, mobile, email and an optional "what best describes you". Live validation, honeypot
   anti-spam, EmailJS sends the request to reception, success screen echoes the request as *pending
   confirmation*, "add to calendar" file, and the ad's UTM / fbclid is passed through in the email so you
   know which ad booked. Two copies of the widget (top and bottom), same engine.
3. **Association logos** (RANZCO, AUSCRS, ESCRS, AAO, ISRS).
4. **Blur-to-clear slider** on a coast image. Auto-demos gently until the reader grabs it. Labelled
   illustrative.
5. **The annoyances showcase (interactive).** The visitor picks what they wear (glasses, contacts, reading
   glasses) and sees eight specific, local annoyances for that group: the 5am fumble, salt water roulette,
   a pair in every room. They tap the ones that are true for them and a running tally responds ("You ticked
   4. Each one is a reason the free 15 minutes is worth it."). This is self-persuasion: they build their own
   case. What they tick pre-fills "what best describes you" in the booking widget and is sent to reception
   as `pain_points`, so the call can open with their own words.
6. **Five procedures**, including Refractive Lens Exchange from EyeHub's own site. The two Queensland
   exclusives (SMILE PRO® and PRESBYOND®) lead as large dark cards; LASIK, ICL and RLE sit beneath. A
   "tap what sounds like you" row (short-sighted, astigmatism, long-sighted, reading glasses 45+, told laser
   isn't for me) highlights what is often considered, worded as "often suits", never as a promise of
   suitability. Prices are deliberately NOT on the cards; they link down to the single pricing table.
7. **Why EyeHub.** Queensland-first ZEISS suite, exclusivity, surgeon by name, aftercare, published prices,
   finance.
8. **How it works.** Three steps, first step free, suitability confirmed in clinic never on the call.
9. **Cost-of-waiting calculator.** Slider: yearly spend on glasses/contacts becomes 10- and 20-year totals,
   beside "One published price." No savings claim, no dollar figure for surgery here (compliance and your
   brief: exact price appears once, further down).
10. **Patient stories.** Three video-story tiles (modal player, drop in YouTube IDs) and four review cards.
    SAMPLE content, clearly labelled on the page, written about the experience of care (booking, the first
    call, how people were treated), never clinical outcomes. No star-rating aggregate is shown because a
    five-star pill would misstate the real rating. Fully compliant alternative for the video row if the
    client prefers: Dr Moorthy explainers ("What happens in the free 15 minutes", "Who is not suitable, and
    why", "Inside the ZEISS suite"), which are not testimonials at all.
11. **Transparent pricing.** The only place the exact prices appear. All-inclusive, both eyes, inclusions
    listed, deposit and Medicare note, MediPay / Afterpay.
12. **Dr Moorthy.** Credentials as facts, draft quote for her approval.
13. **FAQ** in objection order: pain, age, prescription, risks, recovery, cost, "not suitable", what next.
14. **Final CTA + second booking widget.** Footer with the standard surgical warning at body size.

## Why this beats a King Kong page (from our research on kingkong.co and their funnels)

King Kong runs one direct-response template across "1,184 industries": big-claim headline, a guarantee on
every offer, a wall of testimonials and star ratings, manufactured scarcity (stock GIFs, countdowns, exit
pop-ups), 6,000-word sales letters with P.S./P.P.S., red buttons, "Hit the damn button". It sells courses
and e-commerce. Applied to a medical specialist in Australia:

| King Kong pillar | Problem for EyeHub | What this page does instead |
|---|---|---|
| Outcome guarantee ("or we work for free") | Outcome guarantees for a health service breach National Law s.133 (unreasonable expectation of benefit) | Risk-reversal on the *action*: free, no obligation, "if you're not suitable we'll say so" |
| Testimonial wall, aggregate star badges | Clinical testimonials in the practitioner's own advertising are prohibited (s.133(1)(c)); Ahpra treats republished reviews as "use" | Authority proof: credentials, technology first-in-QLD, inclusions, published prices; experience-of-care reviews only, marked for compliance review |
| Fake scarcity, countdowns, "act now" | Ahpra names "don't delay / act now" as breach language; ACL misleading conduct | Real structure only: times shown as *requests*, confirmed by a person |
| "Free" hooks with hidden charges (Trustpilot complaints about $197 auto-charges) | Inducements must state terms on the page | Terms of the free assessment stated next to the widget and in the footer |
| Generic template look, ALL CAPS, red buttons | Off-brand for a premium clinic; erodes trust with a 35-60 medical audience | Built from EyeHub's own palette, type and photography |
| 6,000-word letter | 85-95% of FB traffic is mobile; long letters bury the form | ~1,200 words, widget one thumb-scroll away, sticky mobile CTA |

Penalties are real: up to $60k per offence for the practitioner and $120k for the company under s.133, plus
Medical Board disciplinary exposure for Dr Moorthy personally. The practitioner is responsible for advertising
done on their behalf. A page that converts *and* protects her registration is the whole pitch.

## Market context (Queensland laser eye advertising, September 2026)

- Every competitor leads "freedom from glasses" + "free assessment", but the assessment is almost always
  in-clinic with an optometrist. Vision Eye Institute says "not online" outright. EyeHub's genuinely online,
  15-minute first step is a differentiator nobody on the coast uses.
- Competitors price per eye with weekly finance figures ($3,200 to $4,712 per eye). EyeHub's $7,500 both
  eyes is $3,750 per eye: under LaserSight Maroochydore's LASIK ($3,900/eye) and Focus Vision's SMILE
  ($4,250/eye), on newer VisuMax 800 technology. Worth saying out loud on the call.
- Nobody in Queensland runs a PRESBYOND / over-45 funnel. The "reading glasses (45+)" option in the widget
  and the PRESBYOND card set up a dedicated ad angle for the 45-60 audience.
- Benchmarks: Unbounce medical-treatment median 5.3%; LASIK agencies cite 4-8% for a well-run appointment
  page. Target for warm FB/IG traffic with this build: 8-12%.

## What is placeholder / needs the client's sign-off

- Reviews and video tiles are samples (labelled on the page). Replace with verified reviews that talk about
  the experience of care, not clinical outcomes, and real patient videos with consent.
- Dr Moorthy's quote is a draft for her to approve or rewrite.
- Ahpra registration number in the footer.
- Written substantiation from ZEISS for "Queensland's first" and "only clinic in Queensland offering both";
  re-check every 90 days while ads run.
- Confirm: enhancement within 12 months is included (not just available); who conducts the online call
  ("the EyeHub team" is the safe default); reception can honour "confirmed within one business day".
- EmailJS keys (10 minutes, see README). Recommend the $9/month Personal plan for domain allow-listing.
- Meta Pixel ID.

## Built-in quality the client will not see but you can mention

- Reviewed by separate copy, compliance, accessibility and code passes, then fixed: WCAG AA text contrast,
  visible keyboard focus, screen-reader announcements for form errors and the success state, focus trap in
  the video player.
- If an ad blocker stops the email service loading, the form shows the clinic phone number instead of a fake
  "success" (a silent lead-loss bug common on template pages). Double taps cannot send duplicate leads or
  double-count Facebook conversions.
- The greyed-out "sample availability" times are a demo effect only and switch off automatically the moment
  real email keys are entered, so manufactured scarcity can never ship.
- The terms of the free offer sit directly under the booking widget. Risk and suitability language is
  handled in plain words (benefits section, FAQ and footer); the formal "any surgical or invasive procedure"
  sentence was removed at the agency's request. If the client's own advisers want it back, it is a
  one-line addition to the footer.
- The widget mentions "a small deposit" for the later in-clinic consult; the exact $100 figure appears once,
  in the pricing section, in line with your one-price-mention brief.

## Launch upgrades to offer (phase 2)

- Ad-to-page message match: swap the headline by `utm_content` (glasses / contacts / over-45) so each ad
  angle lands on matching copy (research: up to 39% lift).
- Auto-reply email to the visitor (EmailJS second template) and an SMS via the practice's SMS tool.
- A claims-and-substantiation register: every factual claim on the page, its evidence, date verified. The
  kind of artefact a template agency never provides.
