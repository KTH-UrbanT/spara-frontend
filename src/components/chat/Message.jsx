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
  /\s*(?:\((?:source|sources|källa|källor):\s*([^)]+)\)|\[(?:source|sources|källa|källor):\s*([^\]]+)\])/gi;
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

  const status = metadata.expert_handoff_status;
  const swedish = (metadata.expert_handoff_language || metadata.response_language) !== "en";
  if (status === "unknown" || status === "sending") {
    return {
      tone: "pending", label: swedish ? "Överlämningens status är osäker" : "Expert handoff status uncertain",
      detail: swedish ? "Det är oklart om meddelandet skickades. Kontrollera med rådgivaren innan du försöker igen för att undvika en dubblett." : "Submission could not be confirmed. Check with the advisor before retrying to avoid a duplicate.",
      icon: FiAlertTriangle,
    };
  }
  if (status === "disabled" || status === "cancelled") {
    return {
      tone: "info", label: status === "disabled"
        ? (swedish ? "E-postöverlämning är inte tillgänglig" : "Expert handoff unavailable")
        : (swedish ? "Överlämningen är avbruten" : "Expert handoff cancelled"),
      detail: swedish ? "Inget e-postmeddelande har skickats. Du kan kopiera sammanfattningen och själv kontakta en rådgivare." : "No email was submitted. You can copy the summary and contact an advisor yourself.",
      icon: FiSend,
    };
  }
  if (status === "failed" || (!status && (metadata.expert_handoff_error || text.includes("could not send the email")))) {
    return {
      tone: "error",
      label: swedish ? "Överlämningen misslyckades" : "Expert handoff failed",
      detail: swedish ? "Meddelandet kunde inte skickas. Du kan kopiera sammanfattningen och själv kontakta en rådgivare." : "Submission failed. Use the copyable summary or review the error before retrying.",
      icon: FiAlertTriangle,
    };
  }

  if (status === "submitted" || (!status && metadata.expert_handoff_sent === true)) {
    return {
      tone: "success",
      label: swedish ? "E-postservern har tagit emot meddelandet" : "Expert handoff submitted",
      detail: swedish ? (metadata.expert_handoff_cc_submitted
        ? "E-postservern tog emot meddelandet och din kopia. Leverans till inkorgen är inte bekräftad."
        : "E-postservern tog emot meddelandet. Leverans till inkorgen är inte bekräftad.") : metadata.expert_handoff_cc_submitted
        ? "The mail server accepted the expert email and your copy. Inbox delivery is not confirmed."
        : "The mail server accepted the expert email. Inbox delivery is not confirmed.",
      icon: FiCheckCircle,
    };
  }

  if (status === "simulated" || (!status && (metadata.expert_handoff_simulated === true || text.includes("no real email was sent")))) {
    return {
      tone: "info",
      label: swedish ? "Överlämningen simulerades" : "Expert handoff simulated",
      detail: swedish ? "Utvärderingsläget är aktivt. Inget e-postmeddelande har skickats." : "Evaluation mode is active, so no email was sent.",
      icon: FiSend,
    };
  }

  if (
    status === "pending_confirmation" ||
    (!status && (metadata.expert_handoff_pending_confirmation === true ||
      text.includes("do you want me to send it")))
  ) {
    return {
      tone: "pending",
      label: swedish ? "Väntar på ditt godkännande" : "Expert handoff pending",
      detail: swedish ? "Granska mottagare och innehåll. Svara ”Ja, skicka” eller ”Nej, skicka inte” i chatten." : "Review the recipient and content. Reply 'Yes, send it' or 'No, do not send' in the chat.",
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
    return "Källa";
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
  const metadata = message?.metadata || {};
  const scope = metadata.evidence_scope || {};
  const recordSources = [];
  if (scope.sources?.generic_sql?.accepted_records > 0 || scope.cached_facts_used) {
    const year = metadata.data_freshness?.energy_declaration_year;
    recordSources.push({ name: `ODEN – energideklaration${year ? ` (${year})` : " (datum okänt)"}`, filename: "ODEN", source_type: "building_record", link: "", cached: scope.cached_facts_used === true });
  }
  if (scope.sources?.specialized_sql?.accepted_records > 0) {
    recordSources.push({ name: "Mätdata för den valda byggnaden – se period och enhet i svaret", filename: "meter-records", source_type: "meter_records", link: "" });
  }
  const allSources = [...directSources, ...vectorSources, ...recordSources]
    .map(normalizeSource)
    .filter(Boolean);
  const seen = new Set();

  return allSources.filter((source) => {
    const key = `${normalizeText(source.filename || source.title)}|${normalizeText(source.link)}`;
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
        alias === mentionCandidate
    )
  );
};

const splitSourceMentions = (mention) => {
  const cleaned = String(mention || "")
    .replace(/^(?:source|sources|källa|källor):/i, "")
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
    .join(" ");

const citationIndexesForMention = (sources, mention) =>
  sources
    .map((source, index) =>
      sourceMatchesMention(source, mention) ? index + 1 : null
    )
    .filter(Boolean);

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

      return ` ${buildCitationLinks(citationIndexes, anchorPrefix)}`;
    }
  );

  withExplicitMarkers = withExplicitMarkers.replace(
    BARE_PARENTHESES_PATTERN,
    (fullMatch, rawSources) => {
      const citationIndexes = citationIndexesForMention(sources, rawSources);

      if (citationIndexes.length === 0) {
        return fullMatch;
      }

      return ` ${buildCitationLinks(citationIndexes, anchorPrefix)}`;
    }
  );

  // Retrieved sources are listed below. Only an explicit citation associates
  // a passage with a claim; retrieval alone does not establish that support.
  return withExplicitMarkers;
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
    return value ? "Ja" : "Nej";
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
  const swedish = metadata?.response_language !== "en";
  if (
    metadata?.needs_clarification === true ||
    metadata?.route === "clarification" ||
    metadata?.clarification?.needed === true
  ) {
    return null;
  }

  const facts = metadata?.retrieved_facts || {};
  const buildingMatch = metadata?.building_match || {};
  const identity = metadata?.building_identity_check || {};
  const buildingId = String(identity.matched_building_id || "").trim();
  const sameId = (value) =>
    typeof value === "string" &&
    value.trim().toLowerCase() === buildingId.toLowerCase();
  if (
    identity.status !== "passed" ||
    !buildingId ||
    buildingId === "building_id_not_available" ||
    /^\d+$/.test(buildingId) ||
    identity.ambiguous === true ||
    buildingMatch.ambiguous === true ||
    !sameId(getField(facts, ["byggnadsid", "building_id"]))
  ) {
    return null;
  }
  // Each message owns its fact snapshot. Every identity attached to that
  // snapshot must agree; session memory cannot establish a card's identity.
  const attachedIds = [
    metadata?.byggnadsid, metadata?.building_id,
    metadata?.building_id_from_user, metadata?.selected_address_building_id,
    metadata?.selected_brf_building_id, buildingMatch.building_id,
    getField(facts, ["byggnadsid"]), getField(facts, ["building_id"]), metadata?.evidence_scope?.building_id,
  ].filter(isPresent);
  if (attachedIds.some((value) => !sameId(value))) {
    return null;
  }
  if (metadata?.evidence_scope) {
    const sources = metadata.evidence_scope.sources || {};
    const hasRecords = Object.values(sources).some((source) => source?.accepted_records > 0);
    if (!hasRecords && metadata.evidence_scope.cached_facts_used !== true) {
      return null;
    }
  }
  const requestedAddress = metadata?.requested_address || metadata?.address_from_user || buildingMatch.input_address;
  const epcRecordAddress = metadata?.epc_record_address || getField(facts, ["epc_idadr", "official_address"]);
  const address =
    epcRecordAddress ||
    getField(facts, ["address", "official_address", "address_from_user", "epc_idadr"]) ||
    buildingMatch.matched_address ||
    buildingMatch.input_address;
  const buildingName = getField(facts, ["brf_name", "building_name", "buildingName"]);
  const details = [
    ...(isPresent(requestedAddress) && normalizeText(requestedAddress) !== normalizeText(address)
      ? [
          {
            label: swedish ? "Sökt adress (samma byggnadsid)" : "Requested address (same building ID)",
            value: requestedAddress,
          },
        ]
      : []),
    {
      label: swedish ? "Byggår" : "Construction year",
      value: (() => { const value = getField(facts, ["construction_year", "building_year", "year_built", "built_year", "byggnadsar", "byggnadsår", "epc_egennybyggar"]); return isPresent(value) ? String(value).replace(/\.0$/, "") : null; })(),
    },
    {
      label: swedish ? "Uppvärmd area (Atemp)" : "Heated area (Atemp)",
      value: formatFactValue(
        getField(facts, [
          "netAreaHeated",
          "epc_egenatemp",
          "atemp",
          "Atemp",
          "heated_area",
          "total_heated_area",
        ]),
        " m²"
      ),
    },
    {
      label: getField(facts, ["declared_energy_class", "epc_egienergiklass", "declaredEnergyClass"]) ? (swedish ? "Deklarerad energiklass" : "Declared energy class") : (swedish ? "Registrerad energiklass" : "Recorded energy class"),
      value: formatFactValue(
        getField(facts, [
          "declared_energy_class",
          "epc_egienergiklass",
          "declaredEnergyClass",
          ...(!getField(facts, ["calculated_energy_class", "epc_egienergiklass2020_calc"]) ? ["energy_class"] : []),
          "energy_label",
          "energiklass",
        ])
      ),
    },
    {
      label: swedish ? "Beräknad energiklass" : "Calculated energy class",
      value: formatFactValue(getField(facts, ["calculated_energy_class", "epc_egienergiklass2020_calc", "epc_egienergiklass_calc"])),
    },
    {
      label: swedish ? "Deklarerad energiprestanda" : "Declared energy performance",
      value: formatFactValue(
        getField(facts, [
          "energy_performance",
          "epc_egienergiprestanda",
          "EnergyClassKwhM2",
        ]),
        " kWh/(m²·år)"
      ),
    },
    {
      label: swedish ? "Specifik energianvändning" : "Specific energy use",
      value: formatFactValue(
        getField(facts, [
          "specific_energy_use",
          "epc_egispecifikenergianvandning",
          "epc_egispecifikenergianvandning_calc",
        ]),
        " kWh/(m²·år)"
      ),
    },
    {
      label: swedish ? "Primärenergital (viktat mått)" : "Primary energy number (weighted)",
      value: formatFactValue(
        getField(facts, [
          "primary_energy_number",
          "primary_energy",
          "epc_egiprimarenergital2020_calc",
          "epc_egiprimarenergital2020",
          "epc_egiprimarenergital2019",
          "epc_egiprimarenergital",
        ]),
        " kWh/(m²·år)"
      ),
    },
    { label: swedish ? "Energideklarationens år" : "Energy declaration year", value: isPresent(metadata?.data_freshness?.energy_declaration_year) ? String(metadata.data_freshness.energy_declaration_year) : null },
  ].filter((item) => isPresent(item.value));

  if (!address && !buildingName && details.length === 0) {
    return null;
  }

  return {
    buildingId,
    address,
    requestedAddress: isPresent(requestedAddress) && isPresent(address) && normalizeText(requestedAddress) !== normalizeText(address)
      ? requestedAddress
      : null,
    buildingName,
    details,
    swedish,
    freshness: metadata?.data_freshness,
    cached: metadata?.evidence_scope?.cached_facts_used === true,
  };
};

