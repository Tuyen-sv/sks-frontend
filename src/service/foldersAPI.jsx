import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://103.245.237.127/folders";

export const getAllFolders = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Fetching all folders from:", API_URL);

    const response = await axios({
      method: 'GET',
      url: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log("Folders API Response:", response);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching folders:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error("Unauthorized. Please login again.");
        } else if (status === 403) {
          throw new Error("Access denied. You don't have permission.");
        } else if (status === 404) {
          throw new Error("API endpoint not found.");
        } else {
          throw new Error(error.response.data.message || `Server error: ${status}`);
        }
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const createFolder = async (folderName, parentId = null) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating folder:", folderName, "parentId:", parentId);

    const requestData = {
      name: folderName
    };

    if (parentId) {
      requestData.parentId = parentId;
    }

    const response = await axios({
      method: 'POST',
      url: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 10000
    });

    console.log("Create folder response:", response);
    
    return response.data;
  } catch (error) {
    console.error("Error creating folder:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage = error.response.data.message || `Create folder failed: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("No response from server during folder creation.");
      } else {
        throw new Error(`Folder creation error: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred during folder creation");
    }
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Deleting folder:", folderId);

    const response = await axios({
      method: 'DELETE',
      url: `${API_URL}/delete`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        folderId: folderId
      },
      timeout: 10000
    });

    console.log("Delete folder response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting folder:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data.message || `Delete folder failed: ${error.response.status}`);
      } else if (error.request) {
        throw new Error("No response from server during folder deletion.");
      } else {
        throw new Error(`Delete folder error: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred during folder deletion");
    }
  }
};