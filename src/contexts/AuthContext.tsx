
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupAuthListener, getCurrentUser, signOut as supabaseSignOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up the auth listener
    const unsubscribe = setupAuthListener((authUser) => {
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Initial check
    checkUser();

    // Cleanup the listener
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      toast({
        title: 'Logout bem-sucedido',
        description: 'Você foi desconectado com sucesso',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro ao sair',
        description: error.message || 'Ocorreu um erro ao tentar sair.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
