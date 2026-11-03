import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store'
import { loadUser } from './actions/userActions'

// Restore the logged-in user from the auth cookie before the first render,
// otherwise a page refresh resets Redux and the user appears logged out.
store.dispatch(loadUser())

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <App />
  </Provider>




)
