import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from 'src/firebase_config'; // Импорт без расширения

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';


// ----------------------------------------------------------------------

export default function ShopProductCard({ product, onDelete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [uploading, setUploading] = useState(false);

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.patch(`https://shecker-admin.com/api/product/admin/${product.id}/`, editedProduct, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      handleEditClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.delete(`https://shecker-admin.com/api/product/admin/${product.id}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      onDelete(product.id); // Notify parent component to remove the product from the list
      handleDeleteClose();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `products/${file.name}`);
    
    setUploading(true);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditedProduct((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderImg = (
    <Box
      component="img"
      alt={product.name}
      src={product.image}
      sx={{
        maxHeight: 200, // ограничиваем высоту изображения
        maxWidth: '100%',
        objectFit: 'cover',
        margin: 'auto', // выравнивание изображения по центру
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1" style={{fontSize: '20px'}}>
      {(product.price)} KZT
    </Typography>
  );

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
        {renderImg}
      </Box>
      <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="body2" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" noWrap>
          {product.description}
        </Typography>
        {renderPrice}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="warning" onClick={handleEditOpen} fullWidth>
            Изменить
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteOpen} fullWidth>
            Удалить
          </Button>
        </Stack>
      </Stack>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Изменить данные продукта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To edit this product, please modify the fields below.
          </DialogContentText>
          <TextField
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            variant="standard"
            value={editedProduct.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="standard"
            value={editedProduct.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            variant="standard"
            value={editedProduct.price}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="image"
            label="Image URL"
            type="text"
            fullWidth
            variant="standard"
            value={editedProduct.image}
            onChange={handleChange}
            InputProps={{
              readOnly: true,
            }}
          />
          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload Image'}
            <input
              type="file"
              hidden
              onChange={handleUpload}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};
