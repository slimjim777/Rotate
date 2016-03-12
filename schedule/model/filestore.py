from schedule import app
from ftplib import FTP
import requests


class FileStore(object):

    def put(self, song_id, filename, file_data):
        """
        Upload a file to the store.
        """
        data = {
            'song_id': song_id, 'filename': filename, 'file_data': file_data,
            'code': app.config['FILESTORE_CODE']
        }

        resp = requests.post(app.config['FILESTORE_URL'], data)
        print(resp.text)
        return resp.text
