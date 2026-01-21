import { ExternalLink, BookOpen } from 'lucide-react';

export default function CatalogueLink({ url, className = '' }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-amber-500 hover:border-amber-500/50 transition-all group ${className}`}
    >
      <BookOpen className="w-5 h-5 text-amber-500" />
      <span>View in Interactive Catalogue</span>
      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
