"use client"; 

import { AppBar, Toolbar, Typography, Button, Container, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Link from 'next/link';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#f4f6f8' }
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Campus Connect
              </Typography>
              <Button color="inherit" component={Link} href="/">
                All Notifications
              </Button>
              <Button color="inherit" component={Link} href="/priority">
                Priority Inbox
              </Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
              {children}
            </Box>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}