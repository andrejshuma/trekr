import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

import WeightProgressCard from "./components/WeightProgressCard.jsx";
import WeightTrackingHeader from "./components/WeightTrackingHeader.jsx";
import WeightSummaryCard from "./components/WeightSummaryCard.jsx";
import WeightIntakesTable from "./components/WeightIntakesTable.jsx";
import WeightStartForm from "./components/WeightStartForm.jsx";

function estimateGoalTimeWeeks(currentWeight, goalWeight) {
  const current = Number(currentWeight);
  const goal = Number(goalWeight);
  if (!Number.isFinite(current) || !Number.isFinite(goal) || current <= 0 || goal <= 0) {
    return null;
  }
  const difference = Math.abs(goal - current);
  return Math.round((difference / 0.5) * 100) / 100;
}

function estimateGoalCalories(currentWeight, height, goalWeight) {
  const current = Number(currentWeight);
  const h = Number(height);
  const goal = Number(goalWeight);
  if (!Number.isFinite(current) || !Number.isFinite(h) || !Number.isFinite(goal)) {
    return null;
  }
  const maintenance = current * 10 + h * 6.25 + 50;
  if (goal < current) return Math.max(0, Math.round((maintenance - 500) * 100) / 100);
  if (goal > current) return Math.round((maintenance + 300) * 100) / 100;
  return Math.round(maintenance * 100) / 100;
}

export default function WeightTracking() {
  const navigate = useNavigate();
  const pageSize = 5;
  const graphPageSize = 500;

  const [profile, setProfile] = useState(null);
  const [intakes, setIntakes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasTodayIntake, setHasTodayIntake] = useState(false);
  const [todayTrainingInfo, setTodayTrainingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ weight: "", height: "", goalWeight: "", goalCalories: "" });
  const [editAutoCalculate, setEditAutoCalculate] = useState(true);
  const [editError, setEditError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchPage = useCallback(async (nextPage, size = pageSize) => {
    const [profileRes, intakesRes, trainingRes] = await Promise.all([
      api.get("/weight/profile"),
      api.get("/weight/intakes", {
        params: { page: nextPage, size },
      }),
      api.get("/weight/today-training"),
    ]);

    return {
      profileData: profileRes?.data ?? null,
      intakesData: intakesRes?.data ?? {},
      trainingData: trainingRes?.data ?? null,
    };
  }, []);

  const [graphIntakes, setGraphIntakes] = useState([]);

  const fetchAllIntakesForGraph = useCallback(async () => {
    let p = 0;
    let hasMorePages = true;
    const all = [];

    while (hasMorePages) {
      const { intakesData } = await fetchPage(p, graphPageSize);
      const chunk = Array.isArray(intakesData.intakes) ? intakesData.intakes : [];
      all.push(...chunk);
      hasMorePages = Boolean(intakesData.hasMore) && chunk.length > 0;
      p += 1;
      if (p > 200) break;
    }

    return all;
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const [{ profileData, intakesData, trainingData }, allIntakes] = await Promise.all([
          fetchPage(0, pageSize),
          fetchAllIntakesForGraph(),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setIntakes(Array.isArray(intakesData.intakes) ? intakesData.intakes : []);
        setGraphIntakes(allIntakes);
        setHasMore(Boolean(intakesData.hasMore));
        setHasTodayIntake(Boolean(intakesData.hasTodayIntake));
        setTodayTrainingInfo(trainingData);
        setPage(0);
      } catch (e) {
        if (cancelled) return;
        const message =
          e?.response?.data?.message || "Failed to load weight tracking data.";
        if (String(message).toLowerCase().includes("not enabled")) {
          navigate("/dashboard/weight", { replace: true });
          return;
        }
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchAllIntakesForGraph, fetchPage, navigate]);

  const onLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError("");
      const { intakesData } = await fetchPage(nextPage);
      setIntakes((prev) => [...prev, ...(Array.isArray(intakesData.intakes) ? intakesData.intakes : [])]);
      setHasMore(Boolean(intakesData.hasMore));
      setHasTodayIntake(Boolean(intakesData.hasTodayIntake));
      setPage(nextPage);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load more intakes.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const goalCalories = useMemo(() => profile?.goalCalories ?? null, [profile]);

  const editEstimatedGoalCalories = useMemo(
    () => estimateGoalCalories(editForm.weight, editForm.height, editForm.goalWeight),
    [editForm.weight, editForm.height, editForm.goalWeight],
  );

  if (isLoading && !profile) {
    return <div className="opacity-80">Loading…</div>;
  }

  const onOpenEditProfile = () => {
    setEditForm({
      weight: String(profile?.weight ?? ""),
      height: String(profile?.height ?? ""),
      goalWeight: String(profile?.goalWeight ?? ""),
      goalCalories: String(profile?.goalCalories ?? ""),
    });
    setEditAutoCalculate(false);
    setEditError("");
    setIsEditingProfile(true);
  };

  const onCancelEdit = () => {
    setIsEditingProfile(false);
    setEditForm({ weight: "", height: "", goalWeight: "", goalCalories: "" });
    setEditError("");
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setIsSubmittingEdit(true);
    try {
      const res = await api.put("/weight/profile", {
        weight: editForm.weight === "" ? null : Number(editForm.weight),
        height: editForm.height === "" ? null : Number(editForm.height),
        goalWeight: editForm.goalWeight === "" ? null : Number(editForm.goalWeight),
        goalCalories: editForm.goalCalories === "" ? null : Number(editForm.goalCalories),
        autoCalculateTargets: editAutoCalculate,
      });
      setProfile(res.data);
      setIsEditingProfile(false);
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to update profile"
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <WeightSummaryCard 
        profile={profile} 
        onEdit={onOpenEditProfile}
        todayTrainingInfo={todayTrainingInfo}
      />

      {isEditingProfile ? (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-2xl">
            <WeightStartForm
              form={editForm}
              setForm={setEditForm}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              error={editError}
              isSubmitting={isSubmittingEdit}
              autoCalculateTargets={editAutoCalculate}
              setAutoCalculateTargets={setEditAutoCalculate}
              estimatedGoalTimeWeeks={estimateGoalTimeWeeks(editForm.weight, editForm.goalWeight)}
              estimatedGoalCalories={editEstimatedGoalCalories}
            />
            <button
              type="button"
              className="modal-backdrop"
              aria-label="Close"
              onClick={onCancelEdit}
              disabled={isSubmittingEdit}
            />
          </div>
        </div>
      ) : null}

      <WeightTrackingHeader
        onAddIntake={() => navigate("/dashboard/weight/intakes/new")}
        isTodayLogged={hasTodayIntake}
      />

      <WeightProgressCard
        intakes={graphIntakes}
        goalCalories={goalCalories}
        isBulking={
          Number.isFinite(Number(profile?.weight)) && Number.isFinite(Number(profile?.goalWeight))
            ? Number(profile.goalWeight) > Number(profile.weight)
            : null
        }
      />

      <WeightIntakesTable
        intakes={intakes}
        isLoading={isLoading}
        error={error}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        pageSize={pageSize}
        goalCalories={goalCalories}
        onAddIntake={() => navigate("/dashboard/weight/intakes/new")}
        currentWeight={profile?.weight}
        goalWeight={profile?.goalWeight}
      />
    </div>
  );
}
