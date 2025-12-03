<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];
        $fileType = $file['type'];

        $fileExt = explode('.', $fileName);
        $fileActualExt = strtolower(end($fileExt));

        $allowed = array('jpg', 'jpeg', 'png', 'gif', 'webp');

        if (in_array($fileActualExt, $allowed)) {
            if ($fileError === 0) {
                if ($fileSize < 5000000) { // 5MB
                    $fileNameNew = uniqid('', true) . "." . $fileActualExt;
                    $fileDestination = 'uploads/' . $fileNameNew;

                    if (move_uploaded_file($fileTmpName, $fileDestination)) {
                        // Return the full URL
                        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                        $host = $_SERVER['HTTP_HOST'];
                        $url = "$protocol://$host/api/$fileDestination";

                        echo json_encode(['url' => $url]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to move uploaded file']);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'File is too big']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'There was an error uploading your file']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'You cannot upload files of this type']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
    }
}
?>