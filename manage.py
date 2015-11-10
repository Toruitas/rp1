__author__ = 'Stuart'

from flask.ext.script import Manager, Shell
from flask.ext.migrate import Migrate, MigrateCommand
import os

from rp1 import app, db
# from config import configs
#
# config_name = os.getenv('FLASK_CONFIG') or 'default'
# app.config.from_object(configs[config_name])

migrate = Migrate(app, db)
manager = Manager(app)

def make_shell_context():
    return dict(app=app, db=db)
manager.add_command("shell", Shell(make_context=make_shell_context))
manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()
