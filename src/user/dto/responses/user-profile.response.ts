export class UserProfileResponse {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
}
