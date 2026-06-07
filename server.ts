// TáNaMão Brasil - Servidor Backend Express + Vite + Mercado Pago Checkout Pro
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { getSupabaseAdmin } from './src/db/supabaseClient.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// CONFIGURAÇÃO MERCADO PAGO
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
let mpClient: MercadoPagoConfig | null = null;

if (MP_ACCESS_TOKEN) {
  try {
    mpClient = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    console.log('✅ Mercado Pago SDK inicializado com êxito.');
  } catch (err) {
    console.error('❌ Erro ao inicializar Mercado Pago Config:', err);
  }
} else {
  console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN ausente. O sistema operará com simulação automática de checkout.');
}

// ============================================================================
// 1. ENDPOINT: CRIAR PREFERÊNCIA DE PAGAMENTO (CHECKOUT PRO)
// ============================================================================
app.post('/api/payment/create-preference', async (req, res) => {
  try {
    const { planId, professionalId, email, fullName } = req.body;

    if (!planId || !professionalId) {
      res.status(400).json({ error: 'Parâmetros planId e professionalId são obrigatórios.' });
      return;
    }

    // Tabela estática de preços (Destaque: 19.90, Premium: 39.90)
    let unitPrice = 0;
    let title = '';

    if (planId === 'plan-featured') {
      unitPrice = 19.90;
      title = 'Plano Destaque - TáNaMão Brasil';
    } else if (planId === 'plan-premium') {
      unitPrice = 39.90;
      title = 'Plano Premium TáNaMão - TáNaMão Brasil';
    } else {
      res.status(400).json({ error: 'Plano inválido para monetização.' });
      return;
    }

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    // Parâmetros de retorno com codificação amigável para rotas dinâmicas do React
    const successUrl = `${appUrl}/#${encodeURIComponent(JSON.stringify({ view: 'dashboard', params: { tab: 'billing', paymentStatus: 'success', planId } }))}`;
    const failureUrl = `${appUrl}/#${encodeURIComponent(JSON.stringify({ view: 'dashboard', params: { tab: 'billing', paymentStatus: 'failure', planId } }))}`;
    const pendingUrl = `${appUrl}/#${encodeURIComponent(JSON.stringify({ view: 'dashboard', params: { tab: 'billing', paymentStatus: 'pending', planId } }))}`;

    // Caso o Mercado Pago esteja configurado de forma real
    if (mpClient) {
      const preference = new Preference(mpClient);
      const body = {
        items: [
          {
            id: planId,
            title: title,
            quantity: 1,
            unit_price: unitPrice,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: email || 'usuario@tanamao.com.br',
          name: fullName || 'Trabalhador Autônomo',
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: 'approved' as const,
        external_reference: `${professionalId}:::${planId}`,
        notification_url: `${appUrl}/api/payment/webhook`,
      };

      const result = await preference.create({ body });
      res.json({
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
        isSimulated: false,
      });
    } else {
      // Retorno do Simulador de Transações (Para a visualização imediata)
      const simulatedPrefId = `pref_sim_${Math.random().toString(36).substring(2, 10)}`;
      // Redireciona o fluxo para o webhook simulado e volta para o Painel automaticamente
      const simulatedInitPoint = `${appUrl}/api/payment/simulated-checkout?prefId=${simulatedPrefId}&proId=${professionalId}&planId=${planId}`;
      
      res.json({
        preferenceId: simulatedPrefId,
        initPoint: simulatedInitPoint,
        sandboxInitPoint: simulatedInitPoint,
        isSimulated: true,
      });
    }
  } catch (error: any) {
    console.error('Erro ao gerar preferência do Mercado Pago:', error);
    res.status(500).json({ error: 'Erro interno ao criar preferência de pagamento.', details: error.message });
  }
});

// ============================================================================
// 2. SIMulador de CHECKOUT (Para ambiente de visualização ágil)
// ============================================================================
app.get('/api/payment/simulated-checkout', async (req, res) => {
  const { prefId, proId, planId } = req.query as { prefId: string; proId: string; planId: string };
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  console.log(`🔨 [Simulador] Executando checkout simulado para pref ${prefId}...`);

  // Dispara a aprovação automática no servidor para atualizar a assinatura do Supabase
  await activateUserSubscription(proId, planId, `sim-pay-${prefId}`);

  // Redireciona o usuário de volta para o dashboard
  const returnUrl = `${appUrl}/#${encodeURIComponent(JSON.stringify({ view: 'dashboard', params: { tab: 'billing', paymentStatus: 'success', planId, simulated: true } }))}`;
  res.redirect(returnUrl);
});

// ============================================================================
// 3. ENDPOINT: WEBHOOK OFICIAL MERCADO PAGO
// ============================================================================
app.post('/api/payment/webhook', async (req, res) => {
  console.log('📬 Webhook do Mercado Pago recebido:', JSON.stringify(req.body));
  
  res.status(200).send('OK'); // Responde imediatamente com sucesso para Mercado Pago evitar reenvio

  try {
    let paymentId: string | null = null;

    if (req.body.type === 'payment' && req.body.data && req.body.data.id) {
      paymentId = req.body.data.id;
    } else if (req.body.topic === 'payment' && req.body.resource) {
      const parts = req.body.resource.split('/');
      paymentId = parts[parts.length - 1];
    } else if (req.body.action === 'payment.created' || req.body.action === 'payment.updated') {
      if (req.body.data && req.body.data.id) {
        paymentId = req.body.data.id;
      }
    }

    if (!paymentId) {
      console.warn('⚠️ Webhook processado sem ID de pagamento.');
      return;
    }

    if (mpClient) {
      const paymentHandler = new Payment(mpClient);
      const mpPayment = await paymentHandler.get({ id: paymentId });

      console.log(`🔍 [Mercado Pago] Detalhes do pagamento ${paymentId}: Status = ${mpPayment.status}`);

      if (mpPayment.status === 'approved') {
        const externalReference = mpPayment.external_reference; // "professionalId:::planId"
        if (externalReference && externalReference.includes(':::')) {
          const [professionalId, planId] = externalReference.split(':::');
          console.log(`🚀 [Ativação Webhook] Ativando assinatura de ${professionalId} para o plano ${planId}`);
          await activateUserSubscription(professionalId, planId, `mp-real-${paymentId}`);
        } else {
          console.error('❌ external_reference inválido na transação aprovada:', externalReference);
        }
      }
    }
  } catch (webhookError) {
    console.error('❌ Erro ao decodificar webhook do Mercado Pago:', webhookError);
  }
});

// ============================================================================
// 4. FUNÇÃO CORE DE ATIVAÇÃO DE ASSINATURA (Sincronizada com Supabase)
// ============================================================================
async function activateUserSubscription(professionalId: string, planId: string, transactionId: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(); // +30 dias de ciclo faturado
  const now = new Date().toISOString();

  console.log(`⚡ [Subscription Engine] Ativando plano ${planId} para profissional ${professionalId}. Expira em: ${expiresAt}`);

  // 1. Tenta atualizar ou inserir em banco Supabase se configurado
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      // Descobre o UUID correto do plano na tabela `plans` pelo slug/id correspondente
      const { data: planData } = await supabase
        .from('plans')
        .select('id')
        .eq('name', planId === 'plan-premium' ? 'Premium' : 'Destaque')
        .maybeSingle();

      const dbPlanId = planData?.id || planId; // Use uuid ou o identificador string como fallback

      // Grava histórico de assinatura ativa
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          professional_id: professionalId,
          plan_id: dbPlanId,
          status: 'active',
          external_id: transactionId,
          expires_at: expiresAt,
          updated_at: now
        }, { onConflict: 'professional_id' });

      if (subError) {
        console.error('Erro ao atualizar tabela subscriptions no Supabase:', subError);
      } else {
        console.log('✅ Assinatura gravada com sucesso na tabela public.subscriptions!');
      }

      // Atualiza o nível (plan_level) do profissional
      const planLevel = planId === 'plan-premium' ? 'premium' : 'featured';
      
      const { error: proError } = await supabase
        .from('professionals')
        .update({ plan_type: planLevel, updated_at: now })
        .eq('id', professionalId);

      if (proError) {
        console.error('Erro ao atualizar plan_type na tabela professionals:', proError);
      } else {
        console.log('✅ Nível do profissional atualizado com sucesso no Supabase!');
      }
    } catch (dbError) {
      console.error('Log de erro na infraestrutura do banco Supabase:', dbError);
    }
  }

  // Guardamos também um histórico em cache no servidor para sincronizar com o LocalStorage do frontend nas rotas de status
  const serverSubsKey = 'sub_' + professionalId;
  const subscriptionObj = {
    id: 'sub-' + professionalId + '-' + Math.random().toString(36).substring(2, 6),
    professional_id: professionalId,
    plan_id: planId,
    status: 'active',
    external_id: transactionId,
    expires_at: expiresAt,
    created_at: now,
    updated_at: now
  };
  serverActiveSubscriptions.set(serverSubsKey, subscriptionObj);
}

