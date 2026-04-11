"use client";

import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  const handleViewTasks = () => {
    router.push("/tasks");
  };

  return (
    <div>
      <button onClick={handleViewTasks}>View tasks</button>
    </div>
  );
};

export default Home;
