// Exemplo: src/pages/EditEpisode.tsx ou similar

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar"; // Verifique o caminho
import { Footer } from "@/components/layout/Footer"; // Verifique o caminho
import { Button } from "@/components/ui/button"; // Verifique o caminho
import { Input } from "@/components/ui/input"; // Verifique o caminho
import { Label } from "@/components/ui/label"; // Verifique o caminho
import { Textarea } from "@/components/ui/textarea"; // Verifique o caminho
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Verifique o caminho
import { useToast } from "@/hooks/use-toast"; // Verifique o caminho
// Interface Module pode precisar ser importada de outro local se não estiver definida aqui
// import { Module } from "@/components/create/ModuleCard";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

// --- Importações da API (Essencial) ---
import {
  fetchEpisodeById,
  fetchEpisodeContent,
  updateGeneratedContent,
  generateModuleContent, // Importado para a função de regenerar
  ModuleType           // Importa o tipo ModuleType
} from "@/lib/api";
// ------------------------------------

// Definição local ou importada da interface Module
// (Certifique-se que esta definição corresponde à usada)
interface Module {
  id: string; // Corresponde a ModuleType
  title: string;
  description: string;
  icon: React.ReactNode; // Ícone não parece ser usado aqui, pode remover se não precisar
}

// Lista de módulos disponíveis (para obter títulos e descrições)
const AVAILABLE_MODULES: Module[] = [
    { id: "prompt_visual", title: "Prompts Visuais", description: "Descrições visuais", icon: <></>, },
    { id: "roteiro_completo", title: "Roteiro Completo", description: "Roteiro detalhado", icon: <></>, },
    { id: "roteiro_cena", title: "Roteiro de Cena", description: "Roteiro quadro a quadro", icon: <></>, },
    { id: "roteiro_livro", title: "Roteiro Livro Ilustrado", description: "Adaptação para livro", icon: <></>, },
    { id: "roteiro_audiobook", title: "Roteiro Audiobook", description: "Adaptação para áudio", icon: <></>, },
];

