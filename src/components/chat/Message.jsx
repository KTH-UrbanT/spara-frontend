import React from "react";
import ReactMarkdown from "react-markdown";
import RatePanel from './RatePanel';
import { downloadDraftReport } from "../../services/api";
import { useAuth } from "../../context/authContext";

function Message({ children, position, time, message }) {
  const { showToast } = useAuth();
  const report = message?.downloadable_report;

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
