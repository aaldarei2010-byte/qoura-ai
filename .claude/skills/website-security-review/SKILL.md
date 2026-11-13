---
name: website-security-review
description: مراجعة أمنية شاملة من 27 بنداً لأي موقع أو تطبيق ويب (Website security review & hardening checklist). استخدمها تلقائياً عند بناء أي موقع جديد أو تعديل موقع قائم أو قبل إطلاقه/نشره، وكلما ذُكر الأمان، الحماية، الثغرات، الاختراق، مفاتيح API، تسجيل الدخول، المدفوعات، أو "أبي أطلق الموقع". Use whenever building, changing, deploying or launching any website, web app, landing page or API, and whenever the user mentions security, vulnerabilities, auth, API keys, payments, or launching safely — even if they don't ask for a security review explicitly.
---

# مراجعة أمان المواقع — Website Security Review (27 بند)

أنت مراجع أمني محترف. الموقع مبني بالـ vibe coding والهدف إطلاقه بأمان.
You are an expert security reviewer. The site was built with vibe coding and must launch safely.

## متى تشتغل هذي المهارة
- **عند بناء أي موقع جديد:** طبّق البنود كجزء من البناء (لا تأجلها لآخر شي)، وفي نهاية العمل سوّ جولة تحقق سريعة على البنود وعطِ ملخص.
- **عند أي تعديل على موقع قائم:** راجع البنود اللي يمسها التعديل (مثلاً نموذج جديد ← 6، 7، 12، 16).
- **قبل الإطلاق أو عند الطلب:** امشِ على الـ27 بند كاملة.

## طريقة العمل (إلزامية)
1. امشِ على البنود **وحدة وحدة** بالترتيب.
2. **أصلح اللي تقدر عليه** مباشرة إذا كان التغيير صغير وآمن.
3. **اسأل قبل أي تغيير كبير:** تغيير مكتبة المصادقة، تعديل بنية قاعدة البيانات، حذف ملفات/مكتبات، إعادة كتابة تاريخ Git، تغيير إعدادات النشر، أو أي شي ممكن يكسر الموقع.
4. إذا البند **ما ينطبق** (مثلاً موقع ثابت بدون قاعدة بيانات أو رفع ملفات) اكتب "لا ينطبق" مع السبب، ولا تتخطاه بصمت.
5. **لا تطلب من المستخدم يلصق مفاتيح أو كلمات سر في الشات أبداً** — كلها في متغيرات البيئة.
6. اختبر كل حماية بعد إضافتها (أمر curl، اختبار وحدة، أو فحص فعلي) — الإصلاح بدون اختبار مجرد افتراض.
7. اكتب الردود بالعربي البسيط، مع المصطلحات التقنية بالإنجليزي.

---

## البنود الـ27

### 1. تسجيل دخول آمن (Authentication)
**ليش؟** عشان ما يدخل أحد حساب غيره ولا يتخطى صفحة الدخول.
- عربي: راجع نظام تسجيل الدخول وخلّه آمن: جلسات صحيحة، تسجيل خروج يلغي الجلسة، وتحقق من هوية المستخدم على السيرفر في كل صفحة محمية. استخدم مكتبة مصادقة موثوقة بدل ما تكتبها من الصفر.
- English: Proper sessions, logout that invalidates the session, server-side identity checks on every protected page. Use a trusted auth library instead of writing it from scratch.

### 2. خبّ مفاتيح الـ API (Hide API keys)
**ليش؟** أي مفتاح يوصل للمتصفح يقدر أي أحد ينسخه ويصرف من حسابك.
- عربي: دوّر على أي مفتاح API أو كلمة سر في كود الواجهة أو مرسلة للمتصفح، وانقلها لمتغيرات بيئة على السيرفر، وخلّ الواجهة تكلم السيرفر بدل الخدمة الخارجية مباشرة.
- English: Find any key/secret in the frontend or sent to the browser, move it to server-side env vars, and proxy third-party calls through the server.

### 3. أمّن قاعدة البيانات (Secure database access)
**ليش؟** عشان كل مستخدم يشوف بياناته بس.
- عربي: كل استعلام يتحقق إن المستخدم يملك البيانات اللي يطلبها. فعّل Row Level Security إذا مدعومة، واستخدم حساب قاعدة بيانات بأقل صلاحيات.
- English: Every query checks ownership. Enable RLS if supported; use a least-privilege DB account.

### 4. خلّ HTTPS إجباري (Enforce HTTPS)
**ليش؟** عشان البيانات ما تنقرى وهي في الطريق.
- عربي: حوّل أي طلب HTTP إلى HTTPS، فعّل HSTS، وتأكد ما فيه رابط أو ملف يتحمّل عبر HTTP.
- English: Redirect HTTP→HTTPS, enable HSTS, no mixed content.

### 5. شفّر كلمات المرور (Hash passwords)
**ليش؟** لو تسرّبت القاعدة، كلمات المرور ما تنقرى.
- عربي: Argon2id أو bcrypt، لا نص عادي أبداً، ولا تنكتب في السجلات.
- English: Hash with Argon2id or bcrypt; never plaintext; never logged.

