import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-surface-300 py-6 mt-12 text-xs font-mono text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400 font-sans">
          <span className="font-bold text-zinc-200">DUSTify</span>
          <span>&bull;</span>
          <span>Zero-Friction DUST Relayer for Midnight</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://indexer.preview.midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <span>Preview Indexer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-zinc-600">MIT License</span>
        </div>
      </div>
    </footer>
  );
};
