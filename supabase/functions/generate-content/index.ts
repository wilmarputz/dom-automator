
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const TEMPLATES = {
  prompt_visual: `
Sua tarefa é analisar o roteiro base e gerar Prompts de Criação EM INGLÊS para personagens e cenários chave do episódio 'O Mundo de Dom', formatados para IA de imagem (estilo MidJourney).
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título:** (Opcional) Comece com "Episódio X – Nome do Episódio".
2.  **Categorias:** Organize os prompts em categorias lógicas (ex: "Personagens", "Cenários"). Pode usar um emoji opcional seguido pelo NOME DA CATEGORIA EM MAIÚSCULAS (ex: "🧒 PERSONAGENS", "🌍 CENÁRIOS").
3.  **Itens dentro da Categoria:** Para cada item a ser gerado (personagem ou cenário):
    * Use um emoji opcional relevante seguido pelo Nome do Item (ex: "🏫 Sala de Aula Infantil").
    * Na linha seguinte, escreva EXATAMENTE "Prompt (EN):".
    * Na linha seguinte, comece o texto do prompt DETALHADO em INGLÊS.
4.  **Conteúdo do Prompt (EN):** O prompt em inglês DEVE incluir:
    * Estilo base: "2D hand-drawn cartoon style".
    * Público/Detalhe: "preschool animation/cartoon", "simple proportions", "friendly", "cozy", "colorful" (a menos que o roteiro especifique ausência de cor, como no planeta cinza).
    * Detalhes específicos do item (cores, roupas, ambiente, atmosfera) conforme descrito no roteiro base.
    * Para cenários, adicione "16:9 composition".
    * Para personagens isolados, pode adicionar "White background" se apropriado.
Gere prompts para TODOS os elementos visuais distintos e importantes mencionados ou implícitos no roteiro base.`,

  roteiro_completo: `
Sua tarefa é converter o roteiro base fornecido em um Roteiro Completo de Episódio para 'O Mundo de Dom'.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título do Episódio:** (Opcional, pode omitir se já existir) Comece com "Episódio X: Nome do Episódio".
2.  **Cabeçalho de Cena:** Use "[Emoji Relevante] CENA X – NOME DA CENA EM MAIÚSCULAS". Tente usar um emoji que corresponda ao local/contexto da cena (ex: 🎓 para escola, 🏠 para casa, 🚀 para espaço). Se não for óbvio, use um emoji genérico ou omita. Deve haver uma linha em branco antes de cada cabeçalho de cena.
3.  **Narração:** Escreva "NARRADOR" em maiúsculas numa linha própria. Na linha seguinte, comece o texto da narração.
4.  **Diálogo:**
    * Escreva "NOME_DO_PERSONAGEM" em maiúsculas numa linha própria.
    * Se houver uma indicação de ação ou tom, escreva-a entre parênteses "( )" na linha IMEDIATAMENTE ABAIXO do nome do personagem (ex: "(sorrindo)").
    * Na linha seguinte à indicação de ação/tom (ou diretamente abaixo do nome do personagem se não houver indicação), comece o texto do diálogo. Use "—" (travessão) no início da fala, se apropriado.
5.  **Ações no Roteiro:** Ações importantes podem ser descritas na narração ou brevemente nas indicações de ação/tom. Sons podem ser mencionados na narração (ex: "Som de foguete subindo suavemente.").
6.  **Espaçamento:** Mantenha linhas em branco entre blocos (cena, narrador, personagem/diálogo) para clareza, conforme o exemplo fornecido.
Adapte TODO o roteiro base para este formato detalhado.`,

  roteiro_cena: `
Sua tarefa é converter o roteiro base em um Roteiro de Cenas (Shot List) para 'O Mundo de Dom', formatado para geração de imagens por IA.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título:** Comece com "PARTE X – ROTEIRO DE CENAS (para geração de imagens com IA)".
2.  **Introdução:** Inclua um parágrafo introdutório explicando o propósito (microcenas 3-5s, IA, etc.), como no exemplo.
3.  **Separador de Cena Principal:** Use o caractere "🔹" numa linha própria para separar os blocos de cada CENA principal.
4.  **Cabeçalho de Cena:** Abaixo do separador "🔹", escreva "CENA X – Nome da Cena em Maiúsculas".
5.  **Microcenas:** Liste as microcenas numeradas sequencialmente dentro de cada cena principal (ex: "1.1", "1.2", "2.1", etc.).
6.  **Descrição da Microcena:** Após o número (ex: "1.1 "), escreva uma descrição MUITO CONCISA da AÇÃO VISUAL principal dessa microcena. Foque no que deve ser visto (personagens, objetos, movimento, close-ups). Evite diálogos, use apenas descrições visuais. Exemplo: "1.1 Dom desenha estrelas no caderno (close)".
Adapte TODO o roteiro base para esta estrutura de shot list visual.`,

  roteiro_livro: `
Sua tarefa é adaptar o roteiro base fornecido para o formato de um Roteiro de Livro Ilustrado infantil de 'O Mundo de Dom'.
Siga ESTRITAMENTE O SEGUINTE FORMATO:
1.  **Título:** Comece com "Livro X – Nome do Livro (Roteiro ilustrado por página)".
2.  **Separador/Marcador de Página:** Use o caractere "🟦" numa linha própria para indicar o início de CADA nova página.
3.  **Cabeçalho de Página:** Na linha IMEDIATAMENTE ABAIXO do separador "🟦", escreva "Página X" (onde X é o número da página, começando em 1).
4.  **Texto da Página:** Na linha(s) IMEDIATAMENTE ABAIXO do cabeçalho "Página X", escreva o texto narrativo para essa página. O texto deve ser CURTO, SIMPLES, em 3ª pessoa, com tom leve e mágico. Diálogos devem ser integrados de forma simples (ex: "Dom sorriu:\n— Oi!"). NÃO inclua sugestões visuais explícitas como "[SUGESTÃO VISUAL:]", apenas o texto narrativo da página.
Divida TODA a história do roteiro base em páginas curtas seguindo este formato.`,

  roteiro_audiobook: `
Sua tarefa é adaptar o texto (preferencialmente do Roteiro de Livro Ilustrado ou do Roteiro Completo, o que for mais apropriado como base a partir do roteiro original) para um Roteiro de Audiobook de 'O Mundo de Dom'.
Siga ESTRITAMENTE o formato:
- Mantenha o texto narrativo e os diálogos.
- Insira marcações claras entre colchetes "[]" para guiar o narrador de voz:
    - Entonações: Ex: "[com curiosidade]", "[empolgado]", "[sussurrando]", "[tom gentil]".
    - Pausas: Ex: "[pausa curta]", "[pausa dramática]", "[pausa longa]".
    - Efeitos Sonoros (SFX): Ex: "[efeito: sino da escola toca]", "[efeito: som suave 'fwoosh']", "[efeito: 'Blup!' fofo]", "[efeito: miado suave]".
    - Música (Sugestão): Ex: "[música: tema de abertura suave entra e some]", "[música: tema de aventura leve diminui]".
    - Vozes (se necessário distinguir do narrador principal): Ex: "[voz: Professora]", "[voz: Dom]".
O objetivo é criar um roteiro pronto para gravação de áudio, mantendo o tom mágico e infantil de 'O Mundo de Dom'.`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const { episodeId, moduleType, title, baseScript } = await req.json();

    if (!moduleType || !baseScript) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: moduleType and baseScript are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the template for the requested module type
    const template = TEMPLATES[moduleType as keyof typeof TEMPLATES];
    if (!template) {
      return new Response(
        JSON.stringify({
          error: `Invalid module type: ${moduleType}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare context for the OpenAI request
    const context = `
Título do Episódio: ${title || "Sem título"}
Roteiro Base:
${baseScript}

${template}
`;

    // Make the request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",  // Using GPT-4o for high quality output
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em roteirização e produção de conteúdo infantil educativo. Seu trabalho é criar conteúdo para o mundo de Dom, uma série infantil.",
          },
          {
            role: "user",
            content: context,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const openAIResponse = await response.json();
    
    if (openAIResponse.error) {
      console.error("OpenAI API error:", openAIResponse.error);
      return new Response(
        JSON.stringify({
          error: "Error from OpenAI API",
          details: openAIResponse.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const generatedContent = openAIResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({
        content: generatedContent,
        moduleType,
        episodeId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
