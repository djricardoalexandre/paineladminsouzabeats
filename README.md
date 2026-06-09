# Admin SouzaBeats

Sistema de painel administrativo para gestão de rádios cadastradas e solicitações de orçamento.

## Tecnologias
- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth + Database)
- jsPDF (Relatórios)

## Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Autenticação

O sistema usa **Supabase Auth** para autenticação. 

**Usuário Admin autorizado:** `djricardofm@gmail.com`

O usuário precisa estar cadastrado no Supabase Auth do projeto. Se ainda não estiver:
1. Acesse o dashboard do Supabase
2. Vá em Authentication > Users
3. Crie o usuário com email `djricardofm@gmail.com` e senha

### Credenciais de Acesso
- **E-mail:** djricardofm@gmail.com
- **Senha:** (definida no Supabase Auth)

## Deploy no Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. O deploy será automático

### Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`

## Desenvolvimento Local

```bash
npm install
npm run dev
```

## Funcionalidades

- **Dashboard**: Visão geral com estatísticas
- **Rádios**: CRUD completo de rádios cadastradas
- **Orçamentos**: Gestão de solicitações com status
- **Relatórios**: Exportação em PDF
- **Configurações**: Informações do sistema

## Estrutura do Banco (Supabase)

### Tabela: radios_cadastradas
- id, nome_radio, email, telefone, cidade, estado, frequencia, site, responsavel, observacoes, created_at, updated_at

### Tabela: solicitacoes_orcamento
- id, nome_cliente, email, telefone, empresa, servico_solicitado, descricao, valor_estimado, status, data_solicitacao, data_resposta, observacoes, created_at, updated_at
