# Colocar o QR Manager SaaS Pro em produção

## 1. Criar o banco no Supabase
1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute todo o arquivo `supabase/schema.sql`.
3. Em **Project Settings / API** (ou no diálogo Connect), copie:
   - Project URL
   - Publishable key (ou anon key em projetos antigos)
   - Service Role key
4. Em Authentication, habilite Email/Password.

> Segurança: a Service Role key é segredo de servidor. Nunca coloque essa chave em variável `NEXT_PUBLIC_*`, GitHub ou código do navegador.

## 2. Configurar variáveis
Copie `.env.example` para `.env.local` e preencha os valores.

Variáveis necessárias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferencial) ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Enquanto estiver testando localmente, use `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

## 3. Rodar localmente
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`.

## 4. Criar seu administrador
1. Cadastre normalmente um usuário pelo sistema.
2. No Supabase SQL Editor, execute substituindo pelo e-mail real:
```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'SEU-EMAIL@EXEMPLO.COM';
```
3. Saia e entre novamente. O painel master fica em `/admin`.

## 5. Publicar na Vercel
Você pode importar este projeto em um repositório Git ou usar a Vercel CLI.
No projeto da Vercel, cadastre as mesmas variáveis em **Settings > Environment Variables**, especialmente no ambiente Production.
Depois faça o deploy.

## 6. Domínio próprio — MUITO IMPORTANTE
Use um subdomínio estável, por exemplo:
- `qr.suaempresa.com.br`

Adicione-o em **Vercel > Project > Settings > Domains** e siga os registros DNS que a própria Vercel indicar.

Depois altere na Vercel:
```text
NEXT_PUBLIC_APP_URL=https://qr.suaempresa.com.br
```
Faça um novo deploy após mudar a variável.

### Regra de ouro
O endereço `https://qr.suaempresa.com.br/q/SLUG` é o endereço permanente gravado no QR impresso. Não troque esse domínio depois que distribuir/imprimir códigos. O `destination_url` pode ser alterado quantas vezes quiser.

## 7. Teste antes de vender
1. Crie um cliente.
2. Crie um QR.
3. Leia o QR pelo celular e confirme o redirecionamento.
4. Troque o destino no painel sem gerar outro QR.
5. Leia o mesmo QR novamente e confirme o novo destino.
6. Confirme o incremento de scans.
7. Desative o QR e confirme que ele deixa de redirecionar.
8. Teste um cliente Free tentando ultrapassar o limite.
9. Teste o painel `/admin`.

## Próxima integração
O código fica pronto para a próxima etapa: checkout/assinaturas e webhooks do Mercado Pago ou Stripe. As credenciais reais do gateway devem ser cadastradas somente como secrets no servidor.
