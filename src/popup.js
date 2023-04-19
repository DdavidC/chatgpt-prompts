document.addEventListener('DOMContentLoaded', function () {
    var options = JSON.parse(localStorage.getItem('chatGPTPromptList')) || [];
    var searchInput = document.getElementById('search-input');
    var clearButton = document.getElementById('clear-button');
    var select = document.getElementById('prompt-select');
    var useButton = document.getElementById('use-button');
    var deleteButton = document.getElementById('delete-button');
    var newTitle = document.getElementById('new-title');
    var newPrompt = document.getElementById('new-prompt');
    var addButton = document.getElementById('add-button');

    // 監聽搜尋輸入框的輸入事件
    searchInput.addEventListener('input', function() {
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
    clearButton.addEventListener('click', function() {
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

    // 監聽選單的選擇事件
    select.addEventListener('change', function () {
        var optionValue = select.value;
        var optionTitle = select.options[select.selectedIndex].text;
        newPrompt.value = optionValue;
        newTitle.value = optionTitle;
    });

    // 監聽使用按鈕的點擊事件
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

    // 監聽刪除按鈕的點擊事件
    deleteButton.addEventListener('click', function () {
        var value = select.value;
        var index = options.indexOf(value);
        if (index !== -1) {
            options.splice(index, 1);
            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));
            select.removeChild(select.options[select.selectedIndex]);

            // 如果還有項目，就將 textarea 更新為新選項的內容
            if (select.options.length > 0) {
                newPrompt.value = select.options[0].value;
            } else {
                newPrompt.value = '';
            }
        }
    });

    // 新增按鈕點擊事件處理函數
    addButton.addEventListener('click', function () {
        var title = newTitle.value;
        var prompt = newPrompt.value;
        if (title && prompt) {
            // 將 title 與 prompt 組成一個字串，並加入 options
            var optionValue = title + '|' + prompt;
            options.push(optionValue);
            localStorage.setItem('chatGPTPromptList', JSON.stringify(options));

            // 將新增的選項加入選單
            var option = document.createElement('option');
            option.value = prompt;
            option.innerHTML = title;
            select.appendChild(option);
        }
    });

    // 監聽選單的選擇事件
    select.addEventListener('change', function () {
        var value = select.value;
        newPrompt.value = value;
    });
});
