import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDownload,
  FiFileText,
  FiLogIn,
  FiRefreshCw,
} from "react-icons/fi";
import Header from "../components/Header";
import ContinueWithEmailModal from "../components/modal/ContinueWithEmailModal";
import { useAuth } from "../context/authContext";
import { downloadDraftReport, generateExpertReport } from "../services/api";

const today = new Date().toISOString().slice(0, 10);

const DEFAULT_MEASURES = [
  { id: "energy_followup", label: "Systematisk uppföljning" },
  { id: "heating_control", label: "Injustering av värmesystem" },
  { id: "thermostat_valves", label: "Termostatventiler" },
  { id: "ventilation", label: "Ventilation och driftstider" },
  { id: "district_heating_power", label: "Fjärrvärmens toppeffekt" },
  { id: "windows_doors", label: "Fönster, dörrar och tätning" },
  { id: "lighting", label: "Belysning" },
  { id: "laundry", label: "Tvättstuga och torkutrustning" },
  { id: "electric_subscription", label: "Elabonnemang och säkring" },
];

const initialForm = {
  brf_name: "",
  property_designation: "",
  address: "",
  contact_person: "",
  contact_email: "",
  advisor_name: "EKR expert",
  visit_date: today,
  explanation_level: "normal",
  building_notes: "",
  energy_declaration_summary: "",
  observations: "",
  extra_instructions: "",
  text_bank: "",
};

const inputClass = "input input-bordered h-11 w-full rounded-lg bg-base-100";
const textareaClass = "textarea textarea-bordered min-h-28 w-full rounded-lg bg-base-100 leading-6";

