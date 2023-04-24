document.addEventListener('DOMContentLoaded', function () {
    var exportButton = document.getElementById('export-button');
    var importButton = document.getElementById('import-button');
    var searchInput = document.getElementById('search-input');
    var clearButton = document.getElementById('clear-button');
    var select = document.getElementById('prompt-select');
    var moveUpButton = document.getElementById('move-up');
    var moveDownButton = document.getElementById('move-down');
    var addButton = document.getElementById('add-button');
    var deleteButton = document.getElementById('delete-button');
    var newTitle = document.getElementById('new-title');
    var newPrompt = document.getElementById('new-prompt');
    var directInputCheckbox = document.getElementById('direct-input-checkbox');
    var useButton = document.getElementById('use-button');

    // 將 localStorage 內的字串陣列加入選單中
    function loadOptionsFromStorage() {
        var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];

        for (var i = 0; i < options.length; i++) {
            var optionValue = options[i];
            // 從 optionValue 物件中取出 title, prompt, directInput，如果有錯就刪除該項
            try {
                var { title, prompt, directInput } = JSON.parse(optionValue);
            } catch (error) {
                options.splice(i, 1);
                i--;
                continue;
            }

            var option = document.createElement('option');
            option.value = JSON.stringify({ title, prompt, directInput });
            option.innerHTML = title;
            select.appendChild(option);
        }

        if (select.selectedIndex !== -1) {
            var selectedOptionValue = options[select.selectedIndex];
            var { title, prompt, directInput } = JSON.parse(selectedOptionValue);
            newTitle.value = title;
            newPrompt.value = prompt;
            directInputCheckbox.checked = directInput === 'true';
        }
    }

    function saveOptionsToStorage() {
        var options = [];
        for (var i = 0; i < select.options.length; i++) {
            options.push(select.options[i].value);
        }
        localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
    }

    // 將新增的選項加入選單
    function addOption(title, prompt, isDirectInput) {
        var option = document.createElement('option');
        option.innerHTML = title;
        option.value = JSON.stringify({ title, prompt, isDirectInput });
        select.appendChild(option);
    }

    // 監聽「存為 Json」按鈕的點擊事件
    exportButton.addEventListener('click', function () {
        var filename = window.prompt('請輸入檔名', 'prompts.json');
        if (!filename) {
            return;
        }

        var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];
        var jsonData = JSON.stringify(options, null, 2);
        var blob = new Blob([jsonData], { type: "application/json" });
        var url = URL.createObjectURL(blob);

        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // 監聽「從 Json 匯入」按鈕的點擊事件
    importButton.addEventListener('click', function () {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.click();

        fileInput.addEventListener('change', function () {
            var file = fileInput.files[0];
            if (!file) {
                return;
            }

            var reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = function (e) {
                var result = e.target.result;
                var options = JSON.parse(result);
                localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
                location.reload();
            };

            loadOptionsFromStorage();
        });
    });

    // 監聽搜尋輸入框的輸入事件
    searchInput.addEventListener('input', function () {
        var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];
        var searchValue = searchInput.value.trim().toLowerCase();
        select.innerHTML = '';
        for (var i = 0; i < options.length; i++) {
            var optionValue = options[i];
            var { title, prompt, directInput } = JSON.parse(optionValue);
            // 搜尋 title 中是否包含搜尋關鍵字，如果有就加入選項中
            if (title.toLowerCase().includes(searchValue)) {
                addOption(title, prompt, directInput);
            }
        }
    });

    // 監聽清除篩選按鈕的點擊事件
    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        select.innerHTML = '';
        loadOptionsFromStorage();
    });

    // 監聽選單的選擇事件
    select.addEventListener('change', function () {
        var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];
        var selectedOptionValue = options[select.selectedIndex];
        var { title, prompt, directInput } = JSON.parse(selectedOptionValue);
        newTitle.value = title;
        newPrompt.value = prompt;
        directInputCheckbox.checked = directInput;
    });

    // 監聽向上移動按鈕的點擊事件
    moveUpButton.addEventListener('click', function () {
        var selectedIndex = select.selectedIndex;
        if (selectedIndex > 0) {
            var option = select.options[selectedIndex];
            select.removeChild(option);
            select.add(option, selectedIndex - 1);
            saveOptionsToStorage();
        }
    });

    // 監聽向下移動按鈕的點擊事件
    moveDownButton.addEventListener('click', function () {
        var selectedIndex = select.selectedIndex;
        if (selectedIndex >= 0 && selectedIndex < select.options.length - 1) {
            var option = select.options[selectedIndex];
            select.removeChild(option);
            select.add(option, selectedIndex + 1);
            saveOptionsToStorage();
        }
    });

    // 新增按鈕點擊事件處理函數
    addButton.addEventListener('click', function () {
        var title = newTitle.value;
        var prompt = newPrompt.value;
        var isDirectInput = directInputCheckbox.checked;

        if (title && prompt) {
            addOption(title, prompt, isDirectInput);
            saveOptionsToStorage();
        }
    });

    // 監聽刪除按鈕的點擊事件
    deleteButton.addEventListener('click', function () {
        var selectedIndex = select.selectedIndex;
        if (selectedIndex >= 0) {
            select.removeChild(select.options[selectedIndex]);
            saveOptionsToStorage();
        }

        if (select.options.length > 0) {
            var selectedOptionValue = options[select.selectedIndex];
            var { title, prompt, directInput } = JSON.parse(selectedOptionValue);
            newTitle.value = title;
            newPrompt.value = prompt;
            directInputCheckbox.checked = directInput;
        }
    });

    // 監聽 newTitle 輸入框的點擊事件
    newTitle.addEventListener('click', function () {
        this.select();
        this.setSelectionRange(0, this.value.length);
    });

    // 監聽使用按鈕的點擊事件
    useButton.addEventListener('click', function () {
        var value = select.value;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: function (value, directInput) {
                    var textarea = document.querySelector('#__next form.stretch textarea');
                    textarea.value = value;

                    // 檢查是否需要展開為多行
                    if (textarea.scrollHeight > textarea.clientHeight) {
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }

                    if (directInput) { // 如果直接輸入的 checkbox 被勾選了
                        var button = document.querySelector("#__next form.stretch button");
                        button.click();
                    }
                },
                args: [value, directInputCheckbox.checked]
            });
        });
    });

    loadOptionsFromStorage();

    // 判斷是否在 chat.openai.com 頁面中
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;
        if (!url.startsWith('https://chat.openai.com')) {
            document.getElementById('talk-message').innerHTML = "抱歉！我在這個頁面幫不上忙！";
            return;
        }
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: function () {
                var textarea = document.querySelector('#__next form.stretch textarea');
                if (!textarea) {
                    return null;
                }
                return textarea.value;
            }
        }, function (results) {
            if (results && results[0].result) {
                newTitle.value = '從 ChatGPT 輸入框中取得';
                newPrompt.value = results[0].result;
            }
        });
    });
});
