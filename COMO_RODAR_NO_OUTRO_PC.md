# Como rodar a Aurora em outro PC

Esta pasta foi atualizada em 16/05/2026 com a versao atual da Aurora.

## Instalar no PC de casa

1. Instale o Node.js.
2. Instale o Ollama.
3. Baixe o modelo leve usado pela Aurora:

```powershell
ollama pull llama3.2:3b
```

4. No PC com RTX 3060, baixe tambem modelos melhores para programacao e arquitetura:

```powershell
ollama pull qwen2.5-coder:7b
ollama pull qwen2.5-coder:14b
ollama pull deepseek-r1:14b
```

5. Instale o pacote externo de ferramentas da Aurora fora do Google Drive:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Instalar-Ferramentas-Aurora.ps1
```

6. Abra o terminal nesta pasta:

```powershell
cd "G:\Meu Drive\AuroraLocal\ai-assistant"
npm start
```

7. Abra no navegador:

```text
http://localhost:3123
```

## Conferir se esta tudo certo

```powershell
npm run check
npm test
```

## Observacoes

- A pasta `data/` leva memoria, sessoes, conhecimentos, permissoes e banco SQLite.
- A pasta `generated/` leva documentos criados.
- A pasta `generated/web-projects/exemplo-web-robusto` leva um exemplo do novo gerador de sites robustos.
- Os modelos do Ollama nao vao dentro desta pasta; eles precisam ser baixados no outro PC.
- As ferramentas Node extras ficam em `C:\AuroraTools\aurora-node-tools`, fora do Drive, para evitar erro de sincronizacao em `node_modules`.
