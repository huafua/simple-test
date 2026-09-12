# 學生資訊與數學計算系統 (Student & Math Web System)

一個基於原生 Node.js 構建的輕量級全棧 Web 系統。本專案後端未使用任何第三方框架（如 Express 或 Koa），而是從零實現了一個自研的、基於文件系統與導出函數命名的自動路由 Web 服務器框架。

本系統包含兩個核心業務板塊：

1. **學生資訊查詢系統 (Student Information Query System)**：一個具有精美現代感、支持伺服器端分頁查詢、多維度檢索與前端動態統計圖表報表的單頁應用（SPA）。
2. **數學計算 API (Math Calculator API)**：提供加、減、乘、除等精確數學運算接口，並包含完整的單元測試。

---

## 🚀 系統特色

### 1. 自研自動化路由框架 (Automatic File-system & Export Routing)

- **無需手動配置路由**：後端 `WebServer` 類會自動遞歸掃描指定的 `apis` 目錄。
- **約定優於配置 (Convention over Configuration)**：
    - 路由文件以 `*get.js` 或 `*post.js` 結尾，自動識別為 `GET` 或 `POST` 請求。
    - 文件內的導出函數名（CamelCase 駝峰命名）會被自動轉換為對應路徑的底線命名（snake_case）。
    - _例如_：
        - `apis/student/get.js` 中的導出函數 `getStudentById` ➡️ `GET /student/get_student_by_id`
        - `apis/math/post.js` 中的導出函數 `addTwoNumbers` ➡️ `POST /math/add_two_numbers`
- **請求與響應增強**：
    - 原生請求對象（`http.IncomingMessage`）被增強，自動解析 URL 的 Query 參數（掛載於 `req.query`）與 POST 的 Body 請求體（支持 `application/json` 與 `application/x-www-form-urlencoded`，掛載於 `req.body`）。
    - 原生響應對象（`http.ServerResponse`）被擴展，提供 `.json(o)` 輸出與 `.redirect(url)` 重定向功能。

### 2. 功能完善的前端單頁應用 (Modern Vanilla SPA)

- **高性能**：完全採用原生 DOM 操作與事件監聽，零第三方庫（無 jQuery、React 或 Vue），加載速度極快，運行輕量。
- **分頁查詢設計**：與後端分頁機制緊密配合，支持自定義每頁筆數（10 / 20 / 50 筆），提供優雅的上一頁、下一頁及頁碼指示 UI。
- **多維度檢索**：
    - **查詢全部**：展示所有學生的分頁列表。
    - **按學號（ID）查詢**：精確匹配學生的學號。
    - **按年齡範圍查詢**：查詢符合設定年齡區間的學生，後端會自動按年齡**降序**排列返回。
    - **條件查詢**：下拉選擇欄位（學號、姓名、年齡、班級、電子郵件），對應輸入值進行動態篩選。
- **動態數據統計報表**：
    - 提供「產生統計報表」功能，一鍵拉取後端大數據集（設定大 limit 繞過分頁限制）。
    - 在前端利用原生 JS 統計數據後，通過純 CSS 與 DOM 結構動態繪製精美的水平柱狀圖，直觀展示**班級人數分佈**與**年齡分佈**。
- **現代化美學設計**：
    - 採用優雅、高質感的淡紫色調（Amethyst 紫）作為主題色。
    - 具備動態過渡動畫與細緻的陰影設計。
    - 提供狀態指示區（Status Area），以不同的配色與圖案顯示「載入中」、「查無資料（空狀態）」、「查詢成功」與「錯誤提示」。
    - 完整的響應式佈局（RWD），在手機等行動裝置上也能完美適應。

### 3. 內置原生單元測試 (Native Unit Testing)

- 本專案採用 Node.js 原生測試執行器（`node:test`）與斷言庫（`node:assert`）進行接口集成測試，保證了數學計算模組與學生查詢模組的高質量與穩定性。

---

## 📁 目錄結構

