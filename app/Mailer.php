<?php
declare(strict_types=1);

final class Mailer
{
    /** Send a plain-text message through authenticated SMTP with TLS. */
    public static function send(string $recipient, string $subject, string $body): void
    {
        $host = trim((string)(getenv('SMTP_HOST') ?: ''));
        $username = (string)(getenv('SMTP_USERNAME') ?: '');
        // Google displays App Passwords in groups for readability; SMTP needs the unspaced value.
        $password = preg_replace('/\s+/', '', (string)(getenv('SMTP_PASSWORD') ?: '')) ?? '';
        $from = trim((string)(getenv('KQ_MAIL_FROM') ?: ''));
        $port = (int)(getenv('SMTP_PORT') ?: 587);
        $encryption = strtolower(trim((string)(getenv('SMTP_ENCRYPTION') ?: 'tls')));

        if ($host === '' || $username === '' || $password === '' || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('SMTP email settings are incomplete.');
        }
        if (!in_array($encryption, ['tls', 'ssl'], true) || $port < 1 || $port > 65535) {
            throw new RuntimeException('SMTP email settings are invalid.');
        }

        $remote = ($encryption === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $context = stream_context_create(['ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'peer_name' => $host,
            'SNI_enabled' => true,
        ]]);
        $socket = @stream_socket_client($remote, $errorCode, $errorMessage, 12, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) throw new RuntimeException('SMTP connection failed (' . $errorCode . ').');
        stream_set_timeout($socket, 12);

        try {
            self::expect($socket, [220]);
            $domain = 'localhost';
            $appUrl = (string)(getenv('KQ_APP_URL') ?: '');
            $appHost = parse_url($appUrl, PHP_URL_HOST);
            if (is_string($appHost) && $appHost !== '') $domain = $appHost;
            self::command($socket, 'EHLO ' . $domain, [250]);

            if ($encryption === 'tls') {
                self::command($socket, 'STARTTLS', [220]);
                if (stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
                    throw new RuntimeException('SMTP TLS negotiation failed.');
                }
                self::command($socket, 'EHLO ' . $domain, [250]);
            }

            self::command($socket, 'AUTH LOGIN', [334]);
            self::command($socket, base64_encode($username), [334]);
            self::command($socket, base64_encode($password), [235]);
            self::command($socket, 'MAIL FROM:<' . $from . '>', [250]);
            self::command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
            self::command($socket, 'DATA', [354]);

            $safeSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
            $message = "Date: " . date(DATE_RFC2822) . "\r\n"
                . "From: KQ Event Styling <{$from}>\r\n"
                . "To: <{$recipient}>\r\n"
                . "Subject: {$safeSubject}\r\n"
                . "MIME-Version: 1.0\r\n"
                . "Content-Type: text/plain; charset=UTF-8\r\n"
                . "Content-Transfer-Encoding: quoted-printable\r\n\r\n"
                . quoted_printable_encode(str_replace(["\r\n", "\r"], "\n", $body));
            $message = str_replace("\n", "\r\n", $message);
            $message = preg_replace('/(^|\r\n)\./', '$1..', $message) ?? $message;
            self::write($socket, $message . "\r\n.\r\n");
            self::expect($socket, [250]);
            self::command($socket, 'QUIT', [221]);
        } finally {
            fclose($socket);
        }
    }

    private static function command($socket, string $command, array $expected): string
    {
        self::write($socket, $command . "\r\n");
        return self::expect($socket, $expected);
    }

    private static function write($socket, string $data): void
    {
        $length = strlen($data);
        $written = 0;
        while ($written < $length) {
            $count = fwrite($socket, substr($data, $written));
            if ($count === false || $count === 0) throw new RuntimeException('SMTP write failed.');
            $written += $count;
        }
    }

    private static function expect($socket, array $expected): string
    {
        $response = '';
        do {
            $line = fgets($socket, 2048);
            if ($line === false) throw new RuntimeException('SMTP server closed the connection.');
            $response .= $line;
            if (preg_match('/^([0-9]{3})([ -])/', $line, $match) !== 1) {
                throw new RuntimeException('SMTP server returned an invalid response.');
            }
            $code = (int)$match[1];
            $more = $match[2] === '-';
        } while ($more);

        if (!in_array($code, $expected, true)) {
            throw new RuntimeException('SMTP server rejected a mail operation (' . $code . ').');
        }
        return $response;
    }
}
