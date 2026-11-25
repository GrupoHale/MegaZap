import Icon from './Icon.jsx'

export default function ConfirmStartModal({ contactName, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
      <section className="modal-card confirm-start-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-start-title">
        <header className="modal-header">
          <div>
            <span className="confirm-start-icon"><Icon name="play" size={19} /></span>
            <div><h2 id="confirm-start-title">Iniciar atendimento?</h2><p>Confirme o início desta conversa.</p></div>
          </div>
          <button className="icon-button close-modal" onClick={onCancel} aria-label="Fechar">×</button>
        </header>
        <div className="confirm-start-content">
          <p>O atendimento de <strong>{contactName}</strong> sairá da fila de espera e será atribuído ao Operador</p>
        </div>
        <footer className="modal-footer">
          <button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button>
          <button type="button" className="success-button" onClick={onConfirm}><Icon name="play" size={15} /> Iniciar atendimento</button>
        </footer>
      </section>
    </div>
  )
}
