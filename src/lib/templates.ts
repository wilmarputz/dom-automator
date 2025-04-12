// Templates para geração de conteúdo com OpenAI

export const TEMPLATES = {
  prompt_visual: `
Sua tarefa é analisar o roteiro base e gerar Prompts de Criação EM INGLÊS para personagens e cenários chave do episódio 'O Mundo de Dom', formatados para IA de imagem (estilo MidJourney).

Siga ESTRITAMENTE O SEGUINTE FORMATO:
1. **Título:** (Opcional) Comece com "Episódio X – Nome do Episódio".
2. **Categorias:** Organize os prompts em categorias lógicas (ex: "Personagens", "Cenários"). Use um emoji seguido pelo NOME DA CATEGORIA EM MAIÚSCULAS.
3. **Itens dentro da Categoria:** Para cada item:
   * Use um emoji relevante seguido pelo Nome do Item
   * Na linha seguinte, escreva "Prompt (EN):"
   * Na linha seguinte, o prompt DETALHADO em INGLÊS
4. **Conteúdo do Prompt (EN):** O prompt DEVE incluir:
   * Estilo base: "2D hand-drawn cartoon style"
   * Público/Detalhe: "preschool animation/cartoon", "simple proportions", "friendly", "cozy", "colorful"
   * Detalhes específicos do item conforme o roteiro
   * Para cenários: "16:9 composition"
   * Para personagens isolados: "White background" se apropriado
`,

  roteiro_completo: `
Sua tarefa é converter o roteiro base em um Roteiro Completo de Episódio para 'O Mundo de Dom'.

Siga ESTRITAMENTE O SEGUINTE FORMATO:
1. **Título do Episódio:** (Opcional) "Episódio X: Nome do Episódio"
2. **Cabeçalho de Cena:** "[Emoji] CENA X – NOME DA CENA"
3. **Narração:** "NARRADOR" em linha própria, seguido pelo texto
4. **Diálogo:**
   * "NOME_DO_PERSONAGEM" em maiúsculas
   * Ação/tom entre parênteses "( )" na linha seguinte
   * Diálogo com travessão "—" na próxima linha
5. **Ações:** Descritas na narração ou nas indicações de ação
6. **Espaçamento:** Linhas em branco entre blocos para clareza
`,

  roteiro_cena: `
Sua tarefa é criar um Roteiro de Cenas (Shot List) para 'O Mundo de Dom', formatado para geração de imagens por IA.

Siga ESTRITAMENTE O SEGUINTE FORMATO:
1. **Título:** "PARTE X – ROTEIRO DE CENAS"
2. **Introdução:** Explicação do propósito (microcenas 3-5s)
3. **Separador de Cena:** Caractere "🔹" em linha própria
4. **Cabeçalho:** "CENA X – Nome da Cena"
5. **Microcenas:** Numeradas sequencialmente ("1.1", "1.2", etc.)
6. **Descrição:** AÇÃO VISUAL CONCISA da microcena
`,

  roteiro_livro: `
Sua tarefa é adaptar o roteiro base para um Roteiro de Livro Ilustrado infantil de 'O Mundo de Dom'.

Siga ESTRITAMENTE O SEGUINTE FORMATO:
1. **Título:** "Livro X – Nome do Livro"
2. **Separador:** Caractere "🟦" para cada nova página
3. **Cabeçalho:** "Página X" na linha seguinte
4. **Texto:** Narrativa CURTA e SIMPLES em 3ª pessoa
   * Tom leve e mágico
   * Diálogos integrados de forma simples
   * Sem sugestões visuais explícitas
`,

  roteiro_audiobook: `
Sua tarefa é adaptar o texto para um Roteiro de Audiobook de 'O Mundo de Dom'.

Siga ESTRITAMENTE o formato:
1. **Texto:** Manter narrativa e diálogos
2. **Marcações entre colchetes []:**
   * Entonações: "[com curiosidade]", "[empolgado]"
   * Pausas: "[pausa curta]", "[pausa dramática]"
   * Efeitos (SFX): "[efeito: descrição]"
   * Música: "[música: descrição]"
   * Vozes: "[voz: Personagem]"
`
};

export type ModuleType = keyof typeof TEMPLATES;