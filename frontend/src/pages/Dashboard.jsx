import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost" to="/">
              Landing
            </Link>
            <button className="btn btn-outline" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 card bg-base-200 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Account</h2>
            <div className="text-sm leading-7">
              <div>
                <span className="opacity-70">Username:</span>{" "}
                <span className="font-medium">{user?.username ?? "—"}</span>
              </div>
              <div>
                <span className="opacity-70">Email:</span>{" "}
                <span className="font-medium">{user?.email ?? "—"}</span>
              </div>
              <div>
                <span className="opacity-70">User ID:</span>{" "}
                <span className="font-medium">{user?.userId ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
