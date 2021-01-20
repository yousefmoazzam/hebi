import sys

from . import server
from . import utils
from . import validation

utils.populate_plugins()

server.app.config.from_json(sys.argv[1])
server.validate_config()
server.setup_runners()

server.socketio.run(server.app, port=5000)
server.teardown_runners()
