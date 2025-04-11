
import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { EpisodeCard, Episode } from "@/components/dashboard/EpisodeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock episodes data
  const [episodes, setEpisodes] = useState<Episode[]>([
    {
      id: "1",
      title: "Dom e o Mistério do Bosque Encantado",
      createdAt: new Date(2025, 2, 15),
      moduleCount: 3,
    },
    {
      id: "2",
      title: "A Aventura de Dom nas Montanhas",
      createdAt: new Date(2025, 3, 2),
      moduleCount: 5,
    },
    {
      id: "3",
      title: "Dom e o Tesouro Perdido",
      createdAt: new Date(2025, 3, 10),
      moduleCount: 2,
    },
  ]);

  const filteredEpisodes = episodes.filter((episode) =>
    episode.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEpisode = (id: string) => {
    // Navigate to edit page
    navigate(`/episodes/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setEpisodeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (episodeToDelete) {
      // Remove episode from state
      setEpisodes((prevEpisodes) =>
        prevEpisodes.filter((episode) => episode.id !== episodeToDelete)
      );

      // Show success toast
      toast({
        title: "Episódio excluído",
        description: "O episódio foi excluído com sucesso",
      });

      // Close dialog
      setDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Seus Episódios</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie e crie novos roteiros para "O Mundo de Dom"
              </p>
            </div>
            <Link to="/create" className="mt-4 md:mt-0">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Episódio
              </Button>
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar episódios..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredEpisodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onEdit={handleEditEpisode}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Nenhum episódio encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Tente uma busca diferente ou crie um novo episódio"
                  : "Comece criando seu primeiro episódio"}
              </p>
              <Link to="/create" className="mt-4 inline-block">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Criar Episódio
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este episódio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
