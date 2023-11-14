FROM python:3.10
WORKDIR /github/workspace
COPY scripts/render.py .
COPY scripts/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ENTRYPOINT ["python", "./render.py"]
