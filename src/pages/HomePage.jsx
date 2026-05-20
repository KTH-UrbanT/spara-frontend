import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import SendPanel from "../components/chat/SendPanel";
import Header from "../components/Header";
import ContinueWithEmailModal from "../components/modal/ContinueWithEmailModal";
import { useAuth } from "../context/authContext";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const canChat = Boolean(user?.email && user?.token);

  return (
    <>
      <Header title={"SPARA"} />
      <div className="hero h-full">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold dark:text-white">Hello!</h1>
            {canChat ? (
              <>
                <p className="py-6 dark:text-slate-300">
                  This is SPARA chatbot. Ask your questions by starting a chat.
                </p>
                <SendPanel />
              </>
            ) : (
              <>
                <p className="py-6 dark:text-slate-300">
                  Start by logging in, registering, or continuing with your email.
                </p>
                <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
                  <Button
                    text="Login"
                    onClick={() => navigate("/login")}
                    size="w-full"
                    color="btn-primary"
                  />
                  <Button
                    text="Register"
                    onClick={() => navigate("/register")}
                    size="w-full"
                    color="btn-outline"
                    borderColor="border-primary"
                    textColor="text-primary"
                  />
                  <Button
                    text="Continue with Email"
                    onClick={() => setEmailModalOpen(true)}
                    size="w-full"
                    color="btn-outline"
                    borderColor="border-primary"
                    textColor="text-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ContinueWithEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  );
}

export default HomePage;
