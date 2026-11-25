import Icon from './Icon.jsx'

export default function ConfirmEndModal({ contactName, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
      <section className="modal-card confirm-end-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-end-title">
        <header className="modal-header">
          <div>
            <span className="confirm-end-icon"><Icon name="alert" size={20} /></span>
            <div><h2 id="confirm-end-title">Encerrar atendimento?</h2><p>Confirme o encerramento desta conversa.</p></div>
          </div>
          <button className="icon-button close-modal" onClick={onCancel} aria-label="Fechar">×</button>
        </header>
        <div className="confirm-end-content">
          <p>O atendimento de <strong>{contactName}</strong> será marcado como resolvido e removido das filas em andamento e de espera.</p>
        </div>
        <footer className="modal-footer">
          <button type="button" className="secondary-button" onClick={onCancel}>Continuar atendimento</button>
          <button type="button" className="danger-button" onClick={onConfirm}><Icon name="check" size={16} /> Encerrar atendimento</button>
        </footer>
      </section>
    </div>
  )
}
