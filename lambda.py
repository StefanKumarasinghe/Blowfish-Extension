import json
import hashlib
from datetime import datetime
from urllib.parse import urlparse
import boto3
from boto3.dynamodb.conditions import Key, Attr
import re

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Blowfish")
tags_table = dynamodb.Table("BlowfishTags")

PREDEFINED_TAGS = {
    'security': [
        'malware', 'phishing', 'scam', 'virus', 'trojan', 'ransomware', 
        'suspicious', 'fraud', 'identity-theft', 'fake-antivirus',
        'cryptocurrency-scam', 'fake-download', 'unsafe-links'
    ],
    'privacy': [
        'data-collection', 'tracking', 'cookies', 'fingerprinting', 
        'personal-info', 'no-privacy-policy', 'excessive-permissions',
        'location-tracking', 'microphone-access', 'camera-access'
    ],
    'advertising': [
        'pop-ups', 'auto-play-video', 'misleading-ads', 'excessive-ads',
        'click-bait', 'fake-news', 'sponsored-content', 'redirect-ads',
        'adult-content', 'gambling-ads'
    ],
    'technical': [
        'slow-loading', 'broken-links', 'mobile-unfriendly', 'accessibility-issues',
        'outdated-ssl', 'mixed-content', 'javascript-errors', 'poor-performance',
        'compatibility-issues', 'requires-plugin'
    ],
    'other': [
        'spam', 'inappropriate-content', 'offensive-language', 'violence',
        'hate-speech', 'misinformation', 'copyright-violation', 'illegal-content',
        'age-inappropriate', 'disturbing-content'
    ]
}

def get_url_hash(url):
    return hashlib.sha256(url.encode()).hexdigest()

def get_domain(url):
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        return netloc
    except:
        return url

def calculate_confidence_level(total_votes):
    if total_votes >= 100:
        return "Very High"
    elif total_votes >= 50:
        return "High"
    elif total_votes >= 20:
        return "Medium"
    elif total_votes >= 10:
        return "Low"
    return "Very Low"

def validate_tag_name(tag_name, category):
    if not tag_name or not isinstance(tag_name, str):
        return False
    
    tag_name = tag_name.strip().lower()
    
    if category not in PREDEFINED_TAGS:
        return False
    
    return tag_name in PREDEFINED_TAGS[category]

def validate_category(category):
    valid_categories = ['security', 'privacy', 'advertising', 'technical', 'other']
    return category in valid_categories

def validate_vote_type(vote_type):
    return vote_type in ['up', 'down']

def get_request_info(event):
    method = None
    path = "/"
    headers = {}
    query_params = {}
    body = "{}"
    
    if "requestContext" in event and "http" in event["requestContext"]:
        method = event["requestContext"]["http"]["method"]
        path = event.get("rawPath", "/")
        headers = event.get("headers", {})
        query_params = event.get("queryStringParameters") or {}
        body = event.get("body", "{}")
    else:
        method = event.get("httpMethod", "GET")
        path = event.get("path", "/")
        headers = event.get("headers", {})
        query_params = event.get("queryStringParameters") or {}
        body = event.get("body", "{}")
    
    return method, path, headers, query_params, body

def handle_feedback_submission(event, context):
    _, _, headers, _, body_str = get_request_info(event)
    safe_count = 0
    unsafe_count = 0
    
    try:
        body = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Invalid JSON in request body"})
        }
    
    client_ip = (
        headers.get("x-forwarded-for") or 
        headers.get("X-Forwarded-For") or 
        "unknown"
    ).split(",")[0].strip()
    
    url = body.get("url")
    is_safe = body.get("is_safe", False)
    user_agent = body.get("user_agent", "")

    if not url:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Missing 'url' in request body"})
        }

    domain = get_domain(url)
    url_hash = get_url_hash(domain)

    try:
        existing = table.query(
            KeyConditionExpression=Key("url_hash").eq(url_hash),
            FilterExpression=Attr("ip_address").eq(client_ip)
        )

        if existing.get("Items"):
            return {
                "statusCode": 409,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"success": False, "message": "You have already submitted feedback for this website"})
            }
        
        # if safe is true, then get the current safe count
        if is_safe:
            safe_count = table.query(
                KeyConditionExpression=Key("url_hash").eq(url_hash),
                FilterExpression=Attr("safe_count").exists()
            )
            safe_count = len(safe_count.get("Items", []))
            safe_count += 1
        # if safe is false, then get the current unsafe count
        if not is_safe:
            unsafe_count = table.query(
                KeyConditionExpression=Key("url_hash").eq(url_hash),
                FilterExpression=Attr("unsafe_count").exists()
            )
            unsafe_count = len(unsafe_count.get("Items", []))
            unsafe_count += 1

        table.put_item(Item={
            "url_hash": url_hash,
            "domain": domain,
            "full_url": domain,
            "safe_count": safe_count,
            "unsafe_count": unsafe_count,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": True, "message": "Feedback submitted successfully"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": f"Database error: {str(e)}"})
        }

