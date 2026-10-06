import { useState } from 'react'
export default function Newsletter() {
  const [done, setDone] = useState(false)
  return (
    <section className="bg-bone py-16 md:py-24">
      <div className="mx-auto max-w-xl px-5 text-center">
        <h2 className="text-3xl sm:text-4xl">Join the studio list</h2>
        <p className="mt-3 text-taupe">New pieces and restocks first. 10% off your first order.</p>
        {done ? <p className="mt-8">Thank you. Check your inbox for your code.</p> : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true) }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input type="email" required placeholder="Your email" aria-label="Email address" className="w-full border border-stone bg-cream px-4 py-3.5 text-sm outline-none focus:border-ink" />
            <button className="bg-ink px-7 py-3.5 text-sm text-cream hover:bg-taupe">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  )
}
