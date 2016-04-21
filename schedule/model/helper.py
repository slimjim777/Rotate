from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import imaplib
import email
import base64
import io
import codecs
from schedule.model.query import FastQuery
from schedule.model.query_song import SongQuery
from schedule import app
from jinja2 import Environment, PackageLoader


def notify_days_ahead(days, reminder_type, week):
    """
    Send Email notification to the people that are on rota in n days time.
    """
    env = Environment(loader=PackageLoader('schedule', 'templates'))
    template_html = env.get_template('email_notify.html')
    template_txt = env.get_template('email_notify.txt')
    on_rota = FastQuery.notify_people_on_rota(days)

    for name, rotas in on_rota.items():
        message_html = template_html.render(name=name, rotas=rotas, week=week,
                                            url_root=app.config['URL_ROOT'])
        message_txt = template_txt.render(name=name, rotas=rotas, week=week,
                                          url_root=app.config['URL_ROOT'])

        subject = "%sRota Reminder for %s Week" % (reminder_type, week)
        mime_text = email_message(
            rotas['person_email'], subject, message_txt, message_html)

        send_email(rotas['person_email'], mime_text)


def custom_date_format(fmt, t):
    return t.strftime(fmt).replace('{S}', str(t.day) + suffix(t.day))


def suffix(d):
    return 'th' if 11 <= d <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(
        d % 10, 'th')


def email_message(to_email, subject, body_text, body_html):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = app.config['EMAIL_FROM']
    msg['To'] = to_email
    msg.attach(MIMEText(body_text, 'plain'))
    msg.attach(MIMEText(body_html, 'html'))
    return msg


def send_email(to_list, mime_text):
    server = smtplib.SMTP('%s:%s' % (app.config['MAIL_SERVER'],
                                     app.config['MAIL_PORT']))
    if app.config.get('MAIL_USE_TLS'):
        app.logger.debug('Start TLS')
        server.ehlo()
        server.starttls()
    server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
    server.sendmail(app.config['EMAIL_FROM'], to_list, mime_text.as_string())
    server.quit()


def email_song_upload():
    """
    Read the Email and look for new song Emails. Create new songs and save the
    attachments.
    """
    app.logger.info("Email Song Upload -- start")
    # Login to the mail server
    imap = imaplib.IMAP4_SSL(
        app.config.get('MAIL_SERVER_IMAP'),
        port=app.config.get('MAIL_PORT_IMAP'))
    imap.login(
        app.config.get('MAIL_USERNAME'), app.config.get('MAIL_PASSWORD'))

    # Select the inbox
    imap.select()

    # Search for the messages
    typ, msgnums = imap.search(None, '(SUBJECT "your song:" UNSEEN)')

    for num in msgnums[0].split():
        try:
            typ, data = imap.fetch(num, '(RFC822)')
        except:
            imap.close()

        msg = email.message_from_string(data[0][1].decode('utf-8'))
        song_name = msg.get('SUBJECT').split(':')[-1].strip()

        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_maintype() != 'multipart' and \
                        part.get('Content-Disposition') is not None:

                    # Get the filename and file contents (unknown encoding)
                    filename = part.get_filename()
                    payload = part.get_payload(decode=True)

                    # Re-encode the file to utf-8
                    f = io.BytesIO(payload)
                    new_f = codecs.StreamRecoder(
                        f, codecs.getencoder('utf-8'),
                        codecs.getdecoder('utf-8'),
                        codecs.getreader('latin-1'),
                        codecs.getwriter('latin-1'), errors='surrogateescape')

                    # Upsert the song and it's attachment
                    # (if an attachment with the name already exists, this one
                    # will be silently dropped)
                    SongQuery.song_upload(song_name, filename, new_f)

    imap.logout()
    app.logger.info("Email Song Upload -- end")
