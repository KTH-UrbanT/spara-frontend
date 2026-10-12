import { Link } from "react-router-dom";
import { FiAlertCircle, FiInfo } from "react-icons/fi";

function WelcomeInstructions({ compact = false }) {
  return (
    <section
      className={`mx-auto w-full max-w-xl rounded-lg border border-base-300 bg-base-100/80 text-left text-base-content shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <FiInfo aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className={`${compact ? "text-lg" : "text-2xl"} font-semibold`}>
            Välkommen till SPARA
          </h1>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Fråga om energianvändning, byggnadsuppgifter, åtgärder eller underlag
            till en rådgivare. För uppgifter om en viss byggnad kan du ange
            föreningens namn, gatuadress och kommun eller byggnadsid.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
            <p>
              SPARA kan göra fel. Kontrollera viktiga uppgifter med en
              energi- och klimatrådgivare innan du fattar beslut.{" "}
              <Link className="font-medium underline underline-offset-2" to="/about">
                Om SPARA
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WelcomeInstructions;
