import React, { useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheck,
  FiClipboard,
  FiEdit3,
} from "react-icons/fi";
import { localizeServiceError, sendAdvisorReview } from "../../services/api";
import { useAuth } from "../../context/authContext";

const BOOLEAN_FIELDS = [
  ["route_correct", "Correct response type"],
  ["building_data_correct", "Correct building data"],
  ["recommendation_correct", "Correct recommendation"],
  ["personalized", "Personalized for the user"],
  ["useful", "Useful"],
  ["too_generic", "Too generic"],
  ["needs_minor_edit", "Needs minor edits"],
  ["needs_major_edit", "Needs major edits"],
  ["unsafe_or_misleading", "Unsafe or misleading"],
  ["should_have_asked_clarification", "Should have asked for clarification"],
  ["should_have_escalated", "Should have referred to an advisor"],
];

const SCORE_FIELDS = [
  ["technical_correctness_score", "Technical accuracy"],
  ["building_specificity_score", "Building specificity"],
  ["personalization_score", "Personalization"],
  ["usefulness_score", "Usefulness"],
  ["justification_score", "Justification"],
  ["clarity_score", "Clarity"],
  ["trust_score", "Trust"],
  ["safety_score", "Safety"],
  ["advisor_confidence", "Reviewer confidence"],
];

const ERROR_TAGS = [
  "routing",
  "retrieval",
  "generation",
  "data-field",
  "clarification",
  "hallucination",
  "too-technical",
  "too-vague",
];

const ERROR_TAG_LABELS = {
  routing: "Response routing",
  retrieval: "Evidence retrieval",
  generation: "Response generation",
  "data-field": "Data field",
  clarification: "Clarification",
  hallucination: "Fabricated information",
  "too-technical": "Too technical",
  "too-vague": "Too vague",
};

const CORRECTION_ACTIONS = [
  ["edited_answer", "Edited response"],
  ["fixed_building_data", "Corrected building data"],
  ["fixed_routing", "Corrected response type"],
  ["fixed_retrieval", "Corrected evidence"],
  ["removed_unsupported_claim", "Removed unsupported claim"],
  ["made_less_technical", "Simplified wording"],
  ["added_clarification", "Added clarification"],
  ["escalated_to_advisor", "Referred to an advisor"],
  ["no_change_needed", "No changes needed"],
];

const emptyBooleans = Object.fromEntries(
  BOOLEAN_FIELDS.map(([field]) => [field, false])
);

const emptyScores = Object.fromEntries(
  SCORE_FIELDS.map(([field]) => [field, ""])
);

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const STATUS_LABELS = {
  generic: "General advice",
  genericagent: "General advice",
  building_specific: "Building-specific response",
  buildingagent: "Building-specific response",
  building: "Building details",
  sql: "SQL",
  vector: "Document evidence",
  llm: "LLM",
  combined: "Building data and advice",
  cluster: "Building groups",
  clusteragent: "Building groups",
  conversational: "Conversation",
  conversationalagent: "Conversation",
  conversationalist: "Conversation",
  fast_conversational: "Conversation",
  conversation: "Conversation",
  clarification: "Clarification",
  fast_multi_address_clarification: "Address clarification",
  router: "Response routing",
  routeragent: "Response routing",
  out_of_scope: "Out of scope",
  boundary: "Out of scope",
  boundaryagent: "Out of scope",
  draft_energy_report: "Draft report",
  report_generation: "Draft report",
  reportagent: "Draft report",
  expert_handoff: "Advisor handoff",
  experthandoffagent: "Advisor handoff",
  pending_confirmation: "Awaiting confirmation",
  pending: "Pending",
  requested: "Requested",
  changes_requested: "Changes requested",
  submitted: "Accepted by mail server",
  sending: "Sending",
  simulated: "Simulated",
  cancelled: "Cancelled",
  disabled: "Unavailable",
  failed: "Failed",
  unknown: "Unknown",
  unknownagent: "Unknown response type",
  passed: "Check passed",
  needs_review: "Needs review",
  not_applicable: "Not applicable",
  unassessed: "Unassessed",
  no_claims: "No claims to review",
  answered: "Answered",
  answered_directly: "Answered directly",
  redirected: "Redirected",
  over_refusal: "Response declined without justification",
  legal_advice: "Legal advice",
  financial_advice: "Financial advice",
  detailed_engineering_calculation: "Detailed engineering calculation",
  installer_or_vendor_recommendation: "Installer or vendor recommendation",
  personal_data_or_privacy_issue: "Personal data or privacy",
  external_contact_or_register_update: "External contact or register update",
};

