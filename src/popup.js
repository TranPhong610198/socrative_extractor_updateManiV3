document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('button').addEventListener('click', () => {
        extractData();
    });
});

// Đã cập nhật: chrome.extension.onRequest -> chrome.runtime.onMessage
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "LINK_EXTRACT") {
        console.log(message.payload);
        getQuizData(message.payload, (data) => {
            openDocument(data);
        });
        // Tùy chọn: trả về true nếu bạn cần gửi phản hồi không đồng bộ
        // return true; 
    }
});

function extractData() {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        // Gửi tin nhắn đến content script trong tab đang hoạt động
        chrome.tabs.sendMessage(tabs[0].id, "EXTRACT_DATA");
    });
}

function getQuizData(linkExtract, callback = () => {}) {
    fetch(linkExtract)
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            callback(data);
        });
}

function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function openDocument(documentData) {
    render();
    function render() {
        if (documentData === undefined) {
            alert('The room has no activity yet. Please wait for the teacher to start the quiz.');
        }

        // Đã cập nhật: chrome.runtime.getPackageDirectoryEntry -> chrome.runtime.getURL
        // và sử dụng fetch để đọc tệp cục bộ
        fetch(chrome.runtime.getURL("model.html"))
            .then(response => response.text())
            .then(htmlText => {
                load(htmlText);
            })
            .catch(error => {
                console.error(error);
            });


        function load(htmlText) {
            htmlText = htmlText.replace('#socrativeDataInsertion', JSON.stringify(documentData));
            const previewDocument = window.open('about:blank'); // Sử dụng 'about:blank' thay vì 'url'
            previewDocument.document.write(htmlText);
            previewDocument.document.close(); // Quan trọng: đóng document sau khi ghi

            // Gán dữ liệu vào cửa sổ mới
            previewDocument.socrativeData = documentData;
        }
    }
}