export type ReadinessStatus = "ready" | "warning" | "blocked";

export type AebTarget =
  | "Customs Broker Integration"
  | "Customs Management"
  | "Product Classification"
  | "Export Controls"
  | "Compliance Screening"
  | "Risk Assessment"
  | "Carrier Connect";

export type DemoScenario = {
  id: string;
  label: string;
  expectedResult: string;
  notes: string;
};

export type ReadinessAnalysis = {
  overallScore: number;
  overallStatus: ReadinessStatus;
  executiveSummary: string;
  targetReadiness: {
    target: AebTarget;
    status: ReadinessStatus;
    score: number;
    reason: string;
  }[];
  blockers: {
    severity: "blocking" | "warning";
    title: string;
    explanation: string;
    suggestedFix: string;
    affectedTargets: AebTarget[];
  }[];
  detectedFacts: {
    label: string;
    value: string;
    source: string;
  }[];
  handoverNote: string;
};

type Finding = ReadinessAnalysis["blockers"][number];

type TargetState = {
  score: number;
  status: ReadinessStatus;
  reasons: string[];
};

const targets: AebTarget[] = [
  "Customs Broker Integration",
  "Customs Management",
  "Product Classification",
  "Export Controls",
  "Compliance Screening",
  "Risk Assessment",
  "Carrier Connect",
];

export const demoScenarios: DemoScenario[] = [
  {
    id: "clean-broker-handover",
    label: "Scenario 1: Clean broker handover",
    expectedResult: "Mostly ready",
    notes: [
      "Shipment reference: SHP-24018",
      "Commercial invoice present.",
      "Packing list present.",
      "HS codes present: 8536.50 and 9032.89.",
      "Country of origin present: Germany.",
      "Parties complete: exporter, consignee, broker and carrier are listed.",
      "Incoterm present: DAP Rotterdam.",
      "Package dimensions present.",
      "No contradictions noted by the broker team.",
    ].join("\n"),
  },
  {
    id: "invoice-packing-list-mismatch",
    label: "Scenario 2: Invoice and packing list mismatch",
    expectedResult: "Blocked for Customs Broker Integration and Customs Management",
    notes: [
      "Shipment reference: SHP-24051",
      "Commercial invoice present.",
      "Packing list present.",
      "Invoice net weight: 390 kg.",
      "Packing list net weight: 412.5 kg.",
      "Same shipment reference appears on both documents.",
      "HS codes and parties are otherwise present.",
    ].join("\n"),
  },
  {
    id: "missing-end-use-statement",
    label: "Scenario 3: Missing end-use statement",
    expectedResult: "Blocked for Export Controls and Risk Assessment",
    notes: [
      "Shipment reference: SHP-24077",
      "Destination country present: Turkey.",
      "Technical product present: control unit for industrial automation.",
      "End user present: Atlas Processing Ltd.",
      "End-use statement missing.",
      "Commercial invoice and packing list present.",
    ].join("\n"),
  },
  {
    id: "missing-technical-data",
    label: "Scenario 4: Missing technical data",
    expectedResult: "Warning or blocked for Export Controls and Product Classification",
    notes: [
      "Shipment reference: SHP-24103",
      "Product description: industrial sensor module.",
      "No technical datasheet attached.",
      "Missing frequency range / encryption / performance parameter.",
      "Commercial invoice and packing list present.",
      "Country of origin present: Germany.",
    ].join("\n"),
  },
  {
    id: "weak-master-data",
    label: "Scenario 5: Weak master data",
    expectedResult: "Warnings across multiple target workflows",
    notes: [
      "Shipment reference: SHP-24144",
      "Commercial invoice present.",
      "Packing list present.",
      "Missing Incoterm.",
      "Missing country of origin.",
      "Incomplete consignee address.",
      "Missing package dimensions.",
      "Broker asks whether master data can be completed before handover.",
    ].join("\n"),
  },
];

