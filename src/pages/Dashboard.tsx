
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { EpisodeCard, Episode } from "@/components/dashboard/EpisodeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
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
import { fetchEpisodes, deleteEpisode } from "@/lib/api";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEpisodes = async () => {
      setIsLoading(true);
      try {
        const fetchedEpisodes = await fetchEpisodes();
        
        // Transform the data to match the component's expected format
        const formattedEpisodes = fetchedEpisodes.map(episode => ({
          id: episode.id,
          title: episode.title,
          createdAt: new Date(episode.created_at),
          moduleCount: 0, // We'll update this in a future enhancement
        }));
        
        setEpisodes(formattedEpisodes);
      } catch (error) {
        console.error("Failed to fetch episodes:", error);
        toast({
          title: "Erro ao carregar episódios",
          description: "Não foi possível carregar seus episódios. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();
  }, [toast]);

  const filteredEpisodes = episodes.filter((episode) =>
    episode.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEpisode = (id: string) => {
    navigate(`/episodes/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setEpisodeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (episodeToDelete) {
      setIsLoading(true);
      
      try {
        const success = await deleteEpisode(episodeToDelete);
        
        if (success) {
          // Remove episode from state
          setEpisodes((prevEpisodes) =>
            prevEpisodes.filter((episode) => episode.id !== episodeToDelete)
          );

          toast({
            title: "Episódio excluído",
            description: "O episódio foi excluído com sucesso",
          });
        } else {
          throw new Error("Failed to delete episode");
        }
      } catch (error) {
        console.error("Error deleting episode:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o episódio. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setDeleteDialogOpen(false);
        setEpisodeToDelete(null);
      }
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Carregando episódios...</p>
              </div>
            </div>
          ) : filteredEpisodes.length > 0 ? (
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
