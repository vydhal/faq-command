# Command Portal - Sistema de Gestão de Aprendizagem

Este é um sistema completo de gestão de aprendizagem (LMS) desenvolvido para facilitar o treinamento e acompanhamento de colaboradores. O projeto conta com uma interface moderna e responsiva, além de um painel administrativo robusto.

## 🚀 Funcionalidades

### Para Colaboradores
- **Dashboard Personalizado:** Visão geral do progresso, cursos em andamento e conquistas.
- **Catálogo de Cursos:** Navegação intuitiva por cursos e categorias.
- **Leitura de Artigos:** Biblioteca de artigos com marcação de leitura e filtros por categoria.
- **Sistema de Notificações:** Alertas sobre novos conteúdos e comunicados importantes.
- **Perfil do Usuário:** Gerenciamento de dados pessoais e upload de foto (avatar).
- **Gamificação:** Acompanhamento de progresso visual e motivador.

### Para Administradores
- **Gestão de Conteúdo:** Criação, edição e remoção de Cursos, Artigos e Categorias.
- **Gestão de Usuários:** Controle de acesso e permissões.
- **Comunicados:** Envio de avisos para todos os usuários com confirmação de leitura.
- **Relatórios:** Visualização de estatísticas de engajamento e progresso.
- **Personalização:** Ajustes de configurações do sistema.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React:** Biblioteca principal para construção da interface.
- **Vite:** Build tool rápida e leve.
- **TypeScript:** Tipagem estática para maior segurança e manutenibilidade.
- **Tailwind CSS:** Framework de estilização utilitário para design moderno.
- **Shadcn/ui:** Componentes de interface reutilizáveis e acessíveis.
- **Lucide React:** Biblioteca de ícones.

### Backend
- **PHP:** Linguagem de script para o servidor.
- **SQLite:** Banco de dados leve e eficiente, sem necessidade de configuração complexa de servidor.
- **PDO:** Abstração de acesso a dados para segurança e flexibilidade.

## 📦 Como Rodar Localmente

### Pré-requisitos
- Node.js e npm instalados.
- PHP instalado e configurado no PATH do sistema.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2.  **Instale as dependências do Frontend:**
    ```bash
    npm install
    ```

3.  **Inicie o Servidor Backend (PHP):**
    Abra um terminal na raiz do projeto e execute:
    ```bash
    php -S localhost:8000 -t . -c php.ini
    ```
    *Nota: O parâmetro `-c php.ini` é crucial para carregar as extensões necessárias.*

4.  **Inicie o Servidor Frontend (Vite):**
    Abra outro terminal e execute:
    ```bash
    npm run dev
    ```

5.  **Acesse a aplicação:**
    O frontend estará rodando geralmente em `http://localhost:8080` (ou a porta indicada no terminal).

## 🚀 Como Fazer o Deploy (Hostinger)

Este projeto é compatível com hospedagens PHP compartilhadas, como a Hostinger.

1.  **Build do Frontend:**
    Gere os arquivos estáticos de produção:
    ```bash
    npm run build
    ```
    Isso criará uma pasta `dist`.

2.  **Preparar Backend:**
    Copie a pasta `api` para dentro da pasta `dist`.
    Estrutura final: `dist/api`.

3.  **Upload:**
    Faça o upload de todo o conteúdo da pasta `dist` para a pasta `public_html` da sua hospedagem.

4.  **Banco de Dados:**
    - O banco de dados `database.sqlite` será criado automaticamente na primeira execução ou você pode fazer o upload do seu arquivo local.
    - **Importante:** A pasta onde está o banco de dados deve ter permissão de escrita.

5.  **Segurança (Opcional mas Recomendado):**
    Adicione um arquivo `.htaccess` para proteger o banco de dados de download direto:
    ```apache
    <Files "database.sqlite">
        Order allow,deny
        Deny from all
    </Files>
    ```

## 📄 Licença

Este projeto é de uso privado e proprietário.
