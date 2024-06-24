import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Iconify from 'src/components/iconify';
import FridgeCard from '../fridge-card';
import FridgeSort from '../fridge-sort'; // Import FridgeSort component

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

// Function to fetch refrigerators
const fetchFridges = async (setFridges) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);
    
    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://shecker-admin.com/api/fridge/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    setFridges(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error fetching refrigerators: No response received');
    } else {
      console.error('Error fetching refrigerators:', error.message);
    }
  }
};

export default function FridgeView() {
  const [fridges, setFridges] = useState([]);
  const [sortedFridges, setSortedFridges] = useState([]);
  const [sortType, setSortType] = useState('availability');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFridges(setFridges);
  }, []);

  const handleSort = useCallback((event) => {
    const selectedSortType = event.target.value;
    setSortType(selectedSortType);
  
    const sorted = [...fridges].sort((a, b) => {
      if (selectedSortType === 'number') {
        return parseInt(a.account, 10) - parseInt(b.account, 10);
      }
      if (selectedSortType === 'availability') {
        if (a.isAvailable === b.isAvailable) {
          return parseInt(a.account, 10) - parseInt(b.account, 10);
        }
        return a.isAvailable ? -1 : 1;
      }
      if (selectedSortType === 'address') {
        return a.address.localeCompare(b.address);
      }
      if (selectedSortType === 'owner') {
        return a.owner?.localeCompare(b.owner) || 0;
      }
      return 0;
    });
  
    setSortedFridges(sorted);
  }, [fridges]);

  const handleManageClick = (fridgeId) => {
    navigate(`/fridge-detail/${fridgeId}`);
  };

  useEffect(() => {
    handleSort({ target: { value: 'availability' } });
  }, [fridges, handleSort]);

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Холодильники</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          Добавить
        </Button>
      </Stack>

      <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <FridgeSort 
          options={[
            { value: 'number', label: 'По номеру' },
            { value: 'availability', label: 'По доступности' },
            { value: 'address', label: 'По адресу' },
            { value: 'owner', label: 'По владельцу' },
          ]}
          onSort={handleSort}
          value={sortType}
        />
      </Stack>

      {sortedFridges.length > 0 ? (
        <Grid container spacing={1}>
          {sortedFridges.map((fridge, index) => (
            <FridgeCard
              key={fridge.account}
              fridge={{
                ...fridge,
                id: fridge.account,
              }}
              index={index}
              onManageClick={() => handleManageClick(fridge.account)}
            />
          ))}
        </Grid>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50vh">
          <img src="./assets/fridge.png" alt="No fridges" style={{ width: '150px', height: '150px' }} />
          <Typography variant="h4" align="center" mt={5}>
            У вас нет зарегистрированных холодильников
          </Typography>
        </Box>
      )}
    </Container>
  );
}
