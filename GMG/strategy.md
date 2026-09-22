# PMG Compliance AI — Proposed Final Strategy

**Canonical machine-readable strategy for Kiro and PMG implementation**

Human review version: https://gkim.digital/GMG/

This document is intentionally available without the client-side password used on the human review page.

## 1. Purpose

The AI Patient Support Specialist / Patient Care Coordinator is an independent patient-admission and compliance control between Marketing Groups and Precision Medical Group's clinical workflow.

It verifies identity, patient understanding, voluntary intent, acquisition provenance and administrative care-entry eligibility. It does **not** diagnose, determine medical necessity, select a laboratory, approve insurance coverage, determine eligibility for a test or treatment, or determine entitlement to a reimbursable service.

Core principle:

> Marketing Groups create informed interest. The AI PSS establishes informed care entry. PMG clinicians determine medical necessity.

## 2. Operating model

Marketing Group → AI PSS / PCC → PMG Clinician → Care / Laboratory

- **Marketing Group:** awareness and approved education.
- **AI PSS / PCC:** identity, PMG awareness, voluntary intent, acquisition compliance and administrative care-entry control.
- **PMG clinician:** independent assessment of the issue that brought the patient to PMG and independent decisions about diagnosis, treatment, testing and follow-up.
- **Care / laboratory:** downstream only when clinically appropriate.

A PSS CLEAR means only that the patient may enter PMG's clinical workflow. It does not mean the patient qualifies for a test, treatment, prescription, AWV, insurance benefit or laboratory service.

## 3. Four hard gates

1. **Identity**
   - Establish that the caller is the patient or an appropriately authorised representative.
   - Prefer match-don't-fetch verification.
   - Do not unnecessarily voice stored identity values back to the caller.

2. **Purpose & Voluntary Intent**
   - Establish that the patient knowingly and voluntarily wants to speak with a PMG clinician.
   - Require affirmative intent; silence or mere non-objection does not pass.
   - Ask the patient in their own words what they expect PMG to help with today.

3. **Acquisition Attestation**
   - Establish how the patient came to PMG and what they were told.
   - Test for inducements, false affiliation or impersonation, predetermined care, coverage promises, coaching and MG interference.
   - Preserve the patient's unaided account before corrective education.

4. **Care-Entry Eligibility**
   - Administrative/non-clinical prerequisites only.
   - May include location/state, authority/age where applicable, service availability, telehealth capability and required administrative information.
   - Must never determine medical necessity, test eligibility, treatment eligibility, AWV entitlement, insurance coverage or entitlement to reimbursement.

## 4. Mandatory education and understanding

These are required understanding checks, not additional hard gates.

The patient should understand:

- the practice is **Precision Medical Group (PMG)**;
- PMG is independent of the Marketing Group;
- PMG may complement and, where appropriate and authorised, collaborate with an existing bricks-and-mortar PCP rather than automatically replace that PCP;
- the PMG clinician independently decides diagnosis, testing, treatment and follow-up;
- no diagnosis, test, treatment, prescription, AWV, laboratory or insurance outcome is guaranteed;
- ongoing longitudinal PMG primary care is optional and need not be chosen today;
- declining ongoing PMG care does not affect today's medical assessment.

Use the pattern:

**Ask unaided → record original answer → assess → educate if appropriate → reverify**

Corrective education must never overwrite the original response or erase evidence about the acquisition event.

## 5. Ask once, verify once, reuse everywhere

The AI PSS and legacy EHR should share state.

If DOB, address, callback permission, communication preference or another fact has already been reliably verified, do not ask the patient again merely because another workflow contains the same field.

If the PSS establishes a verified fact, it should populate or expose that state to the EHR so the EHR does not repeat the question.

Fresh consent or reverification should occur only where applicable law, approved policy or patient safety requires it.

## 6. Additional operational interactions retained from the legacy EHR

| Interaction | Treatment |
|---|---|
| Consent to today's telehealth encounter | KEEP / MERGE into Purpose & Voluntary Intent; remove genetics-specific wording |
| Name, DOB, address | VERIFY ONCE as part of Identity |
| Permission to call back if disconnected | KEEP; operationally important |
| Patient vs authorised representative | KEEP / REWRITE; establish who is acting, not an AI diagnosis of capacity |
| Facility / hospice status | CONDITIONAL where PMG policy says it changes care-entry or routing |
| Audio/video preference | OPERATIONAL visit-modality field, not acquisition compliance |
| SMS/email/voice reminders | COMBINE into communication preferences outside admission gating |
| Future health-services contact | OPTIONAL / SEPARATE; refusal must never prejudice today's care |
| Insurance billing consent | Administrative/financial workflow, not a PSS hard gate |

## 7. Acquisition Attestation — recommended conversational design

Begin open-ended:

> “Before we continue, tell me how you first heard about Precision Medical Group and what you were told about the care you could receive.”

Capture the response substantially verbatim before corrective education.

If the open-ended answer has not already resolved them, targeted checks may include:

> “Did anyone offer you money, a gift, reward or anything else of value for speaking with PMG or receiving healthcare?”

