"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
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

const statusTone: Record<ReadinessStatus, string> = {
  ready: "border-emerald-300 bg-emerald-50 text-emerald-800",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  blocked: "border-rose-300 bg-rose-50 text-rose-800",
};

const statusDot: Record<ReadinessStatus, string> = {
  ready: "bg-emerald-500",
  warning: "bg-amber-500",
  blocked: "bg-rose-500",
};

const statusBar: Record<ReadinessStatus, string> = {
  ready: "bg-emerald-500",
  warning: "bg-amber-500",
  blocked: "bg-rose-500",
};

const severityTone = {
  blocking: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const consultantSteps = [
  "Collect messy shipment context",
  "Spot data gaps and contradictions",
  "Align target workflow readiness",
  "Hand over a clean action note",
];

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
    <main className="min-h-screen bg-[#eef2eb] text-[#101820]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,0.045)_1px,transparent_1px),linear-gradient(rgba(16,24,32,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] gap-5 p-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:p-5">
        <aside className="rounded-[8px] border border-white/10 bg-[#071015] p-5 text-white shadow-[0_30px_90px_rgba(7,16,21,0.28)] lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:overflow-y-auto">
          <SidebarHeader />
          <ConsultantGraphic analysis={analysis} />
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

        <section className="min-w-0 space-y-5">
          <Hero analysis={analysis} />
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-5">
              <ReadinessCockpit analysis={analysis} />
              <TargetWorkflowReadiness analysis={analysis} />
            </div>
            <div className="min-w-0 space-y-5">
              <MissingEvidence analysis={analysis} />
              <ConsultantHandover note={analysis.handoverNote} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarHeader() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/12 bg-white/8">
            <ScanSearch className="h-4 w-4 text-teal-100" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">AEB Consultant Toolkit</p>
            <p className="text-xs text-white/45">Pre-AEB readiness</p>
          </div>
        </div>
        <StatusBadge status="ready" label="Local" />
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100/70">Consultant mode</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-normal text-white">
          Make customer data workshop-ready.
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/58">
          A facilitation cockpit for AEB consultants: identify data blockers, preview target workflow readiness and
          create a clean customer handover note.
        </p>
      </div>

      <div className="mt-5 rounded-[8px] border border-white/10 bg-white/[0.055] p-3 text-xs leading-5 text-white/55">
        Not an official AEB integration. No partnership, certification, live API access or legal/customs/export-control
        advice is claimed.
      </div>
    </div>
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
    <section className="mt-6 space-y-5">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Workshop case</span>
        <select
          value={selectedScenarioId}
          onChange={(event) => onScenarioChange(event.target.value)}
          className="mt-2 h-12 w-full rounded-[8px] border border-white/12 bg-[#0b151b] px-3 text-sm font-medium text-white outline-none transition focus:border-teal-200/60 focus:ring-2 focus:ring-teal-200/15"
        >
          {demoScenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-[8px] border border-orange-200/18 bg-orange-300/10 p-3 text-sm leading-6 text-orange-50/80">
        Consultant expectation: <span className="font-semibold text-white">{selectedScenario.expectedResult}</span>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
          Shipment, broker and compliance notes
        </span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={13}
          className="mt-2 w-full resize-y rounded-[8px] border border-white/12 bg-[#050b10] p-4 text-sm leading-6 text-white/84 outline-none transition focus:border-teal-200/60 focus:ring-2 focus:ring-teal-200/15"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={onAnalyze}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-teal-200 px-5 text-sm font-semibold text-[#06100f] shadow-[0_18px_48px_rgba(45,212,191,0.24)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200/35"
        >
          <Sparkles className="h-4 w-4" />
          Run readiness check
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/6 px-4 text-sm font-semibold text-white/72 transition hover:border-orange-200/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-200/25"
        >
          <RefreshCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </section>
  );
}

function Hero({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <header className="rounded-[8px] border border-[#101820]/10 bg-[#f8faf6] p-5 shadow-[0_24px_70px_rgba(16,24,32,0.08)] sm:p-6">
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#61706c]">Pre-AEB readiness workbench</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-normal text-[#101820] sm:text-5xl">
            Consultant Toolkit
          </h2>
          <p className="mt-4 text-base leading-7 text-[#54615e]">
            Turn a messy customer workshop into a structured data readiness conversation: facts, blockers, target
            workflow preview and a handover note in one screen.
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Metric label="Score" value={`${analysis.overallScore}`} />
          <Metric label="Blockers" value={analysis.blockers.filter((item) => item.severity === "blocking").length.toString()} />
          <Metric label="Facts" value={analysis.detectedFacts.length.toString()} />
        </div>
      </div>
    </header>
  );
}

function ReadinessCockpit({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <Panel>
      <SectionHeading
        icon={<Gauge className="h-4 w-4" />}
        kicker="Readiness cockpit"
        title="Workshop signal"
        description="A fast, explainable score for whether the customer context is AEB-ready enough for the next project step."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-1 2xl:grid-cols-[260px_1fr]">
        <ScoreRing analysis={analysis} />
        <div className="flex flex-col justify-between gap-6">
          <div>
            <StatusBadge status={analysis.overallStatus} label={statusCopy[analysis.overallStatus]} />
            <p className="mt-4 max-w-2xl text-2xl font-semibold leading-tight text-[#101820]">
              {analysis.executiveSummary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {consultantSteps.map((step, index) => (
              <div key={step} className="rounded-[8px] border border-[#101820]/10 bg-[#f8faf6] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75817e]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold leading-5 text-[#101820]">{step}</p>
              </div>
            ))}
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
    <Panel>
      <SectionHeading
        icon={<ArrowRight className="h-4 w-4" />}
        kicker="Target workflow preview"
        title="Where the implementation conversation gets stuck"
        description="A consultant-friendly map of target workflows that are ready, risky or blocked by the supplied evidence."
      />

      <div className="mt-7 space-y-3">
        {analysis.targetReadiness.map((item) => (
          <article
            key={item.target}
            className="grid gap-4 rounded-[8px] border border-[#101820]/10 bg-[#fbfcf9] p-4 lg:grid-cols-[220px_100px_1fr] lg:items-center"
          >
            <div>
              <p className="font-semibold text-[#101820]">{item.target}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#75817e]">
                Score {item.score}/100
              </p>
            </div>
            <StatusBadge status={item.status} label={statusCopy[item.status]} />
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#101820]/8">
                <div className={`h-2 rounded-full ${statusBar[item.status]}`} style={{ width: `${item.score}%` }} />
              </div>
              <p className="mt-2 text-sm leading-6 text-[#54615e]">{item.reason}</p>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function MissingEvidence({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <Panel className="!border-[#101820] !bg-[#101820] !text-white">
      <SectionHeading
        icon={<ShieldAlert className="h-4 w-4" />}
        kicker="Missing evidence"
        title="Customer to-dos"
        description="Only missing data, contradictions and readiness blockers are identified."
        dark
      />

      <div className="mt-6 space-y-3">
        {analysis.blockers.length === 0 ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-emerald-300/30 bg-emerald-400/10 p-4 text-emerald-50">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">No blocker detected</p>
              <p className="mt-1 text-sm leading-6 text-emerald-50/72">
                The supplied notes look consistent enough for this AEB-ready mock readiness check.
              </p>
            </div>
          </div>
        ) : (
          analysis.blockers.map((blocker) => (
            <article key={blocker.title} className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-[6px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${severityTone[blocker.severity]}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {blocker.severity}
                </span>
                <h3 className="text-base font-semibold text-white">{blocker.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">{blocker.explanation}</p>
              <p className="mt-3 rounded-[8px] border border-orange-200/18 bg-orange-300/10 p-3 text-sm leading-6 text-orange-50/86">
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

function ConsultantHandover({ note }: { note: string }) {
  return (
    <Panel>
      <SectionHeading
        icon={<FileText className="h-4 w-4" />}
        kicker="Consultant handover note"
        title="AEB-ready handover"
        description="A structured note for the next workshop step, not legal, customs, sanctions or export-control advice."
      />
      <pre className="mt-6 max-h-[470px] overflow-auto whitespace-pre-wrap rounded-[8px] border border-[#101820]/10 bg-[#f8faf6] p-4 text-xs leading-6 text-[#34403d]">
        {note}
      </pre>
    </Panel>
  );
}

function ConsultantGraphic({ analysis }: { analysis: ReadinessAnalysis }) {
  return (
    <div className="mt-7 overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
      <div className="relative min-h-[210px]">
        <div className="absolute left-2 top-4 h-40 w-[68%] -rotate-3 rounded-[8px] border border-white/15 bg-[#f4f1e8] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <div className="h-3 w-24 rounded-full bg-[#101820]" />
          <div className="mt-7 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#101820]/16" />
            <div className="h-2 w-5/6 rounded-full bg-[#101820]/16" />
            <div className="h-2 w-2/3 rounded-full bg-orange-300" />
          </div>
        </div>
        <div className="absolute bottom-2 right-0 h-40 w-[74%] rotate-2 rounded-[8px] border border-white/14 bg-[#02080c] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Target workflow preview</span>
            <span>{statusCopy[analysis.overallStatus]}</span>
          </div>
          <div className="mt-5 space-y-3">
            {analysis.targetReadiness.slice(0, 5).map((target) => (
              <div key={target.target} className="grid grid-cols-[1fr_34px] items-center gap-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${statusBar[target.status]}`} style={{ width: `${target.score}%` }} />
                </div>
                <span className="text-right text-xs text-white/50">{target.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-6 rounded-[8px] bg-teal-200 px-4 py-2 text-sm font-semibold text-[#06100f]">
          readiness sprint
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ analysis }: { analysis: ReadinessAnalysis }) {
  const color =
    analysis.overallStatus === "ready" ? "#10b981" : analysis.overallStatus === "warning" ? "#f59e0b" : "#e11d48";
  const scoreDegrees = `${analysis.overallScore * 3.6}deg`;

  return (
    <div className="relative flex aspect-square items-center justify-center rounded-[8px] border border-[#101820]/10 bg-[#f8faf6]">
      <div
        className="absolute inset-6 rounded-full"
        style={{
          background: `conic-gradient(${color} 0deg, ${color} ${scoreDegrees}, rgba(16,24,32,0.08) ${scoreDegrees}, rgba(16,24,32,0.08) 360deg)`,
        }}
      />
      <div className="absolute inset-[38px] rounded-full border border-[#101820]/10 bg-white" />
      <div className="relative text-center">
        <p className="text-7xl font-semibold leading-none text-[#101820]">{analysis.overallScore}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#75817e]">out of 100</p>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[8px] border border-[#101820]/10 bg-white p-5 shadow-[0_24px_70px_rgba(16,24,32,0.08)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({
  icon,
  kicker,
  title,
  description,
  dark = false,
}: {
  icon: ReactNode;
  kicker: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
          dark ? "text-white/42" : "text-[#75817e]"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-[6px] border ${
            dark ? "border-white/12 bg-white/7" : "border-[#101820]/10 bg-[#101820]/4"
          }`}
        >
          {icon}
        </span>
        {kicker}
      </div>
      <h2 className={`mt-4 text-2xl font-semibold leading-tight ${dark ? "text-white" : "text-[#101820]"}`}>
        {title}
      </h2>
      <p className={`mt-2 max-w-2xl text-sm leading-6 ${dark ? "text-white/58" : "text-[#54615e]"}`}>
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status, label }: { status: ReadinessStatus; label: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-[6px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusTone[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px] rounded-[8px] border border-[#101820]/10 bg-white p-4">
      <p className="text-3xl font-semibold leading-none text-[#101820]">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#75817e]">{label}</p>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#101820]/10 bg-[#fbfcf9] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#75817e]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#101820]">{value}</p>
    </div>
  );
}
