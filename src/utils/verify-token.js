import axios from 'axios';


export const verifyAccessToken = async (token) => {
  console.log('Verifying token:', token); // Добавьте логирование для отслеживания значения токена
  try {
    const response = await axios.post('https://shecker-admin.com/api/auth/sign-in/verify', {
      token,
    });
    console.log('Token verification successful:', response.data);
    return true;
  } catch (error) {
    console.error('Error verifying token:', error.response ? error.response.data : error.message);
    return false;
  }
};

