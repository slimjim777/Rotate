from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from schedule.model.query import FastQuery
from schedule import app
from jinja2 import Environment, PackageLoader


def notify_days_ahead(days, week):
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

        subject = "Life Church Rota Reminder for %s Week" % week
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
