

export async function login_postex_controller() {
  const body = {
    username: process.env.POSTEX_USERNAME,
    password: process.env.POSTEX_PASSWORD,
  };

//   const response = await axios.post("http://api.postex.ir/api/v1/auth/login", body);
//   console.log(response)
  return "response";
}
