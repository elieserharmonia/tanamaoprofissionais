import { Profissional, Oferta } from './types';

export const INITIAL_PROFESSIONALS: Profissional[] = [
  {
    id: 1,
    nome: "Carlos Eduardo Oliveira",
    empresa: "Oliveira Reformas e Manutenção Residencial",
    categoria: "Reformas",
    emoji: "🔨",
    cidade: "São Paulo - SP",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Pedreiro e mestre de obras com certificação técnica e 12 anos de experiência sólida em instalações residenciais e comerciais. Efetuamos soluções completas de alvenaria, colocação de pisos e revestimentos, hidráulica, pequenas reformas, pintura fina e acabamentos em gesso. Atendimento focado em pontualidade, limpeza e preço justo.",
    telefone: "(11) 3649-1122",
    celular: "(11) 94821-3322",
    email: "carlos.reformas@goldmail.com",
    endereco: "Rua Augusta, 1020 - Consolação",
    destaque: "solo", // 1st Destaque Solo
    visitas: 1540,
    dataCadastro: "2026-03-12T10:30:00Z",
    atende24h: true, // 24h
    comGaleriaAmpliada: true,
    galeria: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Sérgio Pinheiro", estrelas: 5, comentario: "Excelente profissional. Executou a reforma do meu banheiro com capricho e entregou antes do prazo.", data: "2026-05-18" },
      { autor: "Camila Fraga", estrelas: 5, comentario: "Super educado, limpa toda a sujeira ao final do dia. Recomendo muito!", data: "2026-05-24" }
    ]
  },
  {
    id: 2,
    nome: "Dra. Clarice Mendes",
    empresa: "Clínica Equilíbrio - Nutrição Integrada & Psicologia",
    categoria: "Consultoria",
    emoji: "🤝",
    cidade: "Campinas - SP",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Pós-graduada em Nutrição Clínica Funcional e Coach de Bem-Estar. Mais de 8 anos auxiliando pessoas a redefinirem sua relação com a comida, focando no equilíbrio mental e físico. Nosso método une mentoria de hábitos saudáveis, reeducação alimentar prática e apoio psicológico para mudança de vida real, duradoura e sem sofrimento.",
    telefone: "(19) 3252-4411",
    celular: "(19) 98022-7711",
    email: "contato@claricemendesnutri.com.br",
    endereco: "Av. Barão de Itapura, 1500 - Botafogo",
    destaque: "linha", // 1st Destaque Linha
    visitas: 1890,
    dataCadastro: "2026-02-10T14:45:00Z",
    atende24h: false,
    galeria: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Heloisa Torres", estrelas: 5, comentario: "Incrível! A consulta presencial é ótima e o acompanhamento digital ajudou muito no meu foco diário.", data: "2026-05-12" },
      { autor: "Augusto Ribeiro", estrelas: 4, comentario: "Excelente profissional. Atendimento humanizado e focado em metas reais.", data: "2026-05-29" }
    ]
  },
  {
    id: 3,
    nome: "Fernando Silva",
    empresa: "Silva Pintores e Gesso Decorativo",
    categoria: "Reformas",
    emoji: "🔨",
    cidade: "Bauru - SP",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Especialista em pintura predial, residencial, aplicação de texturas e gesso 3D. Atuamos com a melhor tecnologia de pintura mecanizada airless que garante qualidade excelente, sem desperdício de tinta e em tempo recorde. Orçamento sem compromisso em todo o estado.",
    telefone: "(14) 3225-0909",
    celular: "(14) 97511-9080",
    email: "fernandopinturas@gmail.com",
    endereco: "Av. Nações Unidas, 2200 - Centro",
    destaque: "solo", // 2nd Destaque Solo
    visitas: 2431,
    dataCadastro: "2026-04-01T08:00:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Marcos Lima", estrelas: 5, comentario: "O melhor pintor de Bauru! Fez a fachada da minha loja toda e ficou sensacional.", data: "2026-04-20" }
    ]
  },
  {
    id: 4,
    nome: "Sofia Nogueira d'Avila",
    empresa: "Ateliê Sofia Nogueira - Estética e Sobrancelhas",
    categoria: "Beleza",
    emoji: "💅",
    cidade: "São Paulo - SP",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Design de sobrancelhas personalizado, depilação a laser, micropigmentação labial estética de alto realismo, aplicação de cílios fio a fio e unhas de gel. Formada pelas maiores academias nacionais, nosso lema é ressaltar a sua beleza de forma suave, elegante e totalmente natural.",
    telefone: "(11) 4022-3811",
    celular: "(11) 97311-5500",
    email: "contato@sofianogueira.com.br",
    endereco: "Rua Pamplona, 730 - Jardim Paulista",
    destaque: "linha", // 2nd Destaque Linha
    visitas: 1250,
    dataCadastro: "2026-05-02T16:00:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Fernanda Castanheira", estrelas: 5, comentario: "Espaço luxuoso e atendimento de rainha! O design ficou perfeito.", data: "2026-05-15" }
    ]
  },
  {
    id: 5,
    nome: "Prof. Amanda Cardoso de Lima",
    empresa: "Reforço Nota Dez - Aulas Particulares",
    categoria: "Aulas",
    emoji: "📚",
    cidade: "São Paulo - SP",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Pedagoga e especialista em alfabetização infantil e reforço do Ensino Fundamental. Oferecemos planejamento de estudos individualizado, acompanhamento de tarefas diárias e preparação intensiva para provas em Matemática e Português. Experiência de 10 anos nas melhores escolas particulares.",
    telefone: "(11) 3222-3011",
    celular: "(11) 96190-2010",
    email: "amanda.aulas@gmail.com",
    endereco: "Av. Brigadeiro Luis Antônio, 1420 - Bela Vista",
    destaque: "none",
    visitas: 480,
    dataCadastro: "2026-05-08T07:15:00Z",
    atende24h: false,
    galeria: [
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Sueli Albuquerque", estrelas: 5, comentario: "Minha filha de 8 anos melhorou muito as notas e tomou gosto pela leitura. Amanda é fantástica!", data: "2026-05-27" }
    ]
  },
  {
    id: 6,
    nome: "Ricardo Abreu Junior",
    empresa: "Ricardo TI & Soluções Digitais",
    categoria: "Tecnologia",
    emoji: "💻",
    cidade: "Bauru - SP",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Consultoria e suporte técnico profissional para computadores, servidores, redes Wi-Fi e segurança. Formatação detalhada com backup, montagem de computadores gamer, higienização interna de notebooks e desenvolvimento de sites institucionais para PMEs e profissionais autônomos legítimos.",
    telefone: "(14) 4001-9022",
    celular: "(14) 98011-8833",
    email: "suporte@ricardotech.com.br",
    endereco: "Rua Gustavo Maciel, 410 - Centro",
    destaque: "linha", // 3rd Destaque Linha
    visitas: 1120,
    dataCadastro: "2026-01-22T09:00:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Júlio César", estrelas: 5, comentario: "Resolveu o problema de lentidão do meu notebook em tempo recorde.", data: "2026-04-10" }
    ]
  },
  {
    id: 7,
    nome: "Mariana Costa Santos",
    empresa: "Brilho Real - Organização e Limpeza",
    categoria: "Casa",
    emoji: "🏠",
    cidade: "Campinas - SP",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Especialista em organização de ambientes (Personal Organizer) e serviços de limpeza residencial padrão premium. Atuamos com higienização de estofados, limpeza pós-obra, arrumação de armários e closets, e higienização geral de cozinhas e banheiros com produtos sustentáveis.",
    telefone: "(19) 3450-9900",
    celular: "(19) 99877-2200",
    email: "mariana.organizer@uol.com.br",
    endereco: "Av. Benjamin Constant, 1200 - Cambuí",
    destaque: "linha",
    visitas: 690,
    dataCadastro: "2026-04-18T11:20:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Lorena Peixoto", estrelas: 5, comentario: "O trabalho de organização do closet superou minhas expectativas. Ganhei muito espaço!", data: "2026-05-19" }
    ]
  },
  {
    id: 8,
    nome: "Prof. Paulo Freire Neto",
    empresa: "Nativo Global - Inglês Tradutor",
    categoria: "Aulas",
    emoji: "📚",
    cidade: "Bauru - SP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Aulas dinâmicas e focadas em conversação voltada para mercado de trabalho, viagens de turismo ou preparação para exames de proficiência (IELTS/TOEFL). Metodologia imersiva, material personalizado para qualquer faixa etária.",
    telefone: "(14) 3320-7212",
    celular: "(14) 99120-4100",
    email: "pauloneto.ingles@gmail.com",
    endereco: "Rua Antonio Alves, 120 - Vila Universitária",
    destaque: "none",
    visitas: 742,
    dataCadastro: "2026-04-12T13:40:00Z",
    atende24h: false,
    galeria: [
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Henrique Ramos", estrelas: 5, comentario: "Melhor professor de conversação que já tive. Perdi a vergonha na primeira aula.", data: "2026-05-18" }
    ]
  },
  {
    id: 9,
    nome: "Patricia Lima",
    empresa: "Lash Designer & Salão de Beleza",
    categoria: "Beleza",
    emoji: "💅",
    cidade: "Campinas - SP",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Oferecemos extensões de cílios premium usando a revolucionária técnica de retenção máxima. Manicure russa, esmaltação permanente em gel de alta durabilidade e spas relaxantes. Atendimento domiciliar e no estúdio.",
    telefone: "(19) 3211-4800",
    celular: "(19) 98012-7011",
    email: "patty.beauty@gmail.com",
    endereco: "Av. Coronel Silva Teles, 420 - Cambuí",
    destaque: "none",
    visitas: 590,
    dataCadastro: "2026-03-30T10:11:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Erika Martins", estrelas: 5, comentario: "As unhas de gel duram mais de um mês sem quebrar. E os cílios são perfeitos!", data: "2026-04-22" }
    ]
  },
  {
    id: 10,
    nome: "Jorge Muro",
    empresa: "Muro Jardinagem & Paisagismo",
    categoria: "Casa",
    emoji: "🏠",
    cidade: "São Paulo - SP",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Jardinagem integral para chácaras, condomínios e residências particulares. Corte de grama de precisão, podas de árvores em geral, plantios corretivos, controle de pragas e projetos paisagísticos sob medida.",
    telefone: "(11) 3491-0300",
    celular: "(11) 96102-3044",
    email: "jorgemurojardinagem@gmail.com",
    endereco: "Av. Rebouças, 3100 - Pinheiros",
    destaque: "none",
    visitas: 641,
    dataCadastro: "2026-05-01T15:22:00Z",
    atende24h: false,
    galeria: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Arnaldo Silveira", estrelas: 4, comentario: "Excelente serviço. Deixou meu jardim impecável.", data: "2026-05-10" }
    ]
  },
  {
    id: 11,
    nome: "Roberto Silveira",
    empresa: "Mapeamento e Consultoria Financeira Bauru",
    categoria: "Consultoria",
    emoji: "🤝",
    cidade: "Bauru - SP",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Especialista em planejamento de tributos, organização de fluxo de caixa corporativo, captação legal de investimentos para negócios em crescimento e reestruturação de finanças pessoais do empresário doméstico.",
    telefone: "(14) 3224-8800",
    celular: "(14) 99114-5566",
    email: "roberto.consultor@yahoo.com.br",
    endereco: "Rua Monsenhor Claro, 800 - Centro",
    destaque: "none",
    visitas: 412,
    dataCadastro: "2026-04-20T17:10:00Z",
    atende24h: false,
    galeria: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Sérgio Mota", estrelas: 5, comentario: "Sua consultoria salvou o fluxo de caixa de nossa pequena distribuidora.", data: "2026-05-02" }
    ]
  },
  {
    id: 12,
    nome: "Carlos Dev",
    empresa: "Carlos Soluções de TI",
    categoria: "Tecnologia",
    emoji: "💻",
    cidade: "Campinas - SP",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
    bio: "Desenvolvimento de Websites Responsivos, criação de e-commerce completos com integrações de pagamentos automáticos, otimização de SEO para buscadores públicos e automação de planilhas e processos com scripts.",
    telefone: "(19) 3213-9090",
    celular: "(19) 99611-3030",
    email: "carlosdev.suporte@outlook.com",
    endereco: "Rua Maria Monteiro, 820 - Cambuí",
    destaque: "none",
    visitas: 512,
    dataCadastro: "2026-05-15T11:00:00Z",
    atende24h: true, // 24h
    galeria: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"
    ],
    avaliacoes: [
      { autor: "Letícia Gois", estrelas: 5, comentario: "Site profissional de alto nível, super rápido e configurado nos mínimos detalhes.", data: "2026-05-28" }
    ]
  }
];

