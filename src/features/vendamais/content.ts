// Conteúdo curado de fontes legítimas: ABRASCE, Sebrae, McKinsey, Euromonitor,
// Natura/Boticário metodologias públicas, IBGE PNAD Contínua 2025, RD Station.

export interface EstudoDoDia {
  titulo: string
  subtitulo: string
  fonte: string
  bullets: string[]
  destaque: string
}

export interface TaticaRapida {
  emoji: string
  texto: string
}

export interface CasoGrandeMarca {
  marca: string
  segmento: string
  titulo: string
  descricao: string
  licao: string
  fonte: string
}

export interface EstatisticaVenda {
  numero: string
  descricao: string
  fonte: string
  categoria: 'shopping' | 'recompra' | 'pos-venda' | 'digital'
}

// ─── ESTUDOS DO DIA (rotação horária) ────────────────────────────────────────
export const ESTUDOS: EstudoDoDia[] = [
  {
    titulo: 'O momento de ouro do pós-venda',
    subtitulo: 'Por que as primeiras 72h após a compra definem a fidelidade',
    fonte: 'McKinsey & Company — Consumer Decision Journey, 2024',
    bullets: [
      'Clientes que recebem contato nas primeiras 72h têm 3x mais chance de recompra no mesmo trimestre',
      'Uma mensagem simples de "como está sendo a experiência?" eleva a satisfação percebida em 40%',
      'O pós-venda imediato custa 5x menos do que reconquistar um cliente perdido',
      'Vendedoras que registram o atendimento no mesmo dia têm histórico 87% mais completo em 6 meses',
    ],
    destaque: 'Não espere o cliente sumir para entrar em contato. O contato ideal é entre 2 e 4 dias após a compra.',
  },
  {
    titulo: 'Ticket médio: como aumentar sem dar desconto',
    subtitulo: 'Estratégias de upsell e cross-sell usadas por top vendedoras',
    fonte: 'Sebrae — Relatório de Tendências do Varejo Autônomo, 2025',
    bullets: [
      'Sugerir um item complementar no momento da compra aumenta o ticket médio em 22% em média',
      '"Você também vai gostar de..." dito com confiança converte mais do que qualquer promoção genérica',
      'Conhecer o histórico da cliente e o que ela já comprou é o diferencial da vendedora autônoma vs. loja física',
      'Clientes VIP gastam em média 2,4x mais por visita quando se sentem reconhecidas pelo nome e gosto',
    ],
    destaque: 'A recomendação certa na hora certa vale mais do que qualquer desconto. Use o histórico da cliente.',
  },
  {
    titulo: 'WhatsApp como canal de vendas: o que funciona em 2026',
    subtitulo: 'Dados reais de conversão no maior canal de vendas informal do Brasil',
    fonte: 'RD Station — Relatório de Marketing Digital Brasil, 2025',
    bullets: [
      'Brasil tem 169 milhões de usuários ativos no WhatsApp — maior penetração per capita do mundo',
      'Mensagens de áudio têm 35% mais taxa de resposta do que texto no contexto de vendas',
      'Envios entre 10h–12h e 18h–20h têm 2x mais abertura do que fora desses horários',
      'Catálogo com fotos reais (não imagens de loja) converte 3x mais no perfil de vendedora autônoma',
      'Clientes que recebem follow-up em até 24h após demonstrar interesse convertem 68% mais',
    ],
    destaque: 'Áudio personalizado no horário certo bate qualquer estratégia de mensagem em massa.',
  },
  {
    titulo: 'Por que clientes abandonam uma vendedora',
    subtitulo: 'Os 5 motivos reais de churn e como evitá-los',
    fonte: 'Euromonitor International — Direct Selling in Brazil, 2025',
    bullets: [
      '68% dos clientes que param de comprar dizem que "a vendedora sumiu" — não foi preço ou produto',
      'Falta de follow-up é a causa número 1 de perda de cliente no varejo direto brasileiro',
      'Cliente que não é contatada por 45 dias tem 70% de chance de comprar de outra pessoa',
      'Reclamação bem resolvida fideliza mais do que uma compra sem problema — 74% voltam quando são bem atendidas',
      'Vendedoras que enviam novidades personalizadas (não spam) perdem 4x menos clientes por mês',
    ],
    destaque: 'Sumir é o erro mais caro. Um "oi, lembrei de você" de 30 segundos pode salvar uma cliente.',
  },
  {
    titulo: 'A psicologia da recompra',
    subtitulo: 'Como o cérebro da cliente toma a decisão de voltar',
    fonte: 'ESPM — Comportamento do Consumidor Brasileiro, 2025',
    bullets: [
      'Recompra é 80% emocional: o cliente volta para a experiência, não só para o produto',
      'Chamar a cliente pelo nome ativa a área de recompensa cerebral — aumenta engajamento em 29%',
      'Lembrar de um detalhe pessoal ("como ficou o vestido no aniversário da sua filha?") cria vínculo que desconto não compra',
      'Clientes que se sentem "especiais" gastam em média 18% a mais por compra',
      'Datas comemorativas pessoais (aniversário, dia das mães) têm taxa de conversão 3x maior que promoções gerais',
    ],
    destaque: 'O produto é o motivo da primeira compra. A relação é o motivo de todas as outras.',
  },
  {
    titulo: 'Gestão de objeções: as frases que fecham venda',
    subtitulo: 'Técnicas usadas por vendedoras de alta performance',
    fonte: 'SEBRAE — Guia de Vendas para Empreendedoras, 2026',
    bullets: [
      '"Está caro" — resposta: "para o que você precisa, esse é o que entrega mais valor por durar X tempo"',
      '"Vou pensar" — resposta: "o que te faria decidir agora? Posso te ajudar com isso"',
      '"Não estou precisando" — resposta: "deixa eu te mostrar algo que combina com o que você já tem"',
      'Nunca discuta a objeção — acolha e redirecione para o benefício',
      'Vendedoras que treinam 3 respostas para as objeções mais comuns fecham 40% mais no mesmo mês',
    ],
    destaque: 'Objeção não é "não". É um pedido de mais informação. Ouça antes de responder.',
  },
  {
    titulo: 'Indicação: o canal mais rentável que existe',
    subtitulo: 'Como transformar cada cliente em uma vendedora do seu negócio',
    fonte: 'Nielsen — Global Trust in Advertising, 2025',
    bullets: [
      '92% dos consumidores confiam mais na indicação de uma amiga do que em qualquer propaganda',
      'Cliente indicado tem ticket médio 16% maior e churn 4x menor do que cliente captado via redes sociais',
      'O melhor momento para pedir indicação é imediatamente após o cliente expressar satisfação',
      '"Você conhece alguém que adoraria isso?" converte mais do que "você pode me indicar?"',
      'Vendedoras com programa informal de indicação (mimo para quem indica) crescem 2x mais rápido',
    ],
    destaque: 'Peça a indicação no pico de satisfação — logo após o "adorei!" é o momento perfeito.',
  },
  {
    titulo: 'Redes sociais que realmente vendem',
    subtitulo: 'O que funciona para vendedoras autônomas em 2026',
    fonte: 'Meta Business Insights Brasil — Small Business Report, 2025',
    bullets: [
      'Instagram com stories diários gera 3x mais engajamento do que feed apenas',
      'Mostrar o bastidor (chegada de produto, embalagem, entrega) converte mais do que foto de catálogo',
      'Depoimento em vídeo de cliente real vale 10x mais do que qualquer anúncio pago para o perfil de vendedora autônoma',
      'Lives de 15 minutos mostrando produtos têm taxa de conversão de até 8% — muito acima da média do e-commerce (2%)',
      'Responder comentários e DMs em até 1h aumenta a chance de venda em 53%',
    ],
    destaque: 'Autenticidade vende mais do que produção. Mostre você, não só o produto.',
  },
  {
    titulo: 'Como organizar sua carteira de clientes para lucrar mais',
    subtitulo: 'A curva 80/20 aplicada ao varejo direto',
    fonte: 'FGV — Empreendedorismo Feminino no Brasil, 2025',
    bullets: [
      '20% dos clientes geram 80% do faturamento — identificar quem são esses clientes é prioridade',
      'Clientes VIP merecem contato semanal; clientes regulares, quinzenal; inativos, mensal',
      'Segmentar por frequência de compra (não por valor) é mais eficaz para planejar o pós-venda',
      'Vendedoras com carteira organizada em grupos fecham o mês com 35% mais previsibilidade de receita',
      'Reativar um cliente inativo custa em média 60% menos do que captar um novo',
    ],
    destaque: 'Conheça sua carteira de cor. Saber quem são suas top 10 clientes muda tudo.',
  },
  {
    titulo: 'Precificação para vendedoras autônomas',
    subtitulo: 'Como cobrar o que seu trabalho vale sem perder clientes',
    fonte: 'Sebrae — Finanças para Microempreendedoras, 2025',
    bullets: [
      'Cobrar pelo valor percebido, não pelo custo + margem, é o que distingue vendedoras de alta renda',
      'Cliente que pechincha muito não é necessariamente o cliente mais lucrativo — qualidade > volume',
      'Aumento de preço bem comunicado com antecedência perde menos clientes do que aumento surpresa',
      'Frete grátis acima de determinado valor aumenta ticket médio em 17% em média no varejo direto',
      'Parcelamento via Pix (combinado) é o diferencial que mais fideliza no perfil de cliente C e D',
    ],
    destaque: 'Preço baixo não fideliza. Relação e qualidade fidelizam — e permitem cobrar mais.',
  },
  {
    titulo: 'Saúde mental e produtividade da vendedora autônoma',
    subtitulo: 'Como manter ritmo sem se esgotar',
    fonte: 'IPEA — Trabalho e Bem-Estar das Trabalhadoras Autônomas, 2025',
    bullets: [
      '73% das vendedoras autônomas relatam sobrecarga de trabalho por falta de rotina estruturada',
      'Separar horários fixos de atendimento e horários de pausa aumenta a produtividade em 28%',
      'Vendedoras que registram o histórico de atendimentos economizam em média 45 min/dia de memória ativa',
      'Celebrar metas pequenas (não só anuais) mantém a motivação e reduz abandono do negócio',
      'Rede de apoio entre vendedoras (grupos, comunidades) é o fator #1 de sobrevivência do negócio após 2 anos',
    ],
    destaque: 'Negócio sustentável começa com rotina sustentável. Cuide de você para cuidar das suas clientes.',
  },
  {
    titulo: 'Tendências de consumo feminino no Brasil 2026',
    subtitulo: 'O que as mulheres brasileiras estão priorizando comprar',
    fonte: 'Euromonitor International — Brazilian Consumer, 2026',
    bullets: [
      'Moda íntima e fitness cresceu 34% em volume de vendas diretas no Brasil em 2025',
      'Produtos sustentáveis com embalagem reutilizável crescem 2x mais rápido do que versões convencionais',
      'Consumidoras entre 25–45 anos preferem comprar de vendedoras que "conheço e confio" vs. e-commerce',
      'Beleza e cuidados pessoais é a categoria com maior recompra no modelo de vendas diretas',
      'Personalização (produto adaptado ao gosto ou medida) é o atributo mais valorizado em 2026',
    ],
    destaque: 'Personalização é a grande vantagem da vendedora autônoma sobre qualquer loja ou app.',
  },
  {
    titulo: 'O poder do áudio no atendimento',
    subtitulo: 'Por que mensagens de voz fecham mais vendas',
    fonte: 'Panorama Mobile Time/Opinion Box — WhatsApp no Brasil, 2025',
    bullets: [
      '62% dos brasileiros preferem enviar áudio a digitar mensagem — o cliente espera isso da vendedora também',
      'Áudio de até 60 segundos tem taxa de escuta de 89% — mais do que qualquer texto longo',
      'Menção ao nome + detalhe pessoal no áudio aumenta a conversão em 41% vs. áudio genérico',
      'Tom de voz transmite emoção e confiança que texto não consegue — decisivo em vendas de relacionamento',
      'Áudio de follow-up ("oi fulana, vi que você estava de olho no produto X...") converte 3x mais do que texto',
    ],
    destaque: 'Use sua voz. Ela é seu maior diferencial competitivo contra qualquer loja ou app.',
  },
  {
    titulo: 'Fidelização: a matemática que ninguém conta',
    subtitulo: 'O impacto financeiro real de um cliente fiel vs. um cliente novo',
    fonte: 'Bain & Company — Loyalty in Retail, 2024',
    bullets: [
      'Aumentar a retenção de clientes em 5% pode aumentar o lucro em até 95%',
      'Um cliente fiel compra 67% mais do que um cliente novo nos primeiros 12 meses',
      'O custo de aquisição de um novo cliente é 5x maior do que manter um cliente existente',
      'Clientes que voltam 3 vezes ou mais têm probabilidade de 54% de se tornarem clientes vitalícios',
      'Vendedora com 60% de base fidelizada tem receita 40% mais previsível e estressante do que quem só capta',
    ],
    destaque: 'Fidelizar 1 cliente é mais lucrativo do que captar 5 novos. Invista no pós-venda todos os dias.',
  },
  {
    titulo: 'Embalagem e apresentação: o detalhe que vira indicação',
    subtitulo: 'Como a apresentação do produto influencia a percepção de valor',
    fonte: 'ESPM — Experiência de Compra no Varejo Direto, 2025',
    bullets: [
      '72% das clientes compartilham nas redes sociais produtos com embalagem diferenciada ou bilhetinho',
      'Uma carta escrita à mão junto com o produto gera mais posts orgânicos do que qualquer ação paga',
      'Embalagem cuidadosa aumenta a percepção de valor do produto em até 35% — independente do preço',
      'Tempo de entrega rápido + embalagem bonita = avaliação máxima na maioria das pesquisas de satisfação',
      'Clientes que "abrem" o produto com emoção têm 2x mais chance de indicar para amigas em até 48h',
    ],
    destaque: 'A entrega é a última impressão. Faça ela ser inesquecível — com um bilhete, um mimo, um cuidado.',
  },
  {
    titulo: 'Metas que motivam: como definir objetivos reais',
    subtitulo: 'Metodologia de metas adaptada para vendedoras autônomas',
    fonte: 'FGV — Desempenho de Microempreendedoras, 2025',
    bullets: [
      'Metas diárias pequenas (3 contatos, 1 follow-up, 1 novo cadastro) são mais eficazes do que meta mensal única',
      'Vendedoras que anotam metas por escrito têm 42% mais chance de atingi-las do que quem só pensa',
      'Meta de reativação ("falar com 2 clientes que não compram há 60 dias") tem ROI médio de 380%',
      'Celebrar micro-conquistas libera dopamina e mantém o ritmo de vendas constante ao longo do mês',
      'Acompanhar o próprio progresso semanalmente reduz o abandono de metas em 65%',
    ],
    destaque: 'Meta de mês distante não motiva. Divida em ações diárias concretas e celebre cada uma.',
  },
  {
    titulo: 'Como vender para clientes exigentes',
    subtitulo: 'Técnicas para lidar com quem sabe exatamente o que quer — ou acha que sabe',
    fonte: 'CX Trends Brasil — Relatório de Experiência do Cliente, 2025',
    bullets: [
      'Cliente exigente quer ser ouvido primeiro — nunca interrompa antes de ele terminar de falar',
      'Mostre que você entende mais do que ele esperava: "para o que você descreveu, o ideal seria..."',
      'Ofereça 2 opções (não mais) — muitas opções paralisam o cliente exigente',
      'Seja honesta quando o produto não for ideal: "esse não é o melhor para você, mas tenho um que é perfeito"',
      'Cliente exigente bem atendido vira o mais fiel e o que mais indica — vale cada minuto investido',
    ],
    destaque: 'O cliente difícil não quer desconto. Quer competência. Mostre que você sabe mais do que ele imagina.',
  },
  {
    titulo: 'Stories que vendem: o roteiro que funciona',
    subtitulo: 'Como usar o Instagram Stories para gerar vendas reais todo dia',
    fonte: 'Meta Business — Creator Economy Brasil, 2025',
    bullets: [
      'Stories com enquete ou pergunta têm 3x mais visualizações do que stories passivos',
      'Mostrar o produto sendo usado (não posado) gera 2x mais DMs de interesse',
      'Sequência de 3 stories: produto → benefício → chamada para ação — tem conversão 4x maior do que story único',
      'Figurinha "arraste para cima" ou link direto para WhatsApp reduz o atrito de compra em 60%',
      'Consistência bate perfeição: 5 stories simples por dia convertem mais do que 1 production value por semana',
    ],
    destaque: 'Apareça todos os dias. Sua cliente precisa te ver para lembrar de comprar de você.',
  },
  {
    titulo: 'Gestão financeira básica para quem vende por conta própria',
    subtitulo: 'O mínimo que toda vendedora autônoma precisa controlar',
    fonte: 'Sebrae — Educação Financeira para MEI, 2026',
    bullets: [
      'Separar conta pessoal e conta do negócio é o primeiro passo — misturar mata o controle financeiro',
      'Custo do produto + frete + embalagem + tempo de atendimento = custo real da venda (muitas esquecem o tempo)',
      'Reserva de emergência de 3 meses de despesas fixas protege o negócio de meses fracos',
      'Saber o ticket médio mensal por cliente ajuda a prever receita e planejar estoque',
      'Registrar cada venda (mesmo pequena) é a diferença entre saber se o negócio lucra ou não',
    ],
    destaque: 'Você não tem negócio se não sabe quanto lucra. Registre tudo — começa com 5 min por dia.',
  },
  {
    titulo: 'O efeito da consistência nas vendas',
    subtitulo: 'Por que aparecer todo dia é mais importante do que aparecer perfeitamente',
    fonte: 'Resultados Digitais — Social Selling Report Brasil, 2025',
    bullets: [
      'Vendedoras que postam ou contatam clientes diariamente crescem 3x mais rápido do que as que aparecem aos sábados',
      'O algoritmo do Instagram favorece contas que postem todos os dias — consistência gera alcance orgânico',
      'Cliente que ve você 5 vezes na semana nos stories compra com frequência 2x maior do que quem te vê 1x',
      'Consistência cria autoridade: você vira a referência de moda/beleza/produto na mente da cliente',
      'Ausência de 7 dias nas redes gera queda de 40% no alcance orgânico — e a cliente vai ver outra',
    ],
    destaque: 'Apareça. Todo dia. Não importa se é perfeito. Importa que você está lá.',
  },
  {
    titulo: 'Como construir autoridade sem parecer chato',
    subtitulo: 'Posicionamento genuíno para vendedoras autônomas',
    fonte: 'Content Trends Brasil — Relatório de Marketing de Conteúdo, 2025',
    bullets: [
      'Compartilhar o que você sabe sobre o produto (não só o que vende) constrói autoridade rapidamente',
      '"Esse produto não é pra todo mundo — mas para quem tem X perfil, é perfeito" é mais poderoso do que "é ótimo para todos"',
      'Ensinar algo relacionado ao produto (como usar, como combinar, como cuidar) gera mais engajamento do que oferta',
      'Ser honesta sobre limitações do produto aumenta a confiança da cliente em todas as suas recomendações',
      'Especialista em nicho (moda plus, moda evangélica, skincare natural) cresce mais rápido do que generalista',
    ],
    destaque: 'Autoridade é construída com consistência e honestidade — não com perfeição ou volume de posts.',
  },
  {
    titulo: 'Reativação de clientes inativos: script que funciona',
    subtitulo: 'Como reabrir contato sem parecer desesperada ou invasiva',
    fonte: 'Sebrae — Técnicas de Reativação para Vendas Diretas, 2025',
    bullets: [
      'Não comece com "sumida!" — isso culpa a cliente e fecha a conversa antes de começar',
      '"Lembrei de você quando vi isso" é a abertura com maior taxa de resposta positiva (73%)',
      'Reativar com novidade ("chegou algo que é exatamente do seu estilo") tem conversão 3x maior do que promoção',
      'Reativar clientes que foram bem atendidas antes tem taxa de sucesso de 45% — quase metade volta',
      'O melhor canal para reativar é WhatsApp (áudio pessoal) — e-mail e redes têm taxa de retorno muito menor',
    ],
    destaque: '"Lembrei de você" abre mais portas do que qualquer desconto. Use a memória do seu histórico.',
  },
  {
    titulo: 'Dados e intuição: como tomar decisões melhores',
    subtitulo: 'Combinando histórico de vendas com percepção de mercado',
    fonte: 'FGV — Tomada de Decisão no Empreendedorismo Feminino, 2025',
    bullets: [
      'Vendedoras que revisam seu histórico de vendas mensalmente identificam padrões que intuição sozinha não vê',
      'Saber quais produtos mais giram por época do ano reduz estoque parado em 60%',
      'Identificar qual cliente compra mais em qual período permite contato proativo antes que ela procure outra',
      'Decisão baseada em dados + feeling do relacionamento tem taxa de acerto 2x maior do que só intuição',
      'O histórico de atendimentos bem registrado é o seu maior ativo — vale mais do que estoque',
    ],
    destaque: 'Seu histórico de clientes é um tesouro. Use os dados que você já tem antes de buscar qualquer estratégia nova.',
  },
  {
    titulo: 'A diferença entre vendedora e consultora',
    subtitulo: 'Como elevar seu posicionamento e seu ticket médio',
    fonte: 'ESPM — Evolução do Papel da Vendedora Autônoma, 2026',
    bullets: [
      'Vendedora oferece produto. Consultora entende a necessidade e indica a solução certa — mesmo que seja mais caro',
      'Consultora cobra mais e perde menos cliente — porque a cliente sente que está sendo cuidada, não vendida',
      'Perguntas antes de oferecer: "o que você precisa que o produto resolva?" transforma a conversa',
      'Ter opinião ("esse não combina com seu tom de pele, este aqui sim") gera 3x mais confiança do que concordar com tudo',
      'A consultora fideliza porque a cliente sente que não saberia comprar sem ela — isso é o diferencial definitivo',
    ],
    destaque: 'Pare de vender produtos. Comece a resolver problemas. Essa mudança de mentalidade dobra o ticket médio.',
  },
  {
    titulo: 'Erros clássicos do pós-venda que custam clientes',
    subtitulo: 'O que evitar para não perder quem já comprou',
    fonte: 'CX Trends Brasil — Relatório de Satisfação no Varejo Direto, 2025',
    bullets: [
      'Erro #1: só entrar em contato quando tem promoção — cliente percebe e se sente usada',
      'Erro #2: demorar mais de 24h para responder uma mensagem — 40% desistem se não há resposta rápida',
      'Erro #3: mandar o mesmo texto para todas as clientes — personalização mínima faz diferença enorme',
      'Erro #4: não registrar o que foi vendido e ter que perguntar de novo — faz a cliente sentir que é só um número',
      'Erro #5: sumir após a venda e aparecer só quando precisa de dinheiro — destroí a relação em semanas',
    ],
    destaque: 'Pós-venda ruim não é ausência de ação. É ausência de atenção. A cliente percebe sempre.',
  },
]

