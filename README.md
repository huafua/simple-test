# Simple Test - 原生 Node.js 輕量級計算器與 API 服務（含前端測試面板）

這是一個使用純原生 Node.js（不依賴任何外部框架如 Express）編寫的輕量級 HTTP API 與靜態資源服務器。項目充分利用了 Node.js 近期版本引入的原生新特性，如內建環境變量加載（`--env-file`）、熱重載（`--watch`）以及原生測試運行器（`node:test`）。

本項目還內建了一個漂亮的靜態前端網頁——**API 接口動態測試面板**，可讓您直接在瀏覽器中對各個 API 進行實時的可視化測試！

---

## 🚀 特色功能

- **零外部依賴 (Zero Dependencies)**：僅使用 Node.js 內建模組（`http`、`fs`、`path`、`url` 等）構建，極致輕量與安全。
- **嚴格 Method 路由分發 (Strict Method Routing)**：升級了路由分發機制。現在伺服器會嚴格根據請求的 HTTP Method（`GET` 或 `POST`）和請求路徑進行精確路由查找，非對應方法的請求將自動回傳 404。
- **自動目錄路由加載 (Dynamic Routing)**：在 `core.js` 中實現了輕量級、基於目錄結構的動態路由加載器。它能自動遞迴掃描 `routes` 目錄下的 `get.js` 與 `post.js` 文件，將導出的模組函數自動註冊為對應 HTTP 方法的 API 路由。
- **自動 Controller 加載 (Dynamic Controllers)**：內建自動 Controller 載入機制。它能自動掃描 `controllers` 目錄下的 `get.js` 與 `post.js` 文件，將導出的純函數自動包裝並註冊為 API。此機制支持**自動參數解析**（GET 自動帶入 `query`，POST 自動帶入 `body`）與**統一 JSON 格式回傳**及**異常處理**。
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
├── core.js               # 核心服務器類（Server）定義、動態路由/Controller 加載器與工具方法
├── index.js              # 應用程序入口點（啟動 HTTP 服務）
├── package.json          # 項目元數據與運行腳本
├── .vscode/              # VSCode 開發環境配置
│   ├── launch.json       # 調試配置
│   └── settings.json     # 項目設置
├── controllers/          # 動態 Controller 目錄
│   └── calculator/       # 計算器模組 Controller 目錄
│       ├── get.js        # 計算器 GET 接口定義 (提供 add, subtract, multiply, divide)
│       └── post.js       # 計算器 POST 接口定義 (提供 divide 接口)
├── public/               # 靜態資源目錄
│   └── index.html        # API 接口動態測試面板（靜態前端）
├── routes/               # 動態路由目錄
│   └── student/          # 學生模組目錄
│       ├── get.js        # 學生模組 GET 路由定義 (提供 /student/info 與 /student/demo 接口)
│       └── post.js       # 學生模組 POST 路由定義 (提供 /student/create 接口，現已啟用)
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

服務啟動後，提供以下接口（包含靜態資源託管、內置硬編碼路由、動態加載路由以及動態加載的 Controller 服務）：

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

#### 示例：
- **請求連結**：`http://localhost:8822/calculate?a=22&b=21`
- **響應 (JSON)**：
    ```json
    {
        "success": true,
        "message": "success",
        "result": 43
    }
    ```

### 3. 用戶數據接口 (`/data`)
- **路徑**：`/data`
- **方法**：`GET`
- **說明**：此接口目前**僅支持 GET 請求**。若使用 POST 請求訪問 `/data`，伺服器會返回 `404 Can't find resource`。

> ⚠️ **解析限制與行為變更**：自本版本起，伺服器的請求體（Body）解析器 `assemblyRequest` **僅對 POST 請求進行異步解析**。
>
> 因此，若向 `/data` 發送 `GET` 請求並攜帶 JSON Body（例如 `{"username": "Thomas"}`），該 Body **將不會被解析**（`req.body` 將保持空對象 `{}`）。因此，回傳結果中的名字將為預設值 `"Demo"`，如下所示：