const EditEpisode = () => {
  const { id } = useParams<{ id: string }>(); // Obtém o ID do episódio da URL
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados do componente
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading inicial dos dados
  const [isSaving, setIsSaving] = useState(false);         // Loading ao salvar
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null); // Guarda ID do módulo regenerando
  const [title, setTitle] = useState("");
  const [baseScript, setBaseScript] = useState("");
  const [activeTab, setActiveTab] = useState("script");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  // Guarda ID e conteúdo gerado mapeado por module_type
  const [generatedContentMap, setGeneratedContentMap] = useState<Record<string, { id: string; content: string }>>({});
  // Guarda o conteúdo original para comparar antes de salvar
  const [originalGeneratedContentMap, setOriginalGeneratedContentMap] = useState<Record<string, { id: string; content: string }>>({});

  // Efeito para carregar dados quando o componente monta ou o ID muda
  useEffect(() => {
    const loadEpisodeData = async () => {
      if (!id) {
        toast({ title: "Erro", description: "ID do episódio não fornecido.", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setIsLoadingData(true); // Inicia loading dos dados
      console.log(`EditEpisode: Iniciando carregamento para ID: ${id}`);
      try {
        // Carrega dados do episódio e conteúdo gerado em paralelo
        const [episode, fetchedContent] = await Promise.all([
            fetchEpisodeById(id),
            fetchEpisodeContent(id)
        ]);

        // --- DEBUG LOG 1: Verificar dados brutos ---
        console.log('EditEpisode: Dados brutos de generated_content buscados:', fetchedContent);

        if (!episode) {
          throw new Error(`Episódio com ID ${id} não encontrado.`);
        }

        setTitle(episode.title);
        setBaseScript(episode.base_script || '');

        // Processar conteúdo gerado
        const availableTypes = fetchedContent.map(c => c.module_type);
        // --- DEBUG LOG 2: Verificar tipos de módulos encontrados ---
        console.log('EditEpisode: Tipos de Módulos Disponíveis (extraídos):', availableTypes);
        setAvailableModules(availableTypes);

        const contentMap: Record<string, { id: string; content: string }> = {};
        fetchedContent.forEach(c => {
          if (c.id && c.content !== null && c.content !== undefined) { // Verifica ID e se content não é null/undefined
            contentMap[c.module_type] = { id: c.id, content: c.content };
          } else {
            console.warn(`Conteúdo inválido ou nulo para module_type ${c.module_type} no episódio ${id}`);
          }
        });

        // --- DEBUG LOG 3: Verificar mapa de conteúdo criado ---
        console.log('EditEpisode: Mapa de Conteúdo Gerado (para estado):', contentMap);
        setGeneratedContentMap(contentMap);
        setOriginalGeneratedContentMap(JSON.parse(JSON.stringify(contentMap))); // Cópia profunda para original

        setActiveTab('script'); // Define aba inicial

      } catch (error) {
        console.error('Erro ao carregar dados do episódio:', error);
        toast({
          title: 'Erro ao carregar episódio',
          description: error instanceof Error ? error.message : 'Não foi possível carregar os dados. Tente novamente.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setIsLoadingData(false); // Finaliza loading dos dados
        console.log("EditEpisode: Carregamento de dados finalizado.");
      }
    };

    loadEpisodeData();
  }, [id, navigate, toast]); // Dependências

  // Função para salvar alterações manuais
  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true); // Ativa loading de salvar
    let changesSavedCount = 0;
    const updatePromises: Promise<any>[] = []; // Array para promessas de update

    try {
      // Lógica para salvar alterações no Título e Roteiro Base (PRECISA da função updateEpisode em api.ts)
      /*
      const { data: originalEpisodeData } = await supabase.from('episodes').select('title, base_script').eq('id', id).single(); // Exemplo busca direta
      if (originalEpisodeData) {
         const updates: Partial<EpisodeDB> = {};
         if (title !== originalEpisodeData.title) {
             updates.title = title;
         }
         if (baseScript !== originalEpisodeData.base_script) {
             updates.base_script = baseScript;
         }
         if (Object.keys(updates).length > 0) {
             console.log("Saving changes to episode metadata:", updates);
             const { error: episodeUpdateError } = await supabase.from('episodes').update(updates).eq('id', id);
             if (episodeUpdateError) throw episodeUpdateError;
             changesSavedCount++; // Ou uma contagem separada
         }
      }
      */
     // Nota: A lógica acima para salvar título/base_script precisa ser implementada se desejado.

      // Salvar alterações no conteúdo gerado
      Object.keys(generatedContentMap).forEach((moduleType) => {
        const currentData = generatedContentMap[moduleType];
        const originalData = originalGeneratedContentMap[moduleType];

        // Compara conteúdo atual com o original E verifica se ambos existem
        if (currentData && originalData && currentData.content !== originalData.content) {
          console.log(`Saving changes for module: ${moduleType}, contentId: ${currentData.id}`);
          // Adiciona a promessa de atualização ao array
          updatePromises.push(updateGeneratedContent(currentData.id, currentData.content));
          changesSavedCount++;
        } else if (currentData && !originalData) {
          // Caso raro: conteúdo existe agora mas não existia antes (não deveria acontecer sem geração)
          console.warn(`Conteúdo para ${moduleType} existe agora mas não originalmente. Salvando...`);
          updatePromises.push(updateGeneratedContent(currentData.id, currentData.content));
          changesSavedCount++;
        }
      });

      // Espera todas as atualizações terminarem
      await Promise.all(updatePromises);

      if (changesSavedCount > 0) {
         toast({
           title: "Alterações salvas",
           description: `As suas modificações foram salvas com sucesso.`,
         });
         // Atualiza o estado original para refletir o novo estado salvo
         setOriginalGeneratedContentMap(JSON.parse(JSON.stringify(generatedContentMap)));
      } else {
           toast({
               title: "Nenhuma alteração",
               description: "Nenhuma modificação detectada para salvar.",
           });
      }

    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // Desativa loading de salvar
    }
  };

  // Função para chamar a regeneração de conteúdo
  const handleRegenerateContent = async (moduleId: ModuleType | string) => {
     if (!id || isRegenerating) return; // Evita múltiplas chamadas

     const moduleInfo = AVAILABLE_MODULES.find(m => m.id === moduleId);
     setIsRegenerating(moduleId); // Define qual módulo está regenerando
     toast({
       title: "Regenerando conteúdo...",
       description: `Aguarde enquanto regeneramos ${moduleInfo?.title || moduleId}.`,
     });

     try {
         // Chama a função API que invoca a Edge Function 'generate-content'
         const regeneratedData = await generateModuleContent(id, moduleId as ModuleType);

         if (regeneratedData && regeneratedData.content) {
             // Atualiza o estado com o novo conteúdo regenerado
             setGeneratedContentMap(prevMap => ({
                 ...prevMap,
                 [moduleId]: { id: regeneratedData.id, content: regeneratedData.content! },
             }));
             // Atualiza também o 'original' para refletir o novo estado salvo (evita salvar logo após)
             setOriginalGeneratedContentMap(prevMap => ({
                 ...prevMap,
                 [moduleId]: { id: regeneratedData.id, content: regeneratedData.content! },
             }));
             toast({
                 title: "Conteúdo Regenerado",
                 description: `${moduleInfo?.title || moduleId} foi regenerado com sucesso.`,
             });
         } else {
             // Caso a função retorne null ou sem conteúdo
             throw new Error("Falha ao obter conteúdo regenerado da API.");
         }

     } catch (error) {
         console.error(`Erro ao regenerar ${moduleId}:`, error);
         toast({
             title: "Erro ao Regenerar",
             description: error instanceof Error ? error.message : `Não foi possível regenerar ${moduleInfo?.title}.`,
             variant: "destructive",
         });
     } finally {
         setIsRegenerating(null); // Finaliza o estado de regeneração
     }
 };

  // Função para lidar com exportação (focada em TXT)
  const handleExport = (format: 'txt' /*| 'docx' | 'pdf'*/) => { // Limitado a TXT por agora
    if (format !== 'txt') {
        toast({
            title: "Exportação não disponível",
            description: `A exportação para ${format.toUpperCase()} ainda não foi implementada.`,
            variant: "default"
        });
        return;
    }

    // 1. Determinar o conteúdo a ser exportado baseado na aba ativa
    const activeModuleId = activeTab;
    let contentToExport: string | null | undefined;
    let moduleNameForFile: string = 'desconhecido';

    if (activeModuleId === 'script') {
        contentToExport = baseScript;
        moduleNameForFile = 'roteiro_base';
        console.log("Exportando Roteiro Base...");
    } else {
        contentToExport = generatedContentMap[activeModuleId]?.content;
        moduleNameForFile = activeModuleId;
        console.log(`Exportando Módulo: ${moduleNameForFile}...`);
    }

    // 2. Validar se há conteúdo
    if (!contentToExport || contentToExport.trim() === "") {
        toast({
            title: "Conteúdo Vazio",
            description: "Não há conteúdo nesta aba para exportar como TXT.",
            variant: "destructive"
        });
        console.warn("Tentativa de exportar conteúdo vazio.");
        return;
    }

    // 3. Criar o nome do ficheiro (Sanitizado)
    const episodeTitleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 40) || 'episodio';
    const filename = `dom_${episodeTitleSlug}_${moduleNameForFile}.txt`;
    console.log(`Nome do ficheiro gerado: ${filename}`);

    // 4. Gerar o Ficheiro TXT e Iniciar Download
    try {
        const blob = new Blob([contentToExport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log("Download TXT iniciado com sucesso.");
        toast({ title: "Download Iniciado", description: `O ficheiro ${filename} está a ser descarregado.` });

    } catch (error) {
        console.error(`Erro ao gerar ou descarregar ficheiro TXT:`, error);
        toast({
            title: "Erro ao Exportar TXT",
            description: "Não foi possível gerar ou descarregar o ficheiro.",
            variant: "destructive"
        });
    }
  };

  // --- Renderização ---

  // Loading inicial antes de ter dados básicos
  if (isLoadingData && !title) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar showNewButton={false} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Carregando dados do episódio...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Renderização principal após carregar dados
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar showNewButton={false} />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {/* Header da Página */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold tracking-tight flex-1 h-auto py-0 border-0 shadow-none focus-visible:ring-0 bg-transparent" // Estilo título editável
              aria-label="Título do Episódio"
            />
          </div>

          {/* Conteúdo Principal com Abas */}
          <div className="space-y-6">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               {/* Lista de Abas Dinâmica */}
               <TabsList className="mb-4 whitespace-nowrap justify-start pb-1 border-b">
                 <TabsTrigger value="script">Roteiro Base</TabsTrigger>
                 {AVAILABLE_MODULES.map((module) => (
                   // Mostra a aba apenas se o módulo estiver em availableModules (ou seja, foi carregado do DB)
                   availableModules.includes(module.id) ? (
                     <TabsTrigger key={module.id} value={module.id}>
                       {module.title}
                     </TabsTrigger>
                   ) : null
                 ))}
               </TabsList>

               {/* Conteúdo da Aba "Roteiro Base" */}
               <TabsContent value="script" className="space-y-4 mt-0">
                 <Label htmlFor="baseScript" className="text-sm font-medium">Edite o roteiro base original:</Label>
                 <Textarea
                   id="baseScript"
                   className="min-h-[500px] font-mono text-sm bg-background border border-border rounded-md p-4 focus:ring-primary" // Estilo melhorado
                   value={baseScript}
                   onChange={(e) => setBaseScript(e.target.value)}
                   placeholder="Insira ou edite o roteiro base aqui..."
                 />
               </TabsContent>

               {/* Conteúdo das Abas dos Módulos Gerados */}
               {availableModules.map((moduleId) => {
                   const moduleInfo = AVAILABLE_MODULES.find(m => m.id === moduleId);
                   const currentContent = generatedContentMap[moduleId]?.content || "";
                   const contentId = generatedContentMap[moduleId]?.id; // Pega o ID do conteúdo

                   return (
                     <TabsContent key={moduleId} value={moduleId} className="space-y-4 mt-0">
                       <div className="flex justify-between items-center mb-2">
                         <p className="text-muted-foreground text-sm">
                           Conteúdo gerado para "{moduleInfo?.title}". Edite conforme necessário.
                         </p>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleRegenerateContent(moduleId)}
                           disabled={isLoadingData || isSaving || !!isRegenerating} // Desabilita se carregando, salvando ou regenerando
                         >
                           {isRegenerating === moduleId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Regenerar
                         </Button>
                       </div>

                       <Textarea
                         id={`content-${moduleId}`}
                         className="min-h-[500px] font-mono text-sm bg-background border border-border rounded-md p-4 focus:ring-primary" // Estilo melhorado
                         value={currentContent}
                         onChange={(e) => {
                           // Atualiza o map corretamente, mantendo o ID
                           setGeneratedContentMap(prevMap => ({
                             ...prevMap,
                             [moduleId]: {
                                 id: contentId || 'error-id-not-found', // Garante que o ID está lá
                                 content: e.target.value
                             }
                           }));
                         }}
                         placeholder={`Conteúdo para ${moduleInfo?.title}...`}
                       />

                       <div className="flex justify-end space-x-2 pt-2">
                         <Button variant="ghost" size="sm" onClick={() => handleExport("txt")}>Exportar TXT</Button>
                         <Button variant="ghost" size="sm" onClick={() => handleExport("docx")}>Exportar DOCX</Button>
                         <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")}>Exportar PDF</Button>
                       </div>
                     </TabsContent>
                   );
               })}
             </Tabs>

             {/* Botão Principal de Salvar Alterações */}
             <div className="pt-6 border-t border-border flex justify-end">
               <Button onClick={handleSave} disabled={isLoadingData || isSaving || !!isRegenerating}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Salvar Alterações
               </Button>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditEpisode;