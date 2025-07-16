import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface HiddenProjectProps {
  onBack: () => void;
  projectUrl: string;
}

export const HiddenProject = ({ onBack, projectUrl }: HiddenProjectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proxyUrl, setProxyUrl] = useState<string>('');

  useEffect(() => {
    // Clear history and replace current state to hide the URL
    window.history.replaceState(null, '', '/calculator');
    
    // Create a blob URL to hide the original URL from browser history
    const createProxyUrl = () => {
      const proxyHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; overflow: hidden; }
              iframe { width: 100vw; height: 100vh; border: none; }
            </style>
            <script>
              // Prevent back button and history access
              history.pushState(null, null, location.href);
              window.onpopstate = function () {
                history.go(1);
              };
              
              // Clear any traces in console/dev tools
              if (typeof console !== 'undefined') {
                ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
                  const original = console[method];
                  console[method] = function(...args) {
                    if (!args.some(arg => String(arg).includes('${projectUrl}'))) {
                      original.apply(console, args);
                    }
                  };
                });
              }
            </script>
          </head>
          <body>
            <iframe src="${projectUrl}" 
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-top-navigation-by-user-activation"
                    style="width: 100%; height: 100%; border: none;"></iframe>
          </body>
        </html>
      `;
      
      const blob = new Blob([proxyHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setProxyUrl(url);
    };

    const timer = setTimeout(() => {
      if (!navigator.onLine) {
        setError('No internet connection');
      } else {
        createProxyUrl();
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (proxyUrl) {
        URL.revokeObjectURL(proxyUrl);
      }
    };
  }, [projectUrl]);

  useEffect(() => {
    // Disable right-click context menu and developer tools
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common developer tools shortcuts
      if (
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) || // View source
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || // Dev tools
        (e.key === 'F12') || // Dev tools
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || // Console
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) // Console
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Additional privacy protection
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(state, title, url) {
      if (!String(url).includes(projectUrl)) {
        originalPushState.call(window.history, state, title, url);
      }
    };
    
    window.history.replaceState = function(state, title, url) {
      if (!String(url).includes(projectUrl)) {
        originalReplaceState.call(window.history, state, title, url);
      }
    };
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [projectUrl]);

  const handleBack = () => {
    // Clear browser history entries
    const clearHistory = () => {
      try {
        // Clear forward/back history
        window.history.replaceState(null, '', '/');
        
        // Clear any stored references
        if (proxyUrl) {
          URL.revokeObjectURL(proxyUrl);
        }
        
        // Clear browser data
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
          });
        }
      } catch (e) {
        // History manipulation might fail in some cases
      }
    };

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
    
    clearHistory();
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
          <div className="text-xs text-muted-foreground font-medium tracking-wide">@Developed by Krushna Soni</div>
        </div>
      </nav>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-screen pt-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      )}

      {/* Project iframe with privacy protection */}
      {!isLoading && !error && proxyUrl && (
        <iframe
          src={proxyUrl}
          className="w-full h-full border-0 absolute top-10 left-0"
          style={{ 
            width: '100vw',
            height: 'calc(100vh - 2.5rem)',
            background: 'transparent'
          }}
          title="Secure Content"
          sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-top-navigation-by-user-activation"
          loading="lazy"
          onLoad={() => {
            setIsLoading(false);
            // Additional history cleanup after load
            setTimeout(() => {
              window.history.replaceState(null, '', '/calculator');
            }, 100);
          }}
          onError={() => setError('Failed to load content')}
        />
      )}
    </div>
  );
};