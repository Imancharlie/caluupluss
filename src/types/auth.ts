export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Add any other properties your user object might have
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} 