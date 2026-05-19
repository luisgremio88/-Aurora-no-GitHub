# Continuar a Aurora no Codex

Use este arquivo no PC de casa para o Codex encontrar a pasta certa e continuar de onde paramos.

## Pasta correta

No PC de casa, abra esta pasta como workspace no Codex:

```text
G:\Meu Drive\AuroraLocal\ai-assistant
```

Se o Google Drive usar outra letra ou outro caminho, procure pela pasta:

```text
AuroraLocal\ai-assistant
```

## Primeiro passo no Codex

1. Abra o Codex.
2. Escolha `Open folder` ou `Abrir pasta`.
3. Selecione a pasta `ai-assistant`.
4. Envie este prompt para o Codex:

```text
Estou continuando o projeto Aurora Local vindo do notebook do serviço.
Leia primeiro AGENTS.md, README.md, COMO_RODAR_NO_OUTRO_PC.md e CONTINUAR_NO_CODEX.md.
Depois verifique o estado atual com npm run check e npm test.
Quero continuar melhorando a Aurora a partir da Fábrica Web, benchmark 60% e agente executor.
Não apague nada sem me avisar.
```

## Como rodar a Aurora

```powershell
cd "G:\Meu Drive\AuroraLocal\ai-assistant"
npm run check
npm test
npm start
```

Depois abra:

```text
http://localhost:3123
```

## Modelos para instalar no Ollama

Modelo leve:

```powershell
ollama pull llama3.2:3b
```

Modelos recomendados para o PC com RTX 3060:

```powershell
ollama pull qwen2.5-coder:7b
ollama pull qwen2.5-coder:14b
ollama pull deepseek-r1:14b
```

## Estado atual

- A Aurora roda em Node.js na porta `3123`.
- O banco local fica em `data/aurora.sqlite`.
- A interface fica em `public/`.
- O backend principal fica em `server.js`.
- Os testes ficam em `tests/smoke.mjs`.
- O benchmark atual esta em aproximadamente `56/60`.
- A Fábrica Web ja gera scaffolds robustos com Docker, Prisma, seed, Playwright, doctor script, auditoria, rate limit, headers e autenticacao base.
- Existe um exemplo gerado em `generated/web-projects/exemplo-web-robusto`.
- As ferramentas extras de agente ficam fora do Google Drive em `C:\AuroraTools\aurora-node-tools`.
- O painel "Capacidades" agora detecta esse pacote externo com Playwright, Execa, Simple Git, fast-glob, ignore, Zod, Prisma, Chokidar, ExcelJS, Docx, Vite, Phaser, Three, TypeScript, ESLint, Vitest e TSX.
- O proximo passo forte e fazer o executor usar essas ferramentas externas em ciclos mais longos: ler plano, editar arquivos, rodar teste, corrigir erro e registrar resultado.

## Arquivos importantes para ler

- `AGENTS.md`
- `README.md`
- `COMO_RODAR_NO_OUTRO_PC.md`
- `server.js`
- `public/app.js`
- `public/index.html`
- `tests/smoke.mjs`
- `data/project-index.json`
- `data/code-map.json`

## Cuidados

- Nao instalar `node_modules` dentro do Google Drive se ficar muito lento; nesse caso copie `ai-assistant` para uma pasta local, como `C:\Projetos\AuroraLocal\ai-assistant`.
- Para reinstalar as ferramentas externas, rode `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Instalar-Ferramentas-Aurora.ps1`.
- Nao apagar `data/`, porque ela leva memoria, sessoes e banco local.
- Nao apagar `external-resources/`, porque ela leva a biblioteca externa usada como referencia.
- Os modelos do Ollama nao vao no Google Drive; precisam ser baixados no PC de casa.
