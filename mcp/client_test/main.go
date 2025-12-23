package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/mark3labs/mcp-go/client"
	"github.com/mark3labs/mcp-go/mcp"
)

func main() {
	// 1. Create the SSE client
	c, err := client.NewSSEMCPClient("http://localhost:9876/sse")
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	defer c.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 2. Start the transport
	log.Println("Starting transport...")
	if err := c.Start(ctx); err != nil {
		log.Fatalf("Failed to start transport: %v", err)
	}

	// 3. Initialize the client
	log.Println("Initializing client...")
	initReq := mcp.InitializeRequest{
		Params: mcp.InitializeParams{
			ProtocolVersion: "2024-11-05",
			ClientInfo: mcp.Implementation{
				Name:    "test-client",
				Version: "1.0.0",
			},
		},
	}
	if _, err := c.Initialize(ctx, initReq); err != nil {
		log.Fatalf("Failed to initialize: %v", err)
	}

	// 3. List tools
	log.Println("Listing tools...")
	tools, err := c.ListTools(ctx, mcp.ListToolsRequest{})
	if err != nil {
		log.Fatalf("Failed to list tools: %v", err)
	}
	for _, t := range tools.Tools {
		log.Printf("- Tool found: %s (%s)", t.Name, t.Description)
	}

	// 4. Call the VIN audit tool
	vin := "5UXWX7C50BA" // Example BMW VIN
	log.Printf("Calling audit_vehicle_safety for VIN: %s", vin)

	result, err := c.CallTool(ctx, mcp.CallToolRequest{
		Params: mcp.CallToolParams{
			Name: "audit_vehicle_safety",
			Arguments: map[string]interface{}{
				"vin": vin,
			},
		},
	})
	if err != nil {
		log.Fatalf("Tool call failed: %v", err)
	}

	// 5. Print the structured result
	fmt.Println("\n--- Tool Result ---")
	for _, content := range result.Content {
		if textContent, ok := mcp.AsTextContent(content); ok {
			fmt.Println(textContent.Text)
		} else {
			data, _ := json.MarshalIndent(content, "", "  ")
			fmt.Println(string(data))
		}
	}
}
