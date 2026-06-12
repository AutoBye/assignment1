export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type ServerCurrentUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};