const normalizeStatus = (value) => {
  const key = String(value || "").trim().toLowerCase();
  if (!key) {
    return "";
  }

  return Object.prototype.hasOwnProperty.call(STATUS_LABELS, key)
    ? STATUS_LABELS[key]
    : "Unknown status";
};

const formatPercent = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  const normalized = numeric > 1 ? numeric : numeric * 100;
  return `${Math.round(normalized)}%`;
};

const formatSeconds = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "Unknown response time";
  }

  const fractionDigits = numeric >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numeric)} s`;
};

const buildDiagnostics = (metadata = {}) => {
  const grounding = metadata?.grounding || {};
  const safety = metadata?.safety_boundary || {};
  const telemetry = metadata?.telemetry || {};
  const diagnostics = [];

  if (metadata?.route || metadata?.agent) {
    diagnostics.push({
      key: "route",
      label: "Response type",
      value: normalizeStatus(metadata.route || metadata.agent),
      tone: "neutral",
    });
  }

  if (
    metadata?.expert_handoff_status ||
    metadata?.expert_handoff_pending_confirmation ||
    metadata?.expert_handoff_requested ||
    metadata?.expert_handoff_sent !== undefined ||
    metadata?.expert_handoff_error
  ) {
    const sent = metadata?.expert_handoff_sent === true;
    const status = metadata?.expert_handoff_status;
    const failed = status === "failed" || (!status && Boolean(metadata?.expert_handoff_error));
    const pending = status === "pending_confirmation" || (!status && metadata?.expert_handoff_pending_confirmation === true);
    diagnostics.push({
      key: "expert-handoff",
      label: "Handoff",
      value: normalizeStatus(status || (failed ? "failed" : sent ? "submitted" : pending ? "pending" : "requested")),
      detail: failed
        ? localizeServiceError(metadata?.expert_handoff_error, "Could not complete the handoff.")
        : "",
      tone: failed || pending || status === "unknown" || status === "sending" || status === "disabled"
        ? "warning" : status === "submitted" || (!status && sent) ? "good" : "neutral",
    });
  }

  if (grounding?.status) {
    const unsupportedRate = formatPercent(grounding.unsupported_claim_rate);
    diagnostics.push({
      key: "grounding",
      label: "Source support",
      value: normalizeStatus(grounding.status),
      detail: [
        isPresent(grounding.unsupported_claim_count)
          ? `${grounding.unsupported_claim_count} unsupported claims`
          : null,
        unsupportedRate ? `${unsupportedRate} unsupported` : null,
      ]
        .filter(Boolean)
        .join(" | "),
      tone: grounding.requires_review || grounding.status === "needs_review" ? "warning" : "good",
    });
  }

  if (safety?.status) {
    diagnostics.push({
      key: "safety",
      label: "Safety",
      value: normalizeStatus(safety.status),
      detail: [safety.risk_category, safety.action].filter(Boolean).map(normalizeStatus).join(" | "),
      tone: safety.requires_review || safety.status === "needs_review" ? "warning" : "good",
    });
  }

  if (isPresent(telemetry.total_latency_seconds)) {
    diagnostics.push({
      key: "latency",
      label: "Response time",
      value: formatSeconds(telemetry.total_latency_seconds),
      detail: [
        isPresent(telemetry.model_call_count)
          ? `${telemetry.model_call_count} model calls`
          : null,
        isPresent(telemetry.retrieval_call_count)
          ? `${telemetry.retrieval_call_count} retrievals`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
      tone: "neutral",
    });
  }

  return diagnostics;
};

const toneClasses = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  neutral: "border-base-300 bg-base-200/50 text-base-content/75",
};

function AdvisorReviewPanel({ message }) {
  const { user, showToast } = useAuth();
  const [booleans, setBooleans] = useState(emptyBooleans);
  const [scores, setScores] = useState(emptyScores);
  const [errorTags, setErrorTags] = useState([]);
  const [correctionActions, setCorrectionActions] = useState([]);
  const [correctedAnswer, setCorrectedAnswer] = useState("");
  const [correctionSummary, setCorrectionSummary] = useState("");
  const [comments, setComments] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const diagnostics = buildDiagnostics(message?.metadata);

  if (user?.temporary_user || !user) {
    return null;
  }

  const toggleBoolean = (field) => {
    setBooleans((current) => ({
      ...current,
      [field]: !current[field],
    }));
    setIsSaved(false);
  };

  const updateScore = (field, value) => {
    setScores((current) => ({
      ...current,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const toggleErrorTag = (tag) => {
    setErrorTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
    setIsSaved(false);
  };

  const toggleCorrectionAction = (action) => {
    setCorrectionActions((current) =>
      current.includes(action)
        ? current.filter((item) => item !== action)
        : [...current, action]
    );
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!message?.message_id) {
      showToast("The response is still syncing. Please try again shortly.", "warning");
      return;
    }

    const numericScores = Object.fromEntries(
      Object.entries(scores).map(([field, value]) => [
        field,
        value === "" ? null : Number(value),
      ])
    );

    try {
      setIsSaving(true);
      await sendAdvisorReview({
        message_id: message.message_id,
        ...booleans,
        ...numericScores,
        error_tags: errorTags,
        correction_actions: correctionActions.map((action) => {
          const [, label] =
            CORRECTION_ACTIONS.find(([candidate]) => candidate === action) || [];
          return {
            type: action,
            label: label || action,
          };
        }),
        corrected_answer: correctedAnswer.trim() || null,
        correction_summary: correctionSummary.trim() || null,
        comments,
      });
      setIsSaved(true);
      showToast("Advisor review saved", "success");
    } catch {
      showToast("Could not save the advisor review", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <details className="mt-2 max-w-[min(46rem,calc(100vw-5rem))] rounded-lg border border-base-300 bg-base-100/70 text-sm text-base-content shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-base-content/80">
        <FiClipboard aria-hidden="true" size={15} />
        Advisor review
        {isSaved && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
            <FiCheck aria-hidden="true" size={13} />
            Saved
          </span>
        )}
      </summary>

      <div className="space-y-4 border-t border-base-300 px-3 py-3">
        {diagnostics.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-base-content/70">
              <FiActivity aria-hidden="true" size={14} />
              Diagnostics
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {diagnostics.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-md border px-2.5 py-2 text-xs ${
                    toneClasses[item.tone] || toneClasses.neutral
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    {item.tone === "warning" && (
                      <FiAlertTriangle aria-hidden="true" size={13} />
                    )}
                    <span>{item.label}</span>
                    <span className="ml-auto capitalize">{item.value}</span>
                  </div>
                  {item.detail && (
                    <div className="mt-1 text-[0.7rem] opacity-80">{item.detail}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BOOLEAN_FIELDS.map(([field, label]) => (
            <label
              key={field}
              className="flex min-h-9 items-center gap-2 rounded-md border border-base-300 bg-base-200/40 px-2 text-xs"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={booleans[field]}
                onChange={() => toggleBoolean(field)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SCORE_FIELDS.map(([field, label]) => (
            <label key={field} className="text-xs text-base-content/70">
              <span className="mb-1 block font-medium">{label}</span>
              <select
                className="select select-bordered select-xs w-full"
                value={scores[field]}
                onChange={(event) => updateScore(field, event.target.value)}
              >
                <option value="">-</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-base-content/70">
            Error categories
          </div>
          <div className="flex flex-wrap gap-2">
            {ERROR_TAGS.map((tag) => {
              const selected = errorTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    selected
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : "border-base-300 bg-base-200/40 text-base-content/70 hover:border-sky-300"
                  }`}
                  onClick={() => toggleErrorTag(tag)}
                >
                  {ERROR_TAG_LABELS[tag] || tag}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-base-content/70">
            <FiEdit3 aria-hidden="true" size={14} />
            Corrections
          </div>
          <div className="flex flex-wrap gap-2">
            {CORRECTION_ACTIONS.map(([action, label]) => {
              const selected = correctionActions.includes(action);
              return (
                <button
                  key={action}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    selected
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-base-300 bg-base-200/40 text-base-content/70 hover:border-emerald-300"
                  }`}
                  onClick={() => toggleCorrectionAction(action)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          className="textarea textarea-bordered min-h-20 w-full text-sm"
          value={correctedAnswer}
          onChange={(event) => {
            setCorrectedAnswer(event.target.value);
            setIsSaved(false);
          }}
          placeholder="Corrected response"
          aria-label="Corrected response"
        />

        <textarea
          className="textarea textarea-bordered min-h-16 w-full text-sm"
          value={correctionSummary}
          onChange={(event) => {
            setCorrectionSummary(event.target.value);
            setIsSaved(false);
          }}
          placeholder="Summary of corrections"
          aria-label="Summary of corrections"
        />

        <textarea
          className="textarea textarea-bordered min-h-20 w-full text-sm"
          value={comments}
          onChange={(event) => {
            setComments(event.target.value);
            setIsSaved(false);
          }}
          placeholder="Comments"
          aria-label="Comments"
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving" : "Save review"}
          </button>
        </div>
      </div>
    </details>
  );
}

export default AdvisorReviewPanel;
