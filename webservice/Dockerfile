FROM dannixon/savu:latest

RUN /miniconda/bin/pip install \
  flask \
  flask_api \
  flask_cors \
  flask-socketio \
  fuzzywuzzy \
  json_tricks \
  voluptuous

ADD . /webservice

# Expose API port
EXPOSE 5000

# Run server
CMD ["/webservice/run.sh"]
