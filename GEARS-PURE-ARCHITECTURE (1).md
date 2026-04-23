# GEARS Pure Architecture

**Version**: 4.3
**Status**: Runtime / Pure Architecture (Execution-Oriented)
**Date**: 2026-04-20
**Sources**: GEARS.md, GEARS-RUNTIME.md, GEARS-ENGINE-DESIGN.md, AutoML Convention, Engineering Questions v2

---

## Architecture Purpose

This document defines the **pure architecture** of GEARS—the structural and behavioral design of the system, independent of implementation details.

### Positioning

This document focuses on **runtime and execution architecture**—how GEARS operates when gears are executable. It is one component of the complete GEARS methodology:

- **This document**: Runtime / Pure Architecture (execution-oriented)
- **Complementary**: 5D lifecycle model, AI interaction model, versioning doctrine

### What This Document Is

- **Architecture**: The fundamental organization of GEARS
- **Structure**: How components relate and interact
- **Behavior**: What the system does, not how it's built
- **Doctrine**: The invariant principles that must be preserved

### What This Document Is Not

- ❌ Implementation guide (no code, no APIs)
- ❌ Platform design (no pricing, no tiers)
- ❌ Product specification (no feature lists)
- ❌ Deployment manual (no infrastructure)
- ❌ Complete GEARS doctrine (5D lifecycle, detailed AI model covered separately)

---

## Doctrinal Foundation

The architecture derives entirely from three source documents. Any deviation must be justified.

### From GEARS.md: Core Thesis

GEARS is a methodology for converting business narratives into hierarchical value chains. It treats business ideas as "Money Making Machines" composed of discrete "Engine Parts."

**Core Principle**: **Structure makes intention computable**
> Business intent is the starting point. Structure is what makes it executable. AI operates within GEARS-defined structures to implement business intent.

### From GEARS-RUNTIME.md: Four Core Objectives

| Objective | Architectural Implication |
|-----------|---------------------------|
| **Orchestration** | Hierarchy defines authority flow |
| **Cooperation** | Graph enables peer interaction |
| **Simulation** | Isolated namespace mirrors execution |
| **Operation** | Real-world side effects through controlled interfaces |

### From GEARS-ENGINE-DESIGN.md: Decomposition Discipline

| Principle | Architectural Enforcement |
|-----------|---------------------------|
| **Atomic Decomposition** | Every gear is actionable without further breakdown |
| **Abstraction Consistency** | Sibling gears exist at the same abstraction level |
| **Purpose-Driven Design** | Gears define value created, not technical operation |
| **Verb-Noun Naming** | Every gear name follows strict convention |

---

## The 5D Capability Model

GEARS evolves through five capability dimensions—Discovery, Design, Develop, Debug, Deploy. These are **capability layers applied to the same model**, not a pipeline.

### Critical Principle

**A Gear is a single entity that is progressively enriched across the 5Ds.**

It is not recreated or transformed into different object types. The same gear exists simultaneously in different D-states as it progresses.

### The Five Dimensions

| Dimension | Focus | Key Activities | Output |
|-----------|-------|----------------|--------|
| **Discovery** | Intent capture | Extract business primitives, identify value chain | High-level value hierarchy |
| **Design** | Structure definition | Decompose into gears, define relationships | Complete value hierarchy graph |
| **Develop** | Executable specification | Define inputs/outputs, logic, interfaces | Executable gear contracts |
| **Debug** | Behavior validation | Simulation, scenario testing, consistency checks | Validated, gap-free system |
| **Deploy** | Real-world execution | Task orchestration, agent execution, integration, bounded live optimization | Live operating business |

### Key Characteristics

1. **Not a Pipeline**: The 5Ds are not sequential stages with handoffs. They are capability layers.
2. **Progressive Enrichment**: The same gear gains depth and detail as it moves through the 5Ds.
3. **Simultaneous D-States**: Different gears may exist in different D-states at the same time.
4. **No Rebuilding**: Discovery → Design → Develop → Debug → Deploy = evolution, not reconstruction.
5. **Iteration**: Work may loop back within or across Ds as understanding deepens.
6. **Bounded Autonomous Iteration**: Gears in Deploy state may run autonomous improvement cycles within strictly bounded experiment parameters. Each cycle: hypothesis → single-parameter change → measure → promote or rollback. Only Deploy-state gears activate live iteration; Develop and Debug use simulation-based iteration against frozen evaluators.

### Example: Single Gear Across 5Ds

Consider the gear "Authenticate Users" as it progresses:

- **Discovery**: Identified as necessary for customer operations
- **Design**: Placed in hierarchy under "Enable Customer Operations"; sibling to "Process Orders"
- **Develop**: Contract defined with inputs (credentials), outputs (user_id), execution type (automated)
- **Debug**: Simulated with valid/invalid credentials, edge cases tested
- **Deploy**: Connected to real identity provider, handling live authentication requests

The gear remains "Authenticate Users" throughout—it is progressively enriched, not replaced.

---

## Architectural Constraints

These constraints **must** be reflected in the architecture:

| Constraint | What It Prohibits |
|------------|-------------------|
| Hierarchy defines authority | Flat decision structures, peer approval |
| Graph enables cooperation | Strictly hierarchical communication only |
| Gear is a contract | Gears as agents, objects, or services |
| Orchestration ≠ Execution | Workflows that do work themselves |
| Simulation mirrors execution | Different contract structures for sim vs live |
| AI subordinate to framework | Agent-driven decision making |

---

## Reference Architecture

