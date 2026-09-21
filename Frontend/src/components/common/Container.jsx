import { classNames } from '../../utils/index.js';

export default function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={classNames('container-x', className)} {...rest}>
      {children}
    </Tag>
  );
}
