import axios from 'axios';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';



import AssortmentCard from './assortment-card';
import AssortmentSort from './assortment-sort';
import AssortmentFilters from './assortment-filters';
import AssortmentCartWidget from './assortment-cart-widget';

// ----------------------------------------------------------------------

export default function AssortmentEdit() {
  const [openFilter, setOpenFilter] = useState(false);
  const [assortments, setAssortments] = useState([]);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  useEffect(() => {
    const fetchAssortments = async () => {
      try {
        const response = await axios.get('https://shecker-admin.com/api/fridge/1/products/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setAssortments(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchAssortments();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Изменить данные продукта название продукта
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
          <AssortmentFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
          />

          <AssortmentSort />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {assortments.map(({ assortment }) => (
          <Grid key={assortment.id} xs={12} sm={6} md={3}>
            <AssortmentCard assortment={assortment} />
          </Grid>
        ))}
      </Grid>

      <AssortmentCartWidget />
    </Container>
  );
}
