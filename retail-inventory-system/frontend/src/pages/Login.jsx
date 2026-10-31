import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await loginUser(formData);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      navigate("/");
    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1f2937] text-white font-bold">
            RI
          </div>

          <h1 className="text-2xl font-semibold text-[#1f2937]">
            Retail Inventory Management
          </h1>

          <p className="mt-2 text-sm text-[#6b7280]">
            Sign in to access your inventory dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[#e1e5ea] bg-white p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1f2937]">Sign in</h2>

            <p className="mt-1 text-sm text-[#6b7280]">
              Enter your account details below.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-[#dfe3e8] bg-white pl-10 pr-3 text-sm text-[#1f2937] outline-none transition focus:border-[#374151] focus:ring-1 focus:ring-[#374151]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-[#dfe3e8] bg-white pl-10 pr-11 text-sm text-[#1f2937] outline-none transition focus:border-[#374151] focus:ring-1 focus:ring-[#374151]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#1f2937] text-sm font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 border-t border-[#eef0f2] pt-5 text-center">
            <p className="text-sm text-[#6b7280]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#1f2937] hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#9ca3af]">
          Retail Inventory Management System
        </p>
      </div>
    </div>
  );
}
