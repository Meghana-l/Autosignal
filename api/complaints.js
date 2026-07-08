// Live NHTSA complaints proxy.
// Pulls REAL consumer safety complaints straight from the official, keyless
// NHTSA public API for any vehicle, across recent model years, and
// normalizes them into a canonical component + severity shape for the frontend.
// No API key required — this is open U.S. DOT data.

const COMPONENT_MAP = [
  ["FORWARD COLLISION", "Forward Collision / ADAS"],
  ["LANE DEPARTURE", "Forward Collision / ADAS"],
  ["AIR BAG", "Air Bags / Restraints"],
  ["SEAT BELT", "Air Bags / Restraints"],
  ["RESTRAINT", "Air Bags / Restraints"],
  ["BRAKE", "Brakes"],
  ["FUEL", "Fuel System"],
  ["POWER TRAIN", "Power Train"],
  ["PROPULSION", "Power Train"],
  ["ENGINE", "Engine"],
  ["STEERING", "Steering"],
  ["ELECTRICAL", "Electrical"],
  ["STRUCTURE", "Structure / Body"],
  ["VISIBILITY", "Visibility / Wipers"],
  ["TIRE", "Tires / Wheels"],
];

function canonicalComponent(raw) {
  const up = (raw || "").toUpperCase();
  for (const [key, label] of COMPONENT_MAP) if (up.includes(key)) return label;
  return "Other";
}

async function fetchYear(make, model, year) {
  const url =
    `https://api.nhtsa.gov/complaints/complaintsByVehicle` +
    `?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const data = await r.json();
  return data.results || [];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const make = (req.query.make || "jeep").toString();
  const model = (req.query.model || "grand cherokee").toString();
  const years = (req.query.years || "2021,2022,2023")
    .toString()
    .split(",")
    .map((y) => parseInt(y.trim(), 10))
    .filter(Boolean)
    .slice(0, 5);

  try {
    const batches = await Promise.all(years.map((y) => fetchYear(make, model, y)));
    const seen = new Map();
    for (const batch of batches) {
      for (const rec of batch) {
        if (!seen.has(rec.odiNumber)) seen.set(rec.odiNumber, rec);
      }
    }

    const complaints = [...seen.values()].map((c) => {
      const injuries = c.numberOfInjuries || 0;
      const deaths = c.numberOfDeaths || 0;
      const highSeverity = !!(c.crash || c.fire || injuries > 0 || deaths > 0);
      return {
        odi: c.odiNumber,
        component: canonicalComponent(c.components),
        rawComponent: c.components || "",
        crash: !!c.crash,
        fire: !!c.fire,
        injuries,
        deaths,
        highSeverity,
        filed: c.dateComplaintFiled || null,
        incident: c.dateOfIncident || null,
        summary: (c.summary || "").slice(0, 600),
      };
    });

    // Sort newest first by filed date.
    complaints.sort((a, b) => new Date(b.filed) - new Date(a.filed));

    res.status(200).json({
      make,
      model,
      years,
      count: complaints.length,
      pulledAt: new Date().toISOString(),
      complaints,
    });
  } catch (err) {
    res.status(500).json({ error: "NHTSA fetch failed", detail: err.message });
  }
}
