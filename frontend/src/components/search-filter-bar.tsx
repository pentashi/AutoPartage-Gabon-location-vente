"use client";

import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: FilterOption[];
  className?: string;
}

export function SearchFilterBar({
  searchPlaceholder = "Rechercher...",
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions = [],
  className
}: SearchFilterBarProps) {
  const hasActiveFilters = searchQuery !== "" || (statusFilter && statusFilter !== "");

  const handleReset = () => {
    onSearchChange("");
    if (onStatusChange) onStatusChange("");
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 mb-6", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {onStatusChange && (
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-400 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Effacer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
