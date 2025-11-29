import React, { useEffect } from "react";


const Home: React.FC = () => {
  useEffect(() => {
    console.log("Home component mounted");
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Frontend running</h2>
    </div>
  );
};

export default Home;
