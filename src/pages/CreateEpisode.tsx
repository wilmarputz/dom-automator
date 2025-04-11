
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModuleCard, Module } from "@/components/create/ModuleCard";
import { 
  Book, 
  Lightbulb, 
  Clapperboard, 
  BookOpen, 
  Headphones, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define available modules
const AVAILABLE_MODULES: Module[] = [
  {
    id: "prompt_visual",
    title: "Prompts Visuais",
    description: "Descrições visuais para cada cena do episódio",
    icon: <Lightbulb className="h-6 w-6" />,
  },
  {
    id: "roteiro_completo",
    title: "Roteiro Completo",
    description: "Roteiro detalhado com diálogos e narração",
    icon: <Book className="h-6 w-6" />,
  },
  {
    id: "roteiro_cena",
    title: "Roteiro de Cena",
    description: "Roteiro quadro a quadro com tempos estimados",
    icon: <Clapperboard className="h-6 w-6" />,
  },
  {
    id: "roteiro_livro",
    title: "Roteiro Livro Ilustrado",
    description: "Adaptação para formato de livro ilustrado",
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    id: "roteiro_audiobook",
    title: "Roteiro Audiobook",
    description: "Adaptação otimizada para narração em áudio",
    icon: <Headphones className="h-6 w-6" />,
  },
];

const CreateEpisode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 state
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  
  // Step 2 state
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  
  // Step 3 state
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      // In a real implementation, we would use FileReader to read the file
      // For this demo, we'll just assume it's uploaded successfully
      toast({
        title: "Arquivo carregado",
        description: `${file.name} foi carregado com sucesso.`,
      });
      
      // Simulate a script being loaded from file
      setScript("Roteiro carregado do arquivo: " + file.name);
    }
  };
  
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast({
          title: "Título obrigatório",
          description: "Por favor, insira um título para o episódio",
          variant: "destructive",
        });
        return false;
      }
      if (!script.trim()) {
        toast({
          title: "Roteiro obrigatório",
          description: "Por favor, insira ou carregue um roteiro base",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    
    if (currentStep === 2) {
      if (selectedModules.length === 0) {
        toast({
          title: "Seleção obrigatória",
          description: "Por favor, selecione pelo menos um tipo de conteúdo para gerar",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        
        if (currentStep === 2) {
          // Simulate content generation when moving to step 3
          generateContent();
        }
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const generateContent = () => {
    setIsGenerating(true);
    
    // Simulate API calls to OpenAI
    setTimeout(() => {
      const mockGeneratedContent: Record<string, string> = {};
      
      selectedModules.forEach(moduleId => {
        const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
        if (module) {
          mockGeneratedContent[moduleId] = `Conteúdo gerado para "${module.title}" com base no roteiro: "${title}"\n\n${script.substring(0, 50)}...\n\nEste é um exemplo de conteúdo gerado via API da OpenAI GPT-4 para demonstração do funcionamento do Dom Script Forge. Em uma implementação real, este seria o conteúdo gerado de acordo com o template específico para este módulo.`;
        }
      });
      
      setGeneratedContent(mockGeneratedContent);
      setActiveTab(selectedModules[0]);
      setIsGenerating(false);
    }, 3000); // Simulate 3 second API call
  };
  
  const handleSave = () => {
    // Simulate saving to Supabase
    toast({
      title: "Episódio salvo",
      description: "Seu episódio foi salvo com sucesso",
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
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar currentStep={currentStep} showNewButton={false} />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {/* Step 1: Input Roteiro Base */}
          {currentStep === 1 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-8">Novo Episódio</h1>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Episódio</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título do episódio..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="script">Roteiro Base</Label>
                  <Textarea
                    id="script"
                    placeholder="Cole o texto do roteiro base aqui..."
                    className="min-h-[250px]"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">ou</p>
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar Arquivo
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".txt,.docx"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Step 2: Seleção de Módulos */}
          {currentStep === 2 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Selecionar Conteúdos</h1>
              <p className="text-muted-foreground mb-8">
                Escolha quais tipos de conteúdo você deseja gerar para "{title}"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_MODULES.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    selected={selectedModules.includes(module.id)}
                    onClick={() => toggleModuleSelection(module.id)}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Step 3: Geração e Revisão */}
          {currentStep === 3 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Conteúdo Gerado</h1>
              <p className="text-muted-foreground mb-8">
                Revise e edite o conteúdo gerado para "{title}"
              </p>
              
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Gerando conteúdo...</p>
                  <p className="text-muted-foreground mt-2">
                    Isso pode levar alguns instantes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      {selectedModules.map((moduleId) => {
                        const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
                        return (
                          <TabsTrigger key={moduleId} value={moduleId}>
                            {module?.title}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    
                    {selectedModules.map((moduleId) => (
                      <TabsContent key={moduleId} value={moduleId} className="space-y-4">
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
                </div>
              )}
            </>
          )}
          
          {/* Wizard Navigation */}
          <div className="mt-8 pt-6 border-t border-border flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isGenerating}>
                <Check className="mr-2 h-4 w-4" /> Finalizar
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
