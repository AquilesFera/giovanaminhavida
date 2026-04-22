import { useEffect, useState } from "react";

const KEY = "mundinho.world_code";

export function getWorldCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setWorldCode(code: string) {
  localStorage.setItem(KEY, code);
  window.dispatchEvent(new Event("worldcodechange"));
}

export function clearWorldCode() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("worldcodechange"));
}

export function generateWorldCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 6) + 1;
  return s;
}

export function useWorldCode(): string | null {
  const [code, setCode] = useState<string | null>(() => getWorldCode());
  useEffect(() => {
    const upd = () => setCode(getWorldCode());
    window.addEventListener("worldcodechange", upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener("worldcodechange", upd);
      window.removeEventListener("storage", upd);
    };
  }, []);
  return code;
}