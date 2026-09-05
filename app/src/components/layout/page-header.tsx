"use client";

import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

export interface PageHeaderCrumb {
  label?: string;
  labelKey?: string;
  href?: string;
}

interface PageHeaderProps {
  crumbs: PageHeaderCrumb[];
}

export function PageHeader({ crumbs }: PageHeaderProps) {
  const { t } = useApp();

  const resolved = crumbs.map((crumb) => ({
    ...crumb,
    label: crumb.label ?? (crumb.labelKey ? t(crumb.labelKey) : ""),
  }));

  return (
    <header
      className="page-header"
      aria-label={t("common.filAriane") ?? "Fil d'ariane"}
    >
      <nav className="page-header-crumb">
        {resolved.map((crumb, index) => {
          const isLast = index === resolved.length - 1;
          if (isLast) {
            return (
              <span
                key={index}
                className="page-header-crumb-current"
                aria-current="page"
              >
                {crumb.label}
              </span>
            );
          }
          return (
            <span key={index} className="page-header-crumb-group">
              {crumb.href ? (
                <Link href={crumb.href} className="page-header-crumb-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="page-header-crumb-link page-header-crumb-static">
                  {crumb.label}
                </span>
              )}
              <span className="page-header-crumb-sep" aria-hidden="true">
                <FaChevronRight size={10} />
              </span>
            </span>
          );
        })}
      </nav>
    </header>
  );
}