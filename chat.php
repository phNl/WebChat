<?php

$out = json_decode(file_get_contents('php://input'), true);

$msgFilePath = 'messages.json';
$usersFilePath = 'users.json';
$messages = json_decode(file_get_contents($msgFilePath), true);
$users = json_decode(file_get_contents($usersFilePath), true);

// Установить cookie с заданной парой логин-пароль
function setUserCookie($login) {
    setcookie("login", "$login", time()+3600);
}

// Проверка на существование записи о пользователе
function isUserExist($login, $password) {
    global $users;
    if ($login == null) return false;
    if ($users[$login] == null) return false;
    return ($users[$login] == $password);
}

// Проверка на авторизацию
function isAuthorized() {
    if (!isset($_COOKIE['login']))
        return false;

    global $users;

    return (isUserExist($_COOKIE['login'], $users[$_COOKIE['login']], $users));
}

// Попытаться зарегистрировать пользователя. Если пользователь уже существует, вернуть false.
function tryRegisterUser($login, $password) {
    if (isUserExist($login, $password))
        return false;

    global $users, $usersFilePath;
    $users[$login] = $password;
    file_put_contents($usersFilePath, json_encode($users));
    return true;
}

switch ($out['act']) {
    case 'send':
    {
        $out['messageData']['message'] = trim($out['messageData']['message']);
        if ($out['messageData']['message'] === "") {
            echo 'empty_message';
            break;
        }

        if (!isAuthorized()) {
            echo 'not_authorized';
            break;
        }

        $login = $_COOKIE['login'];
        $password = $users[$_COOKIE['login']];

        // Если пользователь существует, отправляем сообщение
        if (isUserExist($login, $password)) {
            $out['messageData']['user'] = $login;
            $messages[] = $out['messageData'];
            file_put_contents($msgFilePath, json_encode($messages));

            echo 'OK';
        }
        // Иначе отправляем ответ, что пользователь с такой парой логин-пароль не существует
        else {
            echo 'user_does_not_exist';
        }

        break;
    }

    case 'load':
    {
//        $newMessages = array();
//        foreach ($messages as $message) {
//            if ($out['date'] === null) {
//                $newMessages = $messages;
//                break;
//            }
//
//            if ($message['date'] > $out['messageData']['date']) {
//                $newMessages[] = $message;
//            }
//        }
//
//        echo json_encode($newMessages);
        echo json_encode($messages);
        break;
    }

    case 'login':
    {
        $login = $out['login'];
        $password = $out['password'];

        if (isUserExist($login, $password)) {
            setUserCookie($login);
            echo 'OK';
        }
        else {
            echo 'incorrect_data';
        }

        break;
    }

    case 'registration':
    {
        $login = $out['login'];
        $password = $out['password'];

        if (tryRegisterUser($login, $password)) {
            setUserCookie($login);
            echo 'OK';
        }
        else
            echo 'login_taken';
    }
}

