package main

import (
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func main() {
	s := server.NewMCPServer("vin-car-mcp", "1.0.0", server.WithToolCapabilities(true))

	tool := mcp.NewTool("audit_vehicle_safety", mcp.WithDescription("Audits a US vehicle VIN for specs and active vehicle recalls"),mcp.WithString(("vin",mcp.Required(),mcp.Description("The VIN of the vehicle to audit"))))
	s.AddTool(tool,func(ctx context.Context, req mcp.CallToolRequest))
}
