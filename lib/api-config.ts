export const API_BASE_URL = "https://www.ryanfonseca.fr/b2lp/api";

export const ENDPOINTS = {
  billets:      "/billets",
  billetDetail: (id: string) => `/billets/${id}`,
  commentaires: "/commentaires",
  user:         "/user",
  login:        "/login",
  logout:       "/user/logout",
  register:     "/register",
} as const;
