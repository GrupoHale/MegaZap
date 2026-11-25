import Icon from './Icon.jsx'
import Avatar from './Avatar.jsx'

const navigation = [
  { section: 'ATENDIMENTO', items: [{ id: 'inbox', label: 'Caixa de entrada', icon: 'inbox', badge: '12' }] },
  { section: 'GERENCIAR', items: [
    { id: 'contacts', label: 'Contatos', icon: 'users' },
    { id: 'departments', label: 'Setores', icon: 'grid' },
    { id: 'operators', label: 'Operadores', icon: 'users' },
  ] },
  { section: 'FERRAMENTAS', items: [
    { id: 'quickReplies', label: 'Mensagens rápidas', icon: 'message' },
    { id: 'templates', label: 'Templates', icon: 'file' },
  ] },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onNavigate('inbox') }}>
        <img src="favicon.png" alt="" />
        <span>Mega<span className="brand-light">Zap</span></span>
      </a>

      <nav className="side-nav">
        {navigation.map((group) => (
          <div className="nav-group" key={group.section}>
            <p className="nav-heading">{group.section}</p>
            {group.items.map((item) => (
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className={`nav-item settings-link ${activePage === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>
          <Icon name="settings" size={18} /><span>Configurações</span>
        </button>
        <div className="profile">
          <Avatar initials="JV" color="lilac" />
          <span className="profile-copy"><strong>João Vitor</strong></span>
          <Icon name="more" size={18} />
        </div>
      </div>
    </aside>
  )
}