# Guia de Testes

Este documento descreve a configuração de testes automatizados para o frontend do Portal Professor.

## Instruções de Configuração

### 1. Instalar Dependências de Teste

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitest/ui jsdom
```

### 2. Atualizar Scripts do package.json

Adicione esses scripts ao seu `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

## Arquivos de Teste Criados

### 1. Testes Unitários: `src/__tests__/hooks/use-students.test.ts`

Testes para o hook `useStudents` abrangendo:

- ✅ Inicialização com alunos fictícios
- ✅ Adicionando novos alunos
- ✅ Atualizando alunos existentes
- ✅ Deletando alunos
- ✅ Gerenciamento de estado de carregamento

**Executar Testes Unitários:**

```bash
npm test -- use-students.test.ts
```

### 2. Testes de Integração: `src/__tests__/pages/StudentsPage.integration.test.tsx`

Testes para o componente StudentsPage abrangendo:

- ✅ Renderização de cabeçalho e descrição da página
- ✅ Funcionalidade do botão adicionar aluno
- ✅ Funcionalidade de busca
- ✅ Dropdowns de filtro (classe e status)
- ✅ Renderização da tabela com cabeçalhos corretos
- ✅ Exibindo alunos na tabela
- ✅ Filtrando alunos por termo de busca
- ✅ Filtrando alunos por classe
- ✅ Botões do menu de ações
- ✅ Abertura do diálogo de aluno
- ✅ Exibição de badge de status
- ✅ Exibição de nota
- ✅ Mensagem de estado vazio
- ✅ Formatação de data de matrícula

**Executar Testes de Integração:**

```bash
npm test -- StudentsPage.integration.test.tsx
```

## Comandos de Teste Disponíveis

```bash
# Executar todos os testes em modo observação
npm test

# Executar todos os testes uma única vez
npm test:run

# Executar testes com dashboard de UI
npm test:ui

# Executar testes com relatório de cobertura
npm test:coverage

# Executar arquivo de teste específico
npm test -- use-students.test.ts

# Executar testes que correspondem a um padrão
npm test -- --grep "add a new student"
```

## Estrutura de Teste

### Testes Unitários

- Foco em funções e hooks individuais
- Testar transformações de dados
- Verificar gerenciamento de estado

### Testes de Integração

- Testar renderização de componentes
- Verificar interações do usuário
- Testar funcionalidade de filtro e busca
- Verificar atualizações de UI após ações do usuário

## Mocking

Os testes incluem mocks para:

- Componente `StudentDialog`
- React Router
- APIs do navegador (matchMedia)

## Cobertura

Execute relatórios de cobertura para ver quais arquivos/funções são testados:

```bash
npm test:coverage
```

Isso gera um relatório HTML no diretório `./coverage`.

## Padrões de Teste Principais

### 1. Teste de Hook

```typescript
const { result } = renderHook(() => useStudents());
act(() => {
  result.current.addStudent(studentData);
});
```

### 2. Teste de Componente

```typescript
renderWithRouter(<StudentsPage />);
const searchInput = screen.getByPlaceholderText("Buscar alunos...");
fireEvent.change(searchInput, { target: { value: "John" } });
```

### 3. Operações Assíncronas

```typescript
await waitFor(() => {
  expect(screen.getByText("John Doe")).toBeInTheDocument();
});
```

## Integração CI/CD

Adicione ao seu workflow do GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Testes
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm test:run
      - run: npm test:coverage
```

## Solução de Problemas

### Testes não estão sendo executados?

- Certifique-se de que todas as dependências de desenvolvimento estão instaladas: `npm install --save-dev`
- Verifique se `vitest.config.ts` existe na raiz do projeto

### Erros de importação?

- Verifique se os aliases de caminho em `vitest.config.ts` correspondem ao `tsconfig.json`
- Certifique-se de que o alias `@` aponta para o diretório `./src`

### Componente não está sendo renderizado?

- Envolva componentes em `BrowserRouter` para testes do React Router
- Faça mock de dependências externas (como `StudentDialog`)

## Recursos

- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do React Testing Library](https://testing-library.com/react)
- [Melhores Práticas de Teste](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
