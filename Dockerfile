# Container image that runs your code
FROM python:3.10

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY scripts/render.py /render.py
COPY scripts/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["python", "render.py"]