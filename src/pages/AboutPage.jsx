import Header from "../components/Header";
import WelcomeInstructions from "../components/WelcomeInstructions";

function AboutPage() {
  return (
    <>
      <Header title="SPARA" />
      <main className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto px-2 py-6 text-base-content">
        <WelcomeInstructions />
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">How SPARA can help</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-base-content/75">
            <li>Explain energy concepts and common building improvement measures.</li>
            <li>Find available building data using the housing association's name, address, or building ID.</li>
            <li>Prepare a summary for an energy and climate advisor and send it with your approval when email is available.</li>
          </ul>
        </section>
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Limitations</h2>
          <p className="mt-3 text-sm leading-6 text-base-content/75">
            SPARA uses available building records and retrieved reference material.
            The information may be incomplete or may no longer reflect the building's
            current condition. An address may exist in multiple municipalities or
            correspond to multiple building IDs. Verify the building ID, reporting
            period, and important information with an expert before making decisions.
          </p>
        </section>
      </main>
    </>
  );
}

export default AboutPage;
