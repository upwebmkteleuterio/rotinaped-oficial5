import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Baby,
  Ban,
  CreditCard,
  FileText,
  Info,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import {
  Bullets,
  ContactLink,
  LAST_UPDATE,
  LegalPage,
  Section,
  SITE_URL,
} from '@/components/common/LegalPage';

export default function TermsOfUse() {
  return (
    <LegalPage
      badge="Documento público"
      title="Termos de Uso"
      subtitle={`Aplicativo e site RotinaPed · Última atualização: ${LAST_UPDATE}`}
    >
      <Section icon={FileText} title="1. Aceitação dos Termos">
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do aplicativo e do site{' '}
          <strong>RotinaPed</strong> ("nós", "nosso" ou "aplicativo"), disponível em{' '}
          <strong>{SITE_URL}</strong>.
        </p>
        <p>
          Ao criar uma conta, acessar ou utilizar o RotinaPed, você declara que leu, compreendeu
          e concorda integralmente com estes Termos e com a nossa{' '}
          <Link to="/politica" className="font-bold text-[#1b6392] hover:underline">
            Política de Privacidade
          </Link>
          . Caso não concorde com qualquer disposição, não utilize o aplicativo.
        </p>
      </Section>

      <Section icon={Info} title="2. Descrição do Serviço">
        <p>
          O RotinaPed é uma ferramenta de organização e acompanhamento da rotina pediátrica
          destinada a pais, mães e responsáveis legais. O aplicativo permite, entre outras
          funcionalidades:
        </p>
        <Bullets
          items={[
            'Registrar e acompanhar o calendário de vacinação da criança.',
            'Registrar medições de crescimento (peso, altura, IMC e perímetro cefálico) e acompanhar as curvas da Organização Mundial da Saúde.',
            'Armazenar exames médicos e realizar a leitura automática de cadernetas e exames por inteligência artificial.',
            'Registrar alimentação, lembretes de rotina e marcos do desenvolvimento.',
            'Disponibilizar um assistente virtual de pediatria para esclarecimento de dúvidas gerais.',
            'Acessar conteúdos informativos na biblioteca médica e participar de canais da comunidade.',
          ]}
        />
      </Section>

      <Section icon={UserCheck} title="3. Cadastro e Conta">
        <Bullets
          items={[
            'O cadastro é destinado exclusivamente a pessoas maiores de 18 anos, na condição de pais ou responsáveis legais pela criança.',
            'Você se compromete a fornecer informações verdadeiras, exatas e atualizadas, e a mantê-las atualizadas.',
            'As credenciais de acesso (e-mail e senha) são pessoais e intransferíveis. Você é responsável por manter o sigilo da sua senha e por todas as atividades realizadas na sua conta.',
            'É proibido compartilhar a conta com terceiros ou permitir o acesso não autorizado.',
            'Caso identifique uso não autorizado da sua conta, notifique-nos imediatamente pelo e-mail de contato.',
          ]}
        />
      </Section>

      <Section icon={Stethoscope} title="4. Aviso Médico Importante">
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              O RotinaPed <strong>não é um serviço médico</strong> e{' '}
              <strong>não substitui</strong> a consulta, o diagnóstico ou o tratamento
              realizados por profissionais de saúde habilitados.
            </p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Todas as informações, análises, traduções de exames, leituras de cadernetas e
            respostas fornecidas pelo aplicativo — incluindo aquelas geradas pelo assistente
            virtual de pediatria ("Dra. Flávia") — têm caráter <strong>exclusivamente
            informativo e educacional</strong> e não constituem diagnóstico, prescrição ou
            recomendação médica.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Decisões sobre a saúde da criança devem ser sempre tomadas em conjunto com o pediatra
            ou profissional de saúde responsável. Em caso de emergência, sintomas graves ou
            dúvidas urgentes, procure imediatamente um serviço de saúde ou o pronto-socorro mais
            próximo. Nunca ignore orientação médica profissional com base em informações obtidas
            pelo aplicativo.
          </p>
        </div>
      </Section>

      <Section icon={ShieldCheck} title="5. Uso da Inteligência Artificial">
        <Bullets
          items={[
            'Os recursos de inteligência artificial analisam imagens de cadernetas de vacinação e de exames para extrair e organizar informações. Esses recursos podem conter imprecisões e erros.',
            'É responsabilidade do usuário conferir e validar todas as informações registradas automaticamente antes de utilizá-las.',
            'Não nos responsabilizamos por decisões tomadas com base exclusivamente em conteúdo gerado por inteligência artificial.',
            'As imagens enviadas para análise são processadas por provedores de inteligência artificial terceiros, conforme descrito na nossa Política de Privacidade.',
          ]}
        />
      </Section>

      <Section icon={UserCheck} title="6. Responsabilidades do Usuário">
        <p>Ao utilizar o RotinaPed, você concorda em não:</p>
        <Bullets
          items={[
            'Utilizar o aplicativo para finalidades ilícitas ou não autorizadas.',
            'Inserir dados de crianças sem ter a autoridade legal de responsável.',
            'Publicar conteúdo ofensivo, ilegal, discriminatório, falso ou que viole direitos de terceiros nos canais da comunidade.',
            'Realizar engenharia reversa, copiar, modificar, distribuir ou explorar comercialmente qualquer parte do aplicativo.',
            'Tentar acessar áreas restritas, dados de outros usuários ou comprometer a segurança e a integridade do serviço.',
            'Utilizar meios automatizados (bots, scrapers) para acessar o aplicativo.',
          ]}
        />
      </Section>

      <Section icon={CreditCard} title="7. Planos, Pagamentos e Cancelamento">
        <Bullets
          items={[
            'O RotinaPed pode oferecer funcionalidades gratuitas e funcionalidades pagas, na forma de planos ou assinaturas.',
            'As compras e assinaturas realizadas por meio das lojas de aplicativos (Google Play) são processadas pela própria loja e estão sujeitas às suas políticas de pagamento, renovação e reembolso.',
            'Assinaturas são renovadas automaticamente até que sejam canceladas. O cancelamento deve ser feito na loja de aplicativos onde a assinatura foi contratada, ou diretamente nas configurações da sua conta.',
            'O cancelamento interrompe as cobranças futuras, mas não gera reembolso automático de períodos já pagos, salvo quando exigido pela legislação aplicável ou pelas políticas da loja.',
            'Podemos alterar os preços e a composição dos planos, comunicando previamente os usuários afetados.',
          ]}
        />
      </Section>

      <Section icon={Lock} title="8. Propriedade Intelectual">
        <p>
          Todos os direitos sobre o aplicativo RotinaPed — incluindo marca, logotipo, código-fonte,
          layout, textos, imagens, bases de dados e demais conteúdos — pertencem aos seus
          titulares e são protegidos pela legislação de propriedade intelectual.
        </p>
        <p>
          Os conteúdos informativos da biblioteca médica são disponibilizados para uso pessoal e
          não comercial. É vedada a reprodução, distribuição ou uso comercial sem autorização
          expressa.
        </p>
      </Section>

      <Section icon={Ban} title="9. Suspensão e Encerramento">
        <p>
          Podemos suspender ou encerrar o acesso à conta, a qualquer momento e sem aviso prévio,
          em caso de violação destes Termos, uso indevido do serviço, exigência legal ou
          determinação de autoridade competente.
        </p>
        <p>
          Você pode encerrar a sua conta a qualquer momento, a partir da opção{' '}
          <strong>Excluir Minha Conta</strong> no aplicativo. O processo está detalhado na página{' '}
          <Link to="/excluir-conta" className="font-bold text-[#1b6392] hover:underline">
            Exclusão de Conta e de Dados
          </Link>
          .
        </p>
      </Section>

      <Section icon={Scale} title="10. Limitação de Responsabilidade">
        <p>
          O RotinaPed é fornecido "como está" e "conforme disponível". Empregamos esforços
          razoáveis para manter o serviço disponível, seguro e livre de erros, mas não garantimos
          operação ininterrupta, ausência de falhas ou exatidão absoluta das informações.
        </p>
        <p>
          Na máxima extensão permitida pela legislação aplicável, não nos responsabilizamos por:
        </p>
        <Bullets
          items={[
            'Danos decorrentes de decisões de saúde tomadas exclusivamente com base em informações do aplicativo.',
            'Erros, imprecisões ou omissões em dados inseridos pelo próprio usuário ou gerados por leitura automática.',
            'Indisponibilidade temporária do serviço, perda de dados por falhas de conexão ou de dispositivos do usuário.',
            'Atos de terceiros, incluindo provedores de infraestrutura e de inteligência artificial.',
            'Danos indiretos, lucros cessantes ou perdas de qualquer natureza decorrentes do uso ou da impossibilidade de uso do aplicativo.',
          ]}
        />
        <p>
          Nada nestes Termos exclui ou limita direitos assegurados ao consumidor pela legislação
          brasileira, em especial pelo Código de Defesa do Consumidor (Lei nº 8.078/1990).
        </p>
      </Section>

      <Section icon={ShieldCheck} title="11. Privacidade e Proteção de Dados">
        <p>
          O tratamento de dados pessoais, incluindo os dados de saúde das crianças, é realizado
          conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD) e está descrito
          em detalhes na nossa{' '}
          <Link to="/politica" className="font-bold text-[#1b6392] hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <p>
          As informações sobre crianças são inseridas exclusivamente pelos pais ou responsáveis
          legais, que declaram ter autoridade para tanto e consentem com o tratamento.
        </p>
      </Section>

      <Section icon={RefreshCw} title="12. Alterações nos Termos">
        <p>
          Podemos atualizar estes Termos periodicamente. A data da última atualização será sempre
          indicada no topo do documento. Alterações relevantes serão comunicadas pelo aplicativo
          ou por e-mail.
        </p>
        <p>
          O uso contínuo do aplicativo após a publicação de alterações significa que você
          concorda com os Termos revisados.
        </p>
      </Section>

      <Section icon={Baby} title="13. Legislação Aplicável e Foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
          foro do domicílio do consumidor para dirimir eventuais controvérsias, conforme
          previsto na legislação consumerista.
        </p>
      </Section>

      <Section icon={Mail} title="14. Contato">
        <p>
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail{' '}
          <ContactLink subject="Termos de Uso" />.
        </p>
      </Section>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Este documento é público e pode ser acessado por qualquer pessoa, sem necessidade de
          cadastro ou login. Ao utilizar o RotinaPed, você declara ter lido e concordado com
          estes Termos de Uso.
        </p>
      </div>
    </LegalPage>
  );
}
