import React, { useEffect, useState } from "react";
import {
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MessageSquare,
  Sparkles,
  X,
  Edit2,
} from "lucide-react";
import { Button, Badge, Input, Progress } from "@etherealui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import type { PerformanceCycle, PerformanceGoal } from "../../lib/types";

export function PerformanceView() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "OKR",
    metric_type: "percentage",
    target_value: 100,
    current_value: 0,
    weight: 30,
    status: "in_progress" as const,
  });

  const isManagerOrAdmin =
    user?.role === "admin" ||
    user?.role === "hr_manager" ||
    user?.role === "manager";

  const loadPerformanceData = async () => {
    try {
      const [cycList, goalList] = await Promise.all([
        api.getPerformanceCycles(),
        api.getPerformanceGoals({
          employee_id: !isManagerOrAdmin ? user?.id : undefined,
        }),
      ]);
      setCycles(cycList);
      setGoals(goalList);
    } catch (err) {
      console.error("Failed to load performance goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const handleUpdateProgress = async (
    goal: PerformanceGoal,
    newVal: number,
  ) => {
    try {
      const updatedStatus =
        newVal >= goal.target_value ? "completed" : "in_progress";
      await api.updatePerformanceGoal(goal.id, {
        ...goal,
        current_value: newVal,
        status: updatedStatus,
      });
      loadPerformanceData();
    } catch (err: any) {
      alert(err.message || "Failed to update goal");
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycles.length) return;
    try {
      await api.createPerformanceGoal({
        ...newGoal,
        cycle_id: cycles[0].id,
        employee_id: user?.id || "emp-4",
        score: 4.0,
      });
      setIsModalOpen(false);
      setNewGoal({
        title: "",
        description: "",
        category: "OKR",
        metric_type: "percentage",
        target_value: 100,
        current_value: 0,
        weight: 30,
        status: "in_progress",
      });
      loadPerformanceData();
    } catch (err: any) {
      alert(err.message || "Failed to create goal");
    }
  };

  const activeCycle = cycles[0] || {
    title: "Q4 2026 Enterprise Growth & Review",
    quarter: "Q4",
    year: 2026,
    start_date: "2026-10-01",
    end_date: "2026-12-31",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              Performance & Talent
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">
              {activeCycle.quarter} {activeCycle.year} Review Cycle
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Goals, OKRs & Performance Reviews
          </h1>
          <p className="text-xs text-muted-foreground">
            Strategic alignment, measurable key results, and periodic continuous
            feedback.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Goal / OKR</span>
        </Button>
      </div>

      {/* Cycle Banner Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-card-foreground">
              {activeCycle.title}
            </h2>
            <Badge variant="primary" className="text-[10px]">
              Active Evaluation
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evaluation Window: {activeCycle.start_date} &bull; Deadline:{" "}
            {activeCycle.end_date}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-muted-foreground font-medium">Average Score</p>
            <p className="text-lg font-bold text-primary">4.8 / 5.0</p>
          </div>
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-muted-foreground font-medium">Completion Rate</p>
            <p className="text-lg font-bold text-emerald-500">89.4%</p>
          </div>
        </div>
      </div>

      {/* OKR & Goals List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Active Goals & Key Deliverables
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min(
              100,
              Math.round((g.current_value / (g.target_value || 1)) * 100),
            );
            return (
              <div
                key={g.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={g.category === "OKR" ? "primary" : "outline"}
                          className="text-[10px]"
                        >
                          {g.category}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Weight: {g.weight}%
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground mt-1.5">
                        {g.title}
                      </h3>
                    </div>

                    <Badge
                      variant={
                        g.status === "completed" ? "primary" : "secondary"
                      }
                      className="text-[10px] capitalize shrink-0"
                    >
                      {g.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {g.description}
                  </p>
                </div>

                {/* Progress bar and slider */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Progress Completion
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {pct}% ({g.current_value}/{g.target_value})
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  {/* Interactive Progress Slider */}
                  <div className="pt-2 flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      Update:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={g.current_value}
                      onChange={(e) =>
                        handleUpdateProgress(g, parseInt(e.target.value))
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Manager Feedback */}
                {g.score > 0 && (
                  <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span>Rating Score: {g.score} / 5.0</span>
                      </span>
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        Exceeds Expectations
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      "
                      {g.manager_feedback ||
                        "Consistently delivers resilient microservice architectures with zero downtime."}
                      "
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">
                Add New OKR / Goal
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Goal Title *
                </label>
                <Input
                  required
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="e.g. Reduce CI/CD deployment cycle to < 5 mins"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, category: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2 text-foreground"
                  >
                    <option value="OKR">Strategic OKR</option>
                    <option value="KPI">Operational KPI</option>
                    <option value="Growth">Professional Growth</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Weight (%)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    value={newGoal.weight}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        weight: parseInt(e.target.value) || 20,
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Description & Key Milestones
                </label>
                <textarea
                  rows={3}
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  placeholder="Concrete measurable deliverables..."
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2 text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
