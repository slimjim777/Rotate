# -*- coding: utf-8 -*-
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.secret_key = os.environ["SECRET_KEY"]

if os.environ.get("OPENSHIFT_POSTGRESQL_DB_URL"):
    database_url = "%s/%s" % (
        os.environ["OPENSHIFT_POSTGRESQL_DB_URL"],
        os.environ["OPENSHIFT_APP_NAME"])
else:
    database_url = os.environ["DATABASE_URL"]

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['GCLIENT_ID'] = os.environ['GCLIENT_ID']
app.config['GCLIENT_SECRET'] = os.environ['GCLIENT_SECRET']
app.config['DATE_FORMAT'] = '%Y-%m-%d'
app.config['PAGE_SIZE'] = os.environ.get('PAGE_SIZE', '20')
app.config['URL_ROOT'] = os.environ['URL_ROOT']
app.config['HASH_KEY'] = os.environ['HASH_KEY']

# Mail setup
app.config['EMAIL_FROM'] = os.environ.get("EMAIL_FROM", "portal@example.com")
app.config['MAIL_SERVER'] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config['MAIL_SERVER_IMAP'] = os.environ.get(
    "MAIL_SERVER_IMAP", "imap.gmail.com")
app.config['MAIL_PORT'] = os.environ.get("MAIL_PORT", 25)
app.config['MAIL_PORT_IMAP'] = os.environ.get("MAIL_PORT_IMAP", 993)
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")
if os.environ.get("MAIL_USE_TLS") == "True":
    app.config['MAIL_USE_TLS'] = True
if os.environ.get("MAIL_USE_SSL") == "True":
    app.config['MAIL_USE_SSL'] = True

app.config['FILESTORE_URL'] = os.environ.get("FILESTORE_URL")
app.config['FILESTORE_SITE'] = os.environ.get("FILESTORE_SITE")
app.config['FILESTORE_USER'] = os.environ.get("FILESTORE_USER")
app.config['FILESTORE_PASSWORD'] = os.environ.get("FILESTORE_PASSWORD")

app.debug = True if os.environ.get("DEBUG", False) else False


db = SQLAlchemy(app)

# import schedule.authorize
import schedule.authorize_pw
import schedule.views_event
import schedule.views_person
import schedule.views_song
import schedule.views_rest
import schedule.views_vintage
