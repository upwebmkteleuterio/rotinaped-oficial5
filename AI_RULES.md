# Diretrizes e Regras para Desenvolvimento do RotinaPed (AI_RULES.md)

Este documento estabelece as regras de arquitetura, o ecossistema tecnológico e as boas práticas de desenvolvimento para garantir a consistência e a resiliência do aplicativo RotinaPed.

## 1. Visão Geral do Tech Stack

O RotinaPed é uma aplicação Web moderna projetada com foco em dispositivos móveis (mobile-first), utilizando as seguintes tecnologias:

* **React 19:** Biblioteca base para a construção das interfaces de usuário reativas e componentizadas.
* **TypeScript:** Tipagem estática rigorosa para garantir a robustez de código e segurança em tempo de compilação.
* **Vite:** Ferramenta de build e bundling ultrarrápida com recarregamento dinâmico.
* **Tailwind CSS v4:** Utilizado extensivamente para toda a estilização, aproveitando as variáveis de tema globais definidas em `src/index.css` (como `--color-brand-blue`).
* **React Router Dom (v7):** Gerenciador de rotas de página única (SPA), mantendo a definição de todas as rotas centralizada em `src/App.tsx`.
* **Zustand:** Gerenciamento de estado global centralizado no arquivo `src/store/useAppStore.ts` com persistência em localStorage para simular cache offline.
* **Motion (f.k.a. Framer Motion / motion/react):** Biblioteca oficial usada para transições suaves de rotas, modais expansíveis e animações de feedback do usuário.
* **Lucide React:** Coleção padrão de ícones vetoriais modernos e consistentes utilizados na navegação e nos botões de ação do app.
* **Google GenAI SDK (@google/genai):** Integração direta com a API do Gemini (usando o modelo `gemini-3-flash-preview`) para processar imagens de caderneta de vacinas e responder perguntas de pediatria.

---

## 2. Regras de Utilização de Bibliotecas e Código

Para manter a simplicidade e a manutenibilidade do projeto, siga rigorosamente as regras abaixo sobre qual biblioteca utilizar para cada finalidade:

### Gerenciamento de Estado
* **Zustand (`src/store/useAppStore.ts`):** Todo e qualquer estado compartilhado entre páginas ou persistido entre recarregamentos deve residir no Zustand Store. Nunca use contextos complexos do React ou soluções alternativas.
* **React State (`useState`):** Restrinja o uso de estado local apenas a formulários temporários, estados de controle de modais específicos da própria página ou de digitação.

### Estilização e Design System
* **Tailwind CSS:** Toda a interface deve ser responsiva e construída usando exclusivamente classes utilitárias do Tailwind CSS. Não crie arquivos CSS separados adicionais ou folhas de estilo inline complexas.
* **Classes Utilitárias Utilitárias (`cn`):** Sempre combine classes dinâmicas ou condicionais utilizando a função utilitária `cn` localizada em `src/lib/utils.ts`.

### Animações e Feedback
* **Motion (`motion/react`):** Todas as animações, abertura e fechamento de modais com `<AnimatePresence>` ou efeitos de escala ao pressionar botões devem ser implementadas usando o componente `motion` apropriado.

### Ícones e Elementos Visuais
* **Lucide React:** Sempre use ícones do pacote `lucide-react`. Não importe SVGs manuais a menos que seja um elemento proprietário personalizado (como o `CustomAIIcon`).

### Tratamento de Regras de Negócio e IA
* **Regra de Fallback (Caderneta de Vacinação):** É imutável. Caso a IA não reconheça uma data de aplicação, o algoritmo deve calcular a data ideal a partir da data de nascimento da criança no arquivo `src/services/aiVaccineService.ts`.
* **Prompt da IA (Dra. Flávia):** Deve ser mantido e enriquecido em `src/services/aiService.ts` utilizando sempre o dossiê atualizado da criança ativa.