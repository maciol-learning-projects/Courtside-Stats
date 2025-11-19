import axios from "axios";

export const testBackend = async () => {
  try {
    const res = await axios.get("http://localhost:5000/");
    console.log("Backend response:", res.data);
  } catch (err) {
    console.error("Error connecting to backend:", err);
  }
};
