# Simple Test - 原生 Node.js 輕量級計算器 API 服務

這是一個使用純原生 Node.js（不依賴任何外部框架如 Express）編寫的輕量級 HTTP API 計算器服務。項目充分利用了 Node.js 近期版本引入的原生新特性，如內建環境變量加載（`--env-file`）、熱重載（`--watch`）以及原生測試運行器（`node:test`）。

---

## 🚀 特色功能

- **零外部依賴 (Zero Dependencies)**：僅使用 Node.js 內建模組（`http`、`url` 等）構建，極致輕量與安全。
- **現代 Node.js 特性**：
  - 使用 **ES Modules** (`import`/`export`)。
  - 使用原生 `--env-file` 加載 `.env` 配置文件（無需 dotenv 套件）。
  - 使用原生 `--watch` 實現開發時的熱重載（無需 nodemon）。
  - 使用原生 `node:test` 與 `node:assert` 進行端到端 (E2E) 測試。
- **VSCode 整合支援**：附帶 `.vscode` 調試配置與 `.http` 測試請求文件。

---

## 📁 目錄結構

```text
simple-test/
├── .env                  # 環境變量配置文件
├── index.js              # 應用程序入口點（HTTP 服務器邏輯）
├── package.json          # 項目元數據與運行腳本
├── .vscode/              # VSCode 開發環境配置
│   ├── launch.json       # 調試配置
│   └── settings.json     # 項目設置
└── tests/                # 測試目錄
    ├── e2e/
    │   └── index.test.js # 原生 E2E 測試腳本
    └── http/
        └── index.http    # HTTP 請求測試文件（供 REST Client 插件使用）
```

---

## 🛠️ 環境需求

- **Node.js**：建議版本 **v20.6.0 或更高版本**（以支援原生 `--env-file` 特性）。

---

## ⚙️ 項目配置

請在項目根目錄下創建 `.env` 文件（若尚未存在），並配置服務運行的端口號：

```env
PORT=8822
```

---

## 🏃 運行與開發

由於本項目不含任何第三方依賴，您無需執行 `npm install` 即可直接運行。

### 1. 啟動開發伺服器（熱重載模式）

執行以下命令啟動服務。此模式下修改代碼後，伺服器會自動重啟：

```bash
npm start
```

*背後執行的命令：`node --env-file=.env --watch index.js`*

---

## 📖 API 接口說明

服務啟動後，主要提供以下計算接口：

### 加法計算接口

* **路徑**：`/calculate`
* **方法**：`GET`
* **查詢參數**：
  * `a` (必填，整數)：相加的第一個數值
  * `b` (必填，整數)：相加的第二個數值

#### 示例 1：成功請求

* **請求連結**：`http://localhost:8822/calculate?a=22&b=21`
* **響應 (JSON)**：
  ```json
  {
    "success": true,
    "message": "success",
    "result": 43
  }
  ```

#### 示例 2：缺少參數

* **請求連結**：`http://localhost:8822/calculate?b=11`
* **響應 (JSON)**：
  ```json
  {
    "success": false,
    "message": "Both a and b are required"
  }
  ```

#### 示例 3：參數非數值

* **請求連結**：`http://localhost:8822/calculate?a=1&b=sad`
* **響應 (JSON)**：
  ```json
  {
    "success": false,
    "message": "Either a and b is not a number"
  }
  ```

#### 示例 4：無效路由

* **請求連結**：`http://localhost:8822/invalid-route`
* **響應 (JSON)**：
  ```json
  {
    "success": false,
    "message": "left undone"
  }
  ```

---

## 🧪 測試

項目提供兩種測試方式：自動化 E2E 測試，以及可手動觸發的 HTTP 請求測試。

### 1. 運行自動化測試

本項目使用 Node.js 原生的測試運行器（Test Runner）。在伺服器運行時，或單獨測試時，可執行：

```bash
npm test
```

*背後執行的命令：`node --env-file=.env --test`*

該命令會掃描並運行 `tests/e2e/index.test.js` 中的測試用例，對 `/calculate` 接口的加法邏輯進行驗證。

### 2. 手動 HTTP 請求測試 (`.http`)

如果您使用 **VSCode**，建議安裝 **REST Client** 擴充套件。
安裝後，您可以打開 `tests/http/index.http` 文件，直接點擊每個請求上方的 `Send Request` 鏈接，即可在編輯器中直觀地查看、測試各個接口的響應。
