import type { Tenant } from '@/lib/tenants';

function Mark({ slug }: { slug: Tenant['slug'] }) {
  if (slug === 'gunplajunkies') {
    return (
      <svg width="22" height="20" viewBox="0 0 22 20" aria-hidden="true" className="shrink-0">
        <path
          d="M11 2.2 4.4 6v8L11 17.8 17.6 14V6L11 2.2Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        <path d="M11 5.6 7.2 7.8v4.4L11 14.4l3.8-2.2V7.8L11 5.6Z" fill="currentColor" />
        <path d="M5 4 2 2M17 4l3-2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <path d="M10 2v16" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 6.5 5 3.5v13l5-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="m10 6.5 5-3v13l-5-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="10" cy="2" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ tenant }: { tenant: Tenant }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark slug={tenant.slug} />
      <span className="text-[17px] font-semibold tracking-[-0.03em]">{tenant.name}</span>
    </span>
  );
}
