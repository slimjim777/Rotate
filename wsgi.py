#!/usr/bin/env python
import os
import sys


# virtenv = os.path.join(os.environ.get('OPENSHIFT_PYTHON_DIR', '.'), 'virtenv', 'venv')
# virtualenv = os.path.join(virtenv, 'bin/activate')
#
# exec_namespace = dict(__file__=virtualenv)
# with open(virtualenv, 'rb') as exec_file:
#     file_contents = exec_file.read()
# compiled_code = compile(file_contents, virtualenv, 'exec')
# exec(compiled_code, exec_namespace)

IP = os.environ.get('OPENSHIFT_PYTHON_IP', 'localhost')
PORT = int(os.environ.get('OPENSHIFT_PYTHON_PORT', 8080))

from schedule import app as application


if __name__ == '__main__':
    application.run(IP, PORT)
