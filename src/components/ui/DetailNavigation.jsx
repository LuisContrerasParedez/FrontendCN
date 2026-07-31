import { Link } from 'react-router';
import Breadcrumbs from './Breadcrumbs';
import Icon from './Icon';

export default function DetailNavigation({ backTo, backLabel, items }) {
  return (
    <div className="container detail-page__breadcrumbs">
      <Link className="detail-back-link" to={backTo}>
        <span className="detail-back-link__icon" aria-hidden="true">
          <Icon name="chevronLeft" size={18} strokeWidth={2.2} />
        </span>
        <span>{backLabel}</span>
      </Link>
      <Breadcrumbs items={items} />
    </div>
  );
}
