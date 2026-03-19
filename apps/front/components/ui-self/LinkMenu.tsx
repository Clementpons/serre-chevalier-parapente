import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LinkMenuProps {
  label: string;
  title: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
  target?: string;
}

export default function LinkMenu({
  label,
  title,
  href,
  active,
  icon,
  target,
}: LinkMenuProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      title={title}
      className={`
            flex items-center gap-2 p-2 rounded-md hover:bg-slate-950/5 text-slate-950 transition cursor-pointer
            ${pathname.includes(href) ? "bg-slate-950/5" : ""}
            ${active ? "bg-slate-950/5" : ""}
        `}
      target={target}
    >
      {icon && icon}
      <span>{label}</span>
    </Link>
  );
}
