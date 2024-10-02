import React from 'react'
import * as ReactDOM from 'react-dom/client'
import MainPage from './page/MainPage'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <MainPage />
  </React.StrictMode>
)