def handle_stats_request(event, context):
    _, _, _, query_params, _ = get_request_info(event)
    
    url = query_params.get("url")
    domain = query_params.get("domain")

    if not url and not domain:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing 'url' or 'domain' query parameter"})
        }

    try:
        if url:
            domain = get_domain(url)
            url_hash = get_url_hash(domain)
            items = table.query(
                KeyConditionExpression=Key("url_hash").eq(url_hash)
            ).get("Items", [])
        else:
            domain = domain.lower()
            if domain.startswith('www.'):
                domain = domain[4:]
            items = table.scan(
                FilterExpression=Attr("domain").eq(domain)
            ).get("Items", [])

        if items:
            item = items[0]
            safe = int(item.get("safe_count", 0))
            unsafe = int(item.get("unsafe_count", 0))
        else:
            safe = unsafe = 0

        total = safe + unsafe

        if total == 0:
            percentage = 0
        else:
            percentage = (safe / total * 100)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "total_votes": total,
                "safe_votes": safe,
                "unsafe_votes": unsafe,
                "safety_percentage": round(percentage, 1),
                "confidence_level": calculate_confidence_level(total)
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Database error: {str(e)}"})
        }

def handle_tags_get_request(event, context):
    _, path, _, query_params, _ = get_request_info(event)
    
    path_parts = path.strip('/').split('/')
    if len(path_parts) < 4 or path_parts[0] != 'v1' or path_parts[1] != 'tags' or path_parts[2] != 'website':
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid path format. Expected: /v1/tags/website/{hostname}"})
        }
    
    hostname = path_parts[3]
    
    if not hostname:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing hostname parameter"})
        }
    
    hostname = hostname.lower()
    if hostname.startswith('www.'):
        hostname = hostname[4:]
    
    try:
        response = tags_table.query(
            KeyConditionExpression=Key("hostname").eq(hostname)
        )
        
        items = response.get("Items", [])
        
        if not items:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "No tags found for this website"})
            }
        
        tags_by_category = {
            'security': [],
            'privacy': [],
            'advertising': [],
            'technical': [],
            'other': []
        }
        
        for item in items:
            category = item.get('category', 'other')
            tag_name = item.get('tag_name', '')
            votes_up = item.get('votes_up', 0)
            votes_down = item.get('votes_down', 0)
            verified = item.get('verified', False)
            
            if category in tags_by_category:
                tags_by_category[category].append({
                    'name': tag_name,
                    'votes': {
                        'up': votes_up,
                        'down': votes_down,
                        'total': votes_up + votes_down
                    },
                    'verified': verified
                })
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "hostname": hostname,
                "tags": tags_by_category,
                "timestamp": datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Database error: {str(e)}"})
        }