const stripRepeatedBuildingIdentifier = (content, context) => {
  if (typeof content !== "string" || !context?.buildingId) {
    return content;
  }
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const firstIndex = lines.findIndex((line) => line.trim());
  if (firstIndex < 0) {
    return content;
  }
  const heading = lines[firstIndex].trim().replace(/[*`]/g, "");
  const match = heading.match(/^(?:Byggnadsid|Building ID):\s*(\S+)\s*$/i);
  if (!match || match[1].toLowerCase() !== context.buildingId.toLowerCase()) {
    return content;
  }
  // Only the initial standalone ID is redundant with the verified card.
  // Keep the stored response intact for exports and clients without a card.
  return lines.slice(firstIndex + 1).join("\n").trimStart();
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
    <div className="mb-3 rounded-lg border border-base-300/80 bg-base-100/70 p-3 text-base-content shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <FiHome aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-base-content/55">
            {context.swedish ? "Identifierad byggnad" : "Building identified"}
          </div>
          <div className="truncate text-base font-semibold leading-6">
            {context.address || context.buildingName || (context.swedish ? "Identifierad byggnad" : "Identified building")}
          </div>
          <div className="break-all text-xs text-base-content/60">
            {context.swedish ? "Byggnadsid" : "Building ID"}: {context.buildingId}
          </div>
          {context.requestedAddress && (
            <p className="mt-1 text-xs leading-5 text-base-content/70">
              {context.swedish
                ? `Du sökte på ${context.requestedAddress}. För valt byggnadsid anger registret ${context.address}.`
                : `You searched for ${context.requestedAddress}. The recorded address for the selected building ID is ${context.address}.`}
            </p>
          )}
          {context.buildingName && context.address && (
            <div className="truncate text-xs text-base-content/60">
              {context.buildingName}
            </div>
          )}
          {context.details.length > 0 && (
            <details className="mt-1 text-xs text-base-content/65">
              <summary className="cursor-pointer select-none font-medium text-base-content/70">
                {context.swedish ? "Byggnadsuppgifter" : "Building details"}
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
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
              <p className="mt-2">{context.swedish ? "Uppgifter från ODEN och energideklarationen, inte aktuella driftmätningar. Energimåtten har olika definitioner och ska inte jämföras direkt." : "ODEN and energy-declaration records, not current operating measurements. The energy figures use different definitions and should not be compared directly."}</p>
              {context.cached && <p>{context.swedish ? "Uppgifterna hämtades tidigare i samtalet och har inte uppdaterats i detta svar." : "These records were retrieved earlier in the conversation and were not refreshed for this answer."}</p>}
              {!context.freshness?.energy_declaration_year && <p>{context.swedish ? "Energideklarationens datum är okänt." : "The declaration date is unknown."}</p>}
            </details>
          )}
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
        Källor som hämtats för svaret
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
              <span className="min-w-0 flex-1 break-words">{title}</span>
              {source.link_type === "related_page" && <span className="ml-2">Relaterad sida, inte originaldokumentet</span>}
              {source.source_type === "document_guidance" && <span className="ml-2">Allmän vägledning</span>}
              {source.cached && <span className="ml-2">Tidigare hämtat</span>}
              {source.link_status === "indexed_not_fetched" && <span className="ml-2">Dokumentlänk – tillgängligheten är inte bekräftad</span>}
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
        formatAssistantMessage(stripRepeatedBuildingIdentifier(children, buildingContext)),
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
      showToast("Det gick inte att hämta rapportutkastet", "error");
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
            Hämta rapportutkast
          </button>
        )}
        {isAssistantMessage && <RatePanel message={message} />}
        {isAssistantMessage && <AdvisorReviewPanel message={message} />}
      </div>
    </div>
  );
}

export { buildBuildingContext, addCitationMarkers, getMessageSources, formatFactValue, stripRepeatedBuildingIdentifier };
export default Message;
