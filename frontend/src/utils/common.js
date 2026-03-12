const siteUrl = (import.meta.env.VITE_SITE_URL || '/').trim();

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const redirect = (url) => {

    let newurl=siteUrl+url;
 
    const redirectTo = /^https?:\/\//i.test(newurl)
            ? newurl
            : new URL(newurl || '/', window.location.origin).toString();
        localStorage.removeItem('user');
        window.location.replace(redirectTo);
}

export const calculateSum = (a, b) => a + b;