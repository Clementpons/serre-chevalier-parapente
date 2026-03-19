export const apiPrefix = "/api";

export const isBlogRoute = (route: string): boolean => {
    return /^\/blog(\/.*)?$/.test(route);
  };