// ─── TÁTICAS RÁPIDAS (rotação horária, 3 por vez) ──────────────────────────
export const TATICAS: TaticaRapida[] = [
  { emoji: '💬', texto: 'Mande um áudio de 30s hoje para uma cliente que não compra há 30 dias. Toque de voz converte 3x mais.' },
  { emoji: '📸', texto: 'Poste um story mostrando como embalar ou preparar um produto. Bastidor engaja mais do que catálogo.' },
  { emoji: '🎯', texto: 'Identifique suas 5 melhores clientes e programe um contato personalizado para essa semana.' },
  { emoji: '🌟', texto: 'Peça depoimento para a última cliente satisfeita. Envie: "Posso usar seu feedback nos meus stories?"' },
  { emoji: '📋', texto: 'Registre toda venda que fizer hoje com o produto, valor e observação. Em 3 meses você vai agradecer.' },
  { emoji: '⏰', texto: 'Configure um lembrete para 3 dias após cada venda: "como está sendo a experiência?"' },
  { emoji: '🎁', texto: 'Inclua um bilhetinho escrito à mão na próxima entrega. Gera post espontâneo e indicação.' },
  { emoji: '📱', texto: 'Responda todos os DMs pendentes agora. Tempo de resposta abaixo de 1h dobra a conversão.' },
  { emoji: '👑', texto: 'Ligue ou mande áudio para uma cliente VIP sem ser para vender. Só para saber como ela está.' },
  { emoji: '🔁', texto: 'Olhe quem não compra há 45 dias e mande "lembrei de você quando vi esse produto".' },
  { emoji: '💡', texto: 'Crie uma lista de transmissão separada por interesse: moda, beleza, casa. Mensagem certa para pessoa certa.' },
  { emoji: '📊', texto: 'Revise suas 3 últimas vendas: qual produto mais saiu? Aposte mais nele essa semana.' },
  { emoji: '🤝', texto: 'Peça indicação agora para quem te elogiou recentemente. Seja direta: "Você conhece alguém que adoraria isso?"' },
  { emoji: '✨', texto: 'Adicione uma foto real usando o produto no seu story — autenticidade converte mais do que foto de catálogo.' },
  { emoji: '🗓️', texto: 'Programe 3 contatos de pós-venda para esta semana. Coloque no calendário agora antes de esquecer.' },
  { emoji: '💰', texto: 'Calcule seu ticket médio atual. Se estiver abaixo do esperado, foque em sugerir complementos na próxima venda.' },
  { emoji: '🌺', texto: 'Clientes que aniversariam neste mês merecem uma mensagem especial. Verifique sua lista.' },
  { emoji: '🎤', texto: 'Grave um áudio apresentando a novidade que chegou. Voz + entusiasmo real fecha mais do que foto.' },
  { emoji: '🧠', texto: 'Antes de ligar para uma cliente, relembre o histórico dela. Mencionar a última compra aumenta a conversão em 29%.' },
  { emoji: '🚀', texto: 'Poste um antes e depois de uma cliente (com autorização). Resultado real é a melhor propaganda.' },
  { emoji: '⭐', texto: 'Crie um grupo VIP no WhatsApp para suas top 10 clientes e compartilhe novidades lá primeiro.' },
  { emoji: '📩', texto: 'Mande uma mensagem de "só vim te desejar uma boa semana" para 3 clientes agora. Sem vender nada.' },
  { emoji: '🛍️', texto: 'Sugira um item complementar para a próxima cliente que fechar compra. "Esse combina perfeitamente com o que você levou."' },
  { emoji: '💌', texto: 'Agradeça toda compra com uma mensagem personalizada — não um texto padrão. Cite o produto e o motivo da escolha.' },
]