> “Did anyone say or suggest that they worked for Medicare, your insurance company, Precision Medical Group, your doctor, a laboratory or another healthcare organisation? If so, who did they say they represented?”

Also assess:

- predetermined tests, treatments or prescriptions;
- promises of Medicare or insurance coverage;
- promises of zero out-of-pocket cost;
- promises of a specific laboratory;
- statements that the patient already “qualifies” for a service;
- pressure to enrol in longitudinal care;
- coaching about how to answer PSS questions;
- MG answering for, prompting or materially interrupting the patient.

A RED signal is evidence, not automatically a patient DECLINE. The approved severity policy determines the consequence.

## 8. MG conduct during PSS questioning

The AI controls the compliance portion of the call.

Questions directed to the patient must be answered by the patient.

If the MG answers, prompts, coaches or materially interrupts:

1. instruct the MG not to intervene;
2. repeat the question to the patient;
3. preserve the event;
4. classify repeated or substantive interference as an MG compliance event;
5. apply the approved RED-rule severity policy to determine whether Acquisition Attestation remains satisfiable.

MGs receive the standards, RED/BLUE rules and required educational outcomes. They should not receive exact gate logic, scoring thresholds, trigger phrases or required answers.

## 9. Patient admission and MG compliance are independent

Canonical rule:

> An MG compliance failure does not automatically determine patient admission. The applicable RED-rule policy must separately define whether the underlying conduct (a) is recordable but does not invalidate informed care entry, or (b) prevents the Purpose & Voluntary Intent or Acquisition Attestation gate from being satisfied and therefore requires DECLINE.

Severity classes:

1. **Innocent misunderstanding / education gap**
   - educate;
   - reverify;
   - patient may CLEAR;
   - MG observation/warning as policy requires.

2. **RED breach that does not invalidate voluntary care entry**
   - patient may still CLEAR once independently informed, subject to approved policy;
   - record MG compliance failure.

3. **RED breach that undermines knowing or voluntary acquisition**
   - hard gate cannot be satisfied;
   - patient DECLINE;
   - material MG compliance failure.

The runtime AI must not invent severity. The recordable-versus-admission-invalidating matrix must be expressly approved by PMG compliance/qualified healthcare counsel and encoded as policy.

## 10. Machine state and outputs

```
PATIENT_ADMISSION_STATUS = CLEAR | DECLINE

PATIENT_WORKFLOW_STATE = CHECKING | HOLD | COMPLETE

MG_COMPLIANCE_EVENT = NONE | WARNING | MATERIAL_FAILURE

CLINICAL_ROUTING = NORMAL | URGENT | EMERGENCY
```

These are independent dimensions.

**HOLD is transient only.** There is no human REVIEW disposition. HOLD exists while the AI performs permitted authentication, education or reverification during the same interaction and must ultimately resolve to CLEAR or DECLINE.

Urgent or emergency clinical routing is not a compliance DECLINE.

## 11. Suggested structured understanding fields

```
PRACTICE_NAME_AWARENESS =
  UNAIDED_CORRECT | AIDED_CORRECT | NOT_UNDERSTOOD

EXPECTED_PURPOSE_OF_CALL =
  <patient substantially verbatim response>

EXISTING_PCP =
  YES | NO | UNKNOWN

PMG_RELATIONSHIP_UNDERSTOOD =
  COMPLEMENTARY | REPLACEMENT_EXPECTED | UNCLEAR

TODAY_CARE_EXPECTATION =
  APPROPRIATE | PREDETERMINED_TEST | PREDETERMINED_TREATMENT |
  INSURANCE_DRIVEN | UNCLEAR

LONGITUDINAL_OPTION_EXPLAINED =
  YES | NO

LONGITUDINAL_CARE_INTEREST =
  YES | NO | UNDECIDED | NOT_ASKED

LONGITUDINAL_CARE_PRESSURE =
  NONE | POSSIBLE | REPORTED

SOURCE_OF_MISUNDERSTANDING =
  MG | PATIENT_ASSUMPTION | OTHER | UNKNOWN

UNAIDED_RESPONSE_PRESERVED =
  YES | NO
```

Additional acquisition fields should represent provenance, inducement, claimed affiliation/impersonation, coverage promises, predetermined care, coaching and MG interference.

## 12. BLUE rules for Marketing Groups

Marketing Groups may:

- identify the medical practice as Precision Medical Group;
- explain PMG is independent from the MG;
- accurately explain the general healthcare service using approved materials;
- explain PMG may complement/collaborate with an existing PCP;
- explain today's encounter is to assess the issue that brought the patient to PMG;
- explain diagnosis, treatment, testing and follow-up occur only if clinically appropriate after independent PMG assessment;
- explain optional longitudinal primary care;
- confirm the patient voluntarily wants to speak with PMG;
- explain that no diagnosis, test, treatment, prescription or insurance outcome is guaranteed.

## 13. RED rules for Marketing Groups

Marketing Groups must not:

