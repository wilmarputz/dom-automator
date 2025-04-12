// supabase/functions/generate-content/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'; // Recomendo usar uma versão mais recente se possível
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Confirme a versão do seu cliente Supabase JS
import { OpenAI } from "https://deno.land/x/openai/mod.ts"; // Confirme a versão/alternativa Deno

// --- 1. Definições Centralizadas de Prompts ---

// REGRAS DO UNIVERSO "O MUNDO DE DOM" - ESSENCIAL PARA CONSISTÊNCIA
const DOM_UNIVERSE_RULES = `
Você é um assistente de IA altamente especializado na criação de conteúdo para a série de animação infantil "O Mundo de Dom".
Siga TODAS as regras do universo estritamente:
- Tom Geral: Sonhador, leve, positivo, mágico, encorajador e totalmente apropriado para crianças em idade pré-escolar (3-6 anos). Evite temas complexos, assustadores ou negativos.
- Narração: Sempre em terceira pessoa, com um tom de voz gentil, caloroso e um pouco mágico, como um contador de histórias experiente.
- Estilo de Linguagem: Use frases curtas e simples, vocabulário acessível para crianças pequenas. Seja descritivo de forma visual e sensorial.
- Estilo Visual (para Prompts): O estilo visual padrão é 2D cartoon desenhado à mão, com cores vibrantes (exceto quando especificado), contornos suaves, proporções simples e personagens amigáveis e expressivos. Pense em animações pré-escolares modernas.
- Personagens Principais:
    - Dom: Menino (aprox. 5-6 anos) extremamente curioso, imaginativo, otimista e corajoso. Adora explorar e aprender.
    - Remy: Criatura alienígena inicialmente rosada, flutuante, sem forma definida, com grandes olhos azuis expressivos. Comunica-se por sons ("Blup!") e transformações. É curioso, um pouco tímido no início, mas muito leal e útil. Na Terra, assume a forma de um gato branco com listras laranja e os mesmos olhos azuis.
    - Professora: Adulta gentil, paciente e encorajadora. Fomenta a curiosidade de Dom.
    - Mãe/Pai (Vozes): Vozes calorosas e carinhosas fora de cena.
- Consistência: Mantenha as características dos personagens e os elementos do universo consistentes ao longo de todo o conteúdo gerado.
`;

