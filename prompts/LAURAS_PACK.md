# Laura's Presenter Pack: Project Trueplan, MPA Challenge 5

**For:** Laura White
**From:** Laura White
**Purpose:** Everything you need to deliver a confident three-minute pitch plus Q&A.

---

## 1. What you're presenting

**Project Trueplan.** A forecast-driven early warning system that turns a static assumption register into a live, evidence-backed view of what's likely to go wrong and when.

**The one-line hook:** Every drift dashboard tells you what's already broken. We built one that tells you what's about to break, and when.

**The metric you're selling:** *lead time*, the number of days of advance warning the system gives before an assumption breaches tolerance. Nobody else in the room will be showing lead time. They'll be showing drift.

---

## 2. The demo at a glance

Three minutes. Three views. One moment.

1. **Horizon (30 seconds)**: portfolio overview. "47 assumptions, ranked by lead time."
2. **Trace for A039 Inflation (90 seconds)**: the hero. Real ONS data, forecast cone, live timestamp. **This is the moment.**
3. **Cascade for A039 (45 seconds)**: when it breaches, twelve downstream assumptions wobble.

Ant operates the screen. You deliver the lines.

---

## 3. The script

Practise this out loud until the pacing is natural. Don't memorise word-for-word; own the ideas.

### Opening (20 seconds)

> "A hundred percent.
>
> That's the percentage of assumptions in this £200-million-programme that are overdue for review today. Three of them are more than ten months overdue. Here's what's happened in the world since they were logged."

Pause. Let that land. Most judges have seen a "drift dashboard" before. They haven't seen someone open with a clean number.

### Hook (15 seconds)

> "Every drift dashboard tells you what's already broken. We built one that tells you what's about to break, and when. We call it Project Trueplan, and its headline metric is *lead time*: the days of warning you get before each assumption fails."

### Horizon view (30 seconds)

(Ant opens `/horizon`.)

> "This is the programme's full assumption register, 47 entries, plotted by lead time. Each bar is an assumption. The red bars are breaching now or within thirty days. Amber is ninety days. Green is beyond a year.
>
> You can see at a glance: most of this programme is green, but there are three reds and five ambers. The one I want to show you is right here."

(Ant clicks A039 Inflation.)

### Trace view: the hero (90 seconds)

(The Trace view loads. The forecast cone draws in over the next second.)

> "A039 Inflation. Baseline: CPI at two-point-five percent, logged in June 2025. This is the actual ONS series since then."

(Pause. Let the data speak.)

> "You can see the line crossed the tolerance band in October last year. Our forecast ensemble, three independent methods, projects that it will keep climbing through the spring. The cone shows our confidence interval. Projected breach date: already past. Lead time: minus one-hundred-eighty days.
>
> Every one of these points is live, pulled from ONS this morning."

(Point at the retrieved-timestamp at the bottom right.)

> "*Retrieved fourteen seconds ago.* Not cached from last week. Not mocked. Live data with every source URL clickable."

(Pause. Let the audience take that in.)

> "The baseline is nine months old. The actual number crossed tolerance in October. Nobody's been told."

This is the line the rehearsal is about. Say it slowly. Don't rush off it.

### Cascade view (45 seconds)

(Ant clicks through to the Cascade view filtered to A039.)

> "One drifting assumption on its own isn't the story. Cascading impact is the story. When A039 breaches, twelve other assumptions are affected, because they're linked in the programme's dependency graph.
>
> Each flow here shows the proportion of A039's drift that propagates to a downstream assumption. The widest flow is A015 Commercial, which means the commercial position has been quietly drifting for nine months too, because its baseline was anchored to A039.
>
> What looks like one breach becomes a system problem. That's what an SRO actually needs to see."

### Close (20 seconds)

> "This is what an assumption register could be. Live, forecasted, traceable, connected.
>
> The paper is on Zenodo. The code is open-source. Everything you've just seen runs against the register you gave us, with live ONS and Bank of England data, on a live Netlify URL right now. Thank you."

