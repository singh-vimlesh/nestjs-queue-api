# NestJS Queue API

This project is a NestJS API designed to handle message publishing and subscribing using a queue system. It supports multiple queue implementations (e.g., SQS, RabbitMQ) based on environment configurations.

## Table of Contents

- [NestJS Queue API](#nestjs-queue-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Running the Application](#running-the-application)
    - [Testing the API](#testing-the-api)
  - [Environment Variables](#environment-variables)
  - [Development](#development)
    - [Testing](#testing)
  - [Production](#production)
  - [Docker](#docker)
  - [License](#license)

## Features

- Publish and subscribe to messages using a queue system.
- Support for different queue implementations (e.g., SQS, RabbitMQ).
- Configuration management with environment variables.
- Built with NestJS for scalable and maintainable code.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/singh-vimlesh/nestjs-queue-api.git
   cd nestjs-queue-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example` template to set up your environment variables.

## Usage

### Running the Application

First create and start docker for queue services like SQS and RabbitMQ by running the following command.

```bash
npm run docker:up:infra
```

You can run the application in development mode with hot-reloading:

```bash
npm run start:dev
```

To run the application in production mode, first build the application:

```bash
npm run build
```

Then start the production server:

```bash
npm run start:prod
```

### Testing the API

You can test the API endpoints using tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/). Ensure the server is running and make requests to the appropriate endpoints.

## Environment Variables

The application uses the following environment variables:

- `PORT`: The port on which the API will run (default: `3000`).
- `QUEUE_PROVIDERS`: The type of queue implementation to use (e.g., `SQS`, `RabbitMQ` or `SQS,RabbitMQ`).
- `RABBITMQ_URL`: The URL for the RabbitMQ server (default: `amqp://user:password@localhost:5672`) (if using RabbitMQ).
- `SQS_URL`: The URL for the SQS queue (default: `http://localhost:4566/000000000000/my-queue`) (if using SQS).
- `SQS_QUEUE_NAME`: The QUEUE NAME for the SQS queue (default: `my-queue`) (if using SQS).
- `SQS_ENDPOINT`: Endpoint for SQS (default: `http://localhost:4566`).
- `AWS_REGION`: AWS region (default: `us-east-1`).
- `AWS_ACCESS_KEY_ID`: AWS access key ID (default: `test`).
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key (default: `test`).

You can define these variables in a `.env` file in the root of your project.
See `.env.example`.

## Development

First, make sure  docker container is created and running for queue services like SQS and RabbitMQ.
Use following command to create and run docker container.

```bash
npm run docker:up:infra
```

Onces docker container is up and running you can use the `npm run start:dev` command for development (live reloading) . The application is built using TypeScript, and the source code can be found in the `src` directory.

### Testing

To run tests, use the following command:

```bash
npm run test
```

## Production

For production deployments, it is recommended to build the application using:

```bash
npm run build
```

Then, run the production server:

```bash
npm run start:prod
```

## Docker

This application can be run using Docker. Follow these steps to build and run the Docker containers:

1. Build the Docker image:

   ```bash
   npm run docker:build
   ```

2. Run the development container:

   ```bash
   npm run docker:up:dev
   ```

3. Run the production container:

   ```bash
   npm run docker:up:prod
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
