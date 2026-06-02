import React from "react";
import ReactMarkdown from "react-markdown";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiHome,
  FiSend,
} from "react-icons/fi";
import AdvisorReviewPanel from "./AdvisorReviewPanel";
import RatePanel from "./RatePanel";
import { downloadDraftReport } from "../../services/api";
import { useAuth } from "../../context/authContext";

const MARKDOWN_LIST_PREFIX = /^(\s*[-*+]|\s*\d+\.)\s+/;
const LABEL_VALUE_LINE = /^([^:\n]{3,90}):\s+(.+)$/;
const SOURCE_REFERENCE_PATTERN =
  /\s*(?:\((?:source|sources):\s*([^)]+)\)|\[(?:source|sources):\s*([^\]]+)\])/gi;
const BARE_PARENTHESES_PATTERN = /\s*\(([^()]{3,180})\)/g;
const UNICODE_BULLET_PATTERN = /^(\s*)[•●▪◦]\s+(.+)$/;
const DASH_BULLET_PATTERN = /^(\s*)[–—]\s+(.+)$/;
const NUMBERED_LIST_VARIANT_PATTERN =
  /^(\s*)(\d{1,3})\s*(?:[),:;]|[-–—])\s+(.+)$/;
const SPACED_ORDERED_LIST_PATTERN = /^(\s*)(\d{1,3})\s*\.\s+(.+)$/;
const ORDERED_LIST_LINE_PATTERN = /^(\s*)(\d{1,3})\.\s+(.+)$/;
const UNORDERED_LIST_LINE_PATTERN = /^(\s*)[-*+]\s+(.+)$/;

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isExpertHandoffMessage = (message, content) => {
  const metadata = message?.metadata || {};
  const route = normalizeText(metadata.route || metadata.classification || metadata.agent);
  const text = normalizeText(content);

  return (
    metadata.expert_handoff_triggered === true ||
    route.includes("expert handoff") ||
    text.includes("email was sent successfully to the ekr expert") ||
    text.includes("i can email this conversation") ||
    text.includes("do you want me to send it")
  );
};

const getExpertHandoffStatus = (message, content) => {
  const metadata = message?.metadata || {};
  const text = normalizeText(content);

  if (metadata.expert_handoff_error || text.includes("could not send the email")) {
    return {
      tone: "error",
      label: "Expert handoff failed",
      detail: "The email was not sent. Please try again later.",
      icon: FiAlertTriangle,
    };
  }

  if (metadata.expert_handoff_sent === true || text.includes("email was sent successfully")) {
    return {
      tone: "success",
      label: "Expert handoff sent",
      detail: metadata.user_email ? "The expert was emailed and the user was CCed." : "The expert was emailed.",
      icon: FiCheckCircle,
    };
  }

  if (metadata.expert_handoff_simulated === true || text.includes("no real email was sent")) {
    return {
      tone: "info",
      label: "Expert handoff simulated",
      detail: "Evaluation mode is active, so no email was sent.",
      icon: FiSend,
    };
  }

  if (
    metadata.expert_handoff_pending_confirmation === true ||
    text.includes("do you want me to send it")
  ) {
    return {
      tone: "pending",
      label: "Expert handoff pending",
      detail: "Waiting for the user to confirm before sending.",
      icon: FiClock,
    };
  }

  return null;
};

const getSourceTitle = (source) => {
  const value = (
    source?.title ||
    source?.name ||
    source?.filename ||
    source?.source ||
    ""
  ).trim();
  if (!value) {
    return "Source";
  }

  const parts = value.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] || value;
};

const normalizeSource = (source) => {
  if (!source) {
    return null;
  }

  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) {
      return null;
    }
    return {
      title: getSourceTitle({ filename: trimmed }),
      filename: trimmed,
      link: /^https?:\/\//i.test(trimmed) ? trimmed : "",
    };
  }

  const link = String(source.link || source.url || "").trim();
  const title = getSourceTitle(source);
  const filename = String(source.filename || source.source || source.name || title).trim();

  if (!link && !title && !filename) {
    return null;
  }

  return {
    ...source,
    title,
    filename,
    link,
  };
};

