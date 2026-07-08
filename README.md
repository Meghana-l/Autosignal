# AutoSignal

**Detects emerging vehicle defects early by analyzing live safety complaint data with AI.**

🔗 **Live app:** [https://autosignal-virid.vercel.app/](https://autosignal-virid.vercel.app/)

---

AutoSignal turns the continuous stream of consumer safety complaints filed with NHTSA (the U.S. vehicle safety regulator) into an early-warning signal for vehicle manufacturers. Pick any brand and model, and it pulls real complaints live from the official NHTSA public API, triages them by component, tracks the trend over time, flags components that are spiking, and drafts an AI early-warning brief a safety engineer can act on — with every signal traceable back to its source complaint record.

![AutoSignal dashboard](screenshots/dashboard.png)

## How it works

**Live complaint feed.** Selecting a vehicle pulls real consumer complaints directly from the NHTSA public complaints API across the chosen model years — no cached or sample data. Records are deduplicated by their ODI number (NHTSA's stable complaint identifier), and the timestamp of every pull is displayed so the data is verifiably current.

**Severity KPIs.** The headline cards summarize the risk picture at a glance: total complaints, high-severity complaints, and the counts of crashes, fires, and injuries reported. A complaint is flagged high severity when it involves a crash, a fire, an injury, or a fatality — the signals that matter most for triage.

**Complaints by component.** Every complaint arrives as free-form text with a raw component string. AutoSignal maps each one into a canonical component taxonomy — Engine, Power Train, Fuel System, Brakes, Forward Collision / ADAS, Air Bags / Restraints, Steering, Electrical, and more — so the noise becomes a ranked view of where problems actually concentrate.

**Complaint trend.** A monthly time series of filings shows momentum: whether complaint volume is steady, cooling off, or building toward something. This is the early-warning time series the spike detection runs on.

**Emerging concerns.** The core signal. For each component, AutoSignal compares the last 90 days of complaint volume against that component's own recent baseline. A component whose recent volume spikes well above its baseline gets flagged **▲ EMERGING** — the pattern that historically precedes investigations and recalls. Stable components are labeled as such, so an engineer's attention goes only where the data says it should.

![Emerging concerns and AI brief](screenshots/brief.png)

**AI early-warning brief.** On demand, the app assembles the strongest evidence from the pulled complaints — prioritizing high-severity records — and generates a grounded, plain-language brief: the top emerging component concern, the common failure theme across narratives, the severity picture, and a recommended triage priority. Every brief cites the ODI numbers it relied on, and the model is instructed never to claim a confirmed defect or recall — it recommends, a human decides. Generation runs through a server-side proxy so no keys are ever exposed to the browser.

**Recent complaints table.** The raw evidence, newest first: ODI number, triaged component, severity flag, filing date, and the consumer's narrative. This is the audit trail — every chart, flag, and AI claim above it can be traced back to a row here.

## Data & AI

| Layer | Source | Type |
|---|---|---|
| Consumer complaints | NHTSA public complaints API | Live, keyless government data |
| Component triage | Canonical taxonomy mapping | Server-side |
| Emerging detection | 90-day spike vs. rolling baseline | In-app analytics |
| Early-warning brief | Groq · llama-3.1-8b-instant | Server-side AI proxy |

## Design principles

- **Real data only** — every number on screen comes from a live government API at the moment you click.
- **Traceability** — signals cite ODI numbers; nothing is a black box.
- **Human in the loop** — the system surfaces and prioritizes; it never declares a defect or recall. A safety engineer always makes the call.
- **Privacy** — briefs are generated from de-identified component, severity, and trend signals; no personal information is sent to or produced by the model.
