import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';

const importanceColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const importanceLevels = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
];

const statuses = [
  { value: 'in_process', label: 'В работе' },
  { value: 'closed', label: 'Закрыто' },
  { value: 'archived', label: 'Архив' }
];

const IncidentCard = ({ incident, worker, allAdmins, onUpdate, onArchive }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState('');

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditData({
      ...incident,
      close_date: incident.status === 'closed' ? incident.close_date : new Date().toISOString(),
      worker_id: incident.worker_id || ''
    });
    setError('');
    setEditOpen(true);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    setArchiveConfirmOpen(true);
  };

  const handleArchiveConfirm = async () => {
    try {
      await onArchive(incident.id);
      setArchiveConfirmOpen(false);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('У вас нет прав для архивации инцидента. Только администратор может архивировать инциденты.');
      } else {
        setError('Не удалось архивировать инцидент');
      }
    }
  };

  const handleSave = async () => {
    const updatedIncident = {
      id: incident.id,
      used_sources: editData.used_sources,
      incident_date: editData.incident_date,
      incident_description: editData.incident_description,
      importance: editData.importance,
      worker_id: editData.worker_id || null,
      status: editData.status,
      close_date: editData.status === 'closed' ? new Date().toISOString() : null,
      solution: editData.status === 'closed' ? (editData.solution || '') : null,
      note: editData.note || ''
    };

    try {
      await onUpdate(updatedIncident);
      setEditOpen(false);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('У вас нет прав для изменения этого поля. Только администратор может изменять некоторые поля инцидента.');
      } else {
        setError('Произошла ошибка при обновлении инцидента');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          '&:hover': { backgroundColor: 'action.hover' },
          position: 'relative'
        }}
        onClick={() => setDetailsOpen(true)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {worker ? `${worker.firstName} ${worker.lastName}` : 'Не назначен'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                color={importanceColors[incident.importance]}
                label={incident.importance}
              />
              <Tooltip title="Редактировать">
                <IconButton 
                  size="small" 
                  onClick={handleEditClick}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'primary.light',
                      color: 'white'
                    } 
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {incident.status !== 'archived' && (
                <Tooltip title="Архивировать">
                  <IconButton
                    size="small"
                    onClick={handleArchiveClick}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'warning.light',
                        color: 'white'
                      }
                    }}
                  >
                    <ArchiveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {incident.incident_description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(incident.incident_date)}
          </Typography>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Детали инцидента</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Ответственный</Typography>
            <Typography paragraph>
              {worker ? `${worker.firstName} ${worker.lastName}` : 'Не назначен'}
              {worker && !worker.isActive && ' (Неактивен)'}
            </Typography>

            <Typography variant="h6" gutterBottom>Описание</Typography>
            <Typography paragraph>{incident.incident_description}</Typography>

            <Typography variant="h6" gutterBottom>Важность</Typography>
            <Chip
              color={importanceColors[incident.importance]}
              label={incident.importance}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom>Использованные источники</Typography>
            <Typography paragraph>{incident.used_sources || 'Не указано'}</Typography>

            <Typography variant="h6" gutterBottom>Дата инцидента</Typography>
            <Typography paragraph>{formatDate(incident.incident_date)}</Typography>

            {incident.status === 'closed' && (
              <>
                <Typography variant="h6" gutterBottom>Дата закрытия</Typography>
                <Typography paragraph>{formatDate(incident.close_date)}</Typography>

                <Typography variant="h6" gutterBottom>Решение</Typography>
                <Typography paragraph>{incident.solution || 'Не указано'}</Typography>
              </>
            )}

            {incident.note && (
              <>
                <Typography variant="h6" gutterBottom>Примечание</Typography>
                <Typography paragraph>{incident.note}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать инцидент</DialogTitle>
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
              value={editData?.incident_description || ''}
              onChange={(e) => setEditData({ ...editData, incident_description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Использованные источники"
              multiline
              rows={2}
              value={editData?.used_sources || ''}
              onChange={(e) => setEditData({ ...editData, used_sources: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Важность</InputLabel>
              <Select
                value={editData?.importance || ''}
                label="Важность"
                onChange={(e) => setEditData({ ...editData, importance: e.target.value })}
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
                value={editData?.status || ''}
                label="Статус"
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
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
                value={editData?.worker_id || ''}
                label="Ответственный"
                onChange={(e) => setEditData({ ...editData, worker_id: e.target.value })}
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

            {editData?.status === 'closed' && (
              <TextField
                fullWidth
                label="Решение"
                multiline
                rows={4}
                value={editData.solution || ''}
                onChange={(e) => setEditData({ ...editData, solution: e.target.value })}
              />
            )}

            <TextField
              fullWidth
              label="Примечание"
              multiline
              rows={2}
              value={editData?.note || ''}
              onChange={(e) => setEditData({ ...editData, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Подтверждение архивации</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите архивировать этот инцидент?
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveConfirmOpen(false)}>Отмена</Button>
          <Button onClick={handleArchiveConfirm} variant="contained" color="warning">
            Архивировать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncidentCard;