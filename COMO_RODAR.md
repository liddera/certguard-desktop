# Como Rodar o CertGuard Desktop Aqui

## Comandos Disponíveis no Ambiente Linux

### 1. Modo DEV (Hot Reload) — RECOMENDADO PARA TESTAR

```bash
# Em ambiente headless (sem display gráfico)
cd /home/eliel/workspace/projects/certguard-desktop
xvfb-run -a npm run dev
```

```bash
# Com display gráfico (se disponível)
cd /home/eliel/workspace/projects/certguard-desktop
npm run dev
```

### 2. Build de Produção (só JS)

```bash
cd /home/eliel/workspace/projects/certguard-desktop
npm run build
```

Gera:
- `dist/` - Bundle React pronto
- `dist-electron/main.js` - Electron main process
- `dist-electron/preload.mjs` - Preload script

### 3. Validar Lint + TypeScript

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## ⚠️ Limitação do Ambiente

O instalador `.exe` (Windows) **NÃO pode ser gerado aqui** porque:
- ❌ Requer `wine` para assinar binários Windows
- ❌ Não temos o `wine` configurado

**Para gerar o `.exe` real:**
- Use um ambiente Windows
- Ou use CI/CD (GitHub Actions, Azure Pipelines)
- Ou instale wine: `sudo apt install wine` (mas requer configuração adicional)

## 🔌 Conectando ao Backend

Antes de rodar, configure o endpoint da API Laravel:

```bash
# Criar arquivo .env na raiz
cat > .env <<EOF
VITE_API_URL=http://localhost:8000/api
EOF
```

Ou edite `src/lib/apiClient.ts` para apontar para o backend.

## 📋 Pré-requisitos Verificados

- ✅ Node.js instalado
- ✅ xvfb-run disponível (display virtual)
- ✅ Dependências npm instaladas
- ✅ TypeScript compila sem erros
- ✅ ESLint sem warnings

## 🧪 Teste Manual Rápido

```bash
# 1. Rodar o dev server
cd /home/eliel/workspace/projects/certguard-desktop
xvfb-run -a npm run dev

# 2. Em outro terminal, verificar se está respondendo
curl http://localhost:5173/

# 3. Para parar
Ctrl+C
```

## 📦 O que está Pronto

```
✅ Build JS: dist/ + dist-electron/ (116 módulos)
✅ TypeScript: 100% tipado, sem erros
✅ ESLint: 0 erros, 0 warnings
✅ Backend: Conecta via API_URL configurável
⚠️ Instalador .exe: Precisa Windows para gerar
```