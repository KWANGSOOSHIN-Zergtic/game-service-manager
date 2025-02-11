'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, autoLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [autoLoginChecked, setAutoLoginChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAutoLogin = async () => {
      const success = await autoLogin();
      if (success) {
        router.push('/');
      }
    };
    
    checkAutoLogin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const loadingToast = toast.loading('로그인 중...');

    try {
      const success = await login({
        email: formData.username,
        password: formData.password,
        autoLogin: autoLoginChecked
      });

      if (!success) {
        toast.error('로그인에 실패했습니다.', {
          id: loadingToast,
          icon: '❌',
        });
        setError('로그인에 실패했습니다.');
        return;
      }

      toast.success('환영합니다!', {
        id: loadingToast,
        icon: '👋',
      });

      // 메인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      console.error('로그인 에러:', err);
      toast.error('로그인 처리 중 오류가 발생했습니다.', {
        id: loadingToast,
        icon: '⚠️',
      });
      setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <UserCog className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
          <CardDescription className="text-center">
            서비스 관리를 위해 로그인해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">관리자 ID</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="관리자 ID를 입력하세요"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoLogin"
                checked={autoLoginChecked}
                onCheckedChange={(checked) => setAutoLoginChecked(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="autoLogin"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                자동 로그인
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '관리자 로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 