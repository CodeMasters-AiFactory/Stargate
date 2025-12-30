$body = @{
    businessName = "Thunder Fitness Gym"
    description = "Thunder Fitness Gym is a dedicated small business specializing in fitness and personal training."
    industryId = "fitness"
    businessType = "small"
    generateImages = $true
} | ConvertTo-Json -Depth 4

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/merlin8/generate-sync" -Method Post -ContentType "application/json" -Body $body
$response | ConvertTo-Json -Depth 4
