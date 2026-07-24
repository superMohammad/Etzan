import type { MessageKey } from "./ar";

// English catalogue. Typed as Record<MessageKey, string>, so omitting a key that
// exists in ar.ts is a compile error — the app can never fall back to a raw key
// at runtime.
//
// Written as English rather than translated from the Arabic: sentence shapes,
// idiom and length differ on purpose. Only the meaning is required to match.

export const en: Record<MessageKey, string> = {
  // --- Chrome ------------------------------------------------------------- //
  "brand.name": "Etzan",
  "brand.tagline": "Your digital balance",
  "nav.brain": "Brain rot",
  "nav.sleep": "Sleep",
  "nav.dashboard": "Tracking",
  "nav.about": "About",
  "nav.languageLabel": "Language",
  "nav.switchToArabic": "عربي",
  "nav.switchToEnglish": "EN",

  // --- Shared ------------------------------------------------------------- //
  "common.next": "Next",
  "common.previous": "Back",
  "common.showResult": "See my result",
  "common.analyzing": "Analysing…",
  "common.restart": "Start over",
  "common.step": "Step {current} of {total}",
  "common.yes": "Yes",
  "common.no": "No",
  "common.error": "Something went wrong: {message}",
  "common.recommendations": "What to do next",
  "common.technicalDetails": "Technical details",
  "common.progressOf": "{have} of {need}",
  "common.loadingModel": "Loading the model into your browser…",

  // --- The five-level scale ------------------------------------------------ //
  "level.1": "Excellent",
  "level.2": "Good",
  "level.3": "Moderate",
  "level.4": "Needs attention",
  "level.5": "Concerning",
  "level.endpointLow": "Excellent",
  "level.endpointHigh": "Concerning",
  "level.caption": "Level {level} of {max}",
  "level.meterLabel": "Result level",
  "level.meterText": "Level {level} of {max} — {name}",

  // --- Model output labels ------------------------------------------------- //
  "disorder.Healthy": "No disorder signs",
  "disorder.Mild": "Mild signs",
  "disorder.Moderate": "Moderate signs",
  "disorder.Severe": "Severe signs",

  "region.frontal": "focus and impulse",
  "region.parietal": "stress and worry",
  "region.temporal": "social comparison",
  "region.occipital": "screen time",

  // --- Landing ------------------------------------------------------------- //
  "landing.title": "Your digital balance",
  "landing.titleRest": "starts here",
  "landing.intro":
    "Etzan measures how screens are affecting your focus and your sleep, then gives you one concrete thing to change. Everything runs inside your browser — no account, no server, no data leaving your device.",
  "landing.ctaStart": "Start the brain-rot check",
  "landing.ctaDashboard": "Open the tracker",
  "landing.factsTitle": "What the data showed",
  "landing.factsSubtitle":
    "From a digital-habits questionnaire and roughly 100,000 logged nights of sleep. These are correlations in our data, not medical claims.",
  "landing.fact1.stat": "Focus drops",
  "landing.fact1.text": "The more compulsive the app use, the lower the self-reported focus.",
  "landing.fact2.stat": "Young adults most affected",
  "landing.fact2.text": "The youngest group reported the highest overuse and the most social comparison.",
  "landing.fact3.stat": "Aimless scrolling",
  "landing.fact3.text": "The single strongest correlate of psychological strain in our data — stronger than hours alone.",
  "landing.fact4.stat": "Stress and sleep",
  "landing.fact4.text": "Higher daytime stress tracked with lower sleep quality that same night.",
  "landing.brain.title": "Brain-rot check",
  "landing.brain.body": "Four short steps that map your relationship with apps, and which part of it affects you most.",
  "landing.sleep.title": "Sleep check",
  "landing.sleep.body": "Estimate the quality of your sleep, and find out how long and when you should actually sleep.",
  "landing.dashboard.title": "Daily tracker",
  "landing.dashboard.body": "Log a day in under a minute and watch where your balance is heading.",
  "landing.privacyNote":
    "Six machine-learning models run inside your browser via ONNX. Your answers are never sent anywhere.",

  // --- Brain check --------------------------------------------------------- //
  "brain.pageTitle": "Brain-rot check",
  "brain.pageIntro":
    "“Brain rot” is the popular name for what long, aimless scrolling does to your focus and mood. This check estimates it from your answers in under two minutes.",
  "brain.resultTitle": "Your brain-rot result",

  "brain.step.about": "About you",
  "brain.step.usage": "Your usage",
  "brain.step.habits": "You and your apps",
  "brain.step.state": "How you've been feeling",
  "brain.likertLegend": "How much does each statement describe you? Drag the slider.",

  "brain.field.age": "How old are you?",
  "brain.field.ageHint": "Used to compare you with your age group · {range} years",
  "brain.field.gender": "Gender",
  "brain.field.occupation": "What do you do?",
  "brain.field.relationship": "Relationship status",
  "brain.field.dailyTime": "How long are you on social apps each day?",
  "brain.field.dailyTimeHint": "Estimate an average week, not your best day.",
  "brain.field.platforms": "Which platforms do you use regularly?",
  "brain.field.platformsHint": "Pick all that apply — tap again to deselect.",

  "brain.gender.female": "Female",
  "brain.gender.male": "Male",
  "brain.occupation.student": "Student",
  "brain.occupation.worker": "Working",
  "brain.occupation.retired": "Retired",
  "brain.relationship.single": "Single",
  "brain.relationship.inRelationship": "In a relationship",
  "brain.relationship.married": "Married",
  "brain.relationship.divorced": "Divorced",

  "brain.time.0": "Under an hour",
  "brain.time.1": "1–2 hours",
  "brain.time.2": "2–3 hours",
  "brain.time.3": "3–4 hours",
  "brain.time.4": "4–5 hours",
  "brain.time.5": "More than 5 hours",

  "brain.item.aimless": "I open apps and scroll with no particular goal",
  "brain.item.distracted": "I switch to apps in the middle of work that matters",
  "brain.item.restless": "I feel uneasy when I'm away from my phone",
  "brain.item.comparison": "I compare my life to what others post",
  "brain.item.validation": "I care how many likes and replies my posts get",
  "brain.item.depression": "I've been feeling low or down",
  "brain.item.worries": "I've been anxious or worried",
  "brain.item.concentration": "I struggle to concentrate for long",
  "brain.item.interest": "I've lost interest in things I used to enjoy",
  "brain.item.sleepIssues": "I've been having trouble sleeping",
  "brain.item.distractibility": "I'm easily distracted",
  "brain.likertHint": "{range} — your answer: {value}",
  "brain.likert.1": "Not at all",
  "brain.likert.5": "Completely",

  "brain.note.1": "Nothing in your answers suggests a problem pattern. Keep doing what you're doing.",
  "brain.note.2": "Your usage looks healthy overall. One or two habits are worth watching before they build up.",
  "brain.note.3": "Some of your digital habits are starting to affect your focus and mood. One small change now saves a lot later.",
  "brain.note.4": "Your answers show clear signs of overuse affecting your day. Start with the first recommendation below this week.",
  "brain.note.5": "Your usage is very high and it's visibly affecting your focus and mood. Pick one recommendation and hold it for seven days.",

  "brain.contributors.raising": "What pushed your score up?",
  "brain.contributors.neutral": "The factors weighing most on your result",
  "brain.contributors.lead": "The strongest one relates to {region}.",
  "brain.contributors.raises": "raises the score",
  "brain.contributors.lowers": "lowers the score",
  "brain.contributors.neutralItem": "neutral",
  "brain.contributors.answer": "{value} of {max}",

  "brain.mh.title": "Separate signal: psychological impact",
  "brain.mh.explain":
    "This is a second, independent model reading your mood and anxiety answers. It can disagree with the result above — that's expected, they measure different things.",
  "brain.mh.note.1": "The psychological signal found no effect tied to your usage pattern.",
  "brain.mh.note.2": "The psychological signal is in the healthy range.",
  "brain.mh.note.3": "The psychological signal is moderate. Keep an eye on your mood over the coming weeks.",
  "brain.mh.note.4": "The psychological signal points to a possible effect worth attention.",
  "brain.mh.note.5": "The psychological signal is high. If the feeling lasts more than two weeks, talking to a professional is a reasonable step.",

  "brain.tech.brainProb": "Brain-rot model probability: {value}",
  "brain.tech.mhProb": "Psychological-impact model probability: {value}",
  "brain.tech.threshold": "Decision threshold for both models: {value}",
  "brain.tech.note": "The probability is the model's raw output; the level above is derived from it after rounding to display precision.",
  "brain.a11y.illustration": "Brain illustration coloured for level {level} — {name}",

  // --- Sleep check --------------------------------------------------------- //
  "sleep.pageTitle": "Sleep check",
  "sleep.pageIntro":
    "Answer for a single day and we'll estimate your expected sleep quality, then work out the schedule that gives you the best result.",
  "sleep.resultTitle": "Your ideal bedtime",

  "sleep.step.about": "About you",
  "sleep.step.day": "Your day",
  "sleep.step.beforeBed": "Before bed",
  "sleep.step.wearable": "From your smartwatch (optional)",

  "sleep.field.age": "How old are you?",
  "sleep.field.gender": "Gender",
  "sleep.field.height": "Height (cm)",
  "sleep.field.weight": "Weight (kg)",
  "sleep.field.bmi": "Body mass index (calculated)",
  "sleep.field.bmiHint": "Weight ÷ height squared — the model uses it as a supporting factor.",
  "sleep.field.chronotype": "When are you at your best?",
  "sleep.field.occupation": "Occupation",
  "sleep.field.country": "Country",
  "sleep.field.mentalHealth": "How would you describe your mental health generally?",
  "sleep.field.stress": "How stressed were you today?",
  "sleep.field.workHours": "How many hours did you work today?",
  "sleep.field.steps": "How many steps did you walk today?",
  "sleep.field.nap": "How many minutes did you nap?",
  "sleep.field.exercise": "Did you exercise today?",
  "sleep.field.shiftWork": "Do you work shifts?",
  "sleep.field.dayType": "Was today a workday or a day off?",
  "sleep.field.season": "Which season is it?",
  "sleep.field.caffeine": "How much caffeine before bed? (mg)",
  "sleep.field.caffeineHint": "A coffee ≈ 95 mg · a tea ≈ 40 mg · range {range}",
  "sleep.field.alcohol": "Alcohol units before bed",
  "sleep.field.screenBeforeBed": "How many minutes on a screen right before bed?",
  "sleep.field.roomTemp": "Room temperature (°C)",
  "sleep.field.roomTempHint": "The optimal range for deep sleep is {range} °C",
  "sleep.field.bedtime": "When did you fall asleep?",
  "sleep.field.wakeUp": "When did you wake up?",
  "sleep.field.weekendDiff": "How many extra hours do you sleep at the weekend?",
  "sleep.field.weekendDiffHint": "A large weekday/weekend gap confuses your body clock.",
  "sleep.field.sleepAid": "Did you use a sleep aid?",
  "sleep.field.duration": "Your calculated sleep duration: {hours} hours",

  "sleep.gender.female": "Female",
  "sleep.gender.male": "Male",
  "sleep.gender.other": "Other",
  "sleep.chronotype.morning": "Morning — sharpest early",
  "sleep.chronotype.evening": "Evening — sharpest late",
  "sleep.chronotype.neutral": "Neither — no strong preference",
  "sleep.mh.healthy": "Good",
  "sleep.mh.anxiety": "Anxiety",
  "sleep.mh.depression": "Depression",
  "sleep.mh.both": "Anxiety and depression",
  "sleep.dayType.weekday": "Workday",
  "sleep.dayType.weekend": "Day off",
  "sleep.season.spring": "Spring",
  "sleep.season.summer": "Summer",
  "sleep.season.autumn": "Autumn",
  "sleep.season.winter": "Winter",

  "sleep.wearable.legend": "Smartwatch measurements",
  "sleep.wearable.intro":
    "Leave these blank if you don't have them — we'll substitute the median from the training data.",
  "sleep.field.rem": "REM sleep (%)",
  "sleep.field.remHint": "REM is the dreaming stage · {range}",
  "sleep.field.deep": "Deep sleep (%)",
  "sleep.field.latency": "How long did it take you to fall asleep? (minutes)",
  "sleep.field.wakeEpisodes": "How many times did you wake in the night?",
  "sleep.field.heartRate": "Resting heart rate",
  "sleep.field.heartRateHint": "Beats per minute · {range}",

  "sleep.result.schedule": "Sleep {hours} hours, from {bedtime} to {wakeUp}.",
  "sleep.result.compareTitle": "Sleep quality: where you are now vs. the suggested schedule",
  "sleep.result.compareIntro":
    "Both figures come from the same model on two different schedules — read them as a before/after, not as two separate results.",
  "sleep.result.current": "Where you are now",
  "sleep.result.recommended": "On the suggested schedule",
  "sleep.result.currentDetail": "You sleep {hours} hours starting at {bedtime}",
  "sleep.gain.one": "One level better than your current schedule.",
  "sleep.gain.two": "Two levels better than your current schedule.",
  "sleep.gain.many": "{count} levels better than your current schedule.",
  "sleep.gain.worse": "Your current schedule is better — stick with it.",
  "sleep.gain.within": "Same level, but a real improvement within it.",
  "sleep.gain.none": "No meaningful difference from your current schedule.",

  "sleep.disorder.title": "Sleep-disorder signal",
  "sleep.rested.title": "Waking up rested",
  "sleep.rested.note": "The chance you wake up rested on your current schedule.",
  "sleep.curve.title": "How your sleep quality changes with duration",
  "sleep.curve.intro":
    "Each point is a different sleep duration under the same daily conditions. Higher is better, and the marked point is your best.",
  "sleep.curve.xAxis": "Sleep duration (hours)",
  "sleep.curve.tooltipLevel": "Level",
  "sleep.curve.tooltipHours": "{hours} hours",
  "sleep.tech.current": "Sleep quality on your current schedule: {value} of {max}",
  "sleep.tech.recommended": "Predicted quality at the suggested bedtime: {value} of {max}",
  "sleep.tech.delta": "Difference: {value} points",
  "sleep.a11y.illustration": "Illustration of a night from {bedtime} to {wakeUp} lasting {hours} hours, coloured for level {level} — {name}",

  // --- Dashboard ----------------------------------------------------------- //
  "dash.pageTitle": "Daily tracker",
  "dash.intro":
    "Log a day in under a minute and watch where your balance is heading. Your data is stored in this browser only and never sent to a server — take a backup before you clear browser data, or it's gone.",
  "dash.backup": "Save a backup",
  "dash.restore": "Restore data",
  "dash.horizon": "Last {days}",
  "dash.summaryTitle": "Today at a glance",
  "dash.balanceTitle": "Your balance today",
  "dash.balanceNote": "The average of your brain-rot and sleep sides for {date}.",
  "dash.sidesTitle": "The two sides",
  "dash.sidesNote": "These colours match the two lines in the chart below.",
  "dash.series.brain": "Brain rot",
  "dash.series.sleep": "Sleep",
  "dash.trendTitle": "How each side is moving",
  "dash.trendIntro": "Higher is better. Each point is a day you logged.",
  "dash.forecastTitle": "Balance — logged and projected",
  "dash.forecastIntro":
    "The solid line is what you actually logged; the dashed green line extends its trend. The horizontal yellow line marks the middle level.",
  "dash.legend.actual": "Logged",
  "dash.legend.projected": "Projected",
  "dash.forecastCaveat": "This extrapolates your current trend — it isn't a prediction, and it moves with every day you log.",
  "dash.forecastVerdict": "Projected level in {days}:",
  "dash.verdict.improving": "Improving",
  "dash.verdict.steady": "Steady",
  "dash.verdict.declining": "Declining",
  "dash.empty.trendTitle": "Log a few more days to see your trend",
  "dash.empty.trendBody": "We need at least {days} before drawing any trend — two points aren't a direction.",
  "dash.empty.forecastTitle": "Log more days to unlock projections",
  "dash.empty.forecastBody": "A projection needs at least {days} to mean anything.",

  "dash.logTitle": "Log a day",
  "dash.group.sleep": "Your sleep",
  "dash.group.screen": "Your screens",
  "dash.group.day": "Your day",
  "dash.field.date": "Which day are you logging?",
  "dash.field.sleepHours": "How many hours did you sleep last night?",
  "dash.field.sleepHoursHint": "To the nearest half hour is fine",
  "dash.field.feltRested": "Did you wake up rested?",
  "dash.field.screenHours": "How many hours were you on screens?",
  "dash.field.screenHoursHint": "Total screen time today",
  "dash.field.socialHours": "Of that, how many hours on social apps?",
  "dash.field.socialHoursHint": "A subset of the screen time above",
  "dash.field.compulsive": "How often did you pick up your phone without deciding to?",
  "dash.field.stress": "How stressed were you today?",
  "dash.field.caffeine": "How much caffeine did you have? (mg)",
  "dash.field.caffeineHint": "A coffee ≈ 95 mg",
  "dash.field.exercise": "Did you exercise?",
  "dash.save": "Save this day",
  "dash.rangeHint": "{range} — your answer: {value}",
  "dash.outOfRange": "Outside the accepted range {range}",
  "dash.fieldHint": "{hint} · {range}",

  // --- About ---------------------------------------------------------------- //
  "about.pageTitle": "About Etzan",
  "about.intro":
    "Etzan is a data-science project that turns six machine-learning models into three tools that run inside your browser. This page explains what each one measures, what data it learned from, and where its limits are.",

  "about.whatTitle": "What is “brain rot”?",
  "about.whatBody":
    "“Brain rot” — Oxford's word of the year for 2024 — describes the dulled, scattered feeling that follows hours of fast, aimless scrolling. It is not a medical diagnosis and there is no clinical test for it. What Etzan measures is the usage pattern and the symptoms people report, not a state of the brain.",

  "about.dataTitle": "The data",
  "about.dataQuestionnaire":
    "A digital-habits questionnaire: age, occupation and platforms used, plus 1-to-5 items on compulsive use, mood and concentration.",
  "about.dataSleep":
    "A sleep-health dataset of roughly 100,000 nights: bedtimes and wake times, caffeine, alcohol and screen time before bed, room temperature, stress and step counts, plus wearable measures such as REM and deep-sleep percentage.",
  "about.dataNote":
    "Both datasets are cross-sectional and largely self-reported. They reveal correlations, not causes: a high score does not mean screens caused the state.",

  "about.modelsTitle": "The models running in your browser",
  "about.modelsIntro":
    "Each model is exported to ONNX and executed by onnxruntime-web. These figures are measured on a held-out test set (20% of the data):",
  "about.model.brainRot": "Brain rot",
  "about.model.mentalHealth": "Psychological impact",
  "about.model.sleepQuality": "Sleep quality",
  "about.model.disorder": "Sleep disorder",
  "about.model.feltRested": "Waking rested",
  "about.model.bedtime": "Suggested bedtime",
  "about.table.model": "Model",
  "about.table.algo": "Algorithm",
  "about.table.metric": "Performance",
  "about.metric.auc": "AUC {value}",
  "about.metric.acc": "accuracy {value}",
  "about.metric.r2": "R² {value}",
  "about.modelsCaveat":
    "The sleep-disorder model reached 0.95 accuracy with HistGradientBoosting, but that algorithm does not convert to ONNX, so a Random Forest at 0.865 ships instead. That is a deliberate trade: lower accuracy in exchange for running entirely in the browser with no server.",

  "about.levelsTitle": "How to read the five levels",
  "about.levelsIntro":
    "Every result in Etzan uses the same scale: five levels, where higher means more concern. Internal measures (probabilities, scores out of ten) are converted to this scale before display, so you never have to reconcile three systems in your head.",
  "about.levels.1": "Nothing that calls for attention.",
  "about.levels.2": "Healthy range, with room to improve.",
  "about.levels.3": "Moderate signs worth one specific change.",
  "about.levels.4": "Clear signs — start with one recommendation this week.",
  "about.levels.5": "High signs that call for a serious change.",

  "about.privacyTitle": "Privacy",
  "about.privacyBody":
    "There is no server, no database and no account. The models run inside your browser, and tracker entries are saved to localStorage on your device alone. We collect no analytics and set no cookies. Clearing your browser data deletes your entries permanently — use “Save a backup” first.",

  "about.disclaimerTitle": "Important",
  "about.disclaimerBody":
    "Etzan is an educational tool and a project. It is not a medical device and not a substitute for professional advice. Do not use its results to diagnose a condition or to stop a treatment. If you have persistent sleep problems or psychological distress, speak to a doctor or a mental-health professional.",

  "about.teamTitle": "The team",
  "about.teamBody": "A data-science project from Tuwaiq Academy.",

  // --- Recommendations ------------------------------------------------------ //
  "rec.screenBudget.title": "Put a budget on screen time",
  "rec.screenBudget.body":
    "Pick a daily cap for social apps and set the app timer in your phone's settings. A limit the system enforces beats one you decide in the moment.",
  "rec.mindful.title": "Ask before you open",
  "rec.mindful.body":
    "Before opening any app, ask: why am I opening this right now? That one question cuts most automatic scrolling.",
  "rec.detach.title": "Build in phone-free stretches",
  "rec.detach.body":
    "Start with thirty minutes a day, phone in another room. The goal is getting comfortable with brief boredom — that's what drives the scrolling.",
  "rec.feedHygiene.title": "Clean up your feed",
  "rec.feedHygiene.body":
    "Unfollow the accounts that make you measure yourself against them. You control not just how long you scroll, but what gets shown to you while you do.",
  "rec.focusBlocks.title": "Work in closed blocks",
  "rec.focusBlocks.body":
    "Twenty-five minutes on, five off, with the phone out of sight rather than in your pocket. A visible phone costs attention even switched off.",
  "rec.sleepBridge.title": "Your screen may be behind the insomnia",
  "rec.sleepBridge.body":
    "You reported trouble sleeping, which often tracks with late-night use. Try the sleep check to estimate the effect.",
  "rec.mentalHealth.title": "Pay attention to how you're feeling",
  "rec.mentalHealth.body":
    "The psychological signal flagged a possible effect. Talk to someone you trust, and if the feeling lasts more than two weeks, see a professional.",
  "rec.maintain.title": "Keep doing what you're doing",
  "rec.maintain.body":
    "The check found nothing that calls for concern. Log your days in the tracker so you catch any drift early.",
  "rec.watch.title": "Your result is in the healthy range",
  "rec.watch.body":
    "The check found nothing concerning, but the habits above are worth watching before they build up.",

  "rec.caffeine.title": "Stop caffeine earlier",
  "rec.caffeine.body":
    "Caffeine has a half-life of about six hours, so half of that afternoon coffee is still in you at bedtime. Make your last cup six hours before bed.",
  "rec.screenBeforeBed.title": "Screens off an hour before bed",
  "rec.screenBeforeBed.body":
    "Blue light delays melatonin, and engaging content keeps your mind switched on. Night mode helps but doesn't replace switching off.",
  "rec.roomTemp.title": "Cool the room down",
  "rec.roomTemp.body":
    "Your body needs to drop its core temperature to reach deep sleep. Aim for 18–21 °C.",
  "rec.stress.title": "Empty your head before bed",
  "rec.stress.body":
    "Write tomorrow's tasks on paper an hour before bed, or try five minutes of slow breathing. Unfinished thoughts are usually what delays sleep.",
  "rec.regularity.title": "Keep your times consistent",
  "rec.regularity.body":
    "A big gap between weekday and weekend sleep is like changing time zone every week. Close it, even by an hour.",
  "rec.duration.title": "Give yourself enough time",
  "rec.duration.body":
    "Your current duration is under seven hours. Follow the suggested schedule above rather than trying to catch up at the weekend.",
  "rec.sleepMaintain.title": "Your night-time habits look good",
  "rec.sleepMaintain.body":
    "The check found nothing worth changing. Keep the consistency going in the tracker.",

  // --- Contributor labels ---------------------------------------------------- //
  "contrib.aimless_use": "Scrolling with no goal",
  "contrib.distracted_when_busy": "Switching away from important work",
  "contrib.distractibility": "Being easily distracted",
  "contrib.concentration_difficulty": "Difficulty concentrating",
  "contrib.restless_without": "Unease away from your phone",
  "contrib.worries": "Anxiety and worry",
  "contrib.depression": "Feeling low",
  "contrib.interest_fluctuation": "Fading interest in activities",
  "contrib.comparison": "Comparing yourself to others",
  "contrib.seeks_validation": "Seeking validation through engagement",
  "contrib.sleep_issues": "Trouble sleeping",
  "contrib.daily_time": "Daily hours on social apps",

  // --- Day counts (plural forms are selected in format.ts) ------------------- //
  "days.zero": "0 days",
  "days.one": "1 day",
  "days.two": "2 days",
  "days.few": "{count} days",
  "days.many": "{count} days",
  "days.other": "{count} days",
  "daysLogged.zero": "No days logged",
  "daysLogged.one": "1 day logged",
  "daysLogged.two": "2 days logged",
  "daysLogged.few": "{count} days logged",
  "daysLogged.many": "{count} days logged",
  "daysLogged.other": "{count} days logged",

  // --- Errors ---------------------------------------------------------------- //
  "error.invalidBackup": "That file isn't valid — choose a backup file exported from Etzan.",

  // --- Page metadata --------------------------------------------------------- //
  "meta.home.title": "Etzan — Your digital balance",
  "meta.home.description":
    "Check how screens affect your focus and sleep quality with machine-learning models that run entirely in your browser — no data sent anywhere.",
  "meta.brain.title": "Brain-rot check — Etzan",
  "meta.brain.description":
    "A four-step check measuring your relationship with social apps and its effect on your focus and mood, with practical recommendations.",
  "meta.sleep.title": "Sleep quality check and ideal bedtime — Etzan",
  "meta.sleep.description":
    "Estimate your expected sleep quality and calculate the bedtime that gives you the best result, from a single day of habits.",
  "meta.dashboard.title": "Digital balance tracker — Etzan",
  "meta.dashboard.description":
    "Log your sleep and screen time daily and follow your balance over time. Your data stays in your browser.",
  "meta.about.title": "About Etzan — methodology, data and privacy",
  "meta.about.description":
    "What Etzan measures, what data its models learned from, how accurate they are, and where their limits lie.",
};
