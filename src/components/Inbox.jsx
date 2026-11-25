import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import ConfirmEndModal from './ConfirmEndModal.jsx'
import ConfirmStartModal from './ConfirmStartModal.jsx'
import ConversationHistoryModal from './ConversationHistoryModal.jsx'
import Icon from './Icon.jsx'
import TransferModal from './TransferModal.jsx'
import { getLocalDateInputValue } from '../utils/date.js'
import { fetchTestInbox, sendTestMessage } from '../services/gupshupTest.js'

const today = getLocalDateInputValue()
const starterMessagesByConversation = {
  1: [
    { from: 'customer', text: 'Quero instalar um rastreador no meu carro. Vocês atendem na região da Vila Mariana?', time: '10:34', date: today },
    { from: 'agent', text: 'Atendemos sim, Mariana! Temos instalação em domicílio e em oficinas parceiras.', time: '10:36', date: today },
    { from: 'customer', text: 'O plano premium mostra a localização em tempo real?', time: '10:39', date: today },
    { from: 'agent', text: 'Sim. Ele também inclui histórico de rotas, alertas de movimento e suporte prioritário.', time: '10:41', date: today },
    { from: 'customer', text: 'Perfeito, fico no aguardo dos horários disponíveis para instalação.', time: '10:42', date: today },
  ],
  2: [
    { from: 'customer', text: 'O aplicativo está mostrando meu veículo como desconectado desde ontem.', time: '10:12', date: today },
    { from: 'agent', text: 'Rafael, vou verificar. O veículo está em um local com sinal de celular?', time: '10:14', date: today },
    { from: 'customer', text: 'Está na garagem. Lá o sinal costuma ser um pouco fraco.', time: '10:16', date: today },
    { from: 'agent', text: 'Obrigado. Quando puder, ligue o veículo por alguns minutos e atualize a tela do aplicativo.', time: '10:17', date: today },
    { from: 'customer', text: 'Vou testar agora. Se continuar offline, aviso por aqui.', time: '10:18', date: today },
  ],
  3: [
    { from: 'customer', text: 'Recebi o alerta de ignição, mas o carro está parado na oficina. Isso é normal?', time: '09:48', date: today },
    { from: 'agent', text: 'Pode acontecer durante um teste do veículo. O alerta foi registrado às 09:45.', time: '09:50', date: today },
    { from: 'customer', text: 'Entendi. A localização do veículo está atualizada também?', time: '09:53', date: today },
    { from: 'agent', text: 'Sim, a última posição foi atualizada há poucos minutos e aparece no mapa.', time: '09:55', date: today },
    { from: 'customer', text: 'Obrigado pelo suporte, já consegui localizar no aplicativo.', time: '09:56', date: today },
  ],
  4: [
    { from: 'customer', text: 'Quais são os valores para rastrear um carro e uma moto?', time: '09:23', date: today },
    { from: 'agent', text: 'Temos planos a partir de R$ 49,90 por veículo ao mês. A instalação é combinada à parte.', time: '09:26', date: today },
    { from: 'customer', text: 'O preço muda se eu contratar os dois juntos?', time: '09:28', date: today },
    { from: 'agent', text: 'Posso verificar uma condição para os dois veículos. Você prefere acompanhamento mensal ou anual?', time: '09:30', date: today },
    { from: 'customer', text: 'Tenho interesse no plano anual. Pode me enviar uma proposta?', time: '09:31', date: today },
  ],
  5: [
    { from: 'customer', text: 'Estou comparando os planos. O básico também tem histórico de localização?', time: '10:02', date: today },
    { from: 'agent', text: 'O básico inclui localização e consulta ao histórico de rotas. Os alertas inteligentes estão no plano avançado.', time: '10:06', date: today },
    { from: 'customer', text: 'E consigo receber um aviso quando o veículo sair de uma área definida?', time: '10:09', date: today },
    { from: 'agent', text: 'Sim, esse recurso de cerca virtual está disponível no plano avançado.', time: '10:12', date: today },
    { from: 'customer', text: 'Pode me enviar mais detalhes e os valores desse plano?', time: '10:15', date: today },
  ],
  6: [
    { from: 'customer', text: 'Meu rastreador parou de atualizar a posição do veículo.', time: '16:21', date: today },
    { from: 'agent', text: 'Pedro, verifique se o equipamento está conectado à alimentação do veículo e reinicie o aplicativo.', time: '16:24', date: today },
    { from: 'customer', text: 'Reiniciei o aplicativo e a posição voltou a atualizar.', time: '16:28', date: today },
    { from: 'agent', text: 'Ótimo! A posição já aparece normalmente para nós também. Posso ajudar em algo mais?', time: '16:30', date: today },
    { from: 'customer', text: 'Tudo certo agora, obrigado pelo atendimento!', time: '16:32', date: today },
  ],
}

