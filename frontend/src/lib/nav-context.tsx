import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const NavContext = createContext<NavContextType>({
  currentPath: '/',
  navigate: () => {},
});

export function NavProvider({
  children,
  initialPath = '/',
}: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState(initialPath);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sync with real browser path on mount
      setCurrentPath(window.location.pathname || initialPath);

      const onPopState = () => {
        setCurrentPath(window.location.pathname);
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }
  }, [initialPath]);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <NavContext.Provider value={{ currentPath, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}

export function NavLink({
  href,
  children,
  className,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useNav();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      href &&
      !href.startsWith('http') &&
      !href.startsWith('//') &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
