import React, { useMemo, useState } from "react";
import samplePlanet from "../../data/samplePlanet";

const TABS = [
  {
    id: "transit",
    label: "\ud83d\udd2d Transit & Orbital Properties",
    fields: [
      { key: "koi_period", label: "Orbital Period [days]", precision: 3 },
      { key: "koi_time0bk", label: "Transit Epoch [BKJD]", precision: 3 },
      { key: "koi_duration", label: "Transit Duration [hours]", precision: 2 },
      { key: "koi_depth", label: "Transit Depth [ppm]", precision: 1 },
      { key: "koi_impact", label: "Impact Parameter", precision: 3 },
      {
        key: "koi_model_snr",
        label: "Transit Signal-to-Noise Ratio (SNR)",
        precision: 1,
      },
    ],
  },
  {
    id: "planetary",
    label: "\ud83c\udf0d Planetary Properties",
    fields: [
      { key: "koi_prad", label: "Planetary Radius [Earth radii]", precision: 2 },
      { key: "koi_teq", label: "Equilibrium Temperature [K]", precision: 0 },
      { key: "koi_insol", label: "Insolation Flux [Earth = 1]", precision: 2 },
    ],
  },
  {
    id: "stellar",
    label: "\u2600\ufe0f Host Star Properties",
    fields: [
      { key: "obfgam", label: "Spectral Class (OBAFGKM)" },
      { key: "koi_steff", label: "Stellar Effective Temperature [K]", precision: 0 },
      { key: "koi_slogg", label: "Stellar Surface Gravity [log g]", precision: 3 },
      { key: "koi_srad", label: "Stellar Radius [Solar radii]", precision: 2 },
      { key: "koi_kepmag", label: "Kepler-band Magnitude (Kp)", precision: 3 },
    ],
  },
];

const nothingSelectedMessage = {
  heading: "No planet data available",
  body: "Pass a planet record to the component to explore its properties.",
};

const formatNumeric = (value, precision = 2) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0,
  });

  return formatter.format(parsed);
};

const spectralInfo = (teff) => {
  const t = Number(teff);
  if (!Number.isFinite(t)) {
    return { klass: "?", name: "Unknown", color: "#6b7280" };
  }

  // Mapping based on provided ranges with an approximate display color
  if (t >= 30000)
    return { klass: "O", name: "Blue / bluish-white", color: "#8ab4ff" };
  if (t >= 10000)
    return { klass: "B", name: "Blue-white", color: "#9fc2ff" };
  if (t >= 7500) return { klass: "A", name: "White", color: "#ffffff" };
  if (t >= 6000)
    return { klass: "F", name: "Yellow-white", color: "#fff4c2" };
  if (t >= 5300)
    return { klass: "G", name: "Yellow / yellowish white", color: "#ffd860" };
  if (t >= 3900)
    return { klass: "K", name: "Light orange / yellow-orange", color: "#ffb070" };
  return { klass: "M", name: "Red / reddish", color: "#ff6b6b" };
};

const formatValue = (field, planet) => {
  if (field.key === "obfgam") {
    const info = spectralInfo(planet?.koi_steff);
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-sm border border-white/30"
          style={{ backgroundColor: info.color }}
          aria-label={`Spectral color swatch for class ${info.klass}`}
        />
        <span className="font-medium">{info.klass}</span>

      </span>
    );
  }
  return formatNumeric(planet?.[field.key], field.precision);
};

const PlanetDialog = ({ planet = samplePlanet }) => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const resolvedPlanet = planet ?? samplePlanet;
  const hasData = resolvedPlanet && Object.keys(resolvedPlanet).length > 0;

  const currentTab = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) ?? TABS[0],
    [activeTab],
  );

  const keplerName = resolvedPlanet?.kepler_name || "Unnamed Planet";
  const koiId = resolvedPlanet?.kepoi_name || resolvedPlanet?.kepid || "—";
  const disposition = resolvedPlanet?.koi_disposition || "UNKNOWN";
  const score = resolvedPlanet?.koi_score;

  return (
    <article className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/70 p-6 text-white shadow-xl backdrop-blur-md">
      {hasData ? (
        <>
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
                {disposition}
              </span>
              {score && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Disposition score: {formatNumeric(score, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Kepler ID {koiId}</p>
              <h3 className="text-2xl font-semibold">{keplerName}</h3>
              {resolvedPlanet?.kepid && (
                <p className="text-sm text-white/60">Catalog KepID: {resolvedPlanet.kepid}</p>
              )}
            </div>
          </header>

          <div className="mt-5 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    isActive
                      ? "border-white/70 bg-white/20 text-white shadow-sm"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {currentTab.fields.map((field) => (
              <div
                key={field.key}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner"
              >
                <dt className="text-xs uppercase tracking-wider text-white/60">
                  {field.label}
                </dt>
                <dd className="mt-2 text-xl font-semibold">
                  {formatValue(field, resolvedPlanet)}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="space-y-3 text-center text-white/70">
          <p className="text-lg font-semibold">{nothingSelectedMessage.heading}</p>
          <p className="text-sm">{nothingSelectedMessage.body}</p>
        </div>
      )}
    </article>
  );
};

export default PlanetDialog;
