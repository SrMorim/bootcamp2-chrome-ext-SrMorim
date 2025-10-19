# 🍅 Bootcamp Pomodoro

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

Timer Pomodoro simples e eficiente para Google Chrome. Gerencie seu tempo, aumente sua produtividade e mantenha o foco com a técnica Pomodoro.

**🌐 [Ver Página do Projeto](https://srmorim.github.io/bootcamp2-chrome-ext-SrMorim/)**

## 📋 Sobre o Projeto

Esta extensão foi desenvolvida como **Entrega Inicial do Bootcamp II**, implementando um timer Pomodoro funcional e completo para navegadores Chrome. O projeto utiliza as melhores práticas de desenvolvimento de extensões com Manifest V3.

### ✨ Funcionalidades

- ⏱️ **Timer Customizável**: Configure durações personalizadas para foco, pausas curtas e pausas longas
- 🔔 **Alertas Sonoros**: Notificações sonoras quando cada sessão terminar (pode ser desativado)
- 📊 **Contador de Sessões**: Acompanhe quantos pomodoros você completou
- 🎨 **Design Minimalista**: Interface limpa com tema verde que não distrai
- 💾 **Estado Persistente**: Seu progresso é salvo automaticamente
- ⚡ **Leve e Rápido**: Usa Manifest V3 para melhor performance e segurança
- 🔄 **Auto-Transição**: Muda automaticamente entre modos de foco e pausa

## 🎯 Técnica Pomodoro

A Técnica Pomodoro é um método de gerenciamento de tempo que usa intervalos cronometrados para dividir o trabalho:

1. **Foco (25 minutos)**: Trabalhe com total concentração em uma tarefa
2. **Pausa Curta (5 minutos)**: Descanse brevemente
3. **Repita**: Após 4 pomodoros, faça uma pausa longa (15 minutos)

## 🚀 Instalação

### Opção 1: Instalação Manual (Modo Desenvolvedor)

1. **Baixe a extensão**
   - Acesse a [página de releases](https://github.com/SrMorim/bootcamp2-chrome-ext-SrMorim/releases)
   - Baixe o arquivo `bootcamp-pomodoro-v1.0.0.zip`
   - Extraia o arquivo ZIP em uma pasta

2. **Carregue no Chrome**
   - Abra o Chrome e acesse `chrome://extensions`
   - Ative o **Modo do desenvolvedor** (toggle no canto superior direito)
   - Clique em **Carregar sem compactação**
   - Selecione a pasta extraída da extensão

3. **Pronto!**
   - O ícone da extensão aparecerá na barra de ferramentas
   - Clique nele para começar a usar

### Opção 2: Clonar e Desenvolver

```bash
# Clone o repositório
git clone https://github.com/SrMorim/bootcamp2-chrome-ext-SrMorim.git
cd bootcamp2-chrome-ext-SrMorim

# Carregue a pasta no Chrome (chrome://extensions)
```

## 📖 Como Usar

### Interface Principal (Popup)

1. **Iniciar Timer**: Clique no botão "Iniciar" para começar
2. **Pausar**: Pause o timer a qualquer momento
3. **Resetar**: Reinicie o timer do modo atual
4. **Pular**: Pule para a próxima sessão
5. **Trocar Modo**: Use as abas para mudar entre Foco, Pausa Curta e Pausa Longa

### Configurações Customizáveis

Clique em "⚙️ Configurações" no popup para personalizar:

- **Tempo de Foco**: Duração das sessões de trabalho (padrão: 25 min)
- **Pausa Curta**: Duração das pausas breves (padrão: 5 min)
- **Pausa Longa**: Duração das pausas longas (padrão: 15 min)
- **Intervalo para Pausa Longa**: Após quantos pomodoros fazer pausa longa (padrão: 4)
- **Sons de Alerta**: Ativar/desativar notificações sonoras

## 🏗️ Estrutura do Projeto

```
bootcamp2-chrome-ext-SrMorim/
├── manifest.json                 # Configuração da extensão (Manifest V3)
├── icons/                        # Ícones da extensão (16, 32, 48, 128px)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
├── src/
│   ├── popup/                    # Interface principal
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── background/               # Service Worker (lógica do timer)
│   │   └── service-worker.js
│   ├── options/                  # Página de configurações
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   └── assets/                   # Recursos (sons, offscreen)
│       ├── offscreen.html
│       ├── offscreen.js
│       └── sounds/
│           ├── ding.wav
│           └── complete.wav
├── docs/                         # GitHub Pages (landing page)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── README.md
└── LICENSE
```

## 🔧 Tecnologias Utilizadas

- **Chrome Extension Manifest V3**: Framework moderno de extensões
- **JavaScript (Vanilla)**: Sem dependências externas
- **HTML5 & CSS3**: Interface responsiva e moderna
- **Chrome APIs**:
  - `chrome.storage`: Persistência de dados
  - `chrome.alarms`: Gerenciamento de timers
  - `chrome.notifications`: Notificações do sistema
  - `chrome.runtime`: Comunicação entre componentes
  - `chrome.offscreen`: Reprodução de áudio (requisito MV3)

## 📦 Permissões Utilizadas

A extensão solicita apenas as permissões **mínimas necessárias**:

- **storage**: Salvar configurações e estado do timer
- **alarms**: Criar alarmes para o cronômetro
- **notifications**: Mostrar notificações quando sessões terminarem
- **offscreen**: Tocar sons de alerta (requisito do Manifest V3)

## 🧪 Testando a Extensão

1. Carregue a extensão no Chrome (modo desenvolvedor)
2. Clique no ícone da extensão na barra de ferramentas
3. Teste os seguintes cenários:
   - Iniciar e pausar o timer
   - Resetar o timer
   - Pular para próxima sessão
   - Trocar entre modos manualmente
   - Ajustar configurações na página de opções
   - Completar um pomodoro e verificar notificações
   - Fechar e abrir o popup (estado deve persistir)

## 🎨 Personalização

### Modificar Cores

Edite as variáveis CSS em `src/popup/popup.css`:

```css
/* Tema atual: Verde Minimalista */
--primary: #27ae60;
--primary-dark: #229954;
--primary-light: #2ecc71;
```

### Adicionar Novos Sons

Substitua os arquivos em `src/assets/sounds/` mantendo os nomes:
- `ding.wav`: Som de notificação simples
- `complete.wav`: Som de conclusão de sessão

## 📝 Desenvolvimento

### Arquitetura

A extensão segue a arquitetura padrão do Manifest V3:

1. **Popup** (`src/popup/`): Interface do usuário
   - Exibe o timer e controles
   - Se comunica com o service worker via mensagens
   - Atualiza a UI a cada segundo

2. **Service Worker** (`src/background/service-worker.js`): Lógica principal
   - Gerencia o estado do timer
   - Controla alarmes do Chrome
   - Persiste dados no storage
   - Emite notificações

3. **Options Page** (`src/options/`): Configurações
   - Interface para customizar durações
   - Salva preferências no storage

4. **Offscreen Document** (`src/assets/offscreen.html`): Áudio
   - Necessário no MV3 para tocar sons
   - Criado apenas quando necessário

### Fluxo de Comunicação

```
Popup ←→ Service Worker ←→ Chrome Storage
  ↓            ↓
  UI       Alarmes/Notificações
```

## 🐛 Problemas Conhecidos

- Os sons podem não tocar se o navegador estiver em segundo plano (limitação do Chrome)
- Em alguns casos, o badge pode não atualizar imediatamente

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork este repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**SrMorim**

- GitHub: [@SrMorim](https://github.com/SrMorim)
- Projeto: [bootcamp2-chrome-ext-SrMorim](https://github.com/SrMorim/bootcamp2-chrome-ext-SrMorim)

## 🙏 Agradecimentos

- Técnica Pomodoro criada por Francesco Cirillo
- Bootcamp II pela oportunidade de aprendizado
- Comunidade Chrome Extensions pela documentação

## 📚 Recursos Úteis

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Técnica Pomodoro](https://francescocirillo.com/pages/pomodoro-technique)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