```text
C:\Users\F3231918\Desktop\xxa\
├── .gitignore               # Git 忽略配置
├── data.js                  # 靜態模擬數據庫 (包含 100 筆精美的學生數據)
├── index.js                 # 應用程序啟動入口
├── package.json             # 項目配置文件 (採用現代 ESM 模組類型)
├── server.js                # 後端自研 WebServer 框架核心源碼
├── README.md                # 項目說明文檔 (本文件)
├── .vscode/                 # VS Code 編輯器配置
│   ├── launch.json          # 調試配置 (支持 Node 監聽與熱重載調試)
│   └── settings.json        # 編輯器本地設置
├── apis/                    # 後端 API 路由目錄
│   ├── math/
│   │   └── post.js          # 數學計算 POST 接口 (加、減、乘、除)
│   └── student/
│       └── get.js           # 學生相關 GET 接口 (Hello、ID 查詢、分頁、年齡範圍、多條件)
├── tests/
|   ├── e2e/
│   |   ├── math.test.js         # 數學計算接口測試用例
│   |   └── student.test.js      # 學生查詢接口測試用例
|   └── http/
│       ├── math.api.http        # 數學計算接口測試腳本
│       └── student.api.http     # 學生資訊接口測試腳本
└── www/                     # 前端靜態資源目錄 (客戶端)
    ├── index.css            # 現代化紫色主題樣式
    ├── index.html           # 單頁應用主 HTML
    └── index.js             # 前端核心控制邏輯與 DOM 渲染代碼
```

---

## 🛠️ 技術棧與底層原理

### 後端架構

1. **核心模組**：完全依賴 Node.js 原生 `http`、`fs`、`path`、`querystring` 模組。
2. **靜態資源託管**：
    - `WebServer` 接管所有非 API 請求。若請求路徑對應於 `www/` 下的實體文件，則會自動猜測 `MIME` 類型並以 `fs.createReadStream` 管道流（`.pipe(res)`）高效讀取並響應。
3. **異步生命週期**：採用 `setImmediate` 異步調度路由回調函數，確保服務器事件循環（Event Loop）不被阻塞。

### 前端架構

1. **CSS 變量**：使用 CSS 變量（`:root`）定義主題色、背景、邊框，方便一鍵換膚：
    ```css
    --primary-color: #9b59b6; /* 經典淡紫 */
    --bg-color: #f9f6fb; /* 優雅灰紫 */
    ```
2. **動態報表實現**：利用 CSS Flexbox、百分比寬度與平滑過渡（`transition`）繪製無圖像依賴的數據可視化圖表。

---

## 🔌 API 接口說明

後端基礎 URL：`http://localhost:8888`

### 📊 學生資訊 API (GET)

#### 1. 獲取全部學生 (分頁)

- **路徑**：`GET /student/get_all_students`
- **參數**：
    - `page` (number, 選填)：當前頁碼，預設為 `1`。
    - `limit` (number, 選填)：每頁資料量，預設為 `10`。
- **響應範例**：
    ```json
    {
        "code": 200,
        "message": "Successfully handled",
        "data": {
            "items": [
                {
                    "id": "STU2026001",
                    "name": "陳子豪",
                    "age": 16,
                    "class": "1A",
                    "email": "stu2026001@school.edu.tw"
                }
            ],
            "total": 100,
            "page": 1,
            "limit": 10,
            "totalPages": 10
        }
    }
    ```

#### 2. 依學號查詢學生

- **路徑**：`GET /student/get_student_by_id`
- **參數**：
    - `id` (string, 必填)：學號。
- **響應範例**：
    ```json
    {
        "code": 200,
        "message": "Successfully handled",
        "data": {
            "id": "STU2026100",
            "name": "賴郁婷",
            "age": 15,
            "class": "1C",
            "email": "stu2026100@school.edu.tw"
        }
    }
    ```

#### 3. 按年齡範圍查詢 (分頁)

