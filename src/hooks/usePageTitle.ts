import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | Bot Fazendeiro` : 'Bot Fazendeiro';
    return () => {
      document.title = 'Bot Fazendeiro';
    };
  }, [title]);
}
