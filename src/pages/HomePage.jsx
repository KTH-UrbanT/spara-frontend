import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero h-full">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold dark:text-white">Hello there</h1>
            <p className="py-6 dark:text-slate-300">
              This is SPARA chatbot. Ask your questions by starting a chat.
            </p>
            <Button text={"Start chat!"} onClick={() => navigate("/chat/-1")} />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
