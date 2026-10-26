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
        nextIsActive ? "Samtalet har återaktiverats" : "Samtalet har pausats",
        "success"
      );
    } catch (error) {
      console.error("Failed to update session state:", error);
      showToast("Samtalets status kunde inte uppdateras", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEvaluationId = async () => {
    if (!evaluationId) {
      return;
    }

    const payload = [
      `Utvärderings-id: ${evaluationId}`,
      `Samtals-id: ${session.session_id}`,
      `Samtalsnyckel: ${session.session_token}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      showToast("Utvärderings-id kopierat", "success");
    } catch (error) {
      console.error("Failed to copy evaluation ID:", error);
      showToast("Utvärderings-id kunde inte kopieras", "error");
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
        <div className="font-medium">{isActive ? "Samtalet är aktivt" : "Samtalet är pausat"}</div>
        <div className="truncate text-xs text-base-content/60">
          {evaluationId}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm shrink-0 px-2"
        onClick={handleCopyEvaluationId}
        disabled={!evaluationId}
        title="Kopiera utvärderings-id"
        aria-label="Kopiera utvärderings-id"
      >
        <FiCopy aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        className={`btn btn-sm shrink-0 ${isActive ? "btn-outline" : "btn-primary"}`}
        onClick={handleToggle}
        disabled={isSaving}
      >
        {/* Keep translated text separate from the icon replaced on toggle. */}
        <span className="inline-flex" aria-hidden="true">
          <Icon size={16} />
        </span>
        <span>{isSaving ? "Sparar" : isActive ? "Pausa" : "Återaktivera"}</span>
      </button>
    </div>
  );
}

export default SessionStatusBar;
