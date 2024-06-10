import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';

// Function to refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('https://shecker-admin.com/api/auth/sign-in/refresh', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Function to verify access token
const verifyAccessToken = async (token) => {
  try {
    await axios.post('https://shecker-admin.com/api/auth/sign-in/verify', {
      token,
    });
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Function to fetch fridge details
const fetchFridgeDetails = async (account, setFridgeDetails) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get(`https://shecker-admin.com/api/fridge/admin/${account}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    setFridgeDetails(response.data);
  } catch (error) {
    console.error('Error fetching fridge details:', error);
  }
};

// Function to fetch products
const fetchProducts = async (setProducts) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://shecker-admin.com/api/product/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    setProducts(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Function to update fridge products
const updateFridgeProducts = async (account, fridgeProducts) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    await axios.put(`https://shecker-admin.com/api/fridge/admin/${account}/`, {
      fridge_products: fridgeProducts,
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    alert('Продукты обновлены успешно');
  } catch (error) {
    console.error('Error updating fridge products:', error);
  }
};

export default function FridgeProducts() {
  const { account } = useParams();
  const navigate = useNavigate();
  const [fridgeDetails, setFridgeDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [fridgeProducts, setFridgeProducts] = useState([]);

  useEffect(() => {
    fetchFridgeDetails(account, setFridgeDetails);
    fetchProducts(setProducts);
  }, [account]);

  useEffect(() => {
    if (fridgeDetails) {
      setFridgeProducts(fridgeDetails.fridge_products || []);
    }
  }, [fridgeDetails]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...fridgeProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    setFridgeProducts(updatedProducts);
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find(product => product.id === productId);
    const updatedProducts = [...fridgeProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: selectedProduct,
    };
    setFridgeProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setFridgeProducts([...fridgeProducts, { id: null, quantity: 0, product: {} }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = fridgeProducts.filter((_, i) => i !== index);
    setFridgeProducts(updatedProducts);
  };

  const handleSave = () => {
    updateFridgeProducts(account, fridgeProducts);
  };

  if (!fridgeDetails) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Управление продуктами в холодильнике {account}</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAddProduct}>
          Добавить продукт
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {fridgeProducts.map((product, index) => (
          <Grid item xs={12} key={index}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Select
                value={product.product.id || ''}
                onChange={(event) => handleProductSelect(index, event.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Выберите продукт</em>
                </MenuItem>
                {products.map((productOption) => (
                  <MenuItem key={productOption.id} value={productOption.id}>
                    {productOption.name} - {productOption.price} KZT
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Количество"
                type="number"
                value={product.quantity}
                onChange={(event) => handleProductChange(index, 'quantity', event.target.value)}
              />
              <Button variant="contained" color="error" onClick={() => handleRemoveProduct(index)}>
                Удалить
              </Button>
            </Stack>
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
        Сохранить изменения
      </Button>
    </Container>
  );
}
