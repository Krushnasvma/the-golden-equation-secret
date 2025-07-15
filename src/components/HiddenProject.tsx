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
    // Check connection and handle errors
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
    // Don't render error page - errors should be shown on calculator display
    handleBack();
    return null;
  }

  return (
    <div className="hidden-portal">
      {/* Compact Professional Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="flex items-center justify-between px-3 py-2 h-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
            title="Back to Calculator"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="text-xs text-muted-foreground font-medium tracking-wide">SECURE SESSION</div>
        </div>
      </nav>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen pt-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      )}

      {/* Project iframe */}
      {!isLoading && !error && (
        <iframe
          src={projectUrl}
          className="w-full h-screen border-0 pt-10"
          style={{ 
            height: 'calc(100vh - 2.5rem)',
            background: 'transparent'
          }}
          title="Hidden Project"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          loading="lazy"
          onLoad={(e) => {
            const iframe = e.currentTarget;
            try {
              // Check if iframe loaded successfully by checking its content
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc?.title.includes('404') || 
                  iframeDoc?.title.includes('Not Found') ||
                  iframeDoc?.body?.innerText?.includes('deployment cannot be found') ||
                  iframeDoc?.body?.innerText?.includes('404')) {
                setError('Project not found');
                return;
              }
            } catch (e) {
              // Cross-origin iframe - assume it loaded if no error
            }
            setIsLoading(false);
          }}
          onError={() => setError('Failed to load project')}
        />
      )}
    </div>
  );
};