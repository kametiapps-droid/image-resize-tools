import { useEffect } from "react";

const SITE_NAME = "Image Resize";
const BASE_TITLE = "Image Resize Tool - Resize Image In Second";

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | ${SITE_NAME}`
      : `${BASE_TITLE} | ${SITE_NAME}`;
    return () => {
      document.title = `${BASE_TITLE} | ${SITE_NAME}`;
    };
  }, [pageTitle]);
}
