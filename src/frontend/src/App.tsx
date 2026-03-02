import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminPage } from "./components/AdminPage";
import { ResultPage } from "./components/ResultPage";
import { SearchPage } from "./components/SearchPage";
import type { Employee } from "./data/employees";

type View = "search" | "result" | "admin";

export default function App() {
  const [view, setView] = useState<View>("search");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  function handleSelect(employee: Employee) {
    setSelectedEmployee(employee);
    setView("result");
  }

  return (
    <div className="min-h-screen font-outfit">
      <AnimatePresence mode="wait">
        {view === "admin" ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AdminPage onBack={() => setView("search")} />
          </motion.div>
        ) : view === "result" && selectedEmployee ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ResultPage
              employee={selectedEmployee}
              onBack={() => setView("search")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SearchPage
              onSelect={handleSelect}
              onAdminClick={() => setView("admin")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
