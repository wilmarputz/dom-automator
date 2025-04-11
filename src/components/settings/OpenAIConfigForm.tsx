
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const OpenAIConfigForm = () => {
  const [apiKey, setApiKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const checkConfiguration = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-openai-config', {
        body: {},
      });
      
      if (error) throw error;
      setIsConfigured(data.configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
      toast({
        title: 'Erro ao verificar configuração',
        description: 'Não foi possível verificar se a API key da OpenAI está configurada.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check configuration on component mount
  useState(() => {
    checkConfiguration();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // We don't actually store the API key in our database
      // Instead, we set it as a secret for the edge function
      const { error } = await supabase.functions.invoke('set-openai-secret', {
        body: { apiKey },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Configuração salva',
        description: 'A API key da OpenAI foi configurada com sucesso.',
      });
      
      setApiKey('');
      checkConfiguration();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Erro ao salvar configuração',
        description: 'Não foi possível salvar a API key da OpenAI.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuração da OpenAI
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isConfigured === true ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : isConfigured === false ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : null}
        </CardTitle>
        <CardDescription>
          Configure sua API key da OpenAI para habilitar a geração de conteúdo com IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key da OpenAI</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Sua API key será armazenada com segurança e usada apenas para gerar conteúdo.
              Você pode obter uma key em{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>
          
          <Button type="submit" disabled={isSubmitting || !apiKey}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar API Key'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isConfigured === true && (
            <span className="flex items-center text-green-600">
              <CheckCircle className="mr-1 h-4 w-4" />
              API Key configurada
            </span>
          )}
          {isConfigured === false && (
            <span className="flex items-center text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              API Key não configurada
            </span>
          )}
        </div>
        <Button variant="outline" onClick={checkConfiguration} disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Configuração'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
