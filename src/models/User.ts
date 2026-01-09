export type User = {
  _id: string;
  phone: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  profileMetadata: Record<string, string>;
  createdAt: Date;
};
