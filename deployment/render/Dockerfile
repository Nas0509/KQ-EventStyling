FROM php:8.4-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev libsqlite3-dev libpq-dev \
    && docker-php-ext-install fileinfo mbstring pdo_sqlite pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY app/ ./app/
COPY bin/ ./bin/
COPY database/ ./database/
COPY public/ ./public/
COPY deployment/render/start.sh ./deployment/render/start.sh
RUN chmod 755 ./deployment/render/start.sh

ENV KQ_PRIVATE_DIR=/tmp/kqstyling
EXPOSE 10000
CMD ["bash", "deployment/render/start.sh"]