- **路徑**：`GET /student/get_students_by_age_range`
- **參數**：
    - `min` (number, 必填)：最小年齡。
    - `max` (number, 必填)：最大年齡。
    - `page`、`limit` (選填)
- **特色**：結果會自動按照年齡**降序**排序。

#### 4. 動態多條件查詢 (分頁)

- **路徑**：`GET /student/get_students`
- **參數**：
    - `by` (string, 必填)：篩選欄位（`id` | `name` | `age` | `class` | `email`）。
    - `val` (string, 必填)：篩選目標值（精確匹配）。
    - `page`、`limit` (選填)

### 🧮 數學計算 API (POST)

所有數學計算接口皆接受 JSON 格式的 Body 請求體，並返回計算結果。

#### 1. 加法計算

- **路徑**：`POST /math/add_two_numbers`
- **請求體**：`{ "a": 22, "b": 21 }`
- **響應結果**：`{ "code": 200, "message": "Successfully handled", "data": 43 }`

#### 2. 減法計算

- **路徑**：`POST /math/subtract_two_numbers`
- **請求體**：`{ "a": 22, "b": 20 }`
- **響應結果**：`{ "code": 200, "message": "Successfully handled", "data": 2 }`

#### 3. 乘法計算

- **路徑**：`POST /math/multiply_two_numbers`
- **請求體**：`{ "a": 22, "b": 20 }`
- **響應結果**：`{ "code": 200, "message": "Successfully handled", "data": 440 }`

#### 4. 除法計算

- **路徑**：`POST /math/divide_two_numbers`
- **請求體**：`{ "a": 22, "b": 20 }`
- **響應結果**：`{ "code": 200, "message": "Successfully handled", "data": 1.1 }`

---

## 🏃 快速開始

### 1. 環境需求

- 安裝 **Node.js v20.x 或以上版本**（本系統完全符合現代 ES Modules 規範）。

### 2. 啟動服務器

專案無任何第三方運行時依賴，開箱即用：

```bash
# 啟動開發伺服器（內置熱重載監聽，適合開發）
npm run dev
```

啟動後終端將輸出註冊好的路由與埠口資訊：

```text
- 1 /student/hello [GET]
- 2 /student/get_student_by_id [GET]
- 3 /student/get_all_students [GET]
- 4 /student/get_students_by_age_range [GET]
- 5 /student/get_students [GET]
- 6 /math/add_two_numbers [POST]
- 7 /math/subtract_two_numbers [POST]
- 8 /math/multiply_two_numbers [POST]
- 9 /math/divide_two_numbers [POST]
Server running at 8888
```

### 3. 前端瀏覽

打開任意現代瀏覽器，造訪：

```text
http://localhost:8888/index.html
```

---

## 🧪 運行測試

### 1. 運行自動化單元測試

本項目內置原生測試。在服務器啟動狀態下，於終端運行以下命令：

```bash
# 運行所有單元測試
node --test tests/*.test.js
```

測試執行器將自動執行並輸出：

```text
▶ Mathematical algrithom tests
  ✔ 22 plus 21 should be 43 (2.9515ms)
  ✔ 22 subtract 20 should be 2 (0.7681ms)
  ✔ 22 multiply 20 should be 440 (0.697ms)
  ✔ 22 divide 20 should be 1.1 (0.8351ms)
▶ Mathematical algrithom tests (7.3776ms)

▶ Student query and some tests
  ✔ hello (3.6335ms)
▶ Student query and some tests (5.0069ms)
```

### 2. 接口手動測試 (VS Code REST Client)

專案在 `requests/` 目錄下內置了 `student.api.http` 與 `math.api.http`。如果您在 VS Code 中安裝了 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) 插件，可以直接在這些文件中點擊 `Send Request` 來一鍵調用、測試與觀察後端 API 的響應。

---

## ⚙️ VS Code 調試

項目自帶 `.vscode/launch.json`。在 VS Code 中按下 `F5` 即可一鍵開啟後端調試，可自由添加斷點追蹤自研 WebServer 的請求解析與路由派發流程。
