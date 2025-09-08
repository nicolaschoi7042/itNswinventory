import { Container, Typography, Box, Button } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth='md'>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant='h3' component='h1' gutterBottom>
          IT Asset & Software Inventory Management
        </Typography>
        <Typography
          variant='h6'
          component='h2'
          color='text.secondary'
          align='center'
        >
          Next.js Migration in Progress - Material-UI + Tailwind Integration
          Test
        </Typography>
        <Button variant='contained' color='primary' size='large'>
          Material-UI Button Test
        </Button>
        <Button variant='outlined' color='secondary'>
          Secondary Button
        </Button>

        {/* Tailwind CSS와 Material-UI 통합 테스트 */}
        <div className='mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200'>
          <Typography variant='h6' className='text-blue-800 mb-2'>
            Tailwind + Material-UI Integration Test
          </Typography>
          <div className='flex gap-4 flex-wrap justify-center'>
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md shadow-lg'>
              Tailwind Gradient Box
            </div>
            <Button
              variant='contained'
              className='bg-green-600 hover:bg-green-700'
            >
              Mixed Styling Button
            </Button>
          </div>
        </div>
      </Box>
    </Container>
  );
}
