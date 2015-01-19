from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from schedule.model.query import FastQuery
from schedule import app
from jinja2 import Environment, PackageLoader


def notify_days_ahead(days):
    """
    Send Email notification to the people that are on rota in n days time.
    """
    env = Environment(loader=PackageLoader('schedule', 'templates'))
    template = env.get_template('email_notify.html')
    on_rota = FastQuery.notify_people_on_rota(days)

    for name, rotas in on_rota.items():
        message = template.render(name=name, rotas=rotas,
                                  url_root=app.config['URL_ROOT'])
        send_email(rotas['person_email'],
                   email_message(rotas['person_email'], message))


def custom_date_format(fmt, t):
    return t.strftime(fmt).replace('{S}', str(t.day) + suffix(t.day))


def suffix(d):
    return 'th' if 11 <= d <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(
        d % 10, 'th')


def email_message(to_email, body_text):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Life Church Rota Reminder'
    msg['From'] = app.config['EMAIL_FROM']
    msg['To'] = to_email
    msg.attach(MIMEText(body_text, 'plain'))
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
