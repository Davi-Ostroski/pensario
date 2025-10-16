# Pensario Mobile - React Native

Este é o aplicativo mobile do sistema Pensario, desenvolvido em React Native para Android e iOS.

## Funcionalidades

- ✅ Autenticação de usuários (login/registro)
- ✅ Gerenciamento de notas (criar, editar, listar, deletar)
- ✅ Persistência local com AsyncStorage
- ✅ Sincronização com backend Node.js
- ✅ Interface responsiva e intuitiva
- ✅ Cache de dados para uso offline

## Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Armazenamento local persistente
- **Fetch API** - Comunicação com backend
- **Context API** - Gerenciamento de estado global

## Estrutura do Projeto

```
src/
├── contexts/
│   └── AuthContext.js          # Contexto de autenticação
├── navigation/
│   └── AppNavigator.js         # Configuração de navegação
├── screens/
│   ├── LoginScreen.js          # Tela de login
│   ├── RegisterScreen.js       # Tela de registro
│   ├── NotesListScreen.js      # Lista de notas
│   └── NoteFormScreen.js       # Formulário de nota
└── services/
    ├── api.js                  # Serviço de API
    └── storage.js              # Serviço de armazenamento local
```

## Configuração do Ambiente

### Pré-requisitos

1. Node.js (versão 18 ou superior)
2. React Native CLI
3. Android Studio (para Android)
4. Xcode (para iOS - apenas macOS)

### Instalação

1. Instalar dependências:
```bash
npm install
```

2. Para Android:
```bash
npx react-native run-android
```

3. Para iOS:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## Dependências Principais

```json
{
  "@react-native-async-storage/async-storage": "^1.19.3",
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/stack": "^6.3.17",
  "react-native-safe-area-context": "^4.7.2",
  "react-native-screens": "^3.25.0"
}
```

## Configuração da API

O aplicativo se conecta ao backend Node.js. Para configurar a URL da API:

1. Abra o arquivo `src/services/api.js`
2. Altere a constante `API_BASE_URL` para o endereço do seu servidor:

```javascript
const API_BASE_URL = 'http://SEU_IP:3000'; // Para desenvolvimento
// ou
const API_BASE_URL = 'https://sua-api.com'; // Para produção
```

## Funcionalidades Implementadas

### Autenticação
- Login com usuário e senha
- Registro de novos usuários
- Persistência de sessão com AsyncStorage
- Logout automático em caso de erro de autenticação

### Gerenciamento de Notas
- Criar novas notas com título, categoria e conteúdo
- Editar notas existentes
- Listar todas as notas do usuário
- Deletar notas com confirmação
- Cache local para melhor performance

### Armazenamento Local
- Dados de autenticação persistidos
- Cache de notas para uso offline
- Sincronização automática com o servidor
- Limpeza automática de cache antigo

## Uso do AsyncStorage

O aplicativo utiliza o AsyncStorage para:

1. **Dados de Autenticação**: Token JWT e informações do usuário
2. **Cache de Notas**: Lista de notas para acesso offline
3. **Configurações**: Preferências do usuário
4. **Sincronização**: Controle de última sincronização

### Exemplo de Uso:

```javascript
import StorageService from '../services/storage';

// Salvar dados
await StorageService.setItem('chave', dados);

// Recuperar dados
const dados = await StorageService.getItem('chave');

// Cache de notas
await StorageService.cacheNotes(notas);
const notasCache = await StorageService.getCachedNotes();
```

## Integração com Backend

O aplicativo se comunica com o backend Node.js através de:

- **Autenticação**: POST /auth/login, POST /auth/register
- **Notas**: GET/POST/PUT/DELETE /notes
- **Lembretes**: GET/POST/PUT/DELETE /reminders
- **Anexos**: POST /attachments/upload, GET /attachments

## Tratamento de Erros

- Validação de formulários
- Tratamento de erros de rede
- Fallback para dados em cache
- Mensagens de erro amigáveis

## Próximas Funcionalidades

- [ ] Sincronização em background
- [ ] Notificações push para lembretes
- [ ] Upload de anexos (imagens, documentos)
- [ ] Busca e filtros avançados
- [ ] Modo escuro
- [ ] Backup e restauração

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste em dispositivos Android e iOS
5. Envie um pull request

## Licença

Este projeto está sob a licença MIT.

