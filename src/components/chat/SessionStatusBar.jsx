import { useMemo, useState } from "react";
import { FiCopy, FiPauseCircle, FiPlayCircle } from "react-icons/fi";
import { updateSessionActiveState } from "../../services/api";
import { useAuth } from "../../context/authContext";

function SessionStatusBar() {
  const {
    selectedSession,
    sessions,
    setSessions,
    showToast,
    setSessionLoadingStatus,
  } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const session = useMemo(() => {
    const sessionList = Array.isArray(sessions) ? sessions : [];
    return sessionList.find((item) => item.session_token === selectedSession) || null;
  }, [selectedSession, sessions]);

  if (!selectedSession || !session) {
    return null;
  }

  const isActive = session.is_active !== false;
  const nextIsActive = !isActive;
  const evaluationId = session.session_id ? `spara-session-${session.session_id}` : "";

  const handleToggle = async () => {
    try {
      setIsSaving(true);
      const updatedSession = await updateSessionActiveState(
        session.session_id,
        nextIsActive
      );
      const nextSessions = (Array.isArray(sessions) ? sessions : []).map((item) =>
        item.session_id === session.session_id
          ? { ...item, ...updatedSession }
          : item
      );
      setSessions(nextSessions);
      localStorage.setItem("sessions", JSON.stringify(nextSessions));

      if (!nextIsActive) {
        setSessionLoadingStatus((currentStatus) => ({
          ...(currentStatus || {}),
          [selectedSession]: { loading: false },
        }));
      }

      showToast(
        nextIsActive ? "Session reactivated" : "Session deactivated",
        "success"
      );
    } catch (error) {
      console.error("Failed to update session state:", error);
      showToast("Failed to update session state", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEvaluationId = async () => {
    if (!evaluationId) {
      return;
    }

    const payload = [
      `Evaluation ID: ${evaluationId}`,
      `Session ID: ${session.session_id}`,
      `Session token: ${session.session_token}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      showToast("Evaluation ID copied", "success");
    } catch (error) {
      console.error("Failed to copy evaluation ID:", error);
      showToast("Could not copy the evaluation ID", "error");
    }
  };

  const Icon = isActive ? FiPauseCircle : FiPlayCircle;

  return (
    <div className="mb-2 flex w-full max-w-xl items-center gap-3 rounded-lg border border-base-300 bg-base-100/80 px-3 py-2 text-sm text-base-content shadow-sm">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{isActive ? "Session active" : "Session inactive"}</div>
        <div className="truncate text-xs text-base-content/60">
          {evaluationId}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm shrink-0 px-2"
        onClick={handleCopyEvaluationId}
        disabled={!evaluationId}
        title="Copy evaluation ID"
        aria-label="Copy evaluation ID"
      >
        <FiCopy aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        className={`btn btn-sm shrink-0 ${isActive ? "btn-outline" : "btn-primary"}`}
        onClick={handleToggle}
        disabled={isSaving}
      >
        <Icon aria-hidden="true" size={16} />
        {isSaving ? "Saving" : isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}

export default SessionStatusBar;
