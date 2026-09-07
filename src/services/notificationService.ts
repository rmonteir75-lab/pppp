import { ServiceRequest, ProfessionalProfile } from '../types';

export interface NotificationLogItem {
  id: string;
  type: 
    | 'solicitacao_orcamento' 
    | 'resposta_orcamento' 
    | 'aprovacao_cliente' 
    | 'mudanca_status' 
    | 'novo_profissional' 
    | 'avaliacao_recebida';
  title: string;
  description: string;
  adminEmail: string;
  adminWhatsApp: string;
  adminWhatsAppBackup?: string;
  clientWhatsApp?: string;
  professionalWhatsApp?: string;
  whatsappUrlAdmin: string;
  whatsappUrlAdminBackup?: string;
  whatsappUrlClient?: string;
  whatsappUrlProfessional?: string;
  mailtoUrlAdmin: string;
  messageContentAdmin?: string;
  messageContentClient?: string;
  messageContentProfessional?: string;
  timestamp: string;
  status: 'disparado' | 'registrado';
  requestId?: string;
}

export const ADMIN_EMAIL = 'suportesmservicos@gmail.com';
export const ADMIN_EMAIL_SECONDARY = 'rmonteir75@gmail.com';
export const ADMIN_EMAILS_ALL = 'suportesmservicos@gmail.com, rmonteir75@gmail.com';
export const ADMIN_WHATSAPP = '5512991601322'; // (12) 99160-1322 WhatsApp Oficial
export const ADMIN_WHATSAPP_FORMATTED = '(12) 99160-1322';
export const ADMIN_WHATSAPP_BACKUP = '5512992555104'; // (12) 99255-5104 WhatsApp Backup
export const ADMIN_WHATSAPP_BACKUP_FORMATTED = '(12) 99255-5104';
export const ADMIN_WHATSAPP_SECONDARY = '5512992555104'; // compatibilidade

export function buildAdminMailto(subject: string, body: string): string {
  return `mailto:${ADMIN_EMAIL}?cc=${ADMIN_EMAIL_SECONDARY}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Normaliza e gera URL correta para o WhatsApp, evitando duplicação do DDI 55
 * e tratando adequadamente números brasileiros de 10 ou 11 dígitos (inclusive DDD 55).
 */
export function formatWhatsAppUrl(phone: string, message?: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (!clean) return '';

  let fullNumber = clean;
  // Se tem 12 ou 13 dígitos e começa com 55 (ex: 5512991601322), já possui DDI do Brasil
  if ((clean.length === 12 || clean.length === 13) && clean.startsWith('55')) {
    fullNumber = clean;
  } else if (clean.length > 11 && clean.startsWith('55')) {
    fullNumber = clean;
  } else {
    // 10 ou 11 dígitos (DDD + 8 ou 9 dígitos) -> adiciona DDI 55
    fullNumber = `55${clean}`;
  }

  const base = `https://wa.me/${fullNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

class NotificationService {
  private storageKey = 'smexpress_notifications_log';

  public getNotificationHistory(): NotificationLogItem[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed: NotificationLogItem[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // Filtra estritamente apenas notificações reais em produção
      return parsed.filter(item => 
        item &&
        item.id &&
        !item.id.startsWith('SIM-') && 
        !(item.requestId && item.requestId.startsWith('SIM-')) &&
        !item.title?.toLowerCase().includes('simula') &&
        !item.description?.toLowerCase().includes('(teste)')
      );
    } catch {
      return [];
    }
  }

  private async dispatchWebhook(item: NotificationLogItem) {
    try {
      const webhookUrl = localStorage.getItem('smexpress_webhook_url');
      if (webhookUrl && webhookUrl.trim().startsWith('http')) {
        await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: item.type,
            id: item.id,
            requestId: item.requestId,
            title: item.title,
            description: item.description,
            timestamp: item.timestamp,
            adminEmail: item.adminEmail,
            adminWhatsApp: item.adminWhatsApp,
            clientWhatsApp: item.clientWhatsApp,
            messageAdmin: item.messageContentAdmin,
            messageClient: item.messageContentClient
          })
        });
      }
    } catch {
      // Silent webhook dispatch fallback
    }
  }

  private saveLog(item: NotificationLogItem) {
    try {
      const history = this.getNotificationHistory();
      const updated = [item, ...history].slice(0, 100); // keep last 100
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      this.dispatchWebhook(item);
    } catch {
      // Fallback
    }
  }

  public clearHistory() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Fallback
    }
  }

  private cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  public openWhatsApp(url: string) {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  }

  public openEmail(mailtoUrl: string) {
    if (!mailtoUrl) return;
    try {
      window.location.href = mailtoUrl;
    } catch {
      // Silent mail client fallback
    }
  }

  public sendTestWhatsApp(target: 'official' | 'backup' = 'official') {
    const phone = target === 'official' ? ADMIN_WHATSAPP : ADMIN_WHATSAPP_BACKUP;
    const phoneFormatted = target === 'official' ? ADMIN_WHATSAPP_FORMATTED : ADMIN_WHATSAPP_BACKUP_FORMATTED;
    const msg = 
`✅ *VALIDAÇÃO DE NOTIFICAÇÃO - SM EXPRESS*
Olá Administrador!
Canal verificado com sucesso no WhatsApp ${phoneFormatted}.
O sistema de emissão de orçamentos e pedidos em modo produção está ativo e pronto para receber clientes.
Data/Hora: ${new Date().toLocaleString('pt-BR')}`;
    const url = formatWhatsAppUrl(phone, msg);
    this.openWhatsApp(url);
  }

  public sendTestEmail() {
    const subject = `[SM Express] Teste de Notificação dos Canais Administrativos`;
    const body = 
`TESTE DE VALIDAÇÃO DE E-MAIL - SM EXPRESS

Olá Administrador,

Este é um disparo de teste para validar o recebimento de notificações no e-mail:
- Destinatário Principal: ${ADMIN_EMAIL}
- Cópia / Notificação: ${ADMIN_EMAIL_SECONDARY}

Todas as movimentações reais no aplicativo (novas solicitações, propostas enviadas, aceites de serviços e comissões) geram mensagens direcionadas para estes canais.

Data/Hora: ${new Date().toLocaleString('pt-BR')}`;
    const mailto = buildAdminMailto(subject, body);
    this.openEmail(mailto);
  }

  /**
   * 1. NOTIFICAÇÃO: NOVA SOLICITAÇÃO DE ORÇAMENTO
   * Enviado ao WhatsApp e E-mail do Administrador Cadastrado (suportesmservicos@gmail.com)
   * e também WhatsApp de confirmação ao Cliente.
   */
  public notifyNewRequest(req: ServiceRequest): NotificationLogItem {
    const formattedAddress = [req.street, req.number, req.neighborhood, req.city, req.state].filter(Boolean).join(', ');

    // 1. Mensagem para o WhatsApp do Administrador
    const adminMessage = 
`🚨 *NOVA SOLICITAÇÃO DE ORÇAMENTO - SM EXPRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Código do Pedido:* ${req.id}
🏷️ *Serviço Solicitado:* ${req.serviceTitle}
👤 *Cliente:* ${req.clientName}
📱 *WhatsApp do Cliente:* ${req.clientPhone}
📧 *E-mail do Cliente:* ${req.clientEmail || 'Não informado'}
📍 *Endereço do Local:* ${formattedAddress || 'Não informado'}
📅 *Data Desejada:* ${req.desiredDate || 'A combinar'}
📝 *Descrição do Pedido:*
"${req.details?.['Descrição do Pedido'] || 'Sem observações adicionais'}"
${req.photos && req.photos.length > 0 ? `📷 *Fotos Anexadas:* ${req.photos.length} foto(s)` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Acesse o painel administrativo da SM Express para definir o orçamento e enviar ao cliente!`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    // 2. Mensagem WhatsApp de confirmação para o Cliente
    const clientMessage = 
`👋 Olá *${req.clientName}*!
Recebemos com sucesso sua solicitação de orçamento na *SM Express*!

📋 *Pedido:* ${req.id}
🏷️ *Serviço:* ${req.serviceTitle}
📍 *Local:* ${formattedAddress || req.city || 'Taubaté - SP'}

Nossa equipe administrativa e nossos profissionais credenciados já estão analisando os detalhes para enviar o melhor orçamento aqui no seu WhatsApp.

Muito obrigado por escolher a SM Express!`;

    const clientWhatsAppUrl = req.clientPhone ? formatWhatsAppUrl(req.clientPhone, clientMessage) : undefined;

    // 3. Link de E-mail para o Administrador (suportesmservicos@gmail.com)
    const emailSubject = `[SM Express] Nova Solicitação de Orçamento: #${req.id} - ${req.serviceTitle} (${req.clientName})`;
    const emailBody = 
`NOVA SOLICITAÇÃO DE ORÇAMENTO RECEBIDA NO APP SM EXPRESS

Código do Pedido: ${req.id}
Serviço Solicitado: ${req.serviceTitle}
Data da Solicitação: ${new Date(req.createdAt).toLocaleString('pt-BR')}

DADOS DO CLIENTE:
Nome: ${req.clientName}
WhatsApp: ${req.clientPhone}
E-mail: ${req.clientEmail || 'Não informado'}
Endereço: ${formattedAddress}

DETALHES DO PEDIDO:
Data Desejada: ${req.desiredDate}
Descrição:
${req.details?.['Descrição do Pedido'] || 'Não detalhado'}

${req.photos?.length ? `Fotos anexadas pelo cliente: ${req.photos.length} foto(s)` : ''}

Acesse o Painel Administrativo SM Express para enviar a proposta:
https://wa.me/${ADMIN_WHATSAPP}`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'solicitacao_orcamento',
      title: `Nova Solicitação: #${req.id} (${req.serviceTitle})`,
      description: `Cliente ${req.clientName} solicitou orçamento. Notificações preparadas para WhatsApp Oficial (${ADMIN_WHATSAPP_FORMATTED}) e e-mail (${ADMIN_EMAIL}).`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      clientWhatsApp: req.clientPhone,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      whatsappUrlClient: clientWhatsAppUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      messageContentClient: clientMessage,
      timestamp: new Date().toISOString(),
      status: 'disparado',
      requestId: req.id
    };

    this.saveLog(logItem);
    return logItem;
  }

  /**
   * 2. NOTIFICAÇÃO: RESPOSTA DA SOLICITAÇÃO (ORÇAMENTO ENVIADO)
   */
  public notifyQuoteSent(
    req: ServiceRequest,
    price: number,
    hours: string,
    profName: string,
    notes: string,
    scheduledDate?: string
  ): NotificationLogItem {
    // 1. Mensagem de WhatsApp para o Cliente com a proposta
    const clientMessage = 
`💰 *ORÇAMENTO PRONTO - SM EXPRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Olá *${req.clientName}*! Seu orçamento para o pedido *${req.id}* (*${req.serviceTitle}*) foi elaborado com sucesso:

💵 *Valor Total:* R$ ${price.toFixed(2).replace('.', ',')}
⏱️ *Tempo Estimado:* ${hours}
👷 *Profissional Responsável:* ${profName}
📅 *Data Prevista:* ${scheduledDate || req.desiredDate || 'A combinar'}
${notes ? `📝 *Observações:* ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Para aprovar e garantir o agendamento, responda a esta mensagem ou aprove diretamente pelo aplicativo da SM Express!`;

    const clientWhatsAppUrl = req.clientPhone ? formatWhatsAppUrl(req.clientPhone, clientMessage) : undefined;

    // 2. Mensagem de WhatsApp para o Administrador
    const adminMessage = 
`📤 *ORÇAMENTO ENVIADO AO CLIENTE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Pedido: *${req.id}* (${req.serviceTitle})
Cliente: *${req.clientName}* (${req.clientPhone})
Valor: *R$ ${price.toFixed(2).replace('.', ',')}*
Prestador: *${profName}*
Data Agendada: ${scheduledDate || req.desiredDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Aguardando aprovação do cliente.`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    // 3. E-mail para o Administrador (suportesmservicos@gmail.com)
    const emailSubject = `[SM Express] Orçamento Enviado ao Cliente: #${req.id} - R$ ${price.toFixed(2)}`;
    const emailBody = 
`ORÇAMENTO ENVIADO COM SUCESSO

Pedido: #${req.id}
Serviço: ${req.serviceTitle}
Cliente: ${req.clientName} (${req.clientPhone})
Valor: R$ ${price.toFixed(2)}
Prazo: ${hours}
Profissional Credenciado: ${profName}
Data Agendada: ${scheduledDate || req.desiredDate}
Observações: ${notes || 'Nenhuma'}

Notificação via WhatsApp enviada ao cliente.`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'resposta_orcamento',
      title: `Orçamento Enviado: #${req.id} (R$ ${price.toFixed(2)})`,
      description: `Orçamento de R$ ${price.toFixed(2)} enviado para ${req.clientName}. Notificações prontas para WhatsApp (${ADMIN_WHATSAPP_FORMATTED}) e e-mail (${ADMIN_EMAIL}).`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      clientWhatsApp: req.clientPhone,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      whatsappUrlClient: clientWhatsAppUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      messageContentClient: clientMessage,
      timestamp: new Date().toISOString(),
      status: 'disparado',
      requestId: req.id
    };

    this.saveLog(logItem);
    return logItem;
  }

  /**
   * 3. NOTIFICAÇÃO: APROVAÇÃO DO ORÇAMENTO PELO CLIENTE
   */
  public notifyQuoteApproved(req: ServiceRequest, profPhone?: string): NotificationLogItem {
    const commissionVal = (req.quotedPrice || 0) * 0.30;

    // 1. Mensagem para o Administrador
    const adminMessage = 
`🎉 *ORÇAMENTO APROVADO PELO CLIENTE!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Pedido:* ${req.id}
🏷️ *Serviço:* ${req.serviceTitle}
👤 *Cliente:* ${req.clientName} (${req.clientPhone})
📍 *Endereço:* ${req.street}, ${req.number} - ${req.neighborhood}
💵 *Valor Aprovado:* R$ ${(req.quotedPrice || 0).toFixed(2).replace('.', ',')}
👷 *Prestador Designado:* ${req.assignedProfessional || 'A definir'}
💼 *Comissão SM Express (30%):* R$ ${commissionVal.toFixed(2).replace('.', ',')}
📅 *Agendamento:* ${req.scheduledDate || req.desiredDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Cobrança de comissão e ordem de serviço geradas com sucesso.`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    // 2. Mensagem para o Prestador (se houver telefone)
    const profMessage = 
`🚀 *SERVIÇO APROVADO - SM EXPRESS*
Olá *${req.assignedProfessional}*!
O cliente *${req.clientName}* aprovou o orçamento do pedido *${req.id}* (${req.serviceTitle}).
Valor: R$ ${(req.quotedPrice || 0).toFixed(2).replace('.', ',')}
Local: ${req.street}, ${req.number} - ${req.neighborhood}, ${req.city}
Contato do Cliente: ${req.clientPhone}
Data: ${req.scheduledDate || req.desiredDate}

Favor entrar em contato com o cliente para confirmação final.`;

    const profWhatsAppUrl = profPhone ? formatWhatsAppUrl(profPhone, profMessage) : undefined;

    // 3. E-mail para o Administrador (suportesmservicos@gmail.com)
    const emailSubject = `[SM Express] ★ ORÇAMENTO APROVADO: #${req.id} - ${req.clientName} (R$ ${(req.quotedPrice || 0).toFixed(2)})`;
    const emailBody = 
`ORÇAMENTO APROVADO PELO CLIENTE!

Código do Pedido: #${req.id}
Serviço: ${req.serviceTitle}
Cliente: ${req.clientName}
Telefone: ${req.clientPhone}
Endereço: ${req.street}, ${req.number} - ${req.neighborhood}, ${req.city} - ${req.state}

VALORES & AGENDAMENTO:
Valor Total do Serviço: R$ ${(req.quotedPrice || 0).toFixed(2)}
Comissão da Plataforma (30%): R$ ${commissionVal.toFixed(2)}
Prestador Designado: ${req.assignedProfessional}
Data Agendada: ${req.scheduledDate || req.desiredDate}

Cobrança de comissão (30%) lançada com vencimento em 3 dias úteis.`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'aprovacao_cliente',
      title: `Aprovação de Orçamento: #${req.id}`,
      description: `Cliente ${req.clientName} aprovou orçamento de R$ ${(req.quotedPrice || 0).toFixed(2)}. Notificações prontas para WhatsApp Oficial (${ADMIN_WHATSAPP_FORMATTED}) e e-mail (${ADMIN_EMAIL}).`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      clientWhatsApp: req.clientPhone,
      professionalWhatsApp: profPhone,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      whatsappUrlClient: req.clientPhone ? formatWhatsAppUrl(req.clientPhone, `Olá ${req.clientName}! Recebemos a aprovação do seu orçamento para o pedido #${req.id} (${req.serviceTitle}). O profissional ${req.assignedProfessional || 'credenciado'} foi notificado!`) : undefined,
      whatsappUrlProfessional: profWhatsAppUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      messageContentProfessional: profMessage,
      timestamp: new Date().toISOString(),
      status: 'disparado',
      requestId: req.id
    };

    this.saveLog(logItem);
    return logItem;
  }

  /**
   * 4. NOTIFICAÇÃO: MOVIMENTAÇÃO DE STATUS (EM EXECUÇÃO, CONCLUÍDO, CANCELADO)
   */
  public notifyStatusChanged(req: ServiceRequest, newStatus: string): NotificationLogItem {
    const statusLabels: Record<string, string> = {
      'em_execucao': 'Em Execução',
      'concluido': 'Concluído',
      'avaliado': 'Avaliado pelo Cliente',
      'cancelado': 'Cancelado',
      'aprovado': 'Aprovado & Agendado',
      'orcamento_recebido': 'Orçamento Enviado',
      'pendente_orcamento': 'Pendente de Orçamento'
    };
    const statusLabel = statusLabels[newStatus] || newStatus;

    // WhatsApp para o Administrador
    const adminMessage = 
`🔄 *ATUALIZAÇÃO DE STATUS NO APP - SM EXPRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Pedido: *${req.id}* (${req.serviceTitle})
Cliente: *${req.clientName}* (${req.clientPhone})
Novo Status: *${statusLabel.toUpperCase()}*
Prestador: ${req.assignedProfessional || 'Não atribuído'}
Data: ${new Date().toLocaleString('pt-BR')}
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    // Mensagem de WhatsApp para o Cliente sobre o novo status
    let clientStatusMsg = '';
    if (newStatus === 'em_execucao') {
      clientStatusMsg = 
`🔨 *SERVIÇO EM EXECUÇÃO - SM EXPRESS*
Olá *${req.clientName}*! Seu pedido *${req.id}* (*${req.serviceTitle}*) com o profissional *${req.assignedProfessional || 'credenciado'}* está em execução. Qualquer dúvida, conte com a SM Express no WhatsApp ${ADMIN_WHATSAPP_FORMATTED}.`;
    } else if (newStatus === 'concluido') {
      clientStatusMsg = 
`✅ *SERVIÇO CONCLUÍDO - SM EXPRESS*
Olá *${req.clientName}*! Seu pedido *${req.id}* (*${req.serviceTitle}*) foi concluído pelo profissional *${req.assignedProfessional || 'credenciado'}*.
Por favor, acesse o aplicativo SM Express para conferir os detalhes e avaliar o atendimento recebido. Muito obrigado!`;
    } else if (newStatus === 'cancelado') {
      clientStatusMsg = 
`⚠️ *ATUALIZAÇÃO DO PEDIDO - SM EXPRESS*
Olá *${req.clientName}*! O pedido *${req.id}* (*${req.serviceTitle}*) teve o status alterado para cancelado. Para dúvidas ou reativação, contate o suporte no WhatsApp ${ADMIN_WHATSAPP_FORMATTED}.`;
    } else {
      clientStatusMsg = 
`📢 *ATUALIZAÇÃO DE PEDIDO - SM EXPRESS*
Olá *${req.clientName}*! O status do seu pedido *${req.id}* (*${req.serviceTitle}*) foi atualizado para: *${statusLabel}*.`;
    }

    const clientWhatsAppUrl = req.clientPhone ? formatWhatsAppUrl(req.clientPhone, clientStatusMsg) : undefined;

    // E-mail para o Administrador
    const emailSubject = `[SM Express] Movimentação no Pedido #${req.id}: Status -> ${statusLabel}`;
    const emailBody = 
`MOVIMENTAÇÃO DE STATUS REGISTRADA

Pedido: #${req.id}
Serviço: ${req.serviceTitle}
Cliente: ${req.clientName} (${req.clientPhone})
Prestador: ${req.assignedProfessional || 'Não atribuído'}
Novo Status: ${statusLabel}
Horário: ${new Date().toLocaleString('pt-BR')}

Acompanhe os detalhes no Painel Administrativo.`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'mudanca_status',
      title: `Mudança de Status: #${req.id} -> ${statusLabel}`,
      description: `Pedido #${req.id} atualizado para "${statusLabel}". Notificado ao Administrador no WhatsApp Oficial (${ADMIN_WHATSAPP_FORMATTED}) e e-mail.`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      clientWhatsApp: req.clientPhone,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      whatsappUrlClient: clientWhatsAppUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      messageContentClient: clientStatusMsg,
      timestamp: new Date().toISOString(),
      status: 'disparado',
      requestId: req.id
    };

    this.saveLog(logItem);
    return logItem;
  }

  /**
   * 5. NOTIFICAÇÃO: NOVO PROFISSIONAL PARCEIRO CADASTRADO
   */
  public notifyNewProfessional(prof: ProfessionalProfile): NotificationLogItem {
    const adminMessage = 
`👷 *NOVO PROFISSIONAL CADASTRADO - SM EXPRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: *${prof.fullName}*
CPF/CNPJ: ${prof.cpfCnpj}
Telefone: *${prof.phone}*
E-mail: ${prof.email}
Cidade/UF: ${prof.city} - ${prof.state}
Categorias: ${prof.categories?.join(', ') || 'Geral'}
Status: *Pendente de Aprovação Administrativa*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Acesse a aba 'Prestadores' no Painel Administrativo para auditar documentos e aprovar.`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    // Mensagem de Boas-Vindas para o WhatsApp do Prestador
    const profWelcomeMessage = 
`👋 Olá *${prof.fullName}*!
Seja muito bem-vindo à rede de profissionais credenciados da *SM Express*!
Recebemos seu cadastro com sucesso. Nossa diretoria administrativa (${ADMIN_EMAIL} / ${ADMIN_WHATSAPP_FORMATTED}) está validando suas informações para liberação de acesso às demandas da sua região.`;

    const profWhatsAppUrl = prof.phone ? formatWhatsAppUrl(prof.phone, profWelcomeMessage) : undefined;

    const emailSubject = `[SM Express] Novo Prestador Cadastrado: ${prof.fullName} (${prof.city})`;
    const emailBody = 
`NOVO CADASTRO DE PRESTADOR RECEBIDO

Nome Completo: ${prof.fullName}
Documento CPF/CNPJ: ${prof.cpfCnpj}
WhatsApp: ${prof.phone}
E-mail: ${prof.email}
Endereço: ${prof.city} - ${prof.state}
Categorias: ${prof.categories?.join(', ') || 'Geral'}
Data do Cadastro: ${new Date().toLocaleString('pt-BR')}

Acesse o Painel Administrativo para aprovar o cadastro e liberar o mural de demandas.`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'novo_profissional',
      title: `Novo Prestador: ${prof.fullName}`,
      description: `Prestador ${prof.fullName} concluiu o cadastro e aguarda validação. Notificado ao Administrador.`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      professionalWhatsApp: prof.phone,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      whatsappUrlProfessional: profWhatsAppUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      messageContentProfessional: profWelcomeMessage,
      timestamp: new Date().toISOString(),
      status: 'disparado'
    };

    this.saveLog(logItem);
    return logItem;
  }

  /**
   * 6. NOTIFICAÇÃO: AVALIAÇÃO DO CLIENTE RECEBIDA
   */
  public notifyNewReview(req: ServiceRequest, stars: number, comment: string): NotificationLogItem {
    const starsStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);

    const adminMessage = 
`⭐ *NOVA AVALIAÇÃO DE SERVIÇO - SM EXPRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Pedido: *${req.id}* (${req.serviceTitle})
Cliente: *${req.clientName}*
Prestador Avaliado: *${req.assignedProfessional}*
Classificação: *${stars}/5* ${starsStr}
Comentário do Cliente:
"${comment || 'Sem comentário por escrito.'}"
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    const adminWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    const adminWhatsAppBackupUrl = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(adminMessage)}`;

    const emailSubject = `[SM Express] Avaliação Recebida (${stars}/5 estrelas): Pedido #${req.id}`;
    const emailBody = 
`NOVA AVALIAÇÃO DO CLIENTE

Pedido: #${req.id}
Serviço: ${req.serviceTitle}
Cliente: ${req.clientName}
Prestador: ${req.assignedProfessional}
Nota: ${stars}/5 estrelas (${starsStr})
Comentário:
${comment || 'Nenhum'}

Data: ${new Date().toLocaleString('pt-BR')}`;

    const mailtoUrl = buildAdminMailto(emailSubject, emailBody);

    const logItem: NotificationLogItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'avaliacao_recebida',
      title: `Avaliação: #${req.id} (${stars}★)`,
      description: `Cliente ${req.clientName} avaliou o serviço com nota ${stars}/5. Notificado ao Administrador.`,
      adminEmail: ADMIN_EMAIL,
      adminWhatsApp: ADMIN_WHATSAPP_FORMATTED,
      adminWhatsAppBackup: ADMIN_WHATSAPP_BACKUP_FORMATTED,
      whatsappUrlAdmin: adminWhatsAppUrl,
      whatsappUrlAdminBackup: adminWhatsAppBackupUrl,
      mailtoUrlAdmin: mailtoUrl,
      messageContentAdmin: adminMessage,
      timestamp: new Date().toISOString(),
      status: 'disparado',
      requestId: req.id
    };

    this.saveLog(logItem);
    return logItem;
  }
}

export const notificationService = new NotificationService();