### 6. تحقق من النماذج من جهة السيرفر (Server-side validation)
**ليش؟** التحقق في المتصفح سهل يتخطاه أي أحد.
- عربي: تحقق من كل المدخلات على السيرفر (النوع، الطول، الحدود) لكل نموذج و API.
- English: Validate type, length and ranges on the server for every form and endpoint (e.g. zod/pydantic).

### 7. احمني من XSS (Protect against XSS)
**ليش؟** عشان ما أحد يحقن كود يشتغل في متصفح زوارك.
- عربي: أي محتوى كتبه المستخدم يتعرض كنص (encode on output). لا innerHTML ولا dangerouslySetInnerHTML مع بيانات غير موثوقة.
- English: Encode on output; avoid innerHTML / dangerouslySetInnerHTML with untrusted data (sanitize with DOMPurify if HTML is required).

### 8. راقب أي نشاط مشبوه (Log & monitor)
**ليش؟** عشان تعرف بالهجوم قبل ما يصير كارثة.
- عربي: سجّل الدخول الفاشل، تغيير كلمة المرور، عمليات الأدمن — بدون بيانات حساسة — وأضف تنبيه لتكرار محاولات الدخول الفاشلة.
- English: Log failed logins, password changes, admin actions (no secrets/PII); alert on repeated failures.

### 9. اقفل صفحات الأدمن (Lock down admin routes)
**ليش؟** إخفاء الرابط مو حماية.
- عربي: كل صفحة و API للأدمن يتحقق من الصلاحية على السيرفر، مو بس يخفي الزر.
- English: Server-side role checks on every admin page and API.

### 10. استخدم Parameterized Queries
**ليش؟** يسد باب SQL Injection.
- عربي: حوّل أي استعلام يركّب نص المستخدم داخل SQL إلى Parameterized Queries أو ORM.
- English: No string-concatenated SQL; use parameters or an ORM.

### 11. راجع متغيرات البيئة (Check environment variables)
**ليش؟** بعض المتغيرات توصل للمتصفح بدون ما تنتبه.
- عربي: الأسرار ما تبدأ بـ NEXT_PUBLIC_ أو VITE_ أو REACT_APP_ أو أي بادئة توصلها للمتصفح، وملف .env في .gitignore، ووفّر .env.example بدون قيم.
- English: No secret with a browser-exposed prefix; .env in .gitignore; ship an .env.example with no values.

### 12. حط Rate Limiting
**ليش؟** يمنع تخمين كلمات المرور واستنزاف الـ API.
- عربي: حد لكل IP ولكل مستخدم على الدخول والتسجيل واستعادة كلمة المرور وكل API مكلف (خصوصاً APIs الذكاء الاصطناعي)، ورجّع 429.
- English: Per-IP and per-user limits on auth and expensive endpoints (especially AI/LLM calls); return 429.

### 13. قيّد إعدادات CORS (Restrict CORS)
**ليش؟** عشان مواقع ثانية ما تكلم الـ API حقك.
- عربي: اقبل دومين الموقع بس، وشيل أي (*) خصوصاً مع الكوكيز.
- English: Allowlist own origin(s) only; no wildcard, especially with credentials.

### 14. أضف Security Headers
**ليش؟** طبقة حماية مجانية من المتصفح نفسه.
- عربي: Content-Security-Policy و Strict-Transport-Security و X-Frame-Options و X-Content-Type-Options و Referrer-Policy بإعدادات تناسب الموقع.
- English: CSP, HSTS, X-Frame-Options (or frame-ancestors), X-Content-Type-Options: nosniff, Referrer-Policy.

### 15. أمّن الكوكيز (Secure cookies)
**ليش؟** كوكيز الجلسة هي مفتاح الحساب.
- عربي: Secure و HttpOnly و SameSite=Lax أو Strict، مع مدة انتهاء معقولة.
- English: Secure, HttpOnly, SameSite=Lax/Strict, reasonable expiry.

### 16. أضف حماية CSRF
**ليش؟** يمنع موقع خبيث يسوي طلبات باسم المستخدم.
- عربي: توكن CSRF أو تحقق من الـ Origin لكل طلب يغيّر بيانات: إيميل، كلمة مرور، دفع، حذف.
- English: CSRF tokens or Origin checks on every state-changing request.

### 17. روابط استعادة كلمة المرور تنتهي (Expiring reset links)
**ليش؟** رابط قديم في إيميل مسرّب = حساب مسروق.
- عربي: تنتهي خلال 15–30 دقيقة، تنستخدم مرة وحدة، وتنلغي بعد تغيير كلمة المرور.
- English: 15–30 min expiry, single-use, invalidated after password change.

### 18. حدّد نوع وحجم الملفات المرفوعة (Restrict file uploads)
**ليش؟** عشان ما أحد يرفع ملف تنفيذي أو يعبّي السيرفر.
- عربي: أنواع محددة، تحقق من النوع الحقيقي (magic bytes) مو الامتداد بس، حد للحجم، وخزّن خارج مجلد الكود.
- English: Allowlisted types, verify real type not extension, size limit, store outside the code directory.

