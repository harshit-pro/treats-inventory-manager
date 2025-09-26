import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, LoginRequest, User } from '@/lib/api';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response: any) => {
      const payload = response?.data ?? {};
      const nested = payload?.data ?? {};

      const token: string | undefined =
        payload.token || payload.jwt || payload.accessToken || nested.token || nested.jwt || nested.accessToken;

      const rawUser: any =
        payload.user || nested.user || payload.account || payload.profile || nested.account || nested.profile;

      // Normalize user shape to our expected User type
      const normalizedRoleRaw = (rawUser?.role ?? rawUser?.authorities?.[0]?.authority ?? '').toString();
      const normalizedRole = normalizedRoleRaw === 'ROLE_ADMIN' ? 'ADMIN' : normalizedRoleRaw === 'ROLE_USER' ? 'USER' : normalizedRoleRaw;

      let normalizedUser: User | null = rawUser
        ? {
          id: (rawUser.id ?? rawUser.userId ?? rawUser._id ?? '').toString(),
          username: rawUser.username ?? rawUser.name ?? (rawUser.email ? String(rawUser.email).split('@')[0] : 'user'),
          email: rawUser.email ?? '',
          role: normalizedRole === 'ADMIN' ? 'ADMIN' : 'USER',
        }
        : null;

      // If backend returned only token (your case), derive user from JWT and form input
      if (token && !normalizedUser) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            const jwtPayload = JSON.parse(decodeURIComponent(escape(payloadStr)));
            const roles: string[] = jwtPayload.roles || jwtPayload.authorities || [];
            const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
            normalizedUser = {
              id: jwtPayload.sub || jwtPayload.userId || 'me',
              username: formData.username,
              email: jwtPayload.email || '',
              role: isAdmin ? 'ADMIN' : 'USER',
            };
          }
        } catch (_) {
          console.log('Error decoding JWT', _);
          // ignore decode errors; will fall back to error toast below
        }
      }

      // Final fallback: if we have a token but still no user, assume basic USER role
      if (token && !normalizedUser) {
        normalizedUser = {
          id: 'me',
          username: formData.username,
          email: '',
          role: 'USER',
        };
      }

      if (!token || !normalizedUser) {
        toast({
          title: 'Login succeeded but response was unexpected',
          description: 'Could not extract user session from server response',
          variant: 'destructive',
        });
        return;
      }

      login(token, normalizedUser);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to Sweet Shop',
        className: 'bg-success text-success-foreground',
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card animate-scale-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold gradient-text">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your Sweet Shop account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="transition-all duration-200 focus:shadow-soft"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pr-10 transition-all duration-200 focus:shadow-soft"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-card"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="animate-shimmer">Signing in...</div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;