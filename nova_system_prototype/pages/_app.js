import '../styles/globals.css';
import { AuthProvider } from '../components/AuthContext';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
