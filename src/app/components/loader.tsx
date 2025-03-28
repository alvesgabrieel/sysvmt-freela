import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils"; // Importe sua utility de classes (opcional)

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
  iconSize?: number;
}

const Loader = ({
  fullScreen = true,
  className = "",
  iconSize = 10,
}: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        fullScreen ? "h-screen" : "h-auto",
        className,
      )}
    >
      <Loader2
        className={cn(
          `text-primary animate-spin`,
          `h-${iconSize} w-${iconSize}`,
        )}
      />
    </div>
  );
};

export default Loader;
