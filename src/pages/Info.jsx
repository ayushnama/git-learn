import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { marbleArt } from '../utils/marble'

function Page({ title, description, children, wide }) {
  useSEO({ title, description })
  return (
    <div className={`mx-auto px-5 py-14 sm:px-8 md:py-20 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-taupe [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-ink sm:[&_h2]:text-3xl">{children}</div>
    </div>
  )
}

export const About = () => (
  <Page title="Our story" description="Veina is a family of marble artisans from Makrana, Rajasthan, making homeware by hand." wide>
    <img src={marbleArt(5, 'white', 'bowl')} alt="Hand-carved marble bowl" className="aspect-[16/9] w-full object-cover" />
    <p>Veina began with a simple idea: the stone used for monuments should also sit in your kitchen. Our artisans in Makrana have worked marble for generations, and every piece still passes through human hands.</p>
    <h2>How we make it</h2>
    <p>Blocks are chosen for their veining, cut, turned, hand-polished and sealed. A single mug takes several days from rough block to finished piece.</p>
    <Button to="/shop" className="mt-4">Shop collection</Button>
  </Page>
)

export function Contact() {
  const [sent, setSent] = useState(false)
  const f = 'w-full border border-stone bg-cream px-4 py-3 text-ink outline-none focus:border-ink'
  return (
    <Page title="Contact us" description="Get in touch with the Veina team for orders, custom pieces and support.">
      <p>Questions about an order or a custom piece? Write to hello@veinamarble.com or use the form. We reply within one working day.</p>
      {sent ? <p className="text-ink">Thank you. We will be in touch soon.</p> : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
          <label className="block text-sm">Name<input required className={f} /></label>
          <label className="block text-sm">Email<input required type="email" className={f} /></label>
          <label className="block text-sm">Message<textarea required rows="5" className={f} /></label>
          <Button>Send message</Button>
        </form>
      )}
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
  <Page title="Privacy policy" description="How Veina collects, uses and protects your information.">
    <p>This is placeholder text. We collect only the information needed to process orders and improve the store, and we never sell your data.</p>
    <h2>Data we collect</h2><p>Name, contact details, shipping address and order history.</p>
    <h2>Your rights</h2><p>You may request access to or deletion of your data at any time.</p>
  </Page>
)
export const Terms = () => (
  <Page title="Terms & conditions" description="The terms that apply when you shop at Veina Marble.">
    <p>This is placeholder text. By using this site you agree to these terms.</p>
    <h2>Products</h2><p>Marble is natural; colour and veining vary between pieces.</p>
    <h2>Orders and payment</h2><p>Prices are in INR and include applicable taxes. We may cancel orders in case of pricing errors.</p>
  </Page>
)
export const NotFound = () => (
  <Page title="Page not found" description="This page could not be found."><p>The page you are looking for does not exist.</p><Button to="/">Back home</Button></Page>
)
