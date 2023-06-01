import axios from "axios";

const apiClient = axios.create({
  // baseURL: process.env.REACT_APP_API_BASEURL,
  baseURL: "http://localhost:3001",
  timeout: 5000,
  withCredentials: true,
  headers: {
    "content-type": "application/json",
  },
});

export default apiClient;