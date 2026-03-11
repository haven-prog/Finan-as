import { useState } from 'react'
import { FinanceProvider, useFinance } from './context/FinanceContext.jsx'
import BottomNav       from './components/ui/BottomNav.jsx'
import HomePage        from './components/pages/HomePage.jsx'
import GastosFixosPage from './components/pages/GastosFixosPage.jsx'
import MetasPage       from './components/pages/MetasPage.jsx'
import GastosPage      from './components/pages/GastosPage.jsx'
import IntelPage       from './components/pages/IntelPage.jsx'
import TxModal         from './components/modals/TxModal.jsx'
import RealidadeModal  from './components/modals/RealidadeModal.jsx'
import CelebModal      from './components/modals/CelebModal.jsx'
import EmergencyModal  from './components/modals/EmergencyModal.jsx'
import FreeModal       from './components/modals/FreeModal.jsx'
import SimModal        from './components/modals/SimModal.jsx'
import SyncSetup       from './components/modals/SyncSetup.jsx'

function AppInner() {
  const { gfs, goals, saldo, notifs, unreadCount, dispatch, connectRoom } = useFinance()
  const [tab,   setTab]   = useState('home')
  const [modal, setModal] = useState(null)
  const [conf,  setConf]  = useState(false)
  const pendingCeleb = notifs.find(n => n.type === 'milestone' && !n.read)

  function openTx(type = 'out', tx = null, preGfId = null) {
    setModal({ kind:'tx', tx, type, preGfId })
  }
  function saveTx(tx) {
    dispatch({ type: modal?.tx ? 'EDIT_TX' : 'ADD_TX', tx })
    if (!modal?.tx) { setTimeout(() => { setConf(true); setTimeout(() => setConf(false), 2200) }, 60) }
    setModal(null)
  }

  return (
    <div className="app">
      <div className="grain"/>
      <div className="scroll">
        {tab === 'home'   && <HomePage
          onOpenTx={openTx} onTabChange={setTab}
          onEditEmergency={() => setModal('em')}
          onEditFree={() => setModal('free')}
          onRealidade={() => setModal('real')}
          onOpenSync={() => setModal('sync')}
        />}
        {tab === 'fixos'  && <GastosFixosPage onOpenTxForGf={gf => openTx('out', null, gf.id)}/>}
        {tab === 'metas'  && <MetasPage/>}
        {tab === 'gastos' && <GastosPage onOpenTx={openTx}/>}
        {tab === 'intel'  && <IntelPage onSimOpen={() => setModal('sim')}/>}
      </div>

      <div className="fab-w">
        <button className="fab" onClick={() => openTx('out')}>＋</button>
      </div>
      <BottomNav tab={tab} onTab={setTab} unreadCount={unreadCount}/>

      {modal?.kind === 'tx' && (
        <TxModal tx={modal.tx} gfs={gfs} defaultType={modal.type} preGfId={modal.preGfId}
          onClose={() => setModal(null)} onSave={saveTx}/>
      )}
      {modal === 'real' && (
        <RealidadeModal appSaldo={saldo} onClose={() => setModal(null)}
          onReconcile={amt => { dispatch({ type:'RECONCILE', amount:amt }); setModal(null) }}/>
      )}
      {modal === 'em' && (
        <EmergencyModal onClose={() => setModal(null)}
          onSave={em => { dispatch({ type:'SET_EMERGENCY', emergency:em }); setModal(null) }}/>
      )}
      {modal === 'free' && (
        <FreeModal onClose={() => setModal(null)}
          onSave={f => { dispatch({ type:'SET_FREE', free:f }); setModal(null) }}/>
      )}
      {modal === 'sim'  && <SimModal onClose={() => setModal(null)}/>}
      {modal === 'sync' && <SyncSetup onConnect={(c,n) => { connectRoom(c,n); setModal(null) }} onSkip={() => setModal(null)}/>}

      {pendingCeleb && (
        <CelebModal notif={pendingCeleb}
          onClose={() => dispatch({ type:'READ_NOTIF', id:pendingCeleb.id })}
          onSend={(id,r) => dispatch({ type:'READ_NOTIF', id, reaction:r })}/>
      )}
      {conf && (
        <div className="conf">
          <div className="conf-i">✅</div>
          <div className="conf-m">Lançamento salvo!</div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return <FinanceProvider><AppInner/></FinanceProvider>
}
