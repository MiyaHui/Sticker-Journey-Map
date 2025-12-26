# 🌍 Sticker Journey Map

> **把你的旅行照片变成独一无二的 Q 版贴纸，并在地图上点亮你的足迹！**

## 📖 简介 | Introduction

你只需上传旅行途中拍摄的照片，应用会自动读取照片的地理位置信息（GPS），并利用 **Nano Banana** 模型将原本的照片转换成风格独特的 **卡通贴纸**。这些贴纸会被📍在交互式地图的相应位置，形成一份生动可爱的旅行回忆录。
<img width="1757" height="935" alt="截屏2025-12-26 11 36 24" src="https://github.com/user-attachments/assets/cdfea5cc-4fef-49ef-bf90-d387e06d9668" />
<img width="1757" height="947" alt="截屏2025-12-26 11 37 40" src="https://github.com/user-attachments/assets/a95d2be7-5a45-4abe-b02a-9fe8d4b5bb65" />


## 🚀 怎么运行

**Prerequisites:**  Node.js
- 如果你还没有安装Node.js，请先在终端安装。
- 安装完成之后，在IDE里打开这个文件夹，执行以下操作：

1. 打开终端，输入以下命令安装依赖:
   `npm install`
2. 在根目录文件夹创建.env 文件，内容为
   `GEMINI_API_KEY=“your_api_key”` 
4. 在终端里运行:
   `npm run dev`

## ⚠️ 其他注意事项
- 建议一次上传5张以内照片，防止运行时间过长
- 运行结果会保存在浏览器中