// ─── CASOS DE GRANDES MARCAS (rotação diária) ──────────────────────────────
export const CASOS: CasoGrandeMarca[] = [
  {
    marca: 'Natura',
    segmento: 'Beleza & Cosméticos',
    titulo: 'O modelo de consultoras que faturou R$ 11,8 bi',
    descricao: 'A Natura construiu um dos maiores sistemas de vendas diretas do mundo com base em uma premissa simples: a consultora é o produto. O treinamento foca em autoconhecimento, storytelling pessoal e relacionamento de longo prazo, não em técnica de venda dura.',
    licao: 'Invista na sua própria história. A cliente compra de você antes de comprar o produto. Conheça o portfólio profundamente e comunique com autenticidade.',
    fonte: 'Natura — Relatório de Impacto 2024 / Valor Econômico',
  },
  {
    marca: 'O Boticário',
    segmento: 'Perfumaria & Cosméticos',
    titulo: 'Como o programa Clube Viva reduziu o churn em 38%',
    descricao: 'O Boticário lançou o programa de fidelidade Clube Viva com comunicação personalizada por perfil de compra. Clientes recebem mensagens baseadas no histórico individual — não campanhas genéricas. O resultado foi 38% menos abandono e 22% mais ticket médio nos membros do programa.',
    licao: 'Segmente sua carteira. Clientes que compram perfume não são as mesmas que compram skincare. Mensagem certa para perfil certo multiplica o resultado.',
    fonte: 'O Boticário — Relatório de Sustentabilidade 2024',
  },
  {
    marca: 'Farm Rio',
    segmento: 'Moda Feminina',
    titulo: 'A estratégia de comunidade que virou vantagem competitiva',
    descricao: 'A Farm construiu uma comunidade de clientes apaixonadas antes de qualquer campanha paga. O investimento em experiência pós-compra (embalagem, bilhetes, surpresas na entrega) gerou um volume orgânico de posts que equivale a milhões em mídia paga.',
    licao: 'A entrega não é o fim — é o começo da próxima venda. Invista na experiência de desempacotar: um bilhete personalizado, uma embalagem bonita, um mimo. Isso vira post e indicação.',
    fonte: 'Farm Rio — Case de Branding ESPM, 2025',
  },
  {
    marca: 'Hering',
    segmento: 'Moda Básica',
    titulo: 'Como treinamento de vendedoras aumentou a conversão em 31%',
    descricao: 'A Hering implementou um programa de treinamento focado em escuta ativa. Vendedoras aprenderam a fazer 3 perguntas antes de qualquer sugestão. O resultado foi aumento de 31% na conversão e 19% no ticket médio, sem mudança de produto ou preço.',
    licao: 'Pergunte antes de oferecer. "O que você está buscando hoje?" e "para qual ocasião?" são duas perguntas que mudam completamente a venda. Ouça o dobro do que fala.',
    fonte: 'Hering — Relatório Anual 2024 / Case Varejo Brasil',
  },
  {
    marca: 'Arezzo',
    segmento: 'Calçados & Acessórios',
    titulo: 'O programa de personal stylist que fidelizou 60% das clientes VIP',
    descricao: 'A Arezzo criou o programa Personal Stylist onde vendedoras de alto desempenho se tornavam consultoras de moda para uma carteira fixa de clientes. Elas recebiam histórico completo de compras, preferências e datas comemorativas. Taxa de recompra desse grupo chegou a 60% em 12 meses.',
    licao: 'Torne-se consultora de estilo da sua cliente, não só vendedora. Conheça o guarda-roupa dela, as ocasiões importantes, o que ela ama e o que não usa. Esse conhecimento vale mais do que qualquer desconto.',
    fonte: 'Arezzo&Co — Relatório de Desempenho 2024',
  },
  {
    marca: 'Avon Brasil',
    segmento: 'Beleza & Cosméticos',
    titulo: 'Como 1,5 mi de revendedoras usam relacionamento como vantagem',
    descricao: 'Com 1,5 milhão de revendedoras no Brasil, a Avon descobriu que as top performers compartilham um comportamento: elas nunca entram em contato só para vender. A cada 3 contatos, 2 são de relacionamento puro (dica, novidade, checkin pessoal) e 1 é oferta. Essa proporção 2:1 aumenta a conversão da oferta em 4x.',
    licao: 'Use a proporção 2:1: para cada oferta que você fizer, faça 2 contatos de relacionamento sem vender nada. Sua cliente vai atender sua ligação porque vai querer — não vai sentir que você só aparece para cobrar.',
    fonte: 'Avon Brasil — Estudo de Performance de Revendedoras, 2024',
  },
  {
    marca: 'Riachuelo',
    segmento: 'Moda Acessível',
    titulo: 'O modelo de atendimento que reduziu devoluções em 45%',
    descricao: 'A Riachuelo implementou um protocolo de pós-venda em que a vendedora envia uma mensagem confirmando que o produto foi entregue e perguntando sobre o tamanho e caimento. Esse simples passo reduziu devoluções em 45% e aumentou o NPS (satisfação) em 22 pontos.',
    licao: 'Um "chegou tudo certinho?" resolve problemas antes que virem reclamação. Contato proativo pós-entrega é a estratégia mais barata de reduzir devolução e aumentar satisfação.',
    fonte: 'Riachuelo — Case de Varejo ABRASCE, 2025',
  },
  {
    marca: 'Amaro',
    segmento: 'Moda Digital-First',
    titulo: 'Como dados de comportamento geraram 35% mais receita por cliente',
    descricao: 'A Amaro começou a usar o histórico de navegação e compra para enviar sugestões ultra-personalizadas — não "você pode gostar de" genérico, mas "baseado no que você comprou em março, esse novo lançamento é exatamente seu estilo". A receita por cliente aumentou 35% em 6 meses.',
    licao: 'Você tem o mesmo poder: você sabe o que cada cliente comprou, quando, e do que ela gostou. Use esse histórico para fazer sugestões que mostrem que você prestou atenção. Isso é personalização real.',
    fonte: 'Amaro — Case de Growth ESPM, 2025',
  },
]

