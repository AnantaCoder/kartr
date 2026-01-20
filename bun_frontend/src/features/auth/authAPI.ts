import apiClient from "../../services/apiClient";

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
};
