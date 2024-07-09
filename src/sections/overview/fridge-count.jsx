// Импорт необходимых зависимостей
import axios from 'axios';
import { refreshAccessToken } from '../../utils/access-token';
import { verifyAccessToken } from '../../utils/verify-token';
/**
 * Функция получает количество холодильников с сервера.
 * @param {function} setFridgeCount - Функция для установки количества холодильников в состояние компонента.
 */
const fetchFridgeCount = async (setFridgeCount) => {
  try {
    let accessToken = localStorage.getItem('accessToken'); // Получаем токен из локального хранилища
    const isTokenValid = await verifyAccessToken(accessToken); // Проверяем валидность токена

    if (!isTokenValid) {
      accessToken = await refreshAccessToken(); // Обновляем токен, если он не валиден
      if (!accessToken) {
        throw new Error('Unable to refresh access token'); // Выкидываем ошибку, если не удалось обновить токен
      }
      localStorage.setItem('accessToken', accessToken); // Сохраняем новый токен в локальное хранилище
    }

    const response = await axios.get('https://www.shecker-admin.com/api/fridge/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Добавляем токен в заголовок запроса
      },
    });

    setFridgeCount(response.data.length); // Устанавливаем количество холодильников, полученных из ответа сервера
  } catch (error) {
    console.error('Error fetching fridge data:', error); // Логируем ошибку, если запрос не удался
  }
};

// Экспорт функции для использования в других частях приложения
export { fetchFridgeCount };
