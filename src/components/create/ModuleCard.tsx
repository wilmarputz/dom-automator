
import { Check } from "lucide-react";

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ModuleCardProps {
  module: Module;
  selected: boolean;
  onClick: () => void;
}

export function ModuleCard({ module, selected, onClick }: ModuleCardProps) {
  return (
    <div
      className={`relative p-6 rounded-lg border cursor-pointer transition-all ${
        selected 
          ? "border-primary bg-primary/10" 
          : "border-border hover:border-primary/50 hover:bg-secondary/30"
      }`}
      onClick={onClick}
    >
      {selected && (
        <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      <div className="mb-4 text-primary">
        {module.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
      <p className="text-sm text-muted-foreground">{module.description}</p>
    </div>
  );
}
