# Simple Test - 原生 Node.js 輕量級計算器與 API 服務（含前端測試面板）

這是一個使用純原生 Node.js（不依賴任何外部框架如 Express）編寫的輕量級 HTTP API 與靜態資源服務器。項目充分利用了 Node.js 近期版本引入的原生新特性，如內建環境變量加載（`--env-file`）、熱重載（`--watch`）以及原生測試運行器（`node:test`）。

本項目還內建了一個漂亮的靜態前端網頁——**API 接口動態測試面板**，可讓您直接在瀏覽器中對各個 API 進行實時的可視化測試！

---

## 🚀 特色功能

- **零外部依賴 (Zero Dependencies)**：僅使用 Node.js 內建模組（`http`、`fs`、`path`、`url` 等）構建，極致輕量與安全。
- **自動目錄路由加載 (Dynamic Routing)**：在 `core.js` 中實現了輕量級、基於目錄結構的動態路由加載器。它能自動遞迴掃描 `routes` 目錄，將特定的導出函數動態註冊為 API 路由。
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
├── core.js               # 核心服務器類（Server）定義、API 路由/工具方法註冊與動態路由加載器
├── index.js              # 應用程序入口點（啟動 HTTP 服務）
├── package.json          # 項目元數據與運行腳本
├── .vscode/              # VSCode 開發環境配置
│   ├── launch.json       # 調試配置
│   └── settings.json     # 項目設置
├── public/               # 靜態資源目錄
│   └── index.html        # API 接口動態測試面板（靜態前端）
├── routes/               # 動態路由目錄
│   └── student/          # 學生模組目錄
│       ├── get.js        # 學生模組 GET 路由定義 (提供 /student/info 與 /student/demo 接口)
│       └── post.js       # 學生模組 POST 路由定義 (目前未被加載，詳見下文說明)
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
node --env-file=.env --watch index.js
```

*(也可以在執行腳本環境允許時使用：`npm run dev`)*

---

## 🖥️ 網頁端 API 測試面板

服務啟動後，您可以通過瀏覽器訪問前端測試 Dashboard：

👉 **訪問地址**：`http://localhost:8822/index.html`

該面板整合了部分主要 API 測試功能，您可以在網頁中動態輸入引數、配置 JSON Body，並點擊「發送請求」實時查看 Status Code、HTTP 響應狀態以及 JSON 回傳結果，非常直觀方便！

---

## 📖 API 接口說明

服務啟動後，提供以下接口（包含靜態資源託管、內置硬編碼路由以及動態加載路由）：

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

> 💡 **底層設計特徵**：該路由在 `core.js` 中是使用 `server.get("/data", ...)` 註冊的。然而，由於本服務器的路由分發器（`handleRequest`）目前並未對 HTTP Method 進行嚴格過濾與校驗，因此任何 HTTP 方法（例如 POST）發送至 `/data` 時，均會被分發至同一個回調函數。在 `assemblyRequest` 中，不論何種方法，只要帶有 JSON 請求體且包含相應的 `Content-Type`，均會被異步解析並寫入 `req.body`，從而能讀取到 `req.body.username`。

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

### 5. 學生模組動態路由 (自 `routes/` 目錄加載)
這些接口是通過 `routes/student/get.js` 被服務器動態加載並註冊的：

#### A. 學生資訊接口 (`/student/info`)
- **路徑**：`/student/info`
- **方法**：`GET`
- **響應格式**：`text/plain`
- **回傳內容**：`hello world`

#### B. 學生示範接口 (`/student/demo`)
- **路徑**：`/student/demo`
- **方法**：`GET`
- **響應格式**：`text/plain`
- **回傳內容**：`demo`

---

## 📂 動態路由與模組加載機制

項目在 `core.js` 的 `Server` 類中實現了基於目錄結構的動態路由加載器：

### 1. 工作原理
當調用 `server.start()` 時，會執行 `this.loadRoutes()` 遞迴掃描項目根目錄下的 `routes` 資料夾：
1. **目錄遍歷**：遞迴讀取 `routes` 文件夾及所有子文件夾（如 `student`）。
2. **方法過濾**：通過檔名來識別對應的 HTTP Method。
   在代碼中存在過濾邏輯：
   ```javascript
   let method = path.basename(filepath).replace(/\.js$/g, "");
   if (!"get".split(/\s+/).includes(method)) continue;
   ```
   * **目前僅支援 GET**：由於代碼硬編碼限制僅加載檔名為 `get` 的檔案，因此只有 `get.js` 會被處理並被當作 `get` 方法路由註冊。
   * **忽略其他方法**：這意味著 `routes/student/post.js` 因檔名為 `post`，在目前版本中會被**直接跳過 (Skipped)**，因此 `/student/create` 路由不會被註冊，請求時會回傳 `404`。
3. **路徑與命名空間對應**：對於被加載的 `get.js` 檔案，它會讀取該模組的所有導出函數（`export function`），並動態構建以下對應關係：
   - 路由路徑：`/` + `[子資料夾名稱]` + `/` + `[導出函數名稱]`
   - 回調函數：該導出的函數
   - 例如：`routes/student/get.js` 中的 `export function info(req, res)` 會被註冊為：
     * **路徑**: `/student/info`
     * **方法**: `GET` (來自檔名 `get.js`)

### 2. 未來擴展性
若希望開啟 POST 路由的自動加載，您只需將 `core.js` 中的過濾邏輯進行修改。例如：
- 修改前：`if (!"get".split(/\s+/).includes(method)) continue;`
- 修改後：`if (!"get post".split(/\s+/).includes(method)) continue;`
並在 `Server` 類中添加 `post(pathname, callback)` 方法與對應的路由 Map（如 `this.routes.POST`），即可完美支援 `routes/student/post.js` 中的 POST 接口！

---

## 🧪 測試

項目提供兩種測試方式：自動化 E2E 測試，以及可手動觸發的 HTTP 請求測試。

### 1. 運行自動化測試

本項目使用 Node.js 原生的測試運行器（Test Runner）。

**步驟 1：啟動後端伺服器**
```bash
node --env-file=.env index.js
```

**步驟 2：執行測試腳本**
在另一個終端窗口中運行：
```bash
node --env-file=.env --test
```
*(注意：在某些 Windows 環境下，由於 PowerShell 腳本執行策略限制，執行 `npm test` 可能會報錯。使用上述 `node --env-file=.env --test` 可以繞過限制直接執行測試。)*

該命令會自動掃描並運行 `tests/e2e/index.test.js` 中的 E2E 測試用例，對 `/calculate` 與 `/data` 接口進行自動化功能驗證。

### 2. 手動 HTTP 請求測試 (`.http`)

如果您使用 **VSCode**，建議安裝 **REST Client** 擴充套件。
安裝後，您可以打開 `tests/http/index.http` 文件，直接點擊每個請求上方的 `Send Request` 鏈接，即可在編輯器中直觀地查看、測試各個接口的響應。您可以將 `/student/info` 與 `/student/demo` 也加入測試列表中進行快速驗證。
