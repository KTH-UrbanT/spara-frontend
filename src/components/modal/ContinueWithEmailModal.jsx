import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Button from "../Button";

const ContinueWithEmailModal = ({ isOpen, onClose }) => {
  const { continueWithEmail, isCreatingUser, showToast } = useAuth();
  const [email, setEmail] = useState("");
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => emailInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      showToast("Enter your email address.", "error");
      emailInputRef.current?.focus();
      return;
    }

    const user = await continueWithEmail(normalizedEmail);
    if (!user?.email) {
      return;
    }

    setEmail("");
    onClose();
    navigate("/");
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal" open={isOpen} onClose={onClose}>
      <div className="modal-box max-w-sm">
        <h2 className="font-bold text-lg text-center">Continue with email</h2>
        <form onSubmit={handleSubmit} className="space-y-3 pt-4">
          <div className="form-control">
            <label htmlFor="continue-email" className="label py-1">
              <span className="label-text text-sm">Email</span>
            </label>
            <input
              ref={emailInputRef}
              id="continue-email"
              type="email"
              aria-label="Email address"
              className="input input-bordered w-full"
              value={email}
              onChange={(event) => {
                event.target.setCustomValidity("");
                setEmail(event.target.value);
              }}
              onInvalid={(event) => event.target.setCustomValidity(
                event.target.validity.valueMissing ? "Enter your email address." : "Enter a valid email address."
              )}
              required
              autoFocus
            />
          </div>

          <div className="modal-action gap-2 mt-4 flex justify-end">
            <Button
              text={isCreatingUser ? "Continuing..." : "Continue"}
              type="submit"
              color="btn-primary"
              disabled={isCreatingUser}
            />
            <Button
              text="Close"
              onClick={onClose}
              color="btn-neutral"
              type="button"
              disabled={isCreatingUser}
            />
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>Close</button>
      </form>
    </dialog>
  );
};

export default ContinueWithEmailModal;
