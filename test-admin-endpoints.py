#!/usr/bin/env python3
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8080"

def make_request(url, method="GET", data=None, headers=None):
    """Make HTTP request using urllib"""
    if headers is None:
        headers = {}
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, body
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8')
        return status, body
    except urllib.error.URLError as e:
        raise Exception(f"Connection error: {e}")
    except Exception as e:
        raise Exception(f"Request error: {e}")

print("=" * 70)
print("ADMIN API ENDPOINT TESTING")
print("=" * 70)

# STEP 1: LOGIN
print("\n[STEP 1] LOGIN TO GET TOKEN")
print("-" * 70)

login_payload = {
    "usernameOrEmail": "admin",
    "password": "password"
}

try:
    headers = {"Content-Type": "application/json"}
    status, body = make_request(
        f"{BASE_URL}/api/auth/login",
        method="POST",
        data=login_payload,
        headers=headers
    )
    
    print(f"HTTP Status: {status}")
    
    login_data = json.loads(body)
    print(f"Response:")
    print(json.dumps(login_data, indent=2))
    
    if "data" in login_data and "accessToken" in login_data.get("data", {}):
        token = login_data["data"]["accessToken"]
        print(f"\n✓ Token obtained successfully")
    else:
        print("\n✗ ERROR: Could not extract token!")
        sys.exit(1)
except Exception as e:
    print(f"✗ ERROR: {e}")
    sys.exit(1)

# STEP 2: TEST ENDPOINTS
print("\n\n[STEP 2] TEST ADMIN ENDPOINTS")
print("=" * 70)

endpoints = [
    ("GET /api/admin/reports/dashboard", "/api/admin/reports/dashboard"),
    ("GET /api/admin/reports/daily-volume", "/api/admin/reports/daily-volume"),
    ("GET /api/admin/employees", "/api/admin/employees"),
    ("GET /api/admin/customers", "/api/admin/customers")
]

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

for endpoint_name, endpoint_path in endpoints:
    print(f"\n{endpoint_name}")
    print("-" * 70)
    
    try:
        status, body = make_request(
            f"{BASE_URL}{endpoint_path}",
            method="GET",
            headers=headers
        )
        
        print(f"HTTP Status Code: {status}")
        
        try:
            data = json.loads(body)
            print(f"Success: {data.get('success', 'N/A')}")
            print(f"Full Response:")
            print(json.dumps(data, indent=2))
            
            if "data" in data:
                if isinstance(data["data"], list):
                    print(f"\n→ ANALYSIS: Array with {len(data['data'])} items")
                    if len(data['data']) == 0:
                        print("  ⚠ WARNING: Empty array returned!")
                    else:
                        print(f"  ✓ Data contains {len(data['data'])} items")
                        if len(data['data']) > 0:
                            print(f"  First item keys: {list(data['data'][0].keys())}")
                elif isinstance(data["data"], dict):
                    print(f"\n→ ANALYSIS: Object response")
                    print(f"  Keys: {list(data['data'].keys())}")
                    print(f"  Values: {data['data']}")
        except json.JSONDecodeError:
            print(f"Response Text: {body[:500]}")
            print("⚠ Could not parse JSON response")
            
    except Exception as e:
        print(f"✗ Error: {e}")

print("\n" + "=" * 70)
print("TESTING COMPLETE")
print("=" * 70)

print("\n" + "=" * 70)
print("TESTING COMPLETE")
print("=" * 70)
