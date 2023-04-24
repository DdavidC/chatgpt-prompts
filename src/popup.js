document.addEventListener('DOMContentLoaded', function () {
    var exportButton = document.getElementById('export-button');
    var importButton = document.getElementById('import-button');
    var resetButton = document.getElementById('reset-button');
    var searchInput = document.getElementById('search-input');
    var clearButton = document.getElementById('clear-button');
    var promptSelect = document.getElementById('prompt-select');
    var moveUpButton = document.getElementById('move-up');
    var moveDownButton = document.getElementById('move-down');
    var addButton = document.getElementById('add-button');
    var deleteButton = document.getElementById('delete-button');
    var newTitle = document.getElementById('new-title');
    var newPrompt = document.getElementById('new-prompt');
    var directInputCheckbox = document.getElementById('direct-input-checkbox');
    var useButton = document.getElementById('use-button');

    function getPromptObjAtIndex(index) {
        if (index < 0) {
            return null;
        }
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
        return promptList[index];
    }

    function createNewPromptObj(title, prompt, isDirectInput) {
        return {
            title: title,
            prompt: prompt,
            isDirectInput: isDirectInput
        };
    }

    function addPromptObjToPromptSelect(promptObj, index) {
        var option = document.createElement('option');
        option.value = index;
        option.text = promptObj.title;
        promptSelect.add(option);
    }

    function loadPromptObjectToUI(promptObject) {
        if (!promptObject) {
            return;
        }
        newTitle.value = promptObject.title;
        newPrompt.value = promptObject.prompt;
        directInputCheckbox.checked = promptObject.isDirectInput;
    }

    function savePromptObj(promptObj) {
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
        promptList.push(promptObj);
        localStorage.setItem('promptList', JSON.stringify(promptList));
    }

    function filterPromptList(keyword) {
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
        promptSelect.innerHTML = '';
        for (var i = 0; i < promptList.length; i++) {
            var promptObj = promptList[i];
            if (promptObj.title.indexOf(keyword) >= 0) {
                addPromptObjToPromptSelect(promptObj, i);
            }
        }
        if (promptSelect.options.length > 0) {
            promptSelect.selectedIndex = 0;
            loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
        }
    }

    exportButton.addEventListener('click', function () {
        var filename = window.prompt('請輸入檔名', 'prompts.json');
        if (!filename) {
            return;
        }
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
        var content = JSON.stringify(promptList, null, 2);
        var blob = new Blob([content], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });

    importButton.addEventListener('click', function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () {
                try {
                    var importedPromptList = JSON.parse(reader.result);
                    localStorage.setItem('promptList', JSON.stringify(importedPromptList));
                    filterPromptList(searchInput.value);
                } catch (e) {
                    alert('匯入失敗：' + e.message);
                }
            };
        };
        input.click();
    });

    resetButton.addEventListener('click', function () {
        localStorage.removeItem('promptList');
        promptSelect.innerHTML = '';
    });

    searchInput.addEventListener('input', function () {
        var searchStr = searchInput.value.trim().toLowerCase();
        filterPromptList(searchStr);
    });

    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        filterPromptList('');
    });

    promptSelect.addEventListener('change', function () {
        loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
    });

    function swapPrompt(selectIndex1, selectIndex2, promptListIndex1, promptListIndex2) {
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
        var temp = promptList[promptListIndex1];
        promptList[promptListIndex1] = promptList[promptListIndex2];
        promptList[promptListIndex2] = temp;
        localStorage.setItem('promptList', JSON.stringify(promptList));

        var tempOption = promptSelect.options[selectIndex1];
        promptSelect.remove(selectIndex1);
        promptSelect.add(tempOption, selectIndex2);

        var tempIndex = promptSelect.options[selectIndex1].value;
        promptSelect.options[selectIndex1].value = promptSelect.options[selectIndex2].value;
        promptSelect.options[selectIndex2].value = tempIndex;

        promptSelect.selectedIndex = selectIndex2;
    }

    moveUpButton.addEventListener('click', function () {
        if (promptSelect.selectedIndex <= 0) {
            return;
        }
        swapPrompt(
            promptSelect.selectedIndex, promptSelect.selectedIndex - 1,
            promptSelect.options[promptSelect.selectedIndex].value, promptSelect.options[promptSelect.selectedIndex - 1].value
        );
        loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
    });

    moveDownButton.addEventListener('click', function () {
        if (promptSelect.selectedIndex >= promptSelect.options.length - 1) {
            return;
        }
        swapPrompt(
            promptSelect.selectedIndex, promptSelect.selectedIndex + 1,
            promptSelect.options[promptSelect.selectedIndex].value, promptSelect.options[promptSelect.selectedIndex + 1].value
        );
        loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
    });

    addButton.addEventListener('click', function () {
        var title = newTitle.value;
        var prompt = newPrompt.value;
        var isDirectInput = directInputCheckbox.checked;

        if (!title || !prompt) {
            alert('請輸入標題和 prompt！');
            return;
        }

        var newPromptObj = createNewPromptObj(title, prompt, isDirectInput);
        var currentLength = promptSelect.options.length;
        addPromptObjToPromptSelect(newPromptObj, promptSelect.options.length);
        savePromptObj(newPromptObj);
        filterPromptList(searchInput.value);
        if (promptSelect.options.length > currentLength) {
            promptSelect.selectedIndex = promptSelect.options.length - 1;
        }
        loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
    });

    deleteButton.addEventListener('click', function () {
        var selectedIndex = promptSelect.selectedIndex;
        var promptListIndex1 = promptSelect.options[selectedIndex].value;
        var promptList = JSON.parse(localStorage.getItem('promptList')) || [];

        promptList.splice(promptListIndex1, 1);
        localStorage.setItem('promptList', JSON.stringify(promptList));

        promptSelect.remove(selectedIndex);
        filterPromptList(searchInput.value);
        loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));
    });

    newTitle.addEventListener('click', function () {
        this.select();
        this.setSelectionRange(0, this.value.length);
    });

    useButton.addEventListener('click', function () {
        var promptObj = getPromptObjAtIndex(promptSelect.options[promptSelect.selectedIndex].value);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: function (prompt, directInput) {
                    var textarea = document.querySelector('#__next form.stretch textarea');
                    textarea.value = prompt;

                    // 檢查是否需要展開為多行
                    if (textarea.scrollHeight > textarea.clientHeight) {
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }

                    if (directInput) { // 如果直接輸入的 checkbox 被勾選了
                        var button = document.querySelector("#__next form.stretch button");
                        button.click();
                    }
                },
                args: [promptObj.prompt, promptObj.isDirectInput]
            });
        });
    });

    var promptList = JSON.parse(localStorage.getItem('promptList')) || [];
    for (var i = 0; i < promptList.length; i++) {
        var option = document.createElement('option');
        promptObj = promptList[i];
        addPromptObjToPromptSelect(promptObj, i);
    }
    loadPromptObjectToUI(getPromptObjAtIndex(promptSelect.selectedIndex));

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
                var chatGPTTextarea = document.querySelector('#__next form.stretch textarea');
                if (!chatGPTTextarea) {
                    return null;
                }
                return textarea.value;
            }
        }, function (results) {
            if (results && results[0].result) {
                loadPromptObjectToUI(createNewPromptObj('從 ChatGPT 輸入框中取得', results[0].result, false));
            }
        });
    });
});
