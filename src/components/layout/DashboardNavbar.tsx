
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardNavbarProps {
  currentStep?: number;
  showNewButton?: boolean;
}

export function DashboardNavbar({ currentStep, showNewButton = true }: DashboardNavbarProps) {
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error: any) {
      console.error("Logout error:", error);
      
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gradient">Dom Script Forge</span>
          </Link>
          
          {currentStep && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Passo {currentStep} de 3
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showNewButton && (
            <Link to="/create">
              <Button size="sm" className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" /> Novo Episódio
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