def handle_tags_submit_request(event, context):
    _, _, headers, _, body_str = get_request_info(event)
    
    try:
        body = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Invalid JSON in request body"})
        }
    
    client_ip = (
        headers.get("x-forwarded-for") or 
        headers.get("X-Forwarded-For") or 
        "unknown"
    ).split(",")[0].strip()
    
    hostname = body.get("hostname", "").strip().lower()
    category = body.get("category", "").strip().lower()
    tag_name = body.get("tag", "").strip().lower()
    user_hash = body.get("user_hash", "")
    vote_type = body.get("vote_type", "up").strip().lower()
    
    if not hostname:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Missing hostname"})
        }
    
    if not validate_category(category):
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Invalid category. Must be one of: security, privacy, advertising, technical, other"})
        }
    
    if not validate_tag_name(tag_name, category):
        available_tags = ", ".join(PREDEFINED_TAGS.get(category, []))
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "success": False, 
                "message": f"Invalid tag name. Must be one of the predefined tags for {category}: {available_tags}"
            })
        }
    
    if not validate_vote_type(vote_type):
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Invalid vote type. Must be 'up' or 'down'"})
        }
    
    if not user_hash:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": "Missing user hash"})
        }
    
    if hostname.startswith('www.'):
        hostname = hostname[4:]
    
    tag_id = f"{hostname}#{category}#{tag_name}"
    
    try:
        existing_response = tags_table.get_item(
            Key={
                "hostname": hostname,
                "tag_id": tag_id
            }
        )
        
        current_time = datetime.utcnow().isoformat()
        
        if existing_response.get("Item"):
            existing_item = existing_response["Item"]
            
            user_hashes = existing_item.get("user_hashes", [])
            ip_addresses = existing_item.get("ip_addresses", [])
            
            if user_hash in user_hashes or client_ip in ip_addresses:
                return {
                    "statusCode": 409,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({"success": False, "message": "You have already voted for this tag"})
                }
            
            user_hashes.append(user_hash)
            ip_addresses.append(client_ip)
            
            votes_up = existing_item.get("votes_up", 0)
            votes_down = existing_item.get("votes_down", 0)
            
            if vote_type == "up":
                votes_up += 1
            else:
                votes_down += 1
            
            tags_table.update_item(
                Key={
                    "hostname": hostname,
                    "tag_id": tag_id
                },
                UpdateExpression="SET votes_up = :votes_up, votes_down = :votes_down, user_hashes = :user_hashes, ip_addresses = :ip_addresses, last_updated = :last_updated",
                ExpressionAttributeValues={
                    ":votes_up": votes_up,
                    ":votes_down": votes_down,
                    ":user_hashes": user_hashes,
                    ":ip_addresses": ip_addresses,
                    ":last_updated": current_time
                }
            )
            
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "success": True,
                    "message": f"Vote ({vote_type}) added successfully",
                    "tag": {
                        "hostname": hostname,
                        "category": category,
                        "name": tag_name,
                        "votes_up": votes_up,
                        "votes_down": votes_down,
                        "total_votes": votes_up + votes_down
                    }
                })
            }
            
        else:
            initial_votes_up = 1 if vote_type == "up" else 0
            initial_votes_down = 1 if vote_type == "down" else 0
            
            tags_table.put_item(Item={
                "hostname": hostname,
                "tag_id": tag_id,
                "category": category,
                "tag_name": tag_name,
                "votes_up": initial_votes_up,
                "votes_down": initial_votes_down,
                "verified": False,
                "user_hashes": [user_hash],
                "ip_addresses": [client_ip],
                "created_at": current_time,
                "last_updated": current_time
            })
            
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "success": True,
                    "message": f"Tag created with {vote_type} vote",
                    "tag": {
                        "hostname": hostname,
                        "category": category,
                        "name": tag_name,
                        "votes_up": initial_votes_up,
                        "votes_down": initial_votes_down,
                        "total_votes": initial_votes_up + initial_votes_down
                    }
                })
            }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "message": f"Database error: {str(e)}"})
        }

def handle_available_tags_request(event, context):
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "available_tags": PREDEFINED_TAGS,
            "timestamp": datetime.utcnow().isoformat()
        })
    }

def lambda_handler(event, context):
    try:
        method, path, _, _, _ = get_request_info(event)
        
        if method == "POST" and path == "/feedback":
            return handle_feedback_submission(event, context)
        elif method == "GET" and path == "/stats":
            return handle_stats_request(event, context)
        else:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "Not found",
                    "debug": {
                        "method": method,
                        "path": path,
                        "available_routes": [
                            "POST /feedback",
                            "GET /stats",
                        ]
                    }
                })
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Internal server error: {str(e)}"})
        }