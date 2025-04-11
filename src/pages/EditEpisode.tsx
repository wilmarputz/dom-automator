
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Module } from "@/components/create/ModuleCard";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

// Reuse modules from CreateEpisode page
const AVAILABLE_MODULES: Module[] = [
  {
    id: "prompt_visual",
    title: "Prompts Visuais",
    description: "Descrições visuais para cada cena do episódio",
    icon: <></>, // Icon not needed here
  },
  {
    id: "roteiro_completo",
    title: "Roteiro Completo",
    description: "Roteiro detalhado com diálogos e narração",
    icon: <></>, 
  },
  {
    id: "roteiro_cena",
    title: "Roteiro de Cena",
    description: "Roteiro quadro a quadro com tempos estimados",
    icon: <></>,
  },
  {
    id: "roteiro_livro",
    title: "Roteiro Livro Ilustrado",
    description: "Adaptação para formato de livro ilustrado",
    icon: <></>,
  },
  {
    id: "roteiro_audiobook",
    title: "Roteiro Audiobook",
    description: "Adaptação otimizada para narração em áudio",
    icon: <></>,
  },
];

const EditEpisode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [activeTab, setActiveTab] = useState("script");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Simulate loading episode data from Supabase
    setTimeout(() => {
      // Mock data for the episode with this id
      setTitle(`Dom e a Aventura Misteriosa #${id}`);
      setScript("Este é o roteiro base do episódio que foi carregado do banco de dados. Aqui Dom encontra seus amigos para uma nova aventura...");
      setAvailableModules(["prompt_visual", "roteiro_completo", "roteiro_cena"]);
      
      setGeneratedContent({
        "prompt_visual": "Prompts visuais para o episódio:\n\n1. Dom caminha pela floresta, raios de sol atravessam as folhas, criando um padrão dourado no chão.\n\n2. Dom encontra um pequeno esquilo que parece querer comunicar algo importante.\n\n3. Dom segue o esquilo até uma clareira onde seus amigos estão esperando.\n\n4. O grupo encontra um mapa misterioso preso em uma árvore antiga.",
        "roteiro_completo": "ROTEIRO COMPLETO\n\nCENA 1 - FLORESTA - DIA\n\nDOM caminha pela floresta ensolarada. Os raios de sol filtram pelas folhas.\n\nNARRADOR\nEra mais um dia perfeito no Bosque dos Sonhos. Dom estava animado para encontrar seus amigos.\n\nDOM\n(olhando ao redor maravilhado)\nQue dia lindo! Perfeito para uma nova aventura.\n\nUm ESQUILO aparece e chama a atenção de Dom.\n\nDOM\nOlá, amiguinho! Você parece agitado. Aconteceu alguma coisa?",
        "roteiro_cena": "[3s]\n[IMAGEM/AÇÃO VISUAL] Dom caminha pela floresta ensolarada, raios de luz dourada filtram entre as folhas.\n[NARRAÇÃO] Era mais um dia perfeito no Bosque dos Sonhos.\n---\n[2s]\n[IMAGEM/AÇÃO VISUAL] Dom sorri, olhando maravilhado para o céu entre as árvores.\n[DOM] Que dia lindo! Perfeito para uma nova aventura.\n---\n[4s]\n[IMAGEM/AÇÃO VISUAL] Um pequeno esquilo marrom aparece em um galho próximo, fazendo sons agitados e apontando para uma direção."
      });
      
      setIsLoading(false);
    }, 1500);
  }, [id]);
  
  const handleSave = () => {
    // Simulate saving to Supabase
    toast({
      title: "Alterações salvas",
      description: "As alterações no episódio foram salvas com sucesso",
    });
    
    // Navigate back to dashboard
    navigate("/dashboard");
  };
  
  const handleExport = (format: string) => {
    // Simulate file export
    toast({
      title: "Conteúdo exportado",
      description: `O conteúdo foi exportado no formato ${format.toUpperCase()}`,
    });
  };
  
  const handleRegenerateContent = (moduleId: string) => {
    // Simulate regenerating specific content
    toast({
      title: "Regenerando conteúdo",
      description: `Regenerando ${AVAILABLE_MODULES.find(m => m.id === moduleId)?.title}...`,
    });
    
    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Conteúdo regenerado",
        description: `O conteúdo foi regenerado com sucesso`,
      });
      
      // Update the content with "regenerated" prefix
      setGeneratedContent({
        ...generatedContent,
        [moduleId]: `[REGENERADO] ${generatedContent[moduleId]}`
      });
    }, 2000);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar showNewButton={false} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Carregando episódio...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar showNewButton={false} />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Episódio</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="script">Roteiro Base</TabsTrigger>
                {availableModules.map((moduleId) => {
                  const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
                  return (
                    <TabsTrigger key={moduleId} value={moduleId}>
                      {module?.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              <TabsContent value="script" className="space-y-4">
                <Textarea
                  className="min-h-[400px]"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </TabsContent>
              
              {availableModules.map((moduleId) => (
                <TabsContent key={moduleId} value={moduleId} className="space-y-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-muted-foreground text-sm">
                      Edite o conteúdo conforme necessário
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRegenerateContent(moduleId)}
                    >
                      Regenerar
                    </Button>
                  </div>
                  
                  <Textarea
                    className="min-h-[400px] font-mono text-sm"
                    value={generatedContent[moduleId] || ""}
                    onChange={(e) => {
                      setGeneratedContent({
                        ...generatedContent,
                        [moduleId]: e.target.value,
                      });
                    }}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport("txt")}
                    >
                      Exportar TXT
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport("docx")}
                    >
                      Exportar DOCX
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport("pdf")}
                    >
                      Exportar PDF
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="pt-6 border-t border-border flex justify-end">
              <Button onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" /> Salvar Alterações
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