// TEMPLATES DETALHADOS PARA CADA TIPO DE MÓDULO
const MODULE_TEMPLATES: Record<string, string> = {
  'roteiro_completo': `
Sua tarefa é converter o roteiro base fornecido em um Roteiro Completo de Episódio para 'O Mundo de Dom'.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Cabeçalho de Cena:** Use "[Emoji Relevante] CENA X – NOME DA CENA EM MAIÚSCULAS". Tente usar um emoji que corresponda ao local/contexto da cena (ex: 🎓 para escola, 🏠 para casa, 🚀 para espaço). Deve haver uma linha em branco ANTES de cada cabeçalho de cena.
2.  **Narração:** Escreva "NARRADOR" em maiúsculas numa linha própria. Na linha seguinte, comece o texto da narração.
3.  **Diálogo:**
    * Escreva "NOME_DO_PERSONAGEM" em maiúsculas numa linha própria.
    * Se houver uma indicação de ação ou tom, escreva-a entre parênteses "( )" na linha IMEDIATAMENTE ABAIXO do nome do personagem (ex: "(sorrindo)").
    * Na linha seguinte à indicação de ação/tom (ou diretamente abaixo do nome do personagem se não houver indicação), comece o texto do diálogo. Use "—" (travessão) no início da fala, se apropriado.
4.  **Ações/Sons:** Descrições de ações importantes e sons devem ser incorporadas na narração (ex: "Som de foguete subindo suavemente.").
5.  **Espaçamento:** Mantenha linhas em branco entre blocos (cena, narrador, personagem/diálogo) para clareza.
Adapte TODO o roteiro base para este formato detalhado.`,

  'roteiro_cena': `
Sua tarefa é converter o roteiro base em um Roteiro de Cenas (Shot List) para 'O Mundo de Dom', formatado para geração de imagens por IA.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título:** Comece com "PARTE 1 – ROTEIRO DE CENAS (para geração de imagens com IA)".
2.  **Introdução:** Inclua o parágrafo: "Cada cena está pensada em blocos visuais de 3 a 5 segundos (microcenas), para facilitar a produção no MidJourney e posterior animação com Kling, After Effects etc.".
3.  **Separador de Cena Principal:** Use o caractere "🔹" numa linha própria para separar os blocos de cada CENA principal.
4.  **Cabeçalho de Cena:** Abaixo do separador "🔹", escreva "CENA X – Nome da Cena em Maiúsculas".
5.  **Microcenas:** Liste as microcenas numeradas sequencialmente dentro de cada cena principal (ex: "1.1", "1.2", "2.1", etc.).
6.  **Descrição da Microcena:** Após o número (ex: "1.1 "), escreva uma descrição MUITO CONCISA da AÇÃO VISUAL principal dessa microcena (máx 15 palavras). Foque no que deve ser visto (personagens, objetos, movimento, close-ups). Evite diálogos, use apenas descrições visuais. Exemplo: "1.1 Dom desenha estrelas coloridas no caderno (close na mão e caderno)".
Adapte TODO o roteiro base para esta estrutura de shot list visual.`,

  'prompt_visual': `
Sua tarefa é analisar o roteiro base e gerar Prompts de Criação EM INGLÊS para personagens e cenários chave do episódio 'O Mundo de Dom', formatados para IA de imagem (estilo MidJourney).
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Categorias:** Organize os prompts em categorias lógicas (ex: "Characters", "Scenes"). Use um emoji opcional seguido pelo NOME DA CATEGORIA EM MAIÚSCULAS (ex: "🧒 CHARACTERS", "🌍 SCENES"). Use uma linha em branco entre categorias.
2.  **Itens dentro da Categoria:** Para cada item a ser gerado:
    * Use um emoji opcional relevante seguido pelo Nome do Item em Inglês (ex: "🏫 Preschool Classroom").
    * Na linha seguinte, escreva EXATAMENTE "Prompt (EN):".
    * Na linha seguinte, comece o texto do prompt DETALHADO em INGLÊS. Use uma linha em branco antes do próximo item.
3.  **Conteúdo do Prompt (EN):** O prompt em inglês DEVE incluir: "2D hand-drawn cartoon style, simple shapes, soft outlines, vibrant colors, for preschool children animation (like 'Bluey' or 'Puffin Rock')". Adicione detalhes específicos do item (aparência, cores, roupas, humor, ambiente, iluminação) conforme descrito no roteiro base. Para cenários, adicione "wide angle, 16:9 aspect ratio". Para personagens isolados, adicione "plain white background".
Gere prompts para TODOS os elementos visuais distintos e importantes do roteiro base.`,

  'roteiro_livro': `
Sua tarefa é adaptar o roteiro base fornecido para o formato de um Roteiro de Livro Ilustrado infantil de 'O Mundo de Dom'.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título:** (Opcional) Comece com "Livro 1 – O Planeta Sem Cor (Roteiro ilustrado por página)".
2.  **Separador/Marcador de Página:** Use o caractere "🟦" numa linha própria para indicar o início de CADA nova página.
3.  **Cabeçalho de Página:** Na linha IMEDIATAMENTE ABAIXO do separador "🟦", escreva "Página X" (onde X é o número da página, começando em 1).
4.  **Texto da Página:** Na linha(s) IMEDIATAMENTE ABAIXO do cabeçalho "Página X", escreva o texto narrativo para essa página. O texto deve ser CURTO (1-3 frases simples), em 3ª pessoa, com tom leve e mágico. Diálogos devem ser integrados de forma simples (ex: "Dom perguntou: — Existe um planeta mágico?"). NÃO inclua sugestões visuais explícitas, apenas o texto que aparecerá na página do livro.
Divida TODA a história do roteiro base em páginas curtas seguindo este formato.`,

  'roteiro_audiobook': `
Sua tarefa é adaptar o texto (preferencialmente do Roteiro de Livro Ilustrado ou Roteiro Completo) para um Roteiro de Audiobook de 'O Mundo de Dom'.
Siga ESTRITAMENTE o formato:
- Mantenha o texto narrativo e os diálogos originais.
- Insira marcações claras entre colchetes "[]" ANTES da palavra ou frase a que se aplicam, para guiar o narrador de voz:
    - Entonações: "[curioso]", "[empolgado]", "[sussurrando]", "[voz gentil]", "[rindo]".
    - Pausas: "[pausa curta]", "[pausa média]", "[pausa longa]".
    - Efeitos Sonoros (SFX): "[SFX: sino da escola toca suavemente]", "[SFX: foguete de papelão 'fwoosh']", "[SFX: som 'Blup!' fofo e aquoso]", "[SFX: miado gentil]".
    - Música (Sugestão): "[MÚSICA: tema principal suave ao fundo]", "[MÚSICA: tema de aventura diminui]".
    - Indicação de Voz (se diferente do narrador principal): Use apenas se houver múltiplos narradores. Ex: "[VOZ PROFESSORA]". Para diálogos normais, não é necessário, pois o nome do personagem já indica quem fala no roteiro completo.
O objetivo é criar um roteiro pronto para gravação de áudio profissional.`,
};

// Função auxiliar para obter o prompt completo do sistema
function getSystemPrompt(moduleType: string): string {
  const templateInstructions = MODULE_TEMPLATES[moduleType];
  if (!templateInstructions) {
    throw new Error(`Template não definido para o tipo de módulo: ${moduleType}`);
  }
  // Combina as regras GERAIS do universo com as instruções ESPECÍFICAS do template
  return `${DOM_UNIVERSE_RULES}\n\n**INSTRUÇÕES ESPECÍFICAS PARA ESTA TAREFA:**\n${templateInstructions}\n\n**REGRAS ADICIONAIS:**\n- Siga TODAS as regras e o formato ESTRITAMENTE.\n- Use linguagem apropriada para crianças pré-escolares.\n- Seja criativo dentro das diretrizes, mas não invente informações fora do roteiro base.\n- A saída deve conter APENAS o conteúdo solicitado no formato especificado, sem comentários adicionais ou introduções suas.`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Restrinja em produção!
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Lógica Principal da Edge Function ---
serve(async (req: Request) => {
  // Responde a preflight requests (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Configurar Supabase Client (com autenticação do usuário)
    // Assegura que as variáveis de ambiente estão definidas no Supabase Edge Runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase URL or Anon Key not set in environment variables.");
        throw new Error("Configuração interna do servidor incompleta.");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      // Obtém o token JWT do header da requisição do frontend
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Verificar Autenticação do Usuário
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Generate Content - User Auth Error:', userError?.message || 'No user session');
      return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`User ${user.id} authenticated.`);

    // 3. Validar Input da Requisição (Corpo JSON)
    const { episode_id, module_type } = await req.json();
    if (!episode_id || typeof episode_id !== 'string' || !module_type || typeof module_type !== 'string') {
      return new Response(JSON.stringify({ error: 'Parâmetros inválidos: episode_id (string) e module_type (string) são obrigatórios.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Verifica se o module_type é um dos definidos nos templates
    if (!MODULE_TEMPLATES[module_type]) {
        console.warn(`Invalid module_type received: ${module_type}`);
        return new Response(JSON.stringify({ error: `Tipo de módulo inválido fornecido: ${module_type}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`Input validated: episode_id=${episode_id}, module_type=${module_type}`);

    // 4. Buscar Roteiro Base do Episódio (RLS garante a permissão)
    console.log(`Workspaceing base script for episode ${episode_id}`);
    const { data: episodeData, error: episodeError } = await supabaseClient
      .from('episodes')
      .select('title, base_script') // Busca também o título para usar no prompt
      .eq('id', episode_id)
      .single(); // Espera encontrar exatamente 1 ou 0 registos

    if (episodeError) {
        if (episodeError.code === 'PGRST116') { // Código para 'resource not found'
             console.error(`Episode ${episode_id} not found or user ${user.id} lacks permission.`);
             return new Response(JSON.stringify({ error: 'Episódio não encontrado ou acesso negado.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } else {
            console.error('Generate Content - Episode Fetch DB Error:', episodeError);
            return new Response(JSON.stringify({ error: 'Erro ao buscar dados do episódio.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }
    if (!episodeData || !episodeData.base_script) { // Verifica se base_script não é null/vazio
         console.error(`Episode ${episode_id} not found or base_script is missing.`);
         return new Response(JSON.stringify({ error: 'Roteiro base do episódio não encontrado.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const baseScript = episodeData.base_script;
    const episodeTitle = episodeData.title || 'Episódio Sem Título'; // Usa o título do episódio
    console.log(`Base script fetched successfully for episode ${episode_id}.`);

    // 5. Preparar e Chamar OpenAI API
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
        console.error('CRITICAL: OPENAI_API_KEY secret not found!');
        return new Response(JSON.stringify({ error: 'Erro de configuração interna do servidor (chave OpenAI ausente).' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Inicializa o cliente OpenAI AQUI, dentro da função, pois precisa da chave
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Constrói os prompts dinamicamente
    const systemPrompt = getSystemPrompt(module_type); // Combina regras + template
    // O User Prompt agora só precisa do contexto principal
    const userPrompt = `Título do Episódio: ${episodeTitle}\n\nRoteiro Base para Processar:\n---\n${baseScript}\n---`;

    console.log(`Calling OpenAI API for module: ${module_type}, episode: ${episode_id}...`);
    let generatedText = '';
    try {
        // Usa a sintaxe correta da v4 da biblioteca OpenAI
        const chatCompletion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "gpt-4-turbo", // Modelo recomendado (verificar nome exato e disponibilidade)
          temperature: 0.35,     // Temperatura baixa para maior aderência ao template e regras
          max_tokens: 3800,     // Limite generoso; ajuste fino pode ser necessário
          // top_p: 1, // Geralmente não necessário com baixa temperatura
          // frequency_penalty: 0, // Evitar penalidades que podem prejudicar a formatação
          // presence_penalty: 0,
        });

        generatedText = chatCompletion.choices[0]?.message?.content?.trim() ?? '';

        if (!generatedText) {
            console.warn(`OpenAI returned empty content for module: ${module_type}, episode: ${episode_id}.`);
            throw new Error('A IA não retornou conteúdo. Tente novamente.');
        }
        console.log(`OpenAI call successful. Content length: ${generatedText.length}`);

    } catch (openaiError) {
        console.error(`OpenAI API Call Error for module ${module_type}, episode ${episode_id}:`, openaiError);
        let errorMessage = 'Falha ao comunicar com o serviço de IA. Verifique sua chave OpenAI e tente novamente.';
        // Tenta extrair mensagens de erro específicas da OpenAI
        if (openaiError?.status === 401) {
            errorMessage = 'Erro de autenticação com a OpenAI. Verifique sua chave API.';
        } else if (openaiError?.status === 429) {
            errorMessage = 'Limite de requisições da OpenAI atingido. Tente novamente mais tarde.';
        } else if (openaiError?.error?.message) {
             errorMessage = `Erro da OpenAI: ${openaiError.error.message}`;
        } else if (openaiError instanceof Error) {
             errorMessage = `Erro OpenAI: ${openaiError.message}`;
        }
        // Retorna um erro 502 (Bad Gateway) para indicar falha na comunicação com serviço externo
        return new Response(JSON.stringify({ error: errorMessage }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 6. Salvar Conteúdo Gerado na Base de Dados (Usando Upsert)
    console.log(`Attempting to save generated content to DB for module: ${module_type}, episode: ${episode_id}`);
    const { data: savedContent, error: saveError } = await supabaseClient
      .from('generated_content')
      .upsert(
        {
          episode_id: episode_id,
          module_type: module_type,
          content: generatedText,
          // 'updated_at' é atualizado automaticamente pelo Supabase em upsert/update
        },
        {
          onConflict: 'episode_id, module_type', // Nome da constraint UNIQUE (VERIFICAR PASSO 7 nas instruções)
        }
      )
      .select('id, module_type, updated_at, content') // Retorna o conteúdo salvo para o frontend
      .single();

    // Verifica se a constraint UNIQUE 'generated_content_episode_module_unique' existe!
    if (saveError) {
      console.error('Generate Content - Save Content DB Error:', saveError);
      // Verifica se o erro é devido à constraint ausente (código específico pode variar)
      if (saveError.message.includes("constraint") && saveError.message.includes("does not exist")) {
         return new Response(JSON.stringify({ error: 'Erro de configuração da base de dados (constraint UNIQUE ausente). Contacte o administrador.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Falha ao salvar o conteúdo gerado na base de dados.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`Generated content saved/updated successfully. Record ID: ${savedContent.id}`);

    // 7. Retornar Resposta de Sucesso para o Frontend (com o conteúdo salvo)
    return new Response(JSON.stringify(savedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // OK
    });

  } catch (error) {
    // Captura erros gerais não tratados (ex: erro ao parsear JSON do request, erros inesperados)
    console.error('Generate Content - Uncaught General Error:', error);
    return new Response(JSON.stringify({ error: `Erro interno inesperado no servidor: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Internal Server Error
    });
  }
}); // Fim da função serve