export function analyzeReadiness(input: string, scenario?: DemoScenario): ReadinessAnalysis {
  const text = `${scenario?.notes ?? ""}\n${input}`.trim();
  const lower = text.toLowerCase();
  const facts = detectFacts(text, lower);
  const blockers: Finding[] = [];
  const states = createInitialTargetStates();

  if (hasWeightMismatch(text)) {
    const finding = createFinding({
      severity: "blocking",
      title: "Invoice and packing list weight mismatch",
      explanation:
        "The same shipment reference carries different net weights, so the handover is not consistent enough for customs workflow preparation.",
      suggestedFix:
        "Reconcile the commercial invoice and packing list, confirm the correct net weight, and resend one aligned document set.",
      affectedTargets: ["Customs Broker Integration", "Customs Management"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 45, "Net weight contradiction must be resolved before this target workflow preview is AEB-ready.");
  }

  if (mentionsMissingEndUse(lower)) {
    const finding = createFinding({
      severity: "blocking",
      title: "End-use statement missing",
      explanation:
        "A technical product, destination country and end user are present, but the end-use evidence is missing.",
      suggestedFix:
        "Collect an end-use statement from the responsible commercial or compliance owner before preparing the handover note.",
      affectedTargets: ["Export Controls", "Risk Assessment"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 38, "End-use evidence is missing for this mock readiness check.");
  }

  if (mentionsMissingTechnicalData(lower)) {
    const finding = createFinding({
      severity: "blocking",
      title: "Missing technical data for classification",
      explanation:
        "The product is described as technical, but key classification evidence such as datasheet, frequency range, encryption or performance parameters is absent.",
      suggestedFix:
        "Attach a technical datasheet or structured product attributes before product classification or export-control review.",
      affectedTargets: ["Product Classification", "Export Controls"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 55, "Technical attributes are incomplete for this target workflow preview.");
  }

  if (mentionsMissingIncoterm(lower)) {
    const finding = createFinding({
      severity: "warning",
      title: "Incoterm missing",
      explanation: "The shipment notes do not contain a confirmed Incoterm.",
      suggestedFix: "Add the Incoterm and named place to the shipment master data.",
      affectedTargets: ["Customs Broker Integration", "Customs Management", "Carrier Connect"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 72, "Commercial terms need confirmation.");
  }

  if (mentionsMissingOrigin(lower)) {
    const finding = createFinding({
      severity: "warning",
      title: "Country of origin missing",
      explanation: "The origin is needed as evidence for classification and customs preparation.",
      suggestedFix: "Add country of origin at item level or attach origin evidence.",
      affectedTargets: ["Product Classification", "Customs Management", "Compliance Screening"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 70, "Origin evidence is missing.");
  }

  if (mentionsIncompleteConsignee(lower)) {
    const finding = createFinding({
      severity: "warning",
      title: "Consignee address incomplete",
      explanation: "The consignee data appears incomplete and may reduce screening and carrier handover quality.",
      suggestedFix: "Complete consignee name, street, postal code, city and country before handover.",
      affectedTargets: ["Compliance Screening", "Carrier Connect", "Risk Assessment"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 74, "Party master data needs completion.");
  }

  if (mentionsMissingDimensions(lower)) {
    const finding = createFinding({
      severity: "warning",
      title: "Package dimensions missing",
      explanation: "Carrier and broker preparation may need package dimensions before the shipment is operationally ready.",
      suggestedFix: "Add package count, dimensions and gross weight to the shipment notes.",
      affectedTargets: ["Carrier Connect", "Customs Broker Integration"],
    });
    blockers.push(finding);
    applyImpact(states, finding, 76, "Package data is incomplete.");
  }

  const targetReadiness = targets.map((target) => {
    const state = states[target];
    return {
      target,
      status: state.status,
      score: state.score,
      reason: state.reasons.length > 0 ? state.reasons.join(" ") : "No major blocker found in this mock readiness check.",
    };
  });

  const overallStatus = resolveOverallStatus(blockers);
  const overallScore = calculateOverallScore(targetReadiness, blockers);
  const executiveSummary = createExecutiveSummary(overallStatus, overallScore, blockers);
  const handoverNote = createHandoverNote({
    overallStatus,
    overallScore,
    executiveSummary,
    targetReadiness,
    blockers,
    facts,
  });

  return {
    overallScore,
    overallStatus,
    executiveSummary,
    targetReadiness,
    blockers,
    detectedFacts: facts,
    handoverNote,
  };
}

function createInitialTargetStates(): Record<AebTarget, TargetState> {
  return targets.reduce(
    (accumulator, target) => ({
      ...accumulator,
      [target]: { score: 92, status: "ready" as ReadinessStatus, reasons: [] },
    }),
    {} as Record<AebTarget, TargetState>,
  );
}

function createFinding(finding: Finding): Finding {
  return finding;
}

function applyImpact(states: Record<AebTarget, TargetState>, finding: Finding, score: number, reason: string) {
  for (const target of finding.affectedTargets) {
    const current = states[target];
    current.score = Math.min(current.score, score);
    current.status = finding.severity === "blocking" ? "blocked" : current.status === "blocked" ? "blocked" : "warning";
    current.reasons.push(reason);
  }
}

function resolveOverallStatus(blockers: Finding[]): ReadinessStatus {
  if (blockers.some((blocker) => blocker.severity === "blocking")) {
    return "blocked";
  }

  if (blockers.length > 0) {
    return "warning";
  }

  return "ready";
}

function calculateOverallScore(
  targetReadiness: ReadinessAnalysis["targetReadiness"],
  blockers: Finding[],
): number {
  const average = Math.round(
    targetReadiness.reduce((total, target) => total + target.score, 0) / targetReadiness.length,
  );
  const blockingPenalty = blockers.filter((blocker) => blocker.severity === "blocking").length * 6;
  const warningPenalty = blockers.filter((blocker) => blocker.severity === "warning").length * 3;

  return Math.max(18, Math.min(96, average - blockingPenalty - warningPenalty));
}

function createExecutiveSummary(status: ReadinessStatus, score: number, blockers: Finding[]): string {
  if (status === "ready") {
    return `This shipment context scores ${score}/100 and looks AEB-ready for a mock readiness check. No major contradiction or missing evidence was detected.`;
  }

  if (status === "blocked") {
    const blockingCount = blockers.filter((blocker) => blocker.severity === "blocking").length;
    return `This shipment context scores ${score}/100 and is blocked by ${blockingCount} readiness issue${
      blockingCount === 1 ? "" : "s"
    }. Resolve the blocking evidence gaps before using the handover note.`;
  }

  return `This shipment context scores ${score}/100. It is not blocked, but missing master data should be completed before the target workflow preview is treated as AEB-ready.`;
}

function createHandoverNote({
  overallStatus,
  overallScore,
  executiveSummary,
  targetReadiness,
  blockers,
  facts,
}: Pick<ReadinessAnalysis, "overallStatus" | "overallScore" | "executiveSummary" | "targetReadiness" | "blockers"> & {
  facts: ReadinessAnalysis["detectedFacts"];
}) {
  const readyTargets = targetReadiness
    .filter((item) => item.status === "ready")
    .map((item) => item.target)
    .join(", ");
  const issueLines =
    blockers.length > 0
      ? blockers
          .map((blocker) => `- ${blocker.severity.toUpperCase()}: ${blocker.title}. Fix: ${blocker.suggestedFix}`)
          .join("\n")
      : "- No blocker detected in the supplied shipment context.";
  const factLines =
    facts.length > 0
      ? facts.map((fact) => `- ${fact.label}: ${fact.value} (${fact.source})`).join("\n")
      : "- No structured facts detected.";

  return [
    "AEB-ready handover note",
    "",
    "Scope: This is a mock readiness check only. It is not an official AEB integration, partnership, certification or live API workflow. It does not provide legal, customs, sanctions or export-control advice.",
    "",
    `Overall readiness: ${overallScore}/100 (${overallStatus.toUpperCase()})`,
    executiveSummary,
    "",
    "Detected facts:",
    factLines,
    "",
    "Target workflow preview:",
    readyTargets ? `Ready-looking targets: ${readyTargets}.` : "No target workflow is fully ready yet.",
    "",
    "Missing evidence / blockers:",
    issueLines,
  ].join("\n");
}

function detectFacts(text: string, lower: string): ReadinessAnalysis["detectedFacts"] {
  const facts: ReadinessAnalysis["detectedFacts"] = [];
  const shipmentReference = text.match(/shipment reference:\s*([A-Z0-9-]+)/i)?.[1];
  const invoiceWeight = text.match(/invoice net weight:\s*([0-9]+(?:\.[0-9]+)?\s*kg)/i)?.[1];
  const packingWeight = text.match(/packing list net weight:\s*([0-9]+(?:\.[0-9]+)?\s*kg)/i)?.[1];
  const origin = text.match(/country of origin present:\s*([A-Za-z\s]+)/i)?.[1]?.trim().replace(/\.$/, "");
  const destination = text.match(/destination country present:\s*([A-Za-z\s]+)/i)?.[1]?.trim().replace(/\.$/, "");
  const endUser = text.match(/end user present:\s*([A-Za-z0-9\s.]+)/i)?.[1]?.trim().replace(/\.$/, "");

  if (shipmentReference) {
    facts.push({ label: "Shipment reference", value: shipmentReference, source: "notes" });
  }
  if (lower.includes("commercial invoice present")) {
    facts.push({ label: "Commercial invoice", value: "present", source: "notes" });
  }
  if (lower.includes("packing list present")) {
    facts.push({ label: "Packing list", value: "present", source: "notes" });
  }
  if (lower.includes("hs codes present")) {
    facts.push({ label: "HS codes", value: "present", source: "notes" });
  }
  if (origin) {
    facts.push({ label: "Country of origin", value: origin, source: "notes" });
  }
  if (destination) {
    facts.push({ label: "Destination country", value: destination, source: "notes" });
  }
  if (endUser) {
    facts.push({ label: "End user", value: endUser, source: "notes" });
  }
  if (invoiceWeight) {
    facts.push({ label: "Invoice net weight", value: invoiceWeight, source: "commercial invoice note" });
  }
  if (packingWeight) {
    facts.push({ label: "Packing list net weight", value: packingWeight, source: "packing list note" });
  }

  return facts;
}

function hasWeightMismatch(text: string) {
  const invoiceWeight = Number(text.match(/invoice net weight:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1]);
  const packingWeight = Number(text.match(/packing list net weight:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1]);

  return Number.isFinite(invoiceWeight) && Number.isFinite(packingWeight) && Math.abs(invoiceWeight - packingWeight) > 0.01;
}

function mentionsMissingEndUse(lower: string) {
  return lower.includes("end-use statement missing") || lower.includes("end use statement missing");
}

function mentionsMissingTechnicalData(lower: string) {
  return (
    lower.includes("no technical datasheet") ||
    lower.includes("missing frequency range") ||
    lower.includes("missing technical data")
  );
}

function mentionsMissingIncoterm(lower: string) {
  return lower.includes("missing incoterm") || lower.includes("incoterm missing");
}

function mentionsMissingOrigin(lower: string) {
  return lower.includes("missing country of origin") || lower.includes("origin missing");
}

function mentionsIncompleteConsignee(lower: string) {
  return lower.includes("incomplete consignee address") || lower.includes("consignee address incomplete");
}

function mentionsMissingDimensions(lower: string) {
  return lower.includes("missing package dimensions") || lower.includes("package dimensions missing");
}
