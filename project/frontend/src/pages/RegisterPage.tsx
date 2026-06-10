import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

interface RegisterPageProps {
  onToggleLogin: () => void;
}

type PasswordStrength = "Weak" | "Medium" | "Strong";

export const RegisterPage: React.FC<RegisterPageProps> = ({ onToggleLogin }) => {
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("Employee");
  
  const [strength, setStrength] = useState<PasswordStrength>("Weak");
  const [strengthScore, setStrengthScore] = useState<number>(0); // 0 to 3
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Field errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Monitor password strength
  useEffect(() => {
    if (!password) {
      setStrength("Weak");
      setStrengthScore(0);
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    
    setStrengthScore(score);
    if (score <= 1) {
      setStrength("Weak");
    } else if (score === 2) {
      setStrength("Medium");
    } else {
      setStrength("Strong");
    }
  }, [password]);

  const validate = () => {
    let valid = true;
    
    if (!fullName.trim()) {
      setNameError("Full name is required");
      valid = false;
    } else {
      setNameError(null);
    }
    
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }
    
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError(null);
    }
    
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    } else {
      setConfirmError(null);
    }
    
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await register(fullName, email, password, role);
      setSuccess("Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        onToggleLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (strengthScore <= 1) return "bg-red-500";
    if (strengthScore === 2) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-black via-[#080212] to-[#14022a] font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Cpu className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
              InstallGen AI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create an account to begin
            </p>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">
            User Registration
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-slate-900/50 border ${
                    nameError ? "border-red-500/50" : "border-slate-700/60"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              {nameError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{nameError}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-900/50 border ${
                    emailError ? "border-red-500/50" : "border-slate-700/60"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="john@company.com"
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-900/50 border ${
                    passwordError ? "border-red-500/50" : "border-slate-700/60"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              
              {/* Strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center text-[10px] mb-1 font-semibold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={
                      strength === "Weak" ? "text-red-400" :
                      strength === "Medium" ? "text-yellow-400" : "text-emerald-400"
                    }>{strength}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${getStrengthBarColor()} transition-all duration-300`}
                      style={{ width: `${(strengthScore / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {passwordError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-900/50 border ${
                    confirmError ? "border-red-500/50" : "border-slate-700/60"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {confirmError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{confirmError}</p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Assign System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="Employee">Employee (Read/Write Requests)</option>
                <option value="Support Engineer">Support Engineer (System Operations)</option>
                <option value="Admin">Admin (Full System Controls)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>
        </div>

        {/* Login navigation footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <button
            onClick={onToggleLogin}
            className="text-indigo-400 font-semibold hover:underline bg-transparent border-none outline-none cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;
