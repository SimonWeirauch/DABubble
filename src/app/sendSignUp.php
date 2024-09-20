<?php

switch ($_SERVER['REQUEST_METHOD']) {
    case "OPTIONS": // Allow preflighting to take place.
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;

    case "POST": // Send the email;
        header("Access-Control-Allow-Origin: *");

        // Payload is not sent to $_POST Variable, it is sent to php://input as a text
        $json = file_get_contents('php://input');
        // Parse the Payload from text format to Object
        $params = json_decode($json);

        // Ensure all required parameters are present and not undefined
        if (isset($params->email) && isset($params->name) && isset($params->logIn)) {
            $email = $params->email;
            $name = $params->name;
            $logIn = $params->logIn;

            $recipient = $email;
            $subject = "Contact From BubbleTeam";
            $message = "Hello " . htmlspecialchars($name) . ",<br><br>thank you for registering with Bubble. Click <a href='" . htmlspecialchars($logIn) . "'>here</a> to log in.<br><br>Login link: <a href='" . htmlspecialchars($logIn) . "'>" . htmlspecialchars($logIn) . "</a><br><br>If you have not registered, please contact us immediately to delete your account.";

            $headers   = array();
            $headers[] = 'MIME-Version: 1.0';
            $headers[] = 'Content-type: text/html; charset=utf-8';
            $headers[] = "From: noreply@bubbleteam.com";

            mail($recipient, $subject, $message, implode("\r\n", $headers));
        } else {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(["error" => "Invalid input. Required fields are missing."]);
        }
        break;

    default: // Reject any non-POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
}
