"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  RefreshCcw,
  ScanSearch,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  analyzeReadiness,
  demoScenarios,
  type DemoScenario,
  type ReadinessAnalysis,
  type ReadinessStatus,
} from "@/lib/readiness";

const statusCopy: Record<ReadinessStatus, string> = {
  ready: "Ready",
  warning: "Warning",
  blocked: "Blocked",
};

const statusStyles: Record<ReadinessStatus, string> = {
  ready: "border-emerald-300/35 bg-emerald-400/12 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.14)]",
  warning: "border-amber-300/40 bg-amber-400/14 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.14)]",
  blocked: "border-rose-300/40 bg-rose-500/14 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.16)]",
};

const statusBars: Record<ReadinessStatus, string> = {
  ready: "bg-emerald-300",
  warning: "bg-amber-300",
  blocked: "bg-rose-300",
};

const severityStyles = {
  blocking: "border-rose-300/45 bg-rose-500/12 text-rose-100",
  warning: "border-amber-300/45 bg-amber-400/12 text-amber-100",
};

const scoreGlow: Record<ReadinessStatus, string> = {
  ready: "from-emerald-300/24",
  warning: "from-amber-300/24",
  blocked: "from-rose-300/24",
};

export default function Home() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(demoScenarios[0].id);
  const selectedScenario = useMemo(
    () => demoScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? demoScenarios[0],
    [selectedScenarioId],
  );
  const [notes, setNotes] = useState(selectedScenario.notes);
  const [analysis, setAnalysis] = useState<ReadinessAnalysis>(() =>
    analyzeReadiness(selectedScenario.notes, selectedScenario),
  );

  function handleScenarioChange(id: string) {
    const scenario = demoScenarios.find((item) => item.id === id) ?? demoScenarios[0];
    setSelectedScenarioId(scenario.id);
    setNotes(scenario.notes);
    setAnalysis(analyzeReadiness(scenario.notes, scenario));
  }

  function handleAnalyze() {
    setAnalysis(analyzeReadiness(notes, selectedScenario));
  }

  function handleReset() {
    setNotes(selectedScenario.notes);
    setAnalysis(analyzeReadiness(selectedScenario.notes, selectedScenario));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a0d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(45,212,191,0.22),transparent_32%),radial-gradient(circle_at_85%_8%,rgba(234,88,12,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] [background-size:52px_52px]" />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/12 bg-white/8 backdrop-blur">
                <ScanSearch className="h-4 w-4" />
              </span>
              <span>AEB Readiness Snapshot</span>
            </div>
            <a
              href="#input-panel"
              className="hidden h-10 items-center justify-center rounded-[8px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white/82 transition hover:border-teal-200/50 hover:bg-teal-200/10 sm:inline-flex"
            >
              Run check
            </a>
          </div>

          <div className="grid gap-10 py-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:py-16">
            <div>
              <p className="max-w-md text-sm font-medium uppercase tracking-[0.2em] text-teal-100/70">
                Mock readiness check for AEB-ready handovers
              </p>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-normal text-white sm:text-6xl lg:text-7xl">
                AEB Readiness Snapshot
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                A pitchable one-page prototype that turns messy shipment, broker and compliance notes into a readiness
                score, target workflow preview, blocker list and AEB-ready handover note.
              </p>
              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                <TrustLine title="Unofficial" text="No AEB partnership or certification." />
                <TrustLine title="Local only" text="No real APIs, database or uploads." />
                <TrustLine title="Readiness" text="Missing data and contradictions only." />
              </div>
            </div>

            <DossierVisual analysis={analysis} />
          </div>
        </div>
      </section>

      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[400px_1fr] lg:px-10">
        <aside id="input-panel" className="lg:sticky lg:top-6 lg:self-start">
          <InputPanel
            selectedScenario={selectedScenario}
            selectedScenarioId={selectedScenarioId}
            notes={notes}
            onScenarioChange={handleScenarioChange}
            onNotesChange={setNotes}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
          />
        </aside>

        <div className="space-y-6">
          <ReadinessResult analysis={analysis} />
          <TargetWorkflowReadiness analysis={analysis} />
          <MissingEvidence analysis={analysis} />
          <HandoverNote note={analysis.handoverNote} />
        </div>
      </div>
    </main>
  );
}

