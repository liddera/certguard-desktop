# CertGuard Desktop

Aplicativo desktop para gerenciamento seguro de certificados digitais A1/A3.

## Stack

- **Electron 32** - Runtime desktop
- **React 18** - UI
- **TypeScript** - Tipagem
- **Tailwind CSS 3** - Estilização
- **Zustand 5** - Estado global
- **Axios** - HTTP client
- **node-forge** - Criptografia (RSA, AES)
- **Vite** - Bundler

## Estrutura

```
certguard-desktop/
├── electron/                          # Processo Principal (Node.js)
│   ├── main.ts                        # Entry point + lifecycle
│   ├── preload.ts                     # Context Bridge
│   ├── services/
│   │   ├── keygenService.ts          # RSA 2048 + safeStorage
│   │   ├── powershellService.ts      # Install/Remove certs Windows
│   │   ├── trayService.ts            # System Tray
│   │   └── logger.ts                 # Logger sanitizado
│   └── ipc/
│       ├── systemHandlers.ts         # Window controls
│       └── certHandlers.ts           # Cert install/remove
│
├── src/                               # Processo de Renderização (React)
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   └── layout/
│   │       ├── AppLayout.tsx
│   │       └── Topbar.tsx
│   ├── features/                      # Feature-Sliced Design
│   │   ├── auth/
│   │   │   ├── auth.store.ts
│   │   │   ├── auth.service.ts
│   │   │   └── components/LoginScreen.tsx
│   │   ├── certificates/
│   │   │   ├── cert.service.ts
│   │   │   ├── device.service.ts
│   │   │   └── components/
│   │   │       ├── CertList.tsx
│   │   │       ├── CertCard.tsx
│   │   │       └── JustificativaModal.tsx
│   │   └── sessions/
│   │       ├── session.store.ts
│   │       ├── session.service.ts
│   │       └── components/
│   │           ├── SessaoManager.tsx
│   │           └── ExpiryModal.tsx
│   ├── hooks/
│   │   └── useHeartbeat.ts            # Loop de heartbeat + countdown
│   ├── lib/
│   │   └── apiClient.ts               # Axios interceptors
│   ├── types/
│   │   └── api.d.ts
│   └── App.tsx
│
├── public/                            # Assets estáticos
├── build/                             # Build resources (ícones)
├── electron-builder.json5             # Config do instalador
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Scripts

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção (plataforma atual)
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Build do Instalador (.exe Windows)

### Pré-requisitos (no Windows)
- Node.js 18+ instalado
- Git instalado

### Passo a passo

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd certguard-desktop

# 2. Instalar dependências
npm install

# 3. Configurar URL da API
# Criar arquivo .env na raiz:
echo VITE_API_URL=http://SEU-SERVIDOR/api > .env

# 4. Build do instalador
npm run build

# 5. O .exe estará em:
# release/1.0.0/CertGuard Desktop-Setup-1.0.0.exe
```

### Build sem instalar (portable)
```bash
npx electron-builder --win portable
# Gera: release/1.0.0/CertGuard Desktop-1.0.0.exe
```

### Build via GitHub Actions (CI/Windows)
O repositório pode ser configurado com GitHub Actions para gerar o `.exe` automaticamente a cada push na branch `main`.

### Notas
- **NÃO compile no Linux para Windows** — o `electron-builder` precisa da plataforma alvo
- O ícone do app fica em `build/icon.ico` (precisa ser criado)
- A configuração do instalador está em `electron-builder.json5`

## Segurança Implementada

- ✅ `contextIsolation: true` + `nodeIntegration: false`
- ✅ Chave privada criptografada com `safeStorage` (OS-level)
- ✅ PFX instalado apenas em memória RAM (EphemeralKeySet)
- ✅ Variáveis PowerShell zeradas após uso (`$pfxBytes = $null`)
- ✅ Logger sanitizado (não expõe PFX, senhas, tokens)
- ✅ Interceptação de URLs externas (deny)
- ✅ Cleanup automático no startup (órfãos)
- ✅ Cleanup automático no before-quit

## Fluxo do Usuário

```
1. Login (email + senha)
   ↓
2. Lista de certificados carregada
   ↓
3. Clica "Ativar" no certificado
   ↓
4. Modal de justificativa (se obrigatória)
   ↓
5. Dispositivo registrado automaticamente
   ↓
6. PFX instalado no Windows Certificate Store (RAM)
   ↓
7. Heartbeat a cada 30s renova sessão
   ↓
8. Countdown no topo (HH:MM:SS)
   ↓
9. Quando faltam 5 min: modal de aviso
   ↓
10. User pode "Renovar" (heartbeat imediato)
    OU "Desativar" (encerra sessão)
```

## Licença

Proprietary - Alvras 2026