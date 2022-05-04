let messages__container = document.getElementById('messages');

let sendForm = document.getElementById('chat-form');
let messageInput = document.getElementById('message-text');
let lastDate = null;

let loginForm = document.getElementById('authorization-form-container');
let loginForm__login = document.getElementById('loginInput');
let loginForm__password = document.getElementById('passwordInput');

function openAuthorizationForm() {
    document.getElementById("authorization-form").style.display = "block";
}

function closeAuthorizationForm() {
    document.getElementById("authorization-form").style.display = "none";
}

// Логин
loginForm.onsubmit = async (e) => {
    e.preventDefault();

    fetch('chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            act: "login",
            login: loginForm__login.value,
            password: loginForm__password.value,
        }),
    })
        .then(response => response.text())
        .then(result => {
            if (result === "incorrect_data") {
                alert("Введены неверные логин или пароль");
            }
            else {
                closeAuthorizationForm();
            }
        });
}

// Регистрация
function register() {
    fetch('chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            act: "registration",
            login: loginForm__login.value,
            password: loginForm__password.value,
        }),
    })
        .then(response => response.text())
        .then(result => {
            if (result === "login_taken") {
                alert("Пользователь с таким именем уже существует");
            }
            else {
                closeAuthorizationForm();
            }
        });
}

// Отправка сообщений
sendForm.onsubmit = async (e) => {
    e.preventDefault();

    fetch('/chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            act: "send",
            messageData: {
                date: new Date().toString(),
                message: messageInput.value,
            }
        }),
    })
        .then(response => response.text())
        .then(result => {
            switch (result) {
                case "not_authorized":
                    openAuthorizationForm();
                    break;

                case "user_does_not_exist":
                    openAuthorizationForm();
                    break;

                case "OK":
                    break;
            }
        })

    messageInput.value = "";
};

// Загрузка сообщений
function update(date) {
    fetch('chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            act: "load",
            date: date,
        }),
    })
        .then(response => response.json())
        .then(result => {
            if (result !== null) {
                messages__container.innerText = "";
                for (let i = 0; i < result.length; i++) {
                    addMessage(result[i]);
                    lastDate = result[i]['date'];
                }
            }
        })
}

let updateTimer = setInterval(() => update(lastDate), 200);

function addMessage(message) {
    let date = new Date(message['date']);
    date = date.getFullYear().toString() + "." + (date.getMonth() + 1).toString() + "." + date.getDate().toString() +
    " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    messages__container.innerHTML += "" +
        "<div class='chat__message'>" +
            date + " | " + message['user'] + ": " + message['message'] +
        "</div>"
}



