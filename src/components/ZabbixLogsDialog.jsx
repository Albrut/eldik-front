import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { getZabbixLogs } from '../services/api';

const importanceColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const ZabbixLogsDialog = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getZabbixLogs();
      setLogs(data);
    } catch (err) {
      setError('Не удалось загрузить логи Zabbix');
      console.error('Error fetching Zabbix logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Логи Zabbix
          <Button onClick={fetchLogs} disabled={loading}>
            Обновить
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : logs.length === 0 ? (
          <Typography align="center">
            Нет доступных логов
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Номер</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Важность</TableCell>
                  <TableCell>Ответственный</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Ресурсы</TableCell>
                  <TableCell>Решение</TableCell>
                  <TableCell>Заметки</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(log.dateOfTheProblem)}</TableCell>
                    <TableCell>{log.number}</TableCell>
                    <TableCell sx={{ maxWidth: '200px', whiteSpace: 'normal' }}>
                      {log.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={importanceColors[log.importance]}
                        label={log.importance}
                      />
                    </TableCell>
                    <TableCell>{log.responsible}</TableCell>
                    <TableCell>{log.status}</TableCell>
                    <TableCell>
                      {log.resources?.map((resource, idx) => (
                        <Typography key={idx} variant="body2">
                          {resource}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px', whiteSpace: 'normal' }}>
                      {log.solution}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px', whiteSpace: 'normal' }}>
                      {log.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZabbixLogsDialog;