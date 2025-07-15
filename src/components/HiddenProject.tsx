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
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="calc-button p-2 rounded-full"
            title="Back to Calculator"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm text-muted-foreground">Secure Project</div>
        </div>
      </nav>

      {/* Developer Watermark */}
      <div className="watermark">
        @developed by Krushna Soni
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen pt-16">
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
          className="w-full h-screen border-0 pt-16"
          style={{ 
            height: 'calc(100vh - 4rem)',
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