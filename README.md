
# Hand me Down
A website to exchange items and help the ones in need!

## Prerequisites
- [ ] php 8.1+
- [ ] Symfony 7.1+
- [ ] Mysql or Postgresql database
- [ ] **?Frontend?**

## Install

- Clone project
```
git clone git@github.com:hshaptala/hand-me-down.git
```

- Move to project
```
cd hand-me-down
```

## Backend
### Set up
- Go to folder
```
cd backend
```

- Resolve dependencies
```
composer install
```
### Database
#### Using Mysql
- Add the link to your database in the `.env` file. Example:
```
DATABASE_URL="mysql://app:!ChangeMe!@127.0.0.1:3306/app?serverVersion=8.0.32&charset=utf8mb4"
```

- Create database
```
symfony console doctrine:schema:update --force
```

#### Using Postgresql
- Add the link to your database in the `.env` file. Example:
```
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
```

- Create migration
```
symfony console make:migration
```
- In `migrations/<yourmigration>.php`, remove anything not related to the entities in `src/Entity/`.
- Migrate database
```
symfony console doctrine:migrations:migrate
```

### Run
- Start server
```
symfony serve
```

- Open website
```
http://127.0.0.1:8000/api/doc
```

### Data
- You can load the default dataset to test the functionalities.
```
symfony console doctrine:fixtures:load
```

## Frontend