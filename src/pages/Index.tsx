
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Headphones, 
  Clapperboard,
  ChevronRight
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Dom Script Forge
                  </h1>
                  <p className="text-gradient text-xl sm:text-2xl">
                    Sua ferramenta de criação para a série "O Mundo de Dom"
                  </p>
                </div>
                <div className="max-w-[600px] text-muted-foreground md:text-xl">
                  <p>
                    Automatize a geração de diferentes formatos de roteiros e prompts criativos 
                    para a série de animação "O Mundo de Dom" com o poder da Inteligência Artificial.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/register">
                    <Button className="px-8">
                      Começar Agora
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline">Já tenho uma conta</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="glass-card rounded-lg p-8 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4">
                    Transforme roteiros base em múltiplos formatos:
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex">
                      <Lightbulb className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-bold">Prompts Visuais</span>
                        <p className="text-sm text-muted-foreground">
                          Descrições visuais detalhadas para cada cena
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <FileText className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-bold">Roteiro Completo</span>
                        <p className="text-sm text-muted-foreground">
                          Roteiro detalhado com diálogos e narração
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <Clapperboard className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-bold">Roteiro de Cena</span>
                        <p className="text-sm text-muted-foreground">
                          Formato quadro a quadro com tempos estimados
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <BookOpen className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-bold">Livro Ilustrado</span>
                        <p className="text-sm text-muted-foreground">
                          Adaptação otimizada para formato de livro
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <Headphones className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-bold">Audiobook</span>
                        <p className="text-sm text-muted-foreground">
                          Versão adaptada para narração em áudio
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Como funciona
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simplifique o processo de criação mantendo a consistência com o universo narrativo da série
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 glass-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Insira o Roteiro Base</h3>
                <p className="text-muted-foreground">
                  Cole o texto do roteiro base ou faça upload de um arquivo 
                  para iniciar o processo criativo.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 glass-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Selecione os Módulos</h3>
                <p className="text-muted-foreground">
                  Escolha quais tipos de conteúdo você deseja gerar 
                  a partir do roteiro base.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 glass-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Edite e Exporte</h3>
                <p className="text-muted-foreground">
                  Revise o conteúdo gerado, faça edições conforme necessário 
                  e exporte nos formatos desejados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Pronto para começar?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Crie uma conta agora e comece a gerar conteúdo criativo para "O Mundo de Dom"
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/register">
                  <Button size="lg" className="px-8">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
