# AutoSignal — Vehicle Defect Early-Warning

AutoSignal turns live consumer safety complaints into an early-warning signal for
emerging vehicle defects. Pick any vehicle and it pulls real complaints straight
from the NHTSA public API, auto-triages them by component, tracks the trend, and
drafts a grounded AI early-warning brief for a safety engineer.

## What it does

- **Live complaint intelligence** — real, keyless consumer complaints pulled on
  demand from the official NHTSA public API across recent model years, deduplicated
  by ODI number.
- **Component triage** — every complaint is classified into a canonical component
  taxonomy (Engine, Brakes, Forward Collision / ADAS, Air Bags / Restraints, Fuel
  System, Steering, Electrical, and more).
- **Severity picture** — high-severity flagging from crash, fire, injury, and death
  signals, surfaced as headline KPIs.
- **Emerging-concern detection** — components whose last-90-day volume spikes above
  their own recent baseline are flagged as emerging, the core early-warning signal.
- **Complaint trend** — monthly filing time series that shows momentum building.
- **AI early-warning brief** — an on-demand, plain-language brief grounded in the
  pulled complaints: the top emerging concern, the common failure theme, the
  severity picture, and a recommended triage priority, with ODI citations.
- **Full traceability** — every signal ties back to the source ODI complaint
  numbers a safety engineer can audit.

## Data & AI

| Layer | Source | Type |
|---|---|---|
| Consumer complaints | NHTSA public complaints API | Live API (keyless) |
| Component triage | Canonical taxonomy mapping | Server-side |
| Emerging detection | 90-day spike vs. baseline | In-app analytics |
| Early-warning brief | Groq · llama-3.1-8b-instant | Live API (server-side proxy) |

Signals are decision support for safety engineers — not a confirmation of any
defect or recall. A human always decides.