export const CATEGORIES_LIST = [
  { name: "Reformas", emoji: "🔨", description: "Pintores, pedreiros e marcenaria" },
  { name: "Beleza", emoji: "💅", description: "Unhas, cílios e cabeleireiros" },
  { name: "Aulas", emoji: "📚", description: "Reforço, línguas e música" },
  { name: "Tecnologia", emoji: "💻", description: "Redes, computadores e criação de sites" },
  { name: "Casa", emoji: "🏠", description: "Faxina, organização e jardinagem" },
  { name: "Consultoria", emoji: "🤝", description: "Finanças, mentoria e nutrição" }
];

export const INITIAL_OFFERS: Oferta[] = [
  {
    id: 1,
    profissionalId: 1,
    profissionalNome: "Carlos Eduardo",
    titulo: "Instalação Completa de Chuveiro",
    descricao: "Troca e reforço de fiação, verificação de disjuntor e vedação completa.",
    desconto: "30% OFF",
    precoOriginal: 120,
    precoPromocional: 84,
    imagem: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    profissionalId: 4,
    profissionalNome: "Sofia Nogueira",
    titulo: "Design de Sobrancelha Premium",
    descricao: "Limpeza minuciosa com pinça, alinhamento simétrico e aplicação de henna natural.",
    desconto: "25% OFF",
    precoOriginal: 80,
    precoPromocional: 60,
    imagem: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    profissionalId: 6,
    profissionalNome: "Ricardo Abreu",
    titulo: "Formatação Completa de Laptop + SSD",
    descricao: "Remoção total de vírus, backup seguro de dados e upgrade de SSD.",
    desconto: "40% OFF",
    precoOriginal: 150,
    precoPromocional: 90,
    imagem: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    profissionalId: 7,
    profissionalNome: "Mariana Costa Santos",
    titulo: "Arrumação de Cozinha & Closet Completo",
    descricao: "Uso de técnicas avançadas de dobras e separações inteligentes de utensílios.",
    desconto: "20% OFF",
    precoOriginal: 180,
    precoPromocional: 144,
    imagem: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
  }
];

export const INITIAL_HERO_AD_SLIDES = [
  {
    id: 1,
    title: "Conecte-se com os melhores profissionais!",
    subtitle: "Confiabilidade, avaliações reais e contato direto sem taxas extras pelo TáNaMão.",
    badge: "CATÁLOGO OFICIAL",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Rápido de achar, fácil de contratar. Tá de fato Na Mão!",
    subtitle: "Consulte pintores, esteticistas, eletricistas e consultores pertinho de você.",
    badge: "QUALIDADE CERTIFICADA",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Quer alavancar o faturamento da sua empresa ou serviços?",
    subtitle: "Anuncie de forma totalmente gratuita agora mesmo e seja encontrado por milhares de clientes.",
    badge: "ANUNCIE GRÁTIS",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
  }
];
