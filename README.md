# Setlist Studio

App web responsivo para cadastrar músicas, montar setlists com **arrastar e soltar** (incluindo celular) e exportar **PDF** (modo simples ou completo). A persistência padrão agora é em **Firebase Firestore**, permitindo dados compartilhados entre usuários.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço indicado (geralmente `http://localhost:5173`).

Build de produção:

```bash
npm run build
npm run preview
```

## Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative **Firestore Database** (modo produção ou teste).
3. Em **Project settings > General**, adicione um app Web.
4. Copie as chaves `firebaseConfig`.
5. Crie um arquivo `.env` na raiz com base em `.env.example`.

Exemplo:

```bash
VITE_PERSISTENCE_MODE=firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Estrutura usada no Firestore

- Coleção: `setlistcreator`
- Documento: `songs` com campo `items: Song[]`
- Documento: `setlists` com campo `items: Setlist[]`

## Publicar (Render)

No Render, publique como **Static Site**:

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure as variáveis `VITE_FIREBASE_*` no ambiente do serviço
4. Faça deploy

## Estrutura principal

- `src/types/models.ts` — tipos `Song` e `Setlist`
- `src/services/persistence/` — adapters de persistência (Firebase/localStorage)
- `src/context/AppDataContext.tsx` — estado e CRUD
- `src/pages/` — telas (dashboard, biblioteca, setlists, editor, prévia)
- `src/components/setlist/SetlistDndEditor.tsx` — drag and drop por blocos + backup

## Persistência local (modo alternativo)

Se quiser voltar para persistência no navegador, suba o frontend com:

```powershell
$env:VITE_PERSISTENCE_MODE="local"
npm run dev
```
