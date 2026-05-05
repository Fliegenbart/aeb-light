# AEB Consultant Toolkit

Lightweight one-page prototype for a mock Pre-AEB readiness workbench.

The concept is an AEB consultant toolkit: consultants can use static workshop cases and deterministic rules to show a customer which shipment, broker and compliance data is already usable, which target workflows are blocked, and what should go into a customer handover note.

Current V1 prototype structure:

- Customer case workspace with editable pilot context
- Mock readiness check using deterministic local rules
- Target workflow readiness preview
- Missing evidence and blocker list
- Customer-ready report preview with copy and print actions
- Generated AEB-ready handover note

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000.

For a local production check:

```bash
npm run build
npm run start
```

## Notes

- This is not an official AEB integration.
- It does not claim partnership, certification or live API access.
- It does not provide legal, customs, sanctions or export-control advice.
- It only identifies missing data, contradictions and readiness blockers.
