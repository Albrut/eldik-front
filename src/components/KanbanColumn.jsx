import { Paper, Typography } from '@mui/material';

const KanbanColumn = ({ title, children }) => {
  return (
    <Paper
      sx={{
        p: 2,
        minHeight: '500px',
        width: '300px',
        bgcolor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export default KanbanColumn;