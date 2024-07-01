import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { UilEditAlt } from '@iconscout/react-unicons';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

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

const FridgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fridgeDetails, setFridgeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // NEW: Track the type of modal ('product' or 'fridge')
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newAddress, setNewAddress] = useState(''); // NEW: State for new address
  const [newDescription, setNewDescription] = useState(''); // NEW: State for new description
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    
    const fetchFridgeDetails = async () => {
      setLoading(true);
      try {
        let accessToken = localStorage.getItem('accessToken');
        const isTokenValid = await verifyAccessToken(accessToken);

        if (!isTokenValid) {
          accessToken = await refreshAccessToken();
          if (!accessToken) {
            throw new Error('Unable to refresh access token');
          }
        }

        const response = await axios.get(`https://shecker-admin.com/api/fridge/admin/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setFridgeDetails(response.data);
      } catch (error) {
        console.error('Error fetching fridge details:', error);
      } finally {
        setLoading(false);
      }
    };

    

    fetchFridgeDetails();
  }, [id]);

  const handleOpenModal = (type, product = null) => {
    setModalType(type);
    if (type === 'product') {
      setCurrentProduct(product);
      setNewQuantity(product.quantity);
    } else if (type === 'fridge') {
      setNewAddress(fridgeDetails.address);
      setNewDescription(fridgeDetails.description);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentProduct(null);
  };

  const handleQuantityChange = (event) => {
    setNewQuantity(event.target.value);
  };

  const handleAddressChange = (event) => {
    setNewAddress(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setNewDescription(event.target.value);
  };

  const handleSaveQuantity = async () => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);

      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          throw new Error('Unable to refresh access token');
        }
      }

      await axios.patch(`https://shecker-admin.com/api/fridgeproduct/admin/${currentProduct.id}/`, {
        quantity: newQuantity,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      setFridgeDetails((prevDetails) => ({
        ...prevDetails,
        fridge_products: prevDetails.fridge_products.map((product) =>
          product.id === currentProduct.id ? { ...product, quantity: newQuantity } : product
        ),
      }));
      handleCloseModal();
      setSnackbarOpen(true); // Показать уведомление о принятии изменений
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  };

  const handleSaveFridgeDetails = async () => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);

      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          throw new Error('Unable to refresh access token');
        }
      }

      await axios.patch(`https://shecker-admin.com/api/fridge/admin/${id}/`, {
        address: newAddress,
        description: newDescription,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      setFridgeDetails((prevDetails) => ({
        ...prevDetails,
        address: newAddress,
        description: newDescription,
      }));
      handleCloseModal();
      setSnackbarOpen(true); // Показать уведомление о принятии изменений
    } catch (error) {
      console.error('Error updating fridge details:', error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${formattedDate} ${formattedTime}`;
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <IconButton onClick={() => navigate('/fridge')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" align="center">
          Холодильник ID: {fridgeDetails?.account}
        </Typography>
        <Box width={48} /> {/* Placeholder to keep the title centered */}
      </Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Адрес: {fridgeDetails?.address}
        </Typography>
        <IconButton onClick={() => handleOpenModal('fridge')}>
          <UilEditAlt color="inherit"/>
        </IconButton>
      </Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Описание: {fridgeDetails?.description}
        </Typography>
        <IconButton onClick={() => handleOpenModal('fridge')}>
          <UilEditAlt color="inherit"/>
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        {fridgeDetails.fridge_products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: '30%', padding: 0.5, marginRight: 1 }}
                image={product.product.image}
                alt={product.product.name}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                <CardContent sx={{ padding: 0, paddingLeft: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.product.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Количество: {product.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Последнее обновление:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(product.updated_at)}
                  </Typography>
                </CardContent>
               
              </Box>
              <IconButton
                  aria-label="edit"
                  onClick={() => handleOpenModal('product', product)}
                  sx={{ alignSelf: 'flex-end', color: 'primary.main' }}
                >
                  <UilEditAlt color="inherit" />
                </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modalType === 'product' ? 'Изменить количество' : 'Изменить адрес и описание'}
          </Typography>
          {modalType === 'product' ? (
            <TextField
              id="quantity"
              label="Количество"
              type="number"
              fullWidth
              value={newQuantity}
              onChange={handleQuantityChange}
              sx={{ mt: 2, mb: 2 }}
            />
          ) : (
            <>
              <TextField
                id="address"
                label="Адрес"
                type="text"
                fullWidth
                value={newAddress}
                onChange={handleAddressChange}
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                id="description"
                label="Описание"
                type="text"
                fullWidth
                value={newDescription}
                onChange={handleDescriptionChange}
                sx={{ mt: 2, mb: 2 }}
              />
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={modalType === 'product' ? handleSaveQuantity : handleSaveFridgeDetails}
          >
            Сохранить
          </Button>
        </Box>
      </Modal>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Изменения приняты
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default FridgeDetail;
