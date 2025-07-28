import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { HiLockOpen } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";
import { useState } from "react";
import { HiUser } from "react-icons/hi";
import { useAuth } from "../context/authContext";
import { useEffect } from "react";

function SignupPage() {

  const navigate = useNavigate();
  const {
    signUp,
    isLoggedIn
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,}$/; // At least 3 characters, alphanumeric and underscores allowed
    return regex.test(username);
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const validatePasswordComplexity = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  const validatePasswordsMathch = () => {
    return password === confirmPassword;
  }

  const handleSubmission = (e) => {
    e.preventDefault();

    // Validate and display toast if necessary
    if (!validateEmail(email) || !validatePasswordComplexity(password) || !validatePasswordsMathch()) {
      // TODO: Display error toast
      console.error("Singn up form validation failed");
      return;
    }

    console.log("Submitted signup form with:", { username, email, password });

    setIsLoading(true);
    signUp(username, email, password)
      .finally(() => {
        setIsLoading(false);
      });

  }

  // If the user is already logged in, redirect them to the main page
  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <form onSubmit={handleSubmission}>
      <div className="hero h-full">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold dark:text-white">Sign up</h1>
            <p className="py-6 dark:text-slate-300">
              Sign up to start saving your chats and accessing them from any device!
            </p>
            <ul className="space-y-2">
              <li>
                <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                  <HiUser />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    className="w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </label>
              </li>
              {username && !validateUsername(username) && (
                <li>
                  <p className="text-sm text-red-500">
                    Username must be at least 3 characters long and can only contain letters, numbers, and underscores.
                  </p>
                </li>
              )}
              <li>
                <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                  <HiOutlineMail />
                  <input
                    type="email"
                    placeholder="mail@example.com"
                    required
                    className="w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </label>
              </li>
              {email && !validateEmail(email) && (
                <li>
                  <p className="text-sm text-red-500">
                    Please enter a valid email address.
                  </p>
                </li>
              )}
              <li>
                <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                  <HiLockOpen />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </label>
              </li>
              {password && !validatePasswordComplexity(password) && (
                <li>
                  <p className="text-sm text-red-500">
                    Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.
                  </p>
                </li>
              )}
              <li>
                <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                  <HiLockOpen />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    required
                    className="w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </label>
              </li>
              {confirmPassword && !validatePasswordsMathch() && (
                <li>
                  <p className="text-sm text-red-500">Passwords must match</p>
                </li>
              )}
              <li>
                { isLoading ? (
                  <Button text={"Signing up..."} color={"btn-primary"} disabled={true} icon={<span className="loading loading-spinner loading-md"></span>} />
                ) : (
                  <Button text={"Sign up"} color={"btn-primary"} role="submit" />
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

export default SignupPage;


