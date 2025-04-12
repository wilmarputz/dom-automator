// Exemplo: src/pages/Dashboard.tsx ou similar

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar"; // Verifique o caminho
import { Footer } from "@/components/layout/Footer"; // Verifique o caminho
import { EpisodeCard, Episode } from "@/components/dashboard/EpisodeCard"; // Importa Episode com moduleCount
import { EpisodeListControls } from "@/components/dashboard/EpisodeListControls"; // Verifique o caminho
import { useEpisodeList } from "@/hooks/use-episode-list"; // Verifique o caminho
import { Button } from "@/components/ui/button"; // Verifique o caminho
import { Plus, Loader2 } from "lucide-react";
// Removido import de 'format' se não for mais usado diretamente aqui
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Verifique o caminho
import { useToast } from "@/hooks/use-toast"; // Verifique o caminho
// IMPORTA A FUNÇÃO CORRETA DA API
import { fetchEpisodesWithDetails, deleteEpisode } from "@/lib/api"; // <<< ALTERAÇÃO AQUI

const Dashboard = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  // O estado agora usa o tipo Episode importado de EpisodeCard, que já deve ter moduleCount
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // O hook useEpisodeList receberá a lista já com moduleCount correto
  const {
    episodes, // Esta é a lista paginada/filtrada/ordenada do hook
    filters,
    updateFilters,
    sortField,
    sortOrder,
    updateSort,
    pagination,
    totalItems,
  } = useEpisodeList({ episodes: episodesList }); // Passa a lista completa para o hook

  const searchQuery = filters?.search || '';


  // Efeito para carregar os episódios na montagem do componente
  useEffect(() => {
    const loadEpisodes = async () => {
      setIsLoading(true);
      try {
        // CHAMA A NOVA FUNÇÃO QUE BUSCA DADOS COM CONTAGEM DE MÓDULOS
        const fetchedEpisodes = await fetchEpisodesWithDetails(); // <<< ALTERAÇÃO AQUI

        // Transforma os dados: Principalmente converte a data
        // A contagem de módulos já vem correta da função fetchEpisodesWithDetails
        const formattedEpisodes = fetchedEpisodes.map(episode => ({
          ...episode, // Mantém id, title, user_id, moduleCount, etc.
          // Converte a string de data ISO para objeto Date, necessário para o useEpisodeList e EpisodeCard
          createdAt: new Date(episode.created_at),
          // REMOVIDO: moduleCount: 0,
        }));

        // Define o estado com a lista completa e formatada
        setEpisodesList(formattedEpisodes);

      } catch (error) {
        console.error("Falha ao carregar episódios com detalhes:", error);
        toast({
          title: "Erro ao carregar episódios",
          description: error instanceof Error ? error.message : "Não foi possível carregar seus episódios. Tente novamente.",
          variant: "destructive",
        });
         setEpisodesList([]); // Limpa a lista em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();
  }, [toast]); // Dependência do toast para notificações


  // Funções de manipulação (handleEdit, handleDeleteClick, confirmDelete) permanecem as mesmas
  const handleEditEpisode = (id: string) => {
    navigate(`/episodes/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setEpisodeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (episodeToDelete) {
      setIsLoading(true); // Pode mostrar um loading específico para delete

      try {
        const success = await deleteEpisode(episodeToDelete);

        if (success) {
          // Remove episódio do estado local para atualizar a UI imediatamente
          setEpisodesList((prevEpisodes) =>
            prevEpisodes.filter((episode) => episode.id !== episodeToDelete)
          );
          toast({
            title: "Episódio excluído",
            description: "O episódio foi excluído com sucesso",
          });
        } else {
          // Se deleteEpisode retornar false explicitamente
          throw new Error("A API indicou falha ao excluir o episódio");
        }
      } catch (error) {
        console.error("Erro ao excluir episódio:", error);
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

  // JSX do componente (Estrutura permanece a mesma)
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          {/* Header */}
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

          {/* Controles */}
          <EpisodeListControls
            onSearchChange={(search) => updateFilters({ search })}
            onSortChange={updateSort as (field: string) => void} // Cast para string se useEpisodeList espera string
            onDateRangeChange={(range) => updateFilters({ dateRange: range })}
            onPageChange={(page) => pagination.setCurrentPage(page)}
            sortField={sortField}
            sortOrder={sortOrder}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={totalItems} // totalItems vem do useEpisodeList após filtrar
          />

          {/* Lista ou Mensagem de Loading/Vazio */}
          <div className="mt-8"> {/* Adicionado mt-8 para espaçamento */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground">Carregando episódios...</p>
                </div>
              </div>
            ) : episodes.length > 0 ? ( // Usa 'episodes' do hook, que são os paginados/filtrados
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Ajustado gap */}
                {episodes.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    // Passa o episódio do hook (já com moduleCount correto e data formatada)
                    // para o EpisodeCard
                    episode={episode}
                    onEdit={handleEditEpisode}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg"> {/* Estilo para vazio */}
                <h3 className="text-xl font-semibold">Nenhum episódio encontrado</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery
                    ? "Tente ajustar seus filtros ou crie um novo episódio."
                    : "Parece que você ainda não criou nenhum episódio."}
                </p>
                <Link to="/create" className="mt-6 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Episódio
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* AlertDialog para confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este episódio? Todo o conteúdo gerado associado será perdido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Dashboard;