![Hand me Down logo](readme.png)

# Hand me Down

A website to exchange items and help the ones in need!

## Prerequisites

- [ ] php 8.2+
- [ ] Symfony 7.2
- [ ] MySQL or PostgreSQL
- [ ] Node.js

## Architechture

![Project architecture](Architechture.png)

## Install

Clone repository:

``` bash
git clone git@github.com:hshaptala/hand-me-down.git
```

Go to the project folder:

``` bash
cd hand-me-down
```

## Backend

### Set up

Go to `backend` folder:

``` bash
cd backend
```

Install dependencies:

``` bash
composer install
```

### Database

#### Using Mysql

Add the link to your database in the `.env.local` file. Example:

``` bash
DATABASE_URL="mysql://app:!ChangeMe!@127.0.0.1:3306/app?serverVersion=8.0.32&charset=utf8mb4"
```

Create database:

``` bash
symfony console doctrine:schema:update --force
```

#### Using Postgresql

Add the link to your database in the `.env` file. Example:

``` bash
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
```

Create migration:

``` bash
symfony console make:migration
```

In `migrations/<yourmigration>.php`, remove anything not related to the entities in `src/Entity/`.

Migrate database:

``` bash
symfony console doctrine:migrations:migrate
```

### Run

- Start server:

``` bash
symfony serve
```

- Open website:

``` bash
http://127.0.0.1:8000/api/doc
```

### Data

- You can load the default dataset to test the functionalities.

``` bash
symfony console doctrine:fixtures:load
```

## Frontend

Go to `frontend` folder:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Run development server:

``` bash
npm run dev
```
