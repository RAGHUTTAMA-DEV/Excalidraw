export const paths = {
  home: "/",
  login: "/login",
  signup: "/signup",
  rooms: "/rooms",
  room: (id: string | number) => `/rooms/${id}`,
} as const;
