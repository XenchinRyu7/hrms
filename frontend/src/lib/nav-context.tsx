import React, { createContext, useContext, useState, useEffect } from "react";

interface NavContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const NavContext = createContext<NavContextType>({
  currentPath: "/",
  navigate: () => {},
});

export function NavProvider({
  children,
  initialPath = "/",
  currentPath: propCurrentPath,
}: {
  children: React.ReactNode;
  initialPath?: string;
  currentPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState(
    propCurrentPath || initialPath,
  );

  useEffect(() => {
    if (propCurrentPath) {
      setCurrentPath(propCurrentPath);
    }
  }, [propCurrentPath]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updatePath = () => {
        setCurrentPath(
          window.location.pathname || propCurrentPath || initialPath,
        );
      };
      // Sync on mount
      updatePath();

      window.addEventListener("popstate", updatePath);
      document.addEventListener("astro:page-load", updatePath);
      return () => {
        window.removeEventListener("popstate", updatePath);
        document.removeEventListener("astro:page-load", updatePath);
      };
    }
  }, [initialPath, propCurrentPath]);

  const navigate = (path: string) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== path) {
        window.history.pushState({}, "", path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "instant" });
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
      !href.startsWith("http") &&
      !href.startsWith("//") &&
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
