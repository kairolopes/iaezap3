# Teste Rápido da Autenticação

## Pré-requisitos

- Backend rodando em `http://localhost:3000`
- Usuário criado no Supabase Auth

## 1. Testar Login (via cURL)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "sua-senha"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id-123",
    "email": "seu@email.com",
    "name": "Your Name",
    "role": "USER",
    "companyId": null
  }
}
```

## 2. Testar Rota Protegida (GET /auth/me)

Copie o `token` da resposta acima e substitua:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada:**
```json
{
  "id": "user-id-123",
  "email": "seu@email.com",
  "name": "Your Name",
  "role": "USER",
  "companyId": null,
  "createdAt": "2026-08-11T10:30:00.000Z",
  "updatedAt": "2026-08-11T10:30:00.000Z"
}
```

## 3. Testar Token Inválido

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer token-invalido"
```

**Resposta esperada:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 4. Testar Registrar Novo Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@email.com",
    "password": "senha123",
    "name": "Novo Usuario"
  }'
```

**Resposta esperada:**
```json
{
  "id": "new-user-id",
  "email": "novo@email.com",
  "name": "Novo Usuario"
}
```

## 5. Testar Frontend Login

1. Abra `http://localhost:5173`
2. Entre com seu email e senha
3. Verifique se redirecionou para Dashboard
4. Abra DevTools (F12) > Console
5. Execute:
   ```javascript
   localStorage.getItem('token')
   JSON.parse(localStorage.getItem('user'))
   ```

## 6. Testar Interceptador de Requisição

No console do browser:

```javascript
// Fazer requisição autenticada via frontend
const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
const data = await response.json()
console.log(data)
```

## 7. Testar Logout

1. Clique no botão "Sair" no Dashboard
2. Verifique se voltou para LoginPage
3. No console:
   ```javascript
   localStorage.getItem('token') // Deve ser null
   localStorage.getItem('user') // Deve ser null
   ```

## 8. Teste de Erro 401

1. Após fazer logout, copie um token antigo
2. Tente acessar rota protegida:
   ```bash
   curl -X GET http://localhost:3000/auth/me \
     -H "Authorization: Bearer TOKEN_ANTIGO"
   ```
3. Deve retornar 401 Unauthorized

## Checklist de Teste

- [ ] Login com credenciais válidas retorna token
- [ ] Token pode ser usado em rota protegida
- [ ] Token inválido retorna 401
- [ ] Registrar novo usuário funciona
- [ ] Frontend armazena token em localStorage
- [ ] Logout limpa localStorage
- [ ] Redirecionamento após login funciona
- [ ] Redirecionamento após logout funciona
- [ ] Interceptador adiciona Authorization header

## Debugging

### Ver Headers de Requisição

1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Clique em "XHR" (XMLHttpRequest)
4. Faça login
5. Clique na requisição POST /auth/login
6. Vá para "Request Headers"

### Ver Response Body

Após clicar na requisição:
1. Vá para aba "Response"
2. Verifique se tem `token` e `user`

### Ver localStorage

No console:
```javascript
console.log(localStorage)
```

### Teste de Performance

```javascript
console.time('login')
// ... faça login ...
console.timeEnd('login')
```

## Problemas Comuns

### "Invalid credentials"
- Email ou senha incorretos
- Usuário não existe no Supabase Auth
- **Solução:** Verifique credenciais no Supabase dashboard

### "JWT malformed"
- Token corrompido ou inválido
- **Solução:** Limpe localStorage e faça login novamente

### CORS Error
- Backend não está permitindo requisição do frontend
- **Solução:** Verifique porta do backend (deve ser 3000)

### "Cannot GET /auth/me"
- Rota não existe ou está com erro de grafia
- **Solução:** Verifique spelling do endpoint

## Performance

Token deve ser incluído em todas as requisições subsequentes:

```
Login: ~500ms
POST /auth/me: ~50ms
GET /agents: ~100ms (com token)
GET /agents: ~401 (sem token)
```

## Segurança

- Token é válido por 7 dias
- Token expirado causa erro 401
- LocalStorage é limpo em logout
- Headers incluem Authorization
