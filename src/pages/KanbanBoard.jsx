import { useState, useEffect } from 'react';
import { Box, Container, Alert, Snackbar, Button, IconButton, Menu, MenuItem, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KanbanColumn from '../components/KanbanColumn';
import IncidentCard from '../components/IncidentCard';
import ZabbixLogsDialog from '../components/ZabbixLogsDialog';
import CreateIncidentDialog from '../components/CreateIncidentDialog';
import CreateAdminDialog from '../components/CreateAdminDialog';
import { getAllIncidents, getAllSystemAdmins, updateIncident, archiveIncident, logout } from '../services/api';
import MonitorIcon from '@mui/icons-material/Monitor';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [error, setError] = useState('');
  const [zabbixOpen, setZabbixOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [incidentsData, adminsData] = await Promise.all([
          getAllIncidents(),
          getAllSystemAdmins()
        ]);
        setIncidents(incidentsData);
        setSystemAdmins(adminsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
        setError('Ошибка при загрузке данных');
      }
    };
    fetchData();
  }, [navigate]);

  const handleIncidentUpdate = async (updatedIncident) => {
    try {
      await updateIncident(updatedIncident);
      setIncidents(incidents.map(inc => 
        inc.id === updatedIncident.id ? updatedIncident : inc
      ));
    } catch (error) {
      console.error('Error updating incident:', error);
      setError('Не удалось обновить инцидент');
    }
  };

  const handleArchive = async (incidentId) => {
    try {
      const archivedIncident = await archiveIncident(incidentId);
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'archived' } : inc
      ));
    } catch (error) {
      console.error('Error archiving incident:', error);
      if (error.response?.status === 403) {
        setError('У вас нет прав для архивации инцидента');
      } else {
        setError('Не удалось архивировать инцидент');
      }
      throw error;
    }
  };

  const getColumnIncidents = (status) => {
    return incidents.filter(incident => incident.status === status).map(incident => ({
      ...incident,
      worker: systemAdmins.find(admin => admin.id === incident.worker_id) || null
    }));
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidents([...incidents, newIncident]);
  };

  const handleAdminCreated = (newAdmin) => {
    setSystemAdmins([...systemAdmins, newAdmin]);
  };

  const handleAdminUpdated = (updatedAdmin) => {
    setSystemAdmins(systemAdmins.map(admin => 
      admin.id === updatedAdmin.id ? updatedAdmin : admin
    ));
  };

  const handleAdminMenuOpen = (event, admin) => {
    event.stopPropagation();
    setAdminMenuAnchor(event.currentTarget);
    setSelectedAdmin(admin);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
    setSelectedAdmin(null);
  };

  const handleEditAdmin = () => {
    setAdminToEdit(selectedAdmin);
    setCreateAdminDialogOpen(true);
    handleAdminMenuClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Администраторы</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {systemAdmins.map((admin) => (
                <Chip
                  key={admin.id}
                  label={`${admin.firstName} ${admin.lastName}`}
                  color={admin.is_active ? 'primary' : 'default'}
                  variant="outlined"
                  deleteIcon={<MoreVertIcon />}
                  onDelete={(e) => handleAdminMenuOpen(e, admin)}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setAdminToEdit(null);
                setCreateAdminDialogOpen(true);
              }}
              color="secondary"
            >
              Создать администратора
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              color="success"
            >
              Создать инцидент
            </Button>
            <Button
              variant="contained"
              startIcon={<MonitorIcon />}
              onClick={() => setZabbixOpen(true)}
            >
              Логи Zabbix
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={logout}
              color="error"
            >
              Выйти
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
          }}
        >
          <KanbanColumn title="В работе" id="in_process">
            {getColumnIncidents('in_process').map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident}
                worker={incident.worker}
                allAdmins={systemAdmins}
                onUpdate={handleIncidentUpdate}
                onArchive={handleArchive}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn title="Закрыто" id="closed">
            {getColumnIncidents('closed').map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident}
                worker={incident.worker}
                allAdmins={systemAdmins}
                onUpdate={handleIncidentUpdate}
                onArchive={handleArchive}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn title="Архив" id="archived">
            {getColumnIncidents('archived').map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident}
                worker={incident.worker}
                allAdmins={systemAdmins}
                onUpdate={handleIncidentUpdate}
                onArchive={handleArchive}
              />
            ))}
          </KanbanColumn>
        </Box>
      </Box>

      <Menu
        anchorEl={adminMenuAnchor}
        open={Boolean(adminMenuAnchor)}
        onClose={handleAdminMenuClose}
      >
        <MenuItem onClick={handleEditAdmin}>Редактировать</MenuItem>
      </Menu>
      
      <ZabbixLogsDialog 
        open={zabbixOpen}
        onClose={() => setZabbixOpen(false)}
      />

      <CreateIncidentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        allAdmins={systemAdmins}
        onIncidentCreated={handleIncidentCreated}
      />

      <CreateAdminDialog
        open={createAdminDialogOpen}
        onClose={() => {
          setCreateAdminDialogOpen(false);
          setAdminToEdit(null);
        }}
        onAdminCreated={handleAdminCreated}
        onAdminUpdated={handleAdminUpdated}
        adminToEdit={adminToEdit}
      />

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default KanbanBoard;