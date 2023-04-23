document.addEventListener('DOMContentLoaded', function () {
    var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];
    var newTitle = document.getElementById('new-title');
    var newPrompt = document.getElementById('new-prompt');

    // 監聽「存為 Json」按鈕的點擊事件
    var exportButton = document.getElementById('export-button');
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
    var importButton = document.getElementById('import-button');
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
            reader.onload = function () {
                try {
                    var jsonData = JSON.parse(reader.result);
                    // 檢查 jsonData 是否為陣列
                    if (!Array.isArray(jsonData)) {
                        alert('檔案格式錯誤！請選擇正確的 ChatGPT prompts json 檔案。');
                        return;
                    }
                    // 檢查 jsonData 是否為合法的 ChatGPT prompts 陣列
                    for (var i = 0; i < jsonData.length; i++) {
                        var optionValue = jsonData[i];
                        // 分離 title 與 prompt
                        var title = optionValue.substring(0, optionValue.indexOf("|"));
                        var prompt = optionValue.substring(optionValue.indexOf("|") + 1);
                        // 如果該項目不是 title 與 prompt 組合，就拋出錯誤
                        if (title === "" || prompt === "") {
                            throw new Error('檔案格式錯誤！請選擇正確的 ChatGPT prompts json 檔案。');
                        }
                    }
                    localStorage.setItem('chatGPTPromptList', JSON.stringify(jsonData));
                    options = jsonData;
                    select.innerHTML = '';
                    for (var i = 0; i < options.length; i++) {
                        var optionValue = options[i];
                        // 分離 title 與 prompt
                        var title = optionValue.substring(0, optionValue.indexOf("|"));
                        var prompt = optionValue.substring(optionValue.indexOf("|") + 1);
                        // 如果該項目不是 title 與 prompt 組合，就從 options 與 localStorage 中移除
                        if (title === "" || prompt === "") {
                            options.splice(i, 1);
                            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
                            i--;
                            continue;
                        }
                        var option = document.createElement('option');
                        option.value = prompt;
                        option.innerHTML = title;
                        select.appendChild(option);
                    }
                } catch (error) {
                    alert(error.message);
                }
            };
        });
    });

    // 監聽搜尋輸入框的輸入事件
    var searchInput = document.getElementById('search-input');
    var select = document.getElementById('prompt-select');
    searchInput.addEventListener('input', function () {
        var searchValue = searchInput.value.trim().toLowerCase();
        select.innerHTML = '';
        for (var i = 0; i < options.length; i++) {
            var optionValue = options[i];
            // 分離 title 與 prompt
            var title = optionValue.substring(0, optionValue.indexOf("|"));
            var prompt = optionValue.substring(optionValue.indexOf("|") + 1);
            // 如果該項目不是 title 與 prompt 組合，就從 options 與 localStorage 中移除
            if (title === "" || prompt === "") {
                options.splice(i, 1);
                localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
                i--;
                continue;
            }
            // 搜尋 title 中是否包含搜尋關鍵字，如果有就加入選項中
            if (title.toLowerCase().includes(searchValue)) {
                var option = document.createElement('option');
                option.value = prompt;
                option.innerHTML = title;
                select.appendChild(option);
            }
        }
    });

    // 監聽清除篩選按鈕的點擊事件
    var clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        select.innerHTML = '';
        for (var i = 0; i < options.length; i++) {
            var optionValue = options[i];
            // 分離 title 與 prompt
            var title = optionValue.substring(0, optionValue.indexOf("|"));
            var prompt = optionValue.substring(optionValue.indexOf("|") + 1);
            // 如果該項目不是 title 與 prompt 組合，就從 options 與 localStorage 中移除
            if (title === "" || prompt === "") {
                options.splice(i, 1);
                localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
                i--;
                continue;
            }
            var option = document.createElement('option');
            option.value = prompt;
            option.innerHTML = title;
            select.appendChild(option);
        }
    });

    // 監聽選單的選擇事件
    select.addEventListener('change', function () {
        var optionValue = select.value;
        var optionTitle = select.options[select.selectedIndex].text;
        newPrompt.value = optionValue;
        newTitle.value = optionTitle;
    });

    // 監聽向上移動按鈕的點擊事件
    var moveUpButton = document.getElementById('move-up');
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
    var moveDownButton = document.getElementById('move-down');
    moveDownButton.addEventListener('click', function () {
        var selectedIndex = select.selectedIndex;
        if (selectedIndex >= 0 && selectedIndex < select.options.length - 1) {
            var option = select.options[selectedIndex];
            select.removeChild(option);
            select.add(option, selectedIndex + 1);
            saveOptionsToStorage();
        }
    });

    function saveOptionsToStorage() {
        var options = [];
        for (var i = 0; i < select.options.length; i++) {
            var option = select.options[i];
            var optionValue = option.value;
            var optionTitle = option.text;
            var completeOption = optionTitle + '|' + optionValue;
            options.push(completeOption);
        }
        localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
    }


    // 將新增的選項加入選單
    function addOption(title, prompt) {
        var option = document.createElement('option');
        option.value = prompt;
        option.innerHTML = title;
        select.appendChild(option);
    }

    // 新增按鈕點擊事件處理函數
    var addButton = document.getElementById('add-button');
    addButton.addEventListener('click', function () {
        var title = newTitle.value;
        var prompt = newPrompt.value;
        if (title && prompt) {
            // 將 title 與 prompt 組成一個字串，並加入 options
            var optionValue = title + '|' + prompt;
            options.push(optionValue);
            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));

            // 將選項加入選單
            addOption(title, prompt);
        }
    });

    // 監聽刪除按鈕的點擊事件
    var deleteButton = document.getElementById('delete-button');
    deleteButton.addEventListener('click', function () {
        var selectedOption = select.options[select.selectedIndex];
        var title = selectedOption.text;
        var prompt = selectedOption.value;
        var index = options.indexOf(title + '|' + prompt);
        if (index !== -1) {
            options.splice(index, 1);
            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
            select.removeChild(selectedOption);

            // 如果還有項目，就將 textarea 更新為新選項的內容
            if (select.options.length > 0) {
                newPrompt.value = select.options[0].value;
            } else {
                newPrompt.value = '';
            }
        }
    });

    // 監聽 newTitle 輸入框的點擊事件
    newTitle.addEventListener('click', function () {
        this.select();
        this.setSelectionRange(0, this.value.length);
    });

    // 監聽使用按鈕的點擊事件
    var useButton = document.getElementById('use-button');
    useButton.addEventListener('click', function () {
        var value = select.value;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: function (value) {
                    var textarea = document.querySelector('#__next form.stretch textarea');
                    textarea.value = value;

                    // 檢查是否需要展開為多行
                    if (textarea.scrollHeight > textarea.clientHeight) {
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }
                },
                args: [value]
            });
        });
    });

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

    // 將 localStorage 內的字串陣列加入選單中
    for (var i = 0; i < options.length; i++) {
        var optionValue = options[i];
        // 分離 title 與 prompt
        var title = optionValue.substring(0, optionValue.indexOf("|"));
        var prompt = optionValue.substring(optionValue.indexOf("|") + 1);
        // 如果該項目不是 title 與 prompt 組合，就從 options 與 localStorage 中移除
        if (title === "" || prompt === "") {
            options.splice(i, 1);
            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
            i--;
            continue;
        }
        var option = document.createElement('option');
        option.value = prompt;
        option.innerHTML = title;
        select.appendChild(option);
    }

    // 判斷是否有選擇項目，並將該項目完整內容填入 textarea 中
    if (select.selectedIndex !== -1) {
        var optionValue = select.options[select.selectedIndex].value;
        var optionTitle = select.options[select.selectedIndex].text;
        newPrompt.value = optionValue;
        newTitle.value = optionTitle;
    }
});
