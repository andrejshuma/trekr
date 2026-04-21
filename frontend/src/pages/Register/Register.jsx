import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const normalizedPassword = password;

    if (normalizedUsername.length < 3 || normalizedUsername.length > 50) {
      setError("Username must be between 3 and 50 characters");
      setIsSubmitting(false);
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        email: normalizedEmail,
        username: normalizedUsername,
        password: normalizedPassword,
      });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: res.data.userId,
          username: res.data.username,
          email: res.data.email,
        }),
      );
      navigate("/dashboard");
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors ?? {};
      const firstFieldError = Object.values(fieldErrors)[0];
      const message =
        firstFieldError ||
        err?.response?.data?.message ||
        "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
      >
        <legend className="fieldset-legend">Register</legend>

        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label className="label">Username</label>
        <input
          type="text"
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          minLength={3}
          maxLength={50}
          required
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        {error ? <p className="text-error mt-2 text-sm">{error}</p> : null}

        <button
          className="btn btn-neutral mt-4"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <Link className="link link-primary" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