#### 示例：
- **請求連結**：`http://localhost:8822/data` （使用 GET，可附帶 JSON 請求體但將被忽略）
- **響應 (JSON)**：
    ```json
    {
        "message": "My name is Demo"
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
這些接口是自 `routes/student/` 被服務器動態加載並註冊的：

#### A. 學生資訊接口 (`/student/info`)
- **路徑**：`/student/info`
- **方法**：`GET` (自 `get.js` 加載)
- **響應格式**：`text/plain`
- **回傳內容**：`hello world`

#### B. 學生示範接口 (`/student/demo`)
- **路徑**：`/student/demo`
- **方法**：`GET` (自 `get.js` 加載)
- **響應格式**：`text/plain`
- **回傳內容**：`demo`

#### C. 學生建立接口 (`/student/create`)
- **路徑**：`/student/create`
- **方法**：`POST` (自 `post.js` 加載)
- **響應格式**：`application/json`
- **回傳內容 (JSON)**：
  ```json
  {
      "code": 200
  }
  ```

### 6. 計算器動態 Controller 接口 (自 `controllers/` 目錄加載)
這些接口是自 `controllers/calculator/` 被服務器動態加載，並自動包裝註冊為 API：

- **共同響應特徵 (成功)**：
  ```json
  {
      "code": 200,
      "result": <計算結果>
  }
  ```
- **共同響應特徵 (異常/失敗)**：
  ```json
  {
      "code": 400,
      "reason": <錯誤描述>
  }
  ```

#### A. 加法運算接口 (`/calculator/add`)
- **路徑**：`/calculator/add`
- **方法**：`GET`
- **查詢參數**：`a` (數值), `b` (數值)
- **回傳結果 (JSON)**：`{"code": 200, "result": 3}`

#### B. 減法運算接口 (`/calculator/subtract`)
- **路徑**：`/calculator/subtract`
- **方法**：`GET`
- **查詢參數**：`a` (數值), `b` (數值)
- **回傳結果 (JSON)**：`{"code": 200, "result": 3}`

#### C. 乘法運算接口 (`/calculator/multiply`)
- **路徑**：`/calculator/multiply`
- **方法**：`GET`
- **查詢參數**：`a` (數值), `b` (數值)
- **回傳結果 (JSON)**：`{"code": 200, "result": 2}`

#### D. 除法運算接口 — GET (`/calculator/divide`)
- **路徑**：`/calculator/divide`
- **方法**：`GET` (自 `get.js` 加載)
- **查詢參數**：`a` (數值), `b` (數值)
- **回傳結果 (JSON)**：`{"code": 200, "result": 1}`

#### E. 除法運算接口 — POST (`/calculator/divide`)
- **路徑**：`/calculator/divide`
- **方法**：`POST` (自 `post.js` 加載)
- **請求參數**：JSON 請求體（如 `{"a": 10, "b": 2}`）
- **回傳結果 (JSON)**：`{"code": 200, "result": 5}`

---

## 📂 動態路由與 Controller 加載機制

服務在 `core.js` 的 `Server` 類別中定義了兩種基於目錄結構的自動加載機制，並於 `server.start()` 時調用 `loadExtralRoutes()` 進行加載：

### 1. 普通路由加載器 (`loadRoutes`)
- **掃描目錄**：遞迴掃描 `routes` 資料夾及所有子資料夾（如 `student`）。
- **過濾與分發條件**：
  ```javascript
  let method = path.basename(filepath).replace(/\.js$/g, "");
  if (!"get post".split(/\s+/).includes(method)) continue;
  ```
  - 支持 **GET** 與 **POST**。
  - 文件名為 `get.js` 的模組函數會被註冊為 `GET` 路由；文件名為 `post.js` 的模組函數會被註冊為 `POST` 路由。
- **路徑生成**：對應路徑為 `/[子資料夾名稱]/[導出函數名稱]`。例如 `routes/student/post.js` 內導出的 `create` 函數被註冊為 `POST /student/create`。
- **回調規格**：導出函數是直接接收 `(req, res)` 的標準原生路由回調函數，需手動管理 `res.end()` 與 Header 設定。

### 2. 高級 Controller 加載器 (`loadControllers`)
- **掃描目錄**：遞迴掃描 `controllers` 目錄及所有子目錄。
- **過濾條件**：同路由加載器，支持 `get.js` 與 `post.js`（即 GET 與 POST 方法）。
- **路徑生成**：對應路徑為 `/[子資料夾名稱]/[導出函數名稱]`。例如 `controllers/calculator/post.js` 內導出的 `divide` 函數被註冊為 `POST /calculator/divide`。
- **包裝與異常機制 (Wrapper)**：
  - **純數據對象輸入**：相較於普通路由，Controller 導出的是**純數據處理函數**。它不需要直接操作 `req` 與 `res`，服務器在包裝時會自動提取輸入參數：
    - `GET` 方法：自動提取 `req.query`
    - `POST` 方法：自動提取 `req.body`
    並將該數據對象 `{ ... }` 作為參數傳入 Controller 函數。
  - **自動上下文綁定**：使用 `c.callback.call(this, data)` 將 Controller 的 `this` 綁定為 `Server` 實例，方便在 Controller 內調用 `Server` 內的方法。
  - **自動化 JSON 回傳**：框架會自動將 Controller 函數 return 的值包裝進 `{ code: 200, result }` 並以 JSON 回傳。
  - **異常捕獲 (Catch-All)**：若 Controller 執行拋出 error，包裝層會自動捕獲，設置 `content-type` 為 JSON，並回傳 `{ code: 400, reason: e }`。

### 3. 嚴格 HTTP Method 匹配
在 `handleRequest` 接收到請求後，路由查找器 `getCallback` 會從 `req.method` 取得請求方法，並從 `this.routes[req.method]` 中進行對應路徑匹配：
```javascript
getCallback(req) {
    const method = req.method;
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    return this.routes[method].get(pathname) || this.notFound.bind(this);
}
```
*這使得同一個路由路徑可以根據不同的 HTTP Method（例如 GET 與 POST）分發給完全不同的處理函數。*

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

> ⚠️ **當前測試套件備註**：由於本版本將 `/data` 接口調整為嚴格 method 匹配且不對 GET 解析 Body，當前的原生 E2E 測試用例中對 `getData("Thomas")`（發送 POST 至 `/data`）的調用會收到 404 回傳，導致該測試目前會回報失敗。這符合當前嚴格 method 分發的底層架構設計。

### 2. 手動 HTTP 請求測試 (`.http`)

如果您使用 **VSCode**，建議安裝 **REST Client** 擴充套件。
安裝後，您可以打開 `tests/http/index.http` 文件，直接點擊每個請求上方的 `Send Request` 鏈接，即可在編輯器中直觀地查看、測試各個接口（包括傳統硬編碼 API、全新的 `/calculator/*` 動態 Controller 接口、以及新啟用的 `/student/create` POST 接口）的響應。
