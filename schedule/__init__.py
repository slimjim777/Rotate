# -*- coding: utf-8 -*-
import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["DATABASE_URL"]
app.debug = True

db = SQLAlchemy(app)

import schedule.views
