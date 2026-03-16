import { useEffect } from "react";

const BASE_TITLE = "SaloneMakitSL - Di Place Fo Shop";
const BASE_DESC = "Shop men and women clothing, shoes, bags & perfumes with cash on delivery across all 16 districts in Sierra Leone.";

export const useDocumentTitle = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | SaloneMakitSL` : BASE_TITLE;

    const desc = description || BASE_DESC;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", desc);
    }

    return () => {
      document.title = BASE_TITLE;
      if (meta) meta.setAttribute("content", BASE_DESC);
    };
  }, [title, description]);
};
