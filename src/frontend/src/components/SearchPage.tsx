import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Eye, Loader2, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import bannerImg from "/assets/uploads/banner-2-1-1.jpg";
// Explicit import to prevent build pruning of PWA icon
import "/assets/uploads/WhatsApp-Image-2026-03-05-at-11.42.52-PM-2-1.png";
import { type Employee, employees } from "../data/employees";
import { useActor } from "../hooks/useActor";

interface SearchPageProps {
  onSelect: (employee: Employee) => void;
  onAdminClick: () => void;
}

export function SearchPage({ onSelect, onAdminClick }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [visitLoading, setVisitLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { actor, isFetching } = useActor();
  const hasIncrementedRef = useRef(false);

  // Increment shared visit count once per session (using sessionStorage).
  // sessionStorage is cleared when the tab/browser is closed, so each new
  // session (user leaves and comes back) counts as a new visit, but
  // refreshing within the same session does NOT increment.
  useEffect(() => {
    if (!actor || isFetching || hasIncrementedRef.current) return;
    hasIncrementedRef.current = true;
    setVisitLoading(true);

    const SESSION_KEY = "psc_session_visited";
    const alreadyVisitedThisSession = sessionStorage.getItem(SESSION_KEY);

    if (alreadyVisitedThisSession) {
      // Same session (page refresh) — just fetch the current count, don't increment
      actor
        .getVisits()
        .then((count) => {
          setVisitCount(Number(count));
          setVisitLoading(false);
        })
        .catch(() => setVisitLoading(false));
    } else {
      // New session (user opened or reopened the app) — increment and mark
      actor
        .incrementVisits()
        .then((count) => {
          sessionStorage.setItem(SESSION_KEY, "1");
          setVisitCount(Number(count));
          setVisitLoading(false);
        })
        .catch(() => {
          actor
            .getVisits()
            .then((count) => {
              setVisitCount(Number(count));
              setVisitLoading(false);
            })
            .catch(() => setVisitLoading(false));
        });
    }
  }, [actor, isFetching]);

  const search = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const lower = q.toLowerCase();
    const matches = employees
      .filter((e) => e.name.toLowerCase().includes(lower))
      .slice(0, 10);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    // When a name is selected, don't trigger search (avoids re-showing dropdown)
    if (selected) return;
    search(query);
  }, [query, search, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        pickEmployee(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function pickEmployee(emp: Employee) {
    // If this employee is already selected, go straight to details
    if (selected && selected.pen === emp.pen) {
      setIsOpen(false);
      onSelect(emp);
      return;
    }
    setSelected(emp);
    setQuery(emp.name);
    setIsOpen(false);
    setResults([emp]); // keep the result so re-focus can re-open with it
    // Fire-and-forget: record the search in backend only once per device per employee
    if (actor && !isFetching) {
      const SEARCH_KEY = `psc_searched_${emp.pen}`;
      if (!localStorage.getItem(SEARCH_KEY)) {
        actor
          .recordSearch(emp.name)
          .then(() => {
            localStorage.setItem(SEARCH_KEY, "1");
          })
          .catch(() => {});
      }
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
  }

  function handleShowDetails() {
    if (selected) onSelect(selected);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-12 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.85 0.18 185) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.15 200) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Banner */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <img
            src={bannerImg}
            alt="Know Your Future in PSC - Your Promotion Forecasting Assistant"
            className="w-full rounded-2xl object-contain shadow-glow"
          />
        </motion.div>

        {/* Search card */}
        <motion.div
          className="w-full glass-card rounded-2xl p-6 sm:p-8 shadow-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">
            Employee Search
          </p>

          {/* Search input with autocomplete */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (selected) {
                    // Re-open dropdown showing the selected name (so user can click it to view details)
                    setIsOpen(true);
                  } else if (results.length > 0) {
                    setIsOpen(true);
                  } else if (query.trim().length >= 2) {
                    search(query);
                  }
                }}
                placeholder="Type name here..."
                className="w-full pl-11 pr-10 py-3.5 rounded-pill bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                autoComplete="off"
                spellCheck={false}
              />
              {results.length > 0 && (
                <ChevronDown
                  className={`absolute right-4 h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {isOpen && results.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 glass-card-strong rounded-xl overflow-hidden shadow-glow z-50"
                  initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ transformOrigin: "top" }}
                >
                  <div>
                    {results.map((emp, i) => (
                      <div
                        key={emp.pen}
                        data-selected={i === activeIndex}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                          selected && selected.pen === emp.pen
                            ? "bg-primary/20 text-primary"
                            : i === activeIndex
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent/30 text-foreground"
                        }`}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickEmployee(emp);
                        }}
                      >
                        <div>
                          <div className="text-sm font-medium">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {emp.designation} &middot; PEN: {emp.pen}
                          </div>
                        </div>
                        {selected && selected.pen === emp.pen ? (
                          <span className="text-[10px] font-semibold tracking-wide text-primary border border-primary/40 rounded px-1.5 py-0.5 flex-shrink-0">
                            View Details
                          </span>
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected indicator */}
          <AnimatePresence>
            {selected && (
              <motion.div
                className="mt-3 flex items-center gap-2 text-xs text-primary"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{selected.designation} selected</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show Details button */}
          <Button
            className="w-full mt-5 py-3 rounded-pill text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40"
            disabled={!selected}
            onClick={handleShowDetails}
            style={
              selected
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.18 185) 0%, oklch(0.72 0.15 200) 100%)",
                    color: "oklch(0.1 0.02 220)",
                    boxShadow: "0 0 20px oklch(0.85 0.18 185 / 0.4)",
                  }
                : {}
            }
          >
            Show Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Search from {employees.length.toLocaleString()} registered
              employees
            </p>
            {visitLoading ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>visits</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Eye className="h-3 w-3" />
                {visitCount !== null ? visitCount.toLocaleString() : "—"} visits
              </span>
            )}
          </div>
        </motion.div>

        {/* Credit */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Designed and prepared by{" "}
          <span className="text-primary font-medium">Anubhesh Sudhakaran</span>,
          Assistant Section Officer.
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <span>
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </span>
        <button
          type="button"
          onClick={onAdminClick}
          className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-[10px] tracking-wider"
        >
          admin
        </button>
      </motion.footer>
    </div>
  );
}
