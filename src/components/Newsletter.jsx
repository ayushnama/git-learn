import { useState } from 'react'
export default function Newsletter() {
  const [notice, setNotice] = useState('')
  return (
    <section className="bg-bone py-9 md:py-12">
      <div className="mx-auto max-w-xl px-5 text-center">
        <h2 className="text-3xl sm:text-4xl">Join the studio list</h2>
        <p className="mt-3 text-ink/75">New pieces and restocks first. 10% off your first order.</p>
          <form onSubmit={(e) => { e.preventDefault(); setNotice('Subscriptions are not available yet. Please try again later. No email or discount code has been sent.') }} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input name="email" autoComplete="email" type="email" required onInput={() => setNotice('')} placeholder="Your email" aria-label="Email address" className="w-full border border-stone bg-cream px-4 min-h-11 py-2.5 text-sm focus:border-teal" />
            <button className="bg-teal px-7 min-h-11 py-2.5 text-sm text-cream enabled:hover:bg-teal-dark">Subscribe</button>
          </form>
        {notice && <p className="mt-8" role="status">{notice}</p>}
      </div>
    </section>
  )
}