### The Six-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Authority Layer                           │
│  Parent assigns → Child executes → Parent approves           │
│  Escalation: Child → Parent → Specialist → Root              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Communication Layer                         │
│  Hierarchical: task_assignment, approval, reporting          │
│  Lateral: data_request, notification, coordination            │
│  Event: broadcast, pub/sub, async notification               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      State Layer                              │
│  Shared, versioned, controlled state layer                   │
│  Reference approach: workflow_context with event sourcing     │
│  Simulation: isolated namespace (sim.<run_id>.*)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Runtime Layer                             │
│  Execution types: manual (human), automated (function),      │
│                   agent (LLM), workflow (orchestrator)       │
│  Each type: same external contract, different internal       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Simulation Layer                            │
│  Same contracts, same state model, isolated namespace        │
│  Deterministic where possible, observable always              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Observability Layer                           │
│  Logging, metrics, tracing, safety controls                  │
│  Audit trail: every execution fully traceable                │
└─────────────────────────────────────────────────────────────┘
```

### Layer Interaction Rules

| From | To | Interaction | Authority Transfer |
|------|----|-------------|-------------------|
| Parent | Child | Task assignment | Yes |
| Child | Parent | Output submission | Yes (via approval) |
| Child | Parent | Escalation | Yes |
| Peer | Peer | Data request | No |
| Peer | Peer | Notification | No |
| Any | State | Read/write | No (state access control) |

---

## Structural Integrity

### Hard Invariants vs Modeling Heuristics

**Hard Invariants** must be preserved. Violations break GEARS architecture.

**Modeling Heuristics** are recommended practices. Deviations may be valid in specific contexts.

### Hard Invariants

| Invariant | Description | Rationale |
|-----------|-------------|-----------|
| **One Parent Per Gear** | Each gear has exactly one parent (except root) | Authority flow requires clear chain |
| **Hierarchy Defines Authority** | Parent-child relationships determine approval flow | Core architectural principle |
| **Contract Structure Consistency** | All gears follow same contract schema | Interoperability, simulation parity |
| **Simulation Parity** | Simulation uses identical contract structure | Validation fidelity |
| **Gear Identity Stability** | gear_id and parent_id stable within version lineage | Traceability |

### Modeling Heuristics

| Heuristic | Recommendation | When to Deviate |
|-----------|----------------|-----------------|
| **Hierarchy Depth** | 3-5 levels recommended, 7 max | Complex domains may require deeper hierarchies |
| **Branching Factor** | 3-7 primary capabilities, 10 max | Some root operations have broader scope |
| **Verb-Noun Naming** | `<Verb> <Plural Noun>` format | Singular nouns valid for single-entity concepts |
| **Execution Type** | One primary type per gear | Hybrid execution may be valid for complex gears |
| **Abstraction Level** | Siblings at same level | Intentional layering may justify variance |
| **Change Traceability** | Prefer single-parameter changes per experiment cycle | Multi-field changes may be valid for legitimate Develop or structural updates |
| **Candidate Tracks** | Model within-D alternatives as state-layer candidate tracks, not separate gears | Full parallel identities may be valid only for true structural forks |
| **Deploy Retention** | Keep `previous` deploy states bounded to the last N approved production references | Higher retention may be valid for regulated or audited domains |

### Hierarchy Model

**Structure**:
```
Root (Level 0)
├── Primary Capability (Level 1)
│   ├── Sub-Capability (Level 2)
│   │   └── Leaf Gear (Level 3)
│   └── Sub-Capability (Level 2)
└── Primary Capability (Level 1)
```

**Versioning**:
- Gear IDs are stable **within a version lineage**
- Structural refactors create a new version lineage
- Version chain preserves ancestry for traceability

### Graph Cooperation Model

**Peer Communication Types**:

| Type | Purpose | Authority |
|------|---------|-----------|
| Data Request | Gear needs peer's output | None transferred |
| Notification | Gear announces event | None transferred |
| Coordination | Gears synchronize via parent | Parent mediates |
| Shared State | Gears read/write same data | State layer enforces |

**Key Constraint**: Peer communication **never** transfers authority.

### Abstraction Consistency

**Principle**: Sibling gears must exist at the same abstraction level.

**Validation Rules**:
1. Same depth in hierarchy
2. Similar granularity of purpose
3. Comparable outcome types
4. Consistent naming patterns

**Examples**:

❌ **Inconsistent**:
```
Enable Customer Operations
├── Authenticate User          # Too specific
├── Manage Orders              # Too vague
└── Send Email Notification    # Too low-level
```

✅ **Consistent**:
```
Enable Customer Operations
├── Authenticate Users         # All at same level
├── Process Orders
└── Send Notifications
```

---

## The Gear Contract

Every gear is defined by a **contract**—the complete specification of its purpose, interfaces, authority, and behavior.

### Contract Schema

```yaml
# ===== IDENTITY =====
identity:
  gear_id: string              # Verb-Noun slug (e.g., "authenticate-users")
  parent_id: string            # Direct parent
  level: integer               # Hierarchy depth
  version: string              # Contract version
  d_state: string              # Current D-state: discovery|design|develop|debug|deploy
  deploy_state: string         # draft|candidate|live|previous (meaningful only when d_state=deploy)
  candidate_id: string         # Optional named candidate track resolved from state/version lineage
  baseline_id: string          # Optional immutable baseline reference resolved from state/version lineage

# ===== BUSINESS =====
business:
  commercial_logic: string     # Commercial rationale (the "Why")
  purpose: string              # Value created (the "What")
  goals: [string]              # Specific outcomes
  outcomes: [string]           # Measurable results
  value_metric: string         # How success is measured
  stakeholders: [string]       # Stakeholder groups served

# ===== INTERFACES =====
interfaces:
  inputs:
    - name: string
      type: string
      source: string           # Where data comes from
      validation: string       # Validation rule
      required: boolean
  outputs:
    - name: string
      type: string
      destination: string      # Where data goes
      value_contribution: string  # How output creates value
  events:
    - name: string
      trigger: string
      notify: [string]
  dependencies:
    - gear_id: string          # Prerequisite gear
      completion_required: boolean  # Must complete before execution
      data_required: boolean   # Requires output data from prerequisite

# ===== AUTHORITY =====
authority:
  approval_required: boolean   # Parent must approve?
  can_escalate_to: [string]    # Escalation path
  approval_criteria: [string]  # Auto-approval conditions
  delegation_rules: [string]   # When approval can be delegated

# ===== EXECUTION =====
execution:
  type: string                 # manual|automated|agent|workflow
  capability_tier: string      # minimal|standard|advanced
  timeout: integer             # Seconds
  retry_policy:
    max_attempts: integer
    backoff: string
    base_delay: integer
  error_handling:
    on_transient_error: string
    on_permanent_error: string
    on_dependency_failure: string

# ===== SIMULATION =====
simulation:
  deterministic: boolean
  scenarios: [string]           # Named test scenario references (external definition)
  frozen_constraints: [string]  # Contract elements and evaluators that must not change during simulation-based iteration

# ===== ITERATION =====
iteration:
  enabled: boolean              # Whether this gear runs bounded improvement cycles
  baseline_metric: string       # Primary metric used to compare variants
  improvement_threshold: float  # Minimum improvement required for promotion
  allowed_mutations: [string]   # Execution parameters allowed to vary during iteration
  max_experiments: integer      # Hard cap on attempts per cycle
  max_duration: integer         # Maximum seconds per iteration cycle

# ===== OBSERVABILITY =====
observability:
  log_level: string
  metrics:
    track: [string]
    alert_if: [object]
  safety_controls:
    stop_on: [string]
    human_review_required: [string]
    forbidden_actions: [string] # Actions never allowed during simulation or autonomous iteration
