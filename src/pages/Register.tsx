
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password);
      
      toast({
        title: "Cadastro bem-sucedido",
        description: "Sua conta foi criada com sucesso",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao tentar criar sua conta.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Crie sua conta
                </h1>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Comece a criar roteiros e prompts para "O Mundo de Dom"
                </p>
              </div>
              <div className="w-full max-w-md mx-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-muted-foreground">Criando sua conta...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <AuthForm type="register" onSubmit={handleRegister} />
                    <div className="mt-4 text-center text-sm">
                      Já tem uma conta?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Entrar
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
