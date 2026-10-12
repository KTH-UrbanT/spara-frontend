import Header from "../components/Header";
import WelcomeInstructions from "../components/WelcomeInstructions";

function AboutPage() {
  return (
    <>
      <Header title="SPARA" />
      <main className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto px-2 py-6 text-base-content">
        <WelcomeInstructions />
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Det här kan SPARA hjälpa dig med</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-base-content/75">
            <li>Förklara energibegrepp och vanliga åtgärder för byggnader.</li>
            <li>Hämta tillgängliga byggnadsuppgifter utifrån föreningens namn, adress eller byggnadsid.</li>
            <li>Förbereda en sammanfattning till en energi- och klimatrådgivare och skicka den efter ditt godkännande när e-postfunktionen är tillgänglig.</li>
          </ul>
        </section>
        <section className="rounded-lg border border-base-300 bg-base-100/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Begränsningar</h2>
          <p className="mt-3 text-sm leading-6 text-base-content/75">
            SPARA använder tillgängliga byggnadsuppgifter och hämtat kunskapsunderlag.
            Uppgifterna kan vara ofullständiga eller äldre än byggnadens nuvarande
            förhållanden. En adress kan finnas i flera kommuner eller tillhöra flera
            byggnadsid. Kontrollera byggnadsid, period och viktiga uppgifter med en
            sakkunnig innan du fattar beslut.
          </p>
        </section>
      </main>
    </>
  );
}

export default AboutPage;
