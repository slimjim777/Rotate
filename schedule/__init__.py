# -*- coding: utf-8 -*-
import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.secret_key = os.environ["SECRET_KEY"]

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["DATABASE_URL"]
app.config['GCLIENT_ID'] = os.environ['GCLIENT_ID']
app.config['GCLIENT_SECRET'] = os.environ['GCLIENT_SECRET']
app.config['DATE_FORMAT'] = '%Y-%m-%d'
app.config['PAGE_SIZE'] = os.environ.get('PAGE_SIZE', '20')
app.config['URL_ROOT'] = os.environ['URL_ROOT']

# Mail setup
app.config['EMAIL_FROM'] = os.environ.get("EMAIL_FROM", "portal@example.com")
app.config['MAIL_SERVER'] = os.environ.get("MAIL_SERVER", "localhost")
app.config['MAIL_PORT'] = os.environ.get("MAIL_PORT", 25)
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

import schedule.authorize
import schedule.views_event
import schedule.views_person
import schedule.views_song
import schedule.views_rest
