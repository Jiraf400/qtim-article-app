# Qtim Article App

NestJS REST API application that provides CRUD operations with articles.

## Tech

* NestJS
* Postgres
* TypeORM
* Redis
* Docker

## Some API examples

### Get articles by date

```bash
GET http://localhost:3000/articles/by-date/18-01-2024 
```

Response:

```json
{
  "status": "OK",
  "page": 0,
  "limit": 10,
  "body": [
    {
      "id": 1,
      "name": "Article Name Test 1",
      "description": "Test Valid Article Description",
      "publishedAt": "2024-01-18T19:36:25.853Z",
      "authorId": 1
    },
    {
      "id": 2,
      "name": "Article Name Test 2",
      "description": "Test Valid Article Description",
      "publishedAt": "2024-01-18T19:38:38.712Z",
      "authorId": 1
    },
    {
      "id": 3,
      "name": "Article Name Test 3",
      "description": "Test Valid Article Description",
      "publishedAt": "2024-01-18T19:38:41.910Z",
      "authorId": 1
    },
    {
      "id": 4,
      "name": "bobabababa",
      "description": "Test Valid Article Description",
      "publishedAt": "2024-01-18T19:39:07.170Z",
      "authorId": 2
    }
  ]
}
```

### Get articles by author id

```bash
GET http://localhost:3000/articles/by-author/2 
```

Response:

```json
{
  "status": "OK",
  "page": 0,
  "limit": 10,
  "body": [
    {
      "id": 4,
      "name": "bobabababa",
      "description": "Test Valid Article Description",
      "publishedAt": "2024-01-18T19:39:07.170Z",
      "authorId": 2
    }
  ]
}
```

### Login

```bash
POST http:/localhost:3000/auth/login
```

Request Body:

```json 
{
  "email": "baboons@mail.com",
  "password": "baboon1234"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJhYm9vbnNAbWFpbC5jb20iLCJzdWIiOjQsImlhdCI6MTcwNTc2MDUwMiwiZXhwIjoxNzA2MzY1MzAyfQ.-QOLDG-DeL66CmujDSmNfLkNCzXkhOEsZXAIugMWXJs"
}
```

### Create new article

```bash
POST http://localhost:3000/articles/
```

Request Body:

```json 
{
  "name": "Article Name Test",
  "description": "Test Valid Article Description"
}
```

Authorization header value:

```bash 
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJhYm9vbnNAbWFpbC5jb20iLCJzdWIiOjQsImlhdCI6MTcwNTc2MDUwMiwiZXhwIjoxNzA2MzY1MzAyfQ.-QOLDG-DeL66CmujDSmNfLkNCzXkhOEsZXAIugMWXJs
```

Response:

```json
{
  "status": "OK",
  "message": "Successfully add new article",
  "body": {
    "id": 30,
    "name": "Article Name Test",
    "description": "Test Valid Article Description",
    "publishedAt": "2024-01-20T14:23:24.527Z",
    "authorId": 4
  }
}
```

## Quickstart

Clone this repository

```sh
git clone https://github.com/Jiraf400/qtim-article-app
```

> [WARNING]  
> You need to provide your own database connection url and jwt secret key in .env file

Install dependencies and run docker containers

```sh
npm i
docker-compose up -d
```

