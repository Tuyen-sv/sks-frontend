import axios from "axios";

const postLogin = (email, password) => {
  return axios.post("http://103.245.237.127/auth/login", {
    email,
    password,
  });
};

const postRegister = (data) => {
  return axios.post("http://103.245.237.127/auth/register", data);
};

export { postLogin, postRegister };