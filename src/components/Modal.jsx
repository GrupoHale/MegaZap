import { useState } from 'react'
import Icon from './Icon.jsx'

const fieldsByPage = {
  contacts: [
    { name: 'name', label: 'Nome completo', placeholder: 'Ex.: Mariana Costa', required: true },
    { name: 'phone', label: 'Telefone / WhatsApp', placeholder: '+55 (00) 00000-0000', required: true },
    { name: 'email', label: 'E-mail', placeholder: 'nome@email.com', type: 'email' },
    { name: 'company', label: 'Empresa', placeholder: 'Nome da empresa' },
  ],
  queues: [
    { name: 'name', label: 'Nome da fila', placeholder: 'Ex.: Comercial', required: true },
    { name: 'description', label: 'Descrição', placeholder: 'Qual o objetivo desta fila?' },
    { name: 'color', label: 'Identificação', type: 'select', options: [['blue', 'Azul'], ['navy', 'Azul-marinho'], ['orange', 'Laranja'], ['purple', 'Roxo']] },
  ],
  departments: [
    { name: 'name', label: 'Nome do setor', placeholder: 'Ex.: Comercial', required: true },
    { name: 'description', label: 'Descrição', placeholder: 'Descreva as responsabilidades do setor' },
    { name: 'color', label: 'Identificação', type: 'select', options: [['blue', 'Azul'], ['navy', 'Azul-marinho'], ['orange', 'Laranja'], ['purple', 'Roxo']] },
  ],
  operators: [
    { name: 'name', label: 'Nome completo', placeholder: 'Ex.: Ana Carolina', required: true },
    { name: 'email', label: 'E-mail de acesso', placeholder: 'nome@empresa.com', type: 'email', required: true },
    { name: 'role', label: 'Perfil', type: 'select', options: [['Operador', 'Operador'], ['Supervisor', 'Supervisor'], ['Administrador', 'Administrador']] },
    { name: 'department', label: 'Setor', placeholder: 'Ex.: Comercial' },
  ],
  quickReplies: [
    { name: 'title', label: 'Nome da mensagem', placeholder: 'Ex.: Boas-vindas', required: true },
    { name: 'shortcut', label: 'Atalho', placeholder: '/boasvindas', required: true },
    { name: 'message', label: 'Mensagem', placeholder: 'Digite o conteúdo da resposta rápida...', type: 'textarea', required: true },
  ],
  templates: [
    { name: 'name', label: 'Nome do template', placeholder: 'Ex.: confirmação_pedido', required: true },
    { name: 'category', label: 'Categoria', type: 'select', options: [['UTILITY', 'Utilidade'], ['MARKETING', 'Marketing'], ['AUTHENTICATION', 'Autenticação']] },
    { name: 'language', label: 'Idioma', type: 'select', options: [['Português (BR)', 'Português (BR)'], ['English', 'English'], ['Español', 'Español']] },
    { name: 'message', label: 'Conteúdo da mensagem', placeholder: 'Use {{1}}, {{2}} para variáveis...', type: 'textarea', required: true },
  ],
}

export default function Modal({ page, title, onClose, onSubmit }) {
  const [values, setValues] = useState({})
  const fields = fieldsByPage[page] || []
  const colors = ['blue', 'navy', 'orange', 'purple']

  function submit(event) {
    event.preventDefault()
    const record = { ...values }
    if (page === 'contacts' || page === 'operators') {
      record.initials = record.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
      record.color = colors[Math.floor(Math.random() * colors.length)]
    }
    if (page === 'queues') {
      record.operators = 0
      record.active = 0
    }
    if (page === 'departments') record.members = 0
    if (page === 'templates') record.status = 'Rascunho'
    onSubmit(record)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header"><div><span className="modal-icon"><Icon name="plus" size={19} /></span><div><h2 id="modal-title">{title}</h2><p>Preencha as informações abaixo.</p></div></div><button className="icon-button close-modal" onClick={onClose} aria-label="Fechar">×</button></header>
        <form onSubmit={submit}>
          <div className="modal-fields">
            {fields.map((field) => (
              <label className="form-field" key={field.name}>
                <span>{field.label}{field.required && <i> *</i>}</span>
                {field.type === 'select' ? (
                  <select required={field.required} value={values[field.name] || field.options[0][0]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}>
                    {field.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea rows="4" required={field.required} placeholder={field.placeholder} value={values[field.name] || ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
                ) : (
                  <input type={field.type || 'text'} required={field.required} placeholder={field.placeholder} value={values[field.name] || ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
                )}
              </label>
            ))}
          </div>
          {page === 'templates' && <p className="modal-footnote">Seu template será salvo como rascunho. A aprovação será feita após a integração com o WhatsApp.</p>}
          <footer className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button"><Icon name="plus" size={16} />{title}</button></footer>
        </form>
      </section>
    </div>
  )
}
