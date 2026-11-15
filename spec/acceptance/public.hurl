# Public progress: open without a token, numbers only — no private note content.

GET {{base}}/public/progress
HTTP 200
[Asserts]
jsonpath "$.cards_total" isInteger
jsonpath "$.cards_learned" isInteger
jsonpath "$.cards_learned" >= 0
jsonpath "$.reviews_total" isInteger
jsonpath "$.streak" isInteger
jsonpath "$.notes" not exists
jsonpath "$.title" not exists
