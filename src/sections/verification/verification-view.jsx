import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { bgGradient } from 'src/theme/css';
import LogoFlat from 'src/components/logo-flat';

export default function VerificationView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem('email') || '',
    verificationCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, verificationCode } = formData;

    // Validate form data
    const newErrors = {};
    if (!verificationCode) newErrors.verificationCode = 'Код подтверждения обязателен';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://shecker-admin.com/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, verificationCode })
      });

      setIsLoading(false);

      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Verification failed:', error);
    }
  };

  const renderForm = (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h6" textAlign="center">
          Введите код подтверждения, отправленный на {formData.email}
        </Typography>
        <TextField
          name="verificationCode"
          label="Код подтверждения"
          value={formData.verificationCode}
          onChange={handleChange}
          error={!!errors.verificationCode}
          helperText={errors.verificationCode}
        />
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleSubmit}
        loading={isLoading}
        sx={{ mt: 3 }}
      >
        Подтвердить
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
          <Typography variant="h4" textAlign="center" mb={2}>
            Подтверждение почты
          </Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
