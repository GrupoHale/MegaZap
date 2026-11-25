import { useMemo, useState } from 'react'
import Avatar from './Avatar.jsx'
import Icon from './Icon.jsx'

const pageIcons = {
  contacts: 'users',
  queues: 'layers',
  departments: 'grid',
  operators: 'users',
  quickReplies: 'message',
  templates: 'file',
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function RecordCard({ page, record }) {
  if (page === 'contacts' || page === 'operators') {
    return (
      <div className="record-card person-card">
        <Avatar name={record.name} initials={record.initials || initials(record.name)} color={record.color || 'blue'} />
        <div className="record-main"><strong>{record.name}</strong><span>{page === 'contacts' ? record.phone : record.email}</span></div>
        <div className="record-extra">{page === 'contacts' ? record.company : record.department}</div>
        <span className="role-pill">{page === 'contacts' ? 'Contato' : record.role || 'Operador'}</span>
        <button className="icon-button" aria-label="Mais opções"><Icon name="more" size={18} /></button>
      </div>
    )
  }
  if (page === 'queues' || page === 'departments') {
    return (
      <div className="record-card group-card">
        <span className={`group-icon group-${record.color || 'blue'}`}><Icon name={page === 'queues' ? 'layers' : 'grid'} size={19} /></span>
        <div className="record-main"><strong>{record.name}</strong><span>{record.description}</span></div>
        <div className="group-stat"><strong>{page === 'queues' ? record.active : record.members}</strong><span>{page === 'queues' ? 'conversas ativas' : 'membros'}</span></div>
        <div className="group-stat"><strong>{record.operators || record.members}</strong><span>operadores</span></div>
        <button className="icon-button" aria-label="Mais opções"><Icon name="more" size={18} /></button>
      </div>
    )
  }
  if (page === 'quickReplies') {
    return (
      <div className="record-card reply-card">
        <span className="shortcut">{record.shortcut}</span>
        <div className="record-main"><strong>{record.title}</strong><span>{record.message}</span></div>
        <button className="icon-button" aria-label="Mais opções"><Icon name="more" size={18} /></button>
      </div>
    )
  }
  return (
    <div className="record-card template-card">
      <span className="template-icon"><Icon name="file" size={18} /></span>
      <div className="record-main"><strong>{record.name}</strong><span>{record.message}</span></div>
      <span className="template-category">{record.category || 'UTILITY'}</span>
      <span className="template-language">{record.language || 'Português (BR)'}</span>
      <span className="draft-pill">{record.status || 'Rascunho'}</span>
      <button className="icon-button" aria-label="Mais opções"><Icon name="more" size={18} /></button>
    </div>
  )
}

export default function ManagementPage({ page, config, records, onAdd }) {
  const [search, setSearch] = useState('')
  const visibleRecords = useMemo(() => records.filter((record) =>
    Object.values(record).some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  ), [records, search])

  if (page === 'settings') {
    return (
      <div className="management-page">
        <header className="topbar"><div><div className="breadcrumb">Workspace <Icon name="chevron" size={13} /> <strong>Configurações</strong></div><h1>Configurações</h1></div></header>
        <section className="settings-card"><span className="settings-illustration"><Icon name="message" size={28} /></span><h2>Integração com WhatsApp</h2><p>A conexão com a API oficial do WhatsApp e a Gupshup poderá ser configurada aqui em breve.</p><span className="coming-soon"><i /> Em breve</span></section>
      </div>
    )
  }

  return (
    <div className="management-page">
      <header className="topbar">
        <div><div className="breadcrumb">Workspace <Icon name="chevron" size={13} /> <strong>{config.title}</strong></div><h1>{config.title}</h1></div>
        <div className="topbar-actions"><button className="icon-button" aria-label="Notificações">◌</button><div className="topbar-divider" /><Avatar initials="AC" color="lilac" size="small" /></div>
      </header>
      <section className="management-content">
        <div className="management-intro">
          <div className="management-description"><span className="page-icon"><Icon name={pageIcons[page]} size={20} /></span><div><h2>{config.title}</h2><p>{config.subtitle}</p></div></div>
          <button className="primary-button" onClick={onAdd}><Icon name="plus" size={17} />{config.addLabel}</button>
        </div>
        <div className="management-toolbar">
          <label className="search-field management-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${config.title.toLowerCase()}...`} /></label>
          <button className="secondary-button"><Icon name="filter" size={16} /> Filtros</button>
          <span className="record-total">{records.length} {records.length === 1 ? 'registro' : 'registros'}</span>
        </div>
        {visibleRecords.length ? (
          <div className="records-list">
            {visibleRecords.map((record) => <RecordCard key={record.id} page={page} record={record} />)}
          </div>
        ) : (
          <div className="empty-management"><span className="empty-icon"><Icon name={pageIcons[page]} size={22} /></span><strong>{search ? 'Nenhum resultado encontrado' : 'Tudo pronto para começar'}</strong><p>{search ? 'Tente buscar por outro termo.' : 'Adicione seu primeiro registro para organizar melhor sua operação.'}</p>{!search && <button className="primary-button" onClick={onAdd}><Icon name="plus" size={17} />{config.addLabel}</button>}</div>
        )}
        {page === 'templates' && <div className="template-hint"><Icon name="sparkle" size={17} /><span><strong>Preparado para a API oficial do WhatsApp</strong> Os templates cadastrados aqui ficam como rascunho até a conexão com a plataforma.</span></div>}
      </section>
    </div>
  )
}
