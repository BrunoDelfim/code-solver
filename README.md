# LeetCode Solver

Um aplicativo para Windows que ajuda a resolver desafios do LeetCode automaticamente.

## Funcionalidades

- Captura de tela automáticamente para extrair o enunciado da questão
- Reconhecimento de texto em inglês e português
- Geração de soluções com explicações em português
- Interface minimalista e não intrusiva
- Atalhos de teclado para todas as funcionalidades

## Instalação

1. Baixe o instalador do aplicativo
2. Execute o instalador e siga as instruções
3. Um atalho será criado na área de trabalho

## Atalhos

- `Ctrl + Shift + P`: Captura a tela e processa a questão atual
- `Alt + S`: Mostra/oculta a janela de solução
- `Alt + P`: Mostra a janela do software
- `Ctrl + Shift + Q`: Encerra o aplicativo

## Como usar

1. Abra o LeetCode e navegue até a questão desejada
2. Pressione `Ctrl + Shift + P` para capturar e processar a questão
3. A solução será gerada e poderá ser visualizada pressionando `Alt + M`
4. Para encerrar o aplicativo, pressione `Ctrl + Shift + Q`

## Requisitos

- Windows 10 ou superior (64 bits)
- 4GB de RAM mínimo
- 500MB de espaço em disco

## Desenvolvimento

Para desenvolver ou modificar o aplicativo:

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute em modo desenvolvimento:
   ```bash
   npm start
   ```
4. Para construir o instalador:
   ```bash
   npm run build
   ou use o generateInstaller.bat
   ``` 
