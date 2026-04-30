import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import graphPlaceholder from "../../../../assets/graph-placeholder.svg";
import {
  getFinanceProfile,
  getIncomes,
  startFinanceTracking,
} from "../../../../api/finance";

import FinanceSummaryCard from "./components/FinanceSummaryCard.jsx";
import FinanceIncomesTable from "./components/FinanceIncomesTable.jsx";
import FinanceStartForm from "./components/FinanceStartForm.jsx";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function FinanceTracking() {
  const navigate = useNavigate();
  const pageSize = 5;

  const [profile, setProfile] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    spendingBudget: "",
    savingBudget: "",
    investingBudget: "",
    donationBudget: "",
    credit: "",
  });

  const segments = useMemo(() => {
    const p = profile ?? {};
    return [
      { key: "spending", label: "Spending", value: toNumber(p.spendingBudget), color: "#22c55e" },
      { key: "saving", label: "Saving", value: toNumber(p.savingBudget), color: "#3b82f6" },
      { key: "investing", label: "Investing", value: toNumber(p.investingBudget), color: "#a855f7" },
      { key: "donation", label: "Donation", value: toNumber(p.donationBudget), color: "#f97316" },
      { key: "credit", label: "Credit", value: toNumber(p.credit), color: "#ef4444" },
    ];
  }, [profile]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return (incomes ?? []).reduce((acc, i) => {
      const d = new Date(i?.date);
      if (Number.isNaN(d.getTime())) return acc;
      if (d.getFullYear() !== y || d.getMonth() !== m) return acc;
      const amount = Number(i?.amount);
      if (!Number.isFinite(amount)) return acc;
      return acc + amount;
    }, 0);
  }, [incomes]);

  const fetchPage = useCallback(async (nextPage) => {
    const data = await getIncomes({ page: nextPage, size: pageSize });
    return {
      nextIncomes: Array.isArray(data?.incomes) ? data.incomes : [],
      nextHasMore: Boolean(data?.hasMore),
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");

        const [p, inc] = await Promise.all([getFinanceProfile(), fetchPage(0)]);
        if (cancelled) return;
        setProfile(p);
        setEditForm({
          spendingBudget: p?.spendingBudget ?? "",
          savingBudget: p?.savingBudget ?? "",
          investingBudget: p?.investingBudget ?? "",
          donationBudget: p?.donationBudget ?? "",
          credit: p?.credit ?? "",
        });
        setIncomes(inc.nextIncomes);
        setHasMore(inc.nextHasMore);
        setPage(0);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || "Failed to load finance dashboard.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const onEdit = () => {
    setEditError("");
    setIsEditing(true);
  };

  const onCancelEdit = () => {
    setEditError("");
    const p = profile ?? {};
    setEditForm({
      spendingBudget: p?.spendingBudget ?? "",
      savingBudget: p?.savingBudget ?? "",
      investingBudget: p?.investingBudget ?? "",
      donationBudget: p?.donationBudget ?? "",
      credit: p?.credit ?? "",
    });
    setIsEditing(false);
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setIsSavingProfile(true);
    try {
      await startFinanceTracking({
        spendingBudget:
          editForm.spendingBudget === "" ? null : Number(editForm.spendingBudget),
        savingBudget:
          editForm.savingBudget === "" ? null : Number(editForm.savingBudget),
        investingBudget:
          editForm.investingBudget === "" ? null : Number(editForm.investingBudget),
        donationBudget:
          editForm.donationBudget === "" ? null : Number(editForm.donationBudget),
        credit: editForm.credit === "" ? null : Number(editForm.credit),
      });

      const refreshed = await getFinanceProfile();
      setProfile(refreshed);
      setEditForm({
        spendingBudget: refreshed?.spendingBudget ?? "",
        savingBudget: refreshed?.savingBudget ?? "",
        investingBudget: refreshed?.investingBudget ?? "",
        donationBudget: refreshed?.donationBudget ?? "",
        credit: refreshed?.credit ?? "",
      });
      setIsEditing(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to update finance profile";
      setEditError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError("");
      const { nextIncomes, nextHasMore } = await fetchPage(nextPage);
      setIncomes((prev) => [...prev, ...nextIncomes]);
      setHasMore(nextHasMore);
      setPage(nextPage);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load more incomes.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Finance</h1>
      </div>

      {isEditing ? (
        <FinanceStartForm
          form={editForm}
          setForm={setEditForm}
          onSubmit={onSaveProfile}
          onCancel={onCancelEdit}
          error={editError}
          isSubmitting={isSavingProfile}
        />
      ) : (
        <FinanceSummaryCard
          segments={segments}
          totalThisMonth={totalThisMonth}
          onEdit={onEdit}
        />
      )}

      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Progress</h2>
          <p className="text-sm opacity-80">(Placeholder graph for now)</p>
          <div className="mt-4">
            <img src={graphPlaceholder} alt="Finance graph placeholder" className="w-full" />
          </div>
        </div>
      </div>

      <FinanceIncomesTable
        incomes={incomes}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        onAddIncome={() => navigate("/dashboard/finance/incomes/new")}
      />
    </div>
  );
}

