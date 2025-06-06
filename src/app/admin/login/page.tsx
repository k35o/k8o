'use client';

import { Alert } from '@/components/alert';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { TextField } from '@/components/form/text-field';
import { Heading } from '@/components/heading';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="bg-bg-mute flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <Heading level={1} className="text-2xl font-bold">
              管理者ログイン
            </Heading>
            <p className="text-fg-mute mt-2">
              管理者アカウントでログインしてください
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="space-y-4">
            <TextField
              label="ユーザー名"
              value={formData.username}
              onChange={handleChange('username')}
              required
              autoComplete="username"
              disabled={isLoading}
            />

            <TextField
              label="パスワード"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={
              isLoading || !formData.username || !formData.password
            }
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
