import React from "react";
import ReactMarkdown from "react-markdown";
import RatePanel from './RatePanel';
import { downloadDraftReport } from "../../services/api";
import { useAuth } from "../../context/authContext";

function Message({ children, position, time, message }) {
  const { showToast } = useAuth();
  const report = message?.downloadable_report;
  const sources = Array.isArray(message?.sources)
    ? message.sources.filter((source) => source?.link && (source?.filename || source?.name))
    : [];

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
      <div className="chat-bubble">
        <ReactMarkdown>{children}</ReactMarkdown>
      </div>
        {message?.role === "assistant" && sources.length > 0 && (
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
        {message?.role === "assistant" && <RatePanel message={message} />}
      </div>
      </div>
  );
}

export default Message;