```

### Contract Invariants

1. **Identity Stability**: `gear_id` and `parent_id` stable within version lineage
2. **Interface Consistency**: Input/output types stable within version
3. **Authority Singularity**: Each gear has exactly one parent (except root)
4. **Simulation Parity**: Simulation uses identical contract structure
5. **Commercial Explicitness**: Every gear declares its commercial rationale
6. **Stakeholder Declaration**: Every gear identifies which stakeholders it serves
7. **Dependency Transparency**: All prerequisite dependencies are explicit
8. **D-State Tracking**: Each gear tracks its current 5D capability state
9. **Iteration Boundedness**: Every gear with `iteration.enabled: true` must define `max_experiments`, `max_duration`, and explicit promotion thresholds. No unbounded autonomous loops.

---

## Naming Discipline

### Verb-Noun Convention

**Format**: `<Verb> <Plural Noun>` (recommended heuristic)

**Examples**:
- ✅ "Authenticate Users"
- ✅ "Process Payments"
- ✅ "Generate Reports"
- ✅ "Send Notifications"

❌ **Prohibited Patterns**:
- "Manage Users" (vague)
- "Handle Requests" (ambiguous)
- "Process" (no context)
- "User Management" (noun phrase)

**Note**: Singular nouns may be appropriate for single-entity concepts (e.g., "Configure Bank Details"). Judgment should be guided by business semantics.

### Prohibited Anti-Patterns

| Anti-Pattern | Why | Correct Alternative |
|--------------|-----|-------------------|
| **"Manage" Trap** | Vague, hides complexity | "Authenticate Users," "Authorize Access" |
| **Everything Bucket** | Too broad, not actionable | Split into specific gears |
| **Orphan Leaves** | Not actionable | Make leaf gears executable |
| **Technology Mirror** | Organizes by tech, not business | Organize by business capability |
| **Stakeholder Blindness** | Obscures who is served | "Enable Driver Operations" |
| **Deep Dive** | Imbalanced hierarchy | Keep branches 3-5 levels |
| **Compliance Afterthought** | Security neglected | Make compliance a primary gear |
| **Infinite Platform** | No boundaries | Define geographic/scope limits |

### Common Structural Patterns

These recurring patterns represent architectural best practices for organizing GEARS hierarchies:

| Pattern | Principle | When to Apply |
|---------|-----------|---------------|
| **Stakeholder-Driven Organization** | Primary capabilities organize around stakeholder groups | Multi-sided marketplaces, platforms with distinct user types |
| **Trust as a First-Class Capability** | Verification, reviews, and reputation are primary gears | Marketplaces connecting strangers, high-value transactions |
| **Geographic Liquidity Control** | Supply managed by geographic clusters | Location-based services, last-mile delivery, regional markets |
| **Regulatory Explicitness** | Compliance and security as primary gears | Healthcare, finance, regulated industries |
| **Verification Before Transactions** | Verification gates before high-value operations | Fraud prevention, safety-critical operations, payments |

**Pattern Application Example** (Agitoo):
```
Operate Agitoo (root)
├── Enable Buyer Operations         [Stakeholder-Driven]
├── Enable Vendor Operations        [Stakeholder-Driven]
├── Enable Driver Operations        [Stakeholder-Driven]
└── Execute Job Life Cycle          [Verification Before Transactions]
    └── Charge User Account          [Verification Before Transactions]
```

---

## Execution Models

### Four Execution Types

| Type | Executor | State Change | Deterministic | Best For |
|------|----------|--------------|---------------|----------|
| **Manual** | Human | Via UI/task queue | No | High-stakes decisions, creative work |
| **Automated** | Function | Via code | Yes | Calculations, validations |
| **Agent** | LLM | Via tool use | No | Classification, generation |
| **Workflow** | Orchestrator | Via children | Varies | Multi-step processes |

**Note**: Gears requiring multiple execution modes should be decomposed into separate child gears, each with a single execution type. This maintains the atomic decomposition principle.

### Capability Tiers

Instead of specific toolsets, execution uses abstract capability tiers:

| Tier | Capabilities | Use Case |
|------|-------------|----------|
| **minimal** | Basic classification, categorization | Simple routing, triage |
| **standard** | Data extraction, summarization, math | Analysis, reporting |
| **advanced** | Complex reasoning, planning, code generation | Problem-solving, creation |

---

## State Architecture

### State Layer Requirements

GEARS requires a **shared, versioned, controlled state layer** with these characteristics:

1. **Single Source of Truth**: One authoritative state store
2. **Versioned**: All changes tracked with version lineage
3. **Append-Only**: Events logged, never deleted
4. **Rebuildable**: Materialized views can be rebuilt from event log
5. **Isolated**: Simulation uses separate namespace

### Reference Implementation: workflow_context

The following is a **reference operating assumption**, not a fixed doctrine:

```
workflow_context/
├── gears/
│   ├── <gear_id>/
│   │   ├── outputs/              # Materialized views
│   │   └── events/               # Append-only log
│   └── ...
└── global/
    ├── run_metadata/
    │   ├── run_id: uuid
    │   ├── started_at: timestamp
    │   ├── mode: execution|simulation
    │   └── version_lineage: string
    └── config/
        └── environment: production|staging|development
```

**Note**: This event-sourced approach is a reference implementation. Other architectures meeting the requirements above are valid.

### Iterative Experiment Log

Gears with `iteration.enabled: true` maintain an append-only experiment log within the state layer. Each iteration cycle produces a structured record. Live experiments write to the main namespace; simulation-mode experiments write to the simulation namespace.

**Keying Convention**:

| Purpose | Format | Example |
|---------|--------|---------|
| Experiment | `gears.<gear_id>.experiments.<experiment_id>` | `gears.optimize-pricing.experiments.exp-0042` |
| Simulated Experiment | `sim.<run_id>.gears.<gear_id>.experiments.<experiment_id>` | `sim.abc123.gears.optimize-pricing.experiments.exp-0042` |

**Experiment Record**:
```yaml
experiment:
  experiment_id: string
  candidate_id: string            # Stable ID for a named candidate track
  variant: string                 # Description of the bounded change set
  status: string                  # running|promoted|rolled_back|expired
  measured_value: number          # Result against baseline_metric
  decision: string                # promote|rollback|escalate
  decided_by: string              # gear_id|auto|human
  reason: string
```

**State Operations for Experiments**:
- **Write**: Only gear owner appends to its experiment log
- **Read**: Parent gear and observability layer can read experiment logs
- **Promote**: Winning variant's outputs replace gear's primary outputs (requires parent approval if `authority.approval_required: true`)
- **Rollback**: Reverts to baseline outputs; logged as an experiment event

### Baseline Registry

GEARS distinguishes between lightweight snapshots and immutable baselines. Snapshots support recovery and comparison; baselines support governance, reproducibility, and promotion.

**Keying Convention**:

| Purpose | Format | Example |
|---------|--------|---------|
| Engine Baseline | `gears.<gear_id>.baselines.<baseline_id>` | `gears.optimize-pricing.baselines.debug-baseline-01` |
| Simulated Baseline | `sim.<run_id>.gears.<gear_id>.baselines.<baseline_id>` | `sim.abc123.gears.optimize-pricing.baselines.debug-baseline-01` |

**Baseline Record**:
```yaml
baseline:
  baseline_id: string
  d_state: string
  scope: string                   # engine|gear|simulation|deploy
  created_from_version: string
  immutable: true
  approved_by: string
  purpose: string                 # review|comparison|release_candidate|production_reference
