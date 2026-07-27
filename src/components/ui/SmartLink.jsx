import { Link } from 'react-router';
import { safeUrl } from '../../utils/safeUrl';

export default function SmartLink({ href, children, className = '', ...props }) {
  const url = safeUrl(href);
  if (!url) return null;
  if (url.startsWith('/')) return <Link className={className} to={url} {...props}>{children}</Link>;
  return <a className={className} href={url} target="_blank" rel="noreferrer noopener" {...props}>{children}<span className="visually-hidden"> (se abre en una pestaña nueva)</span></a>;
}
