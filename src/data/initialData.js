export const initialData = {
  contacts: [
    { id: 1, name: 'Mariana Costa', phone: '+55 11 98765-4321', email: 'mariana@email.com', company: 'Studio Aurora', initials: 'MC', color: 'lilac' },
    { id: 2, name: 'Rafael Mendes', phone: '+55 21 99876-5432', email: 'rafael@email.com', company: 'Pessoa física', initials: 'RM', color: 'blue' },
    { id: 3, name: 'Camila Oliveira', phone: '+55 31 91234-5678', email: 'camila@email.com', company: 'Oliveira & Co.', initials: 'CO', color: 'peach' },
    { id: 4, name: 'Lucas Ferreira', phone: '+55 11 97654-3210', email: 'lucas@email.com', company: 'Pessoa física', initials: 'LF', color: 'mint' },
    { id: 5, name: 'Beatriz Almeida', phone: '+55 41 98888-1212', email: 'bia@email.com', company: 'Almeida Design', initials: 'BA', color: 'pink' },
  ],
  conversations: [
    { id: 1, name: 'Mariana Costa', initials: 'MC', color: 'lilac', preview: 'Perfeito, fico no aguardo 😊', time: '10:42', unread: 2, queue: 'Vendas', status: 'Aguardando', online: true },
    { id: 2, name: 'Rafael Mendes', initials: 'RM', color: 'blue', preview: 'Qual o prazo de entrega?', time: '10:18', unread: 0, queue: 'Suporte', status: 'Em atendimento' },
    { id: 3, name: 'João Oliveira', initials: 'CO', color: 'peach', preview: 'Obrigado pelo suporte!', time: '09:56', unread: 0, queue: 'Suporte', status: 'Em atendimento' },
    { id: 4, name: 'Lucas Ferreira', initials: 'LF', color: 'mint', preview: 'Tenho interesse no plano anual', time: '09:31', unread: 1, queue: 'Vendas', status: 'Aguardando' },
    { id: 5, name: 'Beatriz Almeida', initials: 'BA', color: 'pink', preview: 'Pode me enviar mais detalhes?', time: 'Ontem', unread: 0, queue: 'Vendas', status: 'Resolvido' },
    { id: 6, name: 'Pedro Santos', initials: 'PS', color: 'yellow', preview: 'Até mais, obrigado!', time: 'Ontem', unread: 0, queue: 'Suporte', status: 'Resolvido' },
  ],
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
