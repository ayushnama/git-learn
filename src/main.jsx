import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import { CatalogProvider } from './context/CatalogContext.jsx'
import { CustomerProvider } from './context/CustomerContext.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><BrowserRouter><CatalogProvider><StoreProvider><CustomerProvider><App /></CustomerProvider></StoreProvider></CatalogProvider></BrowserRouter></ErrorBoundary>
)
