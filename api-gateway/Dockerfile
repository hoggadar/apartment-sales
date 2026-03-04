FROM python:3.12.12-slim-trixie

# устанавливаем рабочую директорию
WORKDIR /app

# обновляем пакеты и pip
RUN apt update && \
    pip install --upgrade pip

# копируем только зависимости
COPY pyproject.toml poetry.lock ./

# установка и конфигурациия poetry
RUN python -m pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

# RUN rm -rf .cache/pypoetry/cache .cache/pypoetry/artifacts

# копируем оставшийся код
COPY . .

# добавляем src в путь модулей Python
ENV PYTHONPATH=/app/src

# запускаем приложение
CMD ["python3", "-m", "api_gateway.main"]