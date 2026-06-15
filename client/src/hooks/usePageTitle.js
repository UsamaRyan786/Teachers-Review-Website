import { useEffect } from 'react';
import { formatPageTitle } from '../config/site';

export default function usePageTitle(pageTitle) {
  useEffect(() => {
    document.title = formatPageTitle(pageTitle);
  }, [pageTitle]);
}
