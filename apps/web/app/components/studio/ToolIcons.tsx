import { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      aria-hidden
      {...props}
    />
  );
}

export function SelectIcon() {
  return (
    <Icon>
      <path d="M5 4 l10 6 -4 1 3 7 -3 1 -3 -7 -3 4 z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function RectIcon() {
  return (
    <Icon>
      <rect x="5" y="7" width="14" height="10" rx="3.5" />
    </Icon>
  );
}

export function CircleIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="6.5" />
    </Icon>
  );
}

export function DiamondIcon() {
  return (
    <Icon>
      <path d="M12 4 L20 12 L12 20 L4 12 Z" />
    </Icon>
  );
}

export function ArrowIcon() {
  return (
    <Icon>
      <path d="M5 19 L19 5" />
      <path d="M11 5 H19 V13" />
    </Icon>
  );
}

export function LineIcon() {
  return (
    <Icon>
      <path d="M5 19 L19 5" />
    </Icon>
  );
}

export function TextIcon() {
  return (
    <Icon>
      <path d="M6 7 H18" />
      <path d="M12 7 V18" />
    </Icon>
  );
}

export function PenIcon() {
  return (
    <Icon>
      <path d="M4 20 L8.5 18.5 L19 8 a2 2 0 0 0 0 -3 L17 3 a2 2 0 0 0 -3 0 L4.5 12.5 Z" />
    </Icon>
  );
}

export function LibraryIcon() {
  return (
    <Icon>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </Icon>
  );
}

export function TrashIcon() {
  return (
    <Icon>
      <path d="M5 8 H19" />
      <path d="M9 8 V6 H15 V8" />
      <path d="M8 8 L9 19 H15 L16 8" />
    </Icon>
  );
}

export function ClearIcon() {
  return (
    <Icon>
      <path d="M6 18 L18 6" />
      <path d="M8 6 H16 L18 10 H6 Z" />
    </Icon>
  );
}
