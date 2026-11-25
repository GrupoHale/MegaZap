import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Inbox from './components/Inbox.jsx'
import ManagementPage from './components/ManagementPage.jsx'
import Modal from './components/Modal.jsx'
import { initialData } from './data/initialData.js'
import './App.css'

const pageConfig = {
  contacts: { title: 'Contatos', subtitle: 'Gerencie os contatos da sua operação.', addLabel: 'Adicionar contato' },
  queues: { title: 'Filas de atendimento', subtitle: 'Organize as conversas por fluxo de atendimento.', addLabel: 'Criar fila' },
  departments: { title: 'Setores', subtitle: 'Estruture sua equipe por áreas de atuação.', addLabel: 'Criar setor' },
  operators: { title: 'Operadores', subtitle: 'Gerencie quem faz parte da sua equipe.', addLabel: 'Adicionar operador' },
  quickReplies: { title: 'Mensagens rápidas', subtitle: 'Responda mais rápido com mensagens prontas.', addLabel: 'Nova mensagem' },
  templates: { title: 'Templates', subtitle: 'Prepare modelos para a futura integração com a API oficial do WhatsApp.', addLabel: 'Novo template' },
}

function App() {
  const [activePage, setActivePage] = useState('inbox')
  const [data, setData] = useState(initialData)
  const [modalOpen, setModalOpen] = useState(false)

  const config = pageConfig[activePage]

  function addRecord(record) {
    setData((current) => ({
      ...current,
      [activePage]: [{ ...record, id: Date.now() }, ...current[activePage]],
    }))
    setModalOpen(false)
  }

  function transferConversation({ conversationId, department, operator }) {
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) => (
        conversation.id === conversationId
          ? {
              ...conversation,
              queue: department,
              assignedOperator: operator?.name || null,
              status: operator ? 'Em atendimento' : 'Aguardando',
            }
          : conversation
      )),
    }))
  }

  function endConversation(conversationId) {
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) => (
        conversation.id === conversationId ? { ...conversation, status: 'Resolvido' } : conversation
      )),
    }))
  }

  function startConversation(conversationId) {
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) => (
        conversation.id === conversationId
          ? { ...conversation, status: 'Em atendimento', assignedOperator: 'Ana Carolina' }
          : conversation
      )),
    }))
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-area">
        <div className="page-transition" key={activePage}>
          {activePage === 'inbox' ? (
            <Inbox
              contacts={data.contacts}
              conversations={data.conversations}
              departments={data.departments}
              operators={data.operators}
              onNavigate={setActivePage}
              onTransfer={transferConversation}
              onEndConversation={endConversation}
              onStartConversation={startConversation}
            />
          ) : (
            <ManagementPage
              page={activePage}
              config={config}
              records={data[activePage]}
              onAdd={() => setModalOpen(true)}
            />
          )}
        </div>
      </main>
      {modalOpen && config && (
        <Modal
          page={activePage}
          title={config.addLabel}
          onClose={() => setModalOpen(false)}
          onSubmit={addRecord}
        />
      )}
    </div>
  )
}

export default App