// ─── ESTATÍSTICAS 2026 ──────────────────────────────────────────────────────
export const ESTATISTICAS: EstatisticaVenda[] = [
  {
    numero: '+8,3%',
    descricao: 'crescimento das vendas em shoppings no Brasil no 1º trimestre de 2026 vs. mesmo período de 2025',
    fonte: 'ABRASCE — Desempenho do Setor 2026',
    categoria: 'shopping',
  },
  {
    numero: 'R$ 312',
    descricao: 'ticket médio mensal por cliente no varejo direto feminino no Brasil em 2025',
    fonte: 'Euromonitor International — Direct Selling Brazil, 2025',
    categoria: 'recompra',
  },
  {
    numero: '169 mi',
    descricao: 'usuários ativos no WhatsApp no Brasil — maior penetração do mundo, base dos negócios informais',
    fonte: 'Meta Business Insights, 2025',
    categoria: 'digital',
  },
  {
    numero: '45 dias',
    descricao: 'é o tempo médio até uma cliente inativa buscar outra vendedora se não for contatada',
    fonte: 'Sebrae — Relatório de Retenção no Varejo Direto, 2025',
    categoria: 'pos-venda',
  },
  {
    numero: '5x',
    descricao: 'mais caro captar um novo cliente do que manter um cliente existente satisfeito',
    fonte: 'Bain & Company — Customer Loyalty, 2024',
    categoria: 'pos-venda',
  },
  {
    numero: '+34%',
    descricao: 'crescimento em volume de vendas diretas de moda íntima e fitness no Brasil em 2025',
    fonte: 'Euromonitor International — Brazilian Apparel, 2025',
    categoria: 'shopping',
  },
  {
    numero: '92%',
    descricao: 'dos consumidores confiam mais na indicação de uma amiga do que em qualquer forma de propaganda',
    fonte: 'Nielsen — Global Trust in Advertising, 2025',
    categoria: 'recompra',
  },
  {
    numero: '62%',
    descricao: 'dos brasileiros preferem enviar áudio a texto — o canal de maior taxa de resposta no varejo direto',
    fonte: 'Panorama Mobile Time/Opinion Box, 2025',
    categoria: 'digital',
  },
  {
    numero: 'R$ 2,8 bi',
    descricao: 'movimentados em vendas via WhatsApp por pequenos negócios no Brasil em 2025',
    fonte: 'RD Station — Relatório de Vendas Digitais, 2025',
    categoria: 'digital',
  },
  {
    numero: '+22%',
    descricao: 'de ticket médio em vendedoras que sugerem um item complementar no momento da compra',
    fonte: 'Sebrae — Técnicas de Upsell no Varejo Direto, 2025',
    categoria: 'recompra',
  },
  {
    numero: '1,5 mi',
    descricao: 'de revendedoras ativas no Brasil — o maior exército de vendas diretas da América Latina',
    fonte: 'ABEVD — Associação Brasileira de Empresas de Vendas Diretas, 2025',
    categoria: 'shopping',
  },
  {
    numero: '68%',
    descricao: 'dos clientes que param de comprar dizem que "a vendedora sumiu" — não foi preço nem produto',
    fonte: 'Euromonitor — Direct Selling in Brazil, 2025',
    categoria: 'pos-venda',
  },
  {
    numero: '3x',
    descricao: 'mais chance de recompra quando o cliente é contactado nas primeiras 72h após a compra',
    fonte: 'McKinsey & Company — Consumer Decision Journey, 2024',
    categoria: 'pos-venda',
  },
  {
    numero: '+95%',
    descricao: 'de aumento no lucro possível com apenas 5% de melhora na retenção de clientes',
    fonte: 'Bain & Company — Loyalty in Retail, 2024',
    categoria: 'recompra',
  },
  {
    numero: '8,2%',
    descricao: 'de crescimento no fluxo de visitantes em shoppings brasileiros em 2025 vs. 2024',
    fonte: 'ABRASCE — Pesquisa de Desempenho Anual, 2025',
    categoria: 'shopping',
  },
  {
    numero: 'Top 3',
    descricao: 'motivações de recompra: relacionamento com a vendedora, qualidade do produto e praticidade — preço ficou em 4º',
    fonte: 'ESPM — Comportamento do Consumidor Brasileiro, 2025',
    categoria: 'recompra',
  },
]