function InputPanel({
  selectedScenario,
  selectedScenarioId,
  notes,
  onScenarioChange,
  onNotesChange,
  onAnalyze,
  onReset,
}: {
  selectedScenario: DemoScenario;
  selectedScenarioId: string;
  notes: string;
  onScenarioChange: (id: string) => void;
  onNotesChange: (notes: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
}) {
  return (
    <Panel className="bg-white/[0.09]">
      <SectionHeading
        icon={<ClipboardList className="h-4 w-4" />}
        kicker="1. Input Panel"
        title="Shipment context"
        description="Choose a demo case, adjust the notes, then run the deterministic readiness check."
      />

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Demo Scenario</span>
          <select
            value={selectedScenarioId}
            onChange={(event) => onScenarioChange(event.target.value)}
            className="mt-2 h-12 w-full rounded-[8px] border border-white/12 bg-[#10171d] px-3 text-sm text-white outline-none transition focus:border-teal-200/60 focus:ring-2 focus:ring-teal-200/15"
          >
            {demoScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-[8px] border border-orange-200/22 bg-orange-300/10 p-3 text-sm leading-6 text-orange-50/88">
          Expected result: <span className="font-semibold text-white">{selectedScenario.expectedResult}</span>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Shipment / Broker / Compliance Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={15}
            className="mt-2 w-full resize-y rounded-[8px] border border-white/12 bg-[#0b1116] p-4 text-sm leading-6 text-white/86 outline-none transition placeholder:text-white/30 focus:border-teal-200/60 focus:ring-2 focus:ring-teal-200/15"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-teal-200 px-5 text-sm font-semibold text-[#06100f] shadow-[0_16px_44px_rgba(45,212,191,0.25)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200/35"
          >
            <Sparkles className="h-4 w-4" />
            Analyze Readiness
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-5 text-sm font-semibold text-white/78 transition hover:border-orange-200/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-200/25"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </Panel>
  );
}

function ReadinessResult({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <Panel>
      <SectionHeading
        icon={<Gauge className="h-4 w-4" />}
        kicker="2. Readiness Result"
        title="Score and summary"
        description="A fast signal for whether the supplied notes are ready-looking, risky or blocked."
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[260px_1fr]">
        <ScoreTile analysis={analysis} />

        <div className="flex flex-col justify-between gap-6">
          <p className="max-w-2xl text-2xl font-medium leading-tight text-white sm:text-3xl">
            {analysis.executiveSummary}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Signal label="Detected facts" value={analysis.detectedFacts.length.toString()} />
            <Signal
              label="Blocking issues"
              value={analysis.blockers.filter((blocker) => blocker.severity === "blocking").length.toString()}
            />
            <Signal
              label="Warnings"
              value={analysis.blockers.filter((blocker) => blocker.severity === "warning").length.toString()}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {analysis.detectedFacts.slice(0, 6).map((fact) => (
          <FactCard key={`${fact.label}-${fact.value}`} label={fact.label} value={fact.value} />
        ))}
      </div>
    </Panel>
  );
}

function TargetWorkflowReadiness({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <Panel className="bg-[#f4f7f3] text-[#11181c]">
      <SectionHeading
        icon={<ArrowRight className="h-4 w-4" />}
        kicker="3. Target Workflow Readiness"
        title="Target workflow preview"
        description="A mock readiness view across the AEB-style workflow areas named in the prototype brief."
        light
      />

      <div className="mt-7 space-y-3">
        {analysis.targetReadiness.map((item) => (
          <article
            key={item.target}
            className="grid gap-4 rounded-[8px] border border-[#11181c]/10 bg-white p-4 shadow-[0_18px_45px_rgba(17,24,28,0.06)] lg:grid-cols-[230px_110px_1fr] lg:items-center"
          >
            <div>
              <p className="font-semibold text-[#11181c]">{item.target}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#66737d]">
                Score {item.score}/100
              </p>
            </div>
            <StatusPill status={item.status} compact light />
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#11181c]/8">
                <div className={`h-2 rounded-full ${statusBars[item.status]}`} style={{ width: `${item.score}%` }} />
              </div>
              <p className="mt-2 text-sm leading-6 text-[#52606a]">{item.reason}</p>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MissingEvidence({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <Panel>
      <SectionHeading
        icon={<ShieldAlert className="h-4 w-4" />}
        kicker="4. Missing Evidence / Blockers"
        title="What stops the handover"
        description="The prototype only identifies missing data, contradictions and readiness blockers."
      />

      <div className="mt-7 grid gap-4">
        {analysis.blockers.length === 0 ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-emerald-300/35 bg-emerald-400/12 p-4 text-emerald-50">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">No blocker detected</p>
              <p className="mt-1 text-sm leading-6 text-emerald-50/78">
                The supplied notes look consistent enough for this AEB-ready mock readiness check.
              </p>
            </div>
          </div>
        ) : (
          analysis.blockers.map((blocker) => (
            <article key={blocker.title} className="rounded-[8px] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-[6px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${severityStyles[blocker.severity]}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {blocker.severity}
                </span>
                <h3 className="text-lg font-semibold text-white">{blocker.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">{blocker.explanation}</p>
              <p className="mt-3 rounded-[8px] border border-orange-200/20 bg-orange-300/9 p-3 text-sm leading-6 text-orange-50/88">
                <span className="font-semibold text-white">Suggested fix:</span> {blocker.suggestedFix}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {blocker.affectedTargets.map((target) => (
                  <span
                    key={target}
                    className="rounded-[6px] border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-medium text-white/62"
                  >
                    {target}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}

function HandoverNote({ note }: { note: string }) {
  return (
    <Panel className="bg-[#05080b]">
      <SectionHeading
        icon={<FileText className="h-4 w-4" />}
        kicker="5. Generated Handover Note"
        title="AEB-ready handover note"
        description="Generated locally from deterministic rules. It is not legal, customs, sanctions or export-control advice."
      />
      <pre className="mt-7 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[8px] border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/78 shadow-inner">
        {note}
      </pre>
    </Panel>
  );
}

function DossierVisual({ analysis }: { analysis: ReadinessAnalysis }) {
  const blockedCount = analysis.blockers.filter((blocker) => blocker.severity === "blocking").length;
  const warningCount = analysis.blockers.filter((blocker) => blocker.severity === "warning").length;

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_34px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-radial ${scoreGlow[analysis.overallStatus]} to-transparent blur-2xl`} />
      <div className="absolute bottom-8 right-8 h-28 w-52 rounded-[8px] border border-orange-200/18 bg-orange-300/10" />

      <div className="relative grid h-full gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between rounded-[8px] border border-white/12 bg-[#f5f2e9] p-5 text-[#11181c] shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6a72]">Readiness specimen</p>
            <p className="mt-4 text-7xl font-semibold leading-none">{analysis.overallScore}</p>
            <StatusPill status={analysis.overallStatus} compact light />
          </div>
          <div className="space-y-3 border-t border-[#11181c]/10 pt-5">
            <MiniRow label="Blocking" value={blockedCount.toString()} tone="red" />
            <MiniRow label="Warning" value={warningCount.toString()} tone="amber" />
            <MiniRow label="Facts" value={analysis.detectedFacts.length.toString()} tone="green" />
          </div>
        </div>

        <div className="relative min-h-[330px]">
          <div className="absolute left-0 top-5 h-64 w-[78%] rotate-[-4deg] rounded-[8px] border border-white/20 bg-[#f7f4ec] p-4 text-[#11181c] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <div className="h-3 w-28 rounded-full bg-[#11181c]" />
            <div className="mt-8 space-y-2">
              <div className="h-2 w-full rounded-full bg-[#11181c]/18" />
              <div className="h-2 w-11/12 rounded-full bg-[#11181c]/18" />
              <div className="h-2 w-2/3 rounded-full bg-orange-400/70" />
            </div>
            <div className="mt-9 grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-[6px] bg-teal-300/20" />
              <div className="aspect-square rounded-[6px] bg-orange-300/25" />
              <div className="aspect-square rounded-[6px] bg-[#11181c]/10" />
            </div>
          </div>
          <div className="absolute right-0 top-16 h-64 w-[76%] rotate-[3deg] rounded-[8px] border border-white/12 bg-[#071015] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between text-xs text-white/54">
              <span>Target workflow preview</span>
              <span>{statusCopy[analysis.overallStatus]}</span>
            </div>
            <div className="mt-6 space-y-3">
              {analysis.targetReadiness.slice(0, 5).map((target) => (
                <div key={target.target} className="grid grid-cols-[1fr_48px] items-center gap-3">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-2 rounded-full ${statusBars[target.status]}`} style={{ width: `${target.score}%` }} />
                  </div>
                  <span className="text-right text-xs text-white/54">{target.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-8 rounded-[8px] border border-teal-100/20 bg-teal-200 px-4 py-3 text-sm font-semibold text-[#06100f] shadow-[0_18px_50px_rgba(45,212,191,0.25)]">
            mock readiness check
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[8px] border border-white/10 bg-white/[0.075] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  icon,
  kicker,
  title,
  description,
  light = false,
}: {
  icon: ReactNode;
  kicker: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
          light ? "text-[#66737d]" : "text-white/45"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-[6px] border ${
            light ? "border-[#11181c]/12 bg-[#11181c]/4" : "border-white/12 bg-white/7"
          }`}
        >
          {icon}
        </span>
        {kicker}
      </div>
      <h2 className={`mt-4 text-2xl font-semibold leading-tight ${light ? "text-[#11181c]" : "text-white"}`}>
        {title}
      </h2>
      <p className={`mt-2 max-w-2xl text-sm leading-6 ${light ? "text-[#52606a]" : "text-white/60"}`}>
        {description}
      </p>
    </div>
  );
}

function StatusPill({
  status,
  compact = false,
  light = false,
}: {
  status: ReadinessStatus;
  compact?: boolean;
  light?: boolean;
}) {
  const lightStyle: Record<ReadinessStatus, string> = {
    ready: "border-emerald-300 bg-emerald-50 text-emerald-800",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    blocked: "border-rose-300 bg-rose-50 text-rose-800",
  };

  return (
    <span
      className={`mt-4 inline-flex w-fit items-center justify-center rounded-[6px] border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
        light ? lightStyle[status] : statusStyles[status]
      } ${compact ? "mt-0" : ""}`}
    >
      {statusCopy[status]}
    </span>
  );
}

function ScoreTile({ analysis }: { analysis: ReadinessAnalysis }) {
  const gradient =
    analysis.overallStatus === "ready"
      ? "conic-gradient(#5eead4 0deg, #5eead4 var(--score), rgba(255,255,255,0.08) var(--score), rgba(255,255,255,0.08) 360deg)"
      : analysis.overallStatus === "warning"
        ? "conic-gradient(#fcd34d 0deg, #fcd34d var(--score), rgba(255,255,255,0.08) var(--score), rgba(255,255,255,0.08) 360deg)"
        : "conic-gradient(#fda4af 0deg, #fda4af var(--score), rgba(255,255,255,0.08) var(--score), rgba(255,255,255,0.08) 360deg)";

  return (
    <div className="relative flex aspect-square items-center justify-center rounded-[8px] border border-white/10 bg-black/24">
      <div
        className="absolute inset-6 rounded-full"
        style={{ background: gradient, "--score": `${analysis.overallScore * 3.6}deg` } as React.CSSProperties}
      />
      <div className="absolute inset-[38px] rounded-full border border-white/10 bg-[#0c1217]" />
      <div className="relative text-center">
        <p className="text-7xl font-semibold leading-none text-white">{analysis.overallScore}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">out of 100</p>
        <StatusPill status={analysis.overallStatus} />
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-3xl font-semibold leading-none text-white">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-[#0c1217] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">{label}</p>
      <p className="mt-1 text-sm font-medium text-white/84">{value}</p>
    </div>
  );
}

function TrustLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-5 text-white/55">{text}</p>
    </div>
  );
}

function MiniRow({ label, value, tone }: { label: string; value: string; tone: "red" | "amber" | "green" }) {
  const colors = {
    red: "bg-rose-500",
    amber: "bg-amber-400",
    green: "bg-emerald-500",
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colors[tone]}`} />
        <span className="text-sm text-[#52606a]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#11181c]">{value}</span>
    </div>
  );
}
