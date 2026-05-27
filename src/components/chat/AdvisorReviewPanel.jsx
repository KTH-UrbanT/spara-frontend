import React, { useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheck,
  FiClipboard,
  FiEdit3,
} from "react-icons/fi";
import { sendAdvisorReview } from "../../services/api";
import { useAuth } from "../../context/authContext";

const BOOLEAN_FIELDS = [
  ["route_correct", "Route correct"],
  ["building_data_correct", "Building data correct"],
  ["recommendation_correct", "Recommendation correct"],
  ["personalized", "Personalized"],
  ["useful", "Useful"],
  ["too_generic", "Too generic"],
  ["needs_minor_edit", "Minor edit"],
  ["needs_major_edit", "Major edit"],
  ["unsafe_or_misleading", "Unsafe or misleading"],
  ["should_have_asked_clarification", "Should clarify"],
  ["should_have_escalated", "Should escalate"],
];

const SCORE_FIELDS = [
  ["technical_correctness_score", "Technical"],
  ["building_specificity_score", "Building fit"],
  ["personalization_score", "Personalization"],
  ["usefulness_score", "Usefulness"],
  ["justification_score", "Justification"],
  ["clarity_score", "Clarity"],
  ["trust_score", "Trust"],
  ["safety_score", "Safety"],
  ["advisor_confidence", "Confidence"],
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

const CORRECTION_ACTIONS = [
  ["edited_answer", "Edited answer"],
  ["fixed_building_data", "Fixed building data"],
  ["fixed_routing", "Fixed route"],
  ["fixed_retrieval", "Fixed evidence"],
  ["removed_unsupported_claim", "Removed unsupported claim"],
  ["made_less_technical", "Simplified wording"],
  ["added_clarification", "Added clarification"],
  ["escalated_to_advisor", "Escalated"],
  ["no_change_needed", "No change"],
];

const emptyBooleans = Object.fromEntries(
  BOOLEAN_FIELDS.map(([field]) => [field, false])
);

const emptyScores = Object.fromEntries(
  SCORE_FIELDS.map(([field]) => [field, ""])
);

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const normalizeStatus = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .trim();

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
    return String(value);
  }

  return `${numeric.toFixed(numeric >= 10 ? 0 : 1)}s`;
};

const buildDiagnostics = (metadata = {}) => {
  const grounding = metadata?.grounding || {};
  const safety = metadata?.safety_boundary || {};
  const telemetry = metadata?.telemetry || {};
  const diagnostics = [];

  if (metadata?.route || metadata?.agent) {
    diagnostics.push({
      key: "route",
      label: "Route",
      value: metadata.route || metadata.agent,
      tone: "neutral",
    });
  }

  if (
    metadata?.expert_handoff_pending_confirmation ||
    metadata?.expert_handoff_requested ||
    metadata?.expert_handoff_sent !== undefined ||
    metadata?.expert_handoff_error
  ) {
    const sent = metadata?.expert_handoff_sent === true;
    const failed = Boolean(metadata?.expert_handoff_error);
    const pending = metadata?.expert_handoff_pending_confirmation === true;
    diagnostics.push({
      key: "expert-handoff",
      label: "Handoff",
      value: failed ? "failed" : sent ? "sent" : pending ? "pending" : "requested",
      detail: metadata?.expert_handoff_error || "",
      tone: failed || pending ? "warning" : "good",
    });
  }

  if (grounding?.status) {
    const unsupportedRate = formatPercent(grounding.unsupported_claim_rate);
    diagnostics.push({
      key: "grounding",
      label: "Grounding",
      value: normalizeStatus(grounding.status),
      detail: [
        isPresent(grounding.unsupported_claim_count)
          ? `${grounding.unsupported_claim_count} unsupported`
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
      detail: [safety.risk_category, safety.action].filter(Boolean).join(" | "),
      tone: safety.requires_review || safety.status === "needs_review" ? "warning" : "good",
    });
  }

  if (isPresent(telemetry.total_latency_seconds)) {
    diagnostics.push({
      key: "latency",
      label: "Latency",
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
      showToast("This answer is still syncing. Try again in a moment.", "warning");
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
      showToast("Failed to save advisor review", "error");
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
            Error tags
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
                  {tag}
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
          placeholder="Corrected answer"
        />

        <textarea
          className="textarea textarea-bordered min-h-16 w-full text-sm"
          value={correctionSummary}
          onChange={(event) => {
            setCorrectionSummary(event.target.value);
            setIsSaved(false);
          }}
          placeholder="Correction summary"
        />

        <textarea
          className="textarea textarea-bordered min-h-20 w-full text-sm"
          value={comments}
          onChange={(event) => {
            setComments(event.target.value);
            setIsSaved(false);
          }}
          placeholder="Comments"
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
