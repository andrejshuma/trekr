import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDisciplineStatus,
  startDisciplineTracking,
} from "../../../../api/discipline";

import DisciplineCenteredCard from "./components/DisciplineCenteredCard.jsx";
import DisciplineStartCtaCard from "./components/DisciplineStartCtaCard.jsx";

export default function Discipline() {
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
        const tracking = await getDisciplineStatus();
        if (!isMounted) return;
        setIsTracking(tracking);
        if (tracking) {
          navigate("/dashboard/discipline/tracking", { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message || "Failed to load discipline status";
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
      await startDisciplineTracking();
      setIsTracking(true);
      navigate("/dashboard/discipline/tracking", { replace: true });
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
    return <DisciplineCenteredCard title="Discipline" message="Loading…" />;
  }

  if (isTracking) {
    return <DisciplineCenteredCard title="Discipline" message="Redirecting…" />;
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <DisciplineStartCtaCard
          error={error}
          onStart={onStart}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
