import axios from 'axios';
import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from 'src/firebase_config'; // Adjust the path according to your file structure

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';

import AssortmentCard from '../assortment-card';

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

// Function to fetch a Assortment by ID
const fetchAssortmentById = async (id) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get(`https://shecker-admin.com/api/product/admin/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Function to fetch all products
const fetchAssortments = async (setAssortments) => {
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
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const AssortmentsWithDetails = await Promise.all(response.data.map(async (assortment) => {
      const assortmentDetails = await fetchAssortmentById(assortment.id);
      return { ...assortment, ...assortmentDetails };
    }));

    setAssortments(AssortmentsWithDetails);
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error fetching products: No response received');
    } else {
      console.error('Error fetching products:', error.message);
    }
  }
};

// Function to add a new product
const addAssortment = async (assortmentData, setAssortments, handleCloseAddModal) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.post('https://shecker-admin.com/api/product/admin/', assortmentData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    setAssortments(prevAssortments => [...prevAssortments, response.data]);
    handleCloseAddModal();
  } catch (error) {
    console.error('Error adding product:', error);
    if (error.response && error.response.data.detail) {
      console.error('Server response:', error.response.data.detail);
    }
  }
};

// Function to delete a product
const deleteAssortment = async (id, setAssortments) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    await axios.delete(`https://shecker-admin.com/api/product/admin/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    setAssortments(prevAssortments => prevAssortments.filter(assortment => assortment.id !== id));
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.response && error.response.data.detail) {
      console.error('Server response:', error.response.data.detail);
    }
  }
};

// ----------------------------------------------------------------------

export default function AssortmentView() {
  const [assortments, setAssortments] = useState([]);
  const [selectedAssortment, setSelectedAssortment] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
  });

  useEffect(() => {
    fetchAssortments(setAssortments);
  }, []);

  const handleDeleteAssortment = (id) => {
    deleteAssortment(id, setAssortments);
  };

  const handleEditAssortment = async (assortment) => {
    const assortmentDetails = await fetchAssortmentById(assortment.id);
    if (assortmentDetails) {
      setSelectedAssortment(assortmentDetails);
      setFormData({
        name: assortmentDetails.name,
        description: assortmentDetails.description,
        price: assortmentDetails.price,
        image: assortmentDetails.image,
      });
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAssortment(null);
    setImageFile(null);
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
    });
    setImageFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdateAssortment = async () => {
    let imageUrl = formData.image;

    if (imageFile) {
      const storageRef = ref(storage, `products/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          console.log('Upload is in progress...');
        },
        (error) => {
          console.error('Error uploading image:', error);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Image URL:', imageUrl); // Log the image URL for debugging
          await updateAssortment(imageUrl);
        }
      );
    } else {
      await updateAssortment(imageUrl);
    }
  };

  const handleAddAssortment = async () => {
    let imageUrl = '';

    if (imageFile) {
      const storageRef = ref(storage, `products/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          console.log('Upload is in progress...');
        },
        (error) => {
          console.error('Error uploading image:', error);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Image URL:', imageUrl); // Log the image URL for debugging
          const assortmentData = { ...formData, image: imageUrl };
          await addAssortment(assortmentData, setAssortments, handleCloseAddModal);
        }
      );
    } else {
      const assortmentData = { ...formData, image: imageUrl };
      await addAssortment(assortmentData, setAssortments, handleCloseAddModal);
    }
  };

  const updateAssortment = async (imageUrl) => {
    try {
      let accessToken = localStorage.getItem('accessToken');
      const isTokenValid = await verifyAccessToken(accessToken);

      if (!isTokenValid) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          throw new Error('Unable to refresh access token');
        }
      }

      await axios.patch(`https://shecker-admin.com/api/product/admin/${selectedAssortment.id}`, {
        ...formData,
        image: imageUrl,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      fetchAssortments(setAssortments);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response && error.response.data.detail) {
        console.error('Server response:', error.response.data.detail);
      }
    }
  };

  return (
    <Container>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h4">
          Продукты
        </Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenAddModal}>
          Добавить продукт
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {assortments.map((assortment) => (
          <Grid key={assortment.id} xs={12} sm={6} md={3}>
            <AssortmentCard assortment={assortment} onDelete={handleDeleteAssortment} onEdit={() => handleEditAssortment(assortment)} />
          </Grid>
        ))}
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <div style={{ padding: 20, backgroundColor: 'white', borderRadius: 8, width: '400px', margin: 'auto', marginTop: '10%' }}>
          <Typography variant="h6" gutterBottom>
            Изменить данные продукта
          </Typography>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input type="file" hidden onChange={handleImageChange} />
          </Button>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateAssortment}>Save</Button>
          </Stack>
        </div>
      </Modal>

      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <div style={{ padding: 20, backgroundColor: 'white', borderRadius: 8, width: '400px', margin: 'auto', marginTop: '10%' }}>
          <Typography variant="h6" gutterBottom>
            Добавить продукт
          </Typography>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input type="file" hidden onChange={handleImageChange} />
          </Button>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button variant="contained" onClick={handleAddAssortment}>Add</Button>
          </Stack>
        </div>
      </Modal>
    </Container>
  );
}
