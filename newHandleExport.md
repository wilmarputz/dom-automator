// Dentro do componente CreateEpisode.tsx ou EditEpisode.tsx

// ... (outros imports, estados e funções) ...

// Função ATUALIZADA para lidar com exportação (focada em TXT)
const handleExport = (format: 'txt' /*| 'docx' | 'pdf'*/) => { // Limitado a TXT por agora
    if (format !== 'txt') {
        toast({
            title: "Exportação não disponível",
            description: `A exportação para ${format.toUpperCase()} ainda não foi implementada.`,
            variant: "default" // Ou "destructive"
        });
        return; // Interrompe se não for TXT
    }

    // 1. Determinar o conteúdo a ser exportado baseado na aba ativa
    const activeModuleId = activeTab; // Usa o estado da aba ativa
    let contentToExport: string | null | undefined;
    let moduleNameForFile: string = 'desconhecido'; // Nome para usar no ficheiro

    if (activeModuleId === 'script') { // Aba "Roteiro Base"
        contentToExport = baseScript;
        moduleNameForFile = 'roteiro_base';
        console.log("Exportando Roteiro Base...");
    } else {
        // Busca o conteúdo do módulo gerado no estado
        contentToExport = generatedContentMap[activeModuleId]; // Acessa a string diretamente
        moduleNameForFile = activeModuleId; // Usa o ID do módulo para o nome
        console.log(`Exportando Módulo: ${moduleNameForFile}...`);
    }

    // 2. Validar se há conteúdo
    if (!contentToExport || contentToExport.trim() === "") {
        toast({
            title: "Conteúdo Vazio",
            description: "Não há conteúdo nesta aba para exportar como TXT.",
            variant: "destructive"
        });
        console.warn("Tentativa de exportar conteúdo vazio.");
        return;
    }

    // 3. Criar o nome do ficheiro (Sanitizado)
    const episodeTitleSlug = title // Usa o estado 'title' do componente
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_') // Substitui caracteres inválidos por _
        .replace(/_{2,}/g, '_')      // Remove múltiplos _
        .substring(0, 40) || 'episodio'; // Limita tamanho e usa fallback
    const filename = `dom_${episodeTitleSlug}_${moduleNameForFile}.txt`;
    console.log(`Nome do ficheiro gerado: ${filename}`);

    // 4. Gerar o Ficheiro TXT e Iniciar Download no Navegador
    try {
        // Cria um objeto Blob (Binary Large Object) com o conteúdo de texto
        const blob = new Blob([contentToExport], { type: 'text/plain;charset=utf-8' });

        // Cria uma URL temporária para o Blob
        const url = URL.createObjectURL(blob);

        // Cria um elemento de link <a> invisível
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // Define o nome do ficheiro para download

        // Adiciona o link ao corpo do documento (necessário para alguns navegadores)
        document.body.appendChild(link);

        // Simula um clique no link para iniciar o download
        link.click();

        // Limpeza: Remove o link do corpo e revoga a URL do objeto
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log("Download TXT iniciado com sucesso.");
        toast({ title: "Download Iniciado", description: `O ficheiro ${filename} está a ser descarregado.` });

    } catch (error) {
        console.error(`Erro ao gerar ou descarregar ficheiro TXT:`, error);
        toast({
            title: "Erro ao Exportar TXT",
            description: "Não foi possível gerar ou descarregar o ficheiro.",
            variant: "destructive"
        });
    }
};

// --- Renderização ---
// Certifique-se que os botões chamam handleExport com o formato correto

// Exemplo de como chamar o botão TXT dentro do map das TabsContent:
/*
<Button
  variant="ghost" // ou "outline"
  size="sm"
  onClick={() => handleExport('txt')} // Chama a função com 'txt'
>
  Exportar TXT
</Button>
*/

// Os botões DOCX e PDF agora mostrarão a mensagem "não implementado"
/*
<Button variant="ghost" size="sm" onClick={() => handleExport('docx')}>
  Exportar DOCX
</Button>
<Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
  Exportar PDF
</Button>
*/