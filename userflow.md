Acesso e Login:

O usuário acede à URL da aplicação.
É apresentada uma tela de login (Email/Senha).
Ação: O usuário insere as suas credenciais e clica em "Entrar".
(Alternativa: Novo Usuário) Se for um novo usuário, clica em "Registar", preenche os dados, e regista-se. Pode ser necessária confirmação por email. Após o registo, faz login.
Sistema: O frontend comunica com o Supabase Auth para verificar/criar o usuário.
Resultado: Após login bem-sucedido, o usuário é redirecionado para o Dashboard.
Dashboard (Painel Principal):

O usuário vê o seu painel personalizado.
Conteúdo: Exibe uma lista dos episódios criados anteriormente por esse usuário (ex: Título, Data da Última Modificação).
Ações Disponíveis:
Visualizar/Editar um episódio existente (clicando no nome/card do episódio).
Iniciar a criação de um novo episódio (clicando num botão como "+ Criar Novo Episódio").
Sistema: O frontend busca a lista de episódios do usuário (via Supabase Client ou Edge Function get-episodes), respeitando a RLS.
Iniciar Criação de Novo Episódio:

Ação: O usuário clica no botão "+ Criar Novo Episódio".
Resultado: É redirecionado para o primeiro passo do "Wizard de Criação".
Wizard de Criação - Passo 1: Informações Base:

Interface: Formulário para inserir o "Título do Episódio" e o "Roteiro Base". Oferece opções para colar o texto diretamente ou fazer upload de um ficheiro (.txt, .docx).
Ação: O usuário preenche o título, insere/uploada o roteiro base e clica em "Próximo" (ou similar).
Sistema: O frontend pode guardar temporariamente estes dados ou (recomendado) chamar uma Edge Function (create-episode) que insere o novo episódio na tabela episodes (associado ao user_id) e retorna o episode_id gerado.
Wizard de Criação - Passo 2: Seleção de Módulos:

Interface: Apresenta as opções de conteúdo a serem gerados via IA como caixas de seleção ou cards clicáveis:
[A] Prompts Visuais (MidJourney)
[B] Roteiro Completo do Episódio
[C] Roteiros de Cena (Quadro a Quadro)
[D] Roteiro de Livro Ilustrado
[E] Roteiro de Audiobook
Ação: O usuário seleciona um ou mais módulos desejados e clica em "Gerar Conteúdos Selecionados".
Wizard de Criação - Passo 3: Geração e Visualização:

Interface: Exibe indicadores de progresso/loading (idealmente, um para cada módulo selecionado).
Sistema (Background): Para cada módulo selecionado, o frontend dispara uma chamada à Edge Function generate-content, enviando o episode_id e o module_type específico.
Sistema (Backend - Edge Function): A função generate-content:
Verifica a autenticação.
Busca o base_script do episódio.
Seleciona o system_prompt correto com base no module_type.
Chama a API da OpenAI com os prompts e o roteiro base.
Recebe a resposta da OpenAI.
Salva (usando upsert) o conteúdo gerado na tabela generated_content.
Retorna o conteúdo gerado/salvo para o frontend.
Interface (Atualização): À medida que cada chamada da função retorna com sucesso, o indicador de loading do módulo correspondente desaparece, e o conteúdo gerado é exibido numa área de texto editável (organizado por abas, acordeões, ou secções).
Revisão e Edição:

Interface: O usuário agora vê todos os conteúdos gerados para os módulos selecionados, apresentados em editores de texto.
Ação:
O usuário lê e revê cada texto gerado.
O usuário pode editar manualmente o texto diretamente em qualquer um dos campos.
(Opcional) Poderia haver um botão "Regerar" por módulo para chamar novamente a função generate-content para aquele item específico.
Após terminar a revisão/edição, o usuário clica em "Salvar Alterações" ou "Concluir".
Salvar Alterações (Pós-Edição Manual):

Ação: Usuário clica em "Salvar Alterações".
Sistema: O frontend identifica quais campos de generated_content foram modificados manualmente pelo usuário após a geração inicial. Para cada campo modificado, ele chama uma Edge Function update-generated-content (ou usa supabase.from(...).update(...) diretamente) para atualizar o registo correspondente na base de dados com o novo content. Se nada foi editado manualmente, este passo pode não fazer nada ou apenas confirmar a conclusão.
Conclusão e Retorno ao Dashboard:

Ação: Após salvar (ou decidir não salvar/editar mais), o usuário navega de volta para o Dashboard (automaticamente ou clicando num botão "Voltar" ou "Concluir").
Resultado: O Dashboard é exibido, potencialmente atualizado para refletir o novo episódio ou as alterações no episódio existente.
Visualizar/Editar Episódio Existente (A partir do Dashboard):

Ação: No Dashboard, o usuário clica num episódio da lista.
Sistema: O frontend busca os detalhes completos desse episódio, incluindo o base_script (da tabela episodes) e todos os registos associados na tabela generated_content (via Edge Function get-episode-details ou chamadas diretas ao Supabase).
Resultado: O usuário é levado diretamente para a tela de "Revisão e Edição" (Passo 7), com todos os campos preenchidos com os dados salvos daquele episódio, pronto para visualização ou novas edições.