const getMessageSources = (message) => {
  const directSources = Array.isArray(message?.sources) ? message.sources : [];
  const vectorSources = Array.isArray(message?.metadata?.vector_sources)
    ? message.metadata.vector_sources
    : [];
  const allSources = [...directSources, ...vectorSources]
    .map(normalizeSource)
    .filter(Boolean);
  const seen = new Set();

  return allSources.filter((source) => {
    const key = normalizeText(source.link || source.filename || source.title);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const sourceMatchesMention = (source, mention) => {
  const mentions = splitSourceMentions(mention);
  if (mentions.length === 0) {
    return false;
  }

  const aliases = [source.title, source.filename, source.name, source.source]
    .map(normalizeText)
    .filter(Boolean)
    .flatMap((candidate) => [
      candidate,
      candidate.replace(/\b(?:pdf|docx|xlsx|csv|json|txt)\b/g, "").trim(),
    ])
    .filter(Boolean);

  return mentions.some((mentionCandidate) =>
    aliases.some(
      (alias) =>
        alias.includes(mentionCandidate) || mentionCandidate.includes(alias)
    )
  );
};

const splitSourceMentions = (mention) => {
  const cleaned = String(mention || "")
    .replace(/^(?:source|sources):/i, "")
    .trim();

  if (!cleaned) {
    return [];
  }

  const parts = cleaned
    .split(/\s*(?:;|\||\+|\band\b)\s*/i)
    .flatMap((part) => part.split(/\s*,\s*(?=[A-ZÅÄÖa-zåäö0-9])/))
    .map(normalizeText)
    .filter(Boolean);

  const all = [normalizeText(cleaned), ...parts].filter(Boolean);
  return [...new Set(all)];
};

const buildCitationLinks = (citationIndexes, anchorPrefix) =>
  citationIndexes
    .map((citationIndex) => `[${citationIndex}](#${anchorPrefix}-${citationIndex})`)
    .join("");

const citationIndexesForMention = (sources, mention) =>
  sources
    .map((source, index) =>
      sourceMatchesMention(source, mention) ? index + 1 : null
    )
    .filter(Boolean);

const appendFallbackCitationMarkers = (content, sources, anchorPrefix) => {
  if (
    typeof content !== "string" ||
    sources.length === 0 ||
    content.includes(`](#${anchorPrefix}-`)
  ) {
    return content;
  }

  const markers = buildCitationLinks(
    sources.map((_, index) => index + 1),
    anchorPrefix
  );
  const lines = content.split("\n");

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim()) {
      lines[index] = `${lines[index]} ${markers}`;
      return lines.join("\n");
    }
  }

  return `${content}${markers}`;
};

const addCitationMarkers = (content, sources, anchorPrefix) => {
  if (typeof content !== "string" || sources.length === 0) {
    return content;
  }

  let withExplicitMarkers = content.replace(
    SOURCE_REFERENCE_PATTERN,
    (fullMatch, rawSourcesFromParens, rawSourcesFromBrackets) => {
      const rawSources = rawSourcesFromParens || rawSourcesFromBrackets;
      const citationIndexes = citationIndexesForMention(sources, rawSources);

      if (citationIndexes.length === 0) {
        return fullMatch;
      }

      return buildCitationLinks(citationIndexes, anchorPrefix);
    }
  );

  withExplicitMarkers = withExplicitMarkers.replace(
    BARE_PARENTHESES_PATTERN,
    (fullMatch, rawSources) => {
      const citationIndexes = citationIndexesForMention(sources, rawSources);

      if (citationIndexes.length === 0) {
        return fullMatch;
      }

      return buildCitationLinks(citationIndexes, anchorPrefix);
    }
  );

  return appendFallbackCitationMarkers(withExplicitMarkers, sources, anchorPrefix);
};

const getField = (facts, keys) => {
  if (!facts || typeof facts !== "object") {
    return null;
  }

  const lowered = Object.fromEntries(
    Object.keys(facts).map((key) => [key.toLowerCase(), key])
  );

  for (const key of keys) {
    const originalKey = lowered[key.toLowerCase()];
    if (originalKey && isPresent(facts[originalKey])) {
      return facts[originalKey];
    }
  }

  return null;
};

const formatFactValue = (value, suffix = "") => {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return `${new Intl.NumberFormat("sv-SE").format(value)}${suffix}`;
  }
  const text = String(value).trim();
  if (!suffix || normalizeText(text).includes(normalizeText(suffix))) {
    return text;
  }
  return `${text}${suffix}`;
};

