export function EarthServiceIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="22" cy="42" r="20" fill="#9fa5a5" />
      <circle cx="78" cy="42" r="20" fill="#9fa5a5" />
      <circle cx="22" cy="42" r="11" fill="#f7f2e4" />
      <circle cx="78" cy="42" r="11" fill="#f7f2e4" />
      <ellipse cx="50" cy="52" rx="35" ry="32" fill="#aeb3b2" />
      <ellipse cx="37" cy="49" rx="5" ry="7" fill="#1f2524" />
      <ellipse cx="63" cy="49" rx="5" ry="7" fill="#1f2524" />
      <circle cx="38.5" cy="46.5" r="1.8" fill="#ffffff" />
      <circle cx="64.5" cy="46.5" r="1.8" fill="#ffffff" />
      <ellipse cx="50" cy="65" rx="10" ry="13" fill="#4c5151" />
      <path
        d="M70 20c5-10 13-14 23-12-2 10-8 16-20 17M71 21c8 0 14 3 18 9"
        fill="#82b65b"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KoalaStarIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="22" cy="46" r="20" fill="#9fa5a5" />
      <circle cx="78" cy="46" r="20" fill="#9fa5a5" />
      <circle cx="22" cy="46" r="11" fill="#f7f2e4" />
      <circle cx="78" cy="46" r="11" fill="#f7f2e4" />
      <ellipse cx="50" cy="56" rx="35" ry="32" fill="#aeb3b2" />
      <path d="M31 52c4 5 9 5 13 0M56 52c4 5 9 5 13 0" fill="none" stroke="#343a39" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="69" rx="10" ry="13" fill="#4c5151" />
      <path d="M25 18c14-11 36-12 51-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
      <path d="m20 9 2.5 5.5L28 17l-5.5 2.5L20 25l-2.5-5.5L12 17l5.5-2.5L20 9Zm62-5 1.8 4.2L88 10l-4.2 1.8L82 16l-1.8-4.2L76 10l4.2-1.8L82 4Z" fill="currentColor" />
    </svg>
  );
}
