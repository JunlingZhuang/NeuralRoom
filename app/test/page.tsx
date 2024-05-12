// page.tsx

"use client";
import { Button } from "@nextui-org/button";

import React, { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(null); 
  const handleClick = async () => {
    try {

      // see the next.config.js file for the proxy setting
      const response = await fetch("/api/test");
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Failed to fetch count:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleClick}>Click me</Button>
      {count !== null && <p>Count: {count}</p>}
    </div>
  );
}
