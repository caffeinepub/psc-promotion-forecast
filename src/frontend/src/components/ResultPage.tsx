import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Hash,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import type { Employee } from "../data/employees";
import { formatDate, getDateDiff, getYearsBetween } from "../utils/dateUtils";

const PROMOTION_CADRES = [
  "Sr. Grd. Asst",
  "ASO",
  "SO",
  "SO(HG)",
  "US",
  "US(HG)",
  "DS",
  "JS",
  "AS",
  "CE",
  "Secretary",
] as const;

interface Milestone {
  cadre: string;
  date: string;
}

interface ResultPageProps {
  employee: Employee;
  onBack: () => void;
}

function getNPSOPS(dob: string, dor: string): "NPS" | "OPS" {
  const years = getYearsBetween(dob, dor);
  return years >= 60 ? "NPS" : "OPS";
}

function getMilestones(employee: Employee): Milestone[] {
  return PROMOTION_CADRES.filter(
    (cadre) => employee.promotions[cadre] && employee.promotions[cadre] !== "",
  ).map((cadre) => ({ cadre, date: employee.promotions[cadre] }));
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function ResultPage({ employee, onBack }: ResultPageProps) {
  const milestones = getMilestones(employee);
  const npsOps = getNPSOPS(employee.dob, employee.dor);
  const totalService = getDateDiff(employee.doj, employee.dor);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-5"
          style={{
            background:
              "radial-gradient(circle at top right, oklch(0.85 0.18 185) 0%, transparent 60%)",
          }}
        />
      </div>

      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with back button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            New Search
          </Button>
        </motion.div>

        {/* Employee summary card */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 mb-6 shadow-glow"
        >
          {/* Name header */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-0.5 w-6 bg-primary" />
                <span className="text-xs font-medium tracking-widest uppercase text-primary">
                  Employee Profile
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight cyan-text-glow">
                {employee.name}
              </h1>
            </div>
            <span
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
                npsOps === "NPS"
                  ? "bg-nps-bg text-nps border border-nps/30"
                  : "bg-ops-bg text-ops border border-ops/30"
              }`}
            >
              {npsOps}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem
              icon={<Hash className="h-3.5 w-3.5" />}
              label="PEN"
              value={employee.pen}
            />
            <InfoItem
              icon={<Briefcase className="h-3.5 w-3.5" />}
              label="Designation"
              value={employee.designation}
            />
            <InfoItem
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Date of Birth"
              value={formatDate(employee.dob)}
            />
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Date of Joining"
              value={formatDate(employee.doj)}
            />
            <InfoItem
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Total Service"
              value={totalService}
            />
          </div>
        </motion.div>

        {/* Promotion timeline table */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl overflow-hidden shadow-glow"
        >
          {/* Table header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-primary" />
              <span className="text-xs font-medium tracking-widest uppercase text-primary">
                Promotion Timeline
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-primary whitespace-nowrap">
                    Promotion Cadre
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-primary whitespace-nowrap">
                    Effective Date
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-primary whitespace-nowrap">
                    Duration in Cadre
                  </th>
                </tr>
              </thead>
              <tbody>
                {milestones.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-muted-foreground text-sm"
                    >
                      No promotion data available for this employee.
                    </td>
                  </tr>
                ) : (
                  milestones.map((milestone, index) => {
                    const nextDate =
                      index < milestones.length - 1
                        ? milestones[index + 1].date
                        : employee.dor;
                    const duration = getDateDiff(milestone.date, nextDate);

                    return (
                      <motion.tr
                        key={milestone.cadre}
                        className="border-b border-border/50 table-row-hover transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="font-semibold text-foreground">
                            {milestone.cadre}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-foreground font-medium">
                          {formatDate(milestone.date)}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            {duration}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}

                {/* Date of Superannuation row — always shown */}
                <motion.tr
                  className="bg-primary/5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + milestones.length * 0.05 }}
                >
                  <td
                    colSpan={2}
                    className="px-4 sm:px-6 py-4 font-bold text-foreground"
                  >
                    Date of Superannuation
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-foreground font-medium">
                        {formatDate(employee.dor)}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
                          npsOps === "NPS"
                            ? "bg-nps-bg text-nps border border-nps/30"
                            : "bg-ops-bg text-ops border border-ops/30"
                        }`}
                      >
                        {npsOps}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          variants={itemVariants}
          className="mt-4 flex items-center justify-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-nps-bg text-nps border border-nps/30 text-xs font-bold">
              NPS
            </span>
            <span>New Pension Scheme (retirement age 60)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-ops-bg text-ops border border-ops/30 text-xs font-bold">
              OPS
            </span>
            <span>Old Pension Scheme (retirement age 56)</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="mt-8 text-center text-xs text-muted-foreground/50"
        >
          <p className="mb-1">
            Designed and prepared by{" "}
            <span className="text-primary/70">Anubhesh Sudhakaran</span>,
            Assistant Section Officer.
          </p>
          <p>
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
