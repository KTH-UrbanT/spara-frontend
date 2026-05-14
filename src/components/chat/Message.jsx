import React from "react";
import ReactMarkdown from "react-markdown";
import RatePanel from "./RatePanel";
import { downloadDraftReport } from "../../services/api";
import { useAuth } from "../../context/authContext";

const MARKDOWN_LIST_PREFIX = /^(\s*[-*+]|\s*\d+\.)\s+/;
const LABEL_VALUE_LINE = /^([^:\n]{3,90}):\s+(.+)$/;

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
  return /^[A-ZÅÄÖ]/.test(label) && label.split(/\s+/).length <= 14;
};

const formatAssistantMessage = (content) => {
  if (typeof content !== "string") {
    return content;
  }

  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*[•●▪◦]\s+/, "- ")
        .replace(/^(\s*)(\d+)\)\s+/, "$1$2. ")
        .trimEnd()
    );

  const formatted = [];

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index];
    const trimmed = currentLine.trim();

    if (!trimmed) {
      formatted.push("");
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

      formatted.push(trimmed);

      if (shouldFormatAsList) {
        blockLines.forEach((line) => {
          formatted.push(`- ${line}`);
        });
        index = cursor - 1;
      }

      continue;
    }

    formatted.push(trimmed);
  }

  return formatted.join("\n");
};

const markdownComponents = {
  p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-5 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-inherit">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words font-medium text-primary underline decoration-primary/50 underline-offset-4"
    >
      {children}
    </a>
  ),
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
    <blockquote className="my-4 border-l-4 border-primary/40 pl-4 italic text-base-content/80">
      {children}
    </blockquote>
  ),
};

function Message({ children, position, time, message }) {
  const { showToast } = useAuth();
  const report = message?.downloadable_report;
  const isAssistantMessage = message?.role === "assistant";
  const sources = Array.isArray(message?.sources)
    ? message.sources.filter(
        (source) => source?.link && (source?.filename || source?.name)
      )
    : [];
  const formattedContent = isAssistantMessage
    ? formatAssistantMessage(children)
    : children;

  const getSourceTitle = (source) => {
    const value = (source?.name || source?.filename || "").trim();
    if (!value) {
      return "Source";
    }

    const parts = value.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] || value;
  };

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
              ? "max-w-[min(46rem,calc(100vw-5rem))] text-left"
              : "max-w-[min(34rem,calc(100vw-5rem))]"
          }`}
        >
          <div
            className={
              isAssistantMessage
                ? "prose prose-sm max-w-none text-base-content sm:prose-base prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-headings:text-inherit prose-strong:text-inherit prose-li:text-inherit prose-ul:my-4 prose-ol:my-4 prose-code:text-inherit prose-pre:my-4"
                : "break-words whitespace-pre-wrap leading-6"
            }
          >
            <ReactMarkdown components={markdownComponents}>
              {formattedContent}
            </ReactMarkdown>
          </div>
        </div>
        {isAssistantMessage && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <a
                key={`${source.link}-${index}`}
                href={source.link}
                className="max-w-xs rounded-2xl border border-pink-200 bg-pink-100 px-3 py-2 text-left text-xs text-pink-950 no-underline shadow-sm transition hover:bg-pink-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="font-medium leading-tight">
                  {getSourceTitle(source)}
                </div>
              </a>
            ))}
          </div>
        )}
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
      </div>
    </div>
  );
}

export default Message;
