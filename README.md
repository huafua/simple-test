# Simple Test - 原生 Node.js 輕量級計算器與 API 服務（含前端測試面板）

這是一個使用純原生 Node.js（不依賴任何外部框架如 Express）編寫的輕量級 HTTP API 與靜態資源服務器。項目充分利用了 Node.js 近期版本引入的原生新特性，如內建環境變量加載（`--env-file`）、熱重載（`--watch`）以及原生測試運行器（`node:test`）。

本項目還內建了一個漂亮的靜態前端網頁——**API 接口動態測試面板**，可讓您直接在瀏覽器中對各個 API 進行實時的可視化測試！

---

## 🚀 特色功能

- **零外部依賴 (Zero Dependencies)**：僅使用 Node.js 內建模組（`http`、`fs`、`path`、`url` 等）構建，極致輕量與安全。
- **靜態資源託管**：支持自動託管 `public` 目錄下的靜態文件（如 `index.html`），並附帶自定義響應頭 `Author: Your All Mighty Father`。
- **現代 Node.js 特性**：
    - 使用 **ES Modules** (`import`/`export`)。
    - 使用原生 `--env-file` 加載 `.env` 配置文件（無需 dotenv 套件）。
    - 使用原生 `--watch` 實現開發時的熱重載（無需 nodemon）。
    - 使用原生 `node:test` 與 `node:assert` 進行端到端 (E2E) 測試。
- **可視化 API 測試面板**：在 `public/index.html` 中提供了一個動態的 API 測試 Dashboard，可在瀏覽器中輸入參數、發送請求並即時呈現結果。
- **VSCode 整合支援**：附帶 `.vscode` 調試配置與 `.http` 測試請求文件。

---

## 📁 目錄結構

```text
simple-test/
├── .env                  # 環境變量配置文件
├── core.js               # 核心服務器類（Server）定義與 API 路由/工具方法註冊
├── index.js              # 應用程序入口點（啟動 HTTP 服務）
├── package.json          # 項目元數據與運行腳本
├── .vscode/              # VSCode 開發環境配置
│   ├── launch.json       # 調試配置
│   └── settings.json     # 項目設置
├── public/               # 靜態資源目錄
│   └── index.html        # API 接口動態測試面板（靜態前端）
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
npm run dev
```

_背後執行的命令：`node --env-file=.env --watch index.js`_

---

## 🖥️ 網頁端 API 測試面板

服務啟動後，您可以通過瀏覽器訪問前端測試 Dashboard：

👉 **訪問地址**：`http://localhost:8822/index.html`

該面板整合了所有的 API 測試功能，您可以在網頁中動態輸入引數、配置 JSON Body，並點擊「發送請求」實時查看 Status Code、HTTP 響應狀態以及 JSON 回傳結果，非常直觀方便！

---

## 📖 API 接口說明

服務啟動後，主要提供以下接口（包含靜態資源託管與 API 路由）：

### 1. 靜態資源服務
- **匹配規則**：任何非根路徑 `/` 且 `public` 目錄下存在的檔案路徑。
- **示例**：`/index.html` 讀取 `public/index.html`
- **響應特徵**：響應頭中會包含自定義 Header `"Author": "Your All Mighty Father"`。

### 2. 加法計算接口 (`/calculate`)
- **路徑**：`/calculate`
- **方法**：`GET`
- **查詢參數**：
    - `a` (必填，整數)：相加的第一個數值
    - `b` (必填，整數)：相加的第二個數值

#### 示例 A：成功請求
- **請求連結**：`http://localhost:8822/calculate?a=22&b=21`
- **響應 (JSON)**：
    ```json
    {
        "success": true,
        "message": "success",
        "result": 43
    }
    ```

#### 示例 B：缺少參數
- **請求連結**：`http://localhost:8822/calculate?b=11`
- **響應 (JSON)**：
    ```json
    {
        "success": false,
        "message": "Both a and b are required"
    }
    ```

#### 示例 C：參數非數值
- **請求連結**：`http://localhost:8822/calculate?a=1&b=sad`
- **響應 (JSON)**：
    ```json
    {
        "success": false,
        "message": "Either a or b is not a number"
    }
    ```

### 3. 用戶數據接口 (`/data`)
- **路徑**：`/data`
- **方法**：`GET` / `POST` (支持傳遞 JSON 請求體)
- **請求體格式**：`application/json`
- **請求參數**：
    - `username` (選填，字串，預設為 `"Demo"`)

#### 示例：
- **請求連結**：`http://localhost:8822/data`
- **請求 Body**：
    ```json
    {
        "username": "Thomas"
    }
    ```
- **響應 (JSON)**：
    ```json
    {
        "message": "My name is Thomas"
    }
    ```

### 4. 404 無效路由
- **匹配規則**：未定義的 API 路由且不屬於 `public` 目錄下的靜態資源。
- **示例請求**：`http://localhost:8822/something-invalid`
- **響應 (JSON)**：
    ```json
    {
        "code": 404,
        "message": "Can't find resource for '/something-invalid'"
    }
    ```

---

## 🧪 測試

項目提供兩種測試方式：自動化 E2E 測試，以及可手動觸發的 HTTP 請求測試。

### 1. 運行自動化測試

本項目使用 Node.js 原生的測試運行器（Test Runner）。執行：

```bash
npm test
```

_背後執行的命令：`node --env-file=.env --test`_

該命令會自動掃描並運行 `tests/e2e/index.test.js` 中的 E2E 測試用例，對 `/calculate` 與 `/data` 接口進行自動化功能驗證。

### 2. 手動 HTTP 請求測試 (`.http`)

如果您使用 **VSCode**，建議安裝 **REST Client** 擴充套件。
安裝後，您可以打開 `tests/http/index.http` 文件，直接點擊每個請求上方的 `Send Request` 鏈接，即可在編輯器中直觀地查看、測試各個接口的響應。
