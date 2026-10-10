import { Link } from 'react-router-dom'
const styles = {
  primary: 'bg-teal text-cream hover:bg-teal-dark disabled:hover:bg-teal',
  outline: 'border border-teal text-teal hover:bg-bone disabled:hover:bg-transparent',
  light: 'bg-cream text-teal hover:bg-bone',
}
export default function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-md min-h-11 px-5 py-2.5 text-sm tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`
  return to ? <Link to={to} className={cls} {...rest}>{children}</Link> : <button className={cls} {...rest}>{children}</button>
}
