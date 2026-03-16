import { useEffect } from "react";

const BASE_TITLE = "SaloneMakitSL - Di Place Fo Shop";

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | SaloneMakitSL` : BASE_TITLE;
    return () => { document.title = BASE_TITLE; };
  }, [title]);
};