const buildBuildingContext = (metadata) => {
  const facts = metadata?.retrieved_facts || {};
  const buildingMatch = metadata?.building_match || {};
  const address =
    metadata?.requested_address ||
    getField(facts, ["address", "official_address", "address_from_user", "epc_idadr"]) ||
    buildingMatch.matched_address ||
    buildingMatch.input_address;
  const epcRecordAddress =
    metadata?.epc_record_address ||
    (metadata?.same_building_multiple_addresses ? getField(facts, ["epc_idadr", "official_address"]) : null);
  const buildingName = getField(facts, ["brf_name", "building_name", "buildingName"]);
  const buildingId =
    metadata?.building_id ||
    buildingMatch.building_id ||
    getField(facts, ["building_id", "byggnadsid", "50a_uuid", "uuid", "oden_uuid"]);

  const details = [
    ...(isPresent(epcRecordAddress) && normalizeText(epcRecordAddress) !== normalizeText(address)
      ? [
          {
            label: "EPC record address",
            value: epcRecordAddress,
          },
        ]
      : []),
    {
      label: "Year",
      value: formatFactValue(
        getField(facts, [
          "construction_year",
          "building_year",
          "year_built",
          "built_year",
          "byggnadsar",
          "byggnadsår",
        ])
      ),
    },
    {
      label: "Area",
      value: formatFactValue(
        getField(facts, [
          "netAreaHeated",
          "netAreaResidential",
          "epc_egenatemp",
          "atemp",
          "Atemp",
          "heated_area",
          "total_heated_area",
        ]),
        " m2"
      ),
    },
    {
      label: "Energy class",
      value: formatFactValue(
        getField(facts, [
          "epc_egienergiklass2020_calc",
          "declaredEnergyClass",
          "energy_class",
          "energy_label",
          "energiklass",
          "epc_egienergiklass",
        ])
      ),
    },
    {
      label: "Energy performance",
      value: formatFactValue(
        getField(facts, [
          "energy_performance",
          "epc_egienergiprestanda",
          "EnergyClassKwhM2",
        ]),
        " kWh/m2"
      ),
    },
    {
      label: "Specific energy use",
      value: formatFactValue(
        getField(facts, [
          "specific_energy_use",
          "epc_egispecifikenergianvandning",
          "epc_egispecifikenergianvandning_calc",
          "epc_egispecifikenergianvandning_eindex_calc",
        ]),
        " kWh/m2"
      ),
    },
    {
      label: "Primary energy number",
      value: formatFactValue(
        getField(facts, [
          "primary_energy_number",
          "primary_energy",
          "epc_egiprimarenergital2020_calc",
          "epc_egiprimarenergital2020",
          "epc_egiprimarenergital2019",
          "epc_egiprimarenergital",
        ]),
        " kWh/m2"
      ),
    },
  ].filter((item) => isPresent(item.value));

  if (!address && !buildingName && !buildingId && details.length === 0) {
    return null;
  }

  return {
    address,
    buildingName,
    buildingId,
    details,
  };
};

const isLikelyLabelValueLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || MARKDOWN_LIST_PREFIX.test(trimmed) || trimmed.includes("http")) {
    return false;
  }

  const match = trimmed.match(LABEL_VALUE_LINE);
  if (!match) {
    return false;
  }

  const label = match[1].trim();
  if (/^(note|warning|caution)$/i.test(label)) {
    return false;
  }

  return /^[A-ZÅÄÖ]/.test(label) && label.split(/\s+/).length <= 14;
};

