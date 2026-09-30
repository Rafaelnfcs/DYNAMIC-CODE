# QR Manager SaaS

Plataforma SaaS para criar e administrar QR Codes dinâmicos. O QR aponta para `/q/[slug]`; o destino pode ser trocado no painel sem alterar o QR impresso.

## Incluído
- Cadastro/login com Supabase Auth
- QR Codes isolados por cliente
- Redirecionamento dinâmico e registro de scans
- Ativar/desativar e editar destino
- Download do QR em PNG
- Planos: Grátis (3), Básico (25), Pro (200)
- Bloqueio automático ao atingir limite do plano
- Painel Master em `/admin`
- Gestão de plano/status dos clientes
- Métricas gerais de clientes, QRs e scans
- Banco com Row Level Security

## Configuração
1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local` e preencha as chaves.
4. Rode `npm install` e `npm run dev`.
5. Crie sua conta pelo `/login`.
6. No Supabase SQL Editor, transforme sua conta em administrador:
   `update profiles set role='admin' where id='SEU_USER_ID';`
7. Acesse `/admin` para o painel Master.

## Produção
Configure `NEXT_PUBLIC_APP_URL` com o domínio público antes de gerar os QRs definitivos. Recomenda-se Vercel + Supabase.

## Cobrança
A estrutura de planos já existe no banco. Mercado Pago/Stripe deve ser ligado em uma etapa posterior via checkout + webhook para atualizar `profiles.plan`. Nenhuma cobrança fictícia foi ativada nesta versão.
