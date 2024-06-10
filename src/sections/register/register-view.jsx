import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
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

export default function RegisterView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, company, password, password2 } = formData;
  
    // Validate form data
    const newErrors = {};
    if (!email) newErrors.email = 'Эл. почта обязательна';
    if (!company) newErrors.company = 'Название предприятия обязательно';
    if (!password) newErrors.password = 'Пароль обязателен';
    if (password !== password2) newErrors.password2 = 'Пароли не совпадают';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      const response = await fetch('https://shecker-admin.com/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, company, password, password2 })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store the email and company name in localStorage
        localStorage.setItem('email', data.email);
        localStorage.setItem('company', data.company);
        navigate('/verification');
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  

  const renderForm = (
    <Box>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Эл. почта"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          name="company"
          label="Название предприятия"
          value={formData.company}
          onChange={handleChange}
          error={!!errors.company}
          helperText={errors.company}
        />
        <TextField
          name="password"
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
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
        <TextField
          name="password2"
          label="Повторите пароль"
          type={showPassword ? 'text' : 'password'}
          value={formData.password2}
          onChange={handleChange}
          error={!!errors.password2}
          helperText={errors.password2}
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
        <Link variant="subtitle2" underline="hover" onClick={() => navigate('/forgot-password')}>
          Забыли пароль?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleSubmit}
      >
        Регистрация
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
      <Stack alignItems="center" justifyContent="center" sx={{ mx: 2, height: 1 }}>
        <LogoFlat
          sx={{
            mb: 4,
          }}
        />

        <Card
          sx={{
            p: 4,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Регистрация</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Уже есть аккаунт?
            <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => navigate('/login')}>
              Войти
            </Link>
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
