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
            Welcome to SPARA
          </h1>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Ask about energy use, building data, improvement measures, or how to
            prepare information for an advisor. For building-specific advice,
            include a BRF name or street address.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
            <p>
              SPARA can make mistakes and should not replace a professional
              energy advisor. Review important answers before acting on them.{" "}
              <Link className="font-medium underline underline-offset-2" to="/about">
                About SPARA
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WelcomeInstructions;
