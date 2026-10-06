import { Link } from 'react-router-dom'
const styles = {
  primary: 'bg-ink text-cream hover:bg-taupe',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
  light: 'bg-cream text-ink hover:bg-stone',
}
export default function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm tracking-wide transition-colors duration-300 ${styles[variant]} ${className}`
  return to ? <Link to={to} className={cls} {...rest}>{children}</Link> : <button className={cls} {...rest}>{children}</button>
}
