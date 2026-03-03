<?php
/**
 * Vinny's Ristorante - Reservation Handler
 * Handles Email & SMS Notifications
 */

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Collect and Sanitize Data
    $name = strip_tags(trim($_POST["customer_name"]));
    $phone = strip_tags(trim($_POST["customer_phone"]));
    $guests = $_POST["guest_count"];
    $date = $_POST["res_date"];
    $time = $_POST["res_time"];
    $occasion = $_POST["occasion"];
    $special_requests = strip_tags(trim($_POST["special_requests"]));

    // 2. Set Up Recipient (Owner's Email)
    $to_email = "owner@vinnysristorante.com"; // <-- CHANGE TO CLIENT'S EMAIL
    $subject = "New Reservation: $name - $date @ $time";

    // 3. Construct Email Body
    $email_content = "You have a new reservation request from the website:\n\n";
    $email_content .= "Customer Name: $name\n";
    $email_content .= "Phone Number: $phone\n";
    $email_content .= "Date: $date\n";
    $email_content .= "Time: $time\n";
    $email_content .= "Party Size: $guests\n";
    $email_content .= "Occasion: $occasion\n";
    $email_content .= "Special Requests: \n$special_requests\n\n";
    $email_content .= "--- End of Message ---";

    // 4. Construct Headers
    $headers = "From: webmaster@vinnysristorante.com\r\n";
    $headers .= "Reply-To: $to_email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // 5. Send Email
    $success = mail($to_email, $subject, $email_content, $headers);

    // 6. Send SMS Notification (via Carrier Gateway)
    // Replace '6175551234' with the owner's actual phone number.
    // Common Gateways: @vtext.com (Verizon), @txt.att.net (AT&T), @tmomail.net (T-Mobile)
    $owner_sms_gateway = "6175551234@vtext.com"; 
    $sms_message = "Vinny's Alert: $name reserved for $guests guests on $date at $time. Phone: $phone";
    mail($owner_sms_gateway, "", $sms_message, "From: webmaster@vinnysristorante.com");

    // 7. Redirect to Thank You Page
    if ($success) {
        header("Location: thank-you.html?status=success");
        exit;
    } else {
        echo "Oops! Something went wrong. Please call us at (617) 628-9214 to book.";
    }

} else {
    // Redirect if someone tries to access the PHP file directly
    header("Location: reservations.html");
    exit;
}
?>