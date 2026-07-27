import { NavLink } from 'react-router';
import Icon from '../ui/Icon';

export default function MobileNavigation({ open, items, onClose, onNavigate, closeButtonRef }) {
  if (!open) return null;

  return (
    <>
      <button className="nav-backdrop" type="button" tabIndex="-1" aria-label="Cerrar menú" onClick={onClose} />
      <div id="mobile-navigation" className="mobile-navigation" role="dialog" aria-modal="true" aria-label="Menú principal">
        <div className="mobile-navigation__head">
          <span className="mobile-navigation__brand"><b>Centra</b> Norte</span>
          <button ref={closeButtonRef} type="button" aria-label="Cerrar menú" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </div>
        <nav aria-label="Navegación móvil">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate}>
              <span>{item.label}</span>
              <Icon name="arrow" size={19} />
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
