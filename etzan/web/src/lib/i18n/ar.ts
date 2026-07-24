// Arabic message catalogue — the source of truth for the key set.
//
// MessageKey is derived from this object, so en.ts is checked against it at
// compile time: a missing or misspelled English string fails `tsc -b` rather
// than rendering a raw key in production.
//
// Copy rules applied here (and mirrored in en.ts):
//   - every field says what it is FOR, not just what it is named
//   - every result says what it means and what to do next
//   - jargon is glossed on first use
//   - numbers are never baked into a string; they arrive via {placeholders}

export const ar = {
  // --- Chrome ------------------------------------------------------------- //
  "brand.name": "اتزان",
  "brand.tagline": "توازنك الرقمي",
  "nav.brain": "التعفن الدماغي",
  "nav.sleep": "النوم",
  "nav.dashboard": "المتابعة",
  "nav.about": "عن اتزان",
  "nav.languageLabel": "اللغة",
  "nav.switchToArabic": "عربي",
  "nav.switchToEnglish": "EN",

  // --- Shared ------------------------------------------------------------- //
  "common.next": "التالي",
  "common.previous": "السابق",
  "common.showResult": "اعرض النتيجة",
  "common.analyzing": "جارٍ التحليل…",
  "common.restart": "إعادة الفحص",
  "common.step": "الخطوة {current} من {total}",
  "common.yes": "نعم",
  "common.no": "لا",
  "common.error": "حدث خطأ: {message}",
  "common.recommendations": "توصياتنا لك",
  "common.technicalDetails": "تفاصيل تقنية",
  "common.progressOf": "{have} من {need}",
  "common.loadingModel": "جارٍ تحميل النموذج داخل متصفحك…",

  // --- The five-level scale ------------------------------------------------ //
  "level.1": "ممتاز",
  "level.2": "جيد",
  "level.3": "متوسط",
  "level.4": "يحتاج انتباه",
  "level.5": "خطر",
  "level.endpointLow": "ممتاز",
  "level.endpointHigh": "خطر",
  "level.caption": "المستوى {level} من {max}",
  "level.meterLabel": "مستوى النتيجة",
  "level.meterText": "المستوى {level} من {max} — {name}",

  // --- Model output labels ------------------------------------------------- //
  "disorder.Healthy": "لا مؤشرات اضطراب",
  "disorder.Mild": "مؤشرات خفيفة",
  "disorder.Moderate": "مؤشرات متوسطة",
  "disorder.Severe": "مؤشرات شديدة",

  "region.frontal": "التركيز والاندفاع",
  "region.parietal": "التوتر والقلق",
  "region.temporal": "المقارنة والتقدير الاجتماعي",
  "region.occipital": "وقت الشاشة",

  // --- Landing ------------------------------------------------------------- //
  "landing.title": "توازنك الرقمي",
  "landing.titleRest": "يبدأ من هنا",
  "landing.intro":
    "اتزان يقيس أثر الشاشة على ذهنك ونومك، ويعطيك خطوة عملية واحدة تبدأ بها. كل التحليل يجري داخل متصفحك — لا حساب، ولا خادم، ولا بيانات تغادر جهازك.",
  "landing.ctaStart": "ابدأ فحص التعفن الدماغي",
  "landing.ctaDashboard": "افتح لوحة المتابعة",
  "landing.factsTitle": "ماذا وجدنا في البيانات؟",
  "landing.factsSubtitle":
    "من تحليل استبيان رقمي وسجلّات 100 ألف ليلة نوم. هذه ارتباطات في بياناتنا، لا أحكام طبية.",
  "landing.fact1.stat": "التركيز ينخفض",
  "landing.fact1.text": "كلما زاد الاستخدام القهري للتطبيقات، انخفض التركيز المُبلَّغ عنه.",
  "landing.fact2.stat": "الشباب الأكثر تأثرًا",
  "landing.fact2.text": "الفئة الأصغر سنًا سجّلت أعلى معدلات الاستخدام المفرط والمقارنة الاجتماعية.",
  "landing.fact3.stat": "التصفّح بلا هدف",
  "landing.fact3.text": "أقوى مؤشّر مفرد ارتبط بالضغط النفسي في بياناتنا — أقوى من عدد الساعات نفسه.",
  "landing.fact4.stat": "التوتر والنوم",
  "landing.fact4.text": "ارتفاع التوتر خلال اليوم ارتبط بانخفاض جودة النوم في الليلة نفسها.",
  "landing.brain.title": "فحص التعفن الدماغي",
  "landing.brain.body": "أربع خطوات قصيرة تكشف علاقتك بالتطبيقات، وأي جانب منها يؤثر عليك أكثر.",
  "landing.sleep.title": "فحص النوم",
  "landing.sleep.body": "قيّم جودة نومك الحالية، واعرف كم ومتى ينبغي أن تنام لتحسينها.",
  "landing.dashboard.title": "لوحة المتابعة",
  "landing.dashboard.body": "سجّل يومك في أقل من دقيقة، وتابع إلى أين يتجه اتزانك عبر الأيام.",
  "landing.privacyNote":
    "ستة نماذج تعلّم آلي تعمل داخل متصفحك عبر ONNX. لا نرسل إجاباتك إلى أي مكان.",

  // --- Brain check --------------------------------------------------------- //
  "brain.pageTitle": "فحص التعفن الدماغي",
  "brain.pageIntro":
    "«التعفن الدماغي» (brain rot) تعبير شائع عن أثر التصفّح الطويل بلا هدف على التركيز والمزاج. هذا الفحص يقيسه من إجاباتك في أقل من دقيقتين.",
  "brain.resultTitle": "نتيجة فحص التعفن الدماغي",

  "brain.step.about": "عنك",
  "brain.step.usage": "استخدامك",
  "brain.step.habits": "علاقتك بالتطبيقات",
  "brain.step.state": "حالتك النفسية",
  "brain.likertLegend": "إلى أي مدى ينطبق عليك كل وصف؟ اسحب المؤشّر.",

  "brain.field.age": "كم عمرك؟",
  "brain.field.ageHint": "نستخدمه للمقارنة مع فئتك العمرية · {range} سنة",
  "brain.field.gender": "الجنس",
  "brain.field.occupation": "ماذا تعمل حاليًا؟",
  "brain.field.relationship": "حالتك الاجتماعية",
  "brain.field.dailyTime": "كم ساعة تقضيها يوميًا على تطبيقات التواصل؟",
  "brain.field.dailyTimeHint": "قدّر متوسط آخر أسبوع، لا أفضل يوم لديك.",
  "brain.field.platforms": "ما المنصّات التي تستخدمها بانتظام؟",
  "brain.field.platformsHint": "اختر كل ما ينطبق — اضغط مرة أخرى لإلغاء الاختيار.",

  "brain.gender.female": "أنثى",
  "brain.gender.male": "ذكر",
  "brain.occupation.student": "طالب/ة",
  "brain.occupation.worker": "موظف/ة",
  "brain.occupation.retired": "متقاعد/ة",
  "brain.relationship.single": "أعزب/عزباء",
  "brain.relationship.inRelationship": "في علاقة",
  "brain.relationship.married": "متزوج/ة",
  "brain.relationship.divorced": "مطلّق/ة",

  "brain.time.0": "أقل من ساعة",
  "brain.time.1": "1–2 ساعة",
  "brain.time.2": "2–3 ساعات",
  "brain.time.3": "3–4 ساعات",
  "brain.time.4": "4–5 ساعات",
  "brain.time.5": "أكثر من 5 ساعات",

  "brain.item.aimless": "أفتح التطبيقات وأتصفّح بلا هدف واضح",
  "brain.item.distracted": "أنتقل إلى التطبيقات وأنا في منتصف عمل مهم",
  "brain.item.restless": "أشعر بالتوتر إذا ابتعدت عن هاتفي",
  "brain.item.comparison": "أقارن حياتي بما يعرضه الآخرون على المنصّات",
  "brain.item.validation": "يهمّني عدد الإعجابات والتفاعلات على ما أنشره",
  "brain.item.depression": "أشعر بالإحباط أو الحزن",
  "brain.item.worries": "تنتابني الهموم والقلق",
  "brain.item.concentration": "أجد صعوبة في التركيز لفترة طويلة",
  "brain.item.interest": "يتذبذب اهتمامي بالأنشطة التي كنت أحبّها",
  "brain.item.sleepIssues": "أواجه مشكلات في النوم",
  "brain.item.distractibility": "أتشتّت بسهولة",
  "brain.likertHint": "{range} — إجابتك: {value}",
  "brain.likert.1": "لا ينطبق إطلاقًا",
  "brain.likert.5": "ينطبق تمامًا",

  "brain.note.1": "لا يظهر في إجاباتك نمط استخدام يستدعي القلق. استمر على ما أنت عليه.",
  "brain.note.2": "نمط استخدامك جيد بشكل عام. هناك عادة أو اثنتان تستحقان الانتباه قبل أن تتراكم.",
  "brain.note.3": "بدأت بعض عاداتك الرقمية تؤثر على تركيزك ومزاجك. تغيير واحد صغير الآن يوفّر عليك الكثير لاحقًا.",
  "brain.note.4": "إجاباتك تُظهر مؤشّرات واضحة على استخدام مفرط يؤثر على يومك. ابدأ بالتوصية الأولى أدناه هذا الأسبوع.",
  "brain.note.5": "نمط استخدامك مرتفع جدًا وأثره على تركيزك ومزاجك واضح. اختر توصية واحدة والتزم بها سبعة أيام.",

  "brain.contributors.raising": "ما الذي رفع نتيجتك؟",
  "brain.contributors.neutral": "أكثر العوامل تأثيرًا في نتيجتك",
  "brain.contributors.lead": "أبرزها يخصّ {region}.",
  "brain.contributors.raises": "يرفع النتيجة",
  "brain.contributors.lowers": "يخفض النتيجة",
  "brain.contributors.neutralItem": "محايد",
  "brain.contributors.answer": "{value} من {max}",

  "brain.mh.title": "مؤشّر منفصل: الأثر النفسي",
  "brain.mh.explain":
    "هذا نموذج ثانٍ مستقل يقرأ إجاباتك عن المزاج والقلق. قد يختلف عن نتيجتك أعلاه، وهذا طبيعي — كلٌّ منهما يقيس شيئًا مختلفًا.",
  "brain.mh.note.1": "لم يرصد المؤشّر النفسي أثرًا مرتبطًا بنمط استخدامك.",
  "brain.mh.note.2": "المؤشّر النفسي ضمن المدى الجيد.",
  "brain.mh.note.3": "المؤشّر النفسي متوسط. راقب مزاجك خلال الأسابيع القادمة.",
  "brain.mh.note.4": "المؤشّر النفسي يشير إلى أثر محتمل يستحق الانتباه.",
  "brain.mh.note.5": "المؤشّر النفسي مرتفع. إن استمرّ الشعور أكثر من أسبوعين، فالحديث مع مختص خطوة معقولة.",

  "brain.tech.brainProb": "احتمال نموذج التعفن الدماغي: {value}",
  "brain.tech.mhProb": "احتمال نموذج الأثر النفسي: {value}",
  "brain.tech.threshold": "عتبة القرار في النموذجين: {value}",
  "brain.tech.note": "الاحتمال مخرَج النموذج الخام؛ المستوى أعلاه مشتقّ منه بعد التقريب إلى دقة العرض.",
  "brain.a11y.illustration": "رسم توضيحي للدماغ بلون المستوى {level} — {name}",

  // --- Sleep check --------------------------------------------------------- //
  "sleep.pageTitle": "فحص النوم",
  "sleep.pageIntro":
    "أجب عن عاداتك في يوم واحد، وسنقدّر جودة نومك المتوقعة ونحسب الموعد الذي يمنحك أفضل نتيجة.",
  "sleep.resultTitle": "موعد نومك المثالي",

  "sleep.step.about": "عنك",
  "sleep.step.day": "يومك",
  "sleep.step.beforeBed": "قبل النوم",
  "sleep.step.wearable": "من ساعتك الذكية (اختياري)",

  "sleep.field.age": "كم عمرك؟",
  "sleep.field.gender": "الجنس",
  "sleep.field.height": "الطول (سم)",
  "sleep.field.weight": "الوزن (كجم)",
  "sleep.field.bmi": "مؤشر كتلة الجسم (يُحسب تلقائيًا)",
  "sleep.field.bmiHint": "الوزن ÷ مربّع الطول — يستخدمه النموذج كعامل مساعد.",
  "sleep.field.chronotype": "متى تشعر أنك في أفضل حالاتك؟",
  "sleep.field.occupation": "المهنة",
  "sleep.field.country": "الدولة",
  "sleep.field.mentalHealth": "كيف تصف حالتك النفسية عمومًا؟",
  "sleep.field.stress": "كم كان توترك اليوم؟",
  "sleep.field.workHours": "كم ساعة عملت اليوم؟",
  "sleep.field.steps": "كم خطوة مشيت اليوم؟",
  "sleep.field.nap": "كم دقيقة نمت قيلولة؟",
  "sleep.field.exercise": "هل مارست الرياضة اليوم؟",
  "sleep.field.shiftWork": "هل تعمل بنظام الورديات؟",
  "sleep.field.dayType": "هل اليوم يوم عمل أم عطلة؟",
  "sleep.field.season": "ما الفصل الحالي؟",
  "sleep.field.caffeine": "كم كافيين تناولت قبل النوم؟ (ملغ)",
  "sleep.field.caffeineHint": "فنجان قهوة ≈ 95 ملغ · كوب شاي ≈ 40 ملغ · المدى {range}",
  "sleep.field.alcohol": "وحدات الكحول قبل النوم",
  "sleep.field.screenBeforeBed": "كم دقيقة أمضيت أمام شاشة قبل النوم مباشرة؟",
  "sleep.field.roomTemp": "درجة حرارة غرفتك (مئوية)",
  "sleep.field.roomTempHint": "المدى الأمثل للنوم العميق {range} مئوية",
  "sleep.field.bedtime": "متى نمت؟",
  "sleep.field.wakeUp": "متى استيقظت؟",
  "sleep.field.weekendDiff": "كم ساعة إضافية تنامها في العطلة؟",
  "sleep.field.weekendDiffHint": "الفارق الكبير بين أيام العمل والعطلة يربك ساعتك البيولوجية.",
  "sleep.field.sleepAid": "هل استخدمت مساعدًا على النوم؟",
  "sleep.field.duration": "مدّة نومك المحسوبة: {hours} ساعة",

  "sleep.gender.female": "أنثى",
  "sleep.gender.male": "ذكر",
  "sleep.gender.other": "آخر",
  "sleep.chronotype.morning": "صباحي — أنشط في أول اليوم",
  "sleep.chronotype.evening": "مسائي — أنشط في آخر اليوم",
  "sleep.chronotype.neutral": "متوازن — لا فرق كبير",
  "sleep.mh.healthy": "جيدة",
  "sleep.mh.anxiety": "قلق",
  "sleep.mh.depression": "اكتئاب",
  "sleep.mh.both": "قلق واكتئاب",
  "sleep.dayType.weekday": "يوم عمل",
  "sleep.dayType.weekend": "عطلة",
  "sleep.season.spring": "الربيع",
  "sleep.season.summer": "الصيف",
  "sleep.season.autumn": "الخريف",
  "sleep.season.winter": "الشتاء",

  "sleep.wearable.legend": "قياسات من ساعة ذكية",
  "sleep.wearable.intro":
    "اتركها فارغة إن لم تتوفّر — سنستخدم القيمة الوسيطة من بيانات التدريب بدلًا منها.",
  "sleep.field.rem": "نسبة نوم REM (%)",
  "sleep.field.remHint": "REM هو طور الأحلام · {range}",
  "sleep.field.deep": "نسبة النوم العميق (%)",
  "sleep.field.latency": "كم دقيقة استغرقت حتى نمت؟",
  "sleep.field.wakeEpisodes": "كم مرة استيقظت أثناء الليل؟",
  "sleep.field.heartRate": "نبض القلب أثناء الراحة",
  "sleep.field.heartRateHint": "نبضة في الدقيقة · {range}",

  "sleep.result.schedule": "نم {hours} ساعة، من {bedtime} إلى {wakeUp}.",
  "sleep.result.compareTitle": "جودة نومك: وضعك الآن مقابل الموعد المقترح",
  "sleep.result.compareIntro":
    "الرقمان يأتيان من النموذج نفسه على جدولين مختلفين — اقرأهما كمقارنة قبل/بعد، لا كنتيجتين منفصلتين.",
  "sleep.result.current": "وضعك الحالي",
  "sleep.result.recommended": "لو اتبعت الموعد المقترح",
  "sleep.result.currentDetail": "تنام {hours} ساعة بدءًا من {bedtime}",
  "sleep.gain.one": "أفضل بمستوى واحد من وضعك الحالي.",
  "sleep.gain.two": "أفضل بمستويين من وضعك الحالي.",
  "sleep.gain.many": "أفضل بـ {count} مستويات من وضعك الحالي.",
  "sleep.gain.worse": "وضعك الحالي أفضل — التزم بموعدك الحالي.",
  "sleep.gain.within": "المستوى نفسه، مع تحسّن ملموس داخل المستوى.",
  "sleep.gain.none": "لا فرق يُذكر عن وضعك الحالي.",

  "sleep.disorder.title": "مؤشّر اضطراب النوم",
  "sleep.rested.title": "الشعور بالراحة عند الاستيقاظ",
  "sleep.rested.note": "احتمال أن تستيقظ مرتاحًا على جدولك الحالي.",
  "sleep.curve.title": "كيف تتغيّر جودة نومك مع المدّة؟",
  "sleep.curve.intro":
    "كل نقطة هي مدّة نوم مختلفة بنفس ظروف يومك. كلما ارتفع الخط كان المستوى أفضل، والنقطة المعلَّمة هي الأفضل لك.",
  "sleep.curve.xAxis": "مدّة النوم (ساعات)",
  "sleep.curve.tooltipLevel": "المستوى",
  "sleep.curve.tooltipHours": "{hours} ساعة",
  "sleep.tech.current": "جودة النوم على جدولك الحالي: {value} من {max}",
  "sleep.tech.recommended": "الجودة المتوقعة عند الموعد المقترح: {value} من {max}",
  "sleep.tech.delta": "الفرق: {value} نقطة",
  "sleep.a11y.illustration": "رسم توضيحي لليلة نوم من {bedtime} إلى {wakeUp} بمدة {hours} ساعة، بلون المستوى {level} — {name}",

  // --- Dashboard ----------------------------------------------------------- //
  "dash.pageTitle": "لوحة المتابعة",
  "dash.intro":
    "سجّل يومك في أقل من دقيقة وتابع إلى أين يتجه اتزانك. تُحفظ بياناتك في متصفحك فقط ولا تُرسل لأي خادم — خذ نسخة احتياطية قبل مسح بيانات المتصفح، وإلا فقدتها.",
  "dash.backup": "حفظ نسخة احتياطية",
  "dash.restore": "استعادة البيانات",
  "dash.horizon": "آخر {days}",
  "dash.summaryTitle": "ملخّص اليوم",
  "dash.balanceTitle": "اتزانك اليوم",
  "dash.balanceNote": "متوسّط جانبَي التعفن الدماغي والنوم ليوم {date}.",
  "dash.sidesTitle": "الجانبان",
  "dash.sidesNote": "اللونان هنا هما لونا الخطّين في الرسم أدناه.",
  "dash.series.brain": "التعفن الدماغي",
  "dash.series.sleep": "النوم",
  "dash.trendTitle": "مسار الجانبين",
  "dash.trendIntro": "كلما ارتفع الخط كان المستوى أفضل. كل نقطة يوم سجّلته.",
  "dash.forecastTitle": "الاتزان — الفعلي والمتوقع",
  "dash.forecastIntro":
    "الخط المتصل ما سجّلته فعلًا، والمتقطّع الأخضر امتداد خطّي لمساره. الخط الأصفر الأفقي هو المستوى المتوسط.",
  "dash.legend.actual": "المُسجَّل فعليًا",
  "dash.legend.projected": "المتوقع",
  "dash.forecastCaveat": "هذا استقراء لاتجاهك الحالي، لا تنبّؤ — سيتغيّر مع كل يوم تسجّله.",
  "dash.forecastVerdict": "المستوى المتوقع بعد {days}:",
  "dash.verdict.improving": "في تحسّن",
  "dash.verdict.steady": "مستقر",
  "dash.verdict.declining": "في تراجع",
  "dash.empty.trendTitle": "سجّل المزيد من الأيام لعرض المسار",
  "dash.empty.trendBody": "نحتاج {days} على الأقل قبل رسم أي مسار — نقطتان لا تكوّنان اتجاهًا.",
  "dash.empty.forecastTitle": "سجّل المزيد من الأيام لفتح التوقّعات",
  "dash.empty.forecastBody": "التوقّع يحتاج {days} على الأقل ليكون له معنى.",

  "dash.logTitle": "تسجيل اليوم",
  "dash.group.sleep": "نومك",
  "dash.group.screen": "شاشتك",
  "dash.group.day": "يومك",
  "dash.field.date": "عن أي يوم تسجّل؟",
  "dash.field.sleepHours": "كم ساعة نمت الليلة الماضية؟",
  "dash.field.sleepHoursHint": "أقرب نصف ساعة يكفي",
  "dash.field.feltRested": "هل استيقظت مرتاحًا؟",
  "dash.field.screenHours": "كم ساعة أمضيت أمام الشاشات؟",
  "dash.field.screenHoursHint": "إجمالي وقت الشاشة اليوم",
  "dash.field.socialHours": "منها، كم ساعة على تطبيقات التواصل؟",
  "dash.field.socialHoursHint": "جزء من وقت الشاشة أعلاه",
  "dash.field.compulsive": "كم شعرت أنك تفتح هاتفك دون قرار واعٍ؟",
  "dash.field.stress": "كم كان توترك اليوم؟",
  "dash.field.caffeine": "كم كافيين تناولت؟ (ملغ)",
  "dash.field.caffeineHint": "فنجان قهوة ≈ 95 ملغ",
  "dash.field.exercise": "هل مارست الرياضة؟",
  "dash.save": "حفظ اليوم",
  "dash.rangeHint": "{range} — إجابتك: {value}",
  "dash.outOfRange": "القيمة خارج المدى المقبول {range}",
  "dash.fieldHint": "{hint} · {range}",

  // --- About ---------------------------------------------------------------- //
  "about.pageTitle": "عن اتزان",
  "about.intro":
    "اتزان مشروع علم بيانات يترجم ستة نماذج تعلّم آلي إلى ثلاث أدوات تعمل داخل متصفحك. هذه الصفحة تشرح ما تقيسه كل أداة، وعلى أي بيانات دُرِّبت، وأين حدودها.",

  "about.whatTitle": "ما «التعفن الدماغي»؟",
  "about.whatBody":
    "«brain rot» تعبير شائع — اختارته Oxford كلمةَ عام 2024 — يصف الشعور بتبلّد التركيز بعد ساعات من التصفّح السريع بلا هدف. ليس تشخيصًا طبيًا ولا يوجد اختبار سريري له. ما نقيسه في اتزان هو نمط الاستخدام والأعراض التي يبلّغ عنها الناس، لا حالة في الدماغ.",

  "about.dataTitle": "البيانات",
  "about.dataQuestionnaire":
    "استبيان رقمي عن العلاقة بالتطبيقات: العمر والحالة والمنصّات المستخدمة، مع أسئلة على مقياس من 1 إلى 5 عن الاستخدام القهري والمزاج والتركيز.",
  "about.dataSleep":
    "مجموعة بيانات صحة النوم بحوالي 100 ألف ليلة: مواعيد النوم والاستيقاظ، الكافيين والكحول ووقت الشاشة قبل النوم، حرارة الغرفة، التوتر والخطوات، إضافة إلى قياسات ساعات ذكية مثل نسبة REM والنوم العميق.",
  "about.dataNote":
    "البيانات مقطعية ومُبلَّغ عنها ذاتيًا في جزء كبير منها. هي تكشف ارتباطات، لا علاقات سببية: النتيجة المرتفعة لا تعني أن الشاشة سبّبت الحالة.",

  "about.modelsTitle": "النماذج التي تعمل في متصفحك",
  "about.modelsIntro":
    "كل نموذج مُصدَّر إلى صيغة ONNX ويعمل عبر onnxruntime-web. هذه أرقام الأداء على مجموعة اختبار محجوزة (20٪ من البيانات):",
  "about.model.brainRot": "التعفن الدماغي",
  "about.model.mentalHealth": "الأثر النفسي",
  "about.model.sleepQuality": "جودة النوم",
  "about.model.disorder": "اضطراب النوم",
  "about.model.feltRested": "الشعور بالراحة",
  "about.model.bedtime": "موعد النوم المقترح",
  "about.table.model": "النموذج",
  "about.table.algo": "الخوارزمية",
  "about.table.metric": "الأداء",
  "about.metric.auc": "AUC {value}",
  "about.metric.acc": "دقة {value}",
  "about.metric.r2": "R² {value}",
  "about.modelsCaveat":
    "نموذج اضطراب النوم كان يبلغ دقة 0.95 بخوارزمية HistGradientBoosting، لكنها لا تتحوّل إلى ONNX، فشُحنت Random Forest بدقة 0.865. هذه مقايضة مقصودة: دقة أقل مقابل عمل كامل داخل المتصفح دون خادم.",

  "about.levelsTitle": "كيف تقرأ المستويات الخمسة؟",
  "about.levelsIntro":
    "كل نتيجة في اتزان تُعرض على المقياس نفسه: خمسة مستويات، الأعلى يعني قلقًا أكبر. المقاييس الداخلية (احتمالات، درجات من 10) تُحوَّل إلى هذا المقياس قبل عرضها حتى لا توازن بين ثلاثة أنظمة في رأسك.",
  "about.levels.1": "لا مؤشّرات تستدعي الانتباه.",
  "about.levels.2": "ضمن المدى الجيد، مع هامش للتحسين.",
  "about.levels.3": "مؤشّرات متوسطة تستحق تغييرًا واحدًا محدّدًا.",
  "about.levels.4": "مؤشّرات واضحة — ابدأ بتوصية واحدة هذا الأسبوع.",
  "about.levels.5": "مؤشّرات مرتفعة تستدعي تغييرًا جادًا.",

  "about.privacyTitle": "الخصوصية",
  "about.privacyBody":
    "لا يوجد خادم ولا قاعدة بيانات ولا حساب. تعمل النماذج داخل متصفحك، وتُحفظ سجلّات لوحة المتابعة في التخزين المحلي (localStorage) على جهازك وحده. لا نجمع تحليلات ولا نستخدم ملفات تعريف ارتباط. مسح بيانات المتصفح يمسح سجلّاتك نهائيًا — استخدم «حفظ نسخة احتياطية» أولًا.",

  "about.disclaimerTitle": "تنبيه مهم",
  "about.disclaimerBody":
    "اتزان أداة تعليمية ومشروع، وليس جهازًا طبيًا ولا بديلًا عن استشارة مختص. لا تستخدم نتائجه لتشخيص حالة أو إيقاف علاج. إن كنت تعاني من اضطراب نوم مستمر أو ضيق نفسي، فتحدّث مع طبيب أو مختص نفسي.",

  "about.teamTitle": "الفريق",
  "about.teamBody": "مشروع علم بيانات من أكاديمية طويق.",

  // --- Recommendations ------------------------------------------------------ //
  "rec.screenBudget.title": "حدّد ميزانية لوقت الشاشة",
  "rec.screenBudget.body":
    "اختر سقفًا يوميًا لتطبيقات التواصل وفعّل مؤقّت التطبيق في إعدادات هاتفك. السقف الذي يقرّره النظام أنجح من السقف الذي تقرّره في اللحظة.",
  "rec.mindful.title": "اسأل قبل أن تفتح",
  "rec.mindful.body":
    "قبل فتح أي تطبيق، اسأل: لماذا أفتحه الآن؟ هذا السؤال وحده يقطع أغلب مرات التصفّح التلقائي.",
  "rec.detach.title": "خصّص فترات بلا هاتف",
  "rec.detach.body":
    "ابدأ بثلاثين دقيقة يوميًا والهاتف في غرفة أخرى. الهدف تعويد نفسك على الملل القصير، فهو ما يدفعك للتصفّح.",
  "rec.feedHygiene.title": "نظّف خلاصتك",
  "rec.feedHygiene.body":
    "ألغِ متابعة الحسابات التي تجعلك تقارن نفسك بها. أنت لا تتحكم في وقتك فقط، بل فيما يُعرض عليك خلاله.",
  "rec.focusBlocks.title": "اعمل في جلسات مغلقة",
  "rec.focusBlocks.body":
    "خمس وعشرون دقيقة عمل ثم خمس راحة، والهاتف خارج مجال بصرك لا في جيبك. وجود الهاتف أمامك يستهلك انتباهًا حتى وهو مغلق.",
  "rec.sleepBridge.title": "شاشتك قد تكون سبب أرقك",
  "rec.sleepBridge.body":
    "أشرت إلى مشكلات في النوم، وهي ترتبط غالبًا بالاستخدام الليلي. جرّب فحص النوم في اتزان لتقدير الأثر.",
  "rec.mentalHealth.title": "انتبه لحالتك النفسية",
  "rec.mentalHealth.body":
    "أشار المؤشّر النفسي إلى أثر محتمل. تحدّث مع شخص تثق به، وإن استمرّ الشعور أكثر من أسبوعين فاستشر مختصًا.",
  "rec.maintain.title": "حافظ على ما أنت عليه",
  "rec.maintain.body":
    "لم يرصد الفحص مؤشّرات تستدعي القلق. سجّل أيامك في لوحة المتابعة لتلاحظ أي انحراف مبكرًا.",
  "rec.watch.title": "نتيجتك ضمن المدى الجيد",
  "rec.watch.body":
    "لم يرصد الفحص مؤشّرات تستدعي القلق، لكن العادات أعلاه تستحق الانتباه قبل أن تتراكم.",

  "rec.caffeine.title": "أوقف الكافيين مبكرًا",
  "rec.caffeine.body":
    "للكافيين نصف عمر يقارب ست ساعات، أي أن نصف فنجان العصر ما زال في دمك عند النوم. اجعل آخر فنجان قبل النوم بست ساعات.",
  "rec.screenBeforeBed.title": "أطفئ الشاشات قبل النوم بساعة",
  "rec.screenBeforeBed.body":
    "الضوء الأزرق يؤخّر إفراز الميلاتونين، والمحتوى المثير يبقي ذهنك متيقظًا. الوضع الليلي يساعد لكنه لا يعوّض إطفاء الشاشة.",
  "rec.roomTemp.title": "ابرِّد غرفتك",
  "rec.roomTemp.body":
    "يحتاج جسمك إلى خفض حرارته الداخلية ليدخل النوم العميق. اجعل الغرفة بين 18 و21 مئوية.",
  "rec.stress.title": "فرّغ ذهنك قبل النوم",
  "rec.stress.body":
    "دوّن مهام الغد على ورقة قبل النوم بساعة، أو جرّب تنفّسًا بطيئًا لخمس دقائق. الأفكار المعلّقة هي ما يؤخّر النوم غالبًا.",
  "rec.regularity.title": "ثبّت مواعيدك",
  "rec.regularity.body":
    "الفارق الكبير بين نوم أيام العمل والعطلة يشبه تغيير المنطقة الزمنية كل أسبوع. قارِب بينهما ولو بساعة.",
  "rec.duration.title": "امنح نفسك وقتًا كافيًا",
  "rec.duration.body":
    "مدّتك الحالية أقل من سبع ساعات. اتبع الموعد المقترح أعلاه بدل محاولة تعويض النوم في العطلة.",
  "rec.sleepMaintain.title": "عاداتك الليلية جيدة",
  "rec.sleepMaintain.body":
    "لم يرصد الفحص عاملًا يستحق التغيير. تابع انتظامك عبر لوحة المتابعة.",

  // --- Contributor labels ---------------------------------------------------- //
  "contrib.aimless_use": "التصفّح بلا هدف واضح",
  "contrib.distracted_when_busy": "التشتّت أثناء العمل المهم",
  "contrib.distractibility": "سهولة التشتّت",
  "contrib.concentration_difficulty": "صعوبة التركيز",
  "contrib.restless_without": "التوتر عند الابتعاد عن الهاتف",
  "contrib.worries": "الهموم والقلق",
  "contrib.depression": "الإحباط أو الحزن",
  "contrib.interest_fluctuation": "تذبذب الاهتمام",
  "contrib.comparison": "المقارنة بالآخرين",
  "contrib.seeks_validation": "البحث عن التقدير عبر التفاعلات",
  "contrib.sleep_issues": "مشكلات النوم",
  "contrib.daily_time": "ساعات التواصل الاجتماعي اليومية",

  // --- Day counts (plural forms are selected in format.ts) ------------------- //
  "days.zero": "لا أيام",
  "days.one": "يوم واحد",
  "days.two": "يومان",
  "days.few": "{count} أيام",
  "days.many": "{count} يومًا",
  "days.other": "{count} يوم",
  "daysLogged.zero": "لا أيام مسجّلة",
  "daysLogged.one": "يوم واحد مسجّل",
  "daysLogged.two": "يومان مسجّلان",
  "daysLogged.few": "{count} أيام مسجّلة",
  "daysLogged.many": "{count} يومًا مسجّلًا",
  "daysLogged.other": "{count} يوم مسجّل",

  // --- Errors ---------------------------------------------------------------- //
  "error.invalidBackup": "الملف غير صالح — اختر ملف نسخة احتياطية صادرًا من اتزان.",

  // --- Page metadata --------------------------------------------------------- //
  "meta.home.title": "اتزان — توازنك الرقمي",
  "meta.home.description":
    "افحص أثر الشاشة على تركيزك وجودة نومك بنماذج تعلّم آلي تعمل داخل متصفحك، دون إرسال أي بيانات.",
  "meta.brain.title": "فحص التعفن الدماغي — اتزان",
  "meta.brain.description":
    "فحص من أربع خطوات يقيس علاقتك بتطبيقات التواصل وأثرها على تركيزك ومزاجك، مع توصيات عملية.",
  "meta.sleep.title": "فحص جودة النوم وموعد النوم المثالي — اتزان",
  "meta.sleep.description":
    "قدّر جودة نومك المتوقعة واحسب موعد النوم الذي يمنحك أفضل نتيجة، من عاداتك في يوم واحد.",
  "meta.dashboard.title": "لوحة متابعة الاتزان الرقمي — اتزان",
  "meta.dashboard.description":
    "سجّل نومك ووقت شاشتك يوميًا وتابع مسار اتزانك. بياناتك محفوظة في متصفحك وحده.",
  "meta.about.title": "عن اتزان — المنهجية والبيانات والخصوصية",
  "meta.about.description":
    "ما الذي يقيسه اتزان، على أي بيانات دُرِّبت نماذجه، ما دقّتها، وأين حدودها.",
} as const;

export type MessageKey = keyof typeof ar;
