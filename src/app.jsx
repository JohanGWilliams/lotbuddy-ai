import { useMemo, useState } from "react";
import { Home, LineChart, Image as ImageIcon, Copy, Sparkles } from "lucide-react";

function Panel({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-slate-800 bg-slate-900/70 ${className}`}>
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, help, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200">{label}</label>
      {help ? <div className="mb-1 text-xs text-slate-500">{help}</div> : null}
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function RangeField({ value, min, max, step, onChange }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-violet-500"
    />
  );
}

export default function LotBuddyAI() {
  const [projectName, setProjectName] = useState("Courtyard Missing-Middle Study");
  const [siteArea, setSiteArea] = useState(12000);
  const [lotWidth, setLotWidth] = useState(100);
  const [lotDepth, setLotDepth] = useState(120);
  const [maxStories, setMaxStories] = useState(3);
  const [parkingType, setParkingType] = useState("surface");
  const [targetStrategy, setTargetStrategy] = useState("missing-middle");
  const [bedMix, setBedMix] = useState("balanced");
  const [marketStyle, setMarketStyle] = useState("attainable");
  const [parkingRatio, setParkingRatio] = useState(1.3);
  const [efficiency, setEfficiency] = useState(0.72);
  const [customUnitSize, setCustomUnitSize] = useState(0);
  const [showQuickSummary, setShowQuickSummary] = useState(true);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => {
    const safeSiteArea = Math.max(1000, Number(siteArea) || 0);
    const safeLotWidth = Math.max(20, Number(lotWidth) || 0);
    const safeLotDepth = Math.max(20, Number(lotDepth) || 0);
    const safeStories = Math.max(1, Math.min(6, Number(maxStories) || 1));
    const safeEfficiency = Math.max(0.45, Math.min(0.9, Number(efficiency) || 0.72));

    const lotArea = safeLotWidth * safeLotDepth;
    const effectiveSiteArea = Math.max(safeSiteArea, lotArea);

    const parkingFactor =
      parkingType === "surface" ? 0.38 :
      parkingType === "rear-loaded" ? 0.46 : 0.58;

    const buildableFootprint = Math.round(effectiveSiteArea * parkingFactor);
    const grossArea = Math.round(buildableFootprint * safeStories);

    let avgUnitSize = 850;
    if (bedMix === "studio-heavy") avgUnitSize = 625;
    if (bedMix === "family") avgUnitSize = 1025;
    if (bedMix === "one-bed-heavy") avgUnitSize = 760;
    if (customUnitSize > 250) avgUnitSize = customUnitSize;

    const netResidentialArea = Math.round(grossArea * safeEfficiency);
    const unitCount = Math.max(4, Math.floor(netResidentialArea / avgUnitSize));
    const parkingSpaces = Math.round(unitCount * parkingRatio);

    let concept = "courtyard";

    if (targetStrategy === "townhome") concept = "townhome row";
    else if (targetStrategy === "small-apartment")
      concept = safeLotWidth < 70 ? "bar" : "double-loaded apartment";
    else if (parkingType === "structured" && safeLotWidth > 85)
      concept = "podium-lite";
    else if (safeLotWidth < 70)
      concept = "bar";

    let bestSystem = "wood-frame walk-up with simple shared corridor";

    if (concept === "bar") bestSystem = "simple bar building with repeated units";
    if (concept === "courtyard") bestSystem = "courtyard building with repeated double-loaded units";
    if (concept === "podium-lite") bestSystem = "hybrid podium-style system only if land value or parking pressure justifies it";
    if (concept === "townhome row") bestSystem = "repeated townhome blocks with simple rear access";
    if (concept === "double-loaded apartment") bestSystem = "double-loaded wood-frame apartment with stacked units";

    const styleLanguage =
      marketStyle === "premium"
        ? "higher-end materials and stronger curb appeal"
        : marketStyle === "workforce"
        ? "durable low-cost materials and clean practical massing"
        : "clean attainable materials with balanced cost and appeal";

    const memo = `${projectName} is an early-stage multifamily concept generated from basic parcel constraints. Based on an effective site area of ${effectiveSiteArea.toLocaleString()} SF and ${safeStories} stories, the current concept suggests approximately ${unitCount} units using a ${concept} building form. The recommended system is ${bestSystem}. The visual direction should use ${styleLanguage}.`;

    const perfectImagePrompt =
      `A clean architectural concept rendering of a ${safeStories}-story ${concept} multifamily building designed as ${bestSystem}, using ${styleLanguage}, developer presentation style.`;

    const yieldScenarios = [2,3,4,5].map((stories) => {
      const scenarioGross = Math.round(buildableFootprint * stories);
      const scenarioNet = Math.round(scenarioGross * safeEfficiency);
      const scenarioUnits = Math.max(4, Math.floor(scenarioNet / avgUnitSize));
      return { stories, units: scenarioUnits };
    });

    return {
      unitCount,
      parkingSpaces,
      concept,
      memo,
      bestSystem,
      perfectImagePrompt,
      yieldScenarios
    };

  }, [projectName,siteArea,lotWidth,lotDepth,maxStories,parkingType,targetStrategy,bedMix,marketStyle,parkingRatio,efficiency,customUnitSize]);

  const copyText = async (label,text) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(()=>setCopied(""),1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-4xl font-bold mb-6">
        LotBuddy AI — Multifamily Concept Engine
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Inputs</h2>

          <input
            value={projectName}
            onChange={(e)=>setProjectName(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-slate-800"
          />

          <input
            type="number"
            value={siteArea}
            onChange={(e)=>setSiteArea(Number(e.target.value))}
            className="w-full mb-3 p-2 rounded bg-slate-800"
          />

          <input
            type="number"
            value={maxStories}
            onChange={(e)=>setMaxStories(Number(e.target.value))}
            className="w-full mb-3 p-2 rounded bg-slate-800"
          />
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Output</h2>

          <p>Concept: {result.concept}</p>
          <p>Units: {result.unitCount}</p>
          <p>Parking: {result.parkingSpaces}</p>

          <button
            onClick={()=>copyText("memo copied",result.memo)}
            className="mt-4 bg-violet-600 px-4 py-2 rounded"
          >
            Copy Developer Memo
          </button>

          {copied && <p className="text-green-400 mt-2">{copied}</p>}
        </div>

      </div>
    </div>
  );
}
