document.addEventListener("DOMContentLoaded", () => {
    const btnGetAll = document.getElementById("btn-get-all");
    const btnReport = document.getElementById("btn-report");
    const btnGetById = document.getElementById("btn-get-by-id");
    const btnGetByAge = document.getElementById("btn-get-by-age");
    const btnGetByField = document.getElementById("btn-get-by-field");

    const inputId = document.getElementById("input-id");
    const inputAgeMin = document.getElementById("input-age-min");
    const inputAgeMax = document.getElementById("input-age-max");
    const selectField = document.getElementById("select-field");
    const inputFieldVal = document.getElementById("input-field-val");

    const statusArea = document.getElementById("status-area");
    const reportContainer = document.getElementById("report-container");
    const tableContainer = document.querySelector(".table-container");
    const resultsTbody = document.getElementById("results-tbody");

    const paginationContainer = document.getElementById("pagination-container");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const pageInfo = document.getElementById("page-info");
    const selectLimit = document.getElementById("select-limit");

    let currentQueryUrl = "";
    let currentPage = 1;
    let currentLimit = 10;

    // Helper to show status
    function showStatus(message, type) {
        statusArea.textContent = message;
        statusArea.className = "status-area";
        if (type) {
            statusArea.classList.add(`status-${type}`);
        }
    }

    // Helper to render table
    function renderTable(data) {
        resultsTbody.innerHTML = ""; // Clear existing rows safely (no user input here)

        let students = [];
        if (Array.isArray(data)) {
            students = data;
        } else if (data && typeof data === "object") {
            students = [data];
        }

        if (students.length === 0) {
            showStatus("查無資料", "empty");
            return;
        }

        students.forEach((student) => {
            const tr = document.createElement("tr");

            const fields = ["id", "name", "age", "class", "email"];
            fields.forEach((field) => {
                const td = document.createElement("td");
                td.textContent =
                    student[field] !== undefined ? student[field] : "";
                tr.appendChild(td);
            });

            resultsTbody.appendChild(tr);
        });

        showStatus(`查詢成功，共 ${students.length} 筆資料`, "success");
    }

    // Generic fetch function
    function buildUrl(base) {
        const separator = base.includes("?") ? "&" : "?";
        return `${base}${separator}page=${currentPage}&limit=${currentLimit}`;
    }

    function updatePaginationUI(data) {
        if (!data) {
            paginationContainer.style.display = "none";
            return;
        }

        paginationContainer.style.display = "flex";
        const totalPages = data.totalPages || 1;
        const page = data.page || 1;

        pageInfo.textContent = `第 ${page} 頁 / 共 ${totalPages} 頁`;

        btnPrev.disabled = page <= 1;
        btnNext.disabled = page >= totalPages;
    }

    function showTable() {
        reportContainer.style.display = "none";
        tableContainer.style.display = "block";
    }

    async function fetchStudents(urlBase, paginated = false) {
        showTable();
        const url = paginated ? buildUrl(urlBase) : urlBase;
        showStatus("載入中...", "loading");
        resultsTbody.innerHTML = "";

        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.code === 200) {
                // For get_student_by_id, if not found, it might return 404, but if it returns 200 with empty data, handle it
                if (result.data === undefined || result.data === null) {
                    renderTable([]);
                    updatePaginationUI(null);
                } else {
                    if (paginated) {
                        renderTable(result.data.items || []);
                        updatePaginationUI(result.data);
                    } else {
                        renderTable(result.data);
                        updatePaginationUI(null);
                    }
                }
            } else {
                showStatus(`錯誤: ${result.message || "未知錯誤"}`, "error");
                updatePaginationUI(null);
            }
        } catch (error) {
            showStatus(`網路錯誤: ${error.message}`, "error");
            updatePaginationUI(null);
        }
    }

    // Event Listeners
    btnReport.addEventListener("click", async () => {
        tableContainer.style.display = "none";
        paginationContainer.style.display = "none";
        reportContainer.style.display = "block";

        showStatus("產生報表中...", "loading");
        reportContainer.innerHTML = "";

        try {
            const response = await fetch(
                "/student/get_all_students?page=1&limit=10000",
            );
            const result = await response.json();

            if (result.code === 200) {
                const students = result.data.items || [];
                if (students.length === 0) {
                    showStatus("查無資料可產生報表", "empty");
                    return;
                }

                // Process data
                const classCount = {};
                const ageCount = {};

                students.forEach((s) => {
                    const cls = s.class || "未知";
                    const age = s.age || "未知";
                    classCount[cls] = (classCount[cls] || 0) + 1;
                    ageCount[age] = (ageCount[age] || 0) + 1;
                });

                // Build HTML
                reportContainer.innerHTML = "";

                const buildChart = (title, dataObj) => {
                    const section = document.createElement("div");
                    section.className = "report-section";

                    const h2 = document.createElement("h2");
                    h2.textContent = title;
                    section.appendChild(h2);

                    const entries = Object.entries(dataObj).sort(
                        (a, b) => b[1] - a[1],
                    );
                    const maxCount = Math.max(...entries.map((e) => e[1]), 1);

                    entries.forEach(([label, count]) => {
                        const row = document.createElement("div");
                        row.className = "chart-row";

                        const labelDiv = document.createElement("div");
                        labelDiv.className = "chart-label";
                        labelDiv.textContent = label;
                        row.appendChild(labelDiv);

                        const barContainer = document.createElement("div");
                        barContainer.className = "chart-bar-container";

                        const bar = document.createElement("div");
                        bar.className = "chart-bar";
                        const percentage = (count / maxCount) * 100;
                        bar.style.width = `${percentage}%`;
                        bar.textContent = count;

                        barContainer.appendChild(bar);
                        row.appendChild(barContainer);
                        section.appendChild(row);
                    });

                    return section;
                };

                reportContainer.appendChild(
                    buildChart("班級人數分佈", classCount),
                );
                reportContainer.appendChild(buildChart("年齡分佈", ageCount));

                showStatus(
                    `報表產生成功，共統計 ${students.length} 筆資料`,
                    "success",
                );
            } else {
                showStatus(`錯誤: ${result.message || "未知錯誤"}`, "error");
            }
        } catch (error) {
            showStatus(`網路錯誤: ${error.message}`, "error");
        }
    });

    btnGetAll.addEventListener("click", () => {
        currentQueryUrl = "/student/get_all_students";
        currentPage = 1;
        fetchStudents(currentQueryUrl, true);
    });

    btnGetById.addEventListener("click", () => {
        const id = inputId.value.trim();
        if (!id) {
            showStatus("請輸入學號", "error");
            return;
        }
        fetchStudents(
            `/student/get_student_by_id?id=${encodeURIComponent(id)}`,
            false,
        );
    });

    inputId.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnGetById.click();
    });

    btnGetByAge.addEventListener("click", () => {
        const min = inputAgeMin.value.trim();
        const max = inputAgeMax.value.trim();
        if (!min || !max) {
            showStatus("請輸入最小與最大年齡", "error");
            return;
        }
        currentQueryUrl = `/student/get_students_by_age_range?min=${encodeURIComponent(min)}&max=${encodeURIComponent(max)}`;
        currentPage = 1;
        fetchStudents(currentQueryUrl, true);
    });

    inputAgeMin.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnGetByAge.click();
    });
    inputAgeMax.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnGetByAge.click();
    });

    btnGetByField.addEventListener("click", () => {
        const field = selectField.value;
        const val = inputFieldVal.value.trim();
        if (!val) {
            showStatus("請輸入查詢條件", "error");
            return;
        }
        currentQueryUrl = `/student/get_students?by=${encodeURIComponent(field)}&val=${encodeURIComponent(val)}`;
        currentPage = 1;
        fetchStudents(currentQueryUrl, true);
    });

    inputFieldVal.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnGetByField.click();
    });

    btnPrev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchStudents(currentQueryUrl, true);
        }
    });

    btnNext.addEventListener("click", () => {
        currentPage++;
        fetchStudents(currentQueryUrl, true);
    });

    selectLimit.addEventListener("change", (e) => {
        currentLimit = parseInt(e.target.value, 10);
        currentPage = 1;
        if (currentQueryUrl) {
            fetchStudents(currentQueryUrl, true);
        }
    });

    // Initial load
    btnGetAll.click();
});
