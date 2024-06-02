// src/sections/LoginView.jsx
import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';
import { bgGradient } from 'src/theme/css';
import LogoFlat from 'src/components/logo-flat';
import Iconify from 'src/components/iconify';

export default function LoginView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://shecker-admin.com/api/auth/sign-in', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Verify token
      await axios.post('https://shecker-admin.com/api/auth/sign-in/verify', {
        token: access,
      });

      // Store tokens and username (you may want to use a more secure storage method)
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('username', username);

      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const renderForm = (
    <Box>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Эл. почта"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          name="password"
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        <Link variant="subtitle2" underline="hover">
          Забыли пароль?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleLogin}
      >
        Войти
      </LoadingButton>
    </Box>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ mx: 3, height: 1 }}>
        <LogoFlat
          sx={{
            mb: 5,
          }}
        />

        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Войти</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Нету аккаунта?
            <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={handleGetStarted}>
              Зарегистрироваться
            </Link>
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