(Pause. Don't fill silence. Let them ask.)

---

## 4. Timings

Practised target: **3 minutes exactly**.

- Opening: 0:00 to 0:20
- Hook: 0:20 to 0:35
- Horizon: 0:35 to 1:05
- Trace (the moment): 1:05 to 2:35
- Cascade: 2:35 to 2:50
- Close: 2:50 to 3:00

**If you're over time at Horizon**: cut directly to A039; skip the tour of the full portfolio.

**If you're over time at Trace**: skip Cascade entirely. Close on "nobody's been told" and take questions.

**If you're under time**: slow down at the Trace moment. The forecast cone is more impressive when you let the audience absorb it.

---

## 5. Choreography with Ant

Ant is at the laptop. You are at the front, presenting. Agree on these signals:

- **"And the one I want to show you is right here"** → Ant clicks A039. Plan A: the link is in the Horizon table; second row. Plan B: Ant already has A039's Trace view pre-loaded in tab 2.
- **"Every one of these points is live, pulled from ONS this morning"** → Ant hovers a data point on the chart; tooltip shows the source URL.
- **"Nobody's been told"** → Ant holds on the Trace view for two beats before any interaction.
- **"Cascading impact is the story"** → Ant navigates to Cascade for A039.

Practise hand-offs. If the screen lags, keep talking; don't wait.

---

## 6. Q&A prep

Judges ask roughly the same questions. Have a crisp answer ready.

### "Why not just use Excel?"

> "Excel doesn't forecast, doesn't cascade, doesn't ingest live external signals, and can't audit where its numbers came from. We built Project Trueplan because the limitation of assumption registers today is that they're passive documents. This is an active instrument. Excel can't be what this is."

### "How did you build all this in the hack period?"

> "We built the solution layer: the forecasting, the cascades, the dashboard, the live data integration with ONS and the Bank of England. The foundation we built on, called PDA Platform, is an open-source project Ant has been running for eighteen months; it's public on GitHub. Happy to walk anyone through the commit history. What's new here is everything you've seen on screen."

### "How accurate are the forecasts?"

> "The forecast is an ensemble of three methods: linear trend, exponentially-weighted moving average, and a first-order autoregressive model. The agreement between them is itself a confidence signal. When the three methods agree, the cone is narrow and we trust the lead-time estimate. When they disagree, the cone widens and we flag the assumption as being in an unpredictable regime. That second behaviour, disagreement-as-signal, is the core methodological contribution of our companion paper."

### "How do we know this isn't made up?"

> "Every number you see traces back to a source. The Trace view has a disclosure section that shows every measurement, every timestamp, every URL. Pick any data point, click it, and you'll land on the ONS page it came from. We also pin every fetch in a permanent audit log."

### "How does this scale to a portfolio of programmes?"

> "The architecture is multi-tenant. Every assumption, measurement, and cascade is keyed by project; row-level security is in place. We've demonstrated with a single programme because we wanted to go deep. Adding projects is a configuration change, not a rebuild. Happy to show the schema if you're interested."

### "What about real-time data?"

> "The external signals refresh nightly at three AM. For our three economic assumptions, that's appropriate; ONS publishes monthly, the Bank of England daily. For faster-moving signals, the architecture supports hourly or per-minute refresh; it's a schedule configuration."

### "Who would actually use this?"

> "Three audiences. Portfolio managers, who want visibility of drift across programmes and need to prioritise interventions. Assurance leads, who need evidence that assumptions are tracked against current evidence. And SROs, who want a board-ready brief grounded in data, not reheated from last quarter's update. The Brief view is what lands on an SRO's desk."

### "What's the business model?"

> "Open source at the core, consulting-led adoption initially. the author expects to earn from helping major-programme teams deploy the methodology and from training. The methodology itself stays open, under Creative Commons for the paper and MIT for the code, because the honest use cases in UK government require the methodology to be inspectable."

### "Does this replace assurance reviewers?"

> "No. It gives them a better starting position. An assurance reviewer still asks the hard questions and exercises judgement. Project Trueplan makes sure they walk into the review knowing what's drifted and what's connected. It shifts reviewer time from data-gathering to analysis."

### "What happens when an external source revises data?"

> "We keep every fetch in an append-only audit table. If the ONS revises CPI for a previous month, the new value lands as a new row and our forecast recomputes. The original value is preserved; the revision is visible in the history. This matters for reproducibility."

### "Could this be weaponised by a Treasury to cut programmes it doesn't like?"

(This one will come if there's a politically literate judge in the room.)

> "That's a fair concern. The tool reports what the data says; it doesn't make funding recommendations. An assumption breaching tolerance is an invitation to investigate, not to cancel. We've deliberately kept the narrative in the Brief view proportionate. And because everything is auditable, if someone misreads a drift signal as grounds to cut a programme, the evidence is there to contest the interpretation."

### "Have you shown this to anyone in government yet?"

> "Not formally. The MPA Challenge is our first public outing. We'd welcome feedback and would happily run a deeper walkthrough with any department that's interested."

### "What would you do with more time?"

> "Three things. One, extend to multi-programme portfolios, which the architecture supports but we haven't demoed. Two, add reviewer feedback into the confidence model; right now source tier and review age are inputs, but reviewer-skill and reviewer-dissent aren't. Three, extend the cascade to include feedback loops; the current model is a DAG, which is mathematically clean but reality has feedbacks."

---

## 7. Questions you might want to deflect to Ant

For the deepest technical questions, it's completely fine to say:

> "Good question, Ant can take you through the maths on that one."

Specifically for:

- Exact parameter choices in the forecasting models
- Edge cases in the cascade propagation
- How the confidence score's weights were derived
- Questions about specific Supabase queries or edge function code

You don't need to know the internals to present the product well. The product and the argument are what you're pitching.

---

## 8. If something goes wrong

### The internet drops mid-demo

The Netlify app caches aggressively; it'll keep working for a few minutes even offline. If it dies completely, open the Loom recording on your phone or a backup tab and say:

> "Let me show you the recording; we had this working live two minutes ago, the venue Wi-Fi dropped."

### The live timestamp isn't fresh

If "Retrieved two hours ago" shows instead of "Retrieved fourteen seconds ago": Ant hits Recompute in the nav. Data refreshes in 15-30 seconds. Fill the time with the hook paragraph.

### The forecast cone looks weird

If the cone renders in an unexpected way (e.g. degenerate from insufficient data), skip the "projected breach date" line and lean on "you can see the line crossed the tolerance band in October." The point lands on the historical movement, not the forecast.

### A judge asks a question you weren't expecting

Buy time: "That's a good question; let me think." Then pick the closest answer from section 6. You won't be penalised for pausing.

### The demo runs long

Cut Cascade. Go straight from "nobody's been told" to the close.

### You feel nervous

You've done genuine work here. You understand the product. The demo is three minutes; whatever happens, it's three minutes. Then you get to sit down.

---

## 9. One line I want you to remember

> "The baseline is nine months old. The actual number crossed tolerance in October. Nobody's been told."

That sentence, delivered with a pause before it and two beats after, is the moment we've built the whole product around. Don't hurry through it. Don't embellish it. Say it, stop, and let the room feel it.

Everything else is scaffolding for that line.

---

## 10. Practical checklist

The night before:

- [ ] Loom recording watched once; confirm it still works
- [ ] Script read aloud once; time yourself
- [ ] Clothes chosen (something you're comfortable in; not a suit)
- [ ] Phone charged with the Loom link and the Netlify URL bookmarked
- [ ] Water bottle ready
- [ ] Sleep

The morning of:

- [ ] Arrive 45 minutes early; test the AV setup
- [ ] Do the pitch once more, with Ant, in a quiet corner
- [ ] Know who the judges are; read their names if they're published
- [ ] Eat something. You might not get lunch.

Just before you go on:

- [ ] Laptop plugged in, screen mirrored, incognito window open with three tabs
- [ ] Ant has the Recompute button ready
- [ ] Breathe

---

*You've got this. Ant has built you a product that does what it says. Your job is to tell them the story of it. Three minutes. One moment. Go.*
