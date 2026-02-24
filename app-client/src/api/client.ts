import axios from "axios";
import { BASE_URL } from "../config/constants";


export const api = axios.create({
  baseURL: BASE_URL,
});
