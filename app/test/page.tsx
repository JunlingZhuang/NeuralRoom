// page.tsx

"use client";
import { Button } from "@nextui-org/button";

import React, { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(null);

  const handleDownloadModel = async () => {
    try {
      // 发起请求获取文件
      const response = await fetch("/models/test.fbx");
      if (!response.ok) {
        throw new Error("Failed to fetch the model");
      }

      // 将响应数据转换为 Blob
      const modelDataBlob = await response.blob();

      // 创建一个 URL 对象
      const url = window.URL.createObjectURL(modelDataBlob);

      // 创建一个链接元素
      const link = document.createElement("a");
      link.href = url;
      link.download = "test.fbx"; // 指定下载的文件名

      // 模拟点击链接下载
      document.body.appendChild(link);
      link.click();

      // 清理：移除链接元素，并释放 blob URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the model:", error);
    }
  };
  const handleGenerateModel = async () => {
    try {
      // create the request body
      const requestBody = {
        length: 10,
        height: 3,
        width: 40,
      };

      // send request to the backend
      const response = await fetch("/api/generate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // change the request body to a JSON string
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // handle the response data
      // const modelData = await response.json();
      // place holder for the model data
      const modelData = "public/models/test.fbx";
    } catch (error) {
      console.error("Error fetching model:", error);
    }

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
        <div>
          <Button onClick={handleClick}>Click me</Button>
          {count !== null && <p>Count: {count}</p>}
        </div>
        <div>
          <Button onClick={handleGenerateModel}>Generate</Button>
        </div>
        <div>
          <Button onClick={handleDownloadModel}>Download</Button>
        </div>
      </div>
    );
  };
}
