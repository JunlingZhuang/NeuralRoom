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
      // create the request body and variables for model generation
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
      // placeholder for the model data
      const modelData = "public/models/test.fbx";
    } catch (error) {
      console.error("Error fetching model:", error);
    }
  };

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-between ">
        <p>Counter to test if Flask API Works</p>
        <Button onClick={handleClick}>Click me</Button>
        {count !== null && <p>Count: {count}</p>}
        <br />
        <p>Test Model Geration Function</p>
        <p>1.Clickon Generate</p>
        <p>2.Dowonload Model to see if it works</p>
        <Button onClick={handleGenerateModel}>Generate</Button>
        <Button onClick={handleDownloadModel}>Download</Button>
      </div>
    </main>
  );
}
