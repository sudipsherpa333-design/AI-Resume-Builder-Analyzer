// /src/utils/network.js
export const checkSocketServer = async () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

  try {
    // Try to fetch from socket server health endpoint
    const response = await fetch(`${socketUrl}/health`, {
      method: 'GET',
      mode: 'no-cors', // Try no-cors first
      cache: 'no-cache'
    });

    return true;
  } catch (error) {
    console.log('⚠️ Socket server health check failed:', error.message);

    // Try alternative ports
    const ports = [5002, 5001, 3001];
    for (const port of ports) {
      try {
        const testUrl = `http://localhost:${port}/health`;
        await fetch(testUrl, { method: 'GET', mode: 'no-cors' });
        console.log(`✅ Found socket server on port ${port}`);
        return true;
      } catch (portError) {
        // Continue to next port
      }
    }

    return false;
  }
};