const formatAssistantMessage = (content) => {
  if (typeof content !== "string") {
    return content;
  }

  const normalizedLines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(UNICODE_BULLET_PATTERN, "$1- $2")
        .replace(DASH_BULLET_PATTERN, "$1- $2")
        .replace(SPACED_ORDERED_LIST_PATTERN, "$1$2. $3")
        .replace(NUMBERED_LIST_VARIANT_PATTERN, "$1$2. $3")
        .trimEnd()
    );
  const lines = [];
  let activeOrderedList = null;

  normalizedLines.forEach((line) => {
    const orderedMatch = line.match(ORDERED_LIST_LINE_PATTERN);
    const unorderedMatch = line.match(UNORDERED_LIST_LINE_PATTERN);
    const trimmed = line.trim();

    if (orderedMatch) {
      const markerIndent = orderedMatch[1].length;
      activeOrderedList = {
        markerIndent,
        nestedIndent: markerIndent + orderedMatch[2].length + 2,
      };
      lines.push(line);
      return;
    }

    if (unorderedMatch && activeOrderedList !== null) {
      const bulletIndent = unorderedMatch[1].length;

      if (bulletIndent <= activeOrderedList.markerIndent + 1) {
        lines.push(`${" ".repeat(activeOrderedList.nestedIndent)}- ${unorderedMatch[2]}`);
        return;
      }
    }

    if (trimmed && !unorderedMatch) {
      activeOrderedList = null;
    }

    lines.push(line);
  });

  const formatted = [];

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index];
    const trimmed = currentLine.trim();

    if (!trimmed) {
      formatted.push("");
      continue;
    }

    if (MARKDOWN_LIST_PREFIX.test(currentLine)) {
      formatted.push(currentLine);
      continue;
    }

    if (isLikelyLabelValueLine(trimmed)) {
      const [, label, value] = trimmed.match(LABEL_VALUE_LINE);
      formatted.push(`- **${label.trim()}:** ${value.trim()}`);
      continue;
    }

    if (trimmed.endsWith(":")) {
      let cursor = index + 1;
      const blockLines = [];

      while (cursor < lines.length && lines[cursor].trim()) {
        blockLines.push(lines[cursor].trim());
        cursor += 1;
      }

      const shouldFormatAsList =
        blockLines.length >= 2 &&
        blockLines.every(
          (line) => !MARKDOWN_LIST_PREFIX.test(line) && !isLikelyLabelValueLine(line)
        );

      formatted.push(currentLine);

      if (shouldFormatAsList) {
        blockLines.forEach((line) => {
          formatted.push(`- ${line}`);
        });
        index = cursor - 1;
      }

      continue;
    }

    formatted.push(currentLine);
  }

  return formatted.join("\n");
};

const markdownComponents = {
  p: ({ children }) => <p className="my-2 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-5 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children, start }) => (
    <ol
      start={start}
      className="my-2 list-decimal space-y-2 pl-5 marker:font-semibold"
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-inherit">{children}</strong>
  ),
  a: ({ href, children }) => {
    const isReferenceAnchor = href?.startsWith("#ref-");
    return (
      <a
        href={href}
        target={isReferenceAnchor ? undefined : "_blank"}
        rel={isReferenceAnchor ? undefined : "noopener noreferrer"}
        className={
          isReferenceAnchor
            ? "mx-0.5 align-super text-[0.68rem] font-semibold text-sky-700 no-underline hover:text-sky-900"
            : "break-words font-medium text-primary underline decoration-primary/50 underline-offset-4"
        }
      >
        {children}
      </a>
    );
  },
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded-md bg-base-300/70 px-1.5 py-0.5 font-mono text-[0.95em]">
        {children}
      </code>
    ) : (
      <code className="font-mono text-sm">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-2xl bg-base-300/70 p-4 text-sm leading-6">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/40 pl-4 italic text-current opacity-80">
      {children}
    </blockquote>
  ),
};

