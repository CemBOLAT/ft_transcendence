import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(subject, message, from_email, to_email, smtp_server, smtp_port, smtp_user, smtp_password):
    try:
        # E-posta mesajını oluşturma
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        # SMTP sunucusuna bağlanma ve oturum açma
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # TLS kullanımı
        server.login(smtp_user, smtp_password)

        # E-postayı gönderme
        server.send_message(msg)
        server.quit()

        print("E-posta başarıyla gönderildi!")
    except Exception as e:
        print(f"E-posta gönderilirken hata oluştu: {e}")