from schedule.model.query import FastQuery
from schedule.model.query_song import SongQuery
from schedule.authorize import login_required
from schedule import app
from schedule.model.transpose import Transpose
from flask import request
from flask import jsonify
from flask import session
from flask import abort
import json

ROLE_SETLIST = 'set-list'
ROLE_STANDARD = 'standard'
ROLE_ADMIN = 'admin'
SONG_ROLES = [ROLE_SETLIST, ROLE_STANDARD, ROLE_ADMIN]


@app.route('/api/songs', methods=['POST'])
@login_required
def api_song_list():
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    active = request.json.get('active')
    songs = SongQuery.songs(active)
    return jsonify({'response': 'Success', 'songs': songs})


@app.route('/api/songs/<int:song_id>', methods=['GET'])
@login_required
def api_song_get(song_id):
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    song = SongQuery.song(song_id)
    return jsonify({'response': 'Success', 'song': song})


@app.route('/api/songs/new', methods=['POST'])
@login_required
def api_song_new():
    if session['music_role'] not in [ROLE_ADMIN]:
        abort(403)

    try:
        song = SongQuery.song_new(request.json['song'])
        return jsonify({'response': 'Success', 'song': song})
    except Exception as v:
        app.logger.error(str(v))
        return jsonify(
            {'response': 'Error',
             'message': 'Error saving the song. Check that the song details.'})


@app.route('/api/songs/<int:song_id>', methods=['PUT'])
@login_required
def api_song_update(song_id):
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    try:
        song = request.json['song']
        song['id'] = song_id
        SongQuery.song_update(song)
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route('/api/songs/find', methods=['POST'])
@login_required
def api_song_find():
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    songs = SongQuery.song_find(request.json['q'])
    return jsonify({'response': 'Success', 'songs': songs})


@app.route('/api/songs/<int:song_id>/attachments', methods=['GET'])
@login_required
def api_song_attachments(song_id):
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    attachments = SongQuery.song_attachments(song_id)
    return jsonify({'response': 'Success', 'attachments': attachments})


@app.route('/api/songs/<int:song_id>/attachments', methods=['POST'])
@login_required
def api_song_attachments_add(song_id):
    if session['music_role'] != ROLE_ADMIN:
        abort(403)

    try:
        filename = request.json['filename']
        file_data = request.json['data']

        resp = SongQuery.song_attachments_add(song_id, filename, file_data)
        return jsonify({'response': 'Success', 'path': resp})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route(
    '/api/songs/<int:song_id>/attachments/<int:att_id>', methods=['DELETE'])
@login_required
def api_song_attachments_delete(song_id, att_id):
    if session['music_role'] != ROLE_ADMIN:
        abort(403)

    try:
        resp = SongQuery.song_attachments_delete(song_id, att_id)
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/setlists", methods=['GET'])
@login_required
def api_setlists():
    try:
        from_date, to_date = FastQuery.date_range(
            request.args.get('range', 12))
        setlists = SongQuery.setlists(from_date, to_date)
        return jsonify({'response': 'Success', 'setlists': setlists})
    except Exception as v:
        print(str(v))
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route(
    "/api/events/<int:event_id>/<on_date>/setlist_exists", methods=['GET'])
@login_required
def api_event_setlist_exists(event_id, on_date):
    """
    Check if a setlist for a date exists and verifies that the user has
    permissions to see it.
    """
    if session['music_role']:
        exists = SongQuery.setlist_exists(event_id, on_date)
    else:
        exists = False
    return jsonify({'response': 'Success', 'exists': exists})


@app.route("/api/events/<int:event_id>/<on_date>/setlist", methods=['GET'])
@login_required
def api_event_setlist_get(event_id, on_date):
    setlist = SongQuery.setlist(event_id, on_date)
    return jsonify({'response': 'Success', 'setlist': setlist})


@app.route("/api/events/<int:event_id>/<on_date>/setlist", methods=['POST'])
@login_required
def api_event_setlist_update(event_id, on_date):
    """
    Upsert the set list as a JSON string.
    """
    setlist = request.json.get('setlist')

    SongQuery.upsert_event_date_setlist(event_id, on_date, setlist)
    return jsonify({'response': 'Success'})


@app.route('/api/songs/chart/<int:attachment_id>', methods=['GET'])
@login_required
def api_song_chart(attachment_id):
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    chart = SongQuery.song_chart(attachment_id)
    return jsonify({'response': 'Success', 'chart': chart})


@app.route(
    '/api/songs/chart/<int:attachment_id>/transpose', methods=['POST'])
@login_required
def api_song_chart_transpose(attachment_id):
    if session['music_role'] not in [ROLE_STANDARD, ROLE_ADMIN]:
        abort(403)

    key = request.json.get('key')
    chart = request.json.get('chart')

        # Transpose the song
    t = Transpose(chart, key)
    return jsonify({'response': 'Success', 'chart': t.song})
