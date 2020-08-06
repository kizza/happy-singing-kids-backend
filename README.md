# Serverless Hello World

- Configure `.env` correctly (see aws for fixed arns)
- Configure `.aws/credeitnais` correctly
- `npx sls dynamodb install`
- `yarn` then `yarn start`

## Local dev

- Dynamodb `sls dynamodb install`, `sls dynamodb remove`, `sls dynamodb start`

In an effort to understand these technologies better - this is a simple serverless "hello world" app, complete with localstack, webpack and typescript.

- Test the processPayment function (that reads sqs)
  `bin/test-sqs`