```

**Baseline Creation Authority**: Baselines with `purpose: release_candidate` or `purpose: production_reference` must be approved by the parent gear or the architectural review board. Baselines with `purpose: review` or `purpose: comparison` may be created by the gear owner.

### Promotion Log

Cross-D movement is a tracked transition event, not just another edit. Every promotion writes an append-only promotion record so lineage can be reconstructed across the 5Ds.

| Purpose | Format | Example |
|---------|--------|---------|
| Promotion | `gears.<gear_id>.promotions.<promotion_id>` | `gears.optimize-pricing.promotions.prom-0012` |
| Simulated Promotion Review | `sim.<run_id>.gears.<gear_id>.promotions.<promotion_id>` | `sim.abc123.gears.optimize-pricing.promotions.prom-0012` |

```yaml
promotion:
  promotion_id: string
  from_d_state: string
  to_d_state: string
  source_version: string
  target_version: string
  baseline_id: string
  decision: string                # promoted|blocked|rolled_back
  decided_by: string              # human|auto|gear_id
  reason: string
```

**Promotion Authority Constraint**: D-state promotions to `deploy` must not use `decided_by: auto`. Promotion to Deploy requires an accountable decider (`human` or an explicitly authorized `gear_id`).

```yaml
# Example constraint specialization
promotion:
  to_d_state: deploy
  decided_by: human|gear_id
  auto_allowed: false
  reason: string
```


### Keying Conventions

| Purpose | Format | Example |
|---------|--------|---------|
| Output | `gears.<gear_id>.outputs.<output_name>` | `gears.authenticate-users.outputs.user_id` |
| Event | `gears.<gear_id>.events.<sequence_number>` | `gears.authenticate-users.events.001` |
| Simulation | `sim.<run_id>.gears.<gear_id>.outputs.*` | `sim.abc123.gears.authenticate-users.outputs.user_id` |

### State Operations

**Read**: Any gear can read any output
**Write**: Only gear owner writes to its outputs
**Event**: Only gear owner appends to its event log
**Rebuild**: Materialized views rebuildable from events

### Scalability

- **Small** (< 100 gears): Single-node in-memory
- **Medium** (100-1000 gears): Distributed state with caching
- **Large** (> 1000 gears): Sharded state by gear subtree

---

## Communication Patterns

### Hierarchical Communication

**Parent → Child: Task Assignment**
- Purpose: Assign work, define constraints
- Authority: Transfers task authority
- Example: Parent requests child execution with inputs

**Child → Parent: Output Submission**
- Purpose: Submit work results
- Authority: Returns authority to parent
- Example: Child completes, submits outputs for approval

**Child → Parent: Escalation**
- Purpose: Request help when stuck
- Authority: Follows escalation path
- Example: Child cannot resolve issue, escalates

### Lateral Communication

**Peer → Peer: Data Request**
- Purpose: Access peer's output data
- Authority: No transfer (data only)
- Example: Gear A requests Gear B's output

**Peer → Peer: Notification**
- Purpose: Inform of event
- Authority: No transfer (fire-and-forget)
- Example: Gear A notifies Gear B of completion

### Event Communication

**Gear → All: Event Broadcast**
- Purpose: Publish event to subscribers
- Authority: No transfer (async)
- Example: Payment failed event triggers multiple responses

### Sequential Dependencies

**Gear → Gear: Sequenced Execution**
- Purpose: Execute gears in required order
- Authority: No transfer (ordering constraint only)
- Example: "Confirm Payment" must complete before "Execute Delivery"
- Distinction: Unlike authority transfer, this is a temporal/prerequisite constraint

**Dependency Types**:
- **Completion Dependency**: Predecessor must finish (e.g., payment before delivery)
- **Data Dependency**: Predecessor's output is required (e.g., validate before process)
- **State Dependency**: Predecessor establishes required state (e.g., onboard before serve)

---

## Authority Framework

### Authority Flow

1. **Assignment**: Parent assigns task to child
2. **Execution**: Child executes per contract
3. **Submission**: Child submits outputs (staged)
4. **Approval**: Parent approves/rejects/modifies
5. **Commit**: Approved outputs commit to state

### Approval Gates

When `authority.approval_required: true`:

1. Child completes execution
2. Outputs staged (not visible to others)
3. Parent receives approval request
4. Parent evaluates against criteria
5. Parent decides: approve/reject/modify/escalate
6. Approved outputs commit and become visible

### Escalation Paths

**Triggers**:
- Child cannot resolve issue
- Approval rejected with no retry possible
- Error requires higher authority
- Safety limit exceeded

**Path**:
```yaml
authority:
  can_escalate_to:
    - parent-gear-id
    - grandparent-gear-id
    - specialist-gear-id
    - root-gear-id
  escalation_timeout: 300  # seconds
