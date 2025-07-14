import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface HiddenProjectProps {
  onBack: () => void;
  projectUrl: string;
}

export const HiddenProject = ({ onBack, projectUrl }: HiddenProjectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading and connection check
    const timer = setTimeout(() => {
      if (!navigator.onLine) {
        setError('No internet connection');
      } else {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleBack = () => {
    // Clear any stored data/tokens
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cache if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    onBack();
  };

  if (error) {
    return (
      <div className="hidden-portal">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 text-destructive">⚠️</div>
            <div className="text-xl mb-4">Connection Error</div>
            <div className="text-muted-foreground mb-8">{error}</div>
            <button
              onClick={handleBack}
              className="calc-button px-6 py-2 text-sm"
            >
              Return to Calculator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden-portal">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 calc-button p-3 rounded-full"
        title="Back to Calculator"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Developer Watermark */}
      <div className="watermark">
        @developed by Krushna Soni
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <div className="text-lg">Loading secure project...</div>
          </div>
        </div>
      )}

      {/* Project iframe */}
      {!isLoading && !error && (
        <iframe
          src={projectUrl}
          className="w-full h-screen border-0"
          title="Hidden Project"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => setError('Failed to load project')}
        />
      )}
    </div>
  );
};