import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext({ open: false, setOpen: () => {} });

export function CommandProvider({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useCommand() {
  return useContext(Ctx);
}
