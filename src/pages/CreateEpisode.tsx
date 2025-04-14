import { useAIGenerator } from "@/hooks/use-ai-generator";
// IMPORTANTE: Importar funções API necessárias
import { createEpisode, ModuleType, GeneratedContent, updateGeneratedContent } from "@/lib/api"; // Adicionado ModuleType, GeneratedContent, update...
import { useState, useEffect } from "react"; // useEffect adicionado caso precise no futuro
import { useNavigate } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModuleCard, Module } from "@/components/create/ModuleCard";
import {
  Book, Lightbulb, Clapperboard, BookOpen, Headphones,
  Upload, ArrowLeft, ArrowRight, Check, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define available modules (mantido como estava)
const AVAILABLE_MODULES: Module[] = [
    { id: "prompt_visual", title: "Prompts Visuais", description: "Descrições visuais...", icon: <Lightbulb className="h-6 w-6" />, },
    { id: "roteiro_completo", title: "Roteiro Completo", description: "Roteiro detalhado...", icon: <Book className="h-6 w-6" />, },
    { id: "roteiro_cena", title: "Roteiro de Cena", description: "Roteiro quadro a quadro...", icon: <Clapperboard className="h-6 w-6" />, },
    { id: "roteiro_livro", title: "Roteiro Livro Ilustrado", description: "Adaptação para livro...", icon: <BookOpen className="h-6 w-6" />, },
    { id: "roteiro_audiobook", title: "Roteiro Audiobook", description: "Adaptação para áudio...", icon: <Headphones className="h-6 w-6" />, },
];

const CreateEpisode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for wizard steps
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [title, setTitle] = useState("");
  const [script, setScript] = useState(""); // Roteiro Base

  // Step 2 state
  const [selectedModules, setSelectedModules] = useState<string[]>([]); // Guarda IDs (module_type)

  // Step 3 state
  // Armazena o conteúdo gerado como um mapa: module_type -> string de conteúdo
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  // Armazena o objeto completo retornado pela API para ter acesso ao ID ao salvar edições
  const [generatedContentDetails, setGeneratedContentDetails] = useState<Record<string, GeneratedContent>>({});
  const [activeTab, setActiveTab] = useState<string>(""); // Aba ativa na visualização/edição
  const [isGenerating, setIsGenerating] = useState(false); // Flag para loading da geração
  const [isLoading, setIsLoading] = useState(false);       // Flag para loading geral (criar episódio, salvar)
  const [episodeId, setEpisodeId] = useState<string>(""); // ID do episódio criado

  const toggleModuleSelection = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result;
          setScript(text as string);
           toast({
             title: "Arquivo carregado",
             description: `${file.name} foi carregado.`,
           });
      };
      reader.onerror = (error) => {
           console.error("Error reading file:", error);
           toast({ title: "Erro", description: "Não foi possível ler o arquivo.", variant: "destructive" });
      }
      // Lê como texto - ajuste encoding se necessário
      reader.readAsText(file);
    }
  };


  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast({ title: "Título obrigatório", description: "Insira um título.", variant: "destructive" });
        return false;
      }
      if (!script.trim()) {
        toast({ title: "Roteiro obrigatório", description: "Insira ou carregue um roteiro base.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (selectedModules.length === 0) {
        toast({ title: "Seleção obrigatória", description: "Selecione pelo menos um módulo.", variant: "destructive" });
        return false;
      }
      return true;
    }
    return true;
  };

  // Hook para chamar a função de geração
  const { generateContent: aiGenerate, isLoading: isAILoading } = useAIGenerator(); // Removido onError aqui, tratado no catch abaixo

  // Função chamada quando o usuário avança no wizard
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    try {
      if (currentStep === 1) {
        // Cria o episódio na base de dados primeiro
        setIsLoading(true);
        console.log("CREATE_EPISODE: Criando episódio com Título:", title);
        const episode = await createEpisode(title, script); // Passa título e script base
        if (!episode || !episode.id) {
          // Lança erro se a criação falhar ou não retornar ID
          throw new Error("Falha ao criar o registo do episódio na base de dados.");
        }
        console.log("CREATE_EPISODE: Episódio criado com ID:", episode.id);
        setEpisodeId(episode.id); // Guarda o ID do episódio criado
        setCurrentStep(2);        // Avança para o passo 2 (seleção de módulos)
      } else if (currentStep === 2) {
        setCurrentStep(3);        // Avança para o passo 3 (geração/visualização)
        await generateContent();  // Inicia a geração dos módulos selecionados
      }
    } catch (error) {
      console.error("Erro ao avançar (handleNext):", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado ao processar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Termina loading geral
    }
  };

  // Função chamada para ir para o passo anterior
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Função para gerar o conteúdo dos módulos selecionados
  const generateContent = async () => {
    if (!episodeId) {
        toast({ title: "Erro", description: "ID do episódio não encontrado. Volte ao passo anterior.", variant: "destructive" });
        setCurrentStep(1); // Volta ao passo 1 se não tiver ID
        return;
    }
    setIsGenerating(true); // Ativa loading específico da geração
    // Guarda os resultados aqui (mapa de module_type -> string)
    const generatedStringsMap: Record<string, string> = {};
    // Guarda os detalhes completos retornados (mapa de module_type -> objeto GeneratedContent)
    const generatedDetailsMap: Record<string, GeneratedContent> = {};

    console.log(`CREATE_EPISODE: Iniciando geração para ${selectedModules.length} módulos.`);
    try {
      // Gera para cada módulo selecionado
      for (const moduleId of selectedModules) {
        const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
        console.log(`CREATE_EPISODE: Gerando módulo: ${module?.title || moduleId}`);

        // Chama a função do hook (que invoca a Edge Function)
        // Passa apenas episodeId e moduleType (como string)
        const contentData = await aiGenerate({
          episodeId: episodeId,
          moduleType: moduleId as ModuleType, // Faz o type cast aqui
          // Não passa mais title e baseScript, pois o backend busca
        });

        // Verifica se a geração para este módulo funcionou e retornou dados
        if (contentData && typeof contentData.content === 'string') {
          console.log(`CREATE_EPISODE: Conteúdo recebido para ${moduleId}, ID: ${contentData.id}`);
          // Guarda APENAS A STRING no mapa para a Textarea
          generatedStringsMap[moduleId] = contentData.content;
          // Guarda O OBJETO COMPLETO no outro mapa para referência (ex: para salvar edições)
          generatedDetailsMap[moduleId] = contentData;
        } else {
          // Lida com falha na geração de um módulo específico
          console.warn(`Não foi possível gerar ou conteúdo inválido para o módulo ${moduleId}`);
          generatedStringsMap[moduleId] = `// Erro ao gerar conteúdo para ${module?.title || moduleId} //`;
          // Não adiciona aos detailsMap se falhou
        }
      }

      // Atualiza os estados APÓS o loop terminar
      setGeneratedContent(generatedStringsMap); // Atualiza estado das strings
      setGeneratedContentDetails(generatedDetailsMap); // Atualiza estado dos objetos completos
      console.log("CREATE_EPISODE: Estado 'generatedContent' atualizado:", generatedStringsMap);
      console.log("CREATE_EPISODE: Estado 'generatedContentDetails' atualizado:", generatedDetailsMap);

      // Define a primeira aba selecionada como ativa
      if (selectedModules.length > 0) {
        setActiveTab(selectedModules[0]);
      }

    } catch (error) {
      // Captura erros gerais durante o processo de geração em loop
      console.error('Erro durante a geração de múltiplos conteúdos:', error);
      toast({
        title: "Erro na Geração",
        description: error instanceof Error ? error.message : "Falha ao gerar um ou mais conteúdos.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false); // Finaliza loading da geração
    }
  };


  // Função chamada ao clicar em "Finalizar" (ou "Salvar")
  const handleSave = async () => {
    if (!episodeId) return;

    setIsLoading(true); // Loading geral para salvar
    let changesSavedCount = 0;
    const updatePromises: Promise<any>[] = [];

    console.log("HANDLE_SAVE: Iniciando salvamento...");
    console.log("HANDLE_SAVE: Conteúdo atual para salvar:", generatedContent);
    // console.log("HANDLE_SAVE: Detalhes originais/atuais:", generatedContentDetails); // Pode precisar guardar original

    try {
        // Salvar alterações no conteúdo gerado que foi EDITADO
        Object.keys(generatedContent).forEach((moduleId) => {
            const currentStringValue = generatedContent[moduleId]; // String atual da textarea
            const details = generatedContentDetails[moduleId];    // Detalhes {id, content,...}

            // Verifica se temos os detalhes (para ter o ID) e se o conteúdo mudou
            // Precisaria comparar com um estado 'original' se quisesse salvar só mudanças
            // Por simplicidade aqui, vamos assumir que queremos salvar o estado atual sempre que clicamos Finalizar
            // (O upsert no backend já lida com isso de qualquer forma)
            // Mas para um "Salvar Alterações" real, a comparação seria necessária.

            if (details && details.id) {
                 // Se quiséssemos salvar APENAS se mudou:
                 // const originalContent = originalGeneratedContentMap[moduleId]?.content;
                 // if (currentStringValue !== originalContent) { ... }

                 console.log(`HANDLE_SAVE: Preparando update para module: ${moduleId}, contentId: ${details.id}`);
                 // Adiciona a promessa de atualização ao array
                 // Chama a função API para atualizar na base de dados
                 updatePromises.push(updateGeneratedContent(details.id, currentStringValue));
                 changesSavedCount++; // Conta como tentativa de salvar
            } else {
                 console.warn(`HANDLE_SAVE: Não foi possível encontrar ID para salvar o módulo ${moduleId}`);
            }
        });

        // Espera todas as atualizações terminarem
        await Promise.all(updatePromises);

        toast({
            title: "Episódio Finalizado",
            description: "O conteúdo gerado foi salvo com sucesso.", // Mensagem mais adequada para "Finalizar"
        });

        // Navega de volta para o dashboard após salvar/finalizar
        navigate("/dashboard");

    } catch (error) {
        console.error('Erro ao finalizar/salvar episódio:', error);
        toast({
            title: "Erro ao Salvar",
            description: error instanceof Error ? error.message : "Não foi possível salvar o conteúdo final. Tente novamente.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false); // Termina loading geral
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
        contentToExport = script;
        moduleNameForFile = 'roteiro_base';
        console.log("Exportando Roteiro Base...");
    } else {
        contentToExport = generatedContent[activeModuleId];
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
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar currentStep={currentStep} showNewButton={false} />
      <main className="flex-1">
        <div className="container py-8 md:py-12">

          {/* === PASSO 1: Input Roteiro Base === */}
          {currentStep === 1 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-8">Novo Episódio</h1>
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Episódio</Label>
                  <Input id="title" placeholder="Digite o título..." value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                {/* Roteiro Base */}
                <div className="space-y-2">
                  <Label htmlFor="script">Roteiro Base</Label>
                  <Textarea id="script" placeholder="Cole o roteiro base aqui..." className="min-h-[250px]" value={script} onChange={(e) => setScript(e.target.value)} />
                </div>
                {/* Upload */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">ou</p>
                  <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80">
                    <Upload className="h-4 w-4 mr-2" /> Carregar Arquivo (.txt, .docx)
                  </Label>
                  <Input id="file-upload" type="file" className="hidden" accept=".txt,.docx" onChange={handleFileUpload} />
                </div>
              </div>
            </>
          )}

          {/* === PASSO 2: Seleção de Módulos === */}
          {currentStep === 2 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Selecionar Conteúdos</h1>
              <p className="text-muted-foreground mb-8">Escolha quais tipos de conteúdo gerar para "{title || 'este episódio'}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_MODULES.map((module) => (
                  <ModuleCard key={module.id} module={module} selected={selectedModules.includes(module.id)} onClick={() => toggleModuleSelection(module.id)} />
                ))}
              </div>
            </>
          )}

          {/* === PASSO 3: Geração e Revisão === */}
          {currentStep === 3 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Conteúdo Gerado</h1>
              <p className="text-muted-foreground mb-8">Revise e edite o conteúdo gerado para "{title || 'este episódio'}"</p>

              {/* Indicador de Loading da Geração */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Gerando conteúdo...</p>
                  <p className="text-muted-foreground mt-2">Isso pode levar alguns instantes...</p>
                </div>
              ) : (
                // Abas com Conteúdo Gerado
                <div className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4 pb-1 border-b overflow-x-auto whitespace-nowrap justify-start">
                      {/* Gera abas apenas para os módulos que foram selecionados E gerados */}
                      {selectedModules.map((moduleId) => {
                        // Verifica se há conteúdo gerado para este módulo antes de criar a aba
                        if (generatedContent[moduleId] !== undefined) {
                           const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
                           return (
                             <TabsTrigger key={moduleId} value={moduleId}>
                               {module?.title || moduleId}
                             </TabsTrigger>
                           );
                        }
                        return null; // Não renderiza aba se não houver conteúdo
                      })}
                    </TabsList>

                    {/* Renderiza o conteúdo de cada aba */}
                    {selectedModules.map((moduleId) => {
                        // Busca o valor da string no estado 'generatedContent'
                        const currentContentString = generatedContent[moduleId] || "";
                        // --- DEBUG LOG ---
                        console.log(`RENDER: Valor para Textarea (moduleId: ${moduleId}):`, currentContentString, "| Tipo:", typeof currentContentString);
                        // ----------------

                        // Renderiza o TabsContent apenas se houver conteúdo para ele
                        return generatedContent[moduleId] !== undefined ? (
                          <TabsContent key={moduleId} value={moduleId} className="space-y-4 mt-0">
                            <Label htmlFor={`content-${moduleId}`} className="text-sm font-medium">Edite o conteúdo gerado:</Label>
                            <Textarea
                              id={`content-${moduleId}`}
                              className="min-h-[500px] font-mono text-sm bg-background border border-border rounded-md p-4 focus:ring-primary"
                              value={currentContentString} // Usa a string do estado
                              onChange={(e) => {
                                // Atualiza o estado 'generatedContent' corretamente com a string
                                setGeneratedContent(prevMap => ({
                                  ...prevMap,
                                  [moduleId]: e.target.value,
                                }));
                              }}
                              placeholder={`Conteúdo para ${AVAILABLE_MODULES.find(m => m.id === moduleId)?.title}...`}
                            />

                            {/* Botões de Exportação */}
                            <div className="flex justify-end space-x-2 pt-2">
                              <Button variant="ghost" size="sm" onClick={() => handleExport("txt")}>Exportar TXT</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleExport("docx")}>Exportar DOCX</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")}>Exportar PDF</Button>
                            </div>
                          </TabsContent>
                        ) : null; // Não renderiza TabsContent se não houver conteúdo
                    })}
                  </Tabs>
                </div>
              )}
            </>
          )}

          {/* Navegação do Wizard */}
          <div className="mt-8 pt-6 border-t border-border flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isGenerating || isLoading} // Desabilita se carregando/gerando
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentStep === 1 ? "Próximo" : "Gerar Conteúdos"}
                {currentStep === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            ) : (
              // Botão Finalizar (que na verdade salva as edições feitas no passo 3)
              <Button onClick={handleSave} disabled={isGenerating || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Finalizar e Salvar
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateEpisode;