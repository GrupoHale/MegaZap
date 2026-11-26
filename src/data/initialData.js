export const initialData = {
  contacts: [],
  conversations: [],
  queues: [
    { id: 1, name: 'Vendas', description: 'Novos negócios e oportunidades', color: 'blue', operators: 4, active: 12 },
    { id: 2, name: 'Suporte', description: 'Dúvidas e suporte técnico', color: 'blue', operators: 6, active: 8 },
    { id: 3, name: 'Financeiro', description: 'Pagamentos e cobranças', color: 'orange', operators: 2, active: 3 },
  ],
  departments: [
    { id: 1, name: 'Comercial', description: 'Equipe de vendas e relacionamento', color: 'blue', members: 5 },
    { id: 2, name: 'Suporte', description: 'Atendimento e sucesso do cliente', color: 'blue', members: 6 },
    { id: 3, name: 'Financeiro', description: 'Contas, pagamentos e faturamento', color: 'orange', members: 2 },
  ],
  operators: [
    { id: 1, name: 'Ana Carolina', email: 'ana@megazap.com', role: 'Supervisora', department: 'Comercial', initials: 'AC', color: 'lilac' },
    { id: 2, name: 'João Pedro', email: 'joao@megazap.com', role: 'Operador', department: 'Suporte', initials: 'JP', color: 'blue' },
    { id: 3, name: 'Fernanda Lima', email: 'fernanda@megazap.com', role: 'Operadora', department: 'Comercial', initials: 'FL', color: 'peach' },
    { id: 4, name: 'Gustavo Rocha', email: 'gustavo@megazap.com', role: 'Operador', department: 'Financeiro', initials: 'GR', color: 'mint' },
  ],
  quickReplies: [
    { id: 1, shortcut: '/boasvindas', title: 'Boas-vindas', message: 'Olá! Que bom ter você por aqui. Como posso ajudar?' },
    { id: 2, shortcut: '/horario', title: 'Horário de atendimento', message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.' },
    { id: 3, shortcut: '/obrigado', title: 'Agradecimento', message: 'Agradecemos por entrar em contato. Estamos à disposição!' },
  ],
  templates: [
    { id: 1, name: 'Boas-vindas', category: 'UTILITY', language: 'Português (BR)', status: 'Rascunho', message: 'Olá, {{1}}! Seja bem-vindo(a) à {{2}}.' },
    { id: 2, name: 'Confirmação de pedido', category: 'UTILITY', language: 'Português (BR)', status: 'Rascunho', message: 'Oi, {{1}}! Seu pedido {{2}} foi confirmado.' },
  ],
}
