import React from 'react';
import { Zap, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-white/10 mt-16 py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dust-cyan to-dust-blue flex items-center justify-center text-midnight-950 font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-base">DUSTify</span>
            <p className="text-xs text-slate-400">Gasless & Fee-Abstraction Infrastructure for Midnight Network</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-dust-cyan transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-dust-cyan transition-colors flex items-center gap-1"
          >
            <span>Midnight Network</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://api-preview.1am.xyz/api/v4/graphql"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-dust-cyan transition-colors flex items-center gap-1"
          >
            <span>Preview Indexer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="text-xs font-mono text-slate-500">
          MIT License &bull; 2026 Level 4 Submission
        </div>
      </div>
    </footer>
  );
};