```

### Delegation Rules

**When approval can be delegated**:
- Parent explicitly grants delegation authority
- Delegate has equivalent expertise
- Audit trail maintained
- Accountability remains with delegator

### Autonomous Output Promotion

Gears with `iteration.enabled: true` may autonomously promote experiment outputs (not D-state) only when all iteration thresholds are satisfied and `authority.approval_required` is `false`. This is a specialized form of auto-approval within the existing Authority framework — it governs whether iteration outputs replace the gear's primary outputs, not whether the gear advances to a different D-state.

**Output Promotion Flow**:
1. Gear completes a bounded iteration cycle
2. System evaluates `iteration.improvement_threshold` against `iteration.baseline_metric`
3. If all thresholds are met and `approval_required: false` → auto-promote outputs and log decision
4. If `approval_required: true` → stage outputs for parent approval (same gate as standard output submission)
5. If thresholds are not met → rollback to baseline outputs, retry within bounds, or escalate

**Escalation Triggers for Iteration**:
- Maximum experiments exhausted without meeting thresholds
- Maximum duration reached without conclusive result
- Performance degradation beyond tolerance
- Conflicting metrics require parent judgment

---

## Simulation Architecture

### Simulation Mode

**Activation**:
```yaml
mode: simulation
namespace: sim.<run_id>
version_lineage: <same_as_execution>
```

**Characteristics**:
- **Isolated**: No side effects on real systems
- **Deterministic**: Same inputs → same outputs (where possible)
- **Observable**: Full trace of all operations
- **Replayable**: Can re-run scenarios

### Mock Philosophy

Mocks enable simulation of external dependencies by controlling their behavior:
- API responses (success, failure, timeout scenarios)
- Database behaviors (errors, delays, edge cases)
- External system states (upstream/downstream conditions)
- Custom test conditions

**Mock Configuration Principle**: Mocks are configured per test scenario, not hard-coded into gear contracts. This keeps the pure architecture separate from test-specific concerns.

### Test Scenarios

Each gear defines test scenarios at the principle level:
- **Happy path**: Normal execution flow
- **Error conditions**: Failure modes and edge cases
- **Integration scenarios**: Cross-gear dependency testing
- **Performance scenarios**: Load and stress conditions

### Frozen Evaluators

Simulation-based iteration requires frozen evaluators and bounded scope.

**Principle**:
- During Debug-state iteration, evaluators, test scenarios, and success criteria remain fixed
- Only `iteration.allowed_mutations` may vary between attempts
- This preserves fair comparison across simulated variants and maintains simulation parity

**Constraint**: A gear may not modify its own evaluator while being evaluated.

---

## Observability Architecture

### Logging

**Levels**: debug, info, warn, error

**Fields**:
- timestamp
- gear_id
- run_id
- level
- message
- metadata

### Metrics

**Per-Gear**:
- execution_count, success_rate, failure_rate
- duration (avg, p50, p95, p99)
- cost (if applicable)

**System-Wide**:
- total_gears_executed
- active_workflows
- resource_usage

### Tracing

**Distributed Trace**:
- trace_id spans entire workflow
- Each gear is a span
- Parent-child relationships preserved

### Safety Controls

**Behavior Guards**:
- stop_on: [hallucination, safety_violation, loop_detected]
- human_review_required: [high_risk_operations]
- forbidden_actions: [actions that must never be taken during simulation or autonomous iteration]

**Forbidden Actions** constrain what autonomous iteration cycles may do. Unlike `stop_on` (which halts execution reactively), `forbidden_actions` are pre-emptive: the runtime must refuse to execute any action on this list. Examples:
- Modifying frozen_constraints during iteration
- Exceeding budget_cap or max_experiments
- Mutating more than one execution parameter per experiment cycle (enforces Change Traceability heuristic)
- Accessing production state during simulation-mode iteration

---

## Modeling Governance

### Contract Versioning

**Version Lineage**:
```
authenticate-users v1.0 (initial)
├── authenticate-users v1.1 (added field)
├── authenticate-users v1.2 (changed validation)
└── authenticate-users v2.0 (breaking change)
    └── authenticate-users v2.1 (added field)
```

**Stability Rules**:
- Patch versions (1.0 → 1.1): Additive changes, backward compatible
- Minor versions (1.x → 2.0): Breaking changes, migration required

### Versioning Across the 5Ds

The primary versioned object in GEARS is the **engine definition**: hierarchy structure, gear properties, interfaces, rules, simulation assumptions, execution bindings, and observability definitions. The canvas is a projection of that model, not the primary versioned truth.

**Canvas Snapshots vs Engine Versions**:
- **Canvas snapshot**: UI-level capture of layout, positions, expansions, annotations, and view preferences
- **Engine version**: System-level definition of the gear or gearset
- Snapshots support undo, recovery, and comparison
- Engine versions support lineage, governance, simulation reproducibility, promotion, and deployment

**Within-D Versioning**:
- Each dimension maintains its own iteration sequence
- Discovery drafts, Design revisions, Develop iterations
- Debug scenarios, Deploy configurations
- Named candidate tracks may exist within a D-state for bounded alternatives under the same `gear_id`

**Cross-D Promotion**:
- Promotion path: Discovery → Design → Develop → Debug → Deploy
- Promotions create checkpoints in version lineage
- Rollback possible to any previous D-state
- A promotion is a tracked transition event, not just an edit

**Branching Doctrine**:
- Branching is allowed within a D-state when comparing legitimate alternatives
- Branching should preserve `gear_id` stability and be modeled as named candidate tracks or bounded experiment-backed variants, not as disconnected parallel identities
- Candidate tracks are state-layer variants keyed by `candidate_id`, not separate instantiated gears with independent parentage
- Only a promoted candidate becomes the primary working version for the next D-state

**Baseline Doctrine**:
- **Snapshot** = lightweight save point for rollback, recovery, and quick comparison
- **Baseline** = named, immutable governance reference for review, simulation comparison, release candidacy, or production reference
- Debug and Deploy should prefer immutable baselines for any comparison that affects promotion or rollback decisions

**Deploy Lifecycle**:
- Deploy-state gears may distinguish `draft`, `candidate`, `live`, and `previous`
- `draft` is editable but not promotable to production without review
- `candidate` is the promotion target under evaluation against production baselines
- `live` is the active production reference
- `previous` is a retained rollback target or historical production reference

**D-State Promotion Schema**:
```yaml
d_state_promotion:
  from_d_state: string
  to_d_state: string
  source_version: string
  target_version: string
  baseline_id: string
  criteria:
    all_required_contract_fields_present: boolean
    all_scenarios_pass: boolean
    beats_baseline: boolean
    min_confidence: float
    min_improvement: float
    no_frozen_constraint_violations: boolean
  on_failure: string               # block|escalate|retry_with_feedback|rollback
```

**Debug → Deploy Promotion Gate** (Autonomous Improvement Convention):

A gear with `iteration.enabled: true` cannot be promoted from Debug to Deploy unless it demonstrates measurable improvement over its simulation baseline. This is a formal governance gate, not an authority gate (it governs lifecycle progression, not parent-child task flow).

```yaml
promotion:
  from_d_state: debug
  to_d_state: deploy
  criteria:
    beats_baseline: true           # Measured value must exceed iteration.baseline_metric
    min_confidence: float          # Statistical confidence threshold defined by governance policy or domain requirements
    min_improvement: float         # Must exceed iteration.improvement_threshold
    all_scenarios_pass: true       # All simulation.scenarios must pass
    no_frozen_constraint_violations: true  # frozen_constraints never mutated
  on_failure: string               # block|escalate|retry_with_feedback
```

**Note**: This gate supplements (does not replace) the standard `authority.approval_required` mechanism. A gear may require both authority approval from its parent AND satisfaction of promotion criteria.

**Version Structure**:
```yaml
version:
  lineage: string              # Overall gear identity
  d_state: string              # Current D-state
  d_version: string            # Version within current D
  candidate_id: string         # Optional named candidate track within current D
  promoted_from: string        # Previous D-state (if promoted)
  baseline: boolean            # Marks stable reference point
  baseline_id: string          # Immutable baseline reference (if applicable)
