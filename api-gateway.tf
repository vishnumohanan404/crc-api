# create apivateway for visit-count
resource "aws_apigatewayv2_api" "visit_api" {
  name          = "visitors"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://www.vishnuverse.xyz", "http://localhost:5173/"]
    allow_methods = ["PUT", "GET", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age = 300
  }
}

# API Gateway
resource "aws_apigatewayv2_stage" "my_api_stage" {
  name        = "prod"
  api_id      = aws_apigatewayv2_api.visit_api.id
  auto_deploy = true

  # Additional configurations for the stage
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}


resource "aws_apigatewayv2_integration" "lambda_get_handler" {
  api_id = aws_apigatewayv2_api.visit_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_count_lambda.invoke_arn
}

resource "aws_apigatewayv2_integration" "lambda_update_handler" {
  api_id = aws_apigatewayv2_api.visit_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.update_count_lambda.invoke_arn
}



resource "aws_apigatewayv2_route" "get_handler" {
  api_id    = aws_apigatewayv2_api.visit_api.id
  route_key = "GET /visitors"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_get_handler.id}"
}

resource "aws_apigatewayv2_route" "update_handler" {
  api_id    = aws_apigatewayv2_api.visit_api.id
  route_key = "PUT /visitors"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_update_handler.id}"
}

# cloudwatch for the API Gateway
resource "aws_cloudwatch_log_group" "api_gw_logs" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.visit_api.id}/logs"
  retention_in_days = 14
}

# output
output "api_url" {
  value       = aws_apigatewayv2_stage.my_api_stage.invoke_url
  description = "URL of the deployed API Gateway stage"
}
