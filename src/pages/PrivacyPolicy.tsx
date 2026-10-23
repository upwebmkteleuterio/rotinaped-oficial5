import { Link } from 'react-router-dom';
import {
  Baby,
  Bell,
  Camera,
  Cookie,
  Database,
  FileText,
  Globe,
  Info,
  Lock,
  Mail,
  Megaphone,
  RefreshCw,
  Server,
  Share2,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  Bullets,
  CONTACT_EMAIL,
  LAST_UPDATE,
  LegalPage,
  Section,
  SITE_URL,
} from '@/components/common/LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      badge="Documento público"
      title="Política de Privacidade"
      subtitle={`Aplicativo e site RotinaPed · Última atualização: ${LAST_UPDATE}`}
    >

          <Section icon={Info} title="1. Introdução">
            <p>
              Esta Política de Privacidade descreve como o <strong>RotinaPed</strong> ("nós",
              "nosso" ou "aplicativo") coleta, utiliza, armazena, compartilha e protege as
              informações pessoais dos usuários e das crianças por eles acompanhadas.
            </p>
            <p>
              Esta política aplica-se ao aplicativo móvel RotinaPed e ao site{' '}
              <strong>{SITE_URL}</strong>, e foi elaborada em conformidade com a Lei Geral de
              Proteção de Dados (Lei nº 13.709/2018 – LGPD), com o Marco Civil da Internet
              (Lei nº 12.965/2014) e com as Políticas para Desenvolvedores do Google Play.
            </p>
            <p>
              Ao criar uma conta e utilizar o RotinaPed, você declara que leu, compreendeu e
              concorda com as práticas aqui descritas. Caso não concorde, não utilize o
              aplicativo.
            </p>
          </Section>

          <Section icon={UserCheck} title="2. Identificação do Controlador">
            <p>
              O controlador dos dados pessoais tratados por meio do aplicativo é o{' '}
              <strong>RotinaPed</strong>.
            </p>
            <Bullets
              items={[
                `Site oficial: ${SITE_URL}`,
                `E-mail de contato e do Encarregado de Proteção de Dados (DPO): ${CONTACT_EMAIL}`,
              ]}
            />
          </Section>

          <Section icon={Database} title="3. Informações que Coletamos">
            <p className="font-bold text-slate-700">3.1. Dados fornecidos por você</p>
            <Bullets
              items={[
                'Dados de cadastro: nome completo, endereço de e-mail e senha (armazenada de forma criptografada).',
                'Dados dos perfis acompanhados (filhos ou dependentes): nome, data de nascimento, sexo, tipo de perfil e informações de nascimento (peso, altura, semanas gestacionais e APGAR).',
                'Dados de saúde: registros de vacinação, medições de crescimento (peso, altura, IMC e perímetro cefálico), resultados de exames, alimentação, alergias e lembretes de rotina.',
                'Dados do pediatra: nome e telefone, quando informados por você.',
                'Imagens enviadas por você: fotos de cadernetas de vacinação e de exames médicos, utilizadas para leitura automática pela inteligência artificial.',
              ]}
            />

            <p className="font-bold text-slate-700 pt-2">
              3.2. Dados coletados automaticamente
            </p>
            <Bullets
              items={[
                'Dados de uso: telas acessadas, funcionalidades utilizadas e interações com o aplicativo.',
                'Dados técnicos e do dispositivo: modelo, sistema operacional, idioma, identificadores de sessão e endereço IP.',
                'Dados de registro e diagnóstico: registros de acesso (logs) e informações de falhas, utilizados para segurança e correção de erros.',
              ]}
            />

            <p className="font-bold text-slate-700 pt-2">3.3. Permissões do dispositivo</p>
            <p>
              O aplicativo pode solicitar as permissões abaixo, sempre para finalidades
              específicas e limitadas:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-[#1b6392] mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Câmera e galeria de fotos:</strong> exclusivamente para capturar e
                  enviar cadernetas de vacinação e exames para análise. Não acessamos suas
                  fotos sem uma ação direta sua.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-[#1b6392] mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Notificações:</strong> para enviar lembretes de vacinas, consultas e
                  rotina, conforme a sua configuração.
                </span>
              </li>
            </ul>
            <p>
              Você pode revogar essas permissões a qualquer momento nas configurações do seu
              dispositivo. Algumas funcionalidades podem deixar de funcionar após a revogação.
            </p>
          </Section>

          <Section icon={FileText} title="4. Como Utilizamos as Informações">
            <Bullets
              items={[
                'Criar, gerenciar e autenticar o acesso à sua conta.',
                'Exibir e organizar o calendário de vacinas, as medições de crescimento, os exames, a alimentação e os lembretes de rotina.',
                'Processar imagens de cadernetas e exames com inteligência artificial para identificar doses aplicadas e traduzir informações técnicas.',
                'Responder às suas dúvidas por meio do assistente virtual de pediatria.',
                'Enviar notificações e lembretes solicitados por você.',
                'Manter, melhorar e garantir a segurança e o funcionamento do aplicativo.',
                'Cumprir obrigações legais e regulatórias.',
              ]}
            />
            <p className="font-bold text-slate-700">
              Não utilizamos seus dados pessoais ou de saúde para publicidade e não vendemos
              dados pessoais a terceiros.
            </p>
          </Section>

          <Section icon={Lock} title="5. Bases Legais para o Tratamento">
            <p>O tratamento de dados pessoais no RotinaPed fundamenta-se em:</p>
            <Bullets
              items={[
                'Consentimento do titular ou do responsável legal (art. 7º, I, e art. 11, I, da LGPD).',
                'Execução de contrato ou de procedimentos preliminares (art. 7º, V).',
                'Cumprimento de obrigação legal ou regulatória (art. 7º, II).',
                'Legítimo interesse, para segurança e melhoria do serviço (art. 7º, IX).',
              ]}
            />
            <p>
              Os dados de saúde são considerados dados pessoais sensíveis (art. 5º, II, da
              LGPD) e somente são tratados mediante consentimento específico, para finalidades
              determinadas e informadas nesta política.
            </p>
          </Section>

          <Section icon={Share2} title="6. Compartilhamento com Terceiros">
            <p>
              Não vendemos, alugamos ou comercializamos seus dados. O compartilhamento ocorre
              apenas com operadores essenciais à prestação do serviço:
            </p>
            <Bullets
              items={[
                'Provedores de infraestrutura em nuvem, banco de dados e autenticação, utilizados para armazenar e proteger os dados da sua conta.',
                'Provedor de hospedagem do site e do aplicativo web.',
                'Provedor de inteligência artificial (Google, API Gemini), para análise de imagens de cadernetas/exames e para as respostas do assistente virtual. O conteúdo enviado é processado por esse provedor conforme suas próprias políticas de privacidade.',
                'Autoridades públicas, quando houver exigência legal, judicial ou regulatória.',
              ]}
            />
            <p>
              Todos os terceiros contratados estão obrigados a tratar os dados apenas para as
              finalidades contratadas e a adotar medidas de segurança compatíveis com a LGPD.
            </p>
          </Section>

          <Section icon={Baby} title="7. Dados de Crianças e Adolescentes">
            <p>
              O RotinaPed é uma ferramenta destinada a pais, mães e responsáveis legais,
              maiores de 18 anos. O cadastro de contas não é permitido para menores de idade.
            </p>
            <Bullets
              items={[
                'As informações sobre crianças são inseridas e gerenciadas exclusivamente pelo responsável legal, que declara ter autoridade para tanto e consente com o tratamento.',
                'Não coletamos dados diretamente de crianças e não direcionamos o aplicativo a elas.',
                'Não exibimos publicidade direcionada a crianças nem utilizamos dados infantis para fins publicitários.',
                'O responsável pode, a qualquer momento, acessar, corrigir ou solicitar a exclusão dos dados da criança.',
              ]}
            />
            <p>
              Essas medidas seguem as exigências do Google Play para aplicativos direcionados a
              famílias e a legislação brasileira aplicável à proteção de crianças e
              adolescentes.
            </p>
          </Section>

          <Section icon={Server} title="8. Armazenamento e Segurança">
            <p>
              Adotamos medidas técnicas e administrativas para proteger os seus dados, entre
              elas:
            </p>
            <Bullets
              items={[
                'Criptografia dos dados em trânsito por meio de conexões seguras (HTTPS/TLS).',
                'Controle de acesso por conta de usuário, com isolamento dos dados de cada titular no banco de dados.',
                'Armazenamento de senhas com algoritmo de hash, sem acesso ao texto original.',
                'Acesso restrito às informações apenas por pessoal autorizado e para finalidades legítimas.',
              ]}
            />
            <p>
              Apesar dos nossos esforços, nenhum método de transmissão ou armazenamento é
              totalmente seguro. Recomendamos que você utilize uma senha forte e não
              compartilhe suas credenciais de acesso.
            </p>
          </Section>

          <Section icon={RefreshCw} title="9. Retenção dos Dados">
            <p>
              Mantemos os dados pessoais enquanto a sua conta estiver ativa ou pelo período
              necessário ao cumprimento das finalidades descritas nesta política.
            </p>
            <p>
              Após a solicitação de exclusão da conta, os dados são eliminados ou anonimizados
              em até <strong>30 dias</strong>, ressalvadas as hipóteses de guarda obrigatória
              previstas em lei (por exemplo, registros de acesso, que podem ser mantidos pelo
              prazo legal).
            </p>
          </Section>

          <Section icon={UserCheck} title="10. Seus Direitos (LGPD)">
            <p>Você, titular dos dados, pode exercer os seguintes direitos:</p>
            <Bullets
              items={[
                'Confirmação da existência de tratamento e acesso aos dados.',
                'Correção de dados incompletos, inexatos ou desatualizados.',
                'Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.',
                'Portabilidade dos dados a outro fornecedor, mediante requisição expressa.',
                'Eliminação dos dados tratados com base no consentimento.',
                'Informação sobre entidades com as quais compartilhamos dados.',
                'Revogação do consentimento, a qualquer momento.',
              ]}
            />
            <p>
              Para exercer seus direitos, envie um e-mail para{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-bold text-[#1b6392] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . Responderemos à sua solicitação no prazo de até 15 dias.
            </p>
          </Section>

          <Section icon={Trash2} title="11. Exclusão de Conta e de Dados">
            <p>
              Você pode excluir, diretamente no aplicativo, os perfis e os registros de saúde
              que cadastrou (vacinas, medições, exames, alimentação e lembretes).
            </p>
            <p>
              Para excluir a sua <strong>conta</strong> e todos os dados a ela vinculados,
              utilize a opção <strong>Menu → Excluir Minha Conta</strong> dentro do aplicativo.
              Se preferir, a solicitação também pode ser feita por e-mail para{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Exclus%C3%A3o%20de%20Conta`}
                className="font-bold text-[#1b6392] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{' '}
              com o assunto "Exclusão de Conta", informando o e-mail cadastrado.
            </p>
            <p>
              A exclusão é permanente e remove a conta, os dados de cadastro, os perfis das
              crianças, os registros de saúde e os arquivos de exames enviados, em até 30 dias,
              ressalvadas as informações cuja guarda seja exigida por lei.
            </p>
            <p>
              O passo a passo completo, a lista detalhada dos dados excluídos e os prazos de
              retenção estão na página{' '}
              <Link to="/excluir-conta" className="font-bold text-[#1b6392] hover:underline">
                Exclusão de Conta e de Dados
              </Link>
              .
            </p>
          </Section>

          <Section icon={Cookie} title="12. Cookies e Tecnologias Semelhantes">
            <p>
              O site e o aplicativo utilizam armazenamento local do navegador (como o{' '}
              <em>localStorage</em>) e tecnologias semelhantes para manter a sua sessão, guardar
              preferências e permitir o funcionamento offline de algumas funcionalidades.
            </p>
            <p>
              Não utilizamos cookies de rastreamento publicitário de terceiros. Você pode
              limpar esses dados a qualquer momento nas configurações do seu navegador ou
              dispositivo.
            </p>
          </Section>

          <Section icon={Globe} title="13. Transferência Internacional de Dados">
            <p>
              Alguns dos provedores de serviços que utilizamos podem armazenar ou processar
              dados em servidores localizados fora do Brasil. Nesses casos, adotamos
              salvaguardas contratuais e medidas técnicas para assegurar um nível adequado de
              proteção, em conformidade com o art. 33 da LGPD.
            </p>
          </Section>

          <Section icon={Megaphone} title="14. Publicidade">
            <p>
              O RotinaPed não exibe anúncios de terceiros e não utiliza dados pessoais ou de
              saúde para fins publicitários. Caso essa prática venha a mudar, esta política
              será atualizada e, quando exigido por lei, solicitaremos o seu consentimento
              prévio.
            </p>
          </Section>

          <Section icon={RefreshCw} title="15. Alterações nesta Política">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente para refletir
              melhorias no aplicativo ou mudanças na legislação. A data da última atualização
              será sempre indicada no topo deste documento.
            </p>
            <p>
              O uso contínuo do aplicativo após a publicação de alterações significa que você
              concorda com a política revisada.
            </p>
          </Section>

          <Section icon={Mail} title="16. Contato">
            <p>
              Em caso de dúvidas, solicitações ou reclamações relacionadas à privacidade e à
              proteção de dados, entre em contato:
            </p>
            <Bullets items={[`E-mail: ${CONTACT_EMAIL}`, `Site: ${SITE_URL}`]} />
          </Section>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ao utilizar o RotinaPed, você declara ter lido e concordado com esta Política de
              Privacidade. Este documento é público e pode ser acessado por qualquer pessoa,
              sem necessidade de cadastro ou login.
            </p>
          </div>
    </LegalPage>
  );
}
