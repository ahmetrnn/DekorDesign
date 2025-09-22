export interface IconProps {
  className?: string;
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 14.6 8.8 22 9.2l-5 4.5 1.6 7.1L12 17.8 5.4 20.8 7 13.7 2 9.2l7.4-.4Z" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5h16v14H4Z" fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d="M7 8a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8Zm11 9-4.5-6-3.5 4L8 13l-3 4h13Z" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 10 12 1H3v9l9 9 9-9Zm-14.5-4A1.5 1.5 0 1 0 6.5 3a1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3V3Zm3 3v11h11" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 14 8l6 .5-4.5 3.6L17 18 12 15l-5 3 1.5-5.9L4 8.5 10 8Z" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 7h4l2-2h4l2 2h4v12H4Zm8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z" />
    </svg>
  );
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 7h10v6a5 5 0 0 1-5 5H7V7Zm2-4h2v3H9V3Zm4 0h2v3h-2V3Z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4Z" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 4 6v6c0 5 3.4 9.7 8 10 4.6-.3 8-5 8-10V6Z" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 2H9l-.3 2.9a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2L.9 14.6l2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1L9 22h6l.3-2.9a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6Zm-7.4 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5h12a2 2 0 0 1 2 2v2.2l3-1.8v9.2l-3-1.8V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function StaffWithSparklesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Staff */}
      <path d="M11 2v20h2V2z" />
      <circle cx="12" cy="5" r="3" />
      {/* Sparkles */}
      <path d="M5 7l.5 1.5L7 9l-1.5.5L5 11l-.5-1.5L3 9l1.5-.5zm14 0l-.5 1.5L17 9l1.5.5L19 11l.5-1.5L21 9l-1.5-.5zM7 16l.5 1.5L9 18l-1.5.5L7 20l-.5-1.5L5 18l1.5-.5zm10 0l-.5 1.5L15 18l1.5.5L17 20l.5-1.5L19 18l-1.5-.5z" />
    </svg>
  );
}
