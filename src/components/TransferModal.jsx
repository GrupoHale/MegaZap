import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'

export default function TransferModal({ departments, operators, onClose, onTransfer }) {
  const [departmentId, setDepartmentId] = useState('')
  const [destination, setDestination] = useState('queue')
  const [operatorId, setOperatorId] = useState('')

  const availableOperators = useMemo(
    () => operators.filter((operator) => operator.department === departments.find((department) => String(department.id) === departmentId)?.name),
    [departments, departmentId, operators],
  )

  function submit(event) {
    event.preventDefault()
    const department = departments.find((item) => String(item.id) === departmentId)
    if (!department) return

    const operator = destination === 'operator'
      ? availableOperators.find((item) => String(item.id) === operatorId)
      : null
    if (destination === 'operator' && !operator) return

    onTransfer({ department: department.name, operator })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title">
        <header className="modal-header">
          <div>
            <span className="modal-icon"><Icon name="transfer" size={19} /></span>
            <div><h2 id="transfer-title">Transferir atendimento</h2><p>Escolha o setor e para quem deseja encaminhar.</p></div>
          </div>
          <button className="icon-button close-modal" onClick={onClose} aria-label="Fechar">×</button>
        </header>
        <form onSubmit={submit}>
          <div className="modal-fields">
            <label className="form-field">
              <span>Setor de destino <i>*</i></span>
              <select required value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setDestination('queue'); setOperatorId('') }}>
                <option value="">Selecione um setor</option>
                {departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}
              </select>
            </label>

            {departmentId && (
              <fieldset className="transfer-options">
                <legend>Destino dentro do setor</legend>
                <button type="button" className={`transfer-option ${destination === 'queue' ? 'selected' : ''}`} onClick={() => setDestination('queue')}>
                  <span className="transfer-radio">{destination === 'queue' && <i />}</span>
                  <span><strong>Fila do setor</strong><small>Qualquer operador disponível poderá iniciar o atendimento.</small></span>
                </button>
                <button type="button" className={`transfer-option ${destination === 'operator' ? 'selected' : ''}`} onClick={() => { setDestination('operator'); setOperatorId('') }}>
                  <span className="transfer-radio">{destination === 'operator' && <i />}</span>
                  <span><strong>Operador específico</strong><small>Direcione a conversa para uma pessoa deste setor.</small></span>
                </button>
              </fieldset>
            )}

            {departmentId && destination === 'operator' && (
              availableOperators.length ? (
                <label className="form-field">
                  <span>Operador <i>*</i></span>
                  <select required value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                    <option value="">Selecione um operador</option>
                    {availableOperators.map((operator) => <option value={operator.id} key={operator.id}>{operator.name} · {operator.role}</option>)}
                  </select>
                </label>
              ) : (
                <p className="transfer-empty">Não há operadores cadastrados neste setor. Você pode encaminhar para a fila do setor.</p>
              )
            )}
          </div>
          <footer className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={!departmentId || (destination === 'operator' && !operatorId)}>
              <Icon name="transfer" size={16} /> Transferir atendimento
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
