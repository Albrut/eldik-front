import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // Добавляем токен, если он есть
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['X-Auth-Token'] = token;
    }
    console.groupCollapsed(`➡️ Axios Request: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
    console.log('Request Headers:', JSON.stringify(config.headers, null, 2));
    console.log('Request Data:', config.data);
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.groupCollapsed(`✅ Axios Response: ${response.config.method?.toUpperCase()} ${response.config.baseURL || ''}${response.config.url}`);
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    if (error.response) {
      const { config, status, statusText, data, headers } = error.response;
      console.groupCollapsed(`❌ Axios Response Error: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
      console.log('Error Status:', status, statusText);
      console.log('Error Headers:', JSON.stringify(headers, null, 2));
      console.log('Error Data:', data);
      console.groupEnd();
    } else {
      console.error('❌ Network / CORS Error:', error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  const token = response.data;
  if (!token) throw new Error('No token received');
  localStorage.setItem('authToken', token);
  return token;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

export const getAllSystemAdmins = async () => {
  const response = await api.get('/admin/get/all/system_admins');
  return response.data;
};

export const getAllIncidents = async () => {
  const response = await api.get('/admin/get/all/incidents');
  return response.data;
};

export const getZabbixLogs = async () => {
  const response = await api.get('/admin/get/all/incidents/zabbix/');
  return response.data;
};

export const updateIncident = async (incidentData) => {
  const response = await api.patch('/admin/update/incident', incidentData);
  return response.data;
};

export const archiveIncident = async (incidentId) => {
  const response = await api.post(`/admin/archive/incident?id=${incidentId}`);
  return response.data;
};

export const createIncident = async (incidentData) => {
  const payload = {
    usedSource: incidentData.usedSource,
    incidentDate: incidentData.incidentDate,
    incident_description: incidentData.incident_description,
    importance: incidentData.importance,
    workerId: incidentData.workerId || null,
    closeDate:
      incidentData.status === 'closed' ? incidentData.closeDate : null,
    solution:
      incidentData.status === 'closed' ? incidentData.solution : null,
    note: incidentData.note || '',
    status: incidentData.status
  };
  const response = await api.post('/admin/create/incident', payload);
  return response.data;
};

export const createSystemAdmin = async (adminData) => {
  const payload = {
    username: adminData.username,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    is_active: adminData.is_active,
    role: adminData.role
  };
  const response = await api.post('/admin/create/system_admin', payload);
  return response.data;
};

export const updateSystemAdmin = async (adminData) => {
  const payload = {
    id: adminData.id,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    is_active: adminData.is_active,
    role: adminData.role
  };
  const response = await api.patch('/admin/update/system_admin', payload);
  return response.data;
};

export default api;

