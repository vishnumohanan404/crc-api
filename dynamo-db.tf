
# create the table 
resource "aws_dynamodb_table" "crc_table" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "crc_view_count_table"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "N"
  }

  tags = {
    Name = "crc-private-dynamodb-table"
  }
}

# add item to the table
resource "aws_dynamodb_table_item" "count" {
  table_name = aws_dynamodb_table.crc_table.name
  hash_key   = aws_dynamodb_table.crc_table.hash_key

  item = <<ITEM
{
  "id": { "N" : "1" },
  "count": { "N" : "1" }
}
ITEM
}
