// Импорт необходимых зависимостей
import axios from 'axios';
import { refreshAccessToken } from '../../utils/access-token';
import { verifyAccessToken } from '../../utils/verify-token';
/**
 * Функция получает количество холодильников с сервера.
 * @param {function} setFridgeCount - Функция для установки количества холодильников в состояние компонента.
 */
const fetchFridgeCount = async () => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);
  
      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          throw new Error('Unable to refresh access token');
        }
        localStorage.setItem('accessToken', accessToken);
      }
  
      const response = await axios.get('https://www.shecker-admin.com/api/fridge/admin/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      return response.data.length; // Возвращаем количество холодильников
    } catch (error) {
      console.error('Error fetching fridge data:', error);
      return 0; // В случае ошибки возвращаем 0
    }
  };  

// Экспорт функции для использования в других частях приложения
export { fetchFridgeCount };
