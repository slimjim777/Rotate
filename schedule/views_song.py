from schedule.model.query_song import SongQuery
from schedule.authorize import login_required
from schedule import app
from flask import request
from flask import jsonify
from flask import session
from flask import abort

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