- tell the patient they “qualify” for a test or service;
- guarantee Medicare/insurance coverage or zero out-of-pocket cost;
- tell the patient what the clinician will diagnose, prescribe or order;
- give clinical advice or determine medical necessity;
- imply PMG automatically replaces the patient's existing PCP;
- represent PMG as already being the patient's PCP merely because today's encounter was accepted;
- pressure the patient to enrol in longitudinal care or imply enrolment affects today's care;
- promise a specific laboratory;
- coach the patient on how to answer the PSS;
- answer PSS questions for the patient;
- fabricate patient intent;
- offer prohibited inducements;
- falsely claim affiliation with Medicare, an insurer, PMG, the patient's doctor, a laboratory or another healthcare organisation.

## 14. AWV

Annual Wellness Visit questions belong in an AWV eligibility/pre-visit workflow, not generic PSS acquisition compliance.

Generic PSS language:

> “The PMG clinician will assess your individual circumstances and determine what care is appropriate.”

Do not tell a patient they “qualify for” or “will receive” an AWV before the appropriate criteria are established.

Where an AWV-specific campaign legitimately exists, conditional AWV language may be used only under the approved campaign policy.

## 15. Longitudinal care

Recommended semantic wording:

> “Precision Medical Group also offers ongoing primary care if you would like continued support after today's issue. You do not need to decide about that now, and choosing not to receive ongoing care will not affect today's medical assessment.”

Conversational variation is acceptable if this meaning is preserved.

Suggested fields:

```
LONGITUDINAL_OPTION_EXPLAINED
LONGITUDINAL_CARE_INTEREST
LONGITUDINAL_CARE_PRESSURE
SOURCE_OF_MISUNDERSTANDING
```

If the patient believes ongoing enrolment is required, establish the source, preserve the original explanation, provide corrective education and create the appropriate compliance event.

## 16. Legacy-question disposition

| Legacy item | Decision | Destination |
|---|---|---|
| Telehealth-provider consent | KEEP / GENERALISE | Purpose & Voluntary Intent |
| Name, DOB, address | KEEP / DEDUPLICATE | Identity / shared EHR state |
| Callback permission | KEEP | Operational callback workflow |
| Own medical decisions | REWRITE | Patient vs authorised representative |
| Provider billing insurance | MOVE | Administrative/financial consent |
| Hospice/nursing home/care facility | CONDITIONAL | Care-entry/routing if policy requires |
| Prior genetic screening | DROP | Genetics-specific clinical history |
| Money/incentive for genetic test | KEEP / GENERALISE | Acquisition Attestation |
| Sales agent represented as Medicare | KEEP / BROADEN | Acquisition Attestation |
| Prior Medicare wellness visit | MOVE | AWV workflow |
| Wellness visit in past year | MOVE | AWV workflow |
| Future health-services contact | KEEP SEPARATE / OPTIONAL | Communications preference |
| Confirm all above true/accurate | DROP | Individual verification is stronger |
| SMS/email/voice notifications | COMBINE | Communications preference |
| Video/audio-only and reason | CONDITIONAL | Visit modality |

## 17. Canonical policy across channels

The same RED/BLUE source of truth should govern:

- MG human conversations;
- MG AI;
- PMG outbound AI;
- PMG inbound AI PSS;
- SMS;
- landing pages;
- prerecorded messages;
- other pre-clinical patient communications.

Roles and channels may have different permissions, but factual and compliance rules must remain canonical.

Outbound objection handling, cost/coverage reassurance and urgency language should be audited so outbound engagement does not teach expectations that inbound compliance later treats as suspicious.

## 18. Implementation direction for Kiro

Kiro should implement the PSS as a stateful policy engine and conversational workflow, not as a transcription of the legacy questionnaire.

Priorities:

1. canonical typed state for the four gates and independent outputs;
2. EHR read/write reconciliation so verified facts are not repeated;
3. preservation of unaided patient statements;
4. explicit provenance and acquisition-event model;
5. RED/BLUE policy objects separated from conversational wording;
6. counsel-approved RED severity mapping separated from model inference;
7. deterministic terminal disposition logic;
8. in-call HOLD/remediation loop;
9. MG-interference detection and evidence capture;
10. separate clinical urgency routing;
11. audit trail linking source statements, corrections, policy decisions and final outputs;
12. one policy source consumed by inbound and outbound patient-facing systems.

## 19. Matters for team decision before production

The team should explicitly agree:

- the final RED-rule severity matrix;
- which administrative inputs are genuinely required for Care-Entry Eligibility;
- which state-specific telehealth consent rules must be represented;
- the authoritative EHR/source for each shared patient field;
- the exact identity verification/match policy;
- the rules for authorised representatives;
- whether and when facility status changes routing;
- communication-consent handling;
- AWV-specific workflow and campaign boundaries;
- retention, audit and access-control requirements;
- which MG compliance events trigger warnings, suspension, investigation or other governance action.

---

**Status:** Proposed shared operating model for Kiro, PMG operations, compliance and clinical review. Final legal/compliance thresholds and applicable federal/state requirements require approval by qualified healthcare counsel.
