# 📱 Como instalar o Casal Finance como app

## Opção 1 — Netlify (recomendado, gratuito)

```bash
# No terminal, dentro da pasta do projeto:
npm install
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Vai gerar um link tipo `https://casal-finance-abc123.netlify.app`  
Manda esse link para a Gabi. Nos dois celulares:

### Android (Chrome)
1. Abra o link no Chrome
2. Toque nos 3 pontos (⋮) no canto superior direito
3. "Adicionar à tela inicial"
4. Confirma → ícone aparece igual a um app

### iPhone (Safari)
1. Abra o link no **Safari** (obrigatório no iOS)
2. Toque no botão de compartilhar (⬆)  
3. "Adicionar à Tela de Início"
4. Confirmas → ícone aparece igual a um app

---

## Opção 2 — Vercel (alternativa)

```bash
npm install
npm run build
npx vercel --prod dist
```

---

## Opção 3 — GitHub Pages

```bash
npm install
npm run build
# Faça upload da pasta `dist/` para um repositório GitHub
# Ative GitHub Pages nas configurações do repo apontando para a pasta dist
```
