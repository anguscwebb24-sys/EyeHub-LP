# EyeHub · Free Online Laser Vision Assessment · Landing Page

Single-goal landing page for Facebook / Instagram ad traffic. One conversion: book a time for a free 15-minute
online suitability assessment. No practice-management integration: the visitor picks a day and time in the custom
booking widget, the request is emailed to the clinic via EmailJS, and reception confirms by phone or SMS.

Static site. No build step, no server code. Works on GitHub Pages as-is.

## Files

```
index.html                  the page
assets/css/styles.css       styling (design tokens pulled from eyehub.net.au), layout, animations
assets/js/config.js         YOUR SETTINGS: EmailJS keys, phone number, availability  <-- the only file to edit
assets/js/app.js            booking widget, tuner, annoyances, calculator, FAQ, video modal
assets/img/                 brand assets (logo, Dr Moorthy, ZEISS suite, lifestyle photos, association logos)
emailjs-templates/          two ready-to-paste EmailJS email templates
notes/                      agency notes (research brief, pitch notes). Ignored by git, never published.
.nojekyll                   tells GitHub Pages to serve the files exactly as they are
```

## 1. Put it on GitHub Pages

1. Create a new repository on GitHub (public or private both work with Pages on a paid plan; public is fine,
   nothing sensitive is in the repo because `notes/` is git-ignored).
2. Upload this folder: on your machine, open a terminal in the folder and run

   ```bash
   git init
   git add .
   git commit -m "EyeHub landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```

   (or drag the folder contents into the GitHub web uploader).
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main,
   folder: / (root) → Save.** After a minute the site is live at `https://YOUR-USER.github.io/YOUR-REPO/`.
4. Custom domain (the client's preferred domain is `laservisionsurgery.net.au`; confirm the exact spelling from
   his message before you set it):
   - At the domain registrar, add these DNS records:
     `A` records for the bare domain pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`, and a `CNAME` record for `www` pointing to `YOUR-USER.github.io`.
   - In the repository: Settings → Pages → Custom domain → enter the domain → Save. GitHub adds a `CNAME`
     file to the repo and issues HTTPS automatically (tick "Enforce HTTPS" once it appears, usually within an
     hour of the DNS records going live).
   - The second domain (`seewithoutglasses...`) should not host a second copy of the page. At the registrar,
     set it as a permanent (301) redirect to `https://laservisionsurgery.net.au/`. One page, one set of
     conversion data, and either address printed on an ad still lands in the right place.

Every later change is just a commit and push. GitHub Pages caches files for about 10 minutes.

**Before you make it live:** the two `og:` tags in `index.html` already point at `https://laservisionsurgery.net.au/`;
change them if the domain differs. Bump the `?v=` number on the CSS and JS links whenever you change those files, so
returning visitors never get stale styling.

## 2. Wire up EmailJS (about 10 minutes)

1. Create a free account at https://www.emailjs.com.
2. **Email Services → Add New Service** → choose the clinic's mail provider (Gmail / Google Workspace,
   Outlook / Microsoft 365, or SMTP) → connect the mailbox → **copy the Service ID**.
3. **Email Templates → Create New Template** → paste `emailjs-templates/clinic-notification.txt` (subject,
   body and the settings on the right-hand panel: To Email = the reception inbox, Reply To = `{{email}}`) →
   Save → **copy the Template ID**.
4. Optional: repeat with `emailjs-templates/visitor-auto-reply.txt` for a "we've got your request" email to
   the visitor, and copy that Template ID too.
5. **Account → General → copy the Public Key.**
6. Open `assets/js/config.js` and paste the values:

   ```js
   emailjs: {
     publicKey: 'YOUR_PUBLIC_KEY',
     serviceId: 'YOUR_SERVICE_ID',
     templateId: 'YOUR_TEMPLATE_ID',
     autoReplyTemplateId: '',   // optional
   },
   ```

7. Commit, push, open the live page, book a test time. Expect the clinic email within about 10 seconds.
   In EmailJS, **Email History** shows every request and its status.

Until all three keys are real the widget runs in **demo mode**: the submission is simulated, the lead is printed
to the browser console, and some times are shown greyed-out as sample availability. All of that switches off
automatically once the keys are in.

Recommended: the $9/month EmailJS Personal plan, so you can restrict the keys to your domain (Account → Security
→ allow-list `YOUR-USER.github.io` and the custom domain) and get 2,000 requests a month instead of 200.
Spam protection is already built in (hidden trap field, rate limit, headless-browser block).

If the EmailJS script is blocked (ad blocker, CDN outage) on a configured site, the form shows an error with the
clinic phone number rather than a false success. Submissions are guarded against double taps.

## 3. What the email contains

`first_name`, `last_name`, `phone`, `email`, `preferred_date`, `preferred_time`, `preferred_datetime`, `about`
(what they wear), `tuned` (their two answers from the top of the page), `pain_points` (the annoyances they
ticked), `lead_source` (UTM parameters and Facebook click id from the ad), `page_url`, `submitted_at`.

## Availability shown in the widget

`availability` in `config.js`: clinic days ahead (10), `weekdays` (currently Monday, Wednesday and Friday), `slots` (15-minute times, 9:30am to 4:00pm AEST), a
`closedDates` list for public holidays (**refresh it every year**; QLD holidays are listed through May 2027) and
`mockBookedRatio` for the demo effect. Queensland has no daylight saving; all times are labelled AEST. Days and times are both
in `config.js`.

## Ad message match

Add `?p=glasses`, `?p=contacts`, `?p=both` or `?p=readers` to the landing URL of each ad (or use
`utm_content=` with the same values) and the page pre-answers the first question of the tuner, so a
"reading glasses" ad lands on a page already tuned to reading glasses.

## SEO

The page is indexable (`index, follow`, canonical https://laservisionsurgery.net.au/) with structured data
(MedicalClinic, Physician, FAQPage), `robots.txt` and `sitemap.xml`. After the domain is live: add the site in
Google Search Console (Domain property, DNS TXT verification), submit `sitemap.xml` and request indexing. The
keyword H1 is the small line above the headline; the headline itself is a styled paragraph, so change copy there
without breaking the heading structure. Update `<lastmod>` in `sitemap.xml` when the page changes materially.
The wider plan (links, directories, press) is in `notes/SEO-PLAN.md`.

## Tracking

- UTM parameters and `fbclid` / `gclid` are captured and sent in the email as `lead_source`.
- On a successful submission the page calls `fbq('track', 'Lead')` if the Meta Pixel is installed, and
  `gtag('event', 'generate_lead')` if GA4 is present. Add the pixel snippet in `<head>` (there is a comment
  marking the spot).

## Placeholders to replace before launch

- Reviews and the three video tiles in **Patient stories** are sample content (marked on the page). Replace with
  EyeHub's verified reviews and real videos; put a YouTube ID or embed URL in each tile's `data-video`.
- Dr Moorthy's quote is a draft for her approval.
- Add Dr Moorthy's Ahpra registration number to the footer practitioner line.
- Confirm with the client: enhancement-within-12-months wording, and dated substantiation for "Queensland's
  first" / "only clinic in Queensland" (re-check every 90 days while ads run).
- Privacy Policy link points to eyehub.net.au/privacy-policy/. The policy should mention that booking requests
  are transmitted via EmailJS.
- Test inside the Facebook and Instagram in-app browsers (the calendar button switches to a Google Calendar link
  there, because those browsers ignore file downloads).

## Dev notes

- `?nofx` on the URL disables entrance animations (used for static screenshots); the page also honours
  `prefers-reduced-motion`.
- Fonts: Google Fonts *Inter* (optical-size axis) standing in for the client's self-hosted Inter Display.
- Two booking widgets are mounted from the same template (`[data-booking]`), hero and final CTA.
