export const BASE_URL = "http://192.168.0.199/NasugView"; 

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch('http://192.168.0.199/NasugView/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error' };
  }
};


