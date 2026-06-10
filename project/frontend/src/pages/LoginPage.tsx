import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, Cpu, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onToggleRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleRegister }) => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState<string>(localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(!!localStorage.getItem("rememberedEmail"));
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = () => {
    let valid = true;
    
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
    
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-black via-[#080212] to-[#14022a] font-sans">
      {/* Decorative gradient glowing orbs */}
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
              Multi-Agent Installation Automation Platform
            </p>
          </div>
        </div>

        {/* Login Glassmorphic Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">
            Sign In to your Account
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-900/50 border ${
                    passwordError ? "border-red-500/50" : "border-slate-700/60"
                  } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-slate-950 w-4 h-4"
                />
                <span className="text-xs text-slate-400 select-none">Remember email</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          {/* Seeding credentials info overlay */}
          <div className="mt-6 pt-6 border-t border-slate-700/40 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Default Admin Account
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              admin@installgen.ai / AdminPass123
            </p>
          </div>
        </div>

        {/* Register navigation footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{" "}
          <button
            onClick={onToggleRegister}
            className="text-indigo-400 font-semibold hover:underline bg-transparent border-none outline-none cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
