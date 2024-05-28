import { useState, useEffect } from 'react';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import FridgeCard from '../fridge-card';
import FridgeSearch from '../fridge-search';
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
  
  useEffect(() => {
    fetchFridges(setFridges);
  }, []);

  useEffect(() => {
    setSortedFridges(fridges);
  }, [fridges]);

  const handleSort = (event) => {
    const sortType = event.target.value;

    const sorted = [...fridges].sort((a, b) => {
      if (sortType === 'number') {
        return a.account.localeCompare(b.account);
      }
      if (sortType === 'availability') {
        if (a.isAvailable === b.isAvailable) {
          return 0;
        }
        return a.isAvailable ? -1 : 1;
      }
      if (sortType === 'address') {
        return a.address.localeCompare(b.address);
      }
      if (sortType === 'owner') {
        return a.owner?.localeCompare(b.owner) || 0;
      }
      return 0;
    });

    setSortedFridges(sorted);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Холодильники</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          Добавить холодильник
        </Button>
      </Stack>

      <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
        <FridgeSearch fridge={fridges} />
        <FridgeSort 
          options={[
            { value: 'number', label: 'By Number' },
            { value: 'availability', label: 'By Availability' },
            { value: 'address', label: 'By Address' },
            { value: 'owner', label: 'By Owner' },
          ]}
          onSort={handleSort}
        />
      </Stack>

      <Grid container spacing={1}>
        {sortedFridges.map((fridge, index) => (
          <FridgeCard
            key={fridge.account}
            fridge={{
              ...fridge,
              id: fridge.account, // Assuming account corresponds to the index for Firebase path
            }}
            index={index}
          />
        ))}
      </Grid>
    </Container>
  );
}