```

**Note**: The contract schema uses a simplified flat representation (`version`, `d_state`, `deploy_state`) for runtime efficiency. The complete version structure above represents the full model for cross-D versioning and promotion tracking.

### Modification Authority

**Who May Modify Contracts**:
- Gear owner: Modify own contract (within authority)
- Parent: Modify child contract (via approval)
- Architectural review board: Structural changes

**Approval Required For**:
- Breaking interface changes
- Authority flow changes
- Execution type changes
- New primary capabilities

### Audit Retention

**Retention Policies**:
- Contract versions: Retain forever
- Execution logs: Retain per compliance requirements
- Event logs: Retain per business requirements
- Traces: Retain per debugging needs

### Approval Delegation

**Rules**:
- Parent may delegate approval to designated delegate
- Delegate must have equivalent authority level
- Delegation must be explicit and time-bound
- Audit trail must record delegation chain

### Reversibility Awareness

**Principle**: Distinguish between structural and cosmetic changes.

**Change Classification**:

| Change Type | Definition | Reversibility | Impact |
|-------------|------------|---------------|--------|
| **Structural** | Affects hierarchy, authority, or contract | Requires version bump | High |
| **Cosmetic** | Affects presentation, naming (non-breaking) | Easily reversible | Low |

**Structural Changes** (create new version lineage):
- Adding/removing gears in hierarchy
- Changing parent-child relationships
- Modifying contract interfaces
- Altering authority flow

**Cosmetic Changes** (same version):
- Renaming gears (within style guide)
- Updating descriptions or comments
- Adjusting non-critical metadata
- Reformatting or presentation changes

**Reversibility Mechanism**:
- All structural changes create version checkpoints
- Rollback to any previous version is always possible
- Historical mapping preserved for traceability
- Cosmetic changes do not affect version lineage

### Export Architecture

**Principle**: The hierarchy is the source of truth; everything else is projection.

**Export Types**:

| Export | Purpose | Format | Consumer |
|--------|---------|--------|----------|
| **Narrative Descriptions** | Human-readable documentation | Markdown, PDF | Stakeholders |
| **Executive Presentations** | Decision maker summaries | Slides, Briefing | Leadership |
| **Project Breakdown Structures** | Implementation planning | WBS, Gantt | Engineering |
| **Costing Models** | Financial analysis | Spreadsheet, Model | Finance |
| **AI-Ready Structured JSON** | Machine-consumable specification | JSON | AI Systems |
| **Capability Maps** | Visual governance views | Diagrams, Graphs | Architecture |
| **Governance Artefacts** | Compliance and audit | Reports, Logs | Regulators |

**Export Philosophy**:
- Same hierarchical data produces multiple output formats
- Exports are read-only projections of the canonical model
- Changes flow only one direction: hierarchy → exports
- Export fidelity depends on hierarchy quality (garbage in, garbage out)

---

## AI Architecture

### Two-Knowledge-Base Model

GEARS operates with two distinct knowledge bases:

**1. Methodology Knowledge Base (Structured)**
- GEARS principles, patterns, and doctrines
- Gear contracts, hierarchies, and relationships
- Execution models, communication patterns
- Rules, constraints, and invariants

**2. Business Context Knowledge Base (Unstructured)**
- Industry domain knowledge
- Company-specific information
- Stakeholder requirements
- Regulatory and compliance details

**AI as Interpreter**:
- AI navigates between structured methodology and unstructured context
- Methodology constrains AI behavior
- Context informs AI decisions
- Structure makes intent computable

### AI Role Across the 5Ds

AI is **pervasive** across all GEARS dimensions, but **subordinate** to the framework:

| Dimension | AI Role |
|-----------|---------|
| **Discovery** | Extract business primitives from documents, identify value chains |
| **Design** | Assist with decomposition, validate abstraction consistency |
| **Develop** | Generate contract specifications, validate completeness |
| **Debug** | Identify gaps, edge cases, performance issues |
| **Deploy** | Execute agent-based gears, monitor for anomalies |

**Key Principle**: AI operates **within** the GEARS structure. The structure is not imposed by AI—it is the framework AI operates within.

### Co-Pilot Interaction Model

At a high level, the GEARS co-pilot provides:

**Structured Actions** (not chat-first):
- Decompose business ideas into hierarchies
- Validate gear contracts against doctrine
- Score system quality and completeness
- Suggest improvements and identify gaps

**Context-Aware Assistance**:
- Understand current D-state of each gear
- Recognize stakeholder context and business constraints
- Maintain awareness of version lineage and dependencies

**Core Capabilities**:
- **Decomposition**: Break down complex capabilities into actionable gears
- **Validation**: Check adherence to naming, abstraction, and structural rules
- **Scoring**: Assess completeness, consistency, and commercial explicitness
- **Gap Analysis**: Identify missing gears, incomplete contracts, broken dependencies

**Anti-Pattern**:
- ❌ Chat-first: "What should I build next?"
- ✅ Structure-first: "Validate this hierarchy against GEARS doctrine"

---

## Business Examples

### Example 1: Agitoo (Last Mile Delivery & eCommerce)

**Commercial Logic**: Integrated logistics engine connecting vendors and drivers for last-mile fulfillment.
**Stakeholders**: Buyers, Vendors, Drivers, VOP (Vendor Operations Provider).

```
Operate Agitoo (root, Level 0)
├── Sign Up Users (Level 1)
│   ├── Sign Up Vendor (Level 2)
│   │   ├── Determine VOP or None (Level 3) - automated
│   │   ├── Determine New or Existing (Level 3) - automated
│   │   ├── Complete Form (Level 3) - manual
│   │   └── Assign VOP and Set Approved Flag (Level 3) - automated
│   ├── Sign Up Buyer (Level 2)
│   │   └── Confirm Payment Mechanism (Level 3) - automated
│   └── Sign Up Driver (Level 2)
│       ├── Sign Up VOP (Level 3) - manual
│       └── Add Password (Level 3) - automated
├── Execute Job Life Cycle (Level 1)
│   ├── List Active Jobs (Level 2) - automated
│   └── Execute New Jobs (Level 2) - workflow
│       ├── Execute Taxi Job Type (Level 3) - workflow
│       │   ├── Accept Passenger Request (Level 4) - automated
│       │   ├── Estimate Billings (Level 4) - automated
│       │   ├── Confirm Driver Assignment (Level 4) - manual
│       │   ├── Execute Passenger Pickup (Level 4) - automated
│       │   ├── Navigate to Destination (Level 4) - automated
│       │   ├── Execute Drop Off (Level 4) - automated
│       │   └── Charge User Account (Level 4) - automated
│       ├── Execute eCommerce Job Type (Level 3) - workflow
│       │   ├── Support Inventory Browsing (Level 4) - automated
│       │   ├── Accept Purchase Request (Level 4) - manual
│       │   ├── Execute Vendor Fulfillment (Level 4) - workflow
│       │   ├── Execute Driver Transport (Level 4) - automated
│       │   ├── Confirm Buyer Receipt (Level 4) - manual
│       │   └── Charge User Account (Level 4) - automated
│       └── Execute Vendor Job (Level 3) - workflow
│           ├── Create Vendor Job (Level 4) - manual
│           ├── Estimate Billing (Level 4) - automated
│           ├── Execute Driver Transport (Level 4) - automated
│           ├── Confirm Buyer Receipt (Level 4) - manual
│           └── Charge User Account (Level 4) - automated
└── Execute Financial Operations (Level 1)
    ├── Generate Financial Statement (Level 2) - automated
    └── Execute Payment Requests (Level 2) - workflow
        ├── Facilitate Payment Collection (Level 3) - workflow
        │   ├── Process Credit Card (Level 4) - automated
        │   └── Issue Invoice (Level 4) - automated
        └── Execute GIRO Transfer (Level 3) - automated
