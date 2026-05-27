import Header from "../components/Header";
import WelcomeInstructions from "../components/WelcomeInstructions";

function AboutPage() {
  return (
    <>
      <Header title="SPARA" />
      <main className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto px-2 py-6 text-base-content">
        <WelcomeInstructions />
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">What SPARA Can Help With</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-base-content/75">
            <li>Explain building energy concepts and common efficiency measures.</li>
            <li>Use available building context when you provide a BRF name, address, or building ID.</li>
            <li>Prepare a concise handoff to an EKR expert after you confirm that it should be sent.</li>
          </ul>
        </section>
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Limits</h2>
          <p className="mt-3 text-sm leading-6 text-base-content/75">
            SPARA answers are generated from available data and retrieved
            guidance. The information can be incomplete, outdated, or
            mismatched to a building record, especially when a property has
            multiple addresses. Confirm critical details with a qualified
            professional before making decisions.
          </p>
        </section>
      </main>
    </>
  );
}

export default AboutPage;