const statusClass = { Aguardando: 'waiting', 'Em atendimento': 'in-progress', Resolvido: 'resolved' }
const conversationFilters = [
  { label: 'Em andamento', status: 'Em atendimento' },
  { label: 'Fila de espera', status: 'Aguardando' },
]

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

export default function Inbox({ conversations, contacts, departments, operators, onNavigate, onTransfer, onEndConversation, onStartConversation }) {
  const [selectedId, setSelectedId] = useState(() => (
    conversations.find((conversation) => conversation.status === 'Em atendimento')?.id ?? conversations[0]?.id
  ))
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [filter, setFilter] = useState('Em andamento')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [testInbox, setTestInbox] = useState({ mode: 'simulation', contacts: [], conversations: [], messagesByPhone: {} })
  const [conversationOverrides, setConversationOverrides] = useState({})
  const [connectionError, setConnectionError] = useState('')
  const [sendError, setSendError] = useState('')
  const [sendFeedback, setSendFeedback] = useState('')
  const [sending, setSending] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [confirmEndOpen, setConfirmEndOpen] = useState(false)
  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  const messagesAreaRef = useRef(null)

  const allContacts = useMemo(() => {
    const merged = [...contacts]
    for (const testContact of testInbox.contacts) {
      const index = merged.findIndex((contactItem) => (
        normalizePhone(contactItem.phone) === normalizePhone(testContact.phone)
      ))
      if (index === -1) merged.unshift(testContact)
      else merged[index] = { ...merged[index], ...testContact, id: merged[index].id }
    }
    return merged
  }, [contacts, testInbox.contacts])
  const allConversations = useMemo(() => {
    const contactsByName = new Map(contacts.map((item) => [item.name, item]))
    const merged = conversations.map((conversation) => ({
      ...conversation,
      phone: conversation.phone || contactsByName.get(conversation.name)?.phone,
    }))

    for (const testConversation of testInbox.conversations) {
      const index = merged.findIndex((conversation) => (
        normalizePhone(conversation.phone) === normalizePhone(testConversation.phone)
      ))
      if (index === -1) merged.unshift(testConversation)
      else merged[index] = { ...merged[index], ...testConversation, id: merged[index].id }
    }

    return merged.map((conversation) => ({
      ...conversation,
      ...conversationOverrides[conversation.id],
    }))
  }, [contacts, conversations, conversationOverrides, testInbox.conversations])
  const selected = allConversations.find((conversation) => conversation.id === selectedId) || allConversations[0]
  const contact = allContacts.find((item) => (
    normalizePhone(item.phone) === normalizePhone(selected?.phone)
  )) || allContacts.find((item) => item.name === selected?.name)
  const selectedPhone = normalizePhone(selected?.phone || contact?.phone)
  const remoteMessages = testInbox.messagesByPhone[selectedPhone] || []
  const isOriginalConversation = conversations.some((conversation) => conversation.id === selected?.id)
  const chatMessages = selected
    ? [...(isOriginalConversation ? starterMessagesByConversation[selected.id] || [] : []), ...remoteMessages]
    : []
  const isWaiting = selected?.status === 'Aguardando'
  const canReply = selected?.status === 'Em atendimento'
  const canTransfer = selected?.status !== 'Resolvido'
  const filtered = useMemo(() => allConversations.filter((conversation) => {
    const matchesSearch = `${conversation.name} ${conversation.preview}`.toLowerCase().includes(search.toLowerCase())
    const activeFilter = conversationFilters.find((item) => item.label === filter)
    return matchesSearch && conversation.status === activeFilter?.status
  }), [allConversations, filter, search])

  useEffect(() => {
    let active = true
    let pending = false

    async function refreshTestInbox() {
      if (pending) return
      pending = true
      try {
        const snapshot = await fetchTestInbox()
        if (active) {
          setTestInbox(snapshot)
          setConnectionError('')
        }
      } catch (error) {
        if (active) setConnectionError(error.message)
      } finally {
        pending = false
      }
    }

    refreshTestInbox()
    const intervalId = window.setInterval(refreshTestInbox, 2000)
    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const messagesArea = messagesAreaRef.current
    if (messagesArea) {
      messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' })
    }
  }, [selectedId, chatMessages.length])

  function changeFilter(label) {
    const nextFilter = conversationFilters.find((item) => item.label === label)
    if (!nextFilter) return

    setFilter(label)
    const nextConversation = allConversations.find((conversation) => (
      conversation.status === nextFilter.status
      && `${conversation.name} ${conversation.preview}`.toLowerCase().includes(search.toLowerCase())
    ))
    if (nextConversation) setSelectedId(nextConversation.id)
  }

  async function sendMessage(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || !selected || !selectedPhone || !canReply || sending) return

    setSending(true)
    setSendError('')
    setSendFeedback('')
    try {
      const result = await sendTestMessage({ phone: selectedPhone, name: selected.name, text })
      setTestInbox(result)
      setMessage('')
      setSendFeedback(result.delivery === 'simulation'
        ? 'Mensagem registrada na simulação local; não enviada pelo WhatsApp.'
        : 'Mensagem aceita pela Gupshup para processamento.')
    } catch (error) {
      setSendError(error.message)
    } finally {
      setSending(false)
    }
  }

  function transferCurrentConversation({ department, operator }) {
    setConversationOverrides((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id],
        queue: department,
        assignedOperator: operator?.name || null,
        status: operator ? 'Em atendimento' : 'Aguardando',
      },
    }))
    onTransfer({ conversationId: selected.id, department, operator })
    setFilter(operator ? 'Em andamento' : 'Fila de espera')
    setTransferOpen(false)
  }

  function endCurrentConversation() {
    setConfirmEndOpen(false)
    setConversationOverrides((current) => ({
      ...current,
      [selected.id]: { ...current[selected.id], status: 'Resolvido' },
    }))
    onEndConversation(selected.id)
    setSearch('')
    const nextInProgress = allConversations.find((conversation) => (
      conversation.id !== selected.id && conversation.status === 'Em atendimento'
    ))
    if (nextInProgress) {
      setFilter('Em andamento')
      setSelectedId(nextInProgress.id)
      return
    }

    const nextWaiting = allConversations.find((conversation) => (
      conversation.id !== selected.id && conversation.status === 'Aguardando'
    ))
    if (nextWaiting) {
      setFilter('Fila de espera')
      setSelectedId(nextWaiting.id)
    }
  }

  function startCurrentConversation() {
    setConfirmStartOpen(false)
    setConversationOverrides((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id],
        status: 'Em atendimento',
        assignedOperator: 'João Vitor',
      },
    }))
    onStartConversation(selected.id)
    setFilter('Em andamento')
  }

  if (!selected) return <div className="empty-state">Nenhuma conversa disponível.</div>

  return (
    <div className="inbox-page">
      <header className="topbar">
        <div>
          <div className="breadcrumb">Atendimento <Icon name="chevron" size={13} /> <strong>Caixa de entrada</strong></div>
          <h1>Caixa de entrada</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Pesquisar"><Icon name="search" /></button>
          <button className="icon-button notification-button" aria-label="Notificações"><span />◌</button>
          <div className="topbar-divider" />
          <span className="availability"><i /> Disponível</span>
          <Avatar initials="AC" color="lilac" size="small" />
        </div>
      </header>

      <div className={`inbox-layout ${mobileChatOpen ? 'mobile-chat-open' : ''}`}>
        <section className="conversation-list">
          <div className="list-heading">
            <div><h2>Conversas</h2><span className="conversation-count">{allConversations.length}</span></div>
            <button className="new-conversation" aria-label="Nova conversa"><Icon name="plus" size={17} /></button>
          </div>
          <label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversa..." /></label>
          <div className="filter-row">
            {conversationFilters.map((option) => {
              const count = allConversations.filter((conversation) => conversation.status === option.status).length
              return (
                <button key={option.label} onClick={() => changeFilter(option.label)} className={filter === option.label ? 'selected' : ''}>
                  {option.label}<span className="filter-count">{count}</span>
                </button>
              )
            })}
          </div>
          <div className="conversation-items">
            {filtered.map((conversation) => (
              <button key={conversation.id} className={`conversation-item ${selected.id === conversation.id ? 'selected' : ''}`} onClick={() => { setSelectedId(conversation.id); setMobileChatOpen(true) }}>
                <Avatar name={conversation.name} initials={conversation.initials} color={conversation.color} online={conversation.online} />
                <span className="conversation-copy">
                  <span className="conversation-line"><strong>{conversation.name}</strong><time>{conversation.time}</time></span>
                  <span className="preview-text">{conversation.preview}</span>
                  <span className="conversation-meta"><span className={`status-pill ${statusClass[conversation.status]}`}>{conversation.status}</span><span className="queue-label">{conversation.queue}</span></span>
                </span>
                {conversation.unread > 0 && <span className="unread-count">{conversation.unread}</span>}
              </button>
            ))}
            {filtered.length === 0 && <p className="no-results">Nenhuma conversa encontrada.</p>}
          </div>
          <div className="list-footer">Exibindo {filtered.length} de {allConversations.length} conversas</div>
        </section>

        <section className="chat-panel" key={selected.id}>
          <div className="chat-header">
            <div className="chat-person">
              <button className="mobile-back" onClick={() => setMobileChatOpen(false)} aria-label="Voltar para conversas"><Icon name="chevron" size={18} /></button>
              <Avatar name={selected.name} initials={selected.initials} color={selected.color} online={selected.online} />
              <div><strong>{selected.name}</strong><span><i className="whatsapp-dot" /> WhatsApp · {contact?.phone || '+55 11 99999-0000'}</span></div>
            </div>
            <div className="chat-actions">
              <span className={`status-pill ${statusClass[selected.status]}`}>{selected.status}</span>
              <button className="icon-button" title="Histórico de conversa" aria-label="Histórico de conversa" onClick={() => setHistoryOpen(true)}><Icon name="clock" size={18} /></button>
              <button className="icon-button" title="Transferir atendimento" aria-label="Transferir atendimento" onClick={() => setTransferOpen(true)} disabled={!canTransfer}><Icon name="transfer" size={18} /></button>
              <button className="icon-button" title="Ligar"><Icon name="phone" size={18} /></button>
              <button className="icon-button" title="Ver dados do contato" onClick={() => setShowDetails((value) => !value)}><Icon name="users" size={18} /></button>
              <button className="icon-button" aria-label="Mais opções"><Icon name="more" size={19} /></button>
              {isWaiting && <button className="icon-button start-service-button" title="Iniciar atendimento" aria-label="Iniciar atendimento" onClick={() => setConfirmStartOpen(true)}><Icon name="play" size={18} /></button>}
              {canReply && <><span className="chat-action-divider" aria-hidden="true" /><button className="icon-button end-service-button" title="Encerrar atendimento" aria-label="Encerrar atendimento" onClick={() => setConfirmEndOpen(true)}><Icon name="check" size={18} /></button></>}
            </div>
          </div>
          <div className="chat-context"><span className="context-icon"><Icon name="layers" size={15} /></span><span>Setor: <strong>{selected.queue}</strong></span><span className="context-divider" /><span>Responsável: <strong>{selected.assignedOperator === null ? 'Fila do setor' : selected.assignedOperator || 'João Vitor'}</strong></span><button onClick={() => setTransferOpen(true)} disabled={!canTransfer}>Transferir</button></div>
          <div className="chat-date"><span>Hoje, 25 de novembro</span></div>
          <div className="messages-area" ref={messagesAreaRef}>
            {chatMessages.map((item, index) => (
              <div key={`${selected.id}-${index}`} className={`message-row ${item.from === 'agent' ? 'outgoing' : 'incoming'}`}>
                {item.from === 'customer' && <Avatar initials={selected.initials} color={selected.color} size="tiny" />}
                <div className="message-bubble"><p>{item.text}</p><span>{item.time} {item.from === 'agent' && <Icon name="check" size={13} />}</span></div>
              </div>
            ))}
          </div>
          <form className="composer" onSubmit={sendMessage}>
            <div className="composer-toolbar">
              <button type="button" className="toolbar-button" title="Anexar arquivo"><Icon name="paperclip" size={18} /></button>
              <button type="button" className="toolbar-button" title="Mensagens rápidas" onClick={() => onNavigate('quickReplies')}><Icon name="sparkle" size={18} /></button>
              <span className="reply-mode" title={connectionError || 'Mensagens de teste ficam em memória enquanto o servidor estiver ativo.'}>
                <span />{connectionError ? 'Servidor desconectado' : testInbox.mode === 'sandbox' ? 'Sandbox Gupshup' : 'Simulação local'}
              </span>
              <button type="button" className="toolbar-button more-compose" aria-label="Mais opções"><Icon name="more" size={18} /></button>
            </div>
            <div className="composer-input">
              <textarea value={message} onChange={(event) => { setMessage(event.target.value); setSendError(''); setSendFeedback('') }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(event) } }} placeholder={canReply ? 'Digite sua mensagem...' : isWaiting ? 'Inicie o atendimento para responder' : 'Atendimento encerrado'} rows="1" disabled={!canReply || sending} />
              <button className="send-button" type="submit" disabled={!message.trim() || !selectedPhone || !canReply || sending} aria-label="Enviar mensagem"><Icon name="send" size={17} /></button>
            </div>
            <div className={`composer-hint ${sendError || connectionError ? 'error' : sendFeedback ? 'success' : ''}`} role={sendError || connectionError ? 'alert' : 'status'}>
              {sendError || connectionError || sendFeedback || <>Pressione <kbd>Enter</kbd> para enviar · <kbd>Shift + Enter</kbd> para nova linha</>}
            </div>
          </form>
        </section>

        {showDetails && <aside className="contact-panel">
          <div className="contact-panel-heading"><h3>Detalhes do contato</h3><button className="icon-button" onClick={() => setShowDetails(false)} aria-label="Fechar detalhes">×</button></div>
          <div className="contact-summary">
            <Avatar name={selected.name} initials={selected.initials} color={selected.color} size="large" />
            <strong>{selected.name}</strong>
            <span className="contact-tag">{selected.queue}</span>
          </div>
          <div className="detail-section">
            <div className="detail-title">INFORMAÇÕES <button aria-label="Editar informações">✎</button></div>
            <div className="detail-field"><span>Telefone</span><strong>{contact?.phone || '+55 11 99999-0000'}</strong></div>
            <div className="detail-field"><span>E-mail</span><strong>{contact?.email || 'Não informado'}</strong></div>
            <div className="detail-field"><span>Empresa</span><strong>{contact?.company || 'Não informado'}</strong></div>
          </div>
          <div className="detail-section">
            <div className="detail-title">ATENDIMENTO</div>
            <div className="detail-field"><span>Fila</span><strong className="detail-with-icon"><i className="tiny-color-dot" />{selected.queue}</strong></div>
            <div className="detail-field"><span>Responsável</span><strong className="detail-with-icon">{selected.assignedOperator === null ? 'Fila do setor' : <><Avatar initials="AC" color="lilac" size="tiny" /> {selected.assignedOperator || 'João Vitor'}</>}</strong></div>
            <div className="detail-field"><span>Status</span><strong><span className={`status-pill ${statusClass[selected.status]}`}>{selected.status}</span></strong></div>
          </div>
          <button className="view-contact" onClick={() => onNavigate('contacts')}>Ver perfil completo <Icon name="chevron" size={15} /></button>
          <div className="contact-note"><Icon name="file" size={16} /><span><strong>Anotações</strong><small>Adicione uma nota sobre este contato</small></span><Icon name="plus" size={16} /></div>
        </aside>}
      </div>
      {historyOpen && (
        <ConversationHistoryModal
          contact={{ ...selected, phone: contact?.phone }}
          messages={chatMessages}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {confirmEndOpen && (
        <ConfirmEndModal
          contactName={selected.name}
          onCancel={() => setConfirmEndOpen(false)}
          onConfirm={endCurrentConversation}
        />
      )}
      {confirmStartOpen && (
        <ConfirmStartModal
          contactName={selected.name}
          onCancel={() => setConfirmStartOpen(false)}
          onConfirm={startCurrentConversation}
        />
      )}
      {transferOpen && (
        <TransferModal
          departments={departments}
          operators={operators}
          onClose={() => setTransferOpen(false)}
          onTransfer={transferCurrentConversation}
        />
      )}
    </div>
  )
}
