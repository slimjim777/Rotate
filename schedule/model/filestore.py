from schedule import app
from ftplib import FTP
import base64
from io import BytesIO
import requests


class FileStore(object):

    def put(self, song_id, filename, file_data):
        """
        Upload a file to the store.
        """
        ftp = FTP(
            app.config['FILESTORE_SITE'], app.config['FILESTORE_USER'],
            app.config['FILESTORE_PASSWORD'])

        try:
            ftp.cwd('songs/%d' % song_id)
        except Exception:
            ftp.mkd('songs/%d' % song_id)
            ftp.cwd('songs/%d' % song_id)

        # Open the decoded file data as a stream
        data = base64.b64decode(file_data.split(',')[1])
        f = BytesIO(data)

        # Store the file on the FTP server
        resp = ftp.storbinary("STOR " + filename, f)

        f.close()
        ftp.close()
        return "songs/%d/%s" % (song_id, filename)
