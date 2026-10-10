import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="grid min-h-screen place-items-center bg-cream px-5 text-ink"><div role="alert" className="max-w-md text-center"><h1 className="font-serif text-3xl">Something went wrong</h1><p className="mt-4 text-sm">We couldn’t display this page. Please reload to try again. Your saved cart and wishlist have not been cleared.</p><button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 rounded-md bg-teal px-5 py-2.5 text-sm text-cream">Reload page</button><a href="/" className="ml-4 inline-flex min-h-11 items-center text-sm underline">Back home</a></div></main>
  }
}
