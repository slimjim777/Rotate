from schedule import app
from schedule.model.event import Person
from flask import jsonify
from flask import redirect
from flask import request
from flask import url_for
from flask import session
from flask_oauthlib.client import OAuth
from functools import wraps


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('login_token') is None:
            return redirect(url_for('home', next=request.url))
        session.pop('messages', None)

        # Update the user's last activity time
        if 'user_id' in session:
            Person.update_last_login(session['user_id'])

        return f(*args, **kwargs)
    return decorated_function


@app.route('/login')
def login():
    return jsonify({'response': 'Success'})


@app.route('/login/authorized', methods=['GET', 'POST'])
def authorized():
    if request.method == 'POST':
        result = check_user(request.form.get('email'), request.form.get('password'))
        if result:
            return redirect('/rota/songs')
    return redirect(url_for('error'))


def check_user(email, password):
    """
    Check we have a valid app user for the Google user.
    """
    session.pop('messages', None)

    user = Person.user_check(email, password)
    if not user:
        # Reset the Google token and forbid access
        session.pop('login_token', None)
        session['messages'] = """Your Email address (%s) is not registered
            with this site. If you know you have an account here, please
            <a href="https://accounts.google.com/Logout">logout</a> of your
            Google Account and login with the account that has been registered
            with this site.""" % email
        return False
    else:
        # Save the user details in the session
        session['login_token'] = user.user_role + user.name
        session['user_id'] = user.id
        session['role'] = user.user_role
        session['music_role'] = user.music_role
        session['name'] = user.name
        return True
