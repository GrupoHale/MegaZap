import { useMemo, useState } from 'react'
import Avatar from './Avatar.jsx'
import Icon from './Icon.jsx'
import { formatDateInputValue, getLocalDateInputValue } from '../utils/date.js'
import './ConversationHistoryModal.css'

export default function ConversationHistoryModal({ contact, messages, onClose }) {
  const today = getLocalDateInputValue()
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [appliedRange, setAppliedRange] = useState({ start: today, end: today })
  const [error, setError] = useState('')

  const filteredMessages = useMemo(() => messages.filter((message) => {
    const date = message.date || today
    return date >= appliedRange.start && date <= appliedRange.end
  }), [appliedRange, messages, today])

  function applyDateRange(event) {
    event.preventDefault()
    if (!startDate || !endDate) {
      setError('Selecione as datas inicial e final.')
      return
    }
    if (startDate > endDate) {
      setError('A data inicial deve ser anterior ou igual à data final.')
      return
    }

    setError('')
    setAppliedRange({ start: startDate, end: endDate })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card history-modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="modal-header">
          <div>
            <span className="modal-icon"><Icon name="clock" size={19} /></span>
            <div><h2 id="history-title">Histórico de conversa</h2><p>Selecione um período para consultar as mensagens de {contact.name}.</p></div>
          </div>
          <button className="icon-button close-modal" onClick={onClose} aria-label="Fechar">×</button>
        </header>
        <div className="history-summary">
          <Avatar initials={contact.initials} color={contact.color} size="small" />
          <span><strong>{contact.name}</strong><small>{contact.phone || 'WhatsApp'} · Conversa atual</small></span>
          <span className="history-count">{filteredMessages.length} mensagens</span>
        </div>
        <form className="history-period" onSubmit={applyDateRange}>
          <div className="history-period-fields">
            <label className="form-field">
              <span>Data inicial</span>
              <input type="date" value={startDate} max={today} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Data final</span>
              <input type="date" value={endDate} min={startDate || undefined} max={today} onChange={(event) => setEndDate(event.target.value)} />
            </label>
            <button type="submit" className="primary-button"><Icon name="search" size={16} />Consultar período</button>
          </div>
          {error && <p className="history-period-error" role="alert">{error}</p>}
        </form>
        <div className="history-messages">
          {filteredMessages.map((message, index) => (
            <article key={`${message.time}-${index}`} className={`history-message ${message.from === 'agent' ? 'from-agent' : ''}`}>
              <div><strong>{message.from === 'agent' ? 'Equipe MegaZap' : contact.name}</strong><time>{formatDateInputValue(message.date || today)} · {message.time}</time></div>
              <p>{message.text}</p>
            </article>
          ))}
          {!filteredMessages.length && <p className="history-empty">{messages.length ? 'Nenhuma mensagem encontrada neste período.' : 'Ainda não há mensagens nesta conversa.'}</p>}
        </div>
        <footer className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Fechar histórico</button></footer>
      </section>
    </div>
  )
}
