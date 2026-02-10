import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

import InvestingCenteredCard from "./components/InvestingCenteredCard.jsx";
import InvestingStartCtaCard from "./components/InvestingStartCtaCard.jsx";

const Investing = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/investing/status");
        const tracking = Boolean(res?.data?.tracking);
        if (!isMounted) return;
        setIsTracking(tracking);
        if (tracking) {
          navigate("/dashboard/investing/tracking", { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message || "Failed to load investing status";
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const onStart = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/investing/start", {});
      setIsTracking(true);
      navigate("/dashboard/investing/tracking", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to start tracking";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <InvestingCenteredCard title="Investing" message="Loading…" />;
  }

  if (isTracking) {
    return <InvestingCenteredCard title="Investing" message="Redirecting…" />;
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <InvestingStartCtaCard
          error={error}
          onStart={onStart}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Investing;
