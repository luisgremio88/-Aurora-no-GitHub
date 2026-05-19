# Organizacao Local da Aurora

Este PC sera a base principal da Aurora Local.

## Pastas principais

- `G:\Meu Drive\AuroraLocal\ai-assistant`
  - Codigo da Aurora, interface, servidor, testes e scripts.
- `G:\Meu Drive\AuroraLocal\ai-assistant\data`
  - Memoria, historico, SQLite interno, perfil do projeto e indices.
- `G:\Meu Drive\AuroraLocal\ai-assistant\data\secrets`
  - Chaves protegidas pelo Windows. Nao copiar manualmente para outro PC.
- `G:\Meu Drive\AuroraLocal\ai-assistant\generated`
  - Saidas criadas pela Aurora: imagens, bancos, planos, scaffolds e arquivos de teste.
- `C:\AuroraTools\ComfyUI`
  - ComfyUI e modelos grandes. Fica fora do Google Drive de proposito.

## Scripts de uso diario

- `Abrir-Aurora.bat`
  - Abre a Aurora em modo aplicativo.
- `Aurora Desktop.bat`
  - Atalho direto para o modo desktop.
- `Abrir-Aurora-Navegador.bat`
  - Abre no navegador comum.
- `Status-Aurora.bat`
  - Mostra se Aurora, ComfyUI, Docker, Ollama e arquivos importantes estao OK.
- `Encerrar-Aurora.bat`
  - Fecha processos nas portas da Aurora e do ComfyUI.
- `Organizar-Gerados-Aurora.bat`
  - Arquiva arquivos de teste antigos dentro de `generated/_archive`. Nao apaga.

## Regras de organizacao

- Nao colocar ComfyUI/modelos dentro do Google Drive.
- Nao apagar `data/aurora.sqlite`, `data/secrets` ou `generated` sem backup.
- Bancos e projetos criados pela Aurora ficam em `generated/`.
- Artefatos de teste antigos podem ser arquivados, mas nao removidos automaticamente.
- Antes de grandes mudancas, rode:

```powershell
npm run check
npm test
```

## Quando algo parecer fora de ordem

1. Rode `Status-Aurora.bat`.
2. Se tiver processo travado, rode `Encerrar-Aurora.bat`.
3. Abra de novo com `Abrir-Aurora.bat`.
4. Use `/atividade` no chat para ver comandos, diffs e evidencias.
