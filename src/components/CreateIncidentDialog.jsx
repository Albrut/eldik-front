import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { createIncident } from '../services/api';

const importanceLevels = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
];

const statuses = [
  { value: 'in_process', label: 'В работе' },
  { value: 'closed', label: 'Закрыто' }
];

const CreateIncidentDialog = ({ open, onClose, allAdmins, onIncidentCreated }) => {
  const [formData, setFormData] = useState({
    incident_description: '',
    usedSource: '',
    importance: 'low',
    workerId: '',
    status: 'in_process',
    solution: '',
    note: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const incidentData = {
        ...formData,
        incidentDate: new Date().toISOString(),
        closeDate: formData.status === 'closed' ? new Date().toISOString() : null
      };

      const createdIncident = await createIncident(incidentData);
      onIncidentCreated(createdIncident);
      onClose();
      setFormData({
        incident_description: '',
        usedSource: '',
        importance: 'low',
        workerId: '',
        status: 'in_process',
        solution: '',
        note: ''
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('У вас нет прав для создания инцидента');
      } else {
        setError('Не удалось создать инцидент');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать инцидент</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Описание инцидента"
            multiline
            rows={3}
            value={formData.incident_description}
            onChange={(e) => setFormData({ ...formData, incident_description: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Использованные источники"
            multiline
            rows={2}
            value={formData.usedSource}
            onChange={(e) => setFormData({ ...formData, usedSource: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Важность</InputLabel>
            <Select
              value={formData.importance}
              label="Важность"
              onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
            >
              {importanceLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={formData.status}
              label="Статус"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Ответственный</InputLabel>
            <Select
              value={formData.workerId}
              label="Ответственный"
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
            >
              <MenuItem value="">
                <em>Не назначен</em>
              </MenuItem>
              {allAdmins.map((admin) => (
                <MenuItem key={admin.id} value={admin.id}>
                  {`${admin.firstName} ${admin.lastName}`}
                  {!admin.isActive && ' (Неактивен)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.status === 'closed' && (
            <TextField
              fullWidth
              label="Решение"
              multiline
              rows={4}
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              required
            />
          )}

          <TextField
            fullWidth
            label="Примечание"
            multiline
            rows={2}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.incident_description || (formData.status === 'closed' && !formData.solution)}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateIncidentDialog;