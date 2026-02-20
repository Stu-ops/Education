// src/pages/Login.jsx
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, signup } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || (isSignup && !classLevel)) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setIsLoading(true);

    let result;

    if (isSignup) {
      result = await signup(username, password, classLevel);
    } else {
      result = await login(username, password);
    }

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || "Something went wrong");
    } else {
      navigate("/profile");
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setUsername("");
    setPassword("");
    setClassLevel("");
  };

  const classOptions = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString()
  );

  return (
    <div
      className="relative flex flex-col items-center
                 min-h-screen bg-masterly-cream
                 text-masterly-navy px-6 pt-24 pb-28 overflow-hidden"
    >
      {/* 🔥 Large Decorative Background Images */}
      <img
        src="/assets/illustrations/symbols.png"
        alt=""
        className="absolute -top-24 -left-32 w-[350px]
                   opacity-60 pointer-events-none
                   z-0 select-none"
      />

      <img
        src="/assets/illustrations/symbols.png"
        alt=""
        className="absolute -bottom-40 -right-32 w-[450px]
                   opacity-60 pointer-events-none
                   z-0 rotate-12 select-none"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Title */}
        <h1 className="text-4xl font-bold mt-4">
          {isSignup ? "Join Masterly" : "Login"}
        </h1>

        <p className="text-masterly-muted text-sm mb-10">
          {isSignup
            ? "Start your learning journey"
            : "Sign in to continue learning"}
        </p>

        {/* Role Selection */}
        <div className="flex gap-10 mb-10">
          {/* Parent */}
          <div
            onClick={() => navigate("/parent/login")}
            className="flex flex-col items-center cursor-pointer hover:scale-110 transition"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
              <img
                src="/assets/avatars/parent.png"
                alt=""
                className="w-12 h-12"
              />
            </div>
            <span className="mt-2 text-sm font-semibold text-red-500">
              PARENT
            </span>
          </div>

          {/* Child Active */}
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full bg-yellow-400
                         flex items-center justify-center
                         shadow-lg ring-4 ring-orange-500"
            >
              <img
                src="/assets/avatars/child.png"
                alt=""
                className="w-12 h-12"
              />
            </div>
            <span className="mt-2 text-sm font-semibold text-orange-500">
              CHILD
            </span>
          </div>

          {/* Teacher */}
          <div
            onClick={() => navigate("/teacher/login")}
            className="flex flex-col items-center cursor-pointer hover:scale-110 transition"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
              <img
                src="/assets/avatars/teacher.png"
                alt=""
                className="w-12 h-12"
              />
            </div>
            <span className="mt-2 text-sm font-semibold text-blue-500">
              TEACHER
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <label className="block text-sm text-masterly-muted mb-2">
            Please enter Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 rounded-full
                       bg-masterly-input border
                       border-masterly-inputBorder
                       mb-6 outline-none
                       focus:border-orange-500"
          />

          {isSignup && (
            <>
              <label className="block text-sm text-masterly-muted mb-2">
                Select Class
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-5 py-3 rounded-full
                           bg-masterly-input border
                           border-masterly-inputBorder
                           mb-6 outline-none
                           focus:border-orange-500"
              >
                <option value="">Select Class</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="block text-sm text-masterly-muted mb-2">
            Please enter Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-full
                       bg-masterly-input border
                       border-masterly-inputBorder
                       mb-6 outline-none
                       focus:border-orange-500"
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}

          {/* Premium Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-full font-semibold text-white
                        shadow-lg transition-all duration-200
                        ${
                          isLoading
                            ? "bg-orange-400": "bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02] active:scale-95"
                        }`}
          >
            {isLoading
              ? "Processing..."
              : isSignup
              ? "SIGN UP"
              : "LOGIN"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-sm">
          {isSignup ? (
            <>
              <span className="text-masterly-muted">
                Already have an account?{" "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-orange-600 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <span className="text-masterly-muted">
                New user?{" "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-orange-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}