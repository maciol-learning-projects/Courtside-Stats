import React, { useEffect } from "react";
import { testBackend } from "../utils/api";

const Home: React.FC = () => {
  useEffect(() => {
    testBackend();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Frontend running</h2>
    </div>
  );
};

export default Home;
