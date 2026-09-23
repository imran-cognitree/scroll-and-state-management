import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { login, signup, setToken, clearToken, isLoggedIn, isAdmin, getStoredRole } from '../lib/api';
import { LoginSchema, SignupSchema } from '../lib/schemas';
import type { LoginInput, SignupInput } from '../lib/schemas';

type LoginResult = Awaited<ReturnType<typeof login>>;
type SignupResult = Awaited<ReturnType<typeof signup>>;

interface UseAuthReturn {
  loginMutation: UseMutationResult<LoginResult, Error, LoginInput>;
  signupMutation: UseMutationResult<SignupResult, Error, SignupInput>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdminUser: boolean;
  role: string | null;
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      LoginSchema.parse(credentials);
      const token = await login(credentials);
      setToken(token.access_token);
      return token;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (input: SignupInput) => {
      SignupSchema.parse(input);
      const user = await signup(input);
      return user;
    },
  });

  const logout = () => {
    clearToken();
    queryClient.clear();
  };

  return {
    loginMutation,
    signupMutation,
    logout,
    isAuthenticated: isLoggedIn(),
    isAdminUser: isAdmin(),
    role: getStoredRole(),
  };
}
