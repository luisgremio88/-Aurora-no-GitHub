# Aurora Local

[![Security check](https://github.com/luisgremio88/-Aurora-no-GitHub/actions/workflows/security-check.yml/badge.svg)](https://github.com/luisgremio88/-Aurora-no-GitHub/actions/workflows/security-check.yml)

Aurora Local e uma IA pessoal e ferramenta de desenvolvimento criada para rodar no computador do usuario, com foco em privacidade, automacao, engenharia de software e assistencia pratica para projetos reais.

O projeto combina chat com modelos locais via Ollama, roteamento opcional para IAs externas, memoria persistente, leitura controlada de arquivos, planejamento de implementacao, execucao segura de checks, edicao assistida com backup, SQL local, geracao de documentos, fabrica web e integracao com Git/GitHub.

## Por que este projeto existe

Eu criei a Aurora para estudar e construir, na pratica, uma assistente local capaz de apoiar fluxo de desenvolvimento de ponta a ponta:

- entender um projeto anexado;
- mapear arquivos, funcoes, rotas e riscos;
- planejar melhorias antes de alterar codigo;
- executar validacoes seguras;
- registrar evidencias;
- proteger segredos e dados locais;
- manter historico com Git e backup no GitHub.

Mais do que um chat, a Aurora e um laboratorio de produto, automacao e engenharia defensiva.

## Destaques para avaliacao tecnica

- **IA local primeiro**: funciona com Ollama e pode continuar operando sem enviar dados para provedores externos.
- **Roteamento hibrido**: pode usar Gemini ou OpenRouter quando configurado, escolhendo modelo por tipo de tarefa.
- **Ferramentas de imagem**: pedidos como desenho, avatar, logo, personagem ou anime sao roteados para ComfyUI local, Gemini Image/Nano Banana quando configurado, ou SVG local como fallback.
- **Modo Codex/Executor**: prepara contexto, cria fila de execucao, roda checks seguros e registra evidencias.
- **Backup de inteligencia de sites**: cadastra pastas de sites baixados, extrai paginas, stack, padroes de layout, tokens visuais e licoes de arquitetura para futuras criacoes.
- **Biblioteca pesquisavel**: busca referencias por stack, layout, componentes, rotas, cores e licoes aprendidas.
- **Memoria de projeto consolidada**: transforma aprendizados das bibliotecas em notas persistentes do perfil do projeto.
- **Criacao guiada por referencia**: gera scaffold web usando uma biblioteca cadastrada como inspiracao arquitetural, sem copiar marca, textos, imagens ou codigo proprietario.
- **Analise visual e professor**: resume paleta, fontes, assets, hierarquia e explica como o site foi construido.
- **Auditoria de bibliotecas baixadas**: procura scripts externos, possivel ofuscacao, HTML dinamico sensivel e segredos aparentes.
- **Seguranca por construcao**: bloqueia segredos versionados, ignora bancos locais, protege chaves com DPAPI no Windows e limita operacoes sensiveis por permissao.
- **Edicao assistida**: gera proposta, mostra diff, aplica com backup e registra historico.
- **Git/GitHub integrado**: detecta branch, remote, status e diffs mesmo no Windows quando o PATH ainda nao foi atualizado.
- **Smoke tests**: cobre endpoints principais como health, sessoes, provedores de IA, SQL seguro, executor, diagnostico, benchmark e seguranca.
- **Arquitetura simples e auditavel**: Node.js puro no backend, frontend HTML/CSS/JS e SQLite local.

## Stack

- Node.js 22
- JavaScript ES Modules
- HTML, CSS e JavaScript no frontend
- SQLite local
- Ollama para IA local
- Git/GitHub para versionamento
- PowerShell para automacoes no Windows
- GitHub Actions para checagem automatica

## Status atual

- `npm run check`: valida sintaxe do backend e frontend.
- `npm test`: roda smoke test dos endpoints principais.
- `npm run security`: procura segredos e arquivos sensiveis rastreados pelo Git.
- Repositorio conectado ao GitHub em `main`.

## Seguranca e privacidade

Este repositorio foi preparado para ser publico sem publicar dados locais.

Nao entram no Git:

- banco SQLite local;
- historico de conversa;
- chaves de API;
- arquivos gerados;
- logs;
- backups;
- recursos externos grandes;
- ComfyUI e modelos locais.

As chaves opcionais ficam em `data/secrets/`, protegidas pelo DPAPI do Windows para o usuario atual. O scanner de seguranca roda localmente e tambem no GitHub Actions a cada push ou pull request.

## Demonstracao rapida

```powershell
npm run check
npm run security
npm test
```

Com a Aurora rodando:

```text
http://localhost:3123
```

## Estrutura principal

```text
server.js                 Backend HTTP, IA, ferramentas, seguranca e endpoints
public/                   Interface web local
scripts/                  Automacoes PowerShell para iniciar, configurar e manter
tests/smoke.mjs           Smoke test dos fluxos principais
.github/workflows/        Checagem automatica no GitHub
AGENTS.md                 Guia rapido para agentes de codigo
```

## Como rodar

1. Inicie o Ollama:

```powershell
ollama serve
```

2. Em outro terminal, suba a interface:

```powershell
cd "G:\Meu Drive\AuroraLocal\ai-assistant"
npm start
```

3. Abra:

```text
http://localhost:3123
```

## Como testar

Com a Aurora rodando em `http://localhost:3123`, execute:

```powershell
npm run check
npm test
```

`npm run check` valida a sintaxe do backend e frontend.
`npm test` roda um smoke test nos endpoints principais, incluindo health, sessoes, SQL seguro, planejamento, busca e diagnostico.

## Guia para agentes

O arquivo `AGENTS.md` resume como agentes de codigo devem trabalhar neste projeto.
Ele registra comandos, arquivos principais, regras de seguranca, recursos externos e proximas melhorias.
Use esse arquivo como contexto rapido quando abrir a Aurora em outro PC ou trabalhar com Codex/assistentes locais.

## Modelo inicial

O modelo baixado para esta v1 foi:

```powershell
llama3.2:3b
```

Para baixar outros modelos:

```powershell
ollama pull nome-do-modelo
```

Depois recarregue a pagina e escolha o modelo no seletor.

## IAs externas opcionais

A Aurora pode continuar usando o Ollama local e, quando voce configurar chaves externas, tambem pode rotear pedidos para Google Gemini ou OpenRouter.

O caminho recomendado e configurar as chaves uma vez pelo script seguro:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-Chaves-Aurora.ps1
```

Esse script pede as chaves escondidas no terminal e salva em `data/secrets/` usando DPAPI do Windows, protegido para o usuario atual. A Aurora nao salva as chaves na tela, no SQLite, no README nem em `.env`.

Depois abra pelo atalho:

```powershell
.\Abrir-Aurora.bat
```

Valores de `AURORA_AI_PROVIDER`:

- `auto`: usa modelos externos quando houver chave e a tarefa pedir mais forca; caso contrario fica no Ollama.
- `local`: usa apenas Ollama.
- `gemini`: prefere Gemini.
- `openrouter`: prefere OpenRouter.

O modo `auto` usa Gemini para conversa geral e OpenRouter para codigo, banco e arquitetura quando a chave estiver configurada.

Se precisar rodar manualmente sem o atalho, use o iniciador seguro:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Iniciar-Aurora-Seguro.ps1 -OpenBrowser
```

## Imagem real com ComfyUI

A Aurora tem um conector para ComfyUI local. Quando o ComfyUI estiver online em `http://127.0.0.1:8188` e houver um modelo em `tools/ComfyUI/models/checkpoints`, pedidos de imagem usam PNG real. Se o ComfyUI estiver offline ou sem modelo, a Aurora cai para SVG simples.

Preparar ComfyUI:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Instalar-ComfyUI-Aurora.ps1
```

Iniciar ComfyUI:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Iniciar-ComfyUI-Aurora.ps1
```

O atalho `Abrir-Aurora.bat` tambem tenta iniciar o ComfyUI automaticamente antes de abrir a Aurora. Se o ComfyUI ja estiver rodando, ele nao duplica o processo.

Por padrao, o ComfyUI fica fora do Google Drive:

```text
C:\AuroraTools\ComfyUI
```

Depois coloque um modelo `.safetensors` em:

```text
C:\AuroraTools\ComfyUI\models\checkpoints
```

## Modos de trabalho

A Aurora tem modos especializados no painel lateral:

- `Geral`: conversa, organizacao e ideias.
- `Programacao`: leitura de codigo, riscos, testes e mudancas pequenas.
- `Banco de dados`: schema, SQL, indices, consultas, migracoes e integridade.
- `Arquitetura`: planejamento de sistemas, componentes, fluxos e ordem de implementacao.
- `Seguranca`: construcao defensiva, ameacas, permissoes, dados sensiveis, backups e testes.

O modo escolhido afeta o chat e tambem as propostas de edicao.

## Portabilidade

O painel "Portabilidade" checa se a pasta da Aurora esta pronta para ser copiada para outro PC.
Ele mostra:

- pasta atual do app;
- versao do Node;
- status do Ollama e modelos instalados;
- checklist de arquivos importantes;
- tamanho resumido de `data/`, `generated/`, `public/` e `tests/`;
- comandos para iniciar no outro computador.

Para levar para outro PC, copie a pasta `ai-assistant` ou a pasta `newGame` inteira se quiser levar tambem os projetos analisados.

## Manutencao

O painel "Manutencao" ajuda a Aurora a nao se perder em construcoes longas.
Ele mostra:

- quantidade de mensagens da sessao;
- tokens estimados do contexto;
- notas de memoria e conhecimentos salvos;
- sessoes existentes;
- permissoes ligadas/desligadas;
- alertas quando a conversa ou memoria estiverem grandes.

O botao "Compactar conversa" reduz uma conversa longa, preservando um resumo e as mensagens mais recentes.
O botao "Otimizar banco" limita o historico SQL aos registros recentes e roda manutencao no SQLite para manter a Aurora leve.

## Capacidades

O painel "Capacidades" mostra quais ferramentas extras estao disponiveis para criacoes mais avancadas.
Ele tambem verifica ferramentas do sistema como `node`, `npm`, `ollama` e `git`.
Ele verifica pacotes como:

- `exceljs` para Excel `.xlsx` formatado;
- `docx` para Word `.docx`;
- `vite` para sites/apps modernos;
- `@playwright/test` para testes de navegador;
- `phaser` para jogos 2D;
- `three` para 3D web.

Para evitar travamentos dentro do Google Drive, as bibliotecas grandes podem ficar fora da pasta sincronizada, em:

```text
C:\AuroraTools\aurora-node-tools
```

Nesta maquina, esse pacote externo foi preparado para a Aurora com Playwright, Execa, Simple Git, fast-glob, ignore, Zod, Prisma, Chokidar, ExcelJS, Docx, Vite, Phaser, Three, TypeScript, ESLint, Vitest e TSX.
A Aurora detecta esse caminho automaticamente. Para reinstalar em outro PC:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Instalar-Ferramentas-Aurora.ps1
```

Se voce usar outro caminho, defina `AURORA_NODE_TOOLS_DIR` antes de iniciar a Aurora.

O botao "Radar de devtools" usa a lista local `awesome-ai-devtools-main` como inspiracao.
Ele recomenda ferramentas e ideias por categoria:

- agentes no editor;
- agentes no terminal;
- contexto de codigo;
- busca semantica local;
- banco e SQL;
- UI/sites;
- testes;
- configuracao de agentes;
- revisao e PR.

Esse radar nao instala nada automaticamente; ele mostra o que pode melhorar a Aurora e quais caminhos avaliar.

## Benchmark 60%

O painel "Benchmark 60%" mede o progresso da Aurora em relacao a uma meta pratica de 60%.
Ele calcula uma nota local por area:

- cerebro local e rotas de modelo;
- memoria, indice, mapa de codigo e bibliotecas;
- fluxo de agente executor;
- seguranca defensiva;
- testes, diagnostico e comandos;
- portabilidade para outro PC.

O endpoint usado pelo painel e:

```text
GET /api/benchmark
```

Use esse painel depois de instalar modelos, atualizar indice/mapa ou adicionar novas ferramentas para ver onde a Aurora ainda esta mais fraca.

## Indice do projeto

O painel "Indice do projeto" gera um mapa resumido da pasta `newGame`.
Esse mapa entra no contexto do chat para ajudar a Aurora a entender a estrutura do projeto sem ler todos os arquivos em toda mensagem.

O indice salva:

- total de arquivos de texto/codigo indexados;
- contagem por extensao;
- contagem por pasta principal;
- arquivos importantes como READMEs, configs, manifests de projeto e arquivos principais.

O arquivo gerado fica em:

```text
data/project-index.json
```

## Mapa de codigo

O painel "Mapa de codigo" analisa arquivos `.js`, `.mjs`, `.cs` e `.py`.
Ele extrai imports, funcoes, classes e rotas simples, e esse resumo entra no contexto do chat.

O mapa ajuda a Aurora no modo `Programacao`, porque ela passa a reconhecer arquivos centrais, funcoes existentes e endpoints antes de sugerir mudancas.

O arquivo gerado fica em:

```text
data/code-map.json
```

## Planejamento de implementacao

O painel "Planejar implementacao" cria um plano rapido antes de editar codigo.
Ele usa o perfil do projeto, indice, mapa de codigo e arquivos anexados para sugerir:

- objetivo;
- arquivos provaveis;
- passos;
- riscos;
- testes.

Nesta versao, o planejamento e local e rapido, sem depender da geracao do Llama.
Isso evita travar o app quando o modelo local estiver lento.
Os arquivos provaveis tambem aparecem como botoes; clique em um deles para anexar o arquivo ao contexto.

## Missoes

O painel "Missoes" transforma um objetivo grande em acompanhamento persistente.
Use para tarefas como criar um site completo, montar um Excel formatado, estruturar um jogo ou continuar um projeto longo.

A Aurora salva:

- objetivo da missao;
- tipo provavel do trabalho, como jogo, site, planilha, documento, banco ou software;
- necessidades tecnicas;
- acoes seguras sugeridas;
- status de cada necessidade e acao.

As acoes sugeridas ajudam a Aurora a preparar o terreno antes de construir, como atualizar o indice do projeto, gerar mapa de codigo, checar manutencao e rodar auditoria rapida.
Quando uma necessidade ou acao for resolvida, marque como concluida no proprio painel.

## Executor avancado

O painel "Executor avancado" prepara uma missao para execucao pratica.
Ele usa objetivo, perfil, indice, mapa de codigo, capacidades instaladas e permissoes atuais para gerar:

- primeira entrega concreta;
- necessidades detectadas;
- arquivos provaveis;
- ferramentas disponiveis e faltantes;
- comandos de instalacao quando algum pacote estiver ausente;
- permissoes atuais;
- acoes preparatorias seguras;
- ordem de execucao e validacoes.

Cada missao tambem tem o botao "Preparar execucao", que envia o objetivo direto para esse painel.
O executor nao instala pacotes sozinho; ele mostra o caminho e deixa a decisao com voce.

## Fabrica Web

O painel "Fabrica Web" prepara sistemas web robustos e pode criar um scaffold inicial seguro.
Ele recebe objetivo, tipo de sistema, stack, banco, autenticacao e deploy alvo.

Ele gera:

- decisoes iniciais de arquitetura;
- estrutura de pastas;
- plano de banco com tabelas, indices e protecoes;
- checklist de seguranca por construcao;
- pacotes e ferramentas provaveis;
- plano de testes;
- ordem de execucao;
- arquivos provaveis para anexar ao chat;
- scaffold em `generated/web-projects/` com README, docs, `.env.example`, schema Prisma, seed, scripts e codigo inicial;
- base de producao inicial com Dockerfile, docker-compose, `.gitignore`, `.dockerignore`, Playwright e teste de scaffold;
- fundacao de seguranca com env tipado, headers, rate limit, auditoria e autenticacao esqueleto.

O endpoint usado pelo painel e:

```text
POST /api/web-project-plan
POST /api/web-project-scaffold
```

O scaffold cria uma pasta nova quando ja existe uma pasta com o mesmo nome, evitando sobrescrever trabalho anterior.
Depois de criar um scaffold, entre na pasta gerada e rode:

```powershell
npm install
npm run doctor
npm test
```

## Criador de jogos

O painel "Criador de jogos" prepara um jogo do zero.
Ele e pensado para RPGs, jogos 2D/3D, prototipos web ou projetos Unity.

Ele gera:

- estilo sugerido de engine;
- primeiro prototipo jogavel;
- sistemas centrais como mapa, batalha, inventario, save/load, UI e dialogos;
- estrutura de dados para criaturas, habilidades, itens, mapas e saves;
- arquivos provaveis;
- dependencias de jogo e teste;
- ordem de execucao.

Para jogos inspirados em franquias existentes, a Aurora deve construir os sistemas e usar dados/assets temporarios ou originais, deixando a troca de assets para depois.

## Seguranca por construcao

O painel "Seguranca" cria um plano defensivo rapido para qualquer coisa que voce queira construir.
Ele usa perfil do projeto, indice, mapa de codigo e arquivos anexados para sugerir:

- modelo de ameacas;
- controles por construcao;
- checklist antes de entregar;
- testes de seguranca;
- arquivos provaveis para revisar.

Esse plano e local e rapido, sem depender do Llama, para funcionar mesmo quando o modelo estiver lento.

O botao "Auditoria rapida" varre arquivos de texto/codigo e aponta sinais para revisar, como possiveis segredos hardcoded, execucao dinamica, comandos shell, SQL destrutivo, manipulacao de caminhos e logs de debug.
Os achados sao heuristicas de revisao, nao prova automatica de vulnerabilidade.
Depois da auditoria, use o filtro de severidade e a busca para focar em um tipo de risco, arquivo ou trecho especifico.
O escopo padrao e "Aurora", que varre apenas o app local; troque para "Workspace" quando quiser analisar toda a pasta `newGame`.

## Documentos

O painel "Documentos" cria arquivos em `generated/` com caminho controlado pela Aurora.
Nesta versao ele gera:

- Markdown (`.md`) para notas e documentacao;
- CSV (`.csv`) para abrir no Excel;
- HTML (`.html`) com layout simples para abrir no navegador ou no Word.

Esse recurso usa a permissao de aplicacao de edicoes, porque grava arquivos no workspace.

## Perfil do projeto

O painel "Perfil do projeto" salva informacoes persistentes que entram no contexto da Aurora:

- stack usada;
- banco de dados;
- comandos para rodar;
- comandos de teste;
- objetivos do sistema;
- notas e decisoes tecnicas.

O perfil fica salvo em:

```text
data/project-profile.json
```

## Memoria

As memorias ficam salvas em:

```text
data/memory.json
```

Nesta v1, a memoria e uma lista simples de notas que entram no contexto da conversa.

## Conhecimentos

O painel "Conhecimentos" salva regras, convencoes, snippets e decisoes que a Aurora deve considerar no chat.
Use categorias como `Programacao`, `Banco`, `Arquitetura`, `Padrao` e `Geral`.

Os conhecimentos entram no contexto do chat junto com memoria, perfil, indice e mapa de codigo.

O arquivo fica em:

```text
data/knowledge.json
```

## Bibliotecas externas

O painel "Bibliotecas externas" cadastra pastas grandes fora da Aurora, como cursos, referencias, datasets ou projetos de estudo.
Ele nao copia os arquivos; apenas cria um resumo com:

- caminho da pasta;
- pastas/modulos principais;
- quantidade de arquivos por extensao;
- notebooks encontrados;
- Markdown/dados encontrados;
- `requirements.txt`, quando existir.

Esses resumos entram no contexto do chat para a Aurora lembrar que a biblioteca existe.
Exemplo cadastrado:

```text
external-resources\Diplomado-master
external-resources\awesome-ai-devtools-main
```

A pasta `external-resources/` fica dentro da Aurora para portabilidade, mas e ignorada pelo indice normal de arquivos para nao deixar buscas e mapas lentos.
Use o painel "Bibliotecas externas" para consultar o resumo dessas pastas.

O resumo fica salvo em:

```text
data/resource-library.json
```

## Historico de conversa

A conversa fica salva localmente e e restaurada ao recarregar a pagina.
Use o seletor "Sessao" para criar, alternar e apagar conversas separadas.
Use o botao "Limpar" no topo do chat para apagar o historico da sessao atual.

O historico fica em:

```text
data/chat-history.json
```

Para evitar crescimento infinito, a Aurora guarda no maximo 80 mensagens recentes.

## SQLite

A Aurora usa SQLite para dados centrais como memoria, conhecimentos, perfil, permissoes, rotas de modelo e sessoes.

O banco fica em:

```text
data/aurora.sqlite
```

## Arquivos

A Aurora tambem consegue listar arquivos de texto/codigo dentro da pasta `newGame`.
Clique em um arquivo no painel lateral para anexar o conteudo ao proximo chat.
Use a busca para encontrar arquivos por nome ou por trechos de conteudo.

Por seguranca, esta versao:

- le apenas arquivos dentro do workspace;
- bloqueia caminhos fora da pasta do projeto;
- limita leitura a arquivos de ate 200 KB;
- nao apaga arquivos.

## Busca

A busca fica no painel "Arquivos" e procura em nomes de arquivos e conteudo de arquivos de texto/codigo.
Os resultados podem ser clicados para anexar o arquivo ao chat ou ao editor.
O botao "Busca semantica leve" faz uma busca por tokens relacionados, sem depender de API externa.

Limites da busca:

- retorna ate 40 resultados;
- ignora pastas como `.git`, `node_modules`, `Library`, `Temp`, `Logs`, `bin` e `obj`;
- ignora arquivos maiores que 160 KB;
- procura dentro da pasta `newGame`.

## Edicao assistida

O painel "Editar arquivo" gera uma proposta de nova versao para o arquivo selecionado.
A proposta so e gravada quando voce clica em "Aplicar proposta".
Antes de aplicar, a interface mostra um diff visual com linhas removidas (`-`) e adicionadas (`+`).
O texto da proposta pode ser ajustado manualmente antes de aplicar.
O botao "Gerar patch" mostra uma previsualizacao em formato patch antes da aplicacao.

Antes de salvar, a Aurora cria um backup ao lado do arquivo original com final `.bak`.

Limites desta v1:

- edita apenas arquivos dentro do workspace;
- edita apenas arquivos de texto/codigo;
- limita edicao a arquivos de ate 120 KB;
- aplica a proposta inteira como novo conteudo do arquivo.

## Historico de alteracoes

Toda edicao aplicada fica registrada no SQLite com:

- arquivo alterado;
- backup criado;
- motivo da mudanca;
- patch da alteracao;
- data.

O painel "Historico de alteracoes" permite listar as mudancas, abrir o patch registrado e restaurar o backup de uma alteracao.
Ao restaurar, a Aurora cria um novo backup do estado atual e registra a restauracao como uma nova entrada no historico.

## Ferramentas, SQL e permissoes

O painel "Ferramentas" controla permissoes para leitura de arquivos, propostas, aplicacao de edicoes, comandos seguros e SQL de escrita.

Ele tambem tem o "Modo construtor livre responsavel".
Quando ligado, a Aurora recebe uma diretriz persistente para tentar construir pedidos legitimos com menos bloqueios genericos: sites, jogos, programas, automacoes, planilhas, documentos, banco de dados e ferramentas.
Esse modo nao remove limites contra dano real, como invasao, roubo de dados, malware, fraude, destruicao de dados sem recuperacao ou orientacao ilegal.
Quando algo for arriscado no PC local, ela deve preferir backup, validacao e confirmacao antes de executar.

O "Modo executor avancado" orienta a Aurora a agir de forma mais independente: descobrir contexto antes de perguntar, quebrar tarefas grandes em etapas, escolher uma primeira entrega testavel e apontar dependencias, validacoes e proximas acoes.

Comandos seguros disponiveis incluem:

```text
node --check server.js
node --check public/app.js
ollama list
```

O painel "SQL" permite consultar o SQLite interno. Por padrao, apenas `SELECT`, `EXPLAIN` e `PRAGMA` sao permitidos. Escrita SQL exige ativar a permissao `SQL de escrita`.
O botao "Ver schema" lista tabelas, colunas e indices do banco interno, com atalho para gerar um `SELECT` seguro por tabela.
O botao "EXPLAIN" gera `EXPLAIN QUERY PLAN` para consultas `SELECT`, ajudando a entender varreduras, uso de indices e custo provavel antes de otimizar.
O botao "Analisar SQL" usa o modelo local para explicar uma consulta `SELECT` com base no schema e no plano do SQLite.
O botao "Historico SQL" mostra as consultas recentes, tempo de execucao, linhas retornadas, erro quando existir e um atalho para reutilizar a consulta.

O botao "Diagnostico" roda validacoes basicas do backend, frontend e Ollama.

## Roteamento de modelos

O backend suporta rotas de modelo por modo: geral, programacao, banco, arquitetura e fallback.
Nesta maquina, todas as rotas foram configuradas para `llama3.2:3b`, mas podem apontar para modelos maiores depois.

O painel "Rotas de modelo" permite escolher um modelo diferente para cada modo quando houver mais modelos instalados no Ollama.
O botao "Analisar modelos" verifica os modelos instalados e recomenda rotas.
O botao "Aplicar recomendado" preenche os seletores com a sugestao; depois clique em "Salvar rotas" para persistir.

Para um PC com 32 GB de RAM e RTX 3060 12 GB, a regra pratica e:

- `qwen2.5-coder:7b` para agilidade;
- `qwen2.5-coder:14b` para programacao e banco com mais qualidade;
- `deepseek-r1:14b` para raciocinio e arquitetura;
- `llama3.1:8b` para geral;
- `llama3.2:3b` como fallback leve quando quiser rapidez.

Sugestoes para programacao:

```powershell
ollama pull qwen2.5-coder:7b
ollama pull qwen2.5-coder:14b
ollama pull deepseek-r1:14b
ollama pull llama3.1:8b
ollama pull deepseek-coder:6.7b
```
