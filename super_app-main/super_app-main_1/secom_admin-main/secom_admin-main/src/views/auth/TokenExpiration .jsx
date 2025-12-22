import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../config/api.config";

export const TokenExpiration = () => {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const tokenExpiration = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);

    const abc=Date.now();
    console.log(abc);
    console.log(tokenExpiration);
  
    if (!accessToken || Date.now() > tokenExpiration) {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      navigate("/signin");
      return false;
    }
  
    return true;
  };
  
