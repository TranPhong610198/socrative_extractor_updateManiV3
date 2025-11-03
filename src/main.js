function extractData(callback = (linkToExtract) => {}) {
    const userInfos = JSON.parse(localStorage.localUser);
    const roomCode = userInfos.room;
    const urlGetActivityID = `https://api.socrative.com/rooms/api/current-activity/${roomCode}`;
    fetch(urlGetActivityID)
        .then(response => response.json())
        .then((data) => {
            const quizCode = data.activity_id;
            callback(`https://teacher.socrative.com/quizzes/${quizCode}/student?room=${roomCode}`);
        });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request === "EXTRACT_DATA") {
        setTimeout(function() {
            extractData((linkToExtract) => {
                // Đã cập nhật: chrome.extension.sendRequest -> chrome.runtime.sendMessage
                chrome.runtime.sendMessage({ type: "LINK_EXTRACT", payload: linkToExtract });
            });
        }, 1000);
        // Tùy chọn: trả về true nếu bạn xử lý không đồng bộ
        // return true;
    }
});