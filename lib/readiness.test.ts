import { describe, expect, it } from "vitest";
import { analyzeReadiness, demoScenarios } from "./readiness";

describe("analyzeReadiness", () => {
  it("marks the clean broker handover as mostly ready", () => {
    const scenario = demoScenarios.find((item) => item.id === "clean-broker-handover");

    const result = analyzeReadiness(scenario?.notes ?? "", scenario);

    expect(result.overallStatus).toBe("ready");
    expect(result.overallScore).toBeGreaterThanOrEqual(86);
    expect(result.blockers.filter((blocker) => blocker.severity === "blocking")).toHaveLength(0);
  });

  it("blocks customs workflows when invoice and packing list weights contradict each other", () => {
    const scenario = demoScenarios.find((item) => item.id === "invoice-packing-list-mismatch");

    const result = analyzeReadiness(scenario?.notes ?? "", scenario);

    expect(result.overallStatus).toBe("blocked");
    expect(result.blockers.some((blocker) => blocker.title.includes("weight mismatch"))).toBe(true);
    expect(
      result.targetReadiness.find((item) => item.target === "Customs Broker Integration")?.status,
    ).toBe("blocked");
    expect(result.targetReadiness.find((item) => item.target === "Customs Management")?.status).toBe(
      "blocked",
    );
  });

  it("blocks export controls and risk assessment when end-use evidence is missing", () => {
    const scenario = demoScenarios.find((item) => item.id === "missing-end-use-statement");

    const result = analyzeReadiness(scenario?.notes ?? "", scenario);

    expect(result.overallStatus).toBe("blocked");
    expect(result.blockers.some((blocker) => blocker.title.includes("End-use"))).toBe(true);
    expect(result.targetReadiness.find((item) => item.target === "Export Controls")?.status).toBe(
      "blocked",
    );
    expect(result.targetReadiness.find((item) => item.target === "Risk Assessment")?.status).toBe(
      "blocked",
    );
  });

  it("flags missing technical data for classification and export-control review", () => {
    const scenario = demoScenarios.find((item) => item.id === "missing-technical-data");

    const result = analyzeReadiness(scenario?.notes ?? "", scenario);

    expect(result.overallStatus).not.toBe("ready");
    expect(result.blockers.some((blocker) => blocker.title.includes("technical data"))).toBe(true);
    expect(
      result.targetReadiness.find((item) => item.target === "Product Classification")?.status,
    ).not.toBe("ready");
    expect(result.targetReadiness.find((item) => item.target === "Export Controls")?.status).not.toBe(
      "ready",
    );
  });

  it("creates warnings across several workflows when master data is weak", () => {
    const scenario = demoScenarios.find((item) => item.id === "weak-master-data");

    const result = analyzeReadiness(scenario?.notes ?? "", scenario);

    expect(result.overallStatus).toBe("warning");
    expect(result.blockers.filter((blocker) => blocker.severity === "warning").length).toBeGreaterThanOrEqual(
      3,
    );
    expect(result.targetReadiness.filter((item) => item.status === "warning").length).toBeGreaterThanOrEqual(
      3,
    );
  });
});
