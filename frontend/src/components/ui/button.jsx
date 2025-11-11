import { cn } from "../../lib/utils";

export function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-6 py-2 rounded-xl font-semibold bg-white text-blue-800 hover:bg-blue-100 transition-all active:scale-95",
        className
      )}
      {...props}
    />
  );
}
