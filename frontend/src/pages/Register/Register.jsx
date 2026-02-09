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
    try {
      const res = await api.post("/auth/register", {
        email,
        username,
        password,
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
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
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
