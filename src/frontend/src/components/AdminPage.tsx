import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Eye,
  Loader2,
  Lock,
  Medal,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_PIN = "psc2024";

interface Stats {
  totalVisits: bigint;
  totalSearches: bigint;
  lastVisitTime: bigint;
}

interface SearchRecord {
  name: string;
  timestamp: bigint;
}

interface EmployeeCount {
  name: string;
  count: bigint;
}

function formatNanoTime(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  if (ms === 0) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchRecord[]>([]);
  const [mostSearched, setMostSearched] = useState<EmployeeCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const { actor, isFetching } = useActor();

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
      inputRef.current?.focus();
    }
  }

  const fetchStats = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoading(true);
    try {
      const [statsData, searches, topSearched] = await Promise.all([
        actor.getStats(),
        actor.getRecentSearches(BigInt(20)),
        actor.getMostSearched(BigInt(20)),
      ]);
      setStats(statsData);
      setRecentSearches(searches);
      setMostSearched(topSearched);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    if (authenticated && actor && !isFetching) {
      fetchStats();
    }
  }, [authenticated, actor, isFetching, fetchStats]);

  // ── PIN gate ──
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
            style={{
              background:
                "radial-gradient(circle, oklch(0.85 0.18 185) 0%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Search
          </button>

          <div className="glass-card rounded-2xl p-8 shadow-glow">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "oklch(0.85 0.18 185 / 0.12)",
                  border: "1px solid oklch(0.85 0.18 185 / 0.25)",
                }}
              >
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>

            <h1 className="text-center text-lg font-semibold text-foreground mb-1">
              Admin Access
            </h1>
            <p className="text-center text-xs text-muted-foreground mb-6">
              Enter your PIN to view usage statistics
            </p>

            <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pin" className="text-xs text-muted-foreground">
                  PIN
                </Label>
                <Input
                  ref={inputRef}
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError("");
                  }}
                  placeholder="Enter PIN"
                  autoFocus
                  className="rounded-pill bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                />
                {pinError && (
                  <motion.p
                    className="text-xs text-destructive"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pinError}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-pill text-sm font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.85 0.18 185) 0%, oklch(0.72 0.15 200) 100%)",
                  color: "oklch(0.1 0.02 220)",
                }}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verify PIN
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Stats Dashboard ──
  return (
    <div className="min-h-screen flex flex-col px-4 py-10 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-4"
          style={{
            background:
              "radial-gradient(circle, oklch(0.85 0.18 185) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Header row */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="text-muted-foreground/30 text-sm">|</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold tracking-wide text-foreground">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="hidden sm:block text-xs text-muted-foreground/60">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchStats}
              disabled={loading}
              className="rounded-pill text-xs border-border hover:border-primary hover:text-primary transition-all"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5">Refresh</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Total Visits */}
              <div className="glass-card rounded-xl p-5 shadow-glow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Total Visits
                  </p>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.85 0.18 185 / 0.1)" }}
                  >
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-foreground tabular-nums">
                  {stats ? Number(stats.totalVisits).toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique device sessions
                </p>
              </div>

              {/* Total Searches */}
              <div className="glass-card rounded-xl p-5 shadow-glow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Total Searches
                  </p>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.72 0.15 200 / 0.12)" }}
                  >
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-foreground tabular-nums">
                  {stats ? Number(stats.totalSearches).toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Employee lookups
                </p>
              </div>

              {/* Last Visit */}
              <div className="glass-card rounded-xl p-5 shadow-glow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Last Visit
                  </p>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.82 0.18 65 / 0.1)" }}
                  >
                    <Clock className="h-4 w-4 text-ops" />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">
                  {stats && stats.lastVisitTime > 0n
                    ? formatNanoTime(stats.lastVisitTime)
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Most recent session
                </p>
              </div>
            </motion.div>

            {/* Recent Searches Table */}
            <motion.div
              className="glass-card rounded-2xl shadow-glow overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Recent Searches
                  </h2>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.85 0.18 185 / 0.1)",
                      color: "oklch(0.85 0.18 185)",
                      border: "1px solid oklch(0.85 0.18 185 / 0.2)",
                    }}
                  >
                    Last {recentSearches.length}
                  </span>
                </div>
              </div>

              {recentSearches.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No searches recorded yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground font-medium pl-6">
                          #
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">
                          Employee Name
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium text-right pr-6">
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSearches.map((record, i) => (
                        <TableRow
                          key={`${record.name}-${record.timestamp.toString()}`}
                          className="border-border table-row-hover transition-colors"
                        >
                          <TableCell className="text-xs text-muted-foreground/50 pl-6 w-10">
                            {recentSearches.length - i}
                          </TableCell>
                          <TableCell className="text-sm text-foreground font-medium">
                            {record.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-right pr-6">
                            {formatNanoTime(record.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>

            {/* Most Searched Employees */}
            <motion.div
              className="glass-card rounded-2xl shadow-glow overflow-hidden mt-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Most Searched Employees
                  </h2>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.82 0.18 65 / 0.1)",
                      color: "oklch(0.82 0.18 65)",
                      border: "1px solid oklch(0.82 0.18 65 / 0.25)",
                    }}
                  >
                    Top {mostSearched.length}
                  </span>
                </div>
              </div>

              {mostSearched.length === 0 ? (
                <div className="py-12 text-center">
                  <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No search data available yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground font-medium pl-6 w-16">
                          Rank
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">
                          Employee Name
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium text-right pr-6">
                          Searches
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mostSearched.map((record, i) => {
                        const rank = i + 1;
                        const isGold = rank === 1;
                        const isSilver = rank === 2;
                        const isBronze = rank === 3;
                        const medalColor = isGold
                          ? "oklch(0.85 0.18 85)"
                          : isSilver
                            ? "oklch(0.78 0.04 240)"
                            : isBronze
                              ? "oklch(0.72 0.12 50)"
                              : "oklch(0.5 0.02 240)";

                        return (
                          <TableRow
                            key={record.name}
                            className="border-border table-row-hover transition-colors"
                          >
                            <TableCell className="pl-6 w-16">
                              <div className="flex items-center gap-1.5">
                                {rank <= 3 ? (
                                  <span style={{ color: medalColor }}>
                                    {isGold ? (
                                      <Trophy className="h-4 w-4" />
                                    ) : (
                                      <Medal className="h-4 w-4" />
                                    )}
                                  </span>
                                ) : null}
                                <span
                                  className="text-xs font-semibold tabular-nums"
                                  style={{
                                    color:
                                      rank <= 3
                                        ? medalColor
                                        : "oklch(0.5 0.02 240)",
                                  }}
                                >
                                  {rank}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-foreground font-medium">
                              {record.name}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full tabular-nums"
                                style={{
                                  background:
                                    rank <= 3
                                      ? `${medalColor.replace(")", " / 0.12)")}`
                                      : "oklch(0.85 0.18 185 / 0.08)",
                                  color:
                                    rank <= 3
                                      ? medalColor
                                      : "oklch(0.85 0.18 185)",
                                  border: `1px solid ${rank <= 3 ? medalColor.replace(")", " / 0.3)") : "oklch(0.85 0.18 185 / 0.2)"}`,
                                }}
                              >
                                {Number(record.count).toLocaleString()}×
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        className="mt-12 text-center text-xs text-muted-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </motion.footer>
    </div>
  );
}
