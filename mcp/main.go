package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type NHTSAResponse struct {
	Count   int    `json:"Count"`
	Message string `json:"Message"`
	Results []struct {
		VIN                 string `json:"VIN"`
		Make                string `json:"Make"`
		Model               string `json:"Model"`
		ModelYear           string `json:"ModelYear"`
		Trim                string `json:"Trim"`
		Series              string `json:"Series"`
		BodyClass           string `json:"BodyClass"`
		VehicleType         string `json:"VehicleType"`
		DriveType           string `json:"DriveType"`
		TransmissionStyle   string `json:"TransmissionStyle"`
		EngineCylinders     string `json:"EngineCylinders"`
		DisplacementL       string `json:"DisplacementL"`
		EngineConfiguration string `json:"EngineConfiguration"`
		FuelTypePrimary     string `json:"FuelTypePrimary"`
		EngineHP            string `json:"EngineHP"`
		Manufacturer        string `json:"Manufacturer"`
		PlantCountry        string `json:"PlantCountry"`
		ErrorCode           string `json:"ErrorCode"`
	} `json:"Results"`
}

type VehicleSpecs struct {
	VIN          string      `json:"vin"`
	Year         int         `json:"year"`
	Make         string      `json:"make"`
	Model        string      `json:"model"`
	Trim         string      `json:"trim"`
	Series       string      `json:"series"`
	BodyClass    string      `json:"body_class"`
	VehicleType  string      `json:"vehicle_type"`
	DriveType    string      `json:"drive_type"`
	Transmission string      `json:"transmission"`
	Engine       EngineSpecs `json:"engine"`
	Manufacturer string      `json:"manufacturer"`
	PlantCountry string      `json:"plant_country"`
}

type EngineSpecs struct {
	Cylinders     string `json:"cylinders"`
	DisplacementL string `json:"displacement_l"`
	Configuration string `json:"configuration"`
	FuelType      string `json:"fuel_type"`
	Horsepower    string `json:"horsepower"`
}

func vinHandler(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	vinNumber, err := req.RequireString("vin")
	if err != nil {
		return mcp.NewToolResultError(err.Error()), nil
	}
	// Use DecodeVinValues for better flat structure
	decodeURL := fmt.Sprintf("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/%s?format=json", vinNumber)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(decodeURL)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to fetch VIN data: %v", err)), nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return mcp.NewToolResultError(fmt.Sprintf("API returned status %d", resp.StatusCode)), nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to read response body: %v", err)), nil
	}

	var nhtsaResp NHTSAResponse
	if err := json.Unmarshal(body, &nhtsaResp); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to parse API response: %v", err)), nil
	}

	if len(nhtsaResp.Results) == 0 {
		return mcp.NewToolResultError("no results found for this VIN"), nil
	}

	raw := nhtsaResp.Results[0]
	year, _ := strconv.Atoi(raw.ModelYear)

	specs := VehicleSpecs{
		VIN:          raw.VIN,
		Year:         year,
		Make:         raw.Make,
		Model:        raw.Model,
		Trim:         raw.Trim,
		Series:       raw.Series,
		BodyClass:    raw.BodyClass,
		VehicleType:  raw.VehicleType,
		DriveType:    raw.DriveType,
		Transmission: raw.TransmissionStyle,
		Engine: EngineSpecs{
			Cylinders:     raw.EngineCylinders,
			DisplacementL: raw.DisplacementL,
			Configuration: raw.EngineConfiguration,
			FuelType:      raw.FuelTypePrimary,
			Horsepower:    raw.EngineHP,
		},
		Manufacturer: raw.Manufacturer,
		PlantCountry: raw.PlantCountry,
	}

	structuredJSON, _ := json.MarshalIndent(specs, "", "  ")
	return mcp.NewToolResultText(string(structuredJSON)), nil
}

func main() {
	s := server.NewMCPServer("vin-car-mcp", "1.0.0", server.WithToolCapabilities(true))

	tool := mcp.NewTool("audit_vehicle_safety", mcp.WithDescription("Audits a US vehicle VIN for specs and active vehicle recalls"), mcp.WithString("vin", mcp.Required(), mcp.Description("The VIN of the vehicle to audit")))
	s.AddTool(tool, vinHandler)

	log.Println("Starting SSE server on :9876")
	sseServer := server.NewSSEServer(s,
		server.WithBaseURL("http://localhost:9876"),
	)

	if err := sseServer.Start(":9876"); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
