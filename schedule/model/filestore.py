from schedule import app
from ftplib import FTP
import base64
from io import BytesIO
import requests


class FileStore(object):

    def _login(self):
        return FTP(
            app.config['FILESTORE_SITE'], app.config['FILESTORE_USER'],
            app.config['FILESTORE_PASSWORD'])

    def put(self, song_id, filename, file_data, encoded=True):
        """
        Upload a file to the store.
        """
        ftp = self._login()

        try:
            ftp.cwd('songs/%d' % song_id)
        except Exception:
            ftp.mkd('songs/%d' % song_id)
            ftp.cwd('songs/%d' % song_id)

        # Open the decoded file data as a stream
        if encoded:
            data = base64.b64decode(file_data.split(',')[1])
            f = BytesIO(data)
        else:
            f = file_data

        # Store the file on the FTP server
        resp = ftp.storbinary("STOR " + filename, f)

        f.close()
        ftp.close()
        return "songs/%d/%s" % (song_id, filename)

    def delete(self, song_id, filename):
        ftp = self._login()

        try:
            ftp.cwd('songs/%d' % song_id)
            ftp.delete(filename)
        except Exception:
            return

        return True