// Map simples no servidor para manter em memória as assinaturas simuladas/reais e permitir sincronismo do cliente
const serverActiveSubscriptions = new Map<string, any>();

// Preenche dados padrão das assinaturas para Roberto e Carlos que já estão no seed
serverActiveSubscriptions.set('sub-prof-roberto', {
  id: 'sub-roberto',
  professional_id: 'prof-roberto',
  plan_id: 'plan-premium',
  status: 'active',
  external_id: 'mp-990881',
  expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
serverActiveSubscriptions.set('sub-prof-carlos', {
  id: 'sub-carlos',
  professional_id: 'prof-carlos',
  plan_id: 'plan-featured',
  status: 'active',
  external_id: 'mp-771239',
  expires_at: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// ============================================================================
// 5. STATUS DA ASSINATURA (Sincronismo Client-Server)
// ============================================================================
app.get('/api/payment/status', async (req, res) => {
  const { professionalId } = req.query;

  if (!professionalId) {
    res.status(400).json({ error: 'Parâmetro professionalId é obrigatório.' });
    return;
  }

  // Tenta fetch direto do Supabase
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: subData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('status', 'active')
        .maybeSingle();

      if (subData) {
        res.json({ subscription: subData });
        return;
      }
    } catch (err) {
      console.error('Falha de leitura de status no banco de dados:', err);
    }
  }

  // Se não houver banco configurado ou não encontrar, busca do cache sincronizado do servidor
  const cacheKey = 'sub_' + professionalId;
  const subInCache = serverActiveSubscriptions.get(cacheKey);

  if (subInCache) {
    res.json({ subscription: subInCache });
  } else {
    res.json({ subscription: null });
  }
});

// ============================================================================
// 6. CANCELAMENTO DE ASSINATURA AUTOMÁTICA
// ============================================================================
app.post('/api/payment/cancel', async (req, res) => {
  try {
    const { professionalId } = req.body;

    if (!professionalId) {
      res.status(400).json({ error: 'Parâmetro professionalId é obrigatório.' });
      return;
    }

    console.log(`❌ [Subscription Engine] Cancelando assinatura do profissional ${professionalId}`);

    // Remove do cache do servidor
    const cacheKey = 'sub_' + professionalId;
    serverActiveSubscriptions.delete(cacheKey);

    // Atualiza BD Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('subscriptions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('professional_id', professionalId);

      await supabase
        .from('professionals')
        .update({ plan_type: 'free', updated_at: new Date().toISOString() })
        .eq('id', professionalId);
    }

    res.json({ success: true, message: 'Assinatura cancelada com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha durante cancelamento da assinatura.', details: error.message });
  }
});

// ============================================================================
// 7. RENOVAÇÃO MANUAL DA ASSINATURA
// ============================================================================
app.post('/api/payment/renew', async (req, res) => {
  try {
    const { professionalId, planId } = req.body;

    if (!professionalId || !planId) {
      res.status(400).json({ error: 'professionalId e planId são obrigatórios.' });
      return;
    }

    console.log(`🔄 [Subscription Engine] Renovando assinatura para profissional ${professionalId} no plano ${planId}`);

    // Renova por mais 30 dias
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const now = new Date().toISOString();

    const cacheKey = 'sub_' + professionalId;
    const currentSub = serverActiveSubscriptions.get(cacheKey) || {
      id: 'sub-' + professionalId + '-' + Math.random().toString(36).substring(2, 6),
      professional_id: professionalId,
      plan_id: planId,
      created_at: now
    };

    const updatedSub = {
      ...currentSub,
      status: 'active',
      expires_at: newExpiresAt,
      updated_at: now
    };

    serverActiveSubscriptions.set(cacheKey, updatedSub);

    // Banco Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('subscriptions')
        .update({ status: 'active', expires_at: newExpiresAt, updated_at: now })
        .eq('professional_id', professionalId);
        
      const planLevel = planId === 'plan-premium' ? 'premium' : 'featured';
      await supabase
        .from('professionals')
        .update({ plan_type: planLevel, updated_at: now })
        .eq('id', professionalId);
    }

    res.json({ success: true, subscription: updatedSub });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao renovar assinatura.', details: error.message });
  }
});

// ============================================================================
// 9. DYNAMIC SITEMAP & SEO
// ============================================================================
app.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  
  const appUrl = process.env.APP_URL || 'https://tanamao.com.br';
  const now = new Date().toISOString().split('T')[0];

  // In a real app we'd fetch these from DB
  const categories = ['eletricista', 'encanador', 'pintor', 'diarista', 'montador'];
  const cities = ['sorocaba', 'sao-paulo', 'campinas', 'curitiba', 'belo-horizonte'];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <lastmod>${now}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/planos</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/sobre</loc>
    <lastmod>${now}</lastmod>
    <priority>0.5</priority>
  </url>`;

  // Dynamic SEO pages (Category + City)
  categories.forEach(cat => {
    cities.forEach(city => {
      sitemap += `
  <url>
    <loc>${appUrl}/${cat}-${city}-sp</loc>
    <lastmod>${now}</lastmod>
    <priority>0.7</priority>
  </url>`;
    });
  });

  sitemap += '\n</urlset>';
  res.send(sitemap);
});

// ============================================================================
// 10. MIDDLEWARE VITE E CONFIGURAÇÃO DA PORTA
// ============================================================================
async function startServer() {
  if (process.env.DISABLE_HMR) {
    console.log('⚙️ HMR desativado de acordo com as especificações do ambiente.');
  }

  // Rotas de API devem ser colocadas ANTES do middleware estático
  // (Tratado acima)

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor full-stack rodando localmente em http://localhost:${PORT}`);
  });
}

startServer();