function ExpertReportGenerator() {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [measures, setMeasures] = useState(
    DEFAULT_MEASURES.map((measure, index) => ({
      ...measure,
      selected: index < 4,
      notes: "",
    }))
  );
  const [isGenerating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const selectedMeasures = useMemo(
    () => measures.filter((measure) => measure.selected),
    [measures]
  );
  const isAuthenticated = Boolean(user?.token);
  const hasRequiredContext = Boolean(
    form.brf_name.trim() || form.address.trim() || form.observations.trim()
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setGeneratedReport(null);
  };

  const updateMeasure = (id, patch) => {
    setMeasures((current) =>
      current.map((measure) =>
        measure.id === id ? { ...measure, ...patch } : measure
      )
    );
    setGeneratedReport(null);
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      showToast("Logga in eller fortsätt med e-post först.", "warning");
      return;
    }
    if (!hasRequiredContext) {
      showToast("Lägg till BRF, adress eller observationer.", "warning");
      return;
    }

    setGenerating(true);
    try {
      const response = await generateExpertReport({
        ...form,
        measures: selectedMeasures.map((measure) => ({
          id: measure.id,
          label: measure.label,
          selected: true,
          notes: measure.notes,
        })),
      });
      setGeneratedReport(response.downloadable_report);
      showToast("Rapportutkastet är klart.", "success");
    } catch (error) {
      const detail = error.response?.data?.detail;
      showToast(detail || "Kunde inte skapa rapporten.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedReport?.report_id) {
      return;
    }
    try {
      await downloadDraftReport(generatedReport.report_id, generatedReport.file_name);
    } catch {
      showToast("Kunde inte ladda ner rapporten.", "error");
    }
  };

  return (
    <>
      <Header title="Expert Report Generator" />
      <div className="h-full overflow-y-auto px-3 py-4 text-base-content">
        <form
          className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]"
          onSubmit={handleGenerate}
        >
          <div className="space-y-4">
            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold leading-7">Energirådgivningsrapport</h1>
                  <p className="text-sm text-base-content/60">Arbetsutkast för rådgivarens granskning</p>
                </div>
                <div className="join">
                  {["simple", "normal", "technical"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`btn join-item btn-sm ${
                        form.explanation_level === level ? "btn-primary" : "btn-outline"
                      }`}
                      onClick={() => updateField("explanation_level", level)}
                    >
                      {level === "simple" ? "Enkel" : level === "technical" ? "Teknisk" : "Normal"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="form-control">
                  <span className="label-text mb-1">BRF</span>
                  <input
                    className={inputClass}
                    value={form.brf_name}
                    onChange={(event) => updateField("brf_name", event.target.value)}
                    placeholder="Brf Draken 16"
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Fastighetsbeteckning</span>
                  <input
                    className={inputClass}
                    value={form.property_designation}
                    onChange={(event) => updateField("property_designation", event.target.value)}
                    placeholder="Draken 16"
                  />
                </label>
                <label className="form-control md:col-span-2">
                  <span className="label-text mb-1">Adress</span>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Drakenbergsgatan 16"
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Kontaktperson</span>
                  <input
                    className={inputClass}
                    value={form.contact_person}
                    onChange={(event) => updateField("contact_person", event.target.value)}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">E-post</span>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.contact_email}
                    onChange={(event) => updateField("contact_email", event.target.value)}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Energirådgivare</span>
                  <input
                    className={inputClass}
                    value={form.advisor_name}
                    onChange={(event) => updateField("advisor_name", event.target.value)}
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Datum</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.visit_date}
                    onChange={(event) => updateField("visit_date", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Underlag</h2>
              <div className="grid gap-3">
                <label className="form-control">
                  <span className="label-text mb-1">Byggnadens egenskaper</span>
                  <textarea
                    className={textareaClass}
                    value={form.building_notes}
                    onChange={(event) => updateField("building_notes", event.target.value)}
                    placeholder="Nybyggnadsår, A-temp, antal lägenheter, byggnadstyp, uppvärmningssystem, ventilation..."
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Energideklaration och energianvändning</span>
                  <textarea
                    className={textareaClass}
                    value={form.energy_declaration_summary}
                    onChange={(event) =>
                      updateField("energy_declaration_summary", event.target.value)
                    }
                    placeholder="Köpt energi, normalårskorrigerat värde, primärenergital, energiklass, fördelning..."
                  />
                </label>
                <label className="form-control">
                  <span className="label-text mb-1">Observationer från platsbesök</span>
                  <textarea
                    className={textareaClass}
                    value={form.observations}
                    onChange={(event) => updateField("observations", event.target.value)}
                    placeholder="Driftbild, frågor från styrelsen, komfortproblem, mätdata, planerade underhållsåtgärder..."
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Åtgärder</h2>
              <div className="grid gap-3">
                {measures.map((measure) => (
                  <div
                    key={measure.id}
                    className="rounded-lg border border-base-300 bg-base-200/40 p-3"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={measure.selected}
                        onChange={(event) =>
                          updateMeasure(measure.id, { selected: event.target.checked })
                        }
                      />
                      <span className="font-medium">{measure.label}</span>
                    </label>
                    {measure.selected && (
                      <textarea
                        className="textarea textarea-bordered mt-3 min-h-20 w-full rounded-lg bg-base-100 leading-6"
                        value={measure.notes}
                        onChange={(event) =>
                          updateMeasure(measure.id, { notes: event.target.value })
                        }
                        placeholder="Anpassning, mätvärden, råd eller formulering från expertens dokument"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Expertens textbank</h2>
              <textarea
                className="textarea textarea-bordered min-h-40 w-full rounded-lg bg-base-100 leading-6"
                value={form.text_bank}
                onChange={(event) => updateField("text_bank", event.target.value)}
                placeholder="Klistra in stycken från expertens Word-dokument eller andra standardtexter"
              />
              <label className="form-control mt-3">
                <span className="label-text mb-1">Övriga instruktioner</span>
                <textarea
                  className="textarea textarea-bordered min-h-24 w-full rounded-lg bg-base-100 leading-6"
                  value={form.extra_instructions}
                  onChange={(event) => updateField("extra_instructions", event.target.value)}
                  placeholder="Ton, prioriteringar, särskilda osäkerheter eller delar som ska kontrolleras extra noggrant"
                />
              </label>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Status</h2>
              <div className="space-y-2 text-sm text-base-content/70">
                <div className="flex justify-between gap-3">
                  <span>Inloggning</span>
                  <span className={isAuthenticated ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>
                    {isAuthenticated ? "Klar" : "Saknas"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Valda åtgärder</span>
                  <span className="font-medium">{selectedMeasures.length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Språknivå</span>
                  <span className="font-medium">
                    {form.explanation_level === "simple"
                      ? "Enkel"
                      : form.explanation_level === "technical"
                        ? "Teknisk"
                        : "Normal"}
                  </span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setEmailModalOpen(true)}
                  >
                    <FiLogIn aria-hidden="true" />
                    Fortsätt med e-post
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/login")}
                  >
                    Logga in
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Rapport</h2>
              <button
                type="submit"
                className="btn btn-primary w-full rounded-lg"
                disabled={isGenerating || !isAuthenticated || !hasRequiredContext}
              >
                {isGenerating ? (
                  <FiRefreshCw aria-hidden="true" className="animate-spin" />
                ) : (
                  <FiFileText aria-hidden="true" />
                )}
                {isGenerating ? "Skapar..." : "Generera Word"}
              </button>
              <button
                type="button"
                className="btn btn-outline mt-3 w-full rounded-lg"
                disabled={!generatedReport?.report_id}
                onClick={handleDownload}
              >
                <FiDownload aria-hidden="true" />
                Ladda ner DOCX
              </button>
              {generatedReport?.file_name && (
                <p className="mt-3 break-words text-xs text-base-content/60">
                  {generatedReport.file_name}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Valda delar</h2>
              <div className="space-y-2 text-sm">
                {selectedMeasures.length === 0 ? (
                  <p className="text-base-content/60">Inga åtgärder valda.</p>
                ) : (
                  selectedMeasures.map((measure) => (
                    <div
                      key={measure.id}
                      className="rounded-md border border-base-300 bg-base-200/40 px-3 py-2"
                    >
                      {measure.label}
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </form>
      </div>
      <ContinueWithEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  );
}

export default ExpertReportGenerator;
