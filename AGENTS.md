# Regras de Negócio Imutáveis - RotinaPed

Este arquivo contém regras de negócio críticas que não devem ser removidas ou alteradas sem instrução explícita do usuário.

## 1. Processamento de Caderneta via IA (Identificação de Vacinas)

Ao processar uma imagem de caderneta de vacinação através da Inteligência Artificial, as seguintes regras devem ser rigorosamente seguidas:

### Regra de Data de Aplicação (Falback)
- A IA deve tentar ler a data real de aplicação escrita na caderneta.
- **CASO A IA NÃO CONSIGA LER A DATA**: O sistema deve obrigatoriamente lançar uma data aproximada baseada na data em que a vacinação deveria ter sido administrada (calculada a partir da data de nascimento da criança).
- Nunca deve ser retornada uma data nula ou aleatória; a data prevista no calendário PNI serve como o valor padrão de segurança.

### Fluxo de Confirmação
- Todas as vacinas identificadas pela IA devem aparecer pré-marcadas no modal de confirmação.
- O usuário deve ter a opção de desmarcar qualquer vacina manualmente antes da confirmação final.
- O usuário deve ter a opção de editar a data sugerida pela IA (ou a data de fallback) caso identifique uma inconsistência.
- Somente após o clique no botão de confirmação final, os registros devem ser efetivamente salvos no histórico da criança como "concluídos".
