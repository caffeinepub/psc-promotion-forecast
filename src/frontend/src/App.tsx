import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ResultPage } from "./components/ResultPage";
import { SearchPage } from "./components/SearchPage";
import type { Employee } from "./data/employees";

export default function App() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  return (
    <div className="min-h-screen font-outfit">
      <AnimatePresence mode="wait">
        {selectedEmployee ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ResultPage
              employee={selectedEmployee}
              onBack={() => setSelectedEmployee(null)}
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
            <SearchPage onSelect={setSelectedEmployee} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
