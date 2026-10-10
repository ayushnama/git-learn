import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'

function Page({ title, description, children, wide, noIndex }) {
  useSEO({ title, description, noIndex })
  return (
    <div className={`mx-auto px-4 py-8 sm:px-6 md:py-10 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <div className="mt-5 space-y-4 leading-relaxed text-ink/75 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:text-ink sm:[&_h2]:text-3xl">{children}</div>
    </div>
  )
}

export function Contact() {
  const [notice, setNotice] = useState('')
  const submit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    for (const name of ['name', 'message']) {
      if (!String(data.get(name) || '').trim()) {
        form.elements[name].setCustomValidity('Please enter more than spaces.')
        form.elements[name].reportValidity()
        return
      }
    }
    setNotice('Online messages are not available yet. Please email hello@veinamarble.com. Your message has not been sent.')
  }
  const f = 'w-full border border-stone bg-cream px-4 py-3 text-ink focus:border-teal'
  return (
    <Page title="Contact us" description="Get in touch with the Marbello team for orders, custom pieces and support.">
      <p>Questions about an order or a custom piece? Write to hello@veinamarble.com or use the form. We reply within one working day.</p>
        <form onSubmit={submit} onInput={(event) => { event.target.setCustomValidity?.(''); setNotice('') }} className="space-y-4">
          <label className="block text-sm">Name<input name="name" autoComplete="name" required className={f} /></label>
          <label className="block text-sm">Email<input name="email" autoComplete="email" required type="email" className={f} /></label>
          <label className="block text-sm">Message<textarea name="message" required rows="5" className={f} /></label>
          <Button>Send message</Button>
          {notice && <p className="text-ink" role="status">{notice}</p>}
        </form>
    </Page>
  )
}

const faqs = [
  ['Is the marble food safe?', 'Yes. Kitchen pieces are sealed with a food-safe finish. Avoid acidic liquids sitting for long periods.'],
  ['How do I clean marble?', 'Hand wash with mild soap and warm water, then dry with a soft cloth. Do not use the dishwasher.'],
  ['Will my piece look like the photo?', 'Marble is natural, so veining varies. That is part of its character.'],
  ['Do you offer custom orders?', 'Yes, for sets and gifting. Contact us with your idea.'],
]
export const FAQ = () => (
  <Page title="Frequently asked questions" description="Answers about marble care, shipping, returns and custom orders.">
    {faqs.map(([q, a]) => <details key={q} className="border-b border-stone pb-4"><summary className="cursor-pointer font-serif text-xl text-ink">{q}</summary><p className="mt-3">{a}</p></details>)}
    <p>More help? <Link to="/contact" className="underline">Contact us</Link>.</p>
  </Page>
)

export const Shipping = () => (
  <Page title="Shipping & returns" description="Delivery times, shipping costs and our 7-day return policy.">
    <h2>Shipping</h2><p>Orders ship in 3 to 5 working days. Delivery takes 3 to 7 days across India. Shipping is free over ₹3,000, otherwise ₹150.</p>
    <h2>Returns</h2><p>Unused items can be returned within 7 days of delivery. Pieces damaged in transit are replaced free. Share an unboxing photo within 48 hours.</p>
  </Page>
)
export const Privacy = () => (
  <Page title="Privacy policy" description="How Marbello collects, uses and protects your information.">
    <p>This is placeholder text. We collect only the information needed to process orders and improve the store, and we never sell your data.</p>
    <h2>Data we collect</h2><p>Name, contact details, shipping address and order history.</p>
    <h2>Your rights</h2><p>You may request access to or deletion of your data at any time.</p>
  </Page>
)
export const Terms = () => (
  <Page title="Terms & conditions" description="The terms that apply when you shop at Marbello.">
    <p>This is placeholder text. By using this site you agree to these terms.</p>
    <h2>Products</h2><p>Marble is natural; colour and veining vary between pieces.</p>
    <h2>Orders and payment</h2><p>Prices are in INR and include applicable taxes. We may cancel orders in case of pricing errors.</p>
  </Page>
)
export const NotFound = () => (
  <Page title="Page not found" description="This page could not be found." noIndex><p>The page you are looking for does not exist.</p><Button to="/">Back home</Button></Page>
)
