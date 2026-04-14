import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Shield, CreditCard, Car, Phone, Zap, Clock, MapPin, Users, Search } from "lucide-react";
import { ConsultaRapidaFAQ } from "./ConsultaRapidaFAQ";

interface FAQProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'geral' | 'pagamento' | 'conta' | 'seguranca' | 'tecnico';
  icon: any;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Como funciona o Pedágio Simples? Preciso me cadastrar para consultar meus débitos?',
    answer: 'O Pedágio Simples permite consultar seus débitos de pedágio gratuitamente, sem necessidade de cadastro - basta informar a placa do seu veículo. Porém, para realizar o pagamento das pendências, é obrigatório fazer um cadastro com seus dados pessoais por questões de segurança e conformidade legal. O processo é rápido e simples!',
    category: 'geral',
    icon: Car
  },
  {
    id: '2', 
    question: 'Quais formas de pagamento vocês aceitam?',
    answer: 'Aceitamos apenas PIX para garantir máxima segurança e agilidade nas transações. O PIX é processado instantaneamente, não possui taxas adicionais e oferece total segurança através de nossa criptografia SSL 256 bits e processamento direto pelo Banco Central do Brasil.',
    category: 'pagamento',
    icon: CreditCard
  },
  {
    id: '3',
    question: 'Posso escolher quais pendências quero pagar ou preciso pagar todas de uma vez?',
    answer: 'Você tem total flexibilidade! Nossa plataforma permite selecionar individualmente quais pendências deseja quitar. Pode escolher pagar apenas uma, algumas específicas ou todas de uma vez. O valor total é calculado automaticamente baseado na sua seleção, oferecendo total controle sobre seus gastos.',
    category: 'pagamento',
    icon: Zap
  },
  {
    id: '4',
    question: 'Meus dados estão seguros? Como vocês protegem minhas informações?',
    answer: 'Sim! Utilizamos as mais avançadas tecnologias de segurança: criptografia SSL 256 bits, processamento direto via PIX do Banco Central, monitoramento 24/7 contra fraudes e não armazenamos dados bancários. Todas as transações são processadas em ambiente seguro e seus dados pessoais são protegidos conforme a LGPD.',
    category: 'seguranca',
    icon: Shield
  },
  {
    id: '5',
    question: 'Após o pagamento, quanto tempo leva para minha pendência ser quitada?',
    answer: 'O PIX tem processamento instantâneo! Assim que confirmado, você receberá um comprovante imediatamente e poderá acompanhar o status em tempo real no seu painel de usuário. Sua pendência é quitada na hora, sem espera!',
    category: 'pagamento',
    icon: Clock
  },
  {
    id: '6',
    question: 'O que posso fazer na minha área logada (Dashboard)?',
    answer: 'Em sua conta você pode: consultar histórico completo de pagamentos, gerenciar métodos de pagamento salvos, cadastrar múltiplos veículos, fazer novas consultas de débitos, atualizar dados pessoais, acessar comprovantes anteriores e configurar preferências da conta. É seu centro de controle completo!',
    category: 'conta',
    icon: Users
  },
  {
    id: '7',
    question: 'Posso cadastrar mais de um veículo na minha conta?',
    answer: 'Sim! Você pode cadastrar quantos veículos quiser em sua conta. Isso facilita o gerenciamento de pendências de toda sua frota familiar ou empresarial em um só lugar. Cada veículo terá seu histórico individual e você pode consultar débitos de todos eles rapidamente.',
    category: 'conta',
    icon: Car
  },
  {
    id: '8',
    question: 'Esqueci minha senha. Como posso recuperá-la?',
    answer: 'É simples! Na tela de login, clique em "Esqueci minha senha", informe seu e-mail cadastrado e você receberá instruções para criar uma nova senha. O processo é rápido e seguro. Se tiver dificuldades, nossa equipe de suporte está disponível 24/7 para ajudar.',
    category: 'tecnico',
    icon: HelpCircle
  },
  {
    id: '10',
    question: 'O pagamento da pendência de pedágio exclui possíveis multas de trânsito?',
    answer: 'NÃO. É muito importante esclarecer: o pagamento da passagem de pedágio NÃO exclui multas por infrações de trânsito. São coisas diferentes! Quitamos apenas as pendências de passagem nas praças de pedágio. Multas devem ser tratadas diretamente com os órgãos de trânsito competentes.',
    category: 'geral',
    icon: MapPin
  }
];

const categories = [
  { id: 'todas', name: 'Todas as perguntas', icon: Search },
  { id: 'geral', name: 'Informações Gerais', icon: HelpCircle },
  { id: 'pagamento', name: 'Pagamentos', icon: CreditCard },
  { id: 'conta', name: 'Minha Conta', icon: Users },
  { id: 'seguranca', name: 'Segurança', icon: Shield },
  { id: 'tecnico', name: 'Suporte Técnico', icon: Phone }
];

export function FAQ({ onBack }: FAQProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F8F9FA] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003566] rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#003566]">Pedágio Simples</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Título e Introdução */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#003566] text-white rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">CENTRAL DE AJUDA</span>
            </div>
            <h1 className="text-4xl font-bold text-[#000000] mb-4">
              Perguntas Frequentes
            </h1>

          </div>
          {/* Consulta Rápida */}
          <div className="mb-12">
            <Card className="border border-[#00B4D8] bg-gradient-to-r from-[#F8F9FA] to-white shadow-lg">

            </Card>
          </div>

          {/* Lista de Perguntas */}
          <div className="space-y-4">
            {filteredFAQ.length === 0 ? (
              <Card className="border border-[#E0E0E0] p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Search className="h-12 w-12 text-[#6C757D]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#000000] mb-2">
                      Nenhuma pergunta encontrada
                    </h3>
                    <p className="text-[#6C757D]">
                      Tente ajustar sua pesquisa ou entrar em contato conosco.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              filteredFAQ.map((item) => {
                const isExpanded = expandedItems.includes(item.id);
                const Icon = item.icon;
                
                return (
                  <Card key={item.id} className="border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full p-6 text-left hover:bg-[#F8F9FA] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#000000] leading-tight">
                            {item.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-[#6C757D]" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#6C757D]" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <CardContent className="px-6 pb-6 pt-0">
                        <div className="ml-14 border-l-2 border-[#00B4D8] pl-6">
                          <p className="text-[#000000] leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Seção de Contato */}
          <div className="mt-16">
            <Card className="bg-[#003566] text-white border-none shadow-lg">

            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}

    </div>
  );
}