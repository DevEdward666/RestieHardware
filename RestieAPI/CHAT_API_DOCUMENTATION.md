# Inventory Chat API for n8n OpenAI Integration

## Overview
This API is optimized for OpenAI Chat Model integration via n8n workflows. It provides lightweight, fast responses for customer product queries.

## Endpoint
```
GET /api/inventory/chatQuery
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `intent` | string | Yes | - | Operation type: `search`, `cheapest`, `price`, `exists`, `brands`, `list` |
| `q` | string | No | "" | Search query (product name or description) |
| `code` | string | No | "" | Product code (exact match) |
| `category` | string | No | "" | Filter by category |
| `brand` | string | No | "" | Filter by brand |
| `sort` | string | No | "asc" | Sort order: `asc` or `desc` (by price) |
| `limit` | int | No | 10 | Max results (1-25) |
| `offset` | int | No | 0 | Pagination offset |

---

## Use Cases & Examples

### 1. **Search for Products**
**Customer Query:** *"Do you have Royu pipes?"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=search&q=royu&category=pipes&limit=5
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "search",
  "query": "?intent=search&q=royu&category=pipes&limit=5",
  "data": {
    "items": [
      {
        "code": "000171",
        "item": "Royu PVC Pipe 1/2 inch",
        "category": "Pipes",
        "brand": "Royu",
        "price": 45.50,
        "qty": 150
      }
    ]
  }
}
```

---

### 2. **Find Cheapest Product**
**Customer Query:** *"Give me the cheapest cement"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=cheapest&q=cement&sort=asc
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "cheapest",
  "query": "?intent=cheapest&q=cement",
  "data": {
    "currency": "PHP",
    "item": {
      "code": "000426",
      "item": "Eagle Cement 40kg",
      "category": "Cement",
      "brand": "Eagle",
      "price": 285.00,
      "qty": 200
    }
  }
}
```

---

### 3. **Check Product Availability**
**Customer Query:** *"Do you have this product in stock?"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=exists&code=000171
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "exists",
  "query": "?intent=exists&code=000171",
  "data": {
    "exists": true,
    "matches": [
      {
        "code": "000171",
        "item": "Royu PVC Pipe 1/2 inch",
        "category": "Pipes",
        "brand": "Royu",
        "price": 45.50,
        "qty": 150
      }
    ]
  }
}
```

---

### 4. **Get Product Price**
**Customer Query:** *"How much is cement?"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=price&q=cement
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "price",
  "query": "?intent=price&q=cement",
  "data": {
    "currency": "PHP",
    "found": true,
    "item": {
      "code": "000426",
      "item": "Eagle Cement 40kg",
      "category": "Cement",
      "brand": "Eagle",
      "price": 285.00,
      "qty": 200
    },
    "matches": [
      {
        "code": "000426",
        "item": "Eagle Cement 40kg",
        "brand": "Eagle",
        "price": 285.00,
        "qty": 200
      }
    ]
  }
}
```

---

### 5. **List Available Brands**
**Customer Query:** *"What cement brands do you have?"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=brands&category=cement
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "brands",
  "query": "?intent=brands&category=cement",
  "data": {
    "category": "cement",
    "brands": ["Eagle", "Holcim", "Republic", "Apo"]
  }
}
```

---

### 6. **List Products with Pagination**
**Customer Query:** *"Show me all hardware items"*

**API Request:**
```
GET /api/inventory/chatQuery?intent=list&category=hardware&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "intent": "search",
  "query": "?intent=list&category=hardware&limit=10&offset=0",
  "data": {
    "items": [
      {
        "code": "001171",
        "item": "Hammer Heavy Duty",
        "category": "Hardware",
        "brand": "Stanley",
        "price": 450.00,
        "qty": 25
      }
    ]
  }
}
```

---

## n8n Workflow Integration

### Example Workflow Steps:

1. **HTTP Request Node** → Call OpenAI API with customer question
2. **Function Node** → Extract intent and parameters from AI response
3. **HTTP Request Node** → Call this API with extracted parameters
4. **Function Node** → Format response for customer
5. **Response Node** → Send formatted answer back to customer

### Sample n8n Function Node (Intent Extraction):
```javascript
// Parse OpenAI response to extract intent and parameters
const aiResponse = items[0].json.choices[0].message.content;
const params = {
  intent: 'search',
  q: '',
  category: '',
  brand: '',
  limit: 5
};

// Simple keyword matching (enhance with AI)
if (aiResponse.toLowerCase().includes('cheapest')) {
  params.intent = 'cheapest';
}
if (aiResponse.toLowerCase().includes('price')) {
  params.intent = 'price';
}
if (aiResponse.toLowerCase().includes('brands')) {
  params.intent = 'brands';
}

return [{ json: params }];
```

---

## Performance Optimizations

✅ **Lightweight Response Model** - No base64 image encoding  
✅ **SQL Query Optimization** - Indexed searches on code, item, category, brand  
✅ **Result Limiting** - Max 25 items per request (default 10)  
✅ **Fast JSON Serialization** - Simple DTOs without nested objects  
✅ **Connection Pooling** - Efficient database connections  

---

## Error Responses

### Missing Required Parameter:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "intent parameter is required",
  "intent": null,
  "query": "?q=cement"
}
```

### Invalid Intent:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid intent. Use: search, cheapest, price, exists, brands, list",
  "intent": "invalid_intent",
  "query": "?intent=invalid_intent&q=cement"
}
```

---

## Database Schema Reference

### Inventory Table:
- `code` - Product code (VARCHAR, PRIMARY KEY)
- `item` - Product name (VARCHAR)
- `category` - Product category (VARCHAR)
- `brand` - Brand name (VARCHAR, nullable)
- `price` - Selling price (FLOAT)
- `qty` - Quantity on hand (BIGINT)
- `cost` - Cost price (FLOAT)
- `status` - Product status (VARCHAR)
- `image` - Image path (VARCHAR)

---

## Future Enhancements

- [ ] Add natural language processing for better intent detection
- [ ] Support for multi-language queries
- [ ] Add caching layer (Redis) for frequently asked queries
- [ ] Implement rate limiting per API key
- [ ] Add analytics tracking for popular queries

---

**Last Updated:** December 18, 2025  
**API Version:** 1.0  
**Contact:** RestieHardware Development Team

