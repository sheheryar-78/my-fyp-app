import axios from "axios";

// Using localhost. If testing on Android emulator, change to 10.0.2.2.
// If testing on a physical device, change to your computer's IP address.
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Basic token interceptor - replace with AsyncStorage if needed later
API.interceptors.request.use((req) => {
  // const token = await AsyncStorage.getItem('token');
  // if (token) req.headers.Authorization = token;
  return req;
});

export default API;
