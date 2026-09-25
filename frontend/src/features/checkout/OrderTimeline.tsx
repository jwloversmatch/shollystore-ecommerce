import { Check, Circle } from "lucide-react";
import { ACCENT } from "./constants";

export interface TimelineStep {
  label: string;
  description: string;
  state: "done" | "active" | "pending";
}

interface Props {
  steps: TimelineStep[];
}

const OrderTimeline = ({ steps }: Props) => (
  <ol className="space-y-4" aria-label="Order progress">
    {steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      return (
        <li key={step.label} className="flex gap-3.5">
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                step.state === "done"
                  ? "border-transparent"
                  : step.state === "active"
                    ? "border-[#e8622a] bg-[#e8622a]/10"
                    : "border-gray-300 dark:border-white/20 bg-transparent"
              }`}
              style={step.state === "done" ? { background: ACCENT } : undefined}
            >
              {step.state === "done" ? (
                <Check className="w-4 h-4 text-white" aria-hidden="true" />
              ) : step.state === "active" ? (
                <Circle
                  className="w-2.5 h-2.5 fill-current"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="w-2.5 h-2.5 text-gray-300 dark:text-white/20"
                  aria-hidden="true"
                />
              )}
            </div>
            {!isLast && (
              <div
                className={`w-px flex-1 min-h-[24px] mt-1 ${
                  step.state === "done"
                    ? "bg-[#e8622a]"
                    : "bg-gray-200 dark:bg-white/10"
                }`}
              />
            )}
          </div>
          <div className="pb-1">
            <p
              className={`text-sm font-bold ${
                step.state === "pending"
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {step.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {step.description}
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);

export default OrderTimeline;