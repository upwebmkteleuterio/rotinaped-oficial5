import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Info,
  Mail,
  Server,
  Smartphone,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  Bullets,
  ContactLink,
  LAST_UPDATE,
  LegalPage,
  Section,
} from '@/components/common/LegalPage';
import { useAuth } from '@/context/AuthContext';

export default function AccountDeletion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deleted = searchParams.get('excluido') === '1';

  return (
    <LegalPage
      badge="Exclusão de conta"
      title="Exclusão de Conta e de Dados"
      subtitle={`Aplicativo e site RotinaPed · Última atualização: ${LAST_UPDATE}`}
    >
      {deleted ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <h2 className="font-bold text-emerald-700 tracking-tight">
              Conta excluída com sucesso
            </h2>
          </div>
          <p className="text-sm text-emerald-700/90 leading-relaxed">
            Sua conta e todos os dados vinculados a ela foram apagados dos nossos servidores, e
            você foi desconectado do aplicativo. Agradecemos por ter usado o RotinaPed.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Você pode solicitar a exclusão definitiva da sua conta e de todos os dados
            vinculados a ela a qualquer momento, sem custo. Escolha uma das opções abaixo.
          </p>
          <button
            type="button"
            onClick={() => navigate(user ? '/excluir-minha-conta' : '/')}
            className="w-full bg-[#1b6392] text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#134e75] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {user ? 'Excluir minha conta agora' : 'Entrar no aplicativo para excluir'}
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            {user
              ? 'Você está conectado. A exclusão será feita imediatamente após a confirmação.'
              : 'É necessário estar conectado à sua conta para excluí-la pelo aplicativo.'}
          </p>
        </div>
      )}

      <Section icon={Info} title="1. Quem pode solicitar">
        <p>
          Qualquer titular de conta no RotinaPed pode solicitar a exclusão dos seus dados. Como
          o aplicativo é destinado a pais, mães e responsáveis legais, a solicitação deve ser
          feita pelo titular da conta.
        </p>
      </Section>

      <Section icon={Smartphone} title="2. Como excluir sua conta">
        <p className="font-bold text-slate-700">Opção 1 — Pelo aplicativo (recomendado)</p>
        <p>O processo é automático e leva menos de um minuto:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Abra o aplicativo RotinaPed e faça login na sua conta.</li>
          <li>
            Acesse a aba <strong>Mais</strong> (Menu) e toque em{' '}
            <strong>Excluir Minha Conta</strong>.
          </li>
          <li>
            Leia o aviso, marque a caixa de confirmação e digite a palavra{' '}
            <strong>EXCLUIR</strong>.
          </li>
          <li>
            Toque em <strong>Excluir Definitivamente</strong> e confirme.
          </li>
        </ol>
        <p>
          A conta, os dados e os arquivos de exames são apagados imediatamente, e você é
          desconectado do aplicativo.
        </p>

        <p className="font-bold text-slate-700 pt-2">
          Opção 2 — Por e-mail (se você não tem mais acesso ao aplicativo)
        </p>
        <p>
          Envie um e-mail para <ContactLink subject="Exclusão de Conta" /> com o assunto{' '}
          <strong>"Exclusão de Conta"</strong>, informando o endereço de e-mail cadastrado na
          conta. Para sua segurança, poderemos solicitar informações adicionais para confirmar
          que a solicitação parte do titular da conta.
        </p>
        <p>
          Solicitações por e-mail são processadas em até <strong>30 dias</strong> a partir da
          confirmação da identidade do titular.
        </p>
      </Section>

      <Section icon={Database} title="3. Quais dados são excluídos">
        <p>
          A exclusão é definitiva e permanente. São apagados dos nossos servidores todos os
          dados vinculados à sua conta:
        </p>
        <Bullets
          items={[
            'Dados da conta: nome completo, endereço de e-mail e credenciais de acesso (senha).',
            'Perfis das crianças acompanhadas: nome, data de nascimento, sexo, tipo de perfil e informações de nascimento (peso, altura, semanas gestacionais e APGAR).',
            'Registros de vacinação e todo o histórico da caderneta digital.',
            'Medições de crescimento: peso, altura, IMC e perímetro cefálico.',
            'Exames: resultados, descrições e os arquivos enviados (imagens e PDFs) armazenados no nosso servidor de arquivos.',
            'Registros de alimentação, amamentação e introdução alimentar.',
            'Lembretes, rotina e compromissos cadastrados.',
            'Marcos do desenvolvimento acompanhados.',
            'Notificações recebidas e tokens de notificação push do dispositivo.',
            'Mensagens publicadas nos canais da comunidade.',
            'Dados do pediatra informados no perfil.',
            'Preferências e dados temporários salvos localmente no seu dispositivo.',
          ]}
        />
      </Section>

      <Section icon={Clock} title="4. O que é mantido temporariamente (e por quê)">
        <p>
          Alguns dados podem ser mantidos mesmo após a exclusão da conta, exclusivamente para
          cumprimento de obrigação legal ou para o exercício regular de direitos, conforme
          permitido pelo art. 16 da LGPD:
        </p>
        <Bullets
          items={[
            'Registros de acesso ao aplicativo (logs): mantidos por até 6 meses, conforme o art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).',
            'Registros financeiros e fiscais de assinaturas ou compras: mantidos por até 5 anos, conforme a legislação tributária brasileira.',
            'Dados estritamente necessários para o cumprimento de obrigação legal, para o exercício regular de direitos em processo judicial, administrativo ou arbitral.',
          ]}
        />
        <p>
          Esses dados ficam armazenados de forma segura, com acesso restrito, e são eliminados
          automaticamente ao fim dos prazos acima.
        </p>
      </Section>

      <Section icon={AlertTriangle} title="5. Aviso importante">
        <p>
          A exclusão da conta é <strong>irreversível</strong>. Depois de confirmada, não é
          possível recuperar o histórico de vacinas, as medições de crescimento, os exames ou
          qualquer outro registro. Recomendamos que você exporte ou salve as informações
          importantes antes de prosseguir.
        </p>
      </Section>

      <Section icon={Server} title="6. Backups">
        <p>
          A remoção do banco de dados é imediata. Cópias de segurança (backups) do sistema podem
          reter os dados por um período adicional de até <strong>30 dias</strong>, após o qual
          são sobrescritas de forma definitiva.
        </p>
      </Section>

      <Section icon={UserCheck} title="7. Exclusão parcial de dados">
        <p>
          Se você não deseja excluir a conta inteira, é possível apagar dados específicos
          diretamente no aplicativo, a qualquer momento:
        </p>
        <Bullets
          items={[
            'Perfis de crianças: Menu → Gerenciar Perfis.',
            'Vacinas: tela Vacinas → toque no registro desejado.',
            'Medições de crescimento: tela Crescimento.',
            'Exames: tela Central de Exames.',
            'Alimentação: tela Alimentação e Nutrição.',
            'Lembretes: tela Lembretes e Rotina.',
          ]}
        />
      </Section>

      <Section icon={Mail} title="8. Contato">
        <p>
          Em caso de dúvidas sobre o processo de exclusão de conta e de dados, entre em contato
          pelo e-mail <ContactLink subject="Exclusão de Conta" />.
        </p>
      </Section>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Esta página é pública e pode ser acessada por qualquer pessoa, sem necessidade de
          cadastro ou login. Ela complementa a nossa Política de Privacidade e os Termos de Uso
          do RotinaPed.
        </p>
      </div>
    </LegalPage>
  );
}
