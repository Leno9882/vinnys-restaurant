<?php
/**
 * Vinny's Ristorante - Reservation Handler (Slack & Backup Email)
 */

 if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Collect and Sanitize Data
    $name     = strip_tags(trim($_POST["customer_name"]));
    $phone    = strip_tags(trim($_POST["customer_phone"]));
    $guests   = strip_tags(trim($_POST["guest_count"]));
    $date     = strip_tags(trim($_POST["res_date"]));
    $time     = strip_tags(trim($_POST["res_time"]));
    $occasion = strip_tags(trim($_POST["occasion"]));
    $requests = isset($_POST["special_requests"]) ? strip_tags(trim($_POST["special_requests"])) : "";

    // 2. YOUR SLACK WEBHOOK URL (Critical!)
    $slack_webhook_url = "https://hooks.slack.com/services/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";

    // 3. Construct the Slack Message (Professional Block Format)
    $message = [
        "text" => "🚨 New Reservation for $name",
        "blocks" => [
            [
                "type" => "header",
                "text" => ["type" => "plain_text", "text" => "🍝 New Reservation Request"]
            ],
            [
                "type" => "section",
                "fields" => [
                    ["type" => "mrkdwn", "text" => "*Customer:*\n$name"],
                    ["type" => "mrkdwn", "text" => "*Phone:*\n$phone"],
                    ["type" => "mrkdwn", "text" => "*Date:*\n$date"],
                    ["type" => "mrkdwn", "text" => "*Time:*\n$time"],
                    ["type" => "mrkdwn", "text" => "*Guests:*\n$guests"],
                    ["type" => "mrkdwn", "text" => "*Occasion:*\n$occasion"]
                ]
            ],
            [
                "type" => "section",
                "text" => [
                    "type" => "mrkdwn",
                    "text" => "*Special Requests:*\n" . ($requests ? $requests : "_None provided_")
                ]
            ],
            [
                "type" => "divider"
            ]
        ]
    ];

    // 4. Send to Slack using cURL
    $ch = curl_init($slack_webhook_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // 5. Final Logic: Did it work?
    if ($httpCode == 200) {
        header("Location: thank-you.html?status=success");
        exit;
    } else {
        // FAIL: If Slack fails, send an emergency email as backup
        $backup_subject = "BACKUP ALERT: Reservation for $name";
        $backup_body = "Slack notification failed. Reservation details:\n\nName: $name\nPhone: $phone\nDate: $date\nTime: $time\nGuests: $guests\nOccasion: $occasion";
        mail("owner@vinnysristorante.com", $backup_subject, $backup_body);
        
        // Still redirect to success so the customer doesn't panic
        header("Location: thank-you.html?status=success");
        exit;
    }

} else {
    // If accessed directly, send back to home
    header("Location: index.html");
    exit;
}
?>