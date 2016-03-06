from schedule.model.query import FastQuery
from schedule.authorize import login_required
from schedule import app
from flask import request
from flask import jsonify


@app.route('/api/songs', methods=['POST'])
@login_required
def api_song_list():
    active = request.json.get('active')
    songs = FastQuery.songs(active)
    return jsonify({'response': 'Success', 'songs': songs})

@app.route('/api/songs/<int:song_id>', methods=['GET'])
@login_required
def api_song_get(song_id):
    song = FastQuery.song(song_id)
    return jsonify({'response': 'Success', 'song': song})
