import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { createSystemAdmin, updateSystemAdmin } from '../services/api';

const ROLES = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'USER', label: 'Пользователь' }
];

const CreateAdminDialog = ({ open, onClose, onAdminCreated, onAdminUpdated, adminToEdit }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    is_active: true,
    role: 'USER'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (adminToEdit) {
      setFormData({
        id: adminToEdit.id,
        username: adminToEdit.username,
        firstName: adminToEdit.firstName,
        lastName: adminToEdit.lastName,
        is_active: adminToEdit.is_active,
        role: adminToEdit.role
      });
    } else {
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        is_active: true,
        role: 'USER'
      });
    }
  }, [adminToEdit, open]);

  const handleSubmit = async () => {
    try {
      if (!formData.firstName || !formData.lastName || (!adminToEdit && !formData.username)) {
        setError('Все поля обязательны для заполнения');
        return;
      }

      let response;
      if (adminToEdit) {
        response = await updateSystemAdmin(formData);
        onAdminUpdated(response);
      } else {
        response = await createSystemAdmin(formData);
        onAdminCreated(response);
      }
      
      onClose();
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        is_active: true,
        role: 'USER'
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('У вас нет прав для управления администраторами');
      } else {
        setError(adminToEdit ? 'Не удалось обновить администратора' : 'Не удалось создать администратора');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{adminToEdit ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {!adminToEdit && (
            <TextField
              fullWidth
              label="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}

          <TextField
            fullWidth
            label="Имя"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Фамилия"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={formData.role}
              label="Роль"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Активный пользователь"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.firstName || !formData.lastName || (!adminToEdit && !formData.username)}
        >
          {adminToEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAdminDialog;