// src/lib/openai.ts
import { Configuration, OpenAIApi } from 'https://deno.land/x/openai@v4.20.1/mod.ts'; // Atenção à importação Deno vs Node

// NOTA: A maior parte desta lógica (rate limiting, error handling) pode ser
// simplificada ou adaptada se a chamada principal à API for feita diretamente
// na Edge Function 'generate-content', como no exemplo atualizado acima.
// Esta biblioteca torna-se mais útil se você tiver *múltiplas* funções
// chamando OpenAI e quiser centralizar validação e rate limiting.

// Rate limiting configuration (Exemplo Simples - pode precisar de algo mais robusto)
const RATE_LIMIT = {
  maxRequests: 50, // Maximum requests per minute (Ajuste conforme seu plano OpenAI)
  windowMs: 60000, // 1 minute window
  requests: new Map<string, number[]>(), // Track requests per API key (In-memory, resetará com deploy da função)
};

// Error types (Pode simplificar ou remover se o erro for tratado na função principal)
export enum OpenAIErrorType {
  RateLimit = 'rate_limit',
  InvalidApiKey = 'invalid_api_key',
  Timeout = 'timeout',
  Unknown = 'unknown',
}

export interface OpenAIError {
  type: OpenAIErrorType;
  message: string;
  retryAfter?: number;
}

// Check rate limit for an API key
function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  const requests = RATE_LIMIT.requests.get(apiKey) || [];
  const windowRequests = requests.filter(time => time > windowStart);
  RATE_LIMIT.requests.set(apiKey, windowRequests); // Atualiza a lista de timestamps
  return windowRequests.length < RATE_LIMIT.maxRequests;
}

// Add request to rate limit tracking
function trackRequest(apiKey: string): void {
  const requests = RATE_LIMIT.requests.get(apiKey) || [];
  requests.push(Date.now());
  RATE_LIMIT.requests.set(apiKey, requests);
}

// Initialize OpenAI client (v4 Syntax - Note que a função 'generate-content' agora inicializa o cliente diretamente)
// Esta função pode ser usada por 'check-openai-config' ou outras libs.
export function initOpenAI(apiKey: string): OpenAI { // Retorna o tipo correto da v4
  // Não precisa mais de 'new OpenAIApi' nem 'Configuration'
  // Retorna a instância diretamente
  return new OpenAI({
    apiKey: apiKey,
    // dangerouslyAllowBrowser: true // REMOVIDO - Não necessário/recomendado no backend
  });
}

// Validate API key format
export function isValidApiKey(apiKey: string): boolean {
  // Regex simples para verificar o formato 'sk-...', ajuste se necessário
  return typeof apiKey === 'string' && /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
}

// Helper to handle OpenAI errors (Pode ser simplificado ou movido)
export function handleOpenAIError(error: any): OpenAIError {
    // Adaptação para a estrutura de erro da v4 (pode variar ligeiramente)
    if (error?.status === 429) { // Rate limit
        const retryAfterHeader = error.headers?.['retry-after'];
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
        return {
            type: OpenAIErrorType.RateLimit,
            message: 'Rate limit da OpenAI excedido. Tente novamente mais tarde.',
            retryAfter,
        };
    }
    if (error?.status === 401) { // Invalid API Key
        return {
            type: OpenAIErrorType.InvalidApiKey,
            message: 'Chave API da OpenAI inválida ou não autorizada.',
        };
    }
    // Deno não tem error.code como Node para timeouts, verificar erros de rede Deno se necessário
    // Exemplo genérico:
    if (error instanceof Error && (error.message.includes('timed out') || error.message.includes('network error'))) {
         return {
             type: OpenAIErrorType.Timeout,
             message: 'Timeout ou erro de rede ao contactar OpenAI.',
         };
    }

    // Outros erros da API OpenAI podem ter uma estrutura error.error.message
    const message = error?.error?.message || error?.message || 'Ocorreu um erro inesperado ao processar o pedido OpenAI.';
    return {
        type: OpenAIErrorType.Unknown,
        message: message,
    };
}


// Wrapper para fazer chamadas OpenAI (pode não ser mais necessário para generate-content)
// Mantido caso 'check-openai-config' ou outros o usem.
export async function makeOpenAIRequest<T>(
  apiKey: string,
  requestFn: () => Promise<T> // A função que faz a chamada real
): Promise<T> {
  if (!isValidApiKey(apiKey)) {
    // Lança um erro mais específico para o frontend capturar
    throw { type: OpenAIErrorType.InvalidApiKey, message: 'Formato da chave API inválido.' };
  }

  if (!checkRateLimit(apiKey)) {
    // Lança um erro mais específico
    throw { type: OpenAIErrorType.RateLimit, message: 'Rate limit atingido. Tente mais tarde.' };
  }

  try {
    trackRequest(apiKey); // Rastreia antes de tentar
    const response = await requestFn(); // Executa a chamada real passada como argumento
    return response;
  } catch (error) {
    // Re-lança o erro já formatado pelo handleOpenAIError ou um erro genérico
    throw handleOpenAIError(error);
  }
}