```

**Value Transformation**: Customer demand → Job fulfillment → Revenue
**Dependencies**: Sign Up → Execute Job Life Cycle; Execute Job Life Cycle → Execute Financial Operations

### Example 2: My Consultants (Telehealth Delivery)

**Commercial Logic**: Scalable telehealth platform with specialized interfaces for clinical and patient workflows.
**Stakeholders**: Doctors, Patients, Admin.

```
Operate My Consultants (root, Level 0)
├── Authenticate Users (Level 1) - automated
│   ├── Validate User Credentials (Level 2) - automated
│   └── Execute Password Reset (Level 2) - automated
├── Onboard Patients (Level 1) - workflow
│   ├── Execute Patient Onboarding (Level 2) - manual
│   └── Maintain Patient Profile (Level 2) - workflow
│       ├── Record Medical History (Level 3) - manual
│       ├── Log Current Medications (Level 3) - manual
│       └── Record Lifestyle Data (Level 3) - manual
├── Onboard Consultants (Level 1) - workflow
│   ├── Execute Consultant Onboarding (Level 2) - manual
│   ├── Maintain Consultant Profile (Level 2) - workflow
│   └── Configure Consultant Settings (Level 2) - manual
│       └── Configure Bank Details (Level 3) - manual
├── Orchestrate Care Consultations (Level 1) - workflow
│   ├── Confirm Consultation Schedule (Level 2) - workflow
│   │   ├── Present Patient Flavor (Level 3) - automated
│   │   └── Present Consultant Flavor (Level 3) - automated
│   ├── Verify Consultant Availability (Level 2) - automated
│   └── Accept Care Appointment (Level 2) - manual
├── Execute New Consultation Discovery (Level 1) - workflow
│   ├── Enable Consultant Discovery (Level 2) - agent
│   │   ├── Categorize Consultants (Level 3) - agent
│   │   ├── Present Suggestions (Level 3) - agent
│   │   └── Present "My List" (Level 3) - automated
│   └── Facilitate Consultation Selection (Level 2) - workflow
│       ├── Arrange Care Schedule (Level 3) - manual
│       ├── Execute "Call Now" (Level 3) - automated
│       ├── Execute "Call Me Back" (Level 3) - automated
│       ├── Schedule Future Call (Level 3) - manual
│       └── Request Specific Time (Level 3) - manual
├── Verify Pre-Consultation Payments (Level 1) - automated
├── Execute Care Consultation (Level 1) - agent
│   └── Execute Video Call (Level 2) - automated
│       ├── Present Patient Flavor (Level 3) - automated
│       └── Present Doctor Flavor (Level 3) - automated
├── Finalize Consultation Record (Level 1) - manual
└── Operate Administrative System (Level 1) - workflow
    ├── Administer Consultant Pool (Level 2) - manual
    │   ├── Approve Consultant Credentials (Level 3) - manual
    │   └── Verify Payments Due (Level 3) - automated
    ├── Maintain Patient Records (Level 2) - automated
    ├── Monitor Consultations (Level 2) - automated
    ├── Facilitate Credit Redemption (Level 2) - automated
    └── Maintain Application (Level 2) - automated
        └── Execute PNS Broadcasts (Level 3) - automated
