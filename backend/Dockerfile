FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist

FROM dunglas/frankenphp

RUN install-php-extensions \
    pdo_pgsql \
    intl \
    zip \
    opcache

ENV SERVER_NAME=:80
ENV APP_RUNTIME=Runtime\\FrankenPhpSymfony\\Runtime
ENV FRANKENPHP_CONFIG="worker ./public/index.php"

COPY . /app/
COPY --from=composer /app/vendor /app/vendor

RUN setcap -r /usr/local/bin/frankenphp
