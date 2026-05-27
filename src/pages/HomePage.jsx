import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import SendPanel from "../components/chat/SendPanel";
import Header from "../components/Header";
import ContinueWithEmailModal from "../components/modal/ContinueWithEmailModal";
import WelcomeInstructions from "../components/WelcomeInstructions";
import { useAuth } from "../context/authContext";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const canChat = Boolean(user?.email && user?.token);

  return (
    <>
      <Header title={"SPARA"} />
      <div className="flex h-full items-center justify-center overflow-y-auto px-2 py-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-4 text-center">
          <WelcomeInstructions />
            {canChat ? (
              <>
                <SendPanel />
              </>
            ) : (
              <>
                <p className="text-sm dark:text-slate-300">
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
      <ContinueWithEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  );
}

export default HomePage;
