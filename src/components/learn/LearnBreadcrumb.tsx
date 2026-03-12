import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function LearnBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link
            href="/learn"
            className="text-[#3D5A3E] hover:text-[#1B5E20] transition-colors"
          >
            Learning Hub
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-[#3D5A3E]" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-[#3D5A3E] hover:text-[#1B5E20] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[#1B5E20]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