```

**Value Transformation**: Patient needs → Care delivery → Health outcomes
**Dependencies**: Onboard Patients/Consultants → Orchestrate Care Consultations; Execute New Consultation Discovery → Execute Care Consultation
**Complexity**: 6 levels deep, mixed execution types (manual, automated, agent, workflow), cross-gear data dependencies

---

**Note**: The examples above represent Deploy-state hierarchies with execution types assigned. In earlier D-states (Discovery, Design), the same gears would have progressively less detail defined.

---

## Architecture Decision Records

### ADR-001: Hybrid Hierarchy-Graph Model

**Decision**: Hierarchy defines authority; graph enables communication

**Alternatives Rejected**:
- Pure hierarchy (too rigid)
- Pure graph (no clear authority)
- One-agent-per-gear (inefficient)

**Trade-off**: Complexity for flexibility

### ADR-002: Gear as Contract

**Decision**: Gear is a contract, not an agent or service

**Alternatives Rejected**:
- Gear = agent (forces AI everywhere)
- Gear = service (too rigid)

**Trade-off**: Implementation complexity for flexibility

### ADR-003: Shared State Layer

**Decision**: GEARS requires a single shared, versioned, controlled state layer

**Requirements** (must be satisfied by any implementation):
1. **Single Source of Truth**: One authoritative state store
2. **Versioned**: All changes tracked with version lineage
3. **Append-Only**: Events logged, never deleted
4. **Rebuildable**: Materialized views can be rebuilt from event log
5. **Isolated**: Simulation uses separate namespace

**Reference Implementation**: workflow_context with event sourcing

The workflow_context structure shown in the State Architecture section is a reference operating assumption that satisfies these requirements. Event sourcing is one valid approach; other implementations meeting the requirements above are also acceptable.

**Alternatives Rejected**:
- Distributed state per gear (complex sync)
- Database per gear type (scalability issues)

**Trade-off**: Centralization for consistency

### ADR-004: AI Subordinate to Framework

**Decision**: Agents are tool users within gears; AI pervasive but structure-constrained

**Alternatives Rejected**:
- AI-driven orchestration (violates hierarchy)
- AI as primary execution (over-use)

**Trade-off**: Explicitness for accountability

### ADR-005: Simulation Parity

**Decision**: Same contracts, isolated namespace

**Alternatives Rejected**:
- Separate simulation language (maintenance burden)
- No simulation (cannot validate safely)

**Trade-off**: Discipline for reliability

### ADR-006: 5D Capability Layers

**Decision**: 5Ds are capability layers, not a pipeline; single Gear entity progressively enriched

**Alternatives Rejected**:
- Pipeline with handoffs (rebuilds system)
- Separate objects per D-state (loses continuity)

**Trade-off**: Conceptual complexity for system integrity

### ADR-007: Two-Knowledge-Base Architecture

**Decision**: Separate structured methodology KB from unstructured business context KB; AI as interpreter

**Alternatives Rejected**:
- Single unified KB (loses structure-context distinction)
- AI generates structure (violates framework-subordination)

**Trade-off**: Architectural complexity for intent alignment

### ADR-008: Bounded Autonomous Iteration (AutoML Convention)

**Decision**: Gears may run autonomous improvement loops within strictly bounded experiment cycles. Iteration is governed by: Change Traceability heuristic (prefer one parameter per experiment cycle), frozen evaluators (immutable test scenarios during iteration), output-promotion thresholds (must beat baseline to replace outputs), and hard resource bounds (max_experiments, max_duration).

**Alternatives Rejected**:
- Unbounded optimization (risk of drift, cost explosion, unattributable changes)
- Human-only iteration (too slow for real-time optimization in Deploy state)
- Separate iteration service outside GEARS (violates gear-as-contract principle)
- Iteration as an Authority concern (conflates lifecycle governance with task authority)

**Trade-off**: Autonomy within bounds for continuous improvement without unbounded risk. The Change Traceability heuristic improves attribution while still allowing legitimate multi-field updates where necessary.

### ADR-009: Engine Definition as Versioned Artifact

**Decision**: The versioned artifact in GEARS is the engine definition (hierarchy, contracts, rules, simulation assumptions, execution bindings, observability), not the canvas. Canvas representations are projections and support lightweight snapshots for undo/recovery, but the engine definition is the system-level truth.

**Alternatives Rejected**:
- Canvas as primary versioned object (loses structural, cross-D, and simulation traceability)
- No versioning distinction (conflates UI concerns with governance artifacts)

**Trade-off**: Additional state-layer complexity for clean separation of projection vs truth. Enables reproducible simulation baselines, governance-grade promotion gates, and rollback discipline without coupling to UI layout concerns.

### ADR-010: Deploy Sub-States

**Decision**: Deploy-state gears maintain a `deploy_state` field distinguishing `draft`, `candidate`, `live`, and `previous`. This enables hotfix workflow, safe rollback, promotion discipline, and production versioning without ad-hoc mechanisms.

**Alternatives Rejected**:
- Single deployed version only (no rollback or comparison)
- External deployment tracking (loses GEARS-internal governance)
- Unlimited previous versions (unbounded state growth)

**Trade-off**: Additional identity complexity for production safety. The `previous` state should be bounded (e.g., last N versions) to prevent state-layer bloat.

### ADR-011: Cross-D Promotion as Tracked Transition

**Decision**: D-state transitions (Discovery → Design → Develop → Debug → Deploy) are tracked transition events logged in the promotion registry, not ordinary edits. Each promotion records source version, target version, baseline reference, decision, decider, and reason.

**Alternatives Rejected**:
- Promotion as implicit state mutation (loses audit trail)
- Promotion as authority-only gate (conflates governance with task flow)
- No promotion tracking (cannot reconstruct cross-D lineage)

**Trade-off**: Append-only promotion log adds state-layer volume but ensures full cross-D traceability, reproducible baselines, and governance auditability.

---

## Appendix: Change History

**v4.2 → v4.3** (Current — Versioning and Promotion Doctrine):
- ✅ Elevated the engine definition to the primary versioned artifact; clarified canvas snapshots are projections, not system truth
- ✅ Added `deploy_state` to contract identity for Deploy lifecycle management (`draft|candidate|live|previous`)
- ✅ Extended experiment records with `candidate_id` to represent named bounded alternatives without breaking `gear_id` stability
- ✅ Added Baseline Registry to State Architecture with immutable baseline records and engine/simulation keying
- ✅ Added Promotion Log to State Architecture for append-only cross-D transition history
- ✅ Expanded Modeling Governance with canvas snapshot vs engine version doctrine, branching doctrine, baseline doctrine, deploy lifecycle, and generalized `d_state_promotion`
- ✅ Strengthened version structure with candidate and baseline references
- ✅ Added ADR-009 (Engine Definition as Versioned Artifact)
- ✅ Added ADR-010 (Deploy Sub-States)
- ✅ Added ADR-011 (Cross-D Promotion as Tracked Transition)
- ✅ Removed duplicated v4.2 change-history bullets

**v4.1 → v4.2** (Previous — Autonomous Improvement Convention):
- ✅ Added `iteration` block to contract schema (enabled, baseline_metric, improvement_threshold, allowed_mutations, max_experiments, max_duration)
- ✅ Added `frozen_constraints` to simulation block
- ✅ Added `forbidden_actions` to observability.safety_controls (contract schema and Observability Architecture section)
- ✅ Added "Change Traceability" Modeling Heuristic (prefer single-parameter changes per experiment cycle)
- ✅ Added "Iteration Boundedness" Contract Invariant (#9)
- ✅ Added "Bounded Autonomous Iteration" to 5D Key Characteristics (#6)
- ✅ Added "Iterative Experiment Log" to State Architecture with main and simulation namespace keying conventions
- ✅ Added Autonomous Output Promotion section in Authority Framework (output replacement, not D-state promotion)
- ✅ Added ADR-008: Bounded Autonomous Iteration (AutoML Convention)
- ✅ Updated Deploy row in 5D table to include autonomous experiment cycles

**v4.0 → v4.1** (Previous):
- ✅ Added note explaining contract schema uses simplified flat representation for runtime efficiency
- ✅ Removed "hybrid" execution type; added note that complex gears should be decomposed
- ✅ Added note under Business Examples that they represent Deploy-state hierarchies
- ✅ Restructured ADR-003 to clearly separate requirements from reference implementation

**v3.2 → v4.0**:
- ✅ Repositioned document as "Runtime / Pure Architecture (Execution-Oriented)"
- ✅ Reframed "Structure Over Intention" → "Structure makes intention computable"
- ✅ Added 5D Capability Model section
- ✅ Added explicit statement: "A Gear is a single entity progressively enriched across the 5Ds"
- ✅ Created Hard Invariants vs Modeling Heuristics distinction
- ✅ Moved milestone model (M1/M2/M3) out of pure architecture
- ✅ Softened workflow_context ADR to "reference operating assumption"
- ✅ Expanded AI role to show pervasiveness across all 5Ds
- ✅ Added Two-Knowledge-Base Model section
- ✅ Strengthened versioning doctrine with within-D and cross-D concepts
- ✅ Added high-level Co-Pilot Interaction Model section
- ✅ Removed self-scoring Quality Assessment section
- ✅ Added `d_state` field to contract schema
- ✅ Updated Contract Invariants to include D-State Tracking
- ✅ Added ADR-006 and ADR-007 for 5D and Two-KB architecture

---

**Document Version**: 4.3
**Architecture Focus**: Runtime / Pure Architecture (execution-oriented)
**Last Updated**: 2026-04-20
