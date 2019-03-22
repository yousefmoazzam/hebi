FROM dannixon/savu:latest

ADD requirements.txt \
    /requirements.txt
RUN /miniconda/bin/pip install -r /requirements.txt && \
    rm /requirements.txt

ADD . /webservice
ADD ./config/dev.json /hebi_config.json

# Expose API port
EXPOSE 5000

# Run server
CMD ["/webservice/run.sh"]
