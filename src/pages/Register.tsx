
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await register(email, password);
      if (error) throw error;
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center py-12 md:py-24">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Crie sua conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Cadastre-se para começar a usar o Dom Script Automator
              </p>
            </div>

            <AuthForm 
              type="register" 
              onSubmit={handleRegister}
              isLoading={isLoading}
            />

            <p className="px-8 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                Entrar
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
