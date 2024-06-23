# assume role creation
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "lambda_execution_role" {
  name               = "crc-lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# IAM policy for dynamodb executions and cloudwatch logs
data "aws_iam_policy_document" "lambda_role_policy" {
  statement {
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
    effect    = "Allow"
  }
  statement {
    actions   = ["dynamodb:BatchGetItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan", "dynamodb:BatchWriteItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.crc_table.arn]
    effect    = "Allow"
  }
}

resource "aws_iam_policy" "iam_policy_for_lambda" {
  name        = "aws_iam_policy_for_lambda_role"
  description = "AWS IAM Policy for managing aws lambda role"
  policy      = data.aws_iam_policy_document.lambda_role_policy.json
}

# attaching the created policy to the lambda role
resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.iam_policy_for_lambda.arn
}

# create zip folder for update-visitors lambda func
data "archive_file" "lambda_update" {
  type        = "zip"
  source_file = "update-visitors.mjs"
  output_path = "update-visitors.zip"
}

# create update count lambda func
resource "aws_lambda_function" "update_count_lambda" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  filename         = "update-visitors.zip"
  function_name    = "update-visitors"
  role             = aws_iam_role.lambda_execution_role.arn
  source_code_hash = data.archive_file.lambda_update.output_base64sha256
  runtime          = "nodejs20.x"
  handler          = "update-visitors.updateVisitorsHandler"
  depends_on       = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
}

#resource based policy for lambda - for giving apigateway access to invoke the lambda
resource "aws_lambda_permission" "apigw_invoke_update" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_count_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visit_api.execution_arn}/*/*"
}

# mock integration for preflight request
# create zip folder for update-visitors-preflight lambda func
data "archive_file" "lambda_update_mock" {
  type        = "zip"
  source_file = "update-visitors-preflight-mock.mjs"
  output_path = "update-visitors-mock.zip"
}

# create update count preflight lambda func
resource "aws_lambda_function" "update_count_lambda_mock" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  filename         = "update-visitors-mock.zip"
  function_name    = "update-visitors-preflight-mock"
  role             = aws_iam_role.lambda_execution_role.arn
  source_code_hash = data.archive_file.lambda_update_mock.output_base64sha256
  runtime          = "nodejs20.x"
  handler          = "update-visitors-preflight-mock.handler"
  depends_on       = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
}

#resource based policy for lambda - for giving apigateway access to invoke the lambda
resource "aws_lambda_permission" "apigw_invoke_update_mock" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_count_lambda_mock.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visit_api.execution_arn}/*/*"
}
