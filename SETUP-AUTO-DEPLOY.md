# 🚀 Setup Auto-Deploy - Guia Completo

## 🎯 Resultado Final

```
Você faz: git push
GitHub faz: Deploy automático no VPS
Tempo: ~5 minutos
```

---

## 📋 PASSO 1: Setup Inicial no VPS (Roda uma vez)

### 1.1 Entre no VPS:
```bash
ssh root@179.198.102.88
# Senha: Bate123ria@5
```

### 1.2 Cole este comando COMPLETO:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/kairolopes/iaezap3/main/deploy-vps.sh)
```

Quando pedir email, digite: `kairolopes@gmail.com`
Quando pedir confirmação SSL, tecle: `Y`

**Aguarde ~15 minutos até terminar!**

---

## 📋 PASSO 2: Gerar Chave SSH para GitHub Actions

### 2.1 Ainda no VPS, rode:

```bash
ssh-keygen -t ed25519 -f /tmp/deploy_key -N ""
```

### 2.2 Veja a chave PRIVADA:

```bash
cat /tmp/deploy_key
```

**Copie TODO O CONTEÚDO** (inclua `-----BEGIN OPENSSH PRIVATE KEY-----` até o final)

### 2.3 Veja a chave PÚBLICA:

```bash
cat /tmp/deploy_key.pub
```

**Copie TODO O CONTEÚDO** (começa com `ssh-ed25519`)

### 2.4 Adicione a chave pública ao VPS:

```bash
cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 📋 PASSO 3: Configurar GitHub Secrets

### 3.1 Acesse seu repositório no GitHub:
```
https://github.com/kairolopes/iaezap3
```

### 3.2 Vá em:
```
Settings → Secrets and variables → Actions → New repository secret
```

### 3.3 Crie 3 secrets:

**Secret 1:**
- Name: `VPS_HOST`
- Value: `179.198.102.88`
- Clica "Add secret"

**Secret 2:**
- Name: `VPS_USER`
- Value: `root`
- Clica "Add secret"

**Secret 3:**
- Name: `VPS_SSH_KEY`
- Value: (Cole a chave PRIVADA que copiou no passo 2.2)
- Clica "Add secret"

---

## 🎉 PRONTO! Agora Funciona Automático

### Teste o Auto-Deploy:

```bash
# No seu computador:
cd iaezap3
git add .
git commit -m "test: auto deploy"
git push origin main
```

### Veja o Deploy Rodando:

```
GitHub → Actions → Veja a execução do workflow
```

### Acompanhe os Logs:

```bash
# No VPS:
pm2 logs iaezap-backend
```

---

## 🔄 De Agora em Diante

**Toda vez que você faz `git push`:**

1. ✅ GitHub Actions detecta push
2. ✅ Clona código novo
3. ✅ Instala dependências
4. ✅ Compila frontend
5. ✅ Reinicia backend
6. ✅ Reinicia Nginx
7. ✅ Deploy completo! 🚀

---

## 📊 Status

- Backend: https://iaezap.com.br/api
- Frontend: https://iaezap.com.br
- Logs: `pm2 logs iaezap-backend`
- Restart: `pm2 restart iaezap-backend`

---

## ⚠️ Se Algo Quebrar

```bash
# Ver erro
pm2 logs iaezap-backend | tail -100

# Reiniciar tudo
pm2 restart all
sudo systemctl restart nginx

# Verificar status
pm2 status
sudo systemctl status nginx
```

---

## 🎯 Resumo

| O que | Quando | Quem faz |
|------|--------|----------|
| Setup VPS | Uma vez | Você (roda script) |
| Gerar SSH | Uma vez | Você (no VPS) |
| GitHub Secrets | Uma vez | Você (no GitHub) |
| Deploy | Automático | GitHub (cada push) |

**Tudo automático daqui em diante!** 🤖