### 19. تحقق من الأسعار والمدفوعات (Verify prices & payments)
**ليش؟** السعر اللي يجي من المتصفح ممكن ينعدّل.
- عربي: السيرفر يحسب السعر من قاعدة البيانات، وتحقق من توقيع webhook بوابة الدفع قبل تأكيد الطلب.
- English: Server computes prices from the DB; verify the payment webhook signature before confirming.

### 20. اقفل وضع الـ Debug في الإنتاج (Disable debug mode)
**ليش؟** رسائل الخطأ التفصيلية تكشف أسرار الموقع.
- عربي: Debug مقفل في الإنتاج، ورسائل الخطأ عامة بدون stack trace ولا أسماء جداول ولا مسارات، و source maps مو منشورة للعامة.
- English: Debug off in prod; generic errors; no stack traces, table names, paths, or public source maps.

### 21. حدّث المكتبات اللي فيها ثغرات (Update vulnerable dependencies)
**ليش؟** أغلب الاختراقات تجي من مكتبة قديمة.
- عربي: شغّل npm audit (أو pip-audit وغيره)، حدّث المكتبات المصابة، وتأكد إن الموقع يشتغل بعد التحديث.
- English: Run npm audit / pip-audit, fix known CVEs, confirm the app still works.

### 22. احذف المكتبات اللي ما تستخدمها (Remove unused packages)
**ليش؟** كل مكتبة زيادة = باب زيادة.
- عربي: دوّر على المكتبات غير المستخدمة (مثلاً depcheck / knip) واحذفها **بعد ما تسألني**، وتأكد إن البناء سليم.
- English: Find unused packages (depcheck/knip), remove after confirmation, confirm the build.

### 23. تأكد ما فيه ملفات مكشوفة (Check for exposed files)
**ليش؟** ملفات مثل .env.backup ممكن تكون مفتوحة للعالم.
- عربي: ما فيه .env ولا نسخ احتياطية ولا ملفات SQL ولا مجلد .git ولا ملفات إعدادات يقدر أحد يفتحها من المتصفح (افحص مجلد public/dist).
- English: No .env, backups, SQL dumps, .git or config files publicly reachable (check public/ and build output).

### 24. افحص تاريخ Git عن مفاتيح مسرّبة (Scan Git history)
**ليش؟** حذف المفتاح من الكود ما يحذفه من التاريخ.
- عربي: افحص كل تاريخ Git (gitleaks أو trufflehog، أو `git log -p` مع grep إذا الأدوات مو متوفرة)، وعطني قائمة باللي لقيته — بدون ما تعرض قيمة المفتاح كاملة.
- English: Scan full history (gitleaks/trufflehog or git log -p + grep); list findings with values masked.

### 25. ألغِ المفاتيح المكشوفة وبدّلها (Revoke & replace keys)
**ليش؟** أي مفتاح انكشف يعتبر محروق.
- عربي: لكل مفتاح انكشف: قلّي وين ألغيه من لوحة الخدمة، وجهّز مكان المفتاح الجديد في متغيرات البيئة بدون ما تكتبه في الكود. إعادة كتابة تاريخ Git تحتاج موافقتي.
- English: For each exposed key: where to revoke it, and an env-var slot for the new one. Rewriting Git history requires my approval.

### 26. سوّ مراجعة أمنية كاملة (Full security review)
**ليش؟** نظرة شاملة كأنك مهاجم.
- عربي: راجع كأنك مهاجم: المصادقة، الصلاحيات، المدخلات، الأسرار، الإعدادات، والمكتبات. رتّب المشاكل حسب الخطورة.
- English: Attacker's-eye review of auth, authz, inputs, secrets, config, dependencies; rank by severity.

### 27. اختبر الحماية وعطني تقرير (Test & report)
**ليش؟** الإصلاح بدون اختبار مجرد افتراض.
- عربي: اختبر كل حماية أضفتها، وعطني التقرير بالصيغة أدناه.
- English: Test every protection and report in the format below.

---

## صيغة التقرير النهائي (Final report)

احفظ التقرير في ملف `SECURITY-REPORT.md` داخل مجلد الموقع، واعرض ملخصه في الرد.

| # | البند | المشكلة | الخطورة | كيف انحلت | نتيجة الاختبار |
|---|---|---|---|---|---|
| 1 | Authentication | ... | 🔴 حرجة / 🟠 عالية / 🟡 متوسطة / 🟢 منخفضة / ⚪ لا ينطبق | ... | ✅ نجح / ❌ فشل / ⏳ لم يُختبر |

ثم أقسام:
1. **ملخص تنفيذي** — كم مشكلة حسب الخطورة، وهل الموقع جاهز للإطلاق.
2. **أشياء تحتاج قرار مني** — التغييرات الكبيرة اللي ما سويتها، والمفاتيح اللي لازم أبدّلها ووين.
3. **خطوات يدوية** — أي إعداد لازم يتسوى في لوحة الاستضافة أو مزوّد الخدمة.

> ⚠️ لا تلصق مفاتيحك أو كلمات السر في الشات، خلّها في متغيرات البيئة. والمواقع اللي فيها مدفوعات أو بيانات حساسة تستاهل مراجعة من مختص.
