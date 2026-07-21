import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { migrateLegacyLocalStorage } from './db/idb'
import { useQuestionBankStore } from './stores/useQuestionBankStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useProgressStore } from './stores/useProgressStore'
import { useAbilityStore } from './stores/useAbilityStore'
import { useMistakeStore } from './stores/useMistakeStore'

function waitHydration(store) {
  return new Promise((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve()
      return
    }
    const unsub = store.persist.onFinishHydration(() => {
      unsub?.()
      resolve()
    })
  })
}

async function seedQuestionBankIfEmpty() {
  if (useQuestionBankStore.getState().totalCount() > 0) return
  try {
    const resp = await fetch('/question-bank-local.json')
    if (!resp.ok) return
    const data = await resp.json()
    useQuestionBankStore.getState().importBank(data.bank || data)
  } catch {
    /* offline / missing file */
  }
}

async function boot() {
  await migrateLegacyLocalStorage()
  await Promise.all([
    waitHydration(useQuestionBankStore),
    waitHydration(useSettingsStore),
    waitHydration(useProgressStore),
    waitHydration(useAbilityStore),
    waitHydration(useMistakeStore),
  ])
  await seedQuestionBankIfEmpty()

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}

boot()
