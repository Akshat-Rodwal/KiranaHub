import Container from '../common/Container.jsx';
import { announcement } from '../../data/mock.jsx';

export default function AnnouncementStrip() {
  const Icon = announcement.icon;

  return (
    <div className="bg-brand-900 text-white">
      <Container>
        <div className="flex h-9 items-center justify-center gap-2 text-center text-[11px] font-medium sm:text-xs">
          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-300" />
          <span className="truncate">{announcement.message}</span>
          <span className="hidden shrink-0 text-brand-300 sm:inline" aria-hidden="true">
            •
          </span>
          <span className="hidden shrink-0 text-brand-200 sm:inline">{announcement.code}</span>
        </div>
      </Container>
    </div>
  );
}
