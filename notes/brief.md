# EyeHub — Laser Vision Free Online Suitability Assessment Landing Page — BRIEF

## Purpose
A single-goal landing page for Facebook/Instagram ad traffic. ONE conversion: the visitor books a
time/date for a **free online laser vision suitability assessment** (15-min video/phone call with the
EyeHub team). No practice-management-software integration: the visitor picks a slot in a custom-coded
booking widget, the form is emailed to the clinic via EmailJS, and the receptionist confirms the booking.

The agency (us) is pitching this against King Kong (kingkong.co, direct-response agency). We must be
clearly better: higher-converting, cleaner, on-brand, AND compliant with Australian medical advertising law.

## The client — EyeHub (https://eyehub.net.au)
- Ophthalmology clinic, Sunshine Coast (Buderim) + Noosa, Queensland, Australia. (Agency confirmed: locations to promote are Sunshine Coast & Noosa.)
- Reviews exist on Google, Doctify and Birdeye (Birdeye shows ~4.3★ / 51 reviews). The agency wants a social proof section
  (testimonials + video stories) — built with SAMPLE placeholder reviews that talk about experience of care, not clinical
  outcomes, and a visible note that they are replaced with verified reviews before launch.
- Agency direction: mention the exact procedure prices ONCE only, in the pricing table, which sits after the
  "cost of glasses & contacts" comparison. Procedure cards and FAQ must not repeat dollar figures.
- Phone 07 5220 8990 · admin@eyehub.net.au
- Founded 2022 by **Dr Sonia Moorthy**, consultant ophthalmologist. Medical degree (Scotland), trained at
  Sydney Eye Hospital, subspecialty fellowships Singapore & London, advanced refractive surgery training in
  Spain, India and the UK. RANZCO examiner and committee member. Interests: cataract, refractive,
  interventional glaucoma.
- Memberships/logos on site: RANZCO, AUSCRS, ESCRS, AAO, ISRS.
- Tagline on site: "Eye Health Optimised. Life Transformed." / "Your Sunshine Coast Cataract and Laser Vision Specialist"
- Existing CTA copy: "READY TO BE FREE OF GLASSES OR CONTACT LENSES?" and "Take Our Online Assessment"

## KEY USPs (verified on client site)
- **Queensland's FIRST ZEISS VisuMax 800 & MEL 90 laser suite.**
- **Currently the ONLY clinic in Queensland offering BOTH PRESBYOND® and SMILE PRO®.** SMILE PRO® described as "exclusive to EYEHUB".
- Pre & post-op assessments and **12 months of aftercare included** in every price.
- Enhancement procedure available within 12 months if needed.
- Transparent, published pricing.

## Procedures (from https://eyehub.net.au/laser-vision-correction/)
| Procedure | Best for | Price (AUD) |
|---|---|---|
| SMILE PRO® (ZEISS VisuMax 800) | Myopia & astigmatism; small-incision, flap-free, suits active lifestyles | $7,500 both eyes |
| LASIK (VisuMax 800 + MEL 90) | Corneal reshaping, quick visual recovery | $7,500 both eyes |
| PRESBYOND® Laser Blended Vision (MEL 90) | Presbyopia / over-45s wanting to reduce reading glasses | $8,800 both eyes |
| ICL (Implantable Contact Lens) | Not suitable for laser (thin corneas, high prescriptions); no natural lens removal | $7,000 per eye (incl. hospital/anaesthetic, single enhancement) |
| Refractive Lens Exchange (RLE) | Typically 55+, presbyopia or prescriptions unsuitable for laser; natural lens replaced with a premium IOL, same approach as cataract surgery (source: eyehub.net.au/refractive-lens-exchange/) | $3,500 per eye incl. pre-op assessment, premium IOL, surgery, 12 months post-op care; hospital and anaesthetic fees additional |

Candidate criteria: usually 18–60, prescription stable 12+ months, healthy eyes. Modern tech treats broader
prescription ranges; stability matters more than age. Blended vision for 45+. Vision keeps improving 3–6 months.
Elective → no Medicare rebate. Private health may cover some. Finance: **MediPay, Afterpay**.
$100 deposit for the *surgical consultation* (credited to surgery) — NOTE: the online suitability assessment we are
selling is FREE; the $100 applies only to the later in-clinic surgical consult.
Disclosed risks: dry eye, glare/halos, infection, delayed healing, under/over-correction.

## Brand style (extracted from theme CSS)
- Colours: charcoal `#272B27` (text/primary), sand `#D6CBB8`, gold/tan `#B9A280`, cream `#F5F3EF` (bg),
  rust `#8D5138` (accent), forest green `#394C39` (dark panels). White. Light greys #f5f5f5/#eee.
- Font: "Inter Display" (Inter). Headings medium weight, generous letter-spacing on small-caps eyebrows.
- Rounded corners: 1.25rem (20px) cards, pill buttons (1.5625rem), 0.625rem small.
- Photography: lifestyle (surfing, cycling, kitesurfing on the coast), warm sand/water textures, ZEISS
  VisuMax 800 equipment, Dr Moorthy portrait. Calm, premium, medical-but-warm. Not garish.

## Available local images (assets/img/)
logo.svg (charcoal), logo-rev.svg (white), brandmark.png, Dr-Sonya-Moorthy-840x840.jpeg, laser-vision.jpg
(VisuMax 800 with nurse), visumax800-mel90-group-300x294.png, cta-green-768x794.jpg (surfing couple),
treatment-768x777.jpg (cyclist), hero-3-2.webp (kitesurfer, warm), hero-8-2.webp (road cyclist),
main-img@1.5-v2.webp (sand & water texture), refractive-header.jpg, process.webp, ranzco-3.png,
AUSCRSLOGOCMYKLong-01.png, escrs-colour-with-tagline.png, logo-aao@2x.png, logo-isrs@2x.png.

## Booking widget spec
Fields: first name, last name (or full name), mobile (AU), email; pick a date (next ~10 business days,
Mon–Fri, Queensland time AEST, no DST); pick a 15-min slot (e.g. 8:30–16:30). Optional: "What best describes
you?" (glasses / contacts / both / over 45 reading glasses). Submit → EmailJS (v4 browser SDK) → email to the
clinic. Success state tells them the team will confirm by phone/SMS within one business day.

## Compliance context (Australia)
Ahpra / Medical Board advertising guidelines apply (National Law s.133): no testimonials about clinical
care in the practitioner's own advertising, no false/misleading claims, no guarantees of outcome, no
creating unreasonable expectation of beneficial treatment, inducements ("free") must state terms, and
surgical advertising should carry the standard warning about risks/second opinion. We treat this as a
selling point vs King Kong's guarantee/testimonial-heavy formula.
