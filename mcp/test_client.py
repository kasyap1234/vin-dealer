import requests
import json
import sseclient # pip install sseclient-py

def test_mcp_server():
    server_url = "http://localhost:8080/sse"
    print(f"Connecting to {server_url}...")
    
    # 1. Connect to SSE to get the message endpoint
    response = requests.get(server_url, stream=True)
    client = sseclient.SSEClient(response)
    
    endpoint = None
    for event in client.events():
        if event.event == "endpoint":
            endpoint = event.data
            print(f"Server endpoint received: {endpoint}")
            break
    
    if not endpoint:
        print("Failed to get endpoint from server")
        return

    # 2. Initialize
    init_req = {
        "jsonrpc": "2.0",
        "id": "1",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0.0"}
        }
    }
    
    full_endpoint = f"http://localhost:8080{endpoint}"
    print(f"Sending initialization to {full_endpoint}...")
    requests.post(full_endpoint, json=init_req)

    # 3. Call the tool
    call_req = {
        "jsonrpc": "2.0",
        "id": "2",
        "method": "tools/call",
        "params": {
            "name": "audit_vehicle_safety",
            "arguments": {
                "vin": "5UXWX7C50BA" # Example VIN (BMW)
            }
        }
    }
    
    print("Calling 'audit_vehicle_safety'...")
    res = requests.post(full_endpoint, json=call_req)
    
    print("\n--- Tool Result ---")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    try:
        test_mcp_server()
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure the Go server is running with 'go run main.go'")