function BuildingContextBlock({ context }) {
  if (!context) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-base-300/80 bg-base-100/70 p-3 text-base-content shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <FiHome aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold leading-6">
            {context.address || context.buildingName || "Identified building"}
          </div>
          {context.buildingName && context.address && (
            <div className="truncate text-xs text-base-content/60">
              {context.buildingName}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {context.buildingId && (
              <span className="rounded-md border border-base-300 bg-base-200/60 px-2 py-1 text-xs text-base-content/70">
                ID {context.buildingId}
              </span>
            )}
            {context.details.map((item) => (
              <span
                key={`${item.label}-${item.value}`}
                className="rounded-md border border-base-300 bg-base-200/60 px-2 py-1 text-xs text-base-content/70"
              >
                <span className="font-medium text-base-content/80">{item.label}:</span>{" "}
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceReferences({ sources, anchorPrefix }) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-base-300/80 pt-3">
      <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/50">
        References
      </div>
      <ol className="list-none space-y-2 pl-0">
        {sources.map((source, index) => {
          const referenceNumber = index + 1;
          const referenceId = `${anchorPrefix}-${referenceNumber}`;
          const title = getSourceTitle(source);
          const content = (
            <>
              <span className="mr-2 align-super text-[0.68rem] font-semibold text-sky-700">
                {referenceNumber}
              </span>
              <span className="min-w-0 flex-1 truncate">{title}</span>
              {source.link && (
                <FiExternalLink
                  aria-hidden="true"
                  className="ml-2 shrink-0 text-base-content/40"
                  size={13}
                />
              )}
            </>
          );

          return (
            <li
              id={referenceId}
              key={`${source.link || source.filename || title}-${referenceNumber}`}
              className="scroll-mt-24 pl-0 text-xs leading-5 text-base-content/70"
            >
              {source.link ? (
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center rounded-md border border-base-300/80 bg-base-100/60 px-2.5 py-2 no-underline transition hover:border-sky-300 hover:bg-sky-50/70"
                >
                  {content}
                </a>
              ) : (
                <div className="flex items-center rounded-md border border-base-300/80 bg-base-100/60 px-2.5 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const handoffStatusClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  pending: "border-amber-200 bg-amber-50 text-amber-900",
};

function ExpertHandoffStatus({ status }) {
  if (!status) {
    return null;
  }

  const Icon = status.icon;

  return (
    <div
      className={`mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5 ${
        handoffStatusClasses[status.tone] || handoffStatusClasses.info
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
      <div>
        <div className="font-semibold">{status.label}</div>
        <div className="opacity-80">{status.detail}</div>
      </div>
    </div>
  );
}

function Message({ children, position, time, message }) {
  const { showToast } = useAuth();
  const report = message?.downloadable_report;
  const isAssistantMessage = message?.role === "assistant";
  const hideReferences = isAssistantMessage && isExpertHandoffMessage(message, children);
  const sources = isAssistantMessage && !hideReferences ? getMessageSources(message) : [];
  const anchorSeed = String(
    message?.message_id || message?.timestamp || normalizeText(children).length || "message"
  ).replace(/[^a-zA-Z0-9_-]/g, "-");
  const citationAnchorPrefix = `ref-${anchorSeed}`;
  const buildingContext = isAssistantMessage
    ? buildBuildingContext(message?.metadata)
    : null;
  const expertHandoffStatus =
    isAssistantMessage && isExpertHandoffMessage(message, children)
      ? getExpertHandoffStatus(message, children)
      : null;
  const formattedContent = isAssistantMessage
    ? addCitationMarkers(
        formatAssistantMessage(children),
        sources,
        citationAnchorPrefix
      )
    : children;

  const handleDownload = async () => {
    if (!report?.report_id) {
      return;
    }

    try {
      await downloadDraftReport(report.report_id, report.file_name);
    } catch (error) {
      showToast("Failed to download the draft report", "error");
    }
  };

  return (
    <div className={`chat ${position}`}>
      <div>
        <div className="chat-header">
          <time className="text-xs text-slate-400">{time}</time>
        </div>
        <div
          className={`chat-bubble ${
            isAssistantMessage
              ? "assistant-message-bubble max-w-[min(46rem,calc(100vw-5rem))] text-left"
              : "max-w-[min(34rem,calc(100vw-5rem))]"
          }`}
        >
          <div
            className={
              isAssistantMessage
                ? "assistant-markdown prose prose-invert prose-sm max-w-none !text-inherit sm:prose-base prose-p:my-2 prose-p:!text-inherit prose-headings:mb-3 prose-headings:mt-5 prose-headings:!text-inherit prose-strong:!text-inherit prose-li:!text-inherit prose-ul:my-2 prose-ul:!text-inherit prose-ol:my-2 prose-ol:!text-inherit prose-code:!text-inherit prose-pre:my-4"
                : "break-words whitespace-pre-wrap leading-6"
            }
          >
            {isAssistantMessage && (
              <BuildingContextBlock context={buildingContext} />
            )}
            {isAssistantMessage && (
              <ExpertHandoffStatus status={expertHandoffStatus} />
            )}
            <ReactMarkdown components={markdownComponents}>
              {formattedContent}
            </ReactMarkdown>
            {isAssistantMessage && (
              <SourceReferences
                sources={sources}
                anchorPrefix={citationAnchorPrefix}
              />
            )}
          </div>
        </div>
        {report?.report_id && (
          <button
            type="button"
            className="btn btn-sm mt-2"
            onClick={handleDownload}
          >
            Download Draft Report
          </button>
        )}
        {isAssistantMessage && <RatePanel message={message} />}
        {isAssistantMessage && <AdvisorReviewPanel message={message} />}
      </div>
    </div>
  );
}

